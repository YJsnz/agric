"""Curated statements from reviewed originals; never synthesize missing agricultural facts."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT.parent / 'data/botou_yali/evidence'
DATASET = 'pear_evidence_v2'
nodes, edges, sources = {}, [], []

def node(name, kind='Condition'):
    key = 'v2:' + hashlib.sha256((kind + ':' + name).encode()).hexdigest()[:16]
    nodes.setdefault(key, dict(id=key, name=name, type=kind, aliases=[], dataset=DATASET))
    return key

def source(key, title, url, region, date, level, file='', status='read', source_type='standard'):
    path = CORPUS / file
    sources.append(dict(id=key, title=title, url=url, region=region, published_at=date,
        evidence_level=level, status=status, source_type=source_type, dataset=DATASET,
        scope=region, file=file, sha256=hashlib.sha256(path.read_bytes()).hexdigest() if file and path.exists() else '',
        reviewed_at='2026-09-12', review_method='原文核对；尚未经农业专家复核',
        publication_group='UC ANR 3455' if key.startswith('uc_') else key))
    sources[-1]['author']='加州大学州级IPM计划；具体署名见原文' if key.startswith('uc_') else {'6338':'海兴瑞农农业发展有限公司、沧州市农林科学院、海兴县农业农村局','6276':'河北省农林科学院生物技术与食品科学研究所','5390':'河北省农林科学院遗传生理研究所','moa':'农业农村部农产品冷链物流标准化技术委员会'}.get(key,'原文署名待结构化')
    sources[-1]['year']=int(date[:4]) if date else None
    sources[-1]['source_id']=key
    sources[-1]['crop']='梨；具体品种以知识条目为准'

def statement(a, relation, b, sid, locator, stages=(), crop='梨', conditions=(), kind=None):
    a = node(*a) if isinstance(a, tuple) else a
    b = node(*b) if isinstance(b, tuple) else b
    src = next(s for s in sources if s['id'] == sid)
    kind = kind or {'RECOMMENDS':'normative','REQUIRES':'normative','HAS_PARAMETER':'normative',
        'PROMOTES':'mechanism','INCREASES_RISK':'mechanism','REDUCES_RISK':'mechanism',
        'INTERVENTION_FOR':'normative','ASSOCIATED_WITH':'association'}.get(relation,'fact')
    identifier = 'v2:e' + str(len(edges)+1).zfill(4)
    edges.append(dict(id=identifier, source=a, target=b, relation=relation, kind=kind,
        evidence_ids=[sid], claim=f"{nodes[a]['name']}：{nodes[b]['name']}", locator=locator,
        crop=node(crop,'Crop'), region=src['region'], stage_ids=[node(s,'Stage') for s in stages],
        scope='general_pear' if src['region'].startswith(('US','AU')) else 'local',
        review_status='transfer_pending' if src['region'].startswith(('US','AU')) else 'source_checked',
        evidence_level=src['evidence_level'], confidence=None, effect_size=None,
        conditions=list(conditions) or ['仅限原资料适用范围；需要结合品种、批次及实际条件复核'],
        valid_from=src.get('effective_at', src['published_at']), valid_to='', dataset=DATASET))

def norms(subject, rows, sid, locator, stage, kind='Intervention', crop='梨', conditions=()):
    for target in rows.split('|'):
        statement((subject,kind),'REQUIRES',(target,'Condition'),sid,locator,[stage],crop,conditions)

def build():
    nodes.clear(); edges.clear(); sources.clear()
    manifest=json.loads((CORPUS/'metadata/downloads.json').read_text(encoding='utf-8'))
    titles={'6338':'盐碱地梨栽培技术规程','6276':'梨产业链质量控制技术规程','5390':'梨货架期品质维持技术规范'}
    for record in manifest:
        code=record['id'].split('_')[2]
        if code not in titles: continue
        year=record['id'].split('_')[3]
        date={'6338':'2026-06-30','6276':'2026-04-09','5390':'2021-04-26'}[code]
        source(code,f'DB13/T {code}-{year} {titles[code]}',record['catalog']['url'],'河北省',date,'A',record['document']['file'])
        sources[-1]['download_url']=record['document']['url']
        sources[-1]['effective_at']={'6338':'2026-07-30','6276':'2026-05-09','5390':'2021-05-26'}[code]
    source('moa','梨贮藏保鲜操作规程','https://scs.moa.gov.cn/ccll/jszn/202302/t20230203_6419771.htm','全国','2023-02-03','A','government/moa_storage.html',source_type='government_guidance')
    source('botou','河北泊头市2021年中国农民丰收节举行','https://nmfsj.moa.gov.cn/dfzt/heibei/zxzx_25728/202109/t20210923_6377404.htm','泊头市','2021-09-23','D','government/moa_botou.html',source_type='government_news')
    sources[-1]['author']='王雅楠；原载河北新闻网、河北日报，农业农村部网站转载'
    statement(('泊头鸭梨','Crop'),'PRODUCED_IN',('泊头市','Region'),'botou','正文：泊头鸭梨产区')
    norms('盐碱地梨园选址','土层深厚|土壤 pH 7.1～8.5|土壤含盐量 0.1%～0.3%|砂壤至中壤质潮土','6338','4.1','建园',conditions=['盐碱地梨栽培；不是所有梨园的通用盐分阈值'])
    norms('盐碱地土壤工程改良','灌排设施配套|灌水洗盐|排水排盐','6338','4.3.1','建园')
    norms('盐碱地土壤生物改良','微生物肥料|增施有机肥|秸秆还田|种植绿肥|种植耐盐植物','6338','4.3.2','建园')
    norms('盐碱地土壤化学改良','使用土壤改良剂调节酸碱性','6338','4.3.3','建园')
    norms('盐碱地梨苗选择','当地传统品种或审定耐盐优良品种|杜梨砧木|符合引用标准的二级以上苗木','6338','5','建园')
    norms('盐碱地梨定植','优先春栽|南北行向|栽植沟宽深各 80 cm|表土与心土分放|沟底秸秆层约 20 cm|腐熟农家肥与表土混合|回填后灌水沉实|栽植穴直径及深度各 40 cm|定干高度 60～80 cm|栽后浇水覆膜','6338','6','定植')
    norms('盐碱地梨园地表管理','结合施基肥深翻|耐盐绿肥或自然生草|刈割后留茬 10～15 cm|秸秆覆盖或黑色园艺地布','6338','7.1','田间管理')
    norms('盐碱地梨施肥','有机肥与配方肥结合|秋施基肥|环状沟或条状沟或放射沟施肥|花前追肥|膨大期追肥','6338','7.2','田间管理')
    norms('盐碱地梨水分管理','依据土壤墒情灌水|萌芽前灌水|落花后灌水|果实膨大期灌水|封冻前灌水|滴灌或渗灌|大雨后及时排水','6338','7.3','田间管理')
    norms('梨园生产档案','记录环境条件|记录生产技术|记录肥水管理|记录病虫害发生|记录病虫害防治|记录采收|专人管理档案','6338','12','田间管理')
    norms('梨园产地选择','日照时数 1600～1700 h|土壤有机质大于 1%|砂质壤土|坡度小于 15°','6276','4.1','建园')
    norms('梨园品种和砧木选择','按当地气候和土壤选品种|河北中南部适用杜梨砧木|河北东部和北部适用山梨砧木','6276','5','建园')
    norms('梨园栽植配置','稀植株行距 3～4 m × 4～5 m|密植株行距 2～3 m × 3～4 m|每园配置 2～4 个品种|经济价值相当品种可等行配置|主栽与授粉树比例 4∶1～8∶1','6276','6','定植')
    norms('梨树整形修剪','稀植可用疏散分层形|稀植可用单层一心形|密植可用细长纺锤形|幼树冬剪重在树形|初果树培养骨架|盛果树调节光照和树势|夏剪去竞争枝|夏剪抹芽|夏剪去直立旺梢','6276','7','田间管理')
    norms('梨园土壤管理','秋季施基肥时隔行深翻|深翻沟宽 50～60 cm|深翻沟深 40～60 cm|结合深翻施有机肥|生草可用三叶草|生草可用黑麦草|生草可用二月兰|翻压或刈割覆盖','6276','8.1—8.2','田间管理')
    norms('梨园肥水管理','按土壤肥力配施氮磷钾|结果树秋施商品有机肥|萌芽期追肥|花芽分化期追肥|果实膨大期追肥|根区交替灌溉或沟灌','6276','8.3—8.4','田间管理')
    norms('梨花果管理','人工辅助授粉或放蜂|疏花在花序分离至开花期|每花序保留基部 2～4 朵花|落花后 10～20 d 疏果|留果间距 20～30 cm|落花后 20 d 开始套袋|选用韧性强透气的专用纸袋','6276','9','花果管理')
    norms('梨采收决策','结合品种成熟特性|结合果实成熟度|结合果实用途|避开雨天|避开露水未干时段|选择晴天凉爽时段','6276','11','采收期')
    norms('梨人工采收','由外向内采|由上向下采|轻拿轻放|避免牵拉果梗','6276','11','采收期')
    statement(('牵拉果梗','Intervention'),'INCREASES_RISK',('果实内部损伤','State'),'6276','11',['采收期'],conditions=['规范通过避免牵拉来防止损伤；不提供效应量'])
    statement(('牵拉果梗','Intervention'),'INCREASES_RISK',('梗基腐烂风险','Risk'),'6276','11',['采收期','储藏期'],conditions=['规范预防依据；不是本地随机干预试验'])
    norms('梨出库运输','出库回温|果面与环境温差小于 10 ℃|避免机械损伤|长途运输温度 2～5 ℃|长途运输相对湿度不低于 85%','6276','13','运输期')
    norms('梨包装','容器结实|容器无异味|容器内壁光滑|箱内加垫|单果包装纸|网套保护|高二氧化碳透过率保鲜袋或打孔微孔袋','5390','4.4','包装期')
    temps={'黄冠':'10～15 ℃逐渐降至 0 ℃','鸭梨':'10～12 ℃逐渐降至 0 ℃','雪花':'0 ℃','红香酥':'0～1 ℃','京白':'−1～0 ℃','玉露香':'−1～0 ℃','雪青':'10～12 ℃逐渐降至 0 ℃','南果':'0 ℃','苹果梨':'−1～0 ℃','黄金':'0～1 ℃','丰水':'0～1 ℃','新高':'0～1 ℃','蜜梨':'0 ℃','砀山酥梨':'−1～0 ℃','巴梨':'0 ℃','早酥':'0～2 ℃','香水梨':'0 ℃','花盖梨':'−1～0 ℃','库尔勒香梨':'−1～0 ℃'}
    for cultivar,temp in temps.items():
        norms(cultivar+'贮藏',temp+'|相对湿度 90%～95%','5390','4.5 表1','储藏期',crop=cultivar,conditions=['必须匹配表1对应品种；梯度降温与恒温要求不可混同'])
    norms('梨缓慢回温','出库前缓慢升温|果心与外界温差小于 10 ℃','5390','4.6','出库期')
    norms('梨长途运输','温度 2～5 ℃|相对湿度不低于 85%','5390','4.7','运输期')
    norms('梨货架场所管理','清洁与消毒','5390','5.1','货架期')
    norms('梨低温货架','温度 0～5 ℃|相对湿度 85%～95%|低温货架时间少于 30 d','5390','5.2—5.3','货架期')
    norms('梨常温货架','常温货架时间少于 10 d','5390','5.3','货架期')
    for disease in ['青绿霉病','褐腐病','轮纹病']:
        statement(('梨','Crop'),'HAS_DISEASE',(disease,'Disease'),'moa','二、贮藏保鲜技术要点（一）',['储藏期'])
    for disorder in ['冷害','二氧化碳伤害']:
        statement(('梨','Crop'),'HAS_DISORDER',(disorder,'PhysiologicalDisorder'),'moa','二、贮藏保鲜技术要点（二）',['储藏期'])
    for action in ['剔除病虫果','剔除机械损伤果','减少采收搬运损伤','贮藏场所消毒']:
        statement((action,'Intervention'),'INTERVENTION_FOR',('采后腐烂风险','Risk'),'moa','二、贮藏保鲜技术要点（一）',['采收期','分选期','储藏期'],conditions=['政府技术指导的预防措施；没有校准损耗概率'])
    statement(('机械损伤','State'),'INCREASES_RISK',('采后腐烂风险','Risk'),'moa','二、贮藏保鲜技术要点（一）',['采收期','储藏期'],conditions=['技术指导要求避免损伤以预防侵染性病害；需同时考虑病原和贮藏环境'])
    statement(('过低贮藏温度','Condition'),'INCREASES_RISK',('冷害','PhysiologicalDisorder'),'moa','二、贮藏保鲜技术要点（二）',['储藏期'])
    statement(('过高二氧化碳浓度','Condition'),'INCREASES_RISK',('二氧化碳伤害','PhysiologicalDisorder'),'moa','二、贮藏保鲜技术要点（二）',['储藏期'])
    for disorder in ['冷害','二氧化碳伤害']:
        for symptom in ['果心褐变','果肉褐变']:
            statement((disorder,'PhysiologicalDisorder'),'HAS_SYMPTOM',(symptom,'Symptom'),'moa','二、贮藏保鲜技术要点（二）',['储藏期'])
    norms('梨采收成熟度判断','结合硬度|结合生长天数|结合可溶性固形物','moa','三、操作规程（四）采收','采收期')
    norms('梨分级','结合果形|结合色泽|结合单果质量|结合果径|结合缺陷','moa','三、操作规程（四）分级','分选期')
    norms('鸭梨入库降温','无需单独预冷|按规程在库内梯度降温','moa','三、操作规程（四）预冷','储藏期',crop='鸭梨')
    statement(('乙烯积累','Condition'),'PROMOTES',('果实衰老','State'),'moa','三、操作规程：通风换气',['储藏期'])
    statement(('通风换气','Intervention'),'INTERVENTION_FOR',('乙烯积累','Condition'),'moa','三、操作规程：通风换气',['储藏期'])

    # Foreign reference layer: no automatic transfer of diagnoses or pesticide regimes.
    uc=[
      ('pear_scab','梨黑星病','Disease','果面橄榄黑色绒状病斑|叶片皱缩扭曲|早期侵染后果实畸形|晚期针尖状黑斑'),
      ('pear_psylla','梨木虱（Cacopsylla pyricola）','Pest','蜜露污染|煤污覆盖|果皮锈斑|叶片黄化|落叶'),
      ('pear_rust_mite','梨锈螨','Pest','组织铜色化|萼端锈斑|梗端锈斑'),
      ('pearleaf_blister_mite','梨叶瘿螨','Pest','芽干枯|叶片水疱状瘿斑|椭圆形果面锈斑|果实畸形'),
      ('san_jose_scale','梨圆蚧','Pest','红紫色环斑|果面凹凸|果实畸形|枝条枯死'),
      ('aphids','梨园蚜虫','Pest','叶片卷曲|新梢生长受抑|蜜露污染|果面煤污'),
      ('mealybugs','梨园粉蚧','Pest','萼端受害|蜜露污染|果面锈斑|果面煤污'),
      ('thrips','梨园蓟马','Pest','果面锈斑|果面痂斑|果实畸形'),
      ('webspinning_spider_mites','结网叶螨','Pest','叶片发黑|落叶|果实生长受抑'),
      ('pear_decline','梨衰退病','Disease','新梢生长不良|枝梢枯死|叶片提前变红|叶缘上卷|叶片变小|果实变小|提前落叶'),
      ('blossom_blast','梨细菌性花枯病','Disease','花芽干枯|果面黑色凹斑|叶片黑色斑点'),
      ('fire_blight','梨火疫病','Disease','新梢弯曲呈牧羊杖状|花器萎蔫发黑|琥珀色菌脓'),
      ('codling_moth','苹果蠹蛾','Pest','果面浅蛀孔|直达种子腔的蛀道|虫粪堵塞蛀孔'),
      ('european_red_mite','苹果全爪螨','Pest','叶片失绿斑驳|叶片铜色化|高温下叶片褐化干枯'),
      ('obliquebanded_leafroller','斜带卷叶蛾','Pest','幼果深凹陷|果面浅表蛀道'),
      ('western_boxelder_bug','西部槭树蝽','Pest','果面暗色凹点|果皮下硬质髓状区域'),
      ('katydids','梨园螽斯','Pest','叶片取食损伤|近采收期果实咬伤'),
      ('armillaria_root_and_crown_rot_oak_root_fungus','蜜环菌根颈腐烂病','Disease','树势衰退|皮下乳白色菌丝层|黑色根状菌索')]
    pages={r['id']:r for r in json.loads((CORPUS/'metadata/page_downloads.json').read_text(encoding='utf-8'))}
    pages.update({r['id']:r for r in json.loads((CORPUS/'metadata/extra_downloads.json').read_text(encoding='utf-8'))})
    for slug,title,typ,symptoms in uc:
        sid='uc_'+slug; record=pages[sid]
        source(sid,'UC IPM 梨：'+title,record['url'],'US-CA','','B',record['file'],source_type='university_extension')
        for symptom in symptoms.split('|'):
            statement((title,typ),'HAS_SYMPTOM',(symptom,'Symptom'),sid,'Symptoms and Signs / Damage',['田间管理'])
        statement(('梨','Crop'),'HAS_DISEASE' if typ=='Disease' else 'HAS_PEST',(title,typ),sid,'Pear pest management guidelines',['田间管理'])
    statement(('持续湿润','Condition'),'PROMOTES',('梨黑星病初侵染','State'),'uc_pear_scab','Comments on the Disease',['田间管理'],conditions=['存在病原接种体及感病幼叶或幼果；受温度和湿润持续时间共同影响；加州梨资料'])
    statement(('梨黑星病初侵染','State'),'PROMOTES',('梨黑星病二次传播','State'),'uc_pear_scab','Comments on the Disease',['田间管理'],conditions=['初侵染产生次生孢子，并再次遇到湿润条件；不是储藏腐烂结论'])
    statement(('梨黑星病','Disease'),'HAS_PATHOGEN',('Venturia pirina','Pathogen'),'uc_pear_scab','标题下病原名称',['田间管理'])

    for slug,title,stage,targets in [
        ('harvest_fruit_sample','采收果实抽样','采收期','检查蛀孔|检查煤污|检查果锈|检查黑星病斑|记录采收受害情况'),
        ('postharvest_survey','采后梨园调查','采后田间管理','检查树上残留果|抽取顶梢检查|记录黑星病斑|记录捕食螨|记录木虱卵和若虫'),
        ('sampling_at_bloom','花期害虫抽样','开花期','抽取树顶和视线高度花序|检查木虱卵和若虫|检查螨类|检查毛虫|检查蓟马'),
        ('sampling_during_fruit_development','果实发育期抽样','果实膨大期','定期抽查叶片和果实|检查果面蛀孔|检查萼端和梗端锈斑|记录虫害观察结果'),
        ('dormant_to_delayed_dormant_sampling','休眠期抽样','休眠期','振落法调查木虱|检查芽鳞和短果枝|检查枝梢蚧虫|检查黑星病枝梢斑|检查树皮下粉蚧')]:
        sid='uc_'+slug;record=pages[sid]
        source(sid,'UC IPM 梨：'+title,record['url'],'US-CA','','B',record['file'],source_type='university_extension')
        norms(title,targets,sid,'How to Sample',stage,conditions=['加州梨园抽样方法；采后田间调查不是库内储藏；未引入异地用药阈值'])
    source('vic','维多利亚州农业部门：梨黑星病','https://agriculture.vic.gov.au/biosecurity/plant-diseases/fruit-and-nut-diseases/pome-fruits/pear-scab','AU-VIC','','B',source_type='government_guidance')
    sources[-1]['review_method']='官方网页正文已阅读；本地下载未成功，保留原始链接'
    statement(('采前晚期黑星病感染','State'),'ASSOCIATED_WITH',('储藏中显现黑星病斑','Symptom'),'vic','Symptoms',['采收期','储藏期'],conditions=['异地一般梨资料；显症不等于果实腐烂，也不推出损耗概率'])
    source('lac','漆酶LAC表达与鸭梨果心褐变的关系','https://www.chinaagrisci.com/CN/10.3864/j.issn.0578-1752.2020.24.010','研究试验范围','','B',source_type='journal_abstract')
    sources[-1]['year']=2020
    sources[-1]['author']='王梓宇等；完整作者名单见期刊原页'
    sources[-1]['review_method']='仅核对期刊官方摘要；全文方法未取得，不作干预效应估计'
    statement(('LAC基因表达变化','Metric'),'ASSOCIATED_WITH',('果心褐变','Symptom'),'lac','官方摘要：结果与结论',['储藏期'],crop='鸭梨',conditions=['相关表达结果，不代表通过基因干预识别因果关系；不同成熟度和降温处理须分层'])

    # Reviewed UC IPM sections; foreign scope remains transfer_pending.
    for state in ['梨黑星病初侵染','梨黑星病二次传播']:
        statement(('梨黑星病','Disease'),'HAS_PROCESS',(state,'State'),'uc_pear_scab','Comments on the Disease',['田间管理'])
    statement(('梨黑星病','Disease'),'CONTROLLED_BY',('黑星病初侵染预防','Intervention'),'uc_pear_scab','Management',['田间管理'],conditions=['仅表示预防初侵染的管理目标；不迁移国外农药品种、剂量或登记结论'])
    statement(('黑星病初侵染预防','Intervention'),'INTERVENTION_FOR',('梨黑星病初侵染','State'),'uc_pear_scab','Management',['田间管理'])
    statement(('梨黑星病','Disease'),'RECOMMENDS',('温湿条件监测','AgriculturalPractice'),'uc_pear_scab','Monitoring',['田间管理'])
    statement(('梨黑星病','Disease'),'HAS_PROCESS',('采前晚期黑星病感染','State'),'vic','Symptoms',['采收期','储藏期'])
    # Stage edges express evidence applicability, not inferred disease incidence.
    for stage in ['开花期']:
        statement(('梨花果管理','Intervention'),'OCCURS_AT_STAGE',(stage,'Stage'),'6276','9',[stage],conditions=['花果管理条款及已列生育阶段；不是病害发生率'])
    aliases={'梨黑星病':['黑星病'],'梨木虱（Cacopsylla pyricola）':['梨木虱'],'泊头鸭梨':['泊头梨']}
    for n in nodes.values(): n['aliases']=aliases.get(n['name'],[])
    graph=dict(version='2.0.0',dataset=DATASET,nodes=list(nodes.values()),edges=edges,sources=sources)
    from refine_v2 import refine
    graph=refine(graph)
    from enrich_review_20260925 import enrich
    graph=enrich(graph)
    (ROOT/'data/graph-v2.json').write_text(json.dumps(graph,ensure_ascii=False,indent=2),encoding='utf-8')
    (CORPUS/'metadata/sources-v2.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:len(graph[k]) for k in ('nodes','edges','sources')}))
    return graph

if __name__=='__main__': build()
