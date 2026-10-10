import hashlib,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from app.document_catalog import find_documents

class CorpusTests(unittest.TestCase):
    def test_source_ids_and_metadata(self):
        rows=find_documents();self.assertEqual(len(rows),12)
        self.assertEqual(len({r['source_id'] for r in rows}),12)
        for r in rows:
            self.assertTrue({'source_id','title','source_type','crop','region','year','evidence_level','applicable_stages','availability'}<=r.keys())
            self.assertFalse(r['production_retrieval_approved'])
    def test_artifacts_and_checksums(self):
        for r in find_documents():
            for artifact in r['artifacts']:
                path=(ROOT/artifact['path']).resolve()
                self.assertTrue(path.is_relative_to(ROOT.resolve()))
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),artifact['sha256'])
            if r['fulltext_path']:
                self.assertTrue((ROOT/r['fulltext_path']).exists())
                pages=json.loads((ROOT/r['pages_path']).read_text(encoding='utf-8'))
                if r['page_count']:
                    self.assertEqual(r['page_count'],len(pages))
                    self.assertTrue((ROOT/r['fulltext_path']).read_bytes().startswith(b'%PDF-'))
    def test_missing_fulltexts_not_promoted(self):
        rows={r['source_id']:r for r in find_documents()}
        for sid in ['STD_001','PAPER_004']:
            self.assertIsNone(rows[sid]['fulltext_path'])
            self.assertFalse(rows[sid]['ready_for_chunking'])
        self.assertEqual(rows['PAPER_002']['extraction_status'],'needs_ocr')
        self.assertFalse(rows['PAPER_002']['ready_for_chunking'])
    def test_scope_filter_does_not_turn_unknown_into_local(self):
        rows=find_documents(region='泊头市')
        self.assertEqual([r['source_id'] for r in rows],['STD_001'])
        self.assertFalse(find_documents(region='泊头市',fulltext_only=True))
        self.assertTrue(find_documents(crop='鸭梨',stage='储藏期',fulltext_only=True))
    def test_publication_year_not_url_directory(self):
        row=next(r for r in find_documents() if r['source_id']=='GOV_002')
        self.assertEqual(row['year'],2004)

if __name__=='__main__':unittest.main()
