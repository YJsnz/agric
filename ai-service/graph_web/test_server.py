import io
import json
import unittest
from unittest.mock import patch
import server


class GraphApiTests(unittest.TestCase):
    def payload(self):
        return {'errors': [], 'results': [
            {'data': [{'row': [{'id':'crop:pear','name':'梨','type':'Crop'}]}]},
            {'data': [{'row': [{'id':'edge:1','kind':'hypothesis','evidence_ids':['src:1']}, 'crop:pear', 'risk:1', 'MAY_LEAD_TO']}]},
            {'data': [{'row': [{'id':'src:1','title':'来源'}]}]},
            {'data': [{'row': [1,5]}]},
        ]}

    @patch.dict(server.os.environ, {'NEO4J_PASSWORD': 'test-only-placeholder'})
    def test_preserves_evidence_and_does_not_expose_credentials(self):
        with patch.object(server, 'urlopen', return_value=io.BytesIO(json.dumps(self.payload()).encode())) as request:
            result = server.load_graph()
        edge = result['edges'][0]
        self.assertEqual(edge['source'], 'crop:pear')
        self.assertEqual(edge['relation'], 'MAY_LEAD_TO')
        self.assertEqual(edge['kind'], 'hypothesis')
        self.assertEqual(edge['evidence_ids'], ['src:1'])
        self.assertNotIn('test-only-placeholder', json.dumps(result))
        statements = json.loads(request.call_args.args[0].data)['statements']
        self.assertTrue(all(s['statement'].startswith('MATCH ') for s in statements))

    def test_database_error_is_not_success_or_seed_fallback(self):
        with patch.object(server, 'urlopen', return_value=io.BytesIO(b'{"errors":[{"message":"failed"}]}')):
            with self.assertRaises(ValueError):
                server.load_graph()

    def test_large_graph_is_not_silently_truncated(self):
        payload = self.payload()
        payload['results'][0]['data'] *= 1001
        with patch.object(server, 'urlopen', return_value=io.BytesIO(json.dumps(payload).encode())):
            with self.assertRaises(ValueError):
                server.load_graph()


if __name__ == '__main__':
    unittest.main()
