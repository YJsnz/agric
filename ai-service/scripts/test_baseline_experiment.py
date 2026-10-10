import json
import unittest
from baseline_experiment import QA, select_questions, retrieval_metrics, entity_recall, validate_judge


class BaselineTests(unittest.TestCase):
    def test_frozen_selection_and_minorities(self):
        rows = [json.loads(s) for s in QA.read_text(encoding='utf-8').splitlines()]
        sample = select_questions(rows)
        self.assertEqual(len(sample), 64)
        self.assertEqual(len({r['id'] for r in sample}), 64)
        self.assertEqual({r['id'] for r in rows if r['type'] != 'factual'},
                         {r['id'] for r in sample if r['type'] != 'factual'})
        self.assertEqual([r['id'] for r in sample], [r['id'] for r in select_questions(list(reversed(rows)))])

    def test_path_source_is_not_exact_chunk_relevance(self):
        row = {'evidence': {'chunk_id': 'C1'}}
        candidates = [{'kind': 'graph_path', 'candidate_id': 'path:C1'},
                      {'kind': 'document_chunk', 'chunk': {'chunk_id': 'C1'}}]
        self.assertEqual(retrieval_metrics(row, candidates, 1), {'recall': 0, 'mrr': 0})
        self.assertEqual(retrieval_metrics(row, candidates, 5), {'recall': 1, 'mrr': .5})
        self.assertEqual(retrieval_metrics(row, [], 5), {'recall': 0, 'mrr': 0})

    def test_entity_metric_is_set_based_and_empty_is_na(self):
        self.assertEqual(entity_recall({'gold_entities': ['鸭梨', '鸭梨', '黑星病']}, '鸭梨'), .5)
        self.assertIsNone(entity_recall({'gold_entities': []}, ''))

    def test_judge_rejects_unknown_labels(self):
        with self.assertRaises(ValueError):
            validate_judge({'correctness': 'excellent', 'reason': '', 'claims': []})
        with self.assertRaises(ValueError):
            validate_judge({'correctness': 'correct', 'reason': '', 'claims': [{'claim':'x','status':'probably'}]})


if __name__ == '__main__':
    unittest.main()
