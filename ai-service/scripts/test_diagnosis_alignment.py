import json
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

from graphrag.entity_aligner import align_entities, apply_diagnosis_entities
from graphrag.dual_retriever import retrieve_dual
from pear_diagnosis.knowledge.causal_service import PearKnowledgeService

ROOT = Path(__file__).resolve().parents[1]


class DiagnosisAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.graph = json.loads((ROOT / 'knowledge_graph/data/graph-v2.json').read_text(encoding='utf-8'))
        knowledge = PearKnowledgeService().find_candidate_risks('spot')
        self.diagnosis = {'context': {'crop': '泊头鸭梨', 'region': '河北省沧州市泊头市', 'organ': 'leaf'},
                          'candidate_ranking': knowledge['candidate_risks'],
                          'matched_symptom_nodes': knowledge['matched_symptom_nodes']}

    def align(self, mentions):
        return align_entities(apply_diagnosis_entities(mentions, self.graph, self.diagnosis), self.graph)

    def test_none_region_not_inferred(self):
        self.diagnosis['context']['region'] = None
        result = self.align({'region': '泊头市'})
        self.assertIsNone(result['canonical_entities']['region'])

    def test_real_region_and_raw(self):
        result = self.align({})
        region = next(a for a in result['alignments'] if a['field'] == 'region')
        self.assertEqual(region['raw_region'], '河北省沧州市泊头市')
        self.assertEqual(region['aligned_region'], '泊头市')
        self.assertTrue(any(n['id'] == region['entity_id'] and n['type'] == 'Region' for n in self.graph['nodes']))

    def test_parent_only_if_present(self):
        graph = {'nodes': [{'id': 'parent', 'name': '沧州市', 'type': 'Region'}]}
        result = align_entities({'region': '河北省沧州市泊头市'}, graph, rules=[])
        self.assertEqual(result['canonical_entities']['region'], '沧州市')
        self.assertFalse(align_entities({'region': '河北省沧州市泊头市'}, {'nodes': []}, rules=[])['entity_ids'])

    def test_disease_overrides_llm_risk(self):
        result = self.align({'risk': ['梨黑星病', '梨细菌性花枯病', '未知风险']})
        for name in ('梨黑星病', '梨细菌性花枯病'):
            a = next(a for a in result['alignments'] if a['mention'] == name)
            self.assertEqual((a['field'], a['status']), ('disease', 'matched'))
        self.assertTrue(any(a['mention'] == '未知风险' and a['field'] == 'risk' for a in result['alignments']))

    def test_structured_symptoms(self):
        result = self.align({'symptom': ['叶斑症状']})
        symptoms = [a for a in result['alignments'] if a['field'] == 'symptom']
        self.assertEqual(len(symptoms), 4)
        self.assertTrue(all(a['status'] == 'matched' for a in symptoms))

    def test_forged_candidate_not_accepted(self):
        self.diagnosis['candidate_ranking'] = [{'candidate_id': 'fake', 'candidate_type': 'Disease', 'candidate_name': '梨黑星病'}]
        result = self.align({'risk': ['梨黑星病']})
        self.assertEqual(result['canonical_entities']['disease'], [])

    def test_no_substring_region_guess(self):
        result = align_entities({'region': '不是泊头市'}, self.graph)
        self.assertIsNone(result['canonical_entities']['region'])

    def test_real_graph_traversal_keeps_foreign_constraints(self):
        vector = Mock(metadata={'corpus_sha256': 'test'})
        vector.search.return_value = []
        from graphrag.graph_retriever import retrieve_subgraph
        with patch('graphrag.dual_retriever.get_retriever', return_value=vector), \
             patch('graphrag.dual_retriever.retrieve_subgraph', wraps=retrieve_subgraph) as traverse:
            result = retrieve_dual('泊头鸭梨叶片斑点', self.graph,
                entities={'risk': ['梨黑星病'], 'symptom': ['叶斑症状']},
                policy={'purpose': 'local_advice', 'mode': 'strict', 'titles': []},
                explicit_context=self.diagnosis['context'], diagnosis_context=self.diagnosis)
        self.assertEqual(traverse.call_count, 2)
        self.assertEqual(traverse.call_args_list[0].kwargs['filters']['region'], '泊头市')
        self.assertTrue(all(not p['usable_for_local_conclusion'] for p in result['discovery_paths']))
        self.assertEqual(result['effective_context']['region'], '泊头市')
        self.assertNotEqual(result['channels']['neo4j']['status'], 'blocked_alignment')
        self.assertTrue(all(e['region'] not in ('US-CA', 'AU-VIC')
                            for c in result['candidate_set'] for e in c.get('edges', [])))


if __name__ == '__main__':
    unittest.main()
