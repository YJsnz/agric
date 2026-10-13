import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from jujube_diagnosis.app import create_app
from jujube_diagnosis import config
from jujube_diagnosis.model_loader import ModelUnavailable

@pytest.fixture(scope='module')
def client():
    with TestClient(create_app()) as c:
        yield c

@pytest.mark.parametrize('task,dataset', [
    ('leaf', 'jujube_leaf_classifier_v3_final'),
    ('fruit_bruise', 'jujube_fruit_bruise_classifier_v2'),
    ('fruit_freshness', 'jujube_fruit_freshness_classifier_v1'),
])
def test_real_inference(client, task, dataset):
    folder = config.AGRIC / 'ai-training/jujube-vision/data' / dataset / 'test'
    path = next(p for p in sorted(folder.rglob('*')) if p.suffix.lower() in {'.jpg', '.jpeg', '.png'})
    response = client.post('/api/jujube/vision/analyze', data={'task': task},
                           files={'image': (path.name, path.read_bytes(), 'image/jpeg')})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['success'] and result['task'] == task
    assert result['prediction']['class'] in config.LABELS[task]
    assert len(result['prediction']['topk']) == len(config.LABELS[task])
    assert abs(sum(x['confidence'] for x in result['prediction']['topk']) - 1) < 1e-5
    assert result['risk_semantics']['is_diagnosis'] is False
    target = Path(__file__).parent / 'results'
    target.mkdir(exist_ok=True)
    (target / (task + '.json')).write_text(json.dumps({'sample': str(path), 'response': result}, ensure_ascii=False, indent=2), encoding='utf-8')

def test_health(client):
    result = client.get('/api/jujube/health').json()
    assert result['status'] == 'ok'
    assert all(v['loaded'] for v in result['models'].values())

@pytest.mark.parametrize('data,files,status,code', [
    ({'task': 'wrong'}, {'image': ('x.jpg', b'x')}, 422, 'invalid_request'),
    ({'task': 'leaf'}, {'image': ('x.jpg', b'not an image')}, 400, 'invalid_image'),
    ({'task': 'leaf'}, None, 422, 'invalid_request'),
    ({}, {'image': ('x.jpg', b'x')}, 422, 'invalid_request'),
])
def test_bad_requests(client, data, files, status, code):
    response = client.post('/api/jujube/vision/analyze', data=data, files=files)
    assert response.status_code == status
    assert response.json()['error']['code'] == code

@pytest.mark.parametrize('exc,status,code', [(ModelUnavailable('未加载'),503,'model_unavailable'),(RuntimeError('test'),500,'inference_failed')])
def test_failure_handling(client, monkeypatch, exc, status, code):
    import cv2
    import numpy as np
    def fail(*args):
        raise exc
    monkeypatch.setattr(client.app.state.registry, 'predict', fail)
    _, image = cv2.imencode('.png', np.zeros((32,32,3), dtype=np.uint8))
    response = client.post('/api/jujube/vision/analyze', data={'task':'leaf'}, files={'image':('x.png',image.tobytes(),'image/png')})
    assert response.status_code == status
    assert response.json()['error']['code'] == code
