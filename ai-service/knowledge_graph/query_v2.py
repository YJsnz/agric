"""Evidence-preserving, directed graph retrieval. This is not an SCM or an LLM."""
from collections import deque
from datetime import date

REGIONS = {'泊头市':['泊头市','沧州市','河北省','全国'], '沧州市':['沧州市','河北省','全国'],
           '河北省':['河北省','全国'], '全国':['全国'], 'US-CA':['US-CA']}
CAUSAL = {'PROMOTES','INCREASES_RISK','REDUCES_RISK','INHIBITS','CAUSES'}
RELATIONS = {'PRODUCED_IN','HAS_DISEASE','HAS_PEST','HAS_DISORDER','HAS_PATHOGEN','HAS_SYMPTOM',
             'REQUIRES','RECOMMENDS','HAS_PARAMETER','INTERVENTION_FOR','ASSOCIATED_WITH',
             'LOCATED_IN','OCCURS_AT_STAGE','CONTROLLED_BY','AFFECTS','HAS_PROCESS'} | CAUSAL

def validate(graph):
    nodes={n['id']:n for n in graph['nodes']}; sources={s['id']:s for s in graph['sources']}
    import json
    from pathlib import Path
    allowed=set(json.loads((Path(__file__).parent/'ontology-v2.json').read_text(encoding='utf-8'))['domain_types'])
    for n in nodes.values():
        if n['type'] not in allowed: raise ValueError('unknown node type')
        if not all(k in n for k in ['description','crop','region','source_ids','source_count']): raise ValueError('missing node context')
        if n['source_count'] != len(set(n['source_ids'])) or any(s not in sources for s in n['source_ids']): raise ValueError('invalid node evidence')
    if len(nodes)!=len(graph['nodes']) or len(sources)!=len(graph['sources']): raise ValueError('duplicate identifier')
    seen=set()
    for e in graph['edges']:
        if e['id'] in seen: raise ValueError('duplicate edge')
        seen.add(e['id'])
        if e['source'] not in nodes or e['target'] not in nodes: raise ValueError('dangling endpoint')
        if e['relation'] not in RELATIONS: raise ValueError('unknown relation')
        if not e['evidence_ids'] or any(s not in sources or sources[s]['status']!='read' for s in e['evidence_ids']): raise ValueError('unread evidence')
        if not e['locator'] or not e['conditions']: raise ValueError('missing evidence context')
        if e['crop'] not in nodes or nodes[e['crop']]['type'] not in {'Crop','Variety'}: raise ValueError('invalid crop')
        if any(s not in nodes or nodes[s]['type'] not in {'Stage','GrowthStage'} for s in e['stage_ids']): raise ValueError('invalid stage')
        if e['confidence'] is not None or e['effect_size'] is not None: raise ValueError('uncalibrated number')
        if e['relation']=='CAUSES': raise ValueError('V2 contains no identified causal effects')
        if e['region'].startswith(('US','AU')) and e['review_status']!='transfer_pending': raise ValueError('unreviewed local transfer')
        for key in ['valid_from','valid_to']:
            if e.get(key): date.fromisoformat(e[key])
        signatures={
            'PRODUCED_IN':({'Crop'},{'Region'}), 'HAS_DISEASE':({'Crop'},{'Disease'}),
            'HAS_PEST':({'Crop'},{'Pest'}), 'HAS_DISORDER':({'Crop'},{'PhysiologicalDisorder'}),
            'HAS_PATHOGEN':({'Disease'},{'Pathogen'}),
            'HAS_SYMPTOM':({'Disease','Pest','PhysiologicalDisorder'},{'Symptom'}),
            'LOCATED_IN':({'Crop','Variety'},{'Region'}),
            'REQUIRES':({'Intervention','AgriculturalPractice','HarvestProcess','PreventionMeasure'},
                        {'Requirement','StorageCondition','QualityIndicator','EnvironmentFactor','AgriculturalPractice','HarvestProcess','PreventionMeasure'})}
        if e['relation'] in signatures:
            domain,range_=signatures[e['relation']]
            if nodes[e['source']]['type'] not in domain or nodes[e['target']]['type'] not in range_: raise ValueError('invalid relation signature')
    adjacency={}
    for e in graph['edges']:
        if e['relation'] in CAUSAL: adjacency.setdefault(e['source'],[]).append(e['target'])
    active,done=set(),set()
    def visit(identifier):
        if identifier in active: raise ValueError('causal cycle')
        if identifier in done:return
        active.add(identifier)
        for target in adjacency.get(identifier,[]):visit(target)
        active.remove(identifier);done.add(identifier)
    for identifier in nodes:visit(identifier)
    return {'nodes':len(nodes),'edges':len(seen),'sources':len(sources)}

def select_edges(graph, filters):
    by_id={n['id']:n for n in graph['nodes']}
    region=filters.get('region',''); crop=filters.get('crop',''); stage=filters.get('stage','')
    as_of=filters.get('as_of') or date.today().isoformat()
    date.fromisoformat(as_of)
    if region and region not in REGIONS: raise ValueError('不支持的地区')
    if crop and crop not in {n['name'] for n in graph['nodes'] if n['type'] in {'Crop','Variety'}}:
        raise ValueError('当前证据库不支持该作物或品种')
    result=[]
    for e in graph['edges']:
        if filters.get('kind') not in (None,'','all',e['kind']): continue
        scope=filters.get('scope','all')
        if scope not in ('','all') and e['scope']!=scope: continue
        if scope=='local' and e['review_status'] not in ('source_checked','local_expert_reviewed'): continue
        if e.get('valid_from') and e['valid_from']>as_of or e.get('valid_to') and e['valid_to']<as_of: continue
        if region and e['region'] not in REGIONS[region]: continue
        edge_crop=by_id[e['crop']]['name']
        # Explicit cultivar hierarchy only; no inference from similar names.
        compatible={'泊头鸭梨':{'泊头鸭梨','鸭梨','梨'},'鸭梨':{'鸭梨','梨'}}.get(crop,{crop,'梨'})
        if crop and edge_crop not in compatible: continue
        if stage and stage not in [by_id[s]['name'] for s in e['stage_ids']]: continue
        if filters.get('mode')=='causal' and e['relation'] not in CAUSAL: continue
        result.append(e)
    return result

def paths(graph, start, end, filters, max_hops=5):
    nodes={n['id']:n for n in graph['nodes']}
    if start not in nodes or end not in nodes: raise ValueError('请选择有效的起点和终点')
    if start==end: return []
    adjacency={}
    for e in select_edges(graph,filters): adjacency.setdefault(e['source'],[]).append(e)
    queue=deque([(start,[],{start})]); found=[]; visited_count=0
    while queue and len(found)<5 and visited_count<10000:
        current,path,visited=queue.popleft(); visited_count+=1
        if len(path)>=max_hops: continue
        for e in adjacency.get(current,[]):
            target=e['target']
            if target in visited: continue
            candidate=path+[e]
            if target==end: found.append(candidate)
            else: queue.append((target,candidate,visited|{target}))
    return found

def ask(graph, question, filters):
    if not question or len(question)>500: raise ValueError('问题长度应为 1～500 字')
    matched=[n for n in graph['nodes'] if any(name and name in question for name in [n['name'],*n.get('aliases',[])])]
    matched.sort(key=lambda n:len(n['name']),reverse=True)
    ids={n['id'] for n in matched[:8]}
    eligible=select_edges(graph,filters)
    # Resolve occurrence states through explicit, scoped HAS_PROCESS assertions.
    ids.update(e['target'] for e in eligible if e['source'] in ids and e['relation']=='HAS_PROCESS')
    evidence=[e for e in eligible if e['source'] in ids or e['target'] in ids][:40]
    routes=[]
    for a in matched[:4]:
        for b in matched[:4]:
            if a!=b: routes.extend(paths(graph,a['id'],b['id'],filters))
    source_ids={s for e in evidence for s in e['evidence_ids']}
    return {'question':question,'matched_nodes':matched[:8],'edges':evidence,'paths':routes[:5],
        'sources':[s for s in graph['sources'] if s['id'] in source_ids],
        'explanation':'以下是符合条件的原文知识及有向路径；路径连接不等于已识别的因果效应。' if evidence else '当前证据库没有匹配知识。请调整实体名称或补充资料，系统不会生成无出处结论。',
        'method':'受约束的图谱检索；尚未接入向量检索、重排模型或大模型生成',
        'quantitative_counterfactual_available':False}
