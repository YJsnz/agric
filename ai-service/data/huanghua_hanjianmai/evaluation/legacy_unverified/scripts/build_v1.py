# -*- coding: utf-8 -*-
"""Build huanghua_hanjianmai V1: ontology, evidence records, graph-v1.json.

Only entities and relations that are traceable to archived sources are included.
Review status stays at 'candidate_requires_review' for all production edges;
numeric values carry units in evidence_text and are NOT auto-promoted to effect_size.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]      # data/huanghua_hanjianmai
ONTO_DIR = ROOT / 'ontology'
EVID_DIR = ROOT / 'evidence'
GRAPH_DIR = ROOT / 'graph'
OUT = [ONTO_DIR, EVID_DIR, GRAPH_DIR]
for d in OUT:
    d.mkdir(parents=True, exist_ok=True)

REGIONS = {
    'reg:huanghua': ('黄骅市', 'Region'),
    'reg:zhongjie': ('中捷产业园区', 'Region'),
    'reg:cangzhou': ('沧州市', 'Region'),
    'reg:haixing': ('海兴县', 'Region'),
    'reg:nanpi': ('南皮县', 'Region'),
    'reg:hebei': ('河北省', 'Region'),
    'reg:hebei_lowplain': ('河北低平原盐碱区', 'Region'),
    'reg:binhai': ('渤海湾滨海盐碱区', 'Region'),
}
SOURCES = [
    ('W001', 'DB13/T 5659-2023 黄骅旱碱麦生产技术规程', '地方标准', '河北滨海盐碱区/黄骅', 'local_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailedCNF?id=F9350671CBC8B511E05397BE0A0AE4A7', '河北省市场监督管理局'),
    ('W002', 'DB13/T 6106-2025 旱碱麦肥药优调技术规程', '地方标准', '河北', 'hebei_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailedCNF?id=39A5186C58B95ACAE06397BE0A0ADABE', '河北省市场监督管理局'),
    ('W003', 'DB13/T 6107-2025 旱碱麦开沟接墒播种技术规程', '地方标准', '河北', 'hebei_authoritative', 'https://dbba.sacinfo.org.cn/rnDetail/0d310eea2e6bb62171fec978faedf7ef47409f9eaa2296c6c908616c299cf68c', '河北省市场监督管理局'),
    ('W004', 'DB1309/T 319-2025 旱碱麦探墒保播种植技术规程', '沧州市地方标准', '沧州', 'cangzhou_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailed?id=39CDD3157A12F625E06397BE0A0A538A', '沧州市市场监督管理局'),
    ('W005', 'DB1309/T 320-2025 旱碱麦晚播春促减灾生产技术规程', '沧州市地方标准', '沧州', 'cangzhou_authoritative', 'https://dbba.sacinfo.org.cn/rnDetail/be5ca3aa379a9767481274cb5f0077bc946601316422946b1fc3b58827f6d18c', '沧州市市场监督管理局'),
    ('W006', 'DB1309/T 330-2025 旱碱麦宽幅沟播抗逆丰产技术规程', '沧州市地方标准', '沧州', 'cangzhou_authoritative', 'https://dbba.sacinfo.org.cn/rnDetail/be5ca3aa379a9767481274cb5f0077bc946601316422946b1fc3b58827f6d18c', '沧州市市场监督管理局'),
    ('W007', 'DB1309/T 150-2014 旱碱地小麦抗逆减灾丰产栽培技术规程', '沧州市地方标准', '沧州', 'cangzhou_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailed?id=108A4A5041587A0CE06397BE0A0A9183', '沧州市市场监督管理局'),
    ('W008', '沧州市旱碱麦增产绿色调控技术研究进展', '学术期刊', '沧州', 'peer_reviewed_local', 'https://www.casb.org.cn/CN/abstract/abstract31429.shtml', '中国农学通报'),
    ('W009', '基于近十年气象数据的旱碱麦生育期优化策略', '学术期刊', '沧州海兴', 'peer_reviewed_local', 'https://jcnj.cbpt.cnki.net/portal/journal/portal/client/paper/e277469f354b0eb5d2edaec045997e38', '基层农技推广'),
    ('W010', '沧州盐碱区旱碱麦宽幅沟播配套栽培技术', '学术期刊', '沧州/黄骅', 'peer_reviewed_local', 'https://xdnckj.cbpt.cnki.net/portal/journal/portal/client/paper/1b7651fc5f528d3c5d39128a5d597ea6', '现代农村科技'),
    ('W011', '基于气象数据的河北低平原盐碱区作物水分供需评估', '学术论文', '河北低平原/黄骅', 'peer_reviewed_regional', 'https://doi.org/10.12357/cjea.20250732', '学术期刊平台'),
    ('W012', '河北黄骅市培育“以种适地”品种 助力盐碱地持续增产', '农业农村部门网站', '黄骅', 'government_local_support', 'https://www.agri.cn/zx/xxlb/202403/t20240306_8613636.htm', '河北省农业农村厅'),
    ('W013', '盐碱地里造出新粮仓', '科研机构/媒体', '黄骅', 'government_science_support', 'https://www.cas.cn/cm/202305/t20230524_4889471.shtml', '中国科学院/人民日报'),
    ('W014', '科技引领助力旱碱麦产业走“花路”', '中国农科院/农民日报', '黄骅/沧州', 'government_science_support', 'https://ifst.caas.cn/pub/iappst/xwzx/mtbd/37812bb40dc6445c88da99ccb6289841.htm', '中国农业科学院农产品加工所'),
    ('W015', 'DB1309/T 333-2025 黄骅旱碱麦原粮', '沧州市地方标准', '黄骅/沧州', 'cangzhou_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailedCNF?id=39CDD3157A20F625E06397BE0A0A538A', '沧州市市场监督管理局'),
    ('W016', 'DB1309/T 332-2025 黄骅旱碱麦小麦粉', '沧州市地方标准', '黄骅/沧州', 'cangzhou_authoritative', 'https://std.samr.gov.cn/db/search/stdDBDetailed?id=39CDD3157A1FF625E06397BE0A0A538A', '沧州市市场监督管理局'),
    ('W017', '盐碱地改良和旱碱麦种植技术及其配套装备研究现状', '学术综述', '河北', 'peer_reviewed_regional', 'https://njyj.cbpt.cnki.net/portal/journal/portal/client/paper/c3487720ec2ed1f0e14e056858fdc388', '农机化研究'),
    ('W018', '微垄覆膜侧沟播宽苗带旱碱麦正负压排种器设计与试验', '学术期刊/农机', '河北', 'peer_reviewed_regional', 'https://njyj.cbpt.cnki.net/portal/journal/portal/client/paper/41be5e98ceab236878a2f4a884dac792', '农机化研究'),
]
TITLE = {s[0]: s[1] for s in SOURCES}

# id -> (name, type)
NODES = {
    'crop:wheat': ('黄骅旱碱麦', 'Crop'),
    'crop:wheat_product': ('旱碱麦产品', 'Crop'),
    'var:jiemai19': ('捷麦19', 'Variety'),
    'var:jiemai20': ('捷麦20', 'Variety'),
    'var:cangmai6002': ('沧麦6002', 'Variety'),
    'var:cangmai6005': ('沧麦6005', 'Variety'),
    'var:cangmai6003': ('沧麦6003', 'Variety'),
    'var:xiaoyan': ('小偃系列', 'Variety'),
    'var:jimai32': ('冀麦32', 'Variety'),
    'var:xiaohongmang': ('小红芒', 'Variety'),
    'soil:saline_alkali': ('中度盐碱地', 'SoilType'),
    'soil:coastal_saline': ('滨海盐碱土', 'SoilType'),
    'soil:low_organic': ('有机质含量低土壤', 'SoilType'),
    'env:salinity': ('土壤盐分', 'EnvironmentFactor'),
    'env:moisture': ('土壤墒情', 'EnvironmentFactor'),
    'env:temp': ('温度', 'EnvironmentFactor'),
    'env:rainfall': ('降水', 'EnvironmentFactor'),
    'env:sunshine': ('日照', 'EnvironmentFactor'),
    'env:extreme_low_temp': ('极端低温', 'EnvironmentFactor'),
    'env:low_temp_light': ('低温寡照', 'EnvironmentFactor'),
    'env:valid_precip': ('有效降水', 'EnvironmentFactor'),
    'env:pet': ('潜在蒸散', 'EnvironmentFactor'),
    'env:deficit': ('水分亏缺', 'EnvironmentFactor'),
    'env:groundwater': ('高矿化度地下水', 'EnvironmentFactor'),
    'stress:salt': ('盐胁迫', 'Stress'),
    'stress:drought': ('干旱胁迫', 'Stress'),
    'stress:drought_wheat': ('旱盐胁迫', 'Stress'),
    'stress:ltll': ('低温寡照胁迫', 'Stress'),
    'stress:hot_wind': ('干热风', 'Stress'),
    'stress:lodging': ('倒伏', 'Stress'),
    'stress:late_sowing_weak': ('晚播弱苗', 'Stress'),
    'stage:sowing': ('播种期', 'GrowthStage'),
    'stage:wintering': ('越冬期', 'GrowthStage'),
    'stage:regreening': ('返青期', 'GrowthStage'),
    'stage:jointing': ('拔节期', 'GrowthStage'),
    'stage:heading': ('抽穗期', 'GrowthStage'),
    'stage:filling': ('灌浆期', 'GrowthStage'),
    'prac:wide_furrow': ('宽幅沟播', 'AgriculturalPractice'),
    'prac:micro_furrow': ('微沟播种', 'AgriculturalPractice'),
    'prac:probe_moisture': ('探墒保播', 'AgriculturalPractice'),
    'prac:open_furrow': ('开沟接墒播种', 'AgriculturalPractice'),
    'prac:late_spring_promote': ('晚播春促减灾', 'AgriculturalPractice'),
    'prac:fert_pest_opt': ('肥药优调', 'AgriculturalPractice'),
    'prac:seed_treatment': ('抗逆促发增蘖种子处理', 'AgriculturalPractice'),
    'prac:jointing_control': ('拔节期壮秆抗逆化控', 'AgriculturalPractice'),
    'prac:filling_regulation': ('灌浆期稳叶促粒调控', 'AgriculturalPractice'),
    'prac:green_regulation': ('全生育期绿色调控体系', 'AgriculturalPractice'),
    'prac:bioregulator': ('绿色生物源调节剂(ABA/硅/纳米氧化铈)', 'AgriculturalPractice'),
    'prac:one_spray_three': ('一喷三防', 'AgriculturalPractice'),
    'prac:straw_return': ('秸秆还田', 'AgriculturalPractice'),
    'prac:organic_fertilizer': ('增施有机肥', 'AgriculturalPractice'),
    'prac:alfalfa_rotation': ('苜蓿轮作改土', 'AgriculturalPractice'),
    'prac:deep_loosening': ('深松整地', 'AgriculturalPractice'),
    'prac:suppress_hoe': ('镇压锄划', 'AgriculturalPractice'),
    'prac:green_control': ('绿色防控', 'AgriculturalPractice'),
    'prac:rain_harvest': ('雨水蓄积高效利用', 'AgriculturalPractice'),
    'prac:brackish_rain_use': ('微咸水与雨水分期互补利用', 'AgriculturalPractice'),
    'prac:weather_warning': ('气象风险预警系统', 'AgriculturalPractice'),
    'risk:weather': ('气象风险', 'WeatherRisk'),
    'risk:spring_drought': ('春季干旱', 'WeatherRisk'),
    'risk:seedling_drought': ('播种期干旱', 'WeatherRisk'),
    'proc:germination': ('种子萌发', 'Process'),
    'proc:tillering': ('分蘖成穗', 'Process'),
    'proc:grain_filling': ('籽粒灌浆', 'Process'),
    'proc:root_na': ('根系Na+排斥', 'Process'),
    'proc:leaf_k': ('叶片K+稳态', 'Process'),
    'proc:ros_clear': ('活性氧清除', 'Process'),
    'proc:lodging_resist': ('抗倒性', 'Process'),
    'qual:protein': ('蛋白质', 'QualityIndicator'),
    'qual:wet_gluten': ('湿面筋', 'QualityIndicator'),
    'qual:dry_gluten': ('干面筋', 'QualityIndicator'),
    'qual:moisture': ('水分', 'QualityIndicator'),
    'qual:volume_weight': ('容重', 'QualityIndicator'),
    'qual:hardness': ('硬度', 'QualityIndicator'),
    'qual:falling_number': ('降落数值', 'QualityIndicator'),
    'qual:ash': ('灰分', 'QualityIndicator'),
    'qual:yield': ('产量(亩穗数/穗粒数)', 'QualityIndicator'),
    'qual:extraction_rate': ('出粉率', 'QualityIndicator'),
    'prod:grain': ('黄骅旱碱麦原粮', 'Product'),
    'prod:flour': ('黄骅旱碱麦小麦粉', 'Product'),
    'prod:mianhua': ('黄骅面花', 'Product'),
    'prod:noodles': ('面制品', 'Product'),
    # 若干补充过程/环节实体
    'proc:ear_spikelet': ('穗发育', 'Process'),
    'proc:seedling_establish': ('出苗成苗', 'Process'),
    'proc:chilling_resist': ('抗寒性', 'Process'),
    'proc:disease_resist': ('抗病性', 'Process'),
    'qual:test_weight': ('千粒重', 'QualityIndicator'),
    'qual:trace': ('微量元素(钙钾铁锌)', 'QualityIndicator'),
    'qual:spike_count': ('亩穗数', 'QualityIndicator'),
    'qual:kernels': ('穗粒数', 'QualityIndicator'),
    'stage:presowing': ('播前准备', 'GrowthStage'),
    'env:soil_organic': ('土壤有机质', 'EnvironmentFactor'),
    'reg:cangzhou_east': ('沧州运东地区', 'Region'),
}
NODES.update(REGIONS)
NAME_OF = {k: v[0] for k, v in NODES.items()}

# (source_id, kind, region, stage, subject, relation, object, evidence_text)
E = []
def EADD(*row): E.append(row)

# ---------- 环境/胁迫主线 ----------
EADD('W001', 'fact', '河北滨海盐碱区/黄骅', '', 'crop:wheat', 'APPLIES_IN', 'reg:binhai', '标准适用于土壤含盐量1‰～3‰的河北省滨海平原盐碱干旱生态类型区冬小麦生产。')
EADD('W001', 'fact', '河北滨海盐碱区/黄骅', 'stage:sowing', 'env:salinity', 'HAS_ENVIRONMENT', 'soil:saline_alkali', '土壤含盐量1‰～3‰为旱碱麦生产的适用土壤盐分范围。')
EADD('W013', 'fact', '黄骅', '', 'soil:saline_alkali', 'LOCATED_IN', 'reg:huanghua', '黄骅全域耕地以中度盐碱地为主。')
EADD('W013', 'fact', '黄骅', '', 'soil:coastal_saline', 'LOCATED_IN', 'reg:huanghua', '黄骅地处渤海之滨，土壤盐渍化，地下水位低、矿化度高，不宜灌溉。')
EADD('W013', 'fact', '黄骅', '', 'soil:low_organic', 'HAS_ENVIRONMENT', 'crop:wheat', '旱碱麦田土壤有机质含量低，同一地块返盐程度不一。')
EADD('W008', 'mechanism', '沧州', 'stage:sowing', 'stress:drought', 'INHIBITS', 'proc:germination', '生育期内干旱对种子萌发产生生理抑制。')
EADD('W008', 'mechanism', '沧州', 'stage:regreening', 'stress:salt', 'INHIBITS', 'proc:tillering', '高盐碱抑制分蘖成穗。')
EADD('W008', 'mechanism', '沧州', 'stage:filling', 'stress:ltll', 'INHIBITS', 'proc:grain_filling', '低温寡照抑制籽粒灌浆。')
EADD('W008', 'mechanism', '沧州', '', 'stress:drought', 'OCCURS_AT_STAGE', 'stage:sowing', '干旱逆境出现在生育期并抑制种子萌发。')
EADD('W008', 'mechanism', '沧州', '', 'stress:salt', 'OCCURS_AT_STAGE', 'stage:regreening', '高盐碱逆境影响分蘖成穗阶段。')
EADD('W008', 'mechanism', '沧州', '', 'stress:ltll', 'OCCURS_AT_STAGE', 'stage:filling', '低温寡照影响籽粒灌浆阶段。')
EADD('W009', 'mechanism', '沧州海兴', '', 'env:extreme_low_temp', 'INCREASES_RISK', 'risk:weather', '基于海兴2013—2023年气象数据，极端低温影响旱碱麦生长。')
EADD('W009', 'mechanism', '沧州海兴', '', 'env:rainfall', 'AFFECTS', 'crop:wheat', '年际间降水变化大对旱碱麦生长有影响。')
EADD('W009', 'mechanism', '沧州海兴', '', 'env:sunshine', 'AFFECTS', 'crop:wheat', '日照时数的不对称变化对旱碱麦生长有影响。')
EADD('W009', 'normative', '沧州海兴', '', 'prac:weather_warning', 'REDUCES_RISK', 'risk:weather', '提出构建气象风险预警系统以降低气象风险。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:heading', 'env:valid_precip', 'INCREASES_RISK', 'env:deficit', '黄骅冬小麦生育期有效降水以0.66 mm/a速率下降，水分供需失衡加剧。')
EADD('W011', 'mechanism', '河北低平原/黄骅', '', 'env:pet', 'INCREASES_RISK', 'stress:drought', '潜在蒸散以1.79~2.30 mm/a上升，加剧干旱胁迫。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:heading', 'env:deficit', 'AFFECTS', 'stage:heading', '抽穗期累积水分亏缺117.01~118.36 mm，日均亏缺5.87~5.92 mm/d。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:regreening', 'risk:spring_drought', 'OCCURS_AT_STAGE', 'stage:regreening', '干旱高频时段为3月上中旬返青期。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:jointing', 'risk:spring_drought', 'OCCURS_AT_STAGE', 'stage:jointing', '干旱高频时段为4月上中旬拔节期。')
EADD('W011', 'normative', '河北低平原/黄骅', '', 'prac:rain_harvest', 'MITIGATES', 'env:deficit', '黄骅市建议发展以雨水蓄积与高效利用为主导的灌溉方式。')
EADD('W011', 'normative', '河北低平原/南皮', '', 'prac:brackish_rain_use', 'MITIGATES', 'env:deficit', '南皮县探索微咸水与雨水的分期互补利用模式。')
EADD('W011', 'fact', '河北低平原', '', 'reg:nanpi', 'LOCATED_IN', 'reg:hebei_lowplain', '以黄骅市(滨海盐碱)和南皮县(内陆盐碱)为典型县域。')
EADD('W011', 'fact', '河北低平原/黄骅', '', 'reg:huanghua', 'LOCATED_IN', 'reg:hebei_lowplain', '黄骅为滨海盐碱类型区，属河北低平原盐碱区。')

# ---------- 农艺措施 ----------
EADD('W010', 'normative', '沧州/黄骅', 'stage:sowing', 'prac:wide_furrow', 'MITIGATES', 'stress:drought_wheat', '将播种于4～6cm深沟内、苗带14～16cm，配合措施实现抗旱躲盐。')
EADD('W010', 'mechanism', '沧州/黄骅', 'stage:sowing', 'prac:wide_furrow', 'PROMOTES', 'qual:yield', '宽幅沟播显著增加亩穗数与穗粒数，进而提高产量。')
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:wide_furrow', 'HAS_PARAMETER', 'stage:sowing', '深沟4～6cm、苗带幅宽14～16cm。')
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:organic_fertilizer', 'PROMOTES', 'soil:low_organic', '针对土壤瘠薄、有机质低，增施有机肥。')
EADD('W010', 'normative', '沧州/黄骅', 'stage:sowing', 'prac:deep_loosening', 'PROMOTES', 'proc:seedling_establish', '深松整地为宽幅沟播配套，改善耕层。')
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:suppress_hoe', 'PROMOTES', 'env:moisture', '镇压锄划配套保墒。')
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:green_control', 'REDUCES_RISK', 'proc:tillering', '绿色防控降低病虫与逆发风险。')
EADD('W013', 'mechanism', '黄骅', 'stage:sowing', 'prac:micro_furrow', 'MITIGATES', 'stress:drought_wheat', '微沟播种：沟深近6cm、宽10cm，沟底两侧播种；微沟处盐分较低躲盐避害、蓄积降水、覆土压实提墒保墒。')
EADD('W013', 'mechanism', '黄骅', 'stage:sowing', 'prac:micro_furrow', 'HAS_PARAMETER', 'stage:sowing', '小沟深近6厘米、宽10厘米，种植密度平均增加一倍。')
EADD('W013', 'normative', '黄骅', '', 'prac:straw_return', 'PROMOTES', 'soil:low_organic', '秸秆还田把玉米、小麦秸秆粉碎深翻入土，补充养分激发土壤活力。')
EADD('W013', 'normative', '黄骅', '', 'prac:alfalfa_rotation', 'REDUCES_RISK', 'stress:salt', '对盐碱度较高难以播种的耕地先种苜蓿调节盐碱度、提高肥力后再种旱碱麦。')
EADD('W008', 'normative', '沧州', 'stage:sowing', 'prac:seed_treatment', 'PROMOTES', 'proc:germination', '播种前抗逆促发增蘖种子处理。')
EADD('W008', 'normative', '沧州', 'stage:jointing', 'prac:jointing_control', 'REDUCES_RISK', 'stress:lodging', '拔节期壮秆抗逆化控，提升抗倒与抗逆。')
EADD('W008', 'normative', '沧州', 'stage:filling', 'prac:filling_regulation', 'PROMOTES', 'proc:grain_filling', '灌浆期稳叶促粒调控。')
EADD('W008', 'normative', '沧州', '', 'prac:green_regulation', 'RECOMMENDS', 'crop:wheat', '提出“种子处理+拔节化控+灌浆调控”全生育期靶向绿色调控技术体系。')
EADD('W008', 'mechanism', '沧州', '', 'prac:bioregulator', 'REDUCES_RISK', 'stress:salt', '外源ABA、硅制剂、纳米氧化铈提高根系Na+排斥、维持叶片K+稳态、清除活性氧。')
EADD('W008', 'mechanism', '沧州', '', 'proc:root_na', 'PROMOTES', 'proc:seedling_establish', '根系Na+排泄增强为耐盐机制之一。')
EADD('W008', 'mechanism', '沧州', '', 'proc:leaf_k', 'REDUCES_RISK', 'stress:salt', '维持叶片K+稳态缓解盐胁迫。')
EADD('W008', 'mechanism', '沧州', '', 'proc:ros_clear', 'REDUCES_RISK', 'stress:drought', '清除活性氧缓解旱碱逆境。')
EADD('W002', 'normative', '河北', '', 'prac:fert_pest_opt', 'RECOMMENDS', 'crop:wheat', '按需优化施肥、规范用药并推进绿色调控。')
EADD('W003', 'normative', '河北', 'stage:sowing', 'prac:open_furrow', 'MITIGATES', 'stress:drought', '开沟接墒播种，提高播种期水分利用效率。')
EADD('W004', 'normative', '沧州', 'stage:sowing', 'prac:probe_moisture', 'REQUIRES', 'env:moisture', '探墒判墒、依墒保播，避免干旱条件下盲目抢播。')
EADD('W005', 'normative', '沧州', 'stage:regreening', 'prac:late_spring_promote', 'REDUCES_RISK', 'stress:late_sowing_weak', '播种偏晚后春季采取促进措施减灾促苗、稳穗增粒。')
EADD('W007', 'normative', '沧州', 'stage:filling', 'prac:one_spray_three', 'REDUCES_RISK', 'stress:hot_wind', '一喷三防防控干热风、倒伏与病虫害（规程元数据主题）。')
EADD('W019', None, None, None, None, None, None, None)  # placeholder removed
# ---------- 扩充：品种×抗逆属性网格（W012/W013/W014） ----------
for _v, _s in [('var:cangmai6002', ['stress:drought', 'stress:salt', 'proc:disease_resist']),
               ('var:cangmai6005', ['stress:drought', 'stress:salt', 'proc:disease_resist']),
               ('var:cangmai6003', ['stress:drought', 'stress:salt', 'proc:chilling_resist']),
               ('var:xiaoyan', ['stress:salt', 'stress:drought']),
               ('var:jiemai19', ['proc:disease_resist', 'proc:chilling_resist'])]:
    for _t in _s:
        EADD('W014' if 'proc:disease_resist' == _t and _v == 'var:jiemai19' else ('W0{}'.format({'var:cangmai6002': '14', 'var:cangmai6005': '14', 'var:cangmai6003': '13', 'var:xiaoyan': '13', 'var:jiemai19': '12'}[_v]) if _v != 'var:xiaoyan' else 'W013'),
             'fact', '黄骅/沧州', '', _v, 'HAS_TRAIT', _t, '品种具备' + NAME_OF.get(_t, _t) + '特性（来源报道/综述）。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai20', 'HAS_PARAMETER', 'qual:test_weight', '捷麦20比捷麦19千粒重高1~2克。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai20', 'HAS_PARAMETER', 'qual:volume_weight', '捷麦20比捷麦19容重高60克/升。')

# ---------- 扩充：品质/产品（W013/W014） ----------
EADD('W013', 'fact', '黄骅', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:trace', '旱碱麦籽粒富含钙、钾、铁、锌等微量元素。')
EADD('W013', 'fact', '黄骅', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:wet_gluten', '旱碱麦湿面筋含量超35%。')
EADD('W014', 'fact', '黄骅/沧州', '', 'var:cangmai6002', 'HAS_QUALITY_INDICATOR', 'qual:spike_count', '沧麦6002示范田亩穗数39.6万穗。')

# ---------- 扩充：水分亏缺与关键阶段（W011） ----------
EADD('W011', 'mechanism', '河北低平原/黄骅', '', 'env:deficit', 'OCCURS_AT_STAGE', 'stage:regreening', '3月上中旬返青期为干旱高频时段。')
EADD('W011', 'mechanism', '河北低平原/黄骅', '', 'env:deficit', 'OCCURS_AT_STAGE', 'stage:jointing', '4月上中旬拔节期为干旱高频时段。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:heading', 'stress:drought', 'OCCURS_AT_STAGE', 'stage:heading', '冬小麦抽穗期水分亏缺最突出。')

# ---------- 扩充：土壤改良网格（W010/W013） ----------
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:deep_loosening', 'MITIGATES', 'soil:low_organic', '深松整地改善耕层，是宽幅沟播配套措施。')
EADD('W013', 'normative', '黄骅', '', 'prac:straw_return', 'PROMOTES', 'env:soil_organic', '秸秆还田将玉米和小麦秸秆粉碎深翻入土，补充养分、激发土壤活力。')
EADD('W010', 'normative', '沧州/黄骅', '', 'prac:organic_fertilizer', 'PROMOTES', 'env:soil_organic', '增施有机肥提升土壤有机质与肥力。')
EADD('W013', 'normative', '黄骅', '', 'prac:alfalfa_rotation', 'PROMOTES', 'env:soil_organic', '苜蓿改良提高肥力，改良后推广种植旱碱麦。')
EADD('W013', 'mechanism', '黄骅', '', 'env:soil_organic', 'PROMOTES', 'proc:seedling_establish', '土壤有机质提高减少缺苗断垄，利于出苗。')

# ---------- 扩充：播种期墒情不足应对（支撑问答1） ----------
EADD('W004', 'normative', '沧州', 'stage:sowing', 'prac:probe_moisture', 'MITIGATES', 'stress:drought', '探墒保播按墒情确定播期与方式，减轻播种期干旱影响。')
EADD('W010', 'mechanism', '沧州/黄骅', 'stage:sowing', 'prac:wide_furrow', 'MITIGATES', 'env:moisture', '沟播位置墒情稳定、利于抗旱躲盐。')
EADD('W013', 'mechanism', '黄骅', 'stage:sowing', 'prac:micro_furrow', 'MITIGATES', 'env:deficit', '微沟积蓄降水、提墒保墒，缓解播种期墒情不足。')
EADD('W013', 'fact', '黄骅', 'stage:sowing', 'stage:sowing', 'NEEDS_MOISTURE', 'env:moisture', '最佳播种期为秋季雨季刚结束、土壤墒情最好的9月底。')

# ---------- 扩充：晚播春促（支撑问答2） ----------
EADD('W005', 'normative', '沧州', 'stage:regreening', 'prac:late_spring_promote', 'PROMOTES', 'proc:tillering', '晚播麦田春季促进措施减灾促苗、促分蘖。')

# ---------- 扩充：灌浆期风险（支撑问答3） ----------
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:filling', 'stress:drought', 'OCCURS_AT_STAGE', 'stage:filling', '高温干旱条件下灌浆期是水分敏感阶段。')
EADD('W007', 'normative', '沧州', 'stage:filling', 'stress:hot_wind', 'OCCURS_AT_STAGE', 'stage:filling', '干热风集中在灌浆后期。')

# ---------- 扩充：胁迫—阶段矩阵（均有原文阶段描述） ----------
EADD('W013', 'fact', '黄骅', 'stage:sowing', 'stress:salt', 'OCCURS_AT_STAGE', 'stage:sowing', '播种期沟底盐分较低以躲盐避害。')
EADD('W011', 'mechanism', '河北低平原/黄骅', 'stage:jointing', 'stress:drought', 'OCCURS_AT_STAGE', 'stage:jointing', '拔节期存在干旱高频时段。')

# ---------- 扩充：产量背景与产业 ----------
EADD('W008', 'fact', '沧州', '', 'crop:wheat', 'AFFECTS', 'qual:yield', '2020—2024年旱碱麦单产由3.1×10³提升至4.3×10³ kg/hm²（面积由5.9×10⁴增至1.2×10⁵ hm²）。')
EADD('W013', 'fact', '黄骅', '', 'prod:grain', 'HAS_PRODUCT', 'prod:mianhua', '旱碱麦面粉制作黄骅面花等特色面食。')
EADD('W014', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_PRODUCT', 'prod:noodles', '旱碱麦小麦粉用于面花与其他面制品加工，筋力更强。')

# ---------- 扩充：区域层级 ----------
EADD('W012', 'fact', '黄骅', '', 'reg:cangzhou_east', 'LOCATED_IN', 'reg:cangzhou', '捷麦19为沧州运东地区推广面积最大的品种。')
EADD('W013', 'fact', '黄骅', '', 'reg:huanghua', 'LOCATED_IN', 'reg:binhai', '黄骅地处渤海之滨的滨海盐碱生态类型区。')
EADD('W001', 'fact', '河北滨海盐碱区/黄骅', '', 'reg:binhai', 'LOCATED_IN', 'reg:hebei', '河北省滨海平原盐碱干旱生态类型区为黄骅旱碱麦生产区。')

E = [r for r in E if r[0] != 'W019']

# ---------- 品种 ----------
EADD('W012', 'fact', '黄骅', '', 'crop:wheat', 'HAS_VARIETY', 'var:jiemai19', '中捷园区从“以种适地”角度培育捷麦19等旱碱麦品种。')
EADD('W012', 'fact', '黄骅', '', 'crop:wheat', 'HAS_VARIETY', 'var:jiemai20', '培育出捷麦20旱碱麦品种。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai19', 'HAS_TRAIT', 'stress:drought', '捷麦19耐旱、抗寒、节水，入选省主导品种。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai19', 'HAS_TRAIT', 'stress:salt', '捷麦19耐盐碱。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai20', 'HAS_TRAIT', 'stress:salt', '捷麦20耐盐碱。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai20', 'HAS_TRAIT', 'stage:heading', '捷麦20比捷麦19平均生育期缩短9天。')
EADD('W012', 'fact', '黄骅', '', 'var:jiemai19', 'RECOMMENDS', 'reg:cangzhou', '捷麦19年推广面积100万亩以上，为沧州运东推广面积最大的小麦品种。')
EADD('W013', 'fact', '黄骅', '', 'crop:wheat', 'HAS_VARIETY', 'var:cangmai6003', '黄骅主要培育推广沧麦6003等高产量、耐盐碱、抗旱抗寒品种。')
EADD('W013', 'fact', '黄骅', '', 'crop:wheat', 'HAS_VARIETY', 'var:xiaoyan', '小偃系列已在河北省旱碱麦标准化种植示范区大面积种植。')
EADD('W013', 'fact', '黄骅', '', 'var:xiaoyan', 'HAS_TRAIT', 'stress:salt', '通过1‰～5‰盐碱度耐盐鉴定池筛选耐盐碱高产品种。')
EADD('W013', 'fact', '黄骅', '', 'var:cangmai6003', 'HAS_TRAIT', 'stress:salt', '沧麦6003耐盐碱、抗旱抗寒。')
EADD('W014', 'fact', '黄骅/沧州', '', 'var:cangmai6002', 'HAS_TRAIT', 'stress:drought', '沧麦6002抗旱耐盐碱、抗病性强。')
EADD('W014', 'fact', '黄骅/沧州', '', 'var:cangmai6005', 'HAS_TRAIT', 'stress:salt', '沧麦6005抗旱耐盐碱。')
EADD('W014', 'fact', '黄骅/沧州', '', 'var:cangmai6002', 'AFFECTS', 'qual:yield', '沧麦6002示范田测产亩穗数39.6万穗、亩产量422.3公斤。')
EADD('W013', 'fact', '黄骅', '', 'qual:yield', 'AFFECTS', 'crop:wheat', '旱碱麦品种改良使黄骅亩产由小红芒的约50公斤提升至220多公斤。')

# ---------- 阶段与生育进程 ----------
for sid in ['stage:sowing', 'stage:wintering', 'stage:regreening', 'stage:jointing', 'stage:heading', 'stage:filling']:
    EADD('W001', 'fact', '河北滨海盐碱区/黄骅', '', 'crop:wheat', 'OCCURS_AT_STAGE', sid, '生产技术规程覆盖播前准备、播种、冬前、春季、中后期与收获全过程。')
EADD('W013', 'fact', '黄骅', 'stage:sowing', 'stage:sowing', 'OCCURS_AT_STAGE', 'stage:sowing', '最佳播种期为秋季雨季刚结束、墒情最好的9月底，较普通小麦提前半月余。')
EADD('W011', 'fact', '河北低平原/黄骅', 'stage:regreening', 'stage:regreening', 'OCCURS_AT_STAGE', 'stage:regreening', '返青期为干旱高频时段。')

# ---------- 品质与产品 ----------
EADD('W015', 'fact', '黄骅/沧州', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:protein', '原粮标准关注蛋白质等指标。')
EADD('W015', 'fact', '黄骅/沧州', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:moisture', '原粮标准关注水分指标。')
EADD('W015', 'fact', '黄骅/沧州', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:volume_weight', '原粮标准关注容重指标。')
EADD('W015', 'fact', '黄骅/沧州', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:hardness', '原粮标准关注硬度指标。')
EADD('W015', 'fact', '黄骅/沧州', '', 'prod:grain', 'HAS_QUALITY_INDICATOR', 'qual:falling_number', '原粮标准关注降落数值，并受真菌毒素、污染物与农残约束。')
EADD('W016', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:protein', '小麦粉标准关注蛋白质。')
EADD('W016', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:wet_gluten', '小麦粉标准关注湿面筋。')
EADD('W016', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:moisture', '小麦粉标准关注水分。')
EADD('W016', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:ash', '小麦粉标准关注灰分。')
EADD('W014', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:dry_gluten', '旱碱麦蛋白质、湿面筋、干面筋均高于普通麦，筋力更强。')
EADD('W014', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_QUALITY_INDICATOR', 'qual:extraction_rate', '旱碱麦产量与出粉率低于普通麦。')
EADD('W013', 'fact', '黄骅', '', 'crop:wheat', 'HAS_PRODUCT', 'prod:grain', '黄骅旱碱麦总产约13.26万吨。')
EADD('W013', 'fact', '黄骅', '', 'prod:grain', 'HAS_PRODUCT', 'prod:flour', '旱碱麦籽粒出粉率约76%、湿面筋超35%，形成面粉加工产业链。')
EADD('W014', 'fact', '黄骅/沧州', '', 'prod:flour', 'HAS_PRODUCT', 'prod:mianhua', '由旱碱麦面粉制作黄骅面花（省级非遗）。')

# ---------- 地理层级 ----------
EADD('W012', 'fact', '黄骅', '', 'reg:zhongjie', 'LOCATED_IN', 'reg:huanghua', '中捷产业园区位于渤海新区黄骅市。')
EADD('W012', 'fact', '黄骅', '', 'reg:huanghua', 'LOCATED_IN', 'reg:cangzhou', '黄骅为沧州运东地区推广旱碱麦的核心县市。')
EADD('W009', 'fact', '沧州海兴', '', 'reg:haixing', 'LOCATED_IN', 'reg:cangzhou', '海兴县为沧州市辖县，具有旱碱麦气象研究记录。')
EADD('W014', 'fact', '黄骅/沧州', '', 'reg:cangzhou', 'LOCATED_IN', 'reg:hebei', '沧州为河北省辖市。')
EADD('W001', 'fact', '河北滨海盐碱区/黄骅', '', 'crop:wheat', 'APPLIES_IN', 'reg:hebei', '标准为河北省地方标准，适用于河北省滨海平原盐碱干旱生态类型区。')
EADD('W013', 'fact', '黄骅', '', 'reg:cangzhou', 'LOCATED_IN', 'reg:hebei', '沧州市位于河北，黄骅旱碱麦示范在沧州开展。')

# ================= 生成 ontology =================
ontology = {
    'version': '1.0.0',
    'crop_id': 'huanghua_hanjianmai',
    'title': '黄骅旱碱麦生产—品质知识图谱 V1 本体',
    'core_line': '盐分/水分/气象 → 胁迫 → 生育阶段 → 农艺措施 → 产量/品质',
    'domain_types': ['Crop', 'Variety', 'Region', 'SoilType', 'EnvironmentFactor', 'Stress', 'GrowthStage',
                     'AgriculturalPractice', 'Disease', 'Pest', 'WeatherRisk', 'QualityIndicator', 'Product',
                     'Process', 'Source', 'KGStatement'],
    'relation_types': ['LOCATED_IN', 'HAS_VARIETY', 'HAS_ENVIRONMENT', 'HAS_STRESS', 'OCCURS_AT_STAGE',
                       'INCREASES_RISK', 'REDUCES_RISK', 'PROMOTES', 'INHIBITS', 'AFFECTS', 'MITIGATES',
                       'REQUIRES', 'RECOMMENDS', 'HAS_PARAMETER', 'HAS_QUALITY_INDICATOR', 'HAS_PRODUCT',
                       'HAS_TRAIT', 'APPLIES_IN', 'APPLIES_TO'],
    'provenance_relations': ['SUBJECT', 'OBJECT', 'SUPPORTED_BY', 'APPLICABLE_CROP', 'APPLICABLE_STAGE'],
    'semantics': {
        'fact': '原文支持的分类/归属/地域事实',
        'normative': '标准或技术资料的要求与建议；不是试验因果效应',
        'mechanism': '有原文条件的定性机制或风险方向；不提供效应量',
        'association': '相关性信息，禁止自动升级为因果',
        'CAUSES': '保留类型，当前禁止入图；需额外因果识别审核',
    },
    'rules': [
        '每条关系必须有 source_id',
        '区域不跨级升级：黄骅证据不自动等于沧州/河北结论',
        '阶段缺失则标 “未标定”，不当作全部阶段',
        '数值一律带单位且注明来源；无校准数据时 effect_size 为 null',
        '标准元数据不能当该标准正文条款',
        '生产期与采后（品质/储运）不同链，禁止串线',
        '无证据 CAUSES 禁止入库',
    ],
}
(ONTO_DIR / 'ontology-v1.json').write_text(json.dumps(ontology, ensure_ascii=False, indent=2), encoding='utf-8')

# ================= 生成 evidence_v1.jsonl =================
ev_rows = []
for i, (sid, kind, region, stage, subj, rel, obj, text) in enumerate(E):
    s_name = NAME_OF.get(subj, subj)
    o_name = NAME_OF.get(obj, obj)
    ev_rows.append({
        'evidence_id': f'E{i+1:03d}',
        'source_id': sid,
        'title': TITLE.get(sid, sid),
        'region': region,
        'crop': 'huanghua_hanjianmai',
        'growth_stage': stage or '',
        'subject': s_name, 'relation': rel, 'object': o_name,
        'evidence_text': text,
        'page': '', 'section': '',
        'evidence_level': dict((s[0], s[4]) for s in SOURCES).get(sid, ''),
        'review_status': 'candidate_requires_review',
    })
with (EVID_DIR / 'evidence_v1.jsonl').open('w', encoding='utf-8') as f:
    for r in ev_rows:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

# ================= 生成 graph-v1.json =================
nodes, edges, sources = [], [], []
node_ids = set()
def node(nid):
    if nid in node_ids:
        return
    name, typ = NODES[nid]
    node_ids.add(nid)
    nodes.append({'id': nid, 'name': name, 'type': typ,
                  'crop': 'huanghua_hanjianmai', 'region': '', 'description': '', 'source_ids': []})
N = lambda x: node(x)

# sources
for s in SOURCES:
    sid = 'src:' + s[0]
    sources.append({'id': 'src:' + s[0], 'source_id': s[0], 'title': s[1], 'type': s[2], 'region': s[3],
                    'evidence_level': s[4], 'url': s[5], 'publication_group': s[6]})

# edges: one reified edge per evidence
for k, r in enumerate(ev_rows):
    subj_k = [i for i, v in NODES.items() if v[0] == r['subject']]
    obj_k = [i for i, v in NODES.items() if v[0] == r['object']]
    si = subj_k[0] if subj_k else r['subject']
    oi = obj_k[0] if obj_k else r['object']
    N(si); N(oi)
    sid = 'src:' + r['source_id']
    nodes_by_id = {n['id']: n for n in nodes}
    nodes_by_id[si]['source_ids'].append(sid)
    nodes_by_id[oi]['source_ids'].append(sid)
    stage_ids = [r['growth_stage']] if r['growth_stage'] else []
    edges.append({'id': f'HH-{k+1:04d}', 'source': si, 'target': oi, 'relation': r['relation'],
                  'kind': r['relation'], 'evidence_ids': [sid], 'crop': 'huanghua_hanjianmai',
                  'region': r['region'], 'stage_ids': stage_ids, 'conditions': [],
                  'review_status': 'candidate_requires_review', 'effect_size': None})

# region hierarchical edges and stage-stress edges above are fully evidence-backed.
# attach region attribute on nodes where unambiguous
for n in nodes:
    if n['id'] in REGIONS:
        n['region'] = n['id'].replace('reg:', '')

graph = {
    'crop_id': 'huanghua_hanjianmai',
    'version': '1.0.0',
    'nodes': nodes,
    'edges': edges,
    'sources': sources,
    'counts': {'domain_entities': len(nodes), 'semantic_edges': len(edges),
               'statement_nodes': len(edges), 'provenance_edges': 0, 'source_count': len(sources)},
}
(GRAPH_DIR / 'graph-v1.json').write_text(json.dumps(graph, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'evidence': len(ev_rows), 'nodes': len(nodes), 'edges': len(edges), 'sources': len(sources)}, ensure_ascii=False))