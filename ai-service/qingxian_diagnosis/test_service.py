import json,unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from .build import ROOT
from .context import QingxianContext
from .knowledge_service import QingxianVegetableKnowledgeService,rank_candidates
from .graphrag_adapter import context_from_question,allowed
from .router import router

class QingxianTests(unittest.TestCase):
    def test_example_has_supported_candidate_without_region(self):
        from graphrag.crop_runtime import supported_symptom_candidates
        ctx=context_from_question('黄瓜叶背有灰黑色霉层，可能是什么问题？')
        self.assertIsNone(ctx.region)
        rows=self.service.find_candidate_risks('黄瓜叶背有灰黑色霉层，可能是什么问题？',ctx)['candidate_risks']
        evidence=[{'source_id':c['doc_id'],'content':c['text']} for c in self.chunks if allowed(c,ctx,'黄瓜叶背')]
        self.assertIn('黄瓜霜霉病',supported_symptom_candidates({'diagnosis_context':{'ranked_candidates':rows}},evidence))
        self.assertEqual([],supported_symptom_candidates({'diagnosis_context':{'ranked_candidates':rows}},[]))

    @classmethod
    def setUpClass(cls):
        cls.graph=json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
        cls.chunks=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
        cls.service=QingxianVegetableKnowledgeService(cls.graph)
    def test_unknown_context(self):
        c=context_from_question('青县设施蔬菜有哪些问题？')
        self.assertIsNone(c.crop);self.assertIsNone(c.region);self.assertIsNone(c.humidity)
    def test_explicit_context(self):
        c=context_from_question('早春茬黄瓜缓苗后棚内湿度90%')
        self.assertEqual((c.crop,c.humidity,c.growth_stage),('黄瓜',90,'缓苗后'))
        self.assertIsNone(c.region)
    def test_soil_is_not_air(self):
        self.assertIsNone(context_from_question('黄瓜土壤湿度40%').humidity)
    def test_crop_isolation(self):
        c=QingxianContext(crop='黄瓜',organ='leaf')
        result=self.service.find_candidate_risks('水浸状斑 灰黑色霉',c)
        self.assertTrue(result['candidate_risks'])
        self.assertTrue(all(x['candidate_name'].startswith('黄瓜') for x in result['candidate_risks']))
    def test_transfer_preserved(self):
        c=QingxianContext(crop='番茄',organ='leaf')
        raw=self.service.find_candidate_risks('水浸状斑 白色霉',c)['candidate_risks']
        ranked=rank_candidates(raw,c,self.graph)
        self.assertTrue(ranked);self.assertEqual(len(raw),len(ranked))
        self.assertTrue(any('transfer_pending' in ' '.join(x['ranking_warnings']) for x in ranked))
        self.assertTrue(all(x['evidence_ids'] and x['locator'] for x in ranked))
    def test_season_constraint(self):
        selected=[x for x in self.chunks if x['metadata'].get('season')=='早春茬']
        self.assertTrue(selected)
        self.assertTrue(all(not allowed(x,QingxianContext(crop='黄瓜',season='秋冬茬'),'黄瓜') for x in selected))
    def test_missing_fulltext_not_used(self):
        ids={s['id'] for s in self.graph['sources']}
        self.assertNotIn('DB13_T6100_2025',ids);self.assertNotIn('DB13_T6294_2026',ids)
    def test_no_unverified_causality(self):
        self.assertFalse(any(e['relation']=='CAUSES' for e in self.graph['edges']))
    def test_api_clarification_is_successful_http(self):
        app=FastAPI();app.include_router(router)
        r=TestClient(app).post('/api/qingxian/ask',json={'question':'叶子有斑怎么办？'})
        self.assertEqual(r.status_code,200);self.assertEqual(r.json()['status'],'needs_clarification')
        self.assertFalse(r.json()['generation_called'])
    def test_api_validation(self):
        app=FastAPI();app.include_router(router);client=TestClient(app)
        for body in [{'question':' '},{'question':'黄瓜','humidity':101},{'question':'黄瓜','crop':'鸭梨'}]:
            self.assertEqual(client.post('/api/qingxian/ask',json=body).status_code,422)

if __name__=='__main__':unittest.main()
