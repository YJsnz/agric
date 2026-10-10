"""Build a reviewed, page-addressable corpus. No claims from metadata or abstracts."""
import hashlib
import json
import re
from pathlib import Path
from .audit_sources import ROOT

CROP='huanghua_hanjianmai'
def compact(text): return re.sub(r'\s+','',text)
def save(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

# Reviewed passages: source, PDF page, printed section, region, stage, topic,
# scope, verbatim start/end anchors. Boundaries follow one agronomic topic.
PASSAGES=[
 ('W001',5,'1 范围','河北省滨海平原盐碱干旱生态类型区',None,'适用范围','production','本文件适用于','冬小麦生产。'),
 ('W001',5,'4 播前准备','河北省滨海平原盐碱干旱生态类型区','播前准备','整地','production','采用深翻+旋耕','NY/T499中的规定。'),
 ('W001',5,'5 品种选择','河北省滨海平原盐碱干旱生态类型区','播前准备','品种选择','production','选择国家或河北省品种审定委员会','GB4404.1规定。'),
 ('W001',6,'6 播种','河北省滨海平原盐碱干旱生态类型区','播种期','适期播种','production','最佳播期为','深浅一致。'),
 ('W001',6,'8 春季管理','河北省滨海平原盐碱干旱生态类型区','返青期','春季追肥','production','返青前进行麦田','利用追肥机追施。'),
 ('W001',6,'8 病虫害防治','河北省滨海平原盐碱干旱生态类型区','春季','病虫害','production','应主要防治锈病','NY/T2914-2016中5.3.1和5.3.7规定执行。'),
 ('W001',7,'10 收获','河北省滨海平原盐碱干旱生态类型区','收获期','及时收获','harvest','于蜡熟末期','及时收获。'),
 ('W002',5,'4 肥料使用','河北', '返青期','肥料优调','production','返青前顶凌追肥','肥料的使用应符合NY/T496的规定。'),
 ('W002',6,'5.2.1 农业防治','河北',None,'农业防治','production','通过选用抗旱耐盐抗病性好的','控制病虫草害。'),
 ('W002',6,'6 建立档案','河北',None,'生产档案','production','应详细记录','并保存2年以上。'),
 ('W003',5,'3 定义','河北','播种期','开沟接墒','production','为达到保播、避盐的目的','播种方式。'),
 ('W003',6,'5.3.3.1 墒情较好','河北','播种期','开沟接墒','production','5.3.3.1','覆土3cm。'),
 ('W003',6,'5.3.3.2 墒情较差','河北','播种期','开沟接墒','production','5.3.3.2','覆土2cm～3cm。'),
 ('W004',3,'3.1 定义及4 适用条件','沧州','播种期','探墒保播','production','利用拨土铲拨开干土层','厚度不超过10cm的地块。'),
 ('W004',4,'6.3 探墒播种','沧州','播种期','探墒保播','production','利用探墒播种机','肥料的使用应符合NY/T496的规定。'),
 ('W005',3,'1 范围','沧州',None,'晚播适用范围','production','本文件适用于','晚播旱碱麦生产。'),
 ('W005',3,'3.1 晚播','沧州','播种期','晚播','production','10月20日之后','播种为晚播。'),
 ('W005',4,'7.1 春季追肥','沧州','春季','晚播春促','production','在土壤返浆期','亩施纯N10kg～12kg。'),
 ('W005',4,'7.2 锄划','沧州','春季','晚播春促','production','冬前未出苗的麦田','出苗前及时浅锄轻划。'),
 ('W006',3,'1 范围','沧州',None,'宽幅沟播适用范围','production','本文件适用于','旱碱地冬小麦生产。'),
 ('W006',3,'4.1 品种选择','沧州','播前准备','品种选择','production','选用国家或省品种审定委员会','种子质量符合GB4404.1规定。'),
 ('W006',4,'5.1 播期与播量','沧州','播种期','宽幅沟播播期','production','适宜播期10月1日','最多不超过22.5kg。'),
 ('W006',4,'5.2 种植模式及5.3 墒情','沧州','播种期','宽幅沟播','production','采用宽幅沟播机播种','相对含水量70%～80%播种。'),
 ('W006',4,'6.1 顶凌追肥','沧州','返青期','顶凌追肥','production','春季小麦返青前','亩追施尿素12.5kg～15kg。'),
 ('W008',4,'2 研究建议','沧州',None,'旱盐风险','production','沧州市盐碱地干旱常态化情况下','调控技术研究。'),
 ('W008',4,'2.2 生育前期研发','沧州','播前准备','种子处理研发','production','在旱碱麦生育前期','提高苗期抗旱耐寒性。'),
 ('W008',4,'2.2 返青拔节研发','沧州','返青期至拔节期','壮秆抗逆研发','production','在旱碱麦返青—拔节期','提高叶片抗逆性。'),
 ('W008',4,'2.2 灌浆研发','沧州','灌浆期','干热风风险','production','在旱碱麦灌浆期','品质改善。'),
 ('W015',4,'4 表1 质量要求','黄骅', '采后','原粮指标','grain','表1质量要求','≥13.5'),
 ('W015',4,'5 卫生要求','黄骅','采后','原粮卫生','grain','5卫生要求','按GB2763执行。'),
 ('W016',3,'3.1 定义','黄骅','加工期','小麦粉','flour','以黄骅旱碱麦为原粮','小麦粉。'),
 ('W016',4,'4 表1 质量要求','黄骅','加工期','面粉指标','flour','表1质量要求','≥85'),
 ('W008',3,'1.2 耐盐生理','沧州',None,'盐胁迫机理','production','研究表明，盐碱胁迫显著抑制','种子无法正常吸水萌发[7]。'),
 ('W008',3,'1.1 生育期风险','沧州',None,'密植倒伏风险','production','盲目增加播种量','旱碱麦产量的提升。'),
 ('W011',10,'4.2 返青缺水窗口','黄骅/南皮','返青期','返青水分亏缺','production','其一为3月上中旬','影响分蘖成穗与早期生物量积累;'),
 ('W011',10,'4.2 拔节缺水窗口','黄骅/南皮','拔节期','拔节水分亏缺','production','其二为4月上中旬','产量形成的敏感期[41]。'),
 ('W011',11,'4.3 黄骅雨水调配','黄骅','拔节期至抽穗期','雨水蓄积','production','对于黄骅市,','现实评估与配套建设。'),
]

# Explicit, conservative semantic edges. RECOMMENDS_RESEARCH never means proven treatment.
CLAIMS={
 '适用范围':[('黄骅旱碱麦','Crop','APPLIES_IN','河北省滨海平原盐碱干旱生态类型区','Region')],
 '整地':[('精细整地','AgriculturalPractice','OCCURS_AT_STAGE','播前准备','GrowthStage')],
 '品种选择':[('品种选择','AgriculturalPractice','SELECTS','捷麦19','Variety'),('品种选择','AgriculturalPractice','SELECTS','沧麦6005','Variety')],
 '适期播种':[('适期播种','AgriculturalPractice','REQUIRES','土壤墒情','EnvironmentFactor')],
 '春季追肥':[('春季追肥','AgriculturalPractice','OCCURS_AT_STAGE','返青期','GrowthStage')],
 '病虫害': [('黄骅旱碱麦','Crop','HAS_RISK',n,t) for n,t in [('锈病','Disease'),('赤霉病','Disease'),('白粉病','Disease'),('蚜虫','Pest'),('红蜘蛛','Pest'),('吸浆虫','Pest'),('麦叶蜂','Pest')]],
 '及时收获':[('及时收获','AgriculturalPractice','OCCURS_AT_STAGE','蜡熟末期至完熟期','GrowthStage')],
 '肥料优调':[('肥药优调','AgriculturalPractice','INCLUDES','返青前顶凌追肥','AgriculturalPractice')],
 '农业防治':[('农业防治','AgriculturalPractice','INCLUDES',n,'AgriculturalPractice') for n in ['轮作换茬','适期播种','合理施肥','培育壮苗','中耕锄划']],
 '生产档案':[('肥药优调','AgriculturalPractice','REQUIRES','生产档案','Requirement')],
 '开沟接墒':[('开沟接墒播种','AgriculturalPractice','REQUIRES','土壤墒情','EnvironmentFactor')],
 '探墒保播':[('探墒保播','AgriculturalPractice','REQUIRES','干土层厚度','EnvironmentFactor'),('探墒保播','AgriculturalPractice','REQUIRES','土壤墒情','EnvironmentFactor')],
 '晚播适用范围':[('晚播春促减灾','AgriculturalPractice','APPLIES_IN','沧州','Region')],
 '晚播':[('晚播','AgriculturalPractice','OCCURS_AT_STAGE','播种期','GrowthStage')],
 '晚播春促':[('晚播春促减灾','AgriculturalPractice','INCLUDES','春季管理','AgriculturalPractice')],
 '宽幅沟播适用范围':[('宽幅沟播','AgriculturalPractice','APPLIES_IN','沧州','Region')],
 '宽幅沟播播期':[('宽幅沟播','AgriculturalPractice','OCCURS_AT_STAGE','播种期','GrowthStage')],
 '宽幅沟播':[('宽幅沟播','AgriculturalPractice','REQUIRES','土壤墒情','EnvironmentFactor')],
 '顶凌追肥':[('顶凌追肥','AgriculturalPractice','OCCURS_AT_STAGE','返青期','GrowthStage')],
 '旱盐风险':[('干旱','Stress','ASSOCIATED_WITH',n,'Process') for n in ['种子萌发差','分蘖力弱','生长受抑制']],
 '种子处理研发':[('抗逆促发增蘖种子处理','AgriculturalPractice','RESEARCH_TARGET','种子萌发','Process')],
 '壮秆抗逆研发':[('壮秆抗逆化控','AgriculturalPractice','RESEARCH_TARGET','倒伏','Stress')],
 '干热风风险':[('灌浆期','GrowthStage','HAS_RISK','干热风','WeatherRisk'),('灌浆期','GrowthStage','HAS_RISK','早衰','Stress'),('稳叶促粒调控','AgriculturalPractice','RESEARCH_TARGET','籽粒灌浆','Process')],
 '原粮指标':[('黄骅旱碱麦原粮','Product','HAS_INDICATOR',n,'QualityIndicator') for n in ['色泽','容重','杂质含量','不完善粒含量','水分','硬度指数','降落数值','蛋白质含量']],
 '原粮卫生':[('黄骅旱碱麦原粮','Product','REFERENCES_STANDARD',n,'Requirement') for n in ['GB2761','GB2762','GB2763']],
 '小麦粉':[('黄骅旱碱麦原粮','Product','PROCESSED_INTO','黄骅旱碱麦小麦粉','Product')],
 '面粉指标':[('黄骅旱碱麦小麦粉','Product','HAS_INDICATOR',n,'QualityIndicator') for n in ['灰分含量','脂肪酸值','水分含量','蛋白质含量','湿面筋含量']],
 '盐胁迫机理':[('盐胁迫','Stress','INHIBITS','种子萌发','Process'),('土壤盐分','EnvironmentFactor','INHIBITS','根系吸水','Process')],
 '密植倒伏风险':[('盲目增加播种量','AgriculturalPractice','INCREASES_RISK','倒伏','Stress')],
 '返青水分亏缺':[('水分亏缺','EnvironmentFactor','ASSOCIATED_WITH',n,'Process') for n in ['分蘖成穗','早期生物量积累']],
 '拔节水分亏缺':[('水分亏缺','EnvironmentFactor','ASSOCIATED_WITH','产量形成','Process')],
 '雨水蓄积':[('雨水蓄积','AgriculturalPractice','APPLIES_IN','黄骅','Region')],
}

def build():
    registry=json.loads((ROOT/'graphrag_kg_corpus_v1/01_source_registry/source_registry.json').read_text(encoding='utf-8'))
    sources={s['id']:s for s in registry}; chunks=[]; nodes={};edges=[];evs=[]
    def node(name,typ):
        nid=CROP+':'+hashlib.sha256((typ+':'+name).encode()).hexdigest()[:16]
        nodes[nid]={'id':nid,'name':name,'type':typ,'crop_id':CROP,'source_ids':[]}
        return nid
    for i,(sid,page,section,region,stage,topic,scope,start,end) in enumerate(PASSAGES,1):
        path=ROOT/f'evidence/raw/{sid}_fulltext.pages.json'
        pages=json.loads(path.read_text(encoding='utf-8'));text=compact(pages[page-1]['text'])
        start=compact(start);end=compact(end);a=text.index(start);b=text.index(end,a)+len(end)
        excerpt=text[a:b];cid=f'HH-C{i:03}';source=sources[sid]
        md={'crop':CROP,'region':region,'growth_stage':stage,'scope':scope,'topic':topic,
            'stress':[w for w in ['干旱','盐碱','干热风','倒伏','早衰'] if w in excerpt],
            'practice':[topic],'source_id':sid,'evidence_level':'peer_reviewed_regional' if sid in ('W008','W011') else 'official_standard',
            'review_status':'verbatim_verified','page':page,'section':section,
            'locator':{'file':str(path.relative_to(ROOT)),'page':page,'start':a,'end':b},
            'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'limitations':['仅为研究方向，非已验证田间措施'] if sid=='W008' and '研发' in topic else []}
        chunks.append({'chunk_id':cid,'title':source['title'],'text':excerpt,'metadata':md})
        for subject,st,rel,obj,ot in CLAIMS[topic]:
            eid=f'HH-E{len(edges)+1:03}';a_id=node(subject,st);b_id=node(obj,ot)
            ev={'evidence_id':eid,**md,'title':source['title'],'subject':subject,'relation':rel,'object':obj,'evidence_text':excerpt,'chunk_id':cid}
            evs.append(ev)
            edges.append({'id':eid,'source':a_id,'target':b_id,'relation':rel,'kind':'mechanism' if rel=='ASSOCIATED_WITH' else 'fact',
                'source_id':sid,'evidence_ids':[sid],'chunk_id':cid,'crop_id':CROP,'region':region,'stage_ids':[],
                'growth_stage':stage,'scope':scope,'evidence_level':md['evidence_level'],'review_status':'verbatim_verified',
                'evidence_text':excerpt,'locator':md['locator'],'conditions':[f'原文地区：{region}',f'生育阶段：{stage or "未标定"}']+md['limitations']})
    for e in edges:
        if e['growth_stage']:
            sn=node(e['growth_stage'],'GrowthStage');e['stage_ids']=[sn]
    for e in edges:
        for nid in (e['source'],e['target']):nodes[nid]['source_ids']=sorted(set(nodes[nid]['source_ids']+[e['source_id']]))
    used={c['metadata']['source_id'] for c in chunks}
    graph={'crop_id':CROP,'dataset':'wheat_reviewed_v1','nodes':list(nodes.values()),'edges':edges,
        'sources':[{'id':s,'title':sources[s]['title'],'url':sources[s]['url'],'region':sources[s]['region'],'publication_group':sources[s]['institution']} for s in sorted(used)]}
    # Preserve previous, unverified derived artifacts for audit, never publish them.
    for relative in ['graph/graph-v1.json','evidence/evidence_v1.jsonl']:
        p=ROOT/relative;backup=ROOT/'evaluation/legacy_unverified'/p.name
        if p.exists() and not backup.exists():backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(p.read_bytes())
    save(ROOT/'graph/graph-v1.json',graph)
    (ROOT/'evidence/evidence_v1.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in evs)+'\n',encoding='utf-8')
    save(ROOT/'graphrag_corpus_v1/reviewed_chunks.json',chunks)
    save(ROOT/'ontology/ontology-v1.json',{'crop_id':CROP,'types':sorted({n['type'] for n in nodes.values()}|{'Crop','Variety','Region','SoilType','EnvironmentFactor','Stress','GrowthStage','AgriculturalPractice','Disease','Pest','WeatherRisk','QualityIndicator','Product','Source','KGStatement'}),'relations':sorted({e['relation'] for e in edges}),'rules':['No ungrounded CAUSES','RESEARCH_TARGET is not a production recommendation','Unknown stage is null, not all stages','Source jurisdiction is not universal local validation']})
    return graph,chunks

if __name__=='__main__':
    g,c=build();print({'nodes':len(g['nodes']),'edges':len(g['edges']),'chunks':len(c)})
