import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.dual_retriever import path_candidates, retrieve_dual

class DualTests(unittest.TestCase):
    def test_unknown_environment_does_not_block_known_crop(self):
        vector=MagicMock();vector.metadata={'corpus_sha256':'test'};vector.search.return_value=[]
        graph={'nodes':[{'id':'c','name':'泊头鸭梨','type':'Crop'}]}
        mentions={'crop':'泊头鸭梨','region':None,'stage':None,'disease':[],'environment':['持续高湿'],'intent':'risk_analysis'}
        with patch('graphrag.dual_retriever.get_retriever',return_value=vector),patch('graphrag.dual_retriever.retrieve_subgraph',return_value={'nodes':[],'edges':[],'sources':[]}) as retrieve:
            result=retrieve_dual('问题',graph,mentions)
        retrieve.assert_called_once()
        self.assertEqual(result['channels']['neo4j']['status'],'partial_alignment')
        self.assertEqual(result['unresolved_entities'][0]['mention'],'持续高湿')

    def test_paths_keep_direction_and_bound_depth(self):
        graph={'nodes':[{'id':x,'name':x} for x in 'abcd'], 'seed_ids':['b'],
               'edges':[{'id':str(i),'source':a,'target':b,'evidence_ids':['doc']} for i,(a,b) in enumerate(zip('abc','bcd'))]}
        paths,truncated=path_candidates(graph)
        self.assertTrue(any(p['node_names']==['a','b','c','d'] for p in paths))
        self.assertFalse(any(p['node_names']==['b','a'] for p in paths))
        self.assertEqual(len(paths),len({p['candidate_id'] for p in paths}))
        self.assertFalse(truncated)
        self.assertTrue(path_candidates(graph,1)[1])

    def test_unresolved_graph_does_not_erase_vector_channel(self):
        vector=MagicMock()
        vector.metadata={'corpus_sha256':'test'}
        vector.search.return_value=[{'chunk_id':'c1','crop':['梨'],'region':[], 'applicable_stages':[]}]
        mentions={'crop':None,'region':None,'stage':None,'disease':['未知病'],'environment':[],'intent':'risk_analysis'}
        with patch('graphrag.dual_retriever.get_retriever',return_value=vector):
            result=retrieve_dual('未知病',{'nodes':[]},mentions)
        self.assertEqual(result['channels']['neo4j']['status'],'blocked_alignment')
        self.assertEqual(result['channels']['faiss']['count'],1)
        self.assertEqual(result['candidate_set'][0]['kind'],'document_chunk')

if __name__=='__main__':unittest.main()
