import copy
import unittest
from unittest.mock import patch
from graphrag.answer_service import GeneratedAnswer, ask_graphrag, validate_citations
from graphrag.preliminary import CandidateAssessment, project, publish, partition
from graphrag.entity_extractor import ExtractionError


def fixture():
    evidence=[{'evidence_id':'E1','content':{'text':'梨黑星病可在叶背形成黑色霉层'},
               'evidence_scope':{'status':'general_authoritative','allowed_uses':['candidate_explanation']}}]
    context={'context':{'region':'河北省沧州市泊头市'},'candidate_ranking':[
        {'candidate_name':'梨黑星病'},{'candidate_name':'梨细菌性花枯病'}]}
    draft=GeneratedAnswer(sufficient=True,conclusion='梨黑星病是待核验候选[E1]',basis='资料描述叶背黑色霉层[E1]',
        reasoning='当地适用性未知',advice='请补充叶背照片和实际降雨情况',citations=['E1'],
        candidate_assessments=[CandidateAssessment(candidate_name='梨黑星病',assessment='可能相关，需核对叶背表现[E1]',evidence_ids=['E1'])])
    return draft,evidence,context


class PreliminaryTests(unittest.TestCase):
    def test_cited_assessment_does_not_become_local_success(self):
        d,e,c=fixture();a=project(d,e,c)
        self.assertFalse(a.sufficient)
        self.assertIn(d.candidate_assessments[0].assessment,a.basis)
        validate_citations(a,e)
        result=publish(a,d,e,{'passed':True})
        self.assertTrue(result['preliminary_assessment']['available'])
        self.assertFalse(result['local_conclusion']['available'])
        self.assertEqual(result['preliminary_assessment']['candidate_risks'][0]['candidate_name'],'梨黑星病')
        self.assertEqual(e[0]['evidence_scope']['status'],'general_authoritative')

    def test_no_citation_or_invented_citation_rejected(self):
        for text,ids in [('可能相关', ['E1']),('可能相关[E2]',['E2'])]:
            d,e,c=fixture();d.candidate_assessments[0].assessment=text;d.candidate_assessments[0].evidence_ids=ids
            with self.assertRaises(ExtractionError):project(d,e,c)

    def test_uncited_summary_rejected(self):
        d,e,c=fixture();d.conclusion='梨黑星病为候选'
        with self.assertRaises(ExtractionError):project(d,e,c)

    def test_unsubstantiated_candidate_stays_out(self):
        d,e,c=fixture();d.candidate_assessments[0].candidate_name='梨细菌性花枯病'
        with self.assertRaises(ExtractionError):project(d,e,c)

    def test_hallucinated_candidate_rejected(self):
        d,e,c=fixture();d.candidate_assessments[0].candidate_name='不存在的病'
        with self.assertRaises(ExtractionError):project(d,e,c)

    def test_definitive_language_and_probability_blocked(self):
        for text in ('确诊梨黑星病[E1]','确定为梨黑星病[E1]','就是梨黑星病[E1]','梨黑星病95%[E1]'):
            d,e,c=fixture();d.conclusion=text
            with self.assertRaises(ExtractionError):project(d,e,c)

    def test_failed_audit_never_published(self):
        d,e,c=fixture()
        self.assertFalse(publish(project(d,e,c),d,e,{'passed':False})['preliminary_assessment']['available'])

    def test_negated_diagnosis_is_not_positive_assertion(self):
        d,e,c=fixture();d.reasoning='不能据此确诊。'
        project(d,e,c)
        d.reasoning='不能据此确诊。但是确诊梨黑星病。'
        with self.assertRaises(ExtractionError):project(d,e,c)

    def test_scope_partition_does_not_upgrade_general_or_background(self):
        cs=[{'candidate_id':'g','kind':'document_chunk','evidence_scope':{'status':'general_authoritative','allowed_uses':['candidate_explanation']}},
            {'candidate_id':'b','kind':'document_chunk','evidence_scope':{'status':'hebei_verified','allowed_uses':['production_background']}},
            {'candidate_id':'f','kind':'document_chunk','evidence_scope':{'status':'transfer_pending','allowed_uses':['candidate_discovery']}}]
        original=copy.deepcopy(cs);g=partition(cs,[])
        self.assertEqual(g['candidate_assessment_evidence'],['g'])
        self.assertFalse(g['local_conclusion_evidence'])
        self.assertEqual(len(g['rejected_evidence']),2)
        self.assertEqual(cs,original)

    def test_full_service_with_general_only_generates_insufficient(self):
        d,e,ctx=fixture()
        chunk={'chunk_id':'1','title':'梨黑星病科普','section':'正文','text':e[0]['content']['text'],
               'source_id':'gov','source_url':'https://example.org','region':[],'evidence_level':'B'}
        candidate={'candidate_id':'chunk:1','kind':'document_chunk','chunk':chunk,
                   'evidence_scope':e[0]['evidence_scope'],'ranking_features':{}}
        dual={'alignments':[],'entities':{},'canonical_entities':{},'channels':{},'corpus_sha256':'x','graph_sources':[]}
        with patch('graphrag.answer_service.retrieve_dual',return_value=dual), \
             patch('graphrag.answer_service.fuse_evidence',return_value=([candidate],[])), \
             patch('graphrag.answer_service.rank_evidence',return_value={'results':[candidate],'fusion_config':{},'candidate_count':1}), \
             patch('graphrag.answer_service.generate',return_value=d), \
             patch('graphrag.answer_service.audit_answer',return_value={'passed':True}) as audit:
            result=ask_graphrag('叶片病斑',{},diagnosis_context=ctx)
        self.assertEqual(result['status'],'insufficient_evidence')
        self.assertTrue(result['generation_called'])
        self.assertTrue(result['preliminary_assessment']['available'])
        self.assertEqual(audit.call_count,2)
        self.assertTrue(result['sources'])


if __name__=='__main__':unittest.main()
