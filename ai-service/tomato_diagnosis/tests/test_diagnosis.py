import json
import os
import unittest
from fastapi.testclient import TestClient
from tomato_diagnosis.app import create_app
from tomato_diagnosis import config
from tomato_diagnosis.visual_entity_mapping import align

class AlignmentTests(unittest.TestCase):
    def test_no_invented_nodes_and_partial_mapping(self):
        graph = {'nodes': [{'id': 'real', 'name': '番茄白粉病', 'type': 'Disease', 'crop': ['番茄']}]}
        result = align({'task': 'leaf', 'class': 'powdery_mildew_and_leaf_miner'}, graph)
        self.assertEqual([n['id'] for n in result['matched_entities']], ['real'])
        self.assertEqual(len(result['unmapped_entities']), 1)

    def test_cucumber_node_does_not_match_tomato(self):
        graph = {'nodes': [{'id': 'cucumber', 'name': '粉虱', 'type': 'Pest', 'crop': ['黄瓜']}]}
        result = align({'task': 'leaf', 'class': 'whitefly'}, graph)
        self.assertEqual(result['matched_entities'], [])
        self.assertEqual(len(result['unmapped_entities']), 1)
        result = align({'task': 'fruit_ripeness', 'class': 'green'}, graph)
        self.assertEqual(result['matched_entities'], [])
        self.assertEqual(len(result['unmapped_entities']), 1)

@unittest.skipUnless(os.getenv('TOMATO_RUN_LIVE_RAG_TESTS') == '1', 'Opt-in: calls configured DeepSeek API')
class LiveDiagnosisTests(unittest.TestCase):
    def test_real_images_end_to_end(self):
        outputs = []
        with TestClient(create_app()) as client:
            for task, dataset, category in [('leaf', 'tomato_leaf_classifier_v1', 'powdery_mildew'),
                                             ('fruit_ripeness', 'tomato_ripeness_classifier_v2', 'breakers')]:
                with self.subTest(task=task):
                    root = config.AGRIC / 'ai-training/vegetable-vision/data' / dataset / 'test' / category
                    sample = next(p for p in sorted(root.rglob('*')) if p.suffix.lower() in {'.jpg', '.jpeg', '.png'})
                    response = client.post('/api/tomato/diagnose', data={'task': task}, files={'image': (sample.name, sample.read_bytes())})
                    self.assertEqual(response.status_code, 200, response.text)
                    body = response.json()
                    outputs.append({'sample': str(sample), 'result': body})
                    report = config.MODULE / '.runtime' / 'diagnosis_live_results.json'
                    report.parent.mkdir(exist_ok=True)
                    report.write_text(json.dumps(outputs, ensure_ascii=False, indent=2), encoding='utf-8')
                    self.assertIn(body['visual']['class'], config.CLASSES[task])
                    self.assertEqual(body['kg']['status'], 'ok')
                    self.assertTrue(body['kg']['relations'])
                    self.assertTrue(body['rag'].get('retrieval', {}).get('vector_count'))
                    self.assertEqual(body['rag']['deepseek_status'], 'success', body['rag'])
                    self.assertTrue(body['rag']['grounding']['passed'])
                    self.assertTrue(body['rag']['citations'])

if __name__ == '__main__':
    unittest.main()
