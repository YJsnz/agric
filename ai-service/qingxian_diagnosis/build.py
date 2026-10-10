"""Verbatim-reviewed evidence first, crop-scoped graph second."""
import hashlib,json,re
from .audit import ROOT

DOMAIN='qingxian_facility_vegetables'
def save(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def jsonl(path,rows):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
def norm(text):return re.sub(r'\s+','',text)

def sources():
    rows=json.loads((ROOT/'evidence/download_audit.json').read_text(encoding='utf-8'))+json.loads((ROOT/'evidence/supplement_audit.json').read_text(encoding='utf-8'))
    for s in rows:
        s['source_id']=s['id'];s['domain']=DOMAIN
        s['standard_status']='current' if s['id'].startswith('DB13_') and s.get('fulltext_available') else 'not_verified' if s['id'].startswith('DB13_') else 'not_a_standard'
        s['region']='河北' if s['id'].startswith('DB13_') else '青县' if s['id'].startswith('QX_LOCAL') else '地域适用性未知'
        s['evidence_level']='hebei_verified' if s.get('fulltext_available') else 'fulltext_required'
        s['evidence_grade']='A' if s.get('fulltext_available') else None
        if s['id']=='QX_LOCAL_2018':s.update(fulltext_available=True,evidence_level='local_verified',evidence_grade='C',review_status='industry_background_only')
        if s['id'].startswith('CAAS_'):
            s.update(fulltext_available=True,evidence_level='general_authoritative',evidence_grade='C',review_status='passages_reviewed')
    by={s['id']:s for s in rows}
    by['DB13_T5574_2022']['region']='河北冀中南地区'
    by['CAAS_CUCUMBER'].update(title='如何识别黄瓜霜霉病与细菌性角斑病',year=2021,original_publisher='河北科技报',region='适用地域未标定；河北科技报原文')
    by['CAAS_TOMATO'].update(title='大棚番茄典型病害及防治技术',year=2013,original_publisher='河南南召县农技中心',region='河南南召',evidence_level='transfer_pending',permitted_use='reviewed_symptom_comparison_only')
    by['CAAS_ENV'].update(title='做好夏菜定植和蔬菜管理工作',year=2015,original_publisher='吉林农村报',region='吉林',evidence_level='transfer_pending',permitted_use='reviewed_mechanism_comparison_only')
    save(ROOT/'source_registry/source_manifest.json',rows)
    return by

def build():
    registry=sources();chunks=[];candidates=[];nodes={}
    def node(name,typ,crop):
        key=DOMAIN+':'+hashlib.sha256(f'{crop}|{typ}|{name}'.encode()).hexdigest()[:16]
        nodes[key]={'id':key,'name':name,'type':typ,'crop':[crop] if crop else [],'domain':DOMAIN,'aliases':[]}
        return key
    node('青县设施蔬菜','Crop',None)
    def add(sid,page,section,crop,stage,start,end,claims,scope='production',organ=None,season=None):
        s=registry[sid]
        if page:
            raw=json.loads((ROOT/f'evidence/processed/{sid}.pages.json').read_text(encoding='utf-8'))[page-1]['text']
        else:raw=(ROOT/f'evidence/raw/government/{sid}.txt').read_text(encoding='utf-8')
        # Normalize whitespace only; never edit the original source.
        text=norm(raw);a=text.index(norm(start));b=text.index(norm(end),a) if end else len(text)
        quote=text[a:b];cid=f'QXC{len(chunks)+1:03d}'
        locator={'page':page,'section':section,'file':s['local_path'],'normalized_start':a,'normalized_end':b}
        m={'source_id':sid,'doc_id':sid,'domain':DOMAIN,'crop':crop,'growth_stage':stage,'season':season,'organ':organ,
           'region':s['region'],'scope':scope,'topic':section,'page':page,'section':section,'locator':locator,
           'source_type':s['type'],'authority':s['authority'],'evidence_level':s['evidence_level'],'evidence_grade':s['evidence_grade'],
           'review_status':'verbatim_verified','standard_status':s['standard_status'],'source_sha256':s['sha256'],
           'purpose':'candidate_assessment','transfer_notice':s.get('permitted_use'),'disease':[]}
        chunks.append({'chunk_id':cid,'doc_id':sid,'title':s['title'],'text':quote,'metadata':m,'url':s['url']})
        for subject,st,rel,obj,ot in claims:
            edge_crop=crop or ('黄瓜' if obj.startswith('黄瓜') and ot=='Disease' else '番茄' if obj.startswith('番茄') and ot=='Disease' else None)
            # Organ and stage context are not inferred from a disease name.
            candidates.append({'id':f'QXE{len(candidates)+1:03d}','source':node(subject,st,crop),'target':node(obj,ot,edge_crop),
                'subject':subject,'subject_type':st,'object':obj,'object_type':ot,'relation':rel,'kind':'association' if rel=='ASSOCIATED_WITH' else 'fact',
                'domain':DOMAIN,'crop':[edge_crop] if edge_crop else [],'region':s['region'],'growth_stage':stage,
                'stage_ids':[node(stage,'GrowthStage',crop)] if stage else [],'organ':organ,'source_id':sid,'source_title':s['title'],
                'evidence_ids':[sid,cid],'chunk_id':cid,'evidence_text':quote,'page':page,'section':section,'locator':locator,
                'evidence_level':s['evidence_level'],'evidence_grade':s['evidence_grade'],'evidence_strength':'direct',
                'review_status':'verbatim_verified','conditions':[f'作物：{crop or "设施蔬菜背景"}',f'茬口：{season or "原文未限定"}',f'地域：{s["region"]}'],
                'condition':{'crop':crop,'stage':stage,'season':season,'organ':organ},'standard_status':s['standard_status']})
    add('QX_LOCAL_2018',None,'青县蔬菜产业背景',None,None,'羊角脆、黄瓜、韭菜、番茄','+1',[
        ('青县','Region','HAS_INDUSTRY','青县设施蔬菜','Crop'),
        ('青县设施蔬菜','Crop','INCLUDES_CROP','黄瓜','Crop'),('青县设施蔬菜','Crop','INCLUDES_CROP','番茄','Crop')],scope='background')
    add('DB13_T5463_2021',5,'5 苗期主要病害','黄瓜','苗期','苗期主要病害为猝倒病和立枯病','以下三种',[
        (x,'Disease','AFFECTS_CROP','黄瓜','Crop') for x in ['黄瓜猝倒病','黄瓜立枯病']])
    add('DB13_T5463_2021',6,'6.4 定植与生长期主要病害','黄瓜','定植和生长期','定植和生长期主要病害有','6.4.1',[
        ('黄瓜'+x,'Disease','AFFECTS_CROP','黄瓜','Crop') for x in ['细菌性角斑病','白粉病','灰霉病','霜霉病','炭疽病','病毒病']])
    add('DB13_T5463_2021',7,'6.5 主要虫害','黄瓜','定植和生长期','定植和生长期主要虫害有','6.5.1',[
        (x,'Pest','AFFECTS_CROP','黄瓜','Crop') for x in ['蚜虫','粉虱','蓟马','斑潜蝇']])
    add('DB13_T5197_2020',8,'10.1 物理防治','黄瓜',None,'10.1 物理防治','10.2 生物防治',[
        *[('通风口防虫网','Intervention','CONTROLS',x,'Pest') for x in ['蚜虫','斑潜蝇','蓟马','粉虱']],
        *[('黄板诱杀','Intervention','CONTROLS',x,'Pest') for x in ['蚜虫','斑潜蝇','粉虱']],
        ('蓝板诱杀','Intervention','CONTROLS','蓟马','Pest')],season='越冬长季节')
    add('DB13_T5197_2020',8,'10.2.1 天敌防治','黄瓜',None,'10.2.1 虫害防治','10.2.2 病害防治',[
        ('捕食螨','Intervention','CONTROLS','蓟马','Pest'),('丽蚜小蜂','Intervention','CONTROLS','粉虱','Pest')],season='越冬长季节')
    add('DB13_T5532_2022',6,'7.5.1 早春黄瓜温湿度','黄瓜','定植后','7.5.1 温湿度管理','7.5.2',[
        ('放风排湿','Intervention','REGULATES','空气相对湿度','EnvironmentFactor'),
        ('缓苗后空气相对湿度60%～80%','EnvironmentFactor','APPLIES_AT','缓苗后','GrowthStage'),
        ('缓苗期空气相对湿度80%～90%','EnvironmentFactor','APPLIES_AT','缓苗期','GrowthStage')],season='早春茬')
    add('DB13_T5532_2022',6,'7.5.3 光照与植株调整','黄瓜',None,'7.5.3 光照调节','病虫害防治',[
        ('保证温度时早揭晚盖','Intervention','REGULATES','连阴天光照','EnvironmentFactor'),
        ('植株调整','Intervention','INCLUDES','去除黄老病叶','Intervention')],season='早春茬')
    add('DB13_T5532_2022',7,'8.5.1 秋延后黄瓜温湿度','黄瓜',None,'8.5.1 温湿度管理','8.5.2',[
        ('覆盖遮阳网','Intervention','REGULATES','高温','EnvironmentFactor'),
        ('加盖保温被','Intervention','REGULATES','夜间低温','EnvironmentFactor')],season='秋延后')
    add('DB13_T2980_2019',5,'4 控施原则','番茄',None,'4 控施原则',None,[
        ('测土施肥','Intervention','CONSIDERS','土壤供肥','ManagementFactor'),
        ('农药控施','Intervention','PRIORITIZES','农业物理生物防治','Intervention')],season='越冬茬')
    add('DB13_T2980_2019',6,'5.3 轮作与棚室管理','番茄','定植前','5.3.1','5.3.5',[
        ('番茄','Crop','USES','与非茄科作物轮作','Intervention'),
        ('清洁棚室','Intervention','REMOVES','作物残体与田间杂草','ManagementFactor'),
        ('通风口及门口防虫网','Intervention','AFFECTS_CROP','番茄','Crop')],season='越冬茬')
    add('DB13_T2980_2019',7,'6.2.2 黄板诱杀','番茄','定植期','6.2.2 色板诱杀','7 定植后',[
        ('黄板诱杀','Intervention','CONTROLS','蚜虫','Pest'),('黄板诱杀','Intervention','CONTROLS','粉虱','Pest')],season='越冬茬')
    add('DB13_T2980_2019',7,'7.2.1 天敌防治','番茄','定植后至开花坐果期','7.2.1 天敌防治','7.2.2',[
        ('丽蚜小蜂','Intervention','CONTROLS','粉虱','Pest')],season='越冬茬')
    add('DB13_T2980_2019',7,'7.3 温湿度及病株处理','番茄','定植后至开花坐果期','7.3 管理措施','8 开花结果期',[
        ('通风','Intervention','REGULATES','空气湿度','EnvironmentFactor'),
        ('地膜覆盖','Intervention','REGULATES','保湿','ManagementFactor'),
        ('病株及时拔除并消毒','Intervention','AFFECTS_CROP','番茄','Crop')],season='越冬茬')
    add('DB13_T2980_2019',8,'8.3.3 光照与植株调整','番茄','开花结果期','8.3.3 光照管理','9 化学防治',[
        ('补光灯和反光幕','Intervention','REGULATES','光照','EnvironmentFactor'),
        ('整枝打杈','Intervention','AFFECTS_CROP','番茄','Crop'),('摘除老病叶','Intervention','AFFECTS_CROP','番茄','Crop')],season='越冬茬')
    add('DB13_T2993_2019',6,'6 灌溉系统运行管理','番茄',None,'6 灌溉系统运行管理','7 滴灌肥料选择',[
        ('施肥前后清水灌溉','Intervention','AFFECTS_CROP','番茄','Crop'),
        ('检查冲洗过滤器前主管道','Intervention','DECREASES_RISK_OF','系统淤泥沉淀','ManagementFactor')],season='秋冬茬')
    add('DB13_T2993_2019',7,'9 灌水注意事项','番茄',None,'9 注意事项','____',[
        ('阴雪天气灌水','ManagementFactor','DECREASES','地温','EnvironmentFactor'),
        ('阴雪天气灌水','ManagementFactor','AFFECTS','根系生长','ManagementFactor')],season='秋冬茬')
    add('DB13_T5574_2022',8,'9 农业物理生物防治',None,None,'9 病虫害绿色防控技术',None,[
        ('病虫害绿色防控','Intervention','INCLUDES',x,'Intervention') for x in ['抗病耐虫品种','嫁接栽培','轮作','控温调湿','防虫网','释放天敌']])
    for name,start,end,symptoms,organs in [
        ('黄瓜霜霉病','1.黄瓜霜霉病的症状特点','2.黄瓜细菌性角斑病的症状特点',['叶背水浸状小点','多角形水浸状斑','叶背灰黑色霉层','黄褐色坏死斑'],['叶片']),
        ('黄瓜细菌性角斑病','2.黄瓜细菌性角斑病的症状特点','二、黄瓜霜霉病与细菌性角斑病的区别',['水浸状褪绿色病斑','叶背白色菌脓','病斑穿孔或破碎','病瓜臭味'],['叶片','叶柄','卷须','果实','茎蔓'])]:
        add('CAAS_CUCUMBER',None,'症状特点：'+name,'黄瓜',None,start,end,
            [(name,'Disease','HAS_SYMPTOM',x,'Symptom') for x in symptoms]+[(name,'Disease','AFFECTS_ORGAN',x,'PlantOrgan') for x in organs])
    for name,start,end,symptoms,organs in [
        ('番茄枯萎病','一、枯萎病','2、防治方法',['下部叶片萎蔫','维管束变褐色'],['叶片','茎']),
        ('番茄晚疫病','二 、晚疫病','2、防治方法',['叶尖叶缘褐色水浸状斑','病斑边缘白色霉层','果面褐色云纹状病斑'],['叶片','果实']),
        ('番茄白粉病','三、白粉病','2、防治方法',['白色粉斑','叶片布满白粉'],['叶片']),
        ('番茄脐腐病','四、脐腐病','2、防治方法',['果实脐部暗绿色水渍斑','脐部干腐凹陷'],['果实'])]:
        add('CAAS_TOMATO',None,'田间症状：'+name,'番茄',None,start,end,
            [(name,'Disease','HAS_SYMPTOM',x,'Symptom') for x in symptoms]+[(name,'Disease','AFFECTS_ORGAN',x,'PlantOrgan') for x in organs])
    add('CAAS_ENV',None,'棚室低温寡照风险',None,None,'阴天多、低温寡照','在田间管理上',[
        ('低温寡照','EnvironmentFactor','ASSOCIATED_WITH',x,'Disease') for x in ['黄瓜霜霉病','黄瓜灰霉病','番茄叶霉病','番茄灰霉病','番茄晚疫病']])
    # Explicit aliasing within crop, never fuzzy-merge different crops' same disease names.
    for n in nodes.values():
        if n['type']=='Disease' and n['name'].startswith(('黄瓜','番茄')):n['aliases']=[n['name'][2:]]
    jsonl(ROOT/'evidence/evidence_candidates.jsonl',candidates)
    jsonl(ROOT/'evidence/evidence_reviewed.jsonl',candidates)
    jsonl(ROOT/'graphrag_corpus_v1/documents.jsonl',[s for s in registry.values() if s.get('fulltext_available')])
    jsonl(ROOT/'graphrag_corpus_v1/chunks.jsonl',chunks)
    save(ROOT/'graphrag_corpus_v1/reviewed_chunks.json',chunks)
    graph={'domain':DOMAIN,'crop_id':DOMAIN,'nodes':list(nodes.values()),'edges':candidates,'sources':[registry[sid] for sid in {c['doc_id'] for c in chunks}]}
    save(ROOT/'knowledge_graph/graph-v1.json',graph)
    save(ROOT/'knowledge_graph/ontology.json',{'types':sorted({n['type'] for n in nodes.values()}),'relations':sorted({e['relation'] for e in candidates}),'causal_policy':'No unverified CAUSES; association remains association; cross-region material only for comparison.'})
    return {'nodes':len(nodes),'edges':len(candidates),'chunks':len(chunks)}

if __name__=='__main__':print(build())
