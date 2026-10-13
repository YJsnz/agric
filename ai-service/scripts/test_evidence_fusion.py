import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.evidence_fusion import fuse_evidence

def example():
    context={'crop':'泊头鸭梨','region':'泊头市','stage':'果实膨大期'}
    a={'candidate_id':'A','kind':'document_chunk','chunk':{'score':0.91,'source_url':'https://example.org/a',
       'crop':['鸭梨'],'region':['河北省'],'applicable_stages':['果实膨大期'],'evidence_level':'A'}}
    b=copy.deepcopy(a);b['candidate_id']='B';b['chunk'].update(score=0.93,region=['南方'],crop=['其他梨'],evidence_level='C')
    return {'entities':context,'canonical_entities':context,'candidate_set':[b,a]}

class EvidenceFusionTests(unittest.TestCase):
    def test_user_a_beats_higher_similarity_b(self):
        accepted,rejected=fuse_evidence(example())
        self.assertEqual([c['candidate_id'] for c in accepted],['A'])
        self.assertEqual(rejected[0]['candidate_id'],'B')

    def test_each_constraint_independently(self):
        for field,value in [('region',['广东省']),('crop',['苹果']),('applicable_stages',['休眠期']),
                            ('region',[]),('applicable_stages',[]),('evidence_level','D'),('evidence_level','X'),
                            ('source_url',''),('needs_layout_review',True)]:
            with self.subTest(field=field,value=value):
                dual=example();dual['candidate_set']=dual['candidate_set'][1:]
                dual['candidate_set'][0]['chunk'][field]=value
                accepted,rejected=fuse_evidence(dual)
                self.assertFalse(accepted);self.assertTrue(rejected)

    def test_levels_config_and_dedup(self):
        dual=example();a=dual['candidate_set'][1];a['chunk']['evidence_level']='B'
        dual['candidate_set']=[a,a]
        self.assertEqual(len(fuse_evidence(dual)[0]),1)
        self.assertFalse(fuse_evidence(dual,allowed_levels=('A',))[0])

    def test_graph_scope_independently_checked(self):
        dual=example();dual['graph_context_nodes']=[{'id':'c','name':'鸭梨'},{'id':'s','name':'果实膨大期'}]
        dual['graph_sources']=[{'id':'doc','status':'read'}]
        edge={'id':'e','crop':'c','stage_ids':['s'],'region':'河北省','evidence_ids':['doc'],
              'locator':'3.1','evidence_level':'A','review_status':'source_checked'}
        dual['candidate_set']=[{'candidate_id':'p','kind':'graph_path','edges':[edge]}]
        self.assertEqual(len(fuse_evidence(dual)[0]),1)
        edge['region']='US-CA'
        self.assertFalse(fuse_evidence(dual)[0])
        edge['region']='河北省';edge['evidence_ids']=['missing']
        self.assertFalse(fuse_evidence(dual)[0])

if __name__=='__main__':unittest.main()
