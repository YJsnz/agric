import sys
import threading
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.reranker import BGEReranker,candidate_text
from graphrag.reranker import ROOT
from tokenizers import Tokenizer

class RerankerTests(unittest.TestCase):
    @unittest.skipUnless((ROOT/'tokenizer.json').exists(),'local tokenizer required')
    def test_long_text_windows_cover_tail_without_truncation(self):
        r=BGEReranker.__new__(BGEReranker)
        r.tokenizer=Tokenizer.from_file(str(ROOT/'tokenizer.json'))
        r.tokenizer.no_truncation();r.tokenizer.no_padding()
        text='梨果实储藏条件。'*200
        spans=list(r.windows('鸭梨如何储藏？',text))
        covered=set()
        for a,b,t in spans:
            covered.update(range(a,b))
            self.assertLessEqual(len(r.tokenizer.encode('鸭梨如何储藏？',t).ids),512)
        self.assertEqual(covered,set(range(len(text))))

    def test_graph_direction_serialized(self):
        text=candidate_text({'kind':'graph_path','node_names':['湿润','风险'],
                             'edges':[{'relation':'PROMOTES','conditions':['限定条件']}]})
        self.assertIn('湿润 —PROMOTES→ 风险',text)
        self.assertIn('限定条件',text)

    def test_aggregation_dedup_and_provenance(self):
        r=BGEReranker.__new__(BGEReranker)
        r.lock=threading.Lock()
        r.windows=lambda q,t: [(0,1,'a'),(1,2,'b')]
        class Model:
            def rerank(self,*args,**kwargs):return iter([0.1,0.9,0.7,0.2])
        r.model=Model()
        candidates=[{'candidate_id':str(i),'kind':'document_chunk','chunk':{'title':'标题','section':'章','text':'证据','source_id':str(i)}} for i in range(2)]
        result=r.rerank('问题',candidates+[candidates[0]],5)
        self.assertEqual(result['candidate_count'],2)
        self.assertEqual(result['results'][0]['reranker_score'],0.9)
        self.assertEqual(result['results'][0]['chunk']['source_id'],'0')
        with self.assertRaises(ValueError):r.rerank('问题',candidates,11)

if __name__=='__main__':unittest.main()
