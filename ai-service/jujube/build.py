"""Reviewed jujube passages; seed/candidate files are never imported as facts."""
import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'data/cangzhou_jinsixiaozao'
CROP = 'cangzhou_jinsixiaozao'

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def normalized(s):
    return re.sub(r'\s+', '', s)

def registry():
    seeds = json.loads((ROOT/'graphrag_kg_corpus_v1/01_source_registry/source_registry.json').read_text(encoding='utf-8-sig'))
    files = {'J001':'J001_fulltext.pdf','J007':'J007_fulltext.pdf','J008':'J008.html','J017':'J017.html'}
    years = {'J001':2023,'J002':2012,'J007':2011,'J008':2004,'J017':2007}
    rows=[]
    for s in seeds:
        sid=s['id']; name=files.get(sid); path=ROOT/'evidence/raw'/name if name else None
        status='current' if sid in ('J001','J002') else 'abolished' if sid in ('J004','J005','J006') else 'superseded' if sid=='J003' else 'not_a_standard'
        rows.append({**s,'source_id':sid,'crop':CROP,'year':years.get(sid),
            'source_type':s['category'],'standard_status':status,
            'fulltext_available':bool(path and path.exists()),'local_path':str(path.relative_to(ROOT)) if path else None,
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest() if path else None,
            'review_status':'passages_verified' if name else 'fulltext_required',
            'evidence_level':'local_verified' if sid=='J001' else 'peer_reviewed_regional' if name else 'fulltext_required'})
    save(ROOT/'source_registry/source_registry.json',rows)
    with (ROOT/'source_registry/source_registry.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    return rows

def build():
    sources=registry(); by_source={s['id']:s for s in sources}; chunks=[]; nodes={}; edges=[]
    def node(name,typ):
        nid=CROP+':'+hashlib.sha256((typ+':'+name).encode()).hexdigest()[:16]
        nodes[nid]={'id':nid,'name':name,'type':typ,'crop_id':CROP,'crop':['沧州金丝小枣']}
        return nid
    node('沧州金丝小枣','Crop')
    def passage(sid,topic,stage,scope,organ,section,start,end,claims,page=None):
        if sid=='J001':
            raw=json.loads((ROOT/'evidence/raw/J001_fulltext.pages.json').read_text(encoding='utf-8'))[page-1]['text']
            locator={'page':page,'section':section,'file':'evidence/raw/J001_fulltext.pdf'}
        elif sid=='J007':
            raw=(ROOT/'evidence/processed/J007_page1_verified.txt').read_text(encoding='utf-8')
            locator={'page':1,'section':section,'file':'evidence/raw/J007_fulltext.pdf','transcription':'manually_verified_page_image'}
        else:
            raw=(ROOT/f'evidence/raw/{sid}.txt').read_text(encoding='utf-8')
            locator={'page':None,'section':section,'file':f'evidence/raw/{sid}.html'}
        a=raw.index(start); b=raw.index(end,a) if end else len(raw)
        text=raw[a:b].strip(); cid=f'JJC{len(chunks)+1:03d}'
        region={'J001':'沧州金丝小枣地理标志保护区','J007':'河北沧州','J008':'河北沧州、山东乐陵、天津静海','J017':'河北沧州及论文所列试验地区'}[sid]
        meta={'crop':CROP,'region':region,'growth_stage':stage,'stage_unknown':stage is None,
              'scope':scope,'organ':organ,'topic':topic,'source_id':sid,'locator':locator,
              'evidence_level':by_source[sid]['evidence_level'],'standard_status':by_source[sid]['standard_status'],
              'review_status':'verbatim_verified','source_sha256':by_source[sid]['sha256'],
              'risk':[],'purpose':'candidate_assessment' if sid!='J001' else 'conditional_standard_guidance'}
        chunks.append({'chunk_id':cid,'title':by_source[sid]['title'],'text':text,'metadata':meta})
        for subject,st,rel,obj,ot in claims:
            edges.append({'id':f'JJE{len(edges)+1:03d}','source':node(subject,st),'target':node(obj,ot),
                'relation':rel,'kind':'semantic','source_id':sid,'source_ids':[sid],'title':by_source[sid]['title'],
                'region':region,'crop':['沧州金丝小枣'],'crop_id':CROP,'growth_stage':stage,
                'stage_ids':[node(stage,'GrowthStage')] if stage else [],
                'subject':subject,'object':obj,'evidence_text':text,'page':page,'section':section,
                'evidence_level':meta['evidence_level'],'review_status':'verbatim_verified','chunk_id':cid,
                'conditions':[f'用途：{scope}',f'器官：{organ or "原文未统一标定"}',f'阶段：{stage or "原文未标定"}'],
                'evidence_ids':[sid,cid],'evidence':[{'id':cid,'source_id':sid,'quote':text,'locator':locator}],
                'locator':locator,'standard_status':meta['standard_status']})
    passage('J001','苗木定植','定植期','production',None,'5 苗木定植','苗木定植','修剪',[
        ('苗木定植','AgriculturalPractice','APPLIES_AT','秋季落叶后','GrowthStage'),
        ('苗木定植','AgriculturalPractice','APPLIES_AT','春季芽体萌动时','GrowthStage'),
        ('苗木定植','AgriculturalPractice','REQUIRES','南北行向','AgriculturalPractice')],5)
    passage('J001','修剪通风透光',None,'production',None,'5 修剪','修剪','土肥水管理',[
        ('修剪','AgriculturalPractice','SUPPORTS','通风透光','EnvironmentFactor'),
        ('传统枣园','EnvironmentFactor','USES','小冠疏层形','AgriculturalPractice'),
        ('传统枣园','EnvironmentFactor','USES','开心形','AgriculturalPractice'),
        ('传统枣园','EnvironmentFactor','USES','圆头形','AgriculturalPractice')],5)
    passage('J001','土肥水管理',None,'production',None,'5 土肥水管理','土肥水管理','保花保果',[
        ('结果期施肥','AgriculturalPractice','USES','腐熟有机肥','AgriculturalPractice'),
        *[('水分供给','AgriculturalPractice','APPLIES_AT',x,'GrowthStage') for x in ['萌芽期','初花期','幼果期','封冻期']],
        ('水分供给','AgriculturalPractice','CONDITIONED_BY','土壤墒情','EnvironmentFactor')],5)
    passage('J001','病虫害防控时间',None,'production',None,'5 病虫草害防治','病虫草害防治','果实采收',[
        *[(x,'Pest','MANAGED_AT','春季枣芽萌动时','GrowthStage') for x in ['食芽象甲','枣瘿蚊','绿盲蝽']],
        ('红蜘蛛','Pest','MANAGED_AT','5月底至7月中旬','GrowthStage'),
        ('桃小食心虫','Pest','MANAGED_AT','7月初至8月底','GrowthStage'),
        *[(x,'Disease' if x!='裂果' else 'Symptom','MANAGED_AT','7月上旬','GrowthStage') for x in ['枣锈病','烂果病','缩果病','裂果']],
        *[('病虫草害防治','AgriculturalPractice','USES',x,'AgriculturalPractice') for x in ['物理方法','农业方法','生物方法']]],5)
    passage('J001','采收成熟度','采收期','harvest','fruit','5 果实采收','果实采收','6 质量要求',[
        ('干制红枣采收','HarvestProcess','APPLIES_AT','完熟期','GrowthStage'),
        ('鲜食枣采收','HarvestProcess','APPLIES_AT','脆熟期','GrowthStage')],5)
    passage('J001','干枣露天存放','贮藏期','postharvest','fruit','9.3.2','9.3.2','9.3.3',[
        ('干枣露天存放','HarvestProcess','REQUIRES','阴凉通风','StorageCondition'),
        ('干枣露天存放','HarvestProcess','REQUIRES','适宜覆盖物','StorageCondition')],8)
    passage('J001','干枣待运贮存','贮藏期','postharvest','fruit','9.3.3','9.3.3','9.3.4',[
        *[('干枣贮存','HarvestProcess','REQUIRES',x,'StorageCondition') for x in ['批次分明','堆码整齐','环境整洁','通风良好','防潮','防虫','防鼠','温湿度适宜']],
        *[('干枣贮存','HarvestProcess','AVOIDS',x,'PostharvestRisk') for x in ['烈日暴晒','雨淋','冻害','热害','异味有毒有害物品混放']]],8)
    passage('J001','运输条件','运输期','postharvest','fruit','9.3.4','9.3.4',None,[
        *[('干枣运输','HarvestProcess','REQUIRES',x,'StorageCondition') for x in ['清洁干燥运输工具','防晒设施','防雨设施']]],8)
    passage('J007','成熟期降雨浆烂裂果','成熟期','production','fruit','第196页引言','小枣在生长后期',None,[
        ('成熟期连续阴雨','WeatherRisk','ASSOCIATED_WITH','裂果','Symptom'),
        ('成熟期连续阴雨','WeatherRisk','ASSOCIATED_WITH','浆烂','Symptom'),
        ('遇雨果肉吸水膨胀','EnvironmentFactor','PROMOTES','裂果','Symptom'),
        ('长时间阴雨','WeatherRisk','ASSOCIATED_WITH','果面阴湿霉露','EnvironmentFactor')],1)
    for disease,start,end,symptoms in [
        ('浆烂病','浆烂型：','黑疔型：',['黄褐色水浸状小点','浅红色病斑','轮纹','软腐','酒糟味','皱缩腐果']),
        ('黑疔病','黑疔型：','褐皮型：',['圆形略凹陷病斑','果肉软腐','黑色病组织','墨绿色霉层']),
        ('褐皮病','褐皮型：','2.2 不同类型',['梗洼黄色至淡褐色晕斑','红褐色凹陷病斑','海绵状坏死','果实脱落'])]:
        passage('J008',disease+'症状',None,'production','fruit','2.1 病果症状',start,end,[(disease,'Disease','HAS_SYMPTOM',x,'Symptom') for x in symptoms])
    passage('J008','果实病害病原候选',None,'production','fruit','3 讨论','本研究发现金丝小枣果实病害分浆烂','浆烂病占田间',[
        ('浆烂病','Disease','HAS_PATHOGEN','仁果囊孢壳菌','Pathogen'),
        ('黑疔病','Disease','HAS_PATHOGEN','细链格孢菌','Pathogen'),
        ('褐皮病','Disease','HAS_PATHOGEN','毁灭茎点霉菌','Pathogen'),
        ('褐皮病','Disease','HAS_PATHOGEN','细链格孢菌','Pathogen')])
    passage('J017','绿盲蝽危害及越冬','萌芽至幼果期','production',None,'3.3','该虫在枣园中主要以卵','根据绿盲蝽蟓',[
        ('绿盲蝽','Pest','OVERWINTERS_IN','小枝剪口皮缝','EnvironmentFactor'),
        ('绿盲蝽','Pest','HAS_SYMPTOM','破叶疯','Symptom'),
        *[('绿盲蝽','Pest','DAMAGES',x,'PlantOrgan') for x in ['枣芽','幼嫩枣吊','花蕾','花柄','幼果']],
        ('绿盲蝽若虫','Pest','SPREADS_VIA','沿树干爬行转移','EnvironmentFactor')])
    passage('J017','绿盲蝽试验观察','萌芽至幼果期','production',None,'3.3 试验结果','调查结果表明(\n表 3','表 3\n不同管理',[
        ('树干粘胶环','AgriculturalPractice','REDUCES','绿盲蝽叶片花蕾幼果危害','Symptom')])
    graph={'crop_id':CROP,'nodes':list(nodes.values()),'edges':edges,'sources':[s for s in sources if s['fulltext_available']]}
    save(ROOT/'knowledge_graph/graph-v1.json',graph);save(ROOT/'graphrag_corpus_v1/reviewed_chunks.json',chunks)
    save(ROOT/'knowledge_graph/ontology.json',{'node_types':sorted({n['type'] for n in nodes.values()}),'relations':sorted({e['relation'] for e in edges}),'note':'Associations are not upgraded to CAUSES; unknown stages remain null.'})
    return {'nodes':len(nodes),'edges':len(edges),'chunks':len(chunks)}

if __name__=='__main__':print(build())
