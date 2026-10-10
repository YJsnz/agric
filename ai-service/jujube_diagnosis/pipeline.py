"""Orchestration only: existing vision -> reviewed mapping -> existing jujube.ask."""
import json
import logging
import os
import socket
from urllib.parse import urlparse
from . import config, leaf_service, bruise_service, freshness_service

CONTEXT_FIELDS=('temperature','humidity','storage_temperature','storage_humidity','storage_days','harvest_method','transport_condition','notes')
BACKEND=os.getenv('JUJUBE_DIAGNOSIS_KG_BACKEND','file')
MAPPING=config.AGRIC/'ai-service/data/cangzhou_jinsixiaozao/knowledge_graph/jujube_visual_entity_mapping.json'

def query_for(visual,context):
    label=visual['class']
    if visual['task']=='leaf':
        if label=='yellow_leaf': question='当前检测到黄化视觉表现，现有证据是否支持病因研判？'
        elif label=='anthracnose': question='检测到炭疽病类叶片视觉表现，应区分哪些候选方向、核对哪些伴随症状？'
        else: question=f"当前检测到叶片{visual['label_zh']}，现有证据支持哪些候选风险？"
    elif visual['task']=='fruit_bruise' and label=='bruised':
        question='当前检测到碰伤/机械损伤类视觉表现，现有证据支持哪些采后风险？证据强度如何？'
    elif label=='rotten':
        question='果实检测为 rotten 腐败/变质类视觉表现，现有采后证据支持哪些核验方向和适用条件？'
    else:question=f"当前检测到{visual['label_zh']}，现有证据支持哪些采后风险？外观不能代替品质结论。"
    supplied={k:v for k,v in context.items() if v is not None}
    # Include structured observations in retrieval, while preserving full raw values for generation.
    labels={'temperature':'温度','humidity':'湿度','storage_temperature':'储藏温度','storage_humidity':'储藏湿度',
            'storage_days':'储藏天数','harvest_method':'采收方式','transport_condition':'运输条件'}
    observations='；'.join(labels[k]+'='+str(v)[:30] for k,v in supplied.items() if k in labels)
    if observations:question+=' 用户提供的条件：'+observations[:250]
    return question,supplied

def constrained_fallback(result):
    evidence=result.get('evidence',[])
    citations=[{**e,'citation_role':'retrieved_excerpt_not_validated_generated_claim'} for e in evidence if e.get('source_id') and e.get('original_text')]
    answer='当前仅能提供视觉线索；综合研判服务暂不可用，尚不能据此确定原因。'
    if citations:
        e=citations[0]
        answer='综合研判暂不可用。以下仅展示已检索原文，不作现场结论：\n'+e['original_text']+' ['+e['evidence_id']+']'
    return answer,citations

class DiagnosisPipeline:
    def __init__(self, registry):
        self.registry=registry
        self.last_llm_status='not_checked'

    def diagnose(self,image,task,context):
        from jujube import service,runtime
        services={'leaf':leaf_service,'fruit_bruise':bruise_service,'fruit_freshness':freshness_service}
        raw=services[task].analyze(self.registry,image)
        visual={**raw['prediction'],'model_name':raw['model_name'],'model_version':raw['model_version'],'task':task,'is_diagnosis':False}
        score=visual['confidence'];grade='high' if score>=.8 else 'medium' if score>=.6 else 'low'
        visual['confidence_level']=grade
        context={k:context.get(k) for k in CONTEXT_FIELDS}
        limitations=[config.DISCLAIMER,'视觉展示级别不是风险等级；risk.level 未评分。']
        result={'status':'insufficient_evidence','answer':'','entities':[],'paths':[],'evidence':[],'citations':[], 'generation_called':False}
        mapped=None;degraded=False;mode=None
        try:
            mappings=json.loads(MAPPING.read_text(encoding='utf-8'))
            match=next(m for m in mappings if m['visual_key']==task+':'+visual['class'])
            if match['node_type'] not in ('VisualSymptom','FruitCondition') or match['is_diagnosis']:
                raise ValueError('Unsafe mapping')
            mapped={'id':match['node_id'],'name':match['name'],'type':match['node_type'],'is_diagnosis':False}
        except Exception:
            degraded=True;mode='visual_mapping_unavailable'
        if mapped:
            try:
                graph=runtime.load_graph(backend=BACKEND)
                if not any(n['id']==mapped['id'] and n['type']==mapped['type'] for n in graph['nodes']):
                    raise ValueError('Mapped entity absent from KG')
            except Exception:
                degraded=True;mode='kg_unavailable'
            if not degraded:
                query,supplied=query_for(visual,context)
                try:
                    result=service.ask(query,graph_backend=BACKEND,diagnosis_context={
                        'user_context':supplied,'visual_entity':mapped,'visual_class':visual['class'],'visual_task':task,
                        'visual_evidence_only':True,'visual_confidence_level':grade})
                except Exception:
                    logging.exception('Jujube GraphRAG unavailable')
                    degraded=True;mode='graphrag_unavailable'
                if result.get('generation_error') or result.get('validation_error') or result.get('status')=='validation_failed':
                    degraded=True;mode='llm_unavailable' if result.get('generation_error') else 'grounding_unavailable_or_failed'
                    self.last_llm_status='unavailable' if result.get('generation_error') else 'validation_failed'
                elif result.get('generation_called'):
                    self.last_llm_status='available'
        if degraded:
            result['answer'],result['citations']=constrained_fallback(result)
            result['status']='insufficient_evidence'
            result['grounding']={'passed':None,'method':'verbatim_retrieval_fallback_no_generated_claims','upstream':result.get('grounding')}
        if result['status'] not in ('supported','preliminary','insufficient_evidence'):
            result['status']='insufficient_evidence'
        if task=='leaf' and visual['class']=='yellow_leaf':
            result['status']='insufficient_evidence'
            if not result.get('differential_assessment',{}).get('available') and not result.get('answer'):
                result['answer']='尚无可核验的病因资料，请补充叶片正反面、整枝和发生过程。'
        if task=='fruit_bruise' and visual['class']=='bruised':
            if result['status']=='supported':result['status']='preliminary'
            limitations.append('碰伤视觉分类不能证明腐败已发生；采后处理建议须核实鲜枣形态与现场条件。')
            result['answer']+='\n'+limitations[-1]
        if task=='fruit_freshness':
            result['answer']+='\n本结果仅为果实外观视觉证据，不能据此判断食品安全、是否可食用、病原或腐败原因。'
        if task=='leaf' and grade=='low':
            result['answer']='视觉证据较弱，应结合环境、症状和知识证据进一步判断。\n'+result['answer']
        return {'success':True,'crop':'jujube','task':task,'visual':visual,'visual_confidence_level':grade,
                'mapped_entity':mapped,'context':context,'reasoning':result,
                'risk':{'stage':'production' if task=='leaf' else 'postharvest','type':raw['risk_semantics']['type'],'level':None},
                'limitations':limitations,'degraded':degraded,'degraded_mode':mode}

    def health(self):
        base=self.registry.health()
        from jujube.runtime import load_graph
        from jujube.build import ROOT
        from graphrag.entity_extractor import settings
        try:
            g=load_graph(backend=BACKEND)
            kg={'status':'available','backend':'local_review_graph' if BACKEND=='file' else 'neo4j','nodes':len(g['nodes']),'edges':len(g['edges'])}
        except Exception:kg={'status':'unavailable','backend':BACKEND}
        endpoint=urlparse(os.getenv('NEO4J_HTTP_URL','http://127.0.0.1:7474'))
        try:
            with socket.create_connection((endpoint.hostname,endpoint.port or 7474),timeout=.2):pass
            neo4j='reachable_not_authenticated'
        except OSError:neo4j='unavailable'
        return {**base,'vision_models':base['models'],'kg':{**kg,'neo4j':neo4j},
                'graphrag':{'status':'available' if kg['status']=='available' and (ROOT/'vector/reviewed.faiss').exists() else 'unavailable'},
                'llm':{'configured':bool(settings()['DEEPSEEK_API_KEY']),'status':self.last_llm_status}}
