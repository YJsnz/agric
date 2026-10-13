import json,tempfile,unittest
from pathlib import Path
from zipfile import ZipFile
from chunk_documents import parse_sections,chunk_section,sentence_spans,docx_pages,ROOT

class ChunkTests(unittest.TestCase):
    def test_rule_decimal_and_cross_page(self):
        s=parse_sections([{'page':1,'text':'1 储藏要求\n温度应保持0.5℃，并保持'}, {'page':2,'text':'湿度稳定。下一条规则。'}])[0]
        self.assertEqual(s['text'],'温度应保持0.5℃，并保持湿度稳定。下一条规则。')
        a,b=next(sentence_spans(s['text']))
        self.assertEqual(set(s['page_map'][a:b]),{1,2})
    def test_long_rule_not_cut(self):
        text='甲'*1200+'。'+'乙'*600+'。'
        result=list(chunk_section({'text':text}))
        self.assertEqual(result[0],(0,1201))
    def test_overlap_is_whole_sentence_and_makes_progress(self):
        text=('甲'*59+'。')*30
        spans=list(chunk_section({'text':text},target=600,maximum=800,overlap=100))
        self.assertTrue(any(a<spans[i-1][1] for i,(a,b) in enumerate(spans) if i))
        self.assertEqual(spans[-1][1],len(text))
        self.assertTrue(all(a%60==0 and b%60==0 for a,b in spans))
    def test_docx_heading_and_no_fabricated_page(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'sample.docx'
            with ZipFile(p,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>储藏要求</w:t></w:r></w:p><w:p><w:r><w:t>规则完整。</w:t></w:r></w:p></w:body></w:document>')
            page=docx_pages(p)[0];self.assertIsNone(page['page']);self.assertEqual(page['section'],'储藏要求')
    def test_generated_provenance_and_exclusions(self):
        folder=ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks'
        sections={r['section_id']:r for r in map(json.loads,(folder/'sections.jsonl').read_text(encoding='utf-8').splitlines())}
        chunks=list(map(json.loads,(folder/'chunks.jsonl').read_text(encoding='utf-8').splitlines()))
        self.assertTrue(chunks);self.assertEqual(len(chunks),len({c['chunk_id'] for c in chunks}))
        for c in chunks:
            self.assertNotIn(c['source_id'],{'STD_001','PAPER_002','PAPER_004'})
            s=sections[c['section_id']];self.assertEqual(c['text'],s['text'][c['start_offset']:c['end_offset']])
            self.assertEqual(c['pages'],sorted({p for p in s['page_map'][c['start_offset']:c['end_offset']] if p is not None}))
            self.assertFalse(c['production_retrieval_approved'])

if __name__=='__main__':unittest.main()
