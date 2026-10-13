import json,re
from .context import QingxianContext
from .knowledge_service import store,QingxianVegetableKnowledgeService,rank_candidates
from .build import ROOT,DOMAIN
from graphrag.crop_runtime import grounded_answer

def context_from_question(question,context=None):
    ctx=QingxianContext(**(context.to_dict() if context else {}))
    present=[c for c in ('黄瓜','番茄') if c in question]
    if not present and '西红柿' in question:present=['番茄']
    if ctx.crop is None and len(present)==1:ctx.crop=present[0]
    if ctx.organ is None:
        organs=[v for words,v in [(['叶片','叶背','叶子'],'leaf'),(['果实','脐部'],'fruit'),(['茎部','茎蔓'],'stem')] if any(w in question for w in words)]
        if len(organs)==1:ctx.organ=organs[0]
    if ctx.scene is None and any(w in question for w in ['温室','棚内','大棚']):ctx.scene='facility'
    if ctx.growth_stage is None:
        for stage in ['缓苗期','缓苗后','苗期','开花结果期','定植期']:
            if stage in question:ctx.growth_stage=stage;break
    if ctx.season is None:
        for season in ['越冬长季节','早春茬','秋延后','秋冬茬','越冬茬']:
            if season in question:ctx.season=season;break
    # Only explicit numeric observations, never fill a default sensor reading.
    for field,pattern in [('temperature',r'温度\s*(\d+(?:\.\d+)?)\s*[℃度]'),('humidity',r'(?:空气)?湿度\s*(\d+(?:\.\d+)?)\s*[%％]')]:
        if field=='temperature' and '土壤温度' in question and '空气温度' not in question:continue
        if field=='humidity' and '土壤' in question and not any(x in question for x in ['空气湿度','棚内湿度']):continue
        match=re.search(pattern,question)
        if getattr(ctx,field) is None and match:setattr(ctx,field,float(match[1]))
    return ctx

def allowed(chunk,ctx,question):
    m=chunk['metadata']
    if m['domain']!=DOMAIN or m['review_status']!='verbatim_verified':return False
    if m['crop'] not in (None,ctx.crop):return False
    if m['scope']=='background':return False
    if m.get('season') and ctx.season and m['season']!=ctx.season:return False
    if m['evidence_level']=='transfer_pending':
        # Reviewed symptom/mechanism excerpts only, not foreign operational advice.
        if not (m['topic'].startswith('田间症状') or m['topic']=='棚室低温寡照风险'):return False
    if ctx.organ=='leaf' and '脐腐病' in m['topic']:return False
    if ctx.organ=='fruit' and any(x in m['topic'] for x in ['白粉病','枯萎病']):return False
    if any(w in question for w in ['滴灌','施肥','灌水']) and '症状' in m['topic']:return False
    return True

def run_qingxian_graphrag(vision_result=None,environment_context=None,ranked_candidates=None,question=None):
    ctx=environment_context or QingxianContext()
    observation=(vision_result or {}).get('symptom_cn') or (vision_result or {}).get('symptom') or ''
    query=question or f'作物：{ctx.crop or "未知"}；器官：{ctx.organ or "未知"}；视觉观测：{observation}。请解释候选风险及核验方向。'
    if not 1<=len(query.strip())<=500:raise ValueError('检索问题须为1～500字')
    ctx=context_from_question(query,ctx)
    base={'domain':DOMAIN,'crop':ctx.crop,'context':ctx.to_dict(),'observations':{'vision':vision_result,'environment':ctx.to_dict()},
        'retrieval_query':query,'recommendations':[],'disclaimer':'视觉置信度和规则排序不是疾病概率；候选研判不是确诊。'}
    if ctx.crop not in ('黄瓜','番茄'):
        return {**base,'status':'needs_clarification','generation_called':False,'answer':'请先说明是黄瓜还是番茄，并描述症状或管理问题。',
            'clarification_questions':['目前种植的是黄瓜还是番茄？'],'candidate_risks':[],'graph_evidence':[],'vector_evidence':[],'citations':[],'sources':[],'grounding':None}
    service=QingxianVegetableKnowledgeService();graph=service.graph
    kg=service.find_candidate_risks(query+' '+observation,ctx)
    ranked=rank_candidates(kg['candidate_risks'],ctx,graph) if ranked_candidates is None else ranked_candidates
    # Caller-provided candidates must resolve to this crop's real KG nodes.
    valid={n['id'] for n in graph['nodes'] if ctx.crop in n.get('crop',[])}
    ranked=[c for c in ranked if c.get('candidate_id') in valid]
    chunks=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'));byid={c['chunk_id']:c for c in chunks}
    match_ids={c['candidate_id'] for c in ranked};terms=[n['name'] for n in graph['nodes'] if n['type'] not in ('Crop','Region') and n['name'] in query]
    terms += [t for t in ('滴灌','清水','阴雪','通风','排湿','白粉','霜霉','角斑') if t in query]
    hits=[e for e in graph['edges'] if (not e['crop'] or ctx.crop in e['crop']) and allowed(byid[e['chunk_id']],ctx,query) and (e['source'] in match_ids or e['target'] in match_ids or any(t in e['subject']+e['object'] for t in terms))]
    vectors=store.search(query,lambda c:allowed(c,ctx,query),6)
    fused={c['chunk_id']:c for c in vectors}
    for e in hits:fused.setdefault(e['chunk_id'],byid[e['chunk_id']])
    # Keep symptom matches first; source authority must not replace relevance.
    matched_chunks={c['chunk_id'] for c in ranked}
    chosen=sorted(fused.values(),key=lambda c:(0 if c['chunk_id'] in matched_chunks else 1,-c.get('score',0)))[:8]
    evidence=[{'evidence_id':f'E{i}','kind':'document_chunk','source_id':c['doc_id'],'title':c['title'],'content':c['text'],'metadata':c['metadata']} for i,c in enumerate(chosen,1)]
    diagnosis_context={'vision':vision_result,'context':ctx.to_dict(),'matched_symptom_nodes':kg['matched_symptom_nodes'],'ranked_candidates':ranked}
    result=grounded_answer(query,{**ctx.to_dict(),'diagnosis_context':diagnosis_context},evidence,graph['sources'],
        '仅讨论当前明确作物。症状问题先指出检索原文支持的候选名称及相似点，不把缺乏本地确诊证据等同于没有候选。只比较当前作物原文提供的鉴别特征。通风排湿条款不能转写成某病的因果证明，此为内部约束，无需对用户复述。不同茬口温湿度范围不能混合使用。不引用未获得正文的标准条款。')
    return {**base,**result,'diagnosis_context':diagnosis_context,'knowledge_graph':kg,'candidate_risks':ranked,'candidate_ranking':ranked,
        'graph_evidence':hits,'vector_evidence':vectors,'evidence':evidence,
        'retrieval':{'graph_status':'ok','graph_evidence_count':len(hits),'vector_evidence_count':len(vectors),'fused_count':len(evidence)}}
