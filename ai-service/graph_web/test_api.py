import unittest
from unittest.mock import patch
from urllib.error import URLError
from api import execute

class LiveRepositoryTests(unittest.TestCase):
    def test_database_failure_has_no_fixture_fallback(self):
        with patch('api.load_graph', side_effect=URLError('offline')):
            response=execute(lambda graph:graph)
        self.assertEqual(response.status_code,503)
        self.assertNotIn(b'"nodes"',response.body)

    def test_each_request_reads_database(self):
        with patch('api.load_graph',side_effect=[{'version':1},{'version':2}]) as load:
            self.assertEqual(execute(lambda graph:graph)['version'],1)
            self.assertEqual(execute(lambda graph:graph)['version'],2)
            self.assertEqual(load.call_count,2)

    def test_invalid_query_is_not_success(self):
        with patch('api.load_graph',return_value={}):
            def invalid(graph):raise ValueError('invalid stage')
            self.assertEqual(execute(invalid).status_code,400)

if __name__=='__main__':unittest.main()
