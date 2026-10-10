"""现有 GraphRAG 的薄适配层；不启动 API，不改动原有检索逻辑。"""
from copy import deepcopy
from pathlib import Path
import sys

from pear_diagnosis.rag.query_builder import build_retrieval_query, context_to_dict


def run_pear_graphrag(vision_result, context, ranked_candidates, top_k=5):
    if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
        raise ValueError("top_k 必须为正整数")
    vision = deepcopy(vision_result)
    context_data = deepcopy(context_to_dict(context))
    ranking = deepcopy(ranked_candidates)
    question = build_retrieval_query(vision, context_data, ranking)
    diagnosis_context = {'vision': vision, 'context': context_data, 'candidate_ranking': ranking}
    from pear_diagnosis.knowledge.causal_service import PearKnowledgeService
    visual = vision.get('vision', vision)
    knowledge = PearKnowledgeService().find_candidate_risks(visual.get('symptom', ''))
    diagnosis_context['matched_symptom_nodes'] = knowledge['matched_symptom_nodes']

    # 延迟导入，构建查询不依赖数据库/生成服务。正式入口可能已用顶层
    # server 名称加载该文件，优先复用；独立运行则使用包路径，避免 import api。
    from graphrag.answer_service import ask_graphrag

    existing = sys.modules.get("server")
    expected = Path(__file__).resolve().parents[2] / "graph_web" / "server.py"
    if existing is not None and Path(getattr(existing, "__file__", "") or "").resolve() == expected:
        load_graph = existing.load_graph
    else:
        from graph_web.server import load_graph

    graph = load_graph()
    answer = ask_graphrag(question, graph, top_k=top_k, diagnosis_context=diagnosis_context)
    return {
        "query": question,
        "retrieval_query": question,
        "diagnosis_context": diagnosis_context,
        "vision": vision,
        "context": context_data,
        "candidate_ranking": ranking,
        "graphrag": answer,
    }
