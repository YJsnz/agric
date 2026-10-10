import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.entity_aligner import align_entities

class AlignmentTests(unittest.TestCase):
    def setUp(self):
        self.graph = {'nodes': [{'id': 'd1', 'name': '梨黑星病', 'type': 'Disease', 'aliases': ['黑星病']}]}

    def align(self, mentions):
        return align_entities({'disease': mentions, 'intent': 'risk_analysis'}, self.graph)

    def test_all_requested_aliases(self):
        result = self.align(['梨黑星病', '鸭梨黑星', '黑星', '梨树黑星病', '黑星病'])
        self.assertEqual(result['entity_ids'], ['d1'])
        self.assertEqual(result['canonical_entities']['disease'], ['梨黑星病'])
        self.assertTrue(all(r['status'] == 'matched' for r in result['alignments']))

    def test_unknown_not_fuzzy_matched(self):
        result = self.align(['黑心病'])
        self.assertEqual(result['entity_ids'], [])
        self.assertTrue(result['requires_clarification'])

    def test_ambiguity_not_guessed(self):
        self.graph['nodes'].append({'id': 'd2', 'name': '其他黑星病', 'type': 'Disease', 'aliases': ['黑星']})
        result = self.align(['黑星'])
        self.assertEqual(result['alignments'][0]['status'], 'ambiguous')
        self.assertEqual(result['entity_ids'], [])

    def test_type_constraint_and_missing_target(self):
        self.graph['nodes'][0]['type'] = 'PreventionMeasure'
        self.assertEqual(self.align(['梨黑星病'])['entity_ids'], [])
        self.graph['nodes'] = []
        self.assertEqual(self.align(['黑星'])['entity_ids'], [])

    def test_normalization(self):
        self.assertEqual(self.align([' 梨黑星病 '])['entity_ids'], ['d1'])

if __name__ == '__main__':
    unittest.main()
