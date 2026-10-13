"""Regression tests use real corpus/alignment/fusion; external IO is mocked."""
import copy
import json
import threading
import unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from wheat.build import ROOT
from wheat.service import extract, retrieve_evidence
from wheat_diagnosis.fusion import fuse
from wheat_diagnosis.kg_adapter import align_visual_entities, build_entity_hints
from wheat_diagnosis.graphrag_adapter import prepare_retrieval, run_wheat_graphrag, bounded_vector_search
from wheat_diagnosis.schemas import WheatEnvironmentalContext
from wheat_diagnosis.service import WheatDiagnosisService, get_service
from wheat_diagnosis.router import router
from wheat_diagnosis.tests.test_wheat_diagnosis import models, picture
from graphrag.answer_service import GeneratedAnswer


class KnowledgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph=json.loads((ROOT/'graph/graph-v1.json').read_text(encoding='utf-8'))
        cls.chunks=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))

    def setUp(self):
        a,b,c=models()
        self.fused=fuse({'leaf':a.predict_leaf(None),'canopy':b.predict_canopy(None),'head':c.detect_heads(None)},WheatEnvironmentalContext())
        self.load=patch('wheat.service.load_graph',return_value=copy.deepcopy(self.graph)).start()
        self.search=patch('wheat.service.search',side_effect=lambda q,allowed,n:[x for x in self.chunks if allowed(x)][:n]).start()
        self.generate=patch('graphrag.crop_runtime.generate',return_value=GeneratedAnswer(
            sufficient=False,conclusion='只作为候选资料解释。[E1]',basis='原文说明了生产条件。[E1]',
            reasoning='还需核实现场条件。',advice='请补充叶片细节。',citations=['E1'])).start()
        self.audit=patch('graphrag.crop_runtime.audit_answer',return_value={'passed':True,'checks':[]}).start()
        self.addCleanup(patch.stopall)

    def run_pipeline(self):
        return run_wheat_graphrag(self.fused)

    def test_visual_signal_entity_alignment(self):
        hints=build_entity_hints(self.fused['candidate_signals'])
        self.assertIn('锈病',hints[0]['search_terms'])
        matches=align_visual_entities(self.fused['candidate_signals'],self.graph)
        rust=[m for m in matches if m['source_signal']=='rust']
        self.assertEqual(rust[0]['entity'],'锈病');self.assertEqual(rust[0]['entity_type'],'Disease')
        self.assertIn(rust[0]['entity_id'],{n['id'] for n in self.graph['nodes']})

    def test_missing_entity_not_invented(self):
        self.assertEqual(align_visual_entities([{'entity_hint':'leaf_spot_blight'}],self.graph),[])
        self.assertEqual(align_visual_entities([{'entity_hint':'nitrogen_deficiency'}],self.graph),[])

    def test_no_visual_confirmed_diagnosis(self):
        r=self.run_pipeline()
        self.assertTrue(r['candidate_risks'])
        self.assertTrue(all(c['status']=='candidate' and not c['local_evidence'] for c in r['candidate_risks']))

    def test_model_b_weak_signal(self):
        self.assertEqual(self.fused['candidate_signals'][1]['strength'],'weak_visual')

    def test_missing_context_stays_none(self):
        ctx=prepare_retrieval(self.fused)['structured_query_context']
        self.assertTrue(all(v is None for v in ctx['environment_context'].values()))
        self.assertTrue(all(v is None for v in ctx['measurements'].values()))

    def test_region_not_inferred(self):
        result=self.run_pipeline()
        ctx=result['knowledge']['structured_query_context']
        self.assertIsNone(ctx['environment_context']['region']);self.assertIsNone(ctx['region_source'])

    def test_unknown_units_not_inferred(self):
        self.fused['environment_context'].update(soil_moisture=18.2,soil_salinity=2.1,region='黄骅')
        r=self.run_pipeline();ctx=r['knowledge']['structured_query_context']
        self.assertEqual(ctx['measurements']['soil_moisture']['value'],18.2)
        self.assertIsNone(ctx['measurements']['soil_salinity']['unit'])
        self.assertEqual(ctx['region_source'],'user_provided')

    def test_short_query_separate_context(self):
        p=prepare_retrieval(self.fused)
        self.assertLessEqual(len(p['retrieval_query']),500)
        self.assertNotIn('boxes',p['retrieval_query']);self.assertNotIn('score',p['retrieval_query'])

    def test_graphrag_disabled(self):
        service=WheatDiagnosisService(*models())
        r=service.diagnose({'leaf':object()},WheatEnvironmentalContext(),knowledge_enabled=False)
        self.assertFalse(r.knowledge['enabled']);self.load.assert_not_called();self.generate.assert_not_called()

    def test_graphrag_enabled(self):
        r=self.run_pipeline()
        self.assertTrue(r['knowledge']['enabled']);self.load.assert_called_once();self.search.assert_called_once()
        self.generate.assert_called_once();self.audit.assert_called_once()

    def test_insufficient_evidence_preserved(self):
        r=self.run_pipeline();self.assertEqual(r['status'],'insufficient_evidence')
        self.assertEqual(r['grounding_status'],'grounded')

    def test_no_evidence_no_generation(self):
        self.load.return_value={'nodes':[],'edges':[],'sources':[]};self.search.side_effect=None;self.search.return_value=[]
        r=self.run_pipeline();self.assertEqual(r['status'],'insufficient_evidence')
        self.assertFalse(r['generation_called']);self.generate.assert_not_called()

    def test_llm_failure_degrades(self):
        self.generate.side_effect=RuntimeError('simulated LLM failure')
        r=self.run_pipeline();self.assertIsNone(r['assessment']);self.assertTrue(r['knowledge']['evidence'])
        self.assertEqual(r['warnings'][0]['component'],'graphrag')

    def test_neo4j_failure_degrades(self):
        self.load.side_effect=ConnectionError('offline')
        r=self.run_pipeline();self.assertTrue(r['knowledge']['vector_evidence'])
        self.assertEqual(r['knowledge']['graph_evidence'],[])
        self.assertEqual(r['knowledge']['retrieval']['graph_status'],'unavailable')
        self.assertTrue(r['generation_called']);self.assertTrue(r['citations'])

    def test_vector_failure_preserves_graph(self):
        self.search.side_effect=TimeoutError('offline')
        r=self.run_pipeline();self.assertTrue(r['knowledge']['graph_evidence'])
        self.assertTrue(r['knowledge']['evidence']);self.assertEqual(r['knowledge']['vector_evidence'],[])

    def test_citation_preserved(self):
        r=self.run_pipeline();c=r['citations'][0]
        for key in ['source_id','title','evidence_level','url','source_metadata']:self.assertIn(key,c)
        self.assertIn('locator',c['metadata'])

    def test_model_c_not_disease_signal(self):
        self.fused['candidate_signals']=self.fused['candidate_signals'][2:]
        r=self.run_pipeline();self.assertEqual(r['candidate_risks'],[])
        self.assertEqual(r['knowledge']['aligned_entities'],[])

    def test_invalid_citation_rejected(self):
        self.generate.return_value.citations=['E999']
        r=self.run_pipeline();self.assertIsNone(r['assessment']);self.assertEqual(r['citations'],[])
        self.assertEqual(r['status'],'validation_failed');self.audit.assert_not_called()

    def test_failed_grounding_suppresses_answer(self):
        self.audit.return_value={'passed':False,'checks':[{'verdict':'unsupported'}]}
        r=self.run_pipeline();self.assertIsNone(r['assessment']);self.assertEqual(r['recommendations'],[])
        self.assertEqual(r['grounding_status'],'insufficient_evidence')

    def test_crop_stage_scope_gates_preserved(self):
        self.fused['environment_context']['growth_stage']='灌浆期'
        r=self.run_pipeline()
        for chunk in r['knowledge']['vector_evidence']:
            self.assertEqual(chunk['metadata']['scope'],'production')
            self.assertEqual(chunk['metadata']['crop'],'huanghua_hanjianmai')
            self.assertIn(chunk['metadata']['growth_stage'],['灌浆期',None])

    def test_wrong_namespace_rejected(self):
        self.load.return_value={'nodes':[{'id':'pear:1'}],'edges':[],'sources':[]}
        r=self.run_pipeline();self.assertEqual(r['knowledge']['retrieval']['graph_status'],'unavailable')

    def test_shared_retrieval_preserves_ask(self):
        from wheat.service import ask
        with patch('wheat.service.generate',return_value=self.generate.return_value),patch('wheat.service.audit_answer',return_value={'passed':True}):
            r=ask('旱碱麦锈病相关资料')
        self.assertEqual(r['status'],'insufficient_evidence');self.assertTrue(r['evidence'])
        self.assertTrue(r['generation_called'])

    def test_api_full_mock_and_failure_http200(self):
        service=WheatDiagnosisService(*models());app=FastAPI();app.include_router(router)
        app.dependency_overrides[get_service]=lambda:service
        with TestClient(app) as client:
            for llm_failure in (False,True):
                if llm_failure:self.generate.side_effect=RuntimeError('offline')
                r=client.post('/api/wheat/diagnose',files={k:('test.png',picture(),'image/png') for k in ['leaf_image','canopy_image','head_image']})
                self.assertEqual(r.status_code,200);body=r.json()
                self.assertTrue(body['knowledge']['enabled']);self.assertTrue(all(body['visual_observations'].values()))
                self.assertIsNone(body['environment_context']['region'])
                if llm_failure:self.assertIsNone(body['assessment'])

    def test_partial_model_failure_still_runs_knowledge(self):
        a,b,c=models();b.run.side_effect=RuntimeError('failed')
        r=WheatDiagnosisService(a,b,c).diagnose({'leaf':object(),'canopy':object(),'head':object()},WheatEnvironmentalContext())
        self.assertIsNone(r.visual_observations.canopy);self.assertTrue(r.knowledge['evidence'])
        self.assertEqual(r.warnings[0]['component'],'model_b')

    def test_vector_timeout_bounded(self):
        event=threading.Event();finished=threading.Event()
        def slow():
            try:event.wait(2);return []
            finally:finished.set()
        try:
            with self.assertRaises(TimeoutError):bounded_vector_search(slow,timeout=.01)
        finally:
            event.set();finished.wait(2)


if __name__=='__main__':unittest.main()
