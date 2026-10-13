"""独立运行真实图谱查询：python scripts/test_pear_knowledge.py [spot] [--json]。"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pear_diagnosis.knowledge.causal_service import PearKnowledgeService


def main():
    parser = argparse.ArgumentParser(description="Vision → KG 真实候选检索")
    parser.add_argument("symptom", nargs="?", default="spot")
    parser.add_argument("--json", action="store_true", help="输出完整 JSON")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    service = PearKnowledgeService()
    result = service.find_candidate_risks(args.symptom)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print(f"知识图谱加载成功\n节点：{len(service.nodes)}，关系：{len(service.edges)}")
    print("\n========== Vision → KG ==========")
    print("视觉标签：", result["visual_mapping"]["visual_class"])
    print("视觉语义：", result["visual_mapping"]["visual_label"])
    print("\n匹配到的症状节点：")
    for node in result["matched_symptom_nodes"]:
        print(f"- {node['name']} [{node['id']}]")
    if not result["matched_symptom_nodes"]:
        print("空：当前检索词未命中症状节点。")
    print("\n候选风险（按证据关系列出，同一风险可能出现多次）：")
    for candidate in result["candidate_risks"]:
        print(f"- {candidate['candidate_name']} [{candidate['candidate_type']}]"
              f" --{candidate['relation']}--> {candidate['symptom_name']}")
        print(f"  地区：{candidate['region']}；审核：{candidate['review_status']}；"
              f"证据：{', '.join(candidate['evidence_ids'])}")
    if not result["candidate_risks"]:
        print("空：没有匹配的已有 HAS_SYMPTOM 关系，不补造关系。")
    print(f"\n{result['warning']}")


if __name__ == "__main__":
    main()
