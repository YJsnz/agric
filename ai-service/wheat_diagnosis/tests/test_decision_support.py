import unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from wheat_diagnosis.decision_support import build_decision_support
from wheat_diagnosis.schemas import WheatEnvironmentalContext
from wheat_diagnosis.router import router
from wheat_diagnosis.service import WheatDiagnosisService, get_service
from wheat_diagnosis.graphrag_adapter import prepare_retrieval
from wheat_diagnosis.tests.test_wheat_diagnosis import models, picture


class DecisionTests(unittest.TestCase):
    def test_adaptive_questions_and_no_diagnosis(self):
        observations = {'leaf': {'class': 'leaf_spot_blight'}}
        first = build_decision_support(observations, {}, {})
        self.assertEqual(len(first['questions']), 3)
        context = {'leaf_position': 'lower', 'field_distribution': 'widespread', 'recent_operations': '无'}
        second = build_decision_support(observations, context, {})
        self.assertEqual([q['id'] for q in second['questions']], ['progression'])
        self.assertEqual(second['conditional_actions'], [])
        self.assertIn('现场检查', second['professional_checks'][0])

    def test_normal_and_head_do_not_get_disease_questions(self):
        result = build_decision_support({'leaf': {'class': 'healthy'}, 'head': {'wheat_head_count': 20}}, {}, {})
        self.assertEqual(result['questions'], [])
        self.assertTrue(any('漏检' in a for a in result['immediate_actions']))

    def test_api_answers_reach_retrieval_context_and_validate(self):
        app = FastAPI(); app.include_router(router)
        app.dependency_overrides[get_service] = lambda: WheatDiagnosisService(*models())
        with TestClient(app) as client:
            response = client.post('/api/wheat/diagnose', files={'leaf_image': ('leaf.png', picture(), 'image/png')}, data={'knowledge_enabled': 'false', 'leaf_position': 'lower', 'recent_operations': '无'})
            self.assertEqual(response.status_code, 200)
            result = response.json()
            structured = prepare_retrieval(result)['structured_query_context']
            self.assertEqual(structured['environment_context']['recent_operations'], '无')
            self.assertIsNone(structured['environment_context']['region'])
            self.assertNotIn('leaf_position', [q['id'] for q in result['decision_support']['questions']])
            invalid = client.post('/api/wheat/diagnose', data={'leaf_position': 'guessed'})
            self.assertEqual(invalid.status_code, 422)
