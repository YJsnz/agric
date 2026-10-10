import io
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.entity_extractor import extract_entities, ExtractionError

class ExtractionTests(unittest.TestCase):
    def run_response(self, content, finish='stop'):
        response = io.BytesIO(json.dumps({'choices': [{'finish_reason': finish, 'message': {'content': json.dumps(content)}}]}).encode())
        with patch('graphrag.entity_extractor.settings', return_value={'DEEPSEEK_API_KEY': 'test', 'DEEPSEEK_MODEL': 'deepseek-chat'}), patch('graphrag.entity_extractor.urlopen', return_value=response):
            return extract_entities('鸭梨有什么风险？')

    def test_valid_missing_fields_are_null(self):
        result = self.run_response(dict(crop='鸭梨', region=None, stage=None, environment=[], disease=[], intent='risk_analysis'))
        self.assertIsNone(result.region)
        self.assertEqual(result.disease, [])

    def test_hallucination_and_invalid_schema_rejected(self):
        good = dict(crop='鸭梨', region=None, stage=None, environment=[], disease=[], intent='risk_analysis')
        for changes in [{'disease': ['黑星病']}, {'intent': 'invented'}, {'region': '河北'}, {'environment': '高湿'}, {'extra': True}]:
            with self.assertRaises(ExtractionError):
                self.run_response({**good, **changes})

    def test_truncated_output_rejected(self):
        with self.assertRaises(ExtractionError):
            self.run_response({}, 'length')

    def test_empty_question(self):
        with self.assertRaises(ValueError):
            extract_entities('   ')

if __name__ == '__main__':
    unittest.main()
