import io
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
import numpy as np
from PIL import Image
from fastapi import FastAPI
from fastapi.testclient import TestClient
from wheat_diagnosis.model_a_service import ModelAService, LABELS
from wheat_diagnosis.model_b_service import ModelBService
from wheat_diagnosis.model_c_service import ModelCService
from wheat_diagnosis.schemas import WheatEnvironmentalContext
from wheat_diagnosis.service import WheatDiagnosisService, get_service
from wheat_diagnosis.router import router
from wheat_diagnosis.exceptions import WheatDiagnosisError
from wheat_diagnosis.graphrag_adapter import prepare_retrieval


def classification(names, scores):
    return SimpleNamespace(names=dict(enumerate(names)),probs=SimpleNamespace(data=np.array(scores,dtype=float)))


def picture():
    output=io.BytesIO();Image.new('RGB',(32,32),'green').save(output,format='PNG');return output.getvalue()


def models():
    a,b,c=ModelAService(),ModelBService(),ModelCService()
    a.run=Mock(return_value=classification(list(LABELS),[.1,.7,.1,.1]))
    b.run=Mock(return_value=classification(['normal','water_stress'],[.6,.4]))
    c.run=Mock(return_value=SimpleNamespace(orig_shape=(32,32),boxes=SimpleNamespace(
        xyxy=np.array([[1,2,10,12]]),conf=np.array([.9]),cls=np.array([0]))))
    return a,b,c


class ModelTests(unittest.TestCase):
    def test_model_a_load(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'test.pt';path.write_bytes(b'test fixture')
            model=Mock(task='classify',names=dict(enumerate(LABELS)))
            with patch('ultralytics.YOLO',return_value=model) as loader, patch('torch.cuda.is_available',return_value=False):
                service=ModelAService(path);service._load();service._load()
                self.assertEqual(loader.call_count,1)
                self.assertTrue(service.status()['loaded']);self.assertEqual(service.device,'cpu')

    def test_model_a_output_schema(self):
        a,_,_=models();result=a.predict_leaf(None)
        self.assertEqual(result['class'],'rust')
        for key in ['label_zh','score','raw_scores']:self.assertIn(key,result)

    def test_model_a_yellowing_semantics(self):
        a,_,_=models();a.run.return_value=classification(list(LABELS),[.01,.01,.01,.97])
        self.assertEqual(a.predict_leaf(None)['label_zh'],'缺氮类黄化视觉表现')

    def test_model_b_threshold(self):
        _,b,_=models()
        for value, expected in [(.36,'normal'),(.37,'water_stress'),(.4,'water_stress')]:
            b.run.return_value=classification(['normal','water_stress'],[1-value,value])
            result=b.predict_canopy(None)
            self.assertEqual(result['class'],expected);self.assertEqual(result['visual_score'],value)
            self.assertEqual(result['threshold'],.37)

    def test_model_b_semantics(self):
        _,b,_=models();text=json.dumps(b.predict_canopy(None),ensure_ascii=False)
        for token in ['soil_water_deficit_probability','drought_probability','已发生干旱','缺水概率']:self.assertNotIn(token,text)

    def test_model_c_output(self):
        _,_,c=models();r=c.detect_heads(None)
        self.assertEqual(r['wheat_head_count'],len(r['boxes']))
        self.assertEqual(r['boxes'][0]['x1'],1);self.assertEqual(c.run.call_args.kwargs['conf'],.25)

    def test_model_c_empty(self):
        _,_,c=models();c.run.return_value.boxes=SimpleNamespace(xyxy=np.empty((0,4)),conf=np.array([]),cls=np.array([]))
        r=c.detect_heads(None);self.assertEqual(r['wheat_head_count'],0);self.assertIsNone(r['mean_confidence'])

    def test_missing_weight(self):
        a=ModelAService(Path(tempfile.gettempdir())/'nonexistent_wheat_test_98340.pt')
        with self.assertRaises(WheatDiagnosisError):a._load()
        self.assertFalse(a.status()['loaded']);self.assertIsNotNone(a.status()['load_error'])

    def test_hints_are_not_diagnoses(self):
        a,b,c=models();service=WheatDiagnosisService(a,b,c)
        result=service.diagnose({'head':object()},WheatEnvironmentalContext(),knowledge_enabled=False).model_dump(by_alias=True)
        self.assertEqual(result['candidate_signals'][0]['signal_type'],'wheat_head_phenotype')
        self.assertEqual(result['candidate_signals'][0]['wheat_head_count'],1)
        self.assertIsNone(result['candidate_signals'][0]['entity_hint'])
        payload=prepare_retrieval(result)
        self.assertEqual(payload['entity_hints'],[]);self.assertIsNone(payload['diagnosis_context']['environment_context']['region'])


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.a,self.b,self.c=models();self.service=WheatDiagnosisService(self.a,self.b,self.c)
        app=FastAPI();app.include_router(router);app.dependency_overrides[get_service]=lambda:self.service
        self.client=TestClient(app)

    def post(self, names=('leaf_image',), data=None):
        return self.client.post('/api/wheat/diagnose',files={n:('test.png',picture(),'image/png') for n in names},data={'knowledge_enabled':'false',**(data or {})})

    def test_empty_request(self):
        r=self.client.post('/api/wheat/diagnose');self.assertEqual(r.status_code,400)
        self.assertIn('至少需要',r.json()['detail'])

    def test_environment_no_inference(self):
        r=self.client.post('/api/wheat/diagnose',data={'temperature':'0','knowledge_enabled':'false'});self.assertEqual(r.status_code,200)
        self.assertIsNone(r.json()['environment_context']['region'])
        self.a.run.assert_not_called();self.b.run.assert_not_called();self.c.run.assert_not_called()

    def test_wheat_diagnose_api_leaf_only(self):
        r=self.post();self.assertEqual(r.status_code,200);obs=r.json()['visual_observations']
        self.assertIsNotNone(obs['leaf']);self.assertIsNone(obs['canopy']);self.assertIsNone(obs['head'])

    def test_wheat_diagnose_api_all_images(self):
        r=self.post(('leaf_image','canopy_image','head_image'));self.assertEqual(r.status_code,200)
        self.assertTrue(all(r.json()['visual_observations'].values()))
        self.assertFalse(r.json()['knowledge']['enabled']);self.assertIsNone(r.json()['assessment'])

    def test_partial_failure(self):
        self.b.run.side_effect=WheatDiagnosisError('模型B失败')
        r=self.post(('leaf_image','canopy_image','head_image'));self.assertEqual(r.status_code,200)
        self.assertIsNone(r.json()['visual_observations']['canopy']);self.assertEqual(r.json()['warnings'][0]['component'],'model_b')

    def test_all_failed(self):
        self.a.run.side_effect=WheatDiagnosisError('加载失败');self.assertEqual(self.post().status_code,500)

    def test_bad_image_partial_failure(self):
        r=self.client.post('/api/wheat/diagnose',files={'leaf_image':('bad.txt',b'bad','text/plain'),'canopy_image':('ok.png',picture(),'image/png')},data={'knowledge_enabled':'false'})
        self.assertEqual(r.status_code,200);self.assertIsNone(r.json()['visual_observations']['leaf'])
        self.assertEqual(len(r.json()['warnings']),1)

    def test_bad_parameters(self):
        for data in [{'humidity':'101'},{'soil_salinity':'-1'},{'temperature':'nan'},{'soil_moisture':'abc'}]:
            self.assertEqual(self.post(data=data).status_code,422)

    def test_actual_image_format_over_extension(self):
        data=io.BytesIO();Image.new('RGB',(32,32),'green').save(data,format='JPEG')
        r=self.client.post('/api/wheat/diagnose',files={'head_image':('official.png',data.getvalue(),'image/png')},data={'knowledge_enabled':'false'})
        self.assertEqual(r.status_code,200);self.assertIsNotNone(r.json()['visual_observations']['head'])

    def test_blank_environment(self):
        self.assertEqual(self.client.post('/api/wheat/diagnose',data={'region':'   '}).status_code,400)

    def test_models_status(self):
        r=self.client.get('/api/wheat/models/status');self.assertEqual(r.status_code,200)
        self.assertEqual(r.json()['model_b']['threshold'],.37);self.assertEqual(r.json()['model_c']['confidence_threshold'],.25)

    def test_existing_wheat_ask_unchanged(self):
        from wheat.router import router as ask_router
        self.client.app.include_router(ask_router)
        with patch('wheat.router.ask',return_value={'status':'ok','answer':'existing'}) as ask:
            r=self.client.post('/api/wheat/ask',json={'question':'旱碱麦播种期如何管理？'})
            self.assertEqual(r.status_code,200);self.assertEqual(r.json()['answer'],'existing');ask.assert_called_once()


if __name__=='__main__':unittest.main()
