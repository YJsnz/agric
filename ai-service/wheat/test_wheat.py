import copy,json,unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from .build import ROOT,CROP
from .service import extract,allowed,priority,validate_salinity_comparison,ExtractionError
from .validate import validate
from .router import router

class WheatTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph=json.loads((ROOT/'graph/graph-v1.json').read_text(encoding='utf-8'))
        cls.chunks=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
    def test_verified_graph(self):self.assertEqual(validate(self.graph),[])
    def test_unknown_context(self):
        c=extract('旱碱麦怎么种？')
        for k in ['region','growth_stage','soil_moisture','soil_salinity','temperature','rainfall']:self.assertIsNone(c[k])
        self.assertEqual(c['stress'],[])
    def test_explicit_salinity(self):
        c=extract('黄骅土壤含盐量2‰，播种时比较干，怎么种？')
        self.assertEqual(c['soil_salinity']['unit'],'‰');self.assertEqual(c['soil_salinity']['value'],2)
        self.assertEqual(c['soil_salinity']['normalized_percent'],0.2)
        self.assertEqual(c['soil_moisture'],'low');self.assertEqual(set(c['stress']),{'盐胁迫','干旱胁迫'})
    def test_stage_priority(self):self.assertEqual(extract('旱碱麦播种偏晚后，春季怎么办？')['growth_stage'],'春季')
    def test_salinity_comparison_guard(self):
        sal=extract('含盐量2‰')['soil_salinity']
        for text in ['2‰超过0.3%的条件','2‰超出0.3%的适用范围']:
            with self.assertRaises(ExtractionError):validate_salinity_comparison(text,sal)
        for text in ['2‰不超过0.3%','2‰未超出0.3%','2‰等于0.2%']:
            validate_salinity_comparison(text,sal)
    def test_no_late_sowing_rules_without_late_context(self):
        c=extract('黄骅旱碱麦播种期墒情不足怎么办？')
        self.assertFalse(any(allowed(x,c) for x in self.chunks if x['metadata']['source_id']=='W005'))
    def test_metadata_gate(self):
        c=extract('黄骅旱碱麦播种期墒情不足怎么办？')
        for chunk in self.chunks:
            if chunk['metadata']['scope'] in ['grain','flour']:self.assertFalse(allowed(chunk,c))
    def test_grain_not_flour(self):
        c=extract('黄骅旱碱麦原粮质量指标？')
        hits=[x for x in self.chunks if allowed(x,c)]
        self.assertTrue(hits);self.assertEqual({h['metadata']['source_id'] for h in hits},{'W015'})
    def test_region_not_upgraded(self):
        g=copy.deepcopy(self.graph);g['edges'][0]['region']='黄骅'
        self.assertTrue(any('region' in x for x in validate(g)))
    def test_quote_cannot_be_invented(self):
        g=copy.deepcopy(self.graph);g['edges'][0]['evidence_text']='盐碱造成减产35%'
        self.assertTrue(any('nonverbatim' in x for x in validate(g)))
    def test_missing_source_and_causal_unit(self):
        g=copy.deepcopy(self.graph);g['edges'][0].update(source_id=None,relation='CAUSES',effect_size=35)
        errors=validate(g)
        for token in ['missing_source','causality','numeric_unit']:self.assertTrue(any(token in x for x in errors))
    def test_stage_not_omitted(self):
        g=copy.deepcopy(self.graph);del g['edges'][0]['growth_stage'];self.assertTrue(validate(g))
    def test_namespace(self):self.assertTrue(all(n['id'].startswith(CROP+':') for n in self.graph['nodes']))
    def test_research_not_prescription(self):
        self.assertTrue(any(e['relation']=='RESEARCH_TARGET' for e in self.graph['edges']))
        self.assertFalse(any(e['relation']=='CAUSES' for e in self.graph['edges']))
    def test_api_business_response(self):
        app=FastAPI();app.include_router(router)
        with TestClient(app) as client,patch('wheat.router.ask',return_value={'status':'insufficient_evidence'}) as call:
            r=client.post('/api/wheat/ask',json={'question':'旱碱麦如何播种？'})
            self.assertEqual(r.status_code,200);call.assert_called_once()
            self.assertEqual(client.post('/api/wheat/ask',json={'question':''}).status_code,422)

if __name__=='__main__':unittest.main()
