"""运行真实 spot 检索并打印上下文排序前后结果。"""
import json
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pear_diagnosis.context.context import PearDiagnosisContext
from pear_diagnosis.diagnosis.candidate_ranker import PearCandidateRanker
from pear_diagnosis.knowledge.causal_service import PearKnowledgeService


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    service = PearKnowledgeService()
    context = PearDiagnosisContext(organ="leaf")
    result = service.find_candidate_risks("spot")
    candidates = result["candidate_risks"]
    original = deepcopy(candidates)
    ranker = PearCandidateRanker()
    ranked = ranker.rank(candidates, context)
    print(f"真实图谱：{len(service.nodes)} 个节点，{len(service.edges)} 条关系")
    print("测试上下文：" + json.dumps(context.to_dict(), ensure_ascii=False))
    print(f"spot：匹配 {len(result['matched_symptom_nodes'])} 个症状，{len(candidates)} 条候选关系")
    print("\n排序前：")
    for index, item in enumerate(candidates, 1):
        print(f"{index}. {item['candidate_name']} → {item['symptom_name']}"
              f" | {item['region']} | {item['review_status']}")
    print("\n排序后（规则分，不是概率）：")
    for index, item in enumerate(ranked, 1):
        print(f"{index}. {item['candidate_name']} → {item['symptom_name']}")
        print(f"   ranking_score: {item['ranking_score']}")
        print("   ranking_reasons: " + "；".join(item['ranking_reasons']))
        print("   ranking_warnings: " + "；".join(item['ranking_warnings']))
        print("   evidence_ids: " + json.dumps(item['evidence_ids'], ensure_ascii=False))
        print("   conditions: " + json.dumps(item['conditions'], ensure_ascii=False))
        print("   locator: " + str(item['locator']))

    assert candidates == original, "排序不能修改输入"
    assert len(ranked) == len(candidates), "不能删除候选"
    by_edge = {item['edge_id']: item for item in ranked}
    for item in original:
        assert all(by_edge[item['edge_id']][key] == value for key, value in item.items())
    assert all(value is None for key, value in context.to_dict().items() if key != 'organ')
    assert ranked and '叶片' in ranked[0]['symptom_name']

    # 独立规则边界验证；以下合成样本不进入上方真实检索结果。
    sample = deepcopy(original[0])
    sample.update(symptom_name='储藏中果面病斑', region='AU-VIC', review_status='transfer_pending')
    assert ranker.rank([sample], context)[0]['ranking_score'] == -100
    sample.update(symptom_name='叶片斑点', region='泊头市', review_status='source_checked')
    assert ranker.rank([sample], context)[0]['ranking_score'] == 40
    assert ranker.rank([sample], PearDiagnosisContext(organ='leaf', region='泊头市'))[0]['ranking_score'] == 55
    assert ranker.rank([], context) == []
    print("\n验证通过：原候选及证据完整保留、输入未修改、缺失上下文为 None、部位与地区规则符合预期。")
    print("diagnosis: None；候选排名不能视为病害确诊。")


if __name__ == '__main__':
    main()
