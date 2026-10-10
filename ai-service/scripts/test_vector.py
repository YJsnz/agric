import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.vector_rag import VectorRetriever, windows

class VectorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.retriever = VectorRetriever()

    def test_windows_cover_original_without_truncation(self):
        chunk = {'title': '鸭梨', 'section': '储藏', 'text': '完整农业规则。' * 200}
        spans = list(windows(chunk, self.retriever.encoder))
        covered = set()
        for w in spans:
            covered.update(range(w['start'], w['end']))
            self.assertLessEqual(self.retriever.encoder.tokens(w['embedding_text']), 512)
        self.assertEqual(covered, set(range(len(chunk['text']))))

    def test_saved_index_retrieval_and_provenance(self):
        results = self.retriever.search('泊头鸭梨黑星病在什么条件下容易发生？', 3)
        self.assertEqual(len(results), 3)
        self.assertEqual(len({r['chunk_id'] for r in results}), 3)
        self.assertTrue(all(r['source_url'] and r['text'] for r in results))
        self.assertEqual(results[0]['source_id'], 'GOV_001')
        self.assertGreaterEqual(results[0]['score'], results[1]['score'])

    def test_invalid_queries_rejected(self):
        for question, k in [('', 3), ('梨', 0), ('梨', 21), ('梨' * 600, 3)]:
            with self.assertRaises(ValueError):
                self.retriever.search(question, k)

if __name__ == '__main__':
    unittest.main()
