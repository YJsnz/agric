"""视觉标签到检索词的映射，不是疾病诊断映射。"""
from copy import deepcopy

VISION_ENTITY_MAPPING = {
    "spot": {
        "visual_label": "叶斑症状",
        "entity_type": "Symptom",
        "search_terms": ["叶斑", "斑点", "病斑", "褐斑", "黑斑"],
        "can_diagnose_disease": False,
    },
    "curl": {
        "visual_label": "卷叶症状",
        "entity_type": "Symptom",
        "search_terms": ["卷叶", "卷曲", "叶片卷曲"],
        "can_diagnose_disease": False,
    },
    "slug": {
        "visual_label": "虫害损伤",
        "entity_type": "Symptom",
        "search_terms": ["虫害", "虫伤", "取食", "啃食", "叶片受害"],
        "can_diagnose_disease": False,
    },
    "healthy": {
        "visual_label": "未见明显异常症状",
        "entity_type": None,
        "search_terms": [],
        "can_diagnose_disease": False,
    },
}


def map_visual_result(symptom: str) -> dict:
    """返回独立的检索语义副本；未知标签不进行猜测。"""
    mapping = VISION_ENTITY_MAPPING.get(symptom)
    if mapping is None:
        return {
            "visual_class": symptom,
            "visual_label": symptom,
            "entity_type": None,
            "search_terms": [],
            "can_diagnose_disease": False,
        }
    return {"visual_class": symptom, **deepcopy(mapping)}
