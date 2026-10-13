import copy
import json
import unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from .build import ROOT
from .service import extract,eligible
from .validate import validate
from .router import router

class JujubeTests(unittest.TestCase):
    def setUp(self):
        self.graph=json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
        self.chunks=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
    def test_real_provenance(self):self.assertTrue(validate()['passed'])
    def test_region_not_inferred(self):self.assertIsNone(extract('沧州金丝小枣裂果')['region'])
    def test_explicit_region(self):self.assertEqual(extract('裂果','沧县')['region'],'沧县')
    def test_no_postharvest_for_leaf(self):
        self.assertFalse(any(eligible(c,extract('枣叶病斑')) for c in self.chunks if c['metadata']['scope']=='postharvest'))
    def test_no_production_for_storage(self):
        self.assertFalse(any(eligible(c,extract('贮藏')) for c in self.chunks if c['metadata']['scope']=='production'))
    def test_missing_irrigation_threshold(self):
        self.assertTrue(all(c['metadata']['source_id']!='J002' for c in self.chunks))
    def test_pest_question_excludes_fruit_rot(self):
        ctx=extract('春季虫害危害哪些部位')
        self.assertFalse(any(eligible(c,ctx) for c in self.chunks if c['metadata']['topic']=='浆烂病症状'))
    def test_abolished_rejected(self):
        c=copy.deepcopy(self.chunks[0]);c['metadata']['standard_status']='abolished'
        self.assertFalse(eligible(c,extract('定植')))
    def test_region_upgrade_rejected(self):
        g=copy.deepcopy(self.graph);g['edges'][0]['region']='全河北'
        with self.assertRaises(AssertionError):validate(g,self.chunks)
    def test_unsupported_causal_rejected(self):
        g=copy.deepcopy(self.graph);g['edges'][0]['relation']='CAUSES'
        with self.assertRaises(AssertionError):validate(g,self.chunks)
    def test_api_routes_region(self):
        app=FastAPI();app.include_router(router)
        with patch('jujube.router.ask',return_value={'status':'insufficient_evidence'}) as ask:
            r=TestClient(app).post('/api/jujube/ask',json={'question':'裂果','region':'沧州'})
            self.assertEqual(r.status_code,200);ask.assert_called_once_with('裂果','沧州')

if __name__=='__main__':unittest.main()
