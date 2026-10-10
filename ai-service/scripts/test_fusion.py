import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.fusion import fuse, FusionConfig, graph_links

class FusionTests(unittest.TestCase):
    def setUp(self):
        self.chunks = [dict(chunk_id=str(i), source_id=str(i), section='4.1 管理', crop=['梨'],
                            region=['河北省'], applicable_stages=[], evidence_level='A') for i in range(3)]
        self.semantic = [dict(c, rank=i+1, score=0.8-i*0.1) for i,c in enumerate(self.chunks)]
        self.graph = {'edges': [dict(id='e', evidence_ids=['s'], locator='4.1', hop=1)]}

    def test_exact_section_required(self):
        self.assertTrue(graph_links(self.chunks[1], self.graph, {'1':['s']}))
        self.graph['edges'][0]['locator'] = '4.10'
        self.assertFalse(graph_links(self.chunks[1], self.graph, {'1':['s']}))

    def test_graph_promotes_linked_candidate(self):
        result = fuse(self.semantic, self.chunks, self.graph, {'1':['s']})
        self.assertEqual(result['results'][0]['chunk_id'], '1')
        self.assertTrue(result['graph_channel_active'])

    def test_no_graph_preserves_semantic_order(self):
        result = fuse(self.semantic, self.chunks, {}, {})
        self.assertEqual([r['chunk_id'] for r in result['results']], ['0','1','2'])
        self.assertFalse(result['graph_channel_active'])

    def test_region_conflict_cannot_be_rescued(self):
        self.chunks[0]['region']=['US-CA']
        result = fuse(self.semantic, self.chunks, {}, {}, {'region':'泊头市'})
        self.assertNotIn('0', [r['chunk_id'] for r in result['results']])

    def test_unknown_stage_strict_abstains(self):
        result = fuse(self.semantic, self.chunks, {}, {}, {'stage':'采收期'}, 'strict')
        self.assertEqual(result['status'], 'insufficient_evidence')

    def test_bad_weights(self):
        for value in (-1, float('nan'), float('inf')):
            with self.assertRaises(ValueError):
                FusionConfig(graph_weight=value)

    def test_metrics_known_ranking(self):
        from tune_fusion import metrics
        result=metrics([{'chunk_id':'a'},{'chunk_id':'b'}], {'a':3,'b':1})
        self.assertEqual(result, {'ndcg@5':1.0,'recall@5':1.0,'mrr@5':1.0})
        with self.assertRaises(ValueError):
            metrics([], {'a':-1})

if __name__ == '__main__':
    unittest.main()
