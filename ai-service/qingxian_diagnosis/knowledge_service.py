"""Deterministic symptom and crop matching against real reviewed nodes."""
from .build import ROOT,DOMAIN
from graphrag.crop_runtime import CropStore

store=CropStore(ROOT,DOMAIN)
ORGAN={'leaf':'叶片','fruit':'果实','stem':'茎','root':'根'}

def symptom_match(name,text):
    if name in text:return True
    tokens=['多角形','水浸','灰黑色霉','白色菌脓','穿孔','白色粉','白粉','萎蔫','维管束','白色霉','脐部','干腐']
    return any(t in name and t in text for t in tokens)

class QingxianVegetableKnowledgeService:
    def __init__(self,graph=None):self.graph=graph if graph is not None else store.load_graph()
    def find_candidate_risks(self,observation,context):
        nodes={n['id']:n for n in self.graph['nodes']};crop=context.crop
        if crop not in ('黄瓜','番茄'):return {'matched_symptom_nodes':[],'candidate_risks':[],'warning':'需明确黄瓜或番茄，不根据栏目名猜作物。'}
        symptoms=[n for n in nodes.values() if n['type']=='Symptom' and crop in n['crop'] and symptom_match(n['name'],observation)]
        ids={n['id'] for n in symptoms};candidates=[]
        for e in self.graph['edges']:
            source=nodes[e['source']]
            if source['type'] not in ('Disease','Pest') or crop not in source['crop']:continue
            named=source['name'] in observation or any(a in observation for a in source.get('aliases',[]))
            if (e['relation']=='HAS_SYMPTOM' and e['target'] in ids) or (named and e['relation'] in ('HAS_SYMPTOM','AFFECTS_CROP')):
                candidates.append({**e,'candidate_id':source['id'],'candidate_name':source['name'],'candidate_type':source['type'],
                    'symptom_name':nodes[e['target']]['name'] if e['relation']=='HAS_SYMPTOM' else None,
                    'matched_by':'symptom' if e['target'] in ids else 'explicit_name'})
        return {'matched_symptom_nodes':symptoms,'candidate_risks':candidates,'diagnosis':None}

def rank_candidates(candidates,context,graph):
    nodes={n['id']:n for n in graph['nodes']};ranked=[]
    for c in candidates:
        score=3 if c['matched_by']=='symptom' else 1
        reasons=['原文症状节点匹配' if c['matched_by']=='symptom' else '用户明确提到的候选名称'];warnings=['规则分数不是疾病概率，候选不是确诊。']
        organs={nodes[e['target']]['name'] for e in graph['edges'] if e['source']==c['candidate_id'] and e['relation']=='AFFECTS_ORGAN'}
        if context.organ and organs:
            if ORGAN.get(context.organ,context.organ) in organs:score+=2;reasons.append('器官与原文危害部位一致')
            else:score-=3;warnings.append('原文危害器官与输入不一致，保留候选但降权')
        if context.growth_stage and c.get('growth_stage')==context.growth_stage:score+=1;reasons.append('阶段一致')
        if c['evidence_level']=='hebei_verified':score+=1;reasons.append('河北标准直接条款，仍需核对具体适用条件')
        if c['evidence_level']=='transfer_pending':score-=1;warnings.append('异地 transfer_pending 资料仅作症状比较，不能作为青县本地结论')
        if any(getattr(context,k) is not None for k in ('temperature','humidity','ec','ph')):warnings.append('未建立对应已审核环境阈值，不凭数值自动增加疾病风险分')
        ranked.append({**c,'ranking_score':score,'ranking_reasons':reasons,'ranking_warnings':warnings})
    return sorted(ranked,key=lambda c:(-c['ranking_score'],c['candidate_name'],c['id']))
