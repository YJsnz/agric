import unittest
from pathlib import Path
from fastapi.testclient import TestClient
from tomato_diagnosis.app import create_app
from tomato_diagnosis import config
from tomato_diagnosis.model_loader import ModelRegistry

class RealModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(create_app())
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_health(self):
        result = self.client.get('/api/tomato/health')
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()['leaf_model'])
        self.assertTrue(result.json()['ripeness_model'])

    def test_real_predictions(self):
        datasets = {'leaf': 'tomato_leaf_classifier_v1', 'fruit_ripeness': 'tomato_ripeness_classifier_v2'}
        for task, dataset in datasets.items():
            with self.subTest(task=task):
                root = config.AGRIC / 'ai-training/vegetable-vision/data' / dataset / 'test'
                sample = next(p for p in sorted(root.rglob('*')) if p.suffix.lower() in {'.jpg', '.jpeg', '.png'})
                result = self.client.post('/api/tomato/vision/analyze', data={'task': task},
                                          files={'image': (sample.name, sample.read_bytes(), 'image/jpeg')})
                self.assertEqual(result.status_code, 200, result.text)
                body = result.json()
                self.assertEqual(set(body['probabilities']), config.CLASSES[task])
                self.assertEqual(body['class'], max(body['probabilities'], key=body['probabilities'].get))
                self.assertAlmostEqual(sum(body['probabilities'].values()), 1, places=4)
                self.assertFalse(body['is_diagnosis'])
                print(task, sample.name, body['class'], body['confidence'])

    def test_invalid_requests(self):
        url = '/api/tomato/vision/analyze'
        for data, files, expected in [({'task': 'other'}, {'image': ('x', b'x')}, 422),
                                       ({'task': 'leaf'}, {'image': ('x.txt', b'not an image')}, 400),
                                       ({'task': 'leaf'}, None, 422),
                                       ({}, {'image': ('x', b'x')}, 422)]:
            result = self.client.post(url, data=data, files=files)
            self.assertEqual(result.status_code, expected)
            self.assertFalse(result.json()['success'])

    def test_unavailable_and_failure(self):
        class EmptyRegistry(ModelRegistry):
            def load_all(self):
                pass
        import io
        from PIL import Image
        buf = io.BytesIO()
        Image.new('RGB', (16, 16)).save(buf, format='PNG')
        with TestClient(create_app(EmptyRegistry())) as client:
            self.assertFalse(client.get('/api/tomato/health').json()['leaf_model'])
            self.assertEqual(client.post('/api/tomato/vision/analyze', data={'task': 'leaf'},
                files={'image': ('x.png', buf.getvalue())}).status_code, 503)
        class BrokenRegistry(EmptyRegistry):
            def predict(self, task, image):
                raise RuntimeError('test inference failure')
        with TestClient(create_app(BrokenRegistry())) as client:
            self.assertEqual(client.post('/api/tomato/vision/analyze', data={'task': 'leaf'},
                files={'image': ('x.png', buf.getvalue())}).status_code, 500)

if __name__ == '__main__':
    unittest.main()
