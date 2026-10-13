"""针对明确叶片症状排除仅讨论果实/采后的文档，不猜测生育期。"""
import re

LEAF = re.compile(r'叶片|叶子|梨叶|叶面|叶背|叶缘|叶脉|叶部|叶斑|卷叶')
FRUIT = re.compile(r'果实|果面|果皮|果肉|果心|黑心病|虎皮病')
POSTHARVEST = re.compile(r'采后|储藏|贮藏|冷藏|货架')


def normalize_leaf_question(question):
    """Narrow, disclosed typo repair; never infer a disease or location."""
    corrected = re.sub(r'梨页(?=.{0,8}(?:斑|发黄|卷|枯|虫))', '梨叶', question)
    corrected = corrected.replace('叶子', '叶片')
    corrected = re.sub(r'梨叶(?!片|面|背|缘|脉|部|斑)', '梨叶片', corrected)
    return corrected


def document_symptom_warnings(chunk, symptoms):
    # 仅依据症状实体，而不是从完整提示词中的否定示例推断部位。
    if not symptoms or not any(LEAF.search(s) for s in symptoms):
        return []
    if any(FRUIT.search(s) for s in symptoms):
        return []  # 同时询问叶与果时，不应用仅叶片规则。
    # 参考文献中的叶片论文标题不能使果实研究变成叶片症状证据。
    body = re.sub(r'\[\d+\][^\[]*\[J\][^\[]*', '', str(chunk.get('text') or ''))
    text = '\n'.join((str(chunk.get('title') or ''), str(chunk.get('section') or ''), body))
    if LEAF.search(text):
        return []
    stages = chunk.get('applicable_stages') or []
    if isinstance(stages, str):
        stages = [stages]
    if FRUIT.search(text) or POSTHARVEST.search(text) or any(POSTHARVEST.search(s) for s in stages):
        return ['organ:mismatch:leaf_query_vs_fruit_or_postharvest_only']
    return []
