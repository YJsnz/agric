import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class PaperQATests(unittest.TestCase):
    def test_all_350_provenance(self):
        rows=[json.loads(s) for s in (ROOT/'data/botou_yali/evaluation/paper_qa_350/test_questions_350.jsonl').read_text(encoding='utf-8').splitlines()]
        chunks={c['chunk_id']:c for c in map(json.loads,(ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl').read_text(encoding='utf-8').splitlines())}
        self.assertEqual(len(rows),350)
        self.assertEqual(len({r['id'] for r in rows}),350)
        self.assertEqual(len({r['question'] for r in rows}),350)
        for r in rows:
            e=r['evidence'];c=chunks[e['chunk_id']]
            self.assertEqual(c['source_type'],'paper')
            self.assertFalse(c.get('needs_layout_review'))
            self.assertEqual(r['gold_sources'],[c['source_id']])
            self.assertIn(r['reference_answer'],c['text'])
            self.assertEqual(e['pages'],c['pages'])
            self.assertEqual(e['source_url'],c['source_url'])
            self.assertEqual(e['text_sha256'],c['text_sha256'])
            start=e['start_offset_in_chunk']
            self.assertEqual(c['text'][start:start+len(e['quote'])],e['quote'])

if __name__=='__main__':unittest.main()
