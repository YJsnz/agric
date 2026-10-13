"""Candidate assessment contract; does not change evidence admission or validators."""
import json
import re
from pydantic import BaseModel, ConfigDict, Field
from .entity_extractor import ExtractionError


class CandidateAssessment(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    candidate_name: str = Field(min_length=1, max_length=120)
    assessment: str = Field(min_length=1, max_length=900)
    evidence_ids: list[str] = Field(min_length=1, max_length=10)


INSTRUCTION = '''
本轮任务是“证据支持的初步候选研判”，不是本地结论。即使缺少本地直接证据，
也应解释已提供的通用/河北证据支持什么候选、还缺什么。sufficient必须为false。
沿用原JSON字段，并增加candidate_assessments数组，每项结构为：
{"candidate_name":"仅从diagnosis_context.candidate_ranking中选择",
 "assessment":"只说可能、候选、相关风险；每项事实必须带[E编号]",
 "evidence_ids":["对应正文的E编号"]}。
conclusion：有引用的初步研判摘要，不要只写证据不足。
basis：有引用的通用症状/机理支持点；不能将文献的一般症状声称为图片已观察到的细节。
reasoning：尚不能排除的情况、适用范围、未知的环境与阶段；不补造数据。
advice：只建议核验叶片正反面、补充实际环境/生育期或请农技人员复核。
不提供农药名称、剂量、施药周期，不作生产操作推荐。
candidate_assessments只容纳被本次证据正文支持的候选，不能仅引用candidate_ranking。
没有引用支持的候选不要加入此数组，系统会在视觉/KG候选中另行保留。
每个候选assessment都必须在正文包含与evidence_ids完全相同的[E编号]引用。
citations包含四个正文字段与candidate_assessments使用的全部编号，不得造编号。
避免在生成正文使用“确诊”“确定为”“就是”这些词；用“不构成本地疾病结论”说明边界。
不要输出疾病概率、百分比；不重复YOLO数值或ranking_score数值。
general_authoritative/hebei_verified仅支持其明确范围，不能描述为泊头本地已验证。
transfer_pending不等于经过审核的迁移证据；不得用未准入或rejected证据支撑任何事实。
若没有任何证据支持候选，则candidate_assessments=[]，不为满足格式添加病名。
'''


def defaults():
    return {'preliminary_assessment': {'available': False, 'summary': '', 'candidate_risks': [],
                                     'supporting_points': [], 'uncertainties': []},
            'local_conclusion': {'available': False, 'reason': '尚无经过本地结论核验的输出。'},
            'recommended_observations': [], 'citations': [], 'grounding': None}


def partition(candidates, rejected):
    local, assessment, other = [], [], list(rejected)
    for c in candidates:
        scope = c.get('evidence_scope') or {}
        roles = set(scope.get('allowed_uses', []))
        if c['kind'] == 'graph_path' and c.get('evidence_fusion', {}).get('accepted'):
            # These already passed the unchanged local path admission gate.
            local.append(c['candidate_id'])
        elif 'local_advice' in roles and scope.get('status') in ('local_verified', 'hebei_verified'):
            local.append(c['candidate_id'])
        if 'candidate_explanation' in roles and scope.get('status') in ('local_verified', 'hebei_verified', 'general_authoritative'):
            assessment.append(c['candidate_id'])
        elif c['candidate_id'] not in local:
            other.append({'candidate_id': c['candidate_id'], 'reasons': ['background_only:not_candidate_assessment']})
    return {'local_conclusion_evidence': local, 'candidate_assessment_evidence': assessment,
            'rejected_evidence': other}


def refs(text):
    return set(re.findall(r'\[(E\d+)\]', text))


def project(draft, evidence, diagnosis_context):
    """Include every structured claim in the original four-field audit input."""
    allowed = {e['evidence_id'] for e in evidence}
    names = {c.get('candidate_name') for c in diagnosis_context.get('candidate_ranking', [])}
    output = draft.model_copy(deep=True)
    output.sufficient = False  # Preliminary usefulness never means local sufficiency.
    for c in draft.candidate_assessments:
        if c.candidate_name not in names:
            raise ExtractionError('初步研判包含不在真实KG候选中的实体')
        if refs(c.assessment) != set(c.evidence_ids) or not set(c.evidence_ids) <= allowed:
            raise ExtractionError('候选研判缺少对应正文引用或含未知证据编号')
        # Exact KG name must be present in cited evidence, not just in user context.
        if not any(c.candidate_name in json.dumps(e['content'],ensure_ascii=False)
                   for e in evidence if e['evidence_id'] in c.evidence_ids):
            raise ExtractionError('候选病名未出现在所引证据中，仅保留为视觉/KG候选')
        output.basis += '\n' + c.candidate_name + '（候选）：' + c.assessment
    if draft.candidate_assessments and (not refs(draft.conclusion) or not refs(draft.basis)):
        raise ExtractionError('初步研判摘要与支持点必须各自附引用')
    text='\n'.join(getattr(output,k) for k in ('conclusion','basis','reasoning','advice'))
    # Explicit disclaimers are not positive disease assertions. Remove only
    # narrow negated phrases; a later positive claim is still checked below.
    text=re.sub(r'(?:不能|无法|尚不能|尚无法|不可|未能|并非|不是|不构成)(?:据此|直接|仅凭图像|进行|作出|视为|作为)*确诊', '', text)
    if re.search(r'确诊|确定为|就是|\d\s*[%％]|\d+\s*天.{0,8}(喷|施)|倍液',text):
        raise ExtractionError('初步研判出现确定性措辞或不允许的数值用药表达')
    if not refs(text) <= set(draft.citations):
        raise ExtractionError('结构化初步研判的引用未列入citations')
    return output


def publish(answer, draft, evidence, audit):
    if not audit or not audit.get('passed') or not draft.candidate_assessments:
        return defaults()
    by_id = {e['evidence_id']: e for e in evidence}
    risks = []
    for item in draft.candidate_assessments:
        risks.append({**item.model_dump(), 'applicability':[
            {'evidence_id':i,'scope':by_id[i].get('evidence_scope')} for i in item.evidence_ids]})
    return {'preliminary_assessment': {'available':True,'summary':answer.conclusion,
                'candidate_risks':risks,
                'supporting_points':[{'text':draft.basis,'evidence_ids':sorted(refs(draft.basis))}],
                'uncertainties':[answer.reasoning],
                'scope_notice':'初步候选研判，不构成本地疾病结论。'},
            'local_conclusion':{'available':False,'reason':'候选解释证据不能替代经核验的本地疾病结论及本地防治依据。'},
            'recommended_observations':[answer.advice],
            'citations':sorted(refs('\n'.join(getattr(answer,k) for k in ('conclusion','basis','reasoning','advice')))),
            'grounding':audit}
