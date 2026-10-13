import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.graph_retriever import retrieve_subgraph

class GraphTests(unittest.TestCase):
    def setUp(self):
        self.graph = {'nodes': [{'id': s, 'name': s, 'type': 'Crop' if s == 'c' else 'Disease'} for s in 'abcde'],
                      'sources': [{'id': 'doc', 'status': 'read'}], 'edges': []}
        for i, (a, b) in enumerate(zip('abcd', 'bcde')):
            self.graph['edges'].append(dict(id=str(i), source=a, target=b, relation='PROMOTES',
                crop='c', stage_ids=[], region='河北省', scope='local', kind='causal',
                evidence_ids=['doc'], locator='第一节', review_status='source_checked'))

    def test_depth_and_direction(self):
        for hops in (1, 2, 3):
            result = retrieve_subgraph(self.graph, ['a'], hops, 'outgoing')
            self.assertEqual(len(result['edges']), hops)
        result = retrieve_subgraph(self.graph, ['b'], 1, 'incoming')
        self.assertEqual(result['triples'][0]['source'], 'a')
        self.assertEqual(result['triples'][0]['target'], 'b')

    def test_relation_and_evidence_filter(self):
        self.graph['edges'][0]['relation'] = 'RELATED_TO'
        self.assertFalse(retrieve_subgraph(self.graph, ['a'])['edges'])
        self.graph['edges'][0]['relation'] = 'PROMOTES'
        self.graph['sources'][0]['status'] = 'unread'
        self.assertFalse(retrieve_subgraph(self.graph, ['a'])['edges'])

    def test_scope_and_limit(self):
        self.graph['edges'][0]['region'] = 'US-CA'
        self.assertFalse(retrieve_subgraph(self.graph, ['a'], filters={'region': '泊头市'})['edges'])
        result = retrieve_subgraph(self.graph, ['a'], 3, max_edges=1)
        self.assertEqual(len(result['edges']), 1)
        self.assertTrue(result['truncated'])
        self.assertFalse(retrieve_subgraph(self.graph, ['a'], filters={'stage': '果实膨大期'})['edges'])

    def test_invalid_seed_and_hops(self):
        for seeds, hops in [(['missing'], 2), (['a'], 4)]:
            with self.assertRaises(ValueError):
                retrieve_subgraph(self.graph, seeds, hops)

if __name__ == '__main__':
    unittest.main()
