import io
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient
from PIL import Image

from pear_diagnosis.dev_server import app
from pear_diagnosis.api.diagnosis_router import get_pipeline
from pear_diagnosis.context.context import PearDiagnosisContext
from pear_diagnosis.diagnosis.pipeline import PearDiagnosisPipeline


def picture():
    stream = io.BytesIO()
    Image.new('RGB', (16, 16), 'green').save(stream, format='PNG')
    return stream.getvalue()


class DiagnosisAPITests(unittest.TestCase):
    def setUp(self):
        self.pipeline = Mock()
        app.dependency_overrides[get_pipeline] = lambda: self.pipeline
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        self.client.close()

    def post(self, **kwargs):
        return self.client.post('/api/pear/diagnose', files={'file': ('leaf.png', picture(), 'image/png')}, **kwargs)

    def test_clarification_is_200_and_missing_values_stay_none(self):
        self.pipeline.diagnose.return_value = {'status':'needs_clarification','clarification_questions':['请补充地区']}
        response = self.post()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'needs_clarification')
        path, context = self.pipeline.diagnose.call_args.args
        self.assertFalse(path.exists())
        self.assertEqual(context.organ, 'leaf')
        for name in ('region','scene','growth_stage','temperature','humidity','rainfall'):
            self.assertIsNone(getattr(context, name))

    def test_explicit_context_and_insufficient_evidence(self):
        self.pipeline.diagnose.return_value = {'status':'insufficient_evidence'}
        response = self.post(data={'region':'河北省沧州市泊头市','scene':'果园','growth_stage':'幼果期',
                                   'temperature':'23.5','humidity':'0','rainfall':'0'})
        self.assertEqual(response.status_code, 200)
        context = self.pipeline.diagnose.call_args.args[1]
        self.assertEqual(context.region, '河北省沧州市泊头市')
        self.assertEqual(context.humidity, 0)
        self.assertEqual(context.rainfall, 0)
        self.assertEqual(context.temperature, 23.5)

    def test_bad_fields_rejected_before_inference(self):
        for data in ({'organ':'fruit'}, {'humidity':'101'}, {'rainfall':'-1'}, {'temperature':'nan'}):
            with self.subTest(data=data):
                self.assertEqual(self.post(data=data).status_code, 422)
        self.assertEqual(self.client.post('/api/pear/diagnose').status_code, 422)
        self.pipeline.diagnose.assert_not_called()

    def test_invalid_uploads(self):
        for content, mime in ((b'', 'image/png'), (b'not an image', 'image/png'), (picture(), 'image/jpeg')):
            self.assertEqual(self.client.post('/api/pear/diagnose',files={'file':('leaf',content,mime)}).status_code,400)
        with patch('pear_diagnosis.api.diagnosis_router.MAX_UPLOAD_BYTES', 10):
            self.assertEqual(self.post().status_code,413)
        self.pipeline.diagnose.assert_not_called()

    def test_failure_returns_500_and_removes_upload(self):
        self.pipeline.diagnose.side_effect=RuntimeError('internal dependency failure')
        with self.assertLogs('pear_diagnosis.api.diagnosis_router',level='ERROR'):
            response=self.post()
        self.assertEqual(response.status_code,500)
        self.assertNotIn('internal dependency',response.text)
        self.assertFalse(self.pipeline.diagnose.call_args.args[0].exists())

    def test_existing_visual_endpoint_retained(self):
        paths=self.client.get('/openapi.json').json()['paths']
        self.assertIn('/api/vision/pear',paths)
        self.assertIn('/api/pear/diagnose',paths)


class PipelineTests(unittest.TestCase):
    def test_composes_existing_services_and_keeps_full_evidence(self):
        module='pear_diagnosis.diagnosis.pipeline.'
        vision={'crop':'泊头鸭梨','symptom':'spot','confidence':0.9}
        knowledge={'matched_symptom_nodes':[{'id':'s'}],'candidate_risks':[{'evidence_ids':['doc']}]}
        ranking=[{'ranking_score':5,'evidence_ids':['doc']}]
        context=PearDiagnosisContext(crop='泊头鸭梨',organ='leaf')
        for status in ('needs_clarification','insufficient_evidence','answered','validation_failed'):
            rag={'status':status,'sources':[{'citations':[{'evidence_id':'E1'}]}],
                 'reasoning_paths':[['a','HAS_SYMPTOM','b']], 'grounding_audit':{'passed':True},
                 'clarification_questions':['补充地区'] if status=='needs_clarification' else []}
            with patch(module+'PearVisionService') as v, patch(module+'PearKnowledgeService') as k, \
                 patch(module+'PearCandidateRanker') as r, patch(module+'run_pear_graphrag') as g:
                v.return_value.predict.return_value=vision
                k.return_value.find_candidate_risks.return_value=knowledge
                r.return_value.rank.return_value=ranking
                g.return_value={'graphrag':rag,'retrieval_query':'query','diagnosis_context':{'context':context.to_dict()}}
                result=PearDiagnosisPipeline().diagnose(Path('leaf.png'),context)
                k.return_value.find_candidate_risks.assert_called_once_with('spot')
                r.return_value.rank.assert_called_once_with(knowledge['candidate_risks'],context)
                g.assert_called_once_with(vision,context,ranking,top_k=5)
                for field in ('vision','context','knowledge_graph','candidate_ranking','graphrag','sources',
                              'reasoning_paths','grounding','disclaimer'):
                    self.assertIn(field,result)
                self.assertEqual(result['status'],status)
                self.assertEqual(result['knowledge_graph'],knowledge)
                self.assertEqual(result['graphrag'],rag)
                self.assertIn('不是疾病概率',result['disclaimer'])


if __name__=='__main__':unittest.main()
