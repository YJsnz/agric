import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('kg', ROOT / 'kg.py')
kg = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(kg)


class GraphTests(unittest.TestCase):
    def setUp(self):
        self.graph = kg.read(ROOT / 'data/graph.json')
        self.ontology = kg.read(ROOT / 'ontology.json')

    def test_seed(self):
        self.assertGreater(kg.validate(self.graph, self.ontology)['edges'], 30)

    def test_reject_corrupt_evidence_and_endpoints(self):
        for field, value in [('source', 'absent'), ('evidence_ids', ['absent']), ('confidence', 0.86)]:
            graph = copy.deepcopy(self.graph)
            graph['edges'][0][field] = value
            with self.assertRaises(ValueError):
                kg.validate(graph, self.ontology)

    def test_reject_causal_cycle(self):
        edge = copy.deepcopy(next(e for e in self.graph['edges'] if e['relation'] == 'PROMOTES' and e['source'] == 'state:early_infection'))
        edge['id'] = 'cycle'
        edge['source'], edge['target'] = edge['target'], edge['source']
        self.graph['edges'].append(edge)
        with self.assertRaisesRegex(ValueError, 'causal cycle'):
            kg.validate(self.graph, self.ontology)

    def test_no_silent_local_transfer(self):
        self.assertEqual(kg.neighborhood(self.graph, 'disease:scab', 'local')['edges'], [])
        self.assertTrue(kg.neighborhood(self.graph, 'disease:scab', 'research')['edges'])
        e = next(e for e in self.graph['edges'] if e['scope'] == 'general_pear')
        e['review_status'] = 'source_checked'
        with self.assertRaises(ValueError):
            kg.validate(self.graph, self.ontology)

    def test_export_is_deterministic_and_non_destructive(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            kg.export(self.graph, path)
            first = (path / 'import.cypher').read_text(encoding='utf-8')
            kg.export(self.graph, path)
            self.assertEqual(first, (path / 'import.cypher').read_text(encoding='utf-8'))
            self.assertNotIn('DELETE', first)
            self.assertIn('MERGE', first)


if __name__ == '__main__':
    unittest.main()
