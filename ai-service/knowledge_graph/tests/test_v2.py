import copy
import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from query_v2 import validate, select_edges, paths, ask

class EvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph=json.loads((ROOT/'data/graph-v2.json').read_text(encoding='utf-8'))
        cls.ids={n['name']:n['id'] for n in cls.graph['nodes']}
    def test_integrity(self):
        self.assertEqual(validate(self.graph)['sources'],32)
    def test_reviewed_papers_remain_conditional(self):
        added=[e for e in self.graph['edges'] if e['id'].startswith('review25:')]
        self.assertEqual(len(added),8)
        for e in added:
            self.assertEqual(e['review_status'],'transfer_pending')
            self.assertTrue(e['conditions'])
            self.assertIsNone(e['effect_size'])
            self.assertNotEqual(e['relation'],'CAUSES')
    def test_required_types_and_classification(self):
        from refine_v2 import REQUIRED_TYPES
        self.assertTrue(set(REQUIRED_TYPES) <= {n['type'] for n in self.graph['nodes']} | {'Source'})
        nodes={n['name']:n for n in self.graph['nodes']}
        self.assertEqual(nodes['鸭梨']['type'],'Variety')
        self.assertEqual(nodes['检查黑星病斑']['type'],'AgriculturalPractice')
        self.assertEqual(nodes['持续湿润']['type'],'EnvironmentFactor')
        self.assertEqual(nodes['果实硬度']['type'],'QualityIndicator')
        self.assertNotIn('持续高湿',nodes)
    def test_scab_process_retrieval(self):
        answer=ask(self.graph,'什么因素促进黑星病',{})
        self.assertTrue(any(e['source']==self.ids['持续湿润'] for e in answer['edges']))
        self.assertTrue(answer['sources'])
        self.assertFalse(ask(self.graph,'什么因素促进黑星病',{'region':'泊头市'})['edges'])
    def test_reject_unread_evidence(self):
        graph=copy.deepcopy(self.graph);graph['sources'][0]['status']='metadata_only'
        with self.assertRaisesRegex(ValueError,'unread'):validate(graph)
    def test_no_invented_probabilities(self):
        graph=copy.deepcopy(self.graph);graph['edges'][0]['confidence']=.87
        with self.assertRaisesRegex(ValueError,'uncalibrated'):validate(graph)
    def test_no_cross_region_transfer(self):
        edges=select_edges(self.graph,{'region':'泊头市'})
        self.assertTrue(edges)
        self.assertTrue(all(not e['region'].startswith('US') for e in edges))
    def test_no_cross_cultivar_temperature(self):
        edges=select_edges(self.graph,{'crop':'鸭梨','stage':'储藏期'})
        ids={e['crop'] for e in edges}
        self.assertNotIn(self.ids['黄冠'],ids)
        self.assertIn(self.ids['鸭梨'],ids)
    def test_unknown_crop_does_not_inherit_pear_rules(self):
        with self.assertRaises(ValueError):
            select_edges(self.graph,{'crop':'小麦'})
    def test_relation_and_scope_filters_apply_to_paths(self):
        self.assertFalse(paths(self.graph,self.ids['过低贮藏温度'],self.ids['果心褐变'],{'kind':'fact'}))
        self.assertFalse(paths(self.graph,self.ids['过低贮藏温度'],self.ids['果心褐变'],{'scope':'general_pear'}))
        self.assertTrue(all(e['kind']=='normative' for e in select_edges(self.graph,{'kind':'normative'})))
    def test_not_yet_effective_standard(self):
        self.assertFalse(any('6338' in e['evidence_ids'] for e in select_edges(self.graph,{'as_of':'2026-07-01'})))
    def test_directed_path_and_no_false_scab_rot(self):
        self.assertTrue(paths(self.graph,self.ids['过低贮藏温度'],self.ids['果心褐变'],{'region':'泊头市','stage':'储藏期'}))
        self.assertFalse(paths(self.graph,self.ids['果心褐变'],self.ids['过低贮藏温度'],{}))
        self.assertFalse(paths(self.graph,self.ids['梨黑星病'],self.ids['采后腐烂风险'],{}))
    def test_question_abstains_and_respects_stage(self):
        self.assertFalse(ask(self.graph,'火星番茄治疗',{})['edges'])
        self.assertFalse(ask(self.graph,'过低贮藏温度',{'stage':'开花期'})['edges'])
        self.assertTrue(ask(self.graph,'机械损伤与采后腐烂风险',{'region':'泊头市'})['edges'])

if __name__=='__main__':unittest.main()
