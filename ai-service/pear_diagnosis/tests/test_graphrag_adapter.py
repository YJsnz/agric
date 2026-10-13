"""仅 mock 外部调用，不访问 Neo4j 或 LLM。"""
from copy import deepcopy
from pathlib import Path
import sys
from types import ModuleType
import unittest
from unittest.mock import Mock, patch

from pear_diagnosis.context.context import PearDiagnosisContext
from pear_diagnosis.rag.query_builder import build_diagnosis_query, context_to_dict
from pear_diagnosis.rag.graphrag_adapter import run_pear_graphrag


class GraphRAGAdapterTests(unittest.TestCase):
    def setUp(self):
        self.vision = {"symptom": "spot", "confidence": 0.91}
        self.context = PearDiagnosisContext(organ="leaf")
        self.ranking = [{
            "candidate_name": "梨黑星病", "ranking_score": -75,
            "region": "US-CA", "review_status": "transfer_pending",
            "evidence_ids": ["uc_pear_scab"], "conditions": ["仅限原资料适用范围"],
            "locator": "Symptoms and Signs / Damage",
            "ranking_reasons": ["果面症状降权"], "ranking_warnings": ["异地证据待审核"],
        }]

    def test_spot_is_not_diagnosis(self):
        query = build_diagnosis_query(self.vision, self.context, self.ranking)
        self.assertNotIn("确诊梨黑星病", query)
        self.assertIn("spot 仅表示叶斑症状", query)
        self.assertIn("不进行疾病确诊", query)

    def test_missing_context_stays_unknown(self):
        query = build_diagnosis_query(self.vision, None, [])
        for place in ("泊头", "沧州", "河北"):
            self.assertNotIn(place, query)
        self.assertTrue(all(value is None for value in context_to_dict(None).values()))
        self.assertIn('"region": null', query)
        self.assertIsNone(context_to_dict({"organ": "leaf"})["crop"])

    def test_rule_scores_are_not_probabilities(self):
        query = build_diagnosis_query(self.vision, self.context, self.ranking)
        self.assertIn('"ranking_score": -75', query)
        self.assertIn("不是疾病概率或确诊概率", query)
        self.assertNotIn("-75%", query)

    def test_foreign_evidence_and_required_answer_sections(self):
        query = build_diagnosis_query(self.vision, self.context, self.ranking)
        for text in ("transfer_pending 表示迁移待审核", "不能描述为本地已验证结论",
                     "可能关联风险", "支持证据", "不确定性", "还需要补充什么信息", "下一步措施",
                     "uc_pear_scab", "Symptoms and Signs / Damage"):
            self.assertIn(text, query)

    def test_calls_existing_services_and_preserves_inputs(self):
        original = deepcopy((self.vision, self.context, self.ranking))
        graph = {"nodes": [], "edges": []}
        answer = {"status": "needs_clarification", "answer": "请补充地区"}
        with patch("graph_web.server.load_graph", return_value=graph) as load, \
             patch("graphrag.answer_service.ask_graphrag", return_value=answer) as ask, \
             patch.dict(sys.modules, {"server": None}):
            result = run_pear_graphrag(self.vision, self.context, self.ranking, top_k=3)
        load.assert_called_once_with()
        ask.assert_called_once_with(result["query"], graph, top_k=3,
                                    diagnosis_context=result['diagnosis_context'])
        self.assertLessEqual(len(result['query']), 500)
        self.assertEqual(result["vision"], self.vision)
        self.assertEqual(result["context"], self.context.to_dict())
        self.assertEqual(result["candidate_ranking"], self.ranking)
        self.assertEqual(result["graphrag"], answer)
        self.assertEqual((self.vision, self.context, self.ranking), original)
        result["candidate_ranking"][0]["evidence_ids"].clear()
        self.assertEqual(self.ranking, original[2])

    def test_reuses_main_style_server_import(self):
        server = ModuleType("server")
        server.__file__ = str(Path(__file__).resolve().parents[2] / "graph_web" / "server.py")
        server.load_graph = Mock(return_value={"nodes": []})
        with patch.dict(sys.modules, {"server": server}), \
             patch("graph_web.server.load_graph") as other_load, \
             patch("graphrag.answer_service.ask_graphrag", return_value={}) as ask:
            run_pear_graphrag(self.vision, None, [])
        server.load_graph.assert_called_once_with()
        other_load.assert_not_called()
        self.assertEqual(ask.call_args.kwargs["top_k"], 5)

    def test_loader_error_is_not_hidden(self):
        with patch.dict(sys.modules, {"server": None}), \
             patch("graph_web.server.load_graph", side_effect=RuntimeError("database unavailable")), \
             patch("graphrag.answer_service.ask_graphrag") as ask:
            with self.assertRaisesRegex(RuntimeError, "database unavailable"):
                run_pear_graphrag(self.vision, None, [])
        ask.assert_not_called()

    def test_invalid_top_k(self):
        for value in (0, -1, True, 2.5):
            with self.subTest(value=value), self.assertRaises(ValueError):
                run_pear_graphrag(self.vision, None, [], top_k=value)


if __name__ == "__main__":
    unittest.main()
