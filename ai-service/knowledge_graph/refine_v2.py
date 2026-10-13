"""Deterministic ontology refinement; stable IDs and statement-level scope preserved."""
from collections import defaultdict

REQUIRED_TYPES = 'Crop Variety Region GrowthStage Disease Pest Symptom EnvironmentFactor AgriculturalPractice PreventionMeasure QualityIndicator HarvestProcess StorageCondition PostharvestRisk Intervention Source'.split()
GROWTH = {'开花期', '果实膨大期', '休眠期'}
PREVENTION = {'剔除病虫果','剔除机械损伤果','减少采收搬运损伤','贮藏场所消毒','清洁与消毒','避免机械损伤','避免牵拉果梗','黑星病初侵染预防'}
HARVEST = {'梨采收决策','梨人工采收','牵拉果梗','梨采收成熟度判断','梨分级','采收果实抽样','由外向内采','由上向下采','轻拿轻放'}
ENVIRONMENT = {'持续湿润','土层深厚','土壤 pH 7.1～8.5','土壤含盐量 0.1%～0.3%','砂壤至中壤质潮土','日照时数 1600～1700 h','土壤有机质大于 1%','砂质壤土','坡度小于 15°'}
QUALITY = {'结合硬度':'果实硬度','结合可溶性固形物':'可溶性固形物含量','结合果形':'果形','结合色泽':'果实色泽','结合单果质量':'单果质量','结合果径':'果径','结合缺陷':'果面缺陷','结合果实成熟度':'果实成熟度'}
PARENTS = {'PreventionMeasure':['Intervention'], 'HarvestProcess':['AgriculturalPractice'], 'GrowthStage':['Stage'], 'PostharvestRisk':['Risk']}

def refine(graph):
    nodes={n['id']:n for n in graph['nodes']}
    incoming=defaultdict(list)
    for e in graph['edges']: incoming[e['target']].append(e)
    for n in graph['nodes']:
        old=n['type']; name=n['name']; typ=old
        if old=='Crop' and name not in {'梨','泊头鸭梨'}: typ='Variety'
        elif old=='Stage' and name in GROWTH: typ='GrowthStage'
        elif old=='Risk': typ='PostharvestRisk'
        elif name in PREVENTION: typ='PreventionMeasure'
        elif name in HARVEST: typ='HarvestProcess'
        elif name in ENVIRONMENT: typ='EnvironmentFactor'
        elif name in QUALITY:
            typ='QualityIndicator'; n['name']=QUALITY[name]; n['aliases']=list(set(n.get('aliases',[])+[name]))
        elif old=='Condition':
            if any(x in name for x in ['℃','相对湿度','货架时间','过低贮藏温度','过高二氧化碳浓度','乙烯积累']): typ='StorageCondition'
            elif name.startswith(('检查','记录','抽取','定期抽查','振落法','灌水','排水','增施','种植','使用土壤','回填','栽后','秋施','花前追肥','膨大期追肥','依据土壤','萌芽前灌','落花后灌','果实膨大期灌','封冻前灌','大雨后','结合施基肥','夏剪','翻压','萌芽期追肥','花芽分化期追肥','果实膨大期追肥','人工辅助授粉')): typ='AgriculturalPractice'
            else: typ='Requirement'
        elif old=='Intervention' and (name.startswith(('盐碱地','梨园','梨树','梨花果')) or '抽样' in name or '调查' in name): typ='AgriculturalPractice'
        n['type']=typ
        n['classification_basis']='原始知识条目语义分类；不改变证据适用范围'
    related=defaultdict(list)
    for e in graph['edges']:
        for key in set([e['source'],e['target'],e['crop'],*e['stage_ids']]): related[key].append(e)
        if e['relation']=='PRODUCED_IN': e['relation']='LOCATED_IN'
        # Correct locators against the actual Ministry document headings.
        if 'moa' in e['evidence_ids']:
            loc=e['locator']
            if loc.startswith('二、'): e['locator']='一、梨贮藏特性：2.贮藏过程中易出现的问题；3.贮藏病害及其防控'
            elif '采收' in loc: e['locator']='四、梨贮藏技术要点（三）采收'
            elif '分级' in loc: e['locator']='四、梨贮藏技术要点（四）分级'
            elif '预冷' in loc: e['locator']='四、梨贮藏技术要点（六）预冷'
            elif '通风' in loc: e['locator']='四、梨贮藏技术要点（七）贮藏：通风换气'
        e['claim']=f"{nodes[e['source']]['name']} — {e['relation']} → {nodes[e['target']]['name']}"
    for n in graph['nodes']:
        es=related[n['id']]
        n['source_ids']=sorted({s for e in es for s in e['evidence_ids']})
        n['source_count']=len(n['source_ids'])
        n['crop']=sorted({nodes[e['crop']]['name'] for e in es})
        n['region']=sorted({e['region'] for e in es})
        n['description']=f"{n['name']}；类型 {n['type']}。关联 {len(es)} 条有出处知识；作物、地区及阶段须按具体关系核对。"
    scab=next(n for n in graph['nodes'] if n['name']=='梨黑星病')
    scab['description']='由 Venturia pirina 引起的梨病害，可在果实、叶片和枝梢出现病斑；此条描述来自 UC IPM 加州梨资料，尚待本地适用性审核。'
    graph['version']='2.1.0'
    for source in graph['sources']:
        source.update(name=source['title'], type='Source', description=source['review_method'], source_count=1)
    return graph
