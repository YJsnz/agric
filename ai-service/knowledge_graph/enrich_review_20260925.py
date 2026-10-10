"""Reviewed additions; experimental findings are not local agronomic prescriptions."""
import json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'data/botou_yali/evidence/review_20260925'

def enrich(graph):
    sources=[
        ('paper_yali_2024','Rapid Cooling Delays the Occurring of Core Browning in Postharvest ‘Yali’ Pear at Advanced Maturity by Inhibiting Ethylene Metabolism','https://pmc.ncbi.nlm.nih.gov/articles/PMC11011782/','10.3390/foods13071072',2024,'yali2024.html','已读取本地开放全文；方法2.1、结果3.1/3.2和结论5重点核对'),
        ('paper_yali_2025','Mechanism of Core Browning in Different Maturity Stages of ‘Yali’ Pears During Slow-Cooling Storage and PbRAV-Mediated Regulation','https://pmc.ncbi.nlm.nih.gov/articles/PMC12191683/','10.3390/foods14122132',2025,'','浏览器读取全文，方法2.1与结果3.1重点核对；本地下载为验证页，不计全文')]
    for sid,title,url,doi,year,file,review in sources:
        item=dict(id=sid,source_id=sid,title=title,name=title,type='Source',url=url,doi=doi,year=year,source_type='paper',region='河北省辛集市',crop='鸭梨',scope='试验产地辛集；非泊头本地验证',evidence_level='B',status='read',review_method=review,description=review,publication_group=doi,reviewed_at='2026-09-25',published_at='',dataset=graph['dataset'],source_count=1,file=('review_20260925/'+file if file else ''))
        if not any(s['id']==sid for s in graph['sources']):graph['sources'].append(item)
    def node(name,typ):
        found=next((n for n in graph['nodes'] if n['name']==name),None)
        if found:return found['id']
        nid='review25:'+hashlib.sha256(name.encode()).hexdigest()[:16]
        graph['nodes'].append(dict(id=nid,name=name,type=typ,aliases=[],dataset=graph['dataset'],description='条件限定的论文知识；请查看关系中的试验条件。',crop=[],region=[],source_ids=[],source_count=0))
        return nid
    crop=node('鸭梨','Variety');stage=node('储藏期','Stage')
    rows=[
      ('高成熟度鸭梨快速降温试验','Intervention','ASSOCIATED_WITH','果心褐变指数较低','QualityIndicator','paper_yali_2024','3.2；5','本试验快速降温组的果心褐变指数低于缓冷组。'),
      ('高成熟度鸭梨快速降温试验','Intervention','ASSOCIATED_WITH','乙烯释放较低','QualityIndicator','paper_yali_2024','5','快速降温组乙烯释放较低。'),
      ('高成熟度鸭梨快速降温试验','Intervention','ASSOCIATED_WITH','呼吸强度较低','QualityIndicator','paper_yali_2024','5','快速降温组呼吸强度较低。'),
      ('高成熟度鸭梨快速降温试验','Intervention','ASSOCIATED_WITH','果实硬度保持较好','QualityIndicator','paper_yali_2024','5','快速降温组硬度保持较好。'),
      ('鸭梨果心褐变进程','PhysiologicalDisorder','HAS_SYMPTOM','心室开始褐变','Symptom','paper_yali_2024','3.1；Figure 1','观察到褐变从心室开始。'),
      ('鸭梨果心褐变进程','PhysiologicalDisorder','HAS_SYMPTOM','褐变向果肉扩展','Symptom','paper_yali_2024','3.1；Figure 1','后续可向果肉扩展。'),
      ('中期采收鸭梨缓冷试验','Intervention','ASSOCIATED_WITH','果心褐变指数较低','QualityIndicator','paper_yali_2025','2.1；3.1；Figure 1','缓冷条件下，中期采收组在贮藏末期的褐变指数低于早采和晚采组。'),
      ('中期采收鸭梨缓冷试验','Intervention','ASSOCIATED_WITH','果实硬度保持较好','QualityIndicator','paper_yali_2025','3.1；Figure 1D','缓冷条件下，中期采收组贮藏末期硬度保持较好。')]
    additions=[]
    for i,(a,at,rel,b,bt,sid,loc,claim) in enumerate(rows,1):
        conditions=['研究样品来自河北辛集，不是泊头田间或冷库验证；仅供研究参考，不直接转为生产操作指令。']
        if sid.endswith('2024'):conditions+=['高成熟度鸭梨；快速组0℃预冷24小时后0±1℃储藏；对照12℃预冷24小时、30天降至0±1℃。']
        else:conditions+=['花后145/155/165天分组；12℃预冷24小时、每5天降2℃，30天降至0±0.5℃；湿度80%～85%；比较180～210天结果。','不能据此独立估计缓冷相对快冷的效应；未读取原始个体数据。']
        edge=dict(id=f'review25:e{i:03d}',source=node(a,at),target=node(b,bt),relation=rel,kind='association' if rel=='ASSOCIATED_WITH' else 'observation',evidence_ids=[sid],claim=claim,locator=loc,crop=crop,region='河北省',stage_ids=[stage],scope='general_pear',review_status='transfer_pending',evidence_level='B',confidence=None,effect_size=None,conditions=conditions,valid_from='',valid_to='',dataset=graph['dataset'])
        if not any(e['id']==edge['id'] for e in graph['edges']):graph['edges'].append(edge)
        additions.append(edge)
    byid={n['id']:n for n in graph['nodes']}
    for n in graph['nodes']:
        es=[e for e in graph['edges'] if n['id'] in [e['source'],e['target'],e['crop'],*e['stage_ids']]]
        n.update(source_ids=sorted({s for e in es for s in e['evidence_ids']}),crop=sorted({byid[e['crop']]['name'] for e in es}),region=sorted({e['region'] for e in es}))
        n['source_count']=len(n['source_ids'])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'reviewed_claims.jsonl').write_text('\n'.join(json.dumps(e,ensure_ascii=False) for e in additions)+'\n',encoding='utf-8')
    return graph

if __name__=='__main__':
    path=ROOT/'data/graph-v2.json';raw=path.read_bytes();OUT.mkdir(parents=True,exist_ok=True)
    backup=OUT/'graph-before.json'
    if not backup.exists():backup.write_bytes(raw)
    graph=enrich(json.loads(raw));from query_v2 import validate
    print(validate(graph));path.write_text(json.dumps(graph,ensure_ascii=False,indent=2),encoding='utf-8')
