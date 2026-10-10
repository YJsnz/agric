"""Observation workflow, not a disease differential or a treatment rulebook.

Questions collect user observations only. No symptom-to-cause rules are asserted
as expert-reviewed, and no prescriptions are produced from classifier labels.
"""

QUESTIONS = [
    ('leaf_position', '异常先出现在什么部位？', [('lower', '下部老叶'), ('upper', '上部叶片'), ('both', '上下部都有'), ('unknown', '不清楚')]),
    ('field_distribution', '田间异常如何分布？', [('scattered', '零散植株'), ('patches', '局部成片'), ('widespread', '大范围出现'), ('unknown', '不清楚')]),
    ('recent_operations', '近期是否施药、施肥或灌溉？请记录时间；没有则填“无”。', []),
    ('progression', '与上次观察相比，异常是否扩展？', [('stable', '未见明显扩展'), ('spreading', '正在扩展'), ('unknown', '尚不清楚')]),
]


def build_decision_support(observations, context, enriched):
    leaf = observations.get('leaf')
    abnormal = leaf and leaf['class'] != 'healthy'
    questions = [{'id': key, 'text': text, 'options': [{'value': v, 'label': label} for v, label in options]}
                 for key, text, options in QUESTIONS if abnormal and not context.get(key)][:3]
    observed = {key: context[key] for key, _, _ in QUESTIONS if context.get(key)}
    immediate = []
    if leaf:
        immediate.append('给本次观察标记地块和日期，补拍同一植株叶片正反面及周围植株，保留原图。')
    if abnormal:
        immediate.append('复查同一标记植株，记录异常是否扩展；不要仅用两张照片的颜色差异判断病情变化。')
    if observations.get('canopy'):
        immediate.append('记录同一地块实测土壤水分、测量深度、单位和时间，再结合生育期核验；冠层分数不能单独决定灌溉。')
    if observations.get('head'):
        immediate.append('逐一核对检测框中的漏检和重复；没有样方面积标定时，只记录图中数量，不换算亩穗数或产量。')
    professional = ['具体病因及药剂、剂量需要适用资料与现场核验，当前视觉分类不作为处方。'] if abnormal else []
    if abnormal and (context.get('progression') == 'spreading' or context.get('field_distribution') == 'widespread'):
        professional.insert(0, '你记录了异常扩展或大范围出现：请携带图片和操作记录联系当地植保人员现场检查。此提示不代表已判断严重程度或病因。')
    return {'workflow_version': 'observation_v1', 'rule_scope': '信息采集与复查流程，非专家审核的病因鉴别规则',
            'questions': questions, 'user_observations': observed,
            'immediate_actions': immediate,
            'conditional_actions': [],
            'conditional_action_gap': '尚未建立审核过的“病因—适用条件—措施”规则；本轮不自动生成施药、施肥或灌溉处方。',
            'professional_checks': professional,
            'next_step': '请补充下列观察后继续研判。' if questions else '可保存本轮地块记录，复查时并排比较图片与操作记录。'}
