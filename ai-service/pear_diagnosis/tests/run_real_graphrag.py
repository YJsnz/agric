"""人工执行的真实 GraphRAG 集成检查；不使用 mock，不由 unittest 收集。"""
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
QUESTION = "泊头鸭梨叶片出现黑色斑点，可能关联哪些风险？请给出证据和不确定性。"


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if not os.environ.get("DEEPSEEK_API_KEY", "").strip():
        raise RuntimeError("DEEPSEEK_API_KEY 未设置，停止真实集成测试")

    from graph_web.server import load_graph
    from graphrag.answer_service import ask_graphrag

    print("[1/2] 正在通过 load_graph() 加载真实图谱……", flush=True)
    graph = load_graph()
    print(f"图谱已加载：{len(graph['nodes'])} 个节点，{len(graph['edges'])} 条关系", flush=True)
    print(f"[2/2] 正在调用真实 ask_graphrag：{QUESTION}", flush=True)
    result = ask_graphrag(QUESTION, graph, top_k=5)
    print(json.dumps(result, ensure_ascii=False, indent=2), flush=True)
    print(f"实际状态：{result.get('status')}；生成层是否调用：{result.get('generation_called')}", flush=True)


if __name__ == "__main__":
    main()
