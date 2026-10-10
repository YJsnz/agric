"""真实 V2 图谱上的症状候选检索；不推断因果效应或疾病确诊。"""
import json
from pathlib import Path

from knowledge_graph.query_v2 import select_edges
from pear_diagnosis.knowledge.entity_mapping import map_visual_result

BASE_DIR = Path(__file__).resolve().parents[2]
GRAPH_PATH = BASE_DIR / "knowledge_graph" / "data" / "graph-v2.json"
RISK_TYPES = {"Disease", "Pest", "PhysiologicalDisorder"}


class PearKnowledgeService:
    def __init__(self, graph_path: str | Path = GRAPH_PATH):
        self.graph_path = Path(graph_path).expanduser().resolve()
        with self.graph_path.open(encoding="utf-8") as file:
            self.graph = json.load(file)
        self.nodes = self.graph["nodes"]
        self.edges = self.graph["edges"]
        self.node_by_id = {node["id"]: node for node in self.nodes}

    def find_candidate_risks(self, symptom: str, filters: dict | None = None) -> dict:
        """按症状名称/别名词面检索，仅返回已有的正向 HAS_SYMPTOM。

        默认查看全库；传入 filters 时沿用 query_v2 的适用范围过滤。
        词面命中不等于部位或地区适用，返回原始条件供后续核对。
        """
        mapping = map_visual_result(symptom)
        terms = mapping["search_terms"]
        symptom_nodes = [
            node for node in self.nodes
            if node.get("type") == "Symptom" and any(
                term in text
                for text in [node.get("name", ""), *node.get("aliases", [])]
                for term in terms
            )
        ]
        symptom_ids = {node["id"] for node in symptom_nodes}
        edges = self.edges if filters is None else select_edges(self.graph, filters)
        candidates = []
        for edge in edges:
            if edge.get("relation") != "HAS_SYMPTOM" or edge.get("target") not in symptom_ids:
                continue
            source = self.node_by_id.get(edge.get("source"))
            target = self.node_by_id.get(edge.get("target"))
            if not source or not target or source.get("type") not in RISK_TYPES:
                continue
            candidates.append({
                "candidate_id": source["id"],
                "candidate_name": source.get("name"),
                "candidate_type": source.get("type"),
                "symptom_id": target["id"],
                "symptom_name": target.get("name"),
                "edge_id": edge.get("id"),
                "relation": edge.get("relation"),
                "kind": edge.get("kind"),
                "region": edge.get("region"),
                "review_status": edge.get("review_status"),
                "evidence_ids": edge.get("evidence_ids", []),
                "crop": edge.get("crop"),
                "stage_ids": edge.get("stage_ids", []),
                "conditions": edge.get("conditions", []),
                "locator": edge.get("locator"),
            })
        return {
            "visual_mapping": mapping,
            "matched_symptom_nodes": symptom_nodes,
            "candidate_risks": candidates,
            "diagnosis": None,
            "warning": (
                "候选风险来自知识图谱中已有的 HAS_SYMPTOM 关系，仅用于候选检索，"
                "不能视为病害确诊。词面匹配不代表部位一致；须核对地区、阶段和证据适用条件。"
            ),
        }
