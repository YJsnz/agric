"""Question purpose and evidence scope. Reading a paper is not local advice."""
import re

STAGES = {'贮藏期': '储藏期', '果实贮藏期': '储藏期',
          '果实储藏期': '储藏期', '膨大期': '果实膨大期', '开花期': '花期'}


def stage_name(value):
    return STAGES.get(value, value)


def route_question(question):
    titles = list(dict.fromkeys(re.findall(r'《([^》]+)》', question)))
    body=re.sub(r'《[^》]+》','',question)
    local_advice = bool(re.search(r'我家|我的|我们(?:的|当地)|本地|当地|能否.*(?:用|采用)|能.*用在|适用.*(?:泊头|沧州)|(?:泊头|沧州).*(?:可|能|适用|应该|建议)|在.*(?:怎么|如何).*(?:用药|施肥|种植|处理)', body))
    if not local_advice and (titles or re.search(r'论文中|文献中|研究中|试验中|实验中', question)):
        return {'purpose': 'literature', 'mode': 'research', 'titles': titles,
                'notice': '仅解释论文特定试验，不转为当地生产建议。'}
    if local_advice or re.search(r'泊头|沧州|河北|用药|施肥|应该怎么|如何防治', question):
        return {'purpose': 'local_advice', 'mode': 'strict', 'titles': titles,
                'notice': '当地建议要求适用性明确；未知资料只作研究参考。'}
    return {'purpose': 'general', 'mode': 'research', 'titles': titles,
            'notice': '一般知识解释；未知适用范围必须标明，不作为当地操作指导。'}


def effective_context(mentions, canonical, policy):
    if policy.get('purpose') == 'literature':
        return {}
    return {k: stage_name(canonical.get(k) or mentions.get(k)) if k == 'stage' else canonical.get(k) or mentions.get(k)
            for k in ('crop', 'region', 'stage') if mentions.get(k)}


def title_matches(title, policy):
    def normalize(s):
        return ''.join(s.casefold().split())
    return not policy.get('titles') or normalize(title) in {normalize(t) for t in policy['titles']}


def transition_target(edge, stage, nodes):
    """Only explicit, reviewed temporal annotations can advance the path state.

    stage_ids alone never establish temporal order or justify a transition.
    """
    if not stage or not edge.get('transition_locator') or not edge.get('transition_evidence_ids'):
        return None
    if not set(edge['transition_evidence_ids']) <= set(edge.get('evidence_ids', [])):
        return None
    if edge.get('review_status') not in ('source_checked', 'local_expert_reviewed'):
        return None
    def name(value):
        known={i:n for i,n in nodes.items() if n.get('type') in ('Stage','GrowthStage')}
        if value in known:return stage_name(known[value]['name'])
        return next((stage_name(n['name']) for n in known.values() if stage_name(n['name'])==stage_name(value)),None)
    origin, target = name(edge.get('from_stage')), name(edge.get('to_stage'))
    declared={name(i) for i in edge.get('stage_ids',[])}
    return target if origin == stage_name(stage) and target and {origin,target}<=declared else None
