import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.answer_service import GeneratedAnswer,validate_citations,ask_graphrag
from graphrag.entity_extractor import ExtractionError
from graphrag.evidence_fusion import fuse_evidence

class AnswerTests(unittest.TestCase):
    def test_research_sources_never_become_local_answer_evidence(self):
        dual={'entities':{},'canonical_entities':{},'alignments':[],'channels':{},'corpus_sha256':'x','candidate_set':[]}
        with patch('graphrag.answer_service.retrieve_dual',return_value=dual),patch('graphrag.answer_service.generate') as generate:
            result=ask_graphrag('泊头鸭梨持续高湿有什么风险？',{})
        generate.assert_not_called()
        self.assertFalse(result['sources'])
        self.assertFalse(result['reasoning_paths'])
        self.assertEqual(result['reference_materials'][0]['source_id'],'REVIEW_LI_2003')
        self.assertTrue(all(not r['usable_for_answer'] for r in result['reference_materials']))

    def test_citation_must_appear_in_answer(self):
        answer=GeneratedAnswer(sufficient=True,conclusion='结论[E1]',basis='',reasoning='',advice='',citations=['E1','E2'])
        with self.assertRaises(ExtractionError):
            validate_citations(answer,[{'evidence_id':'E1'},{'evidence_id':'E2'}])

    def test_fabricated_citation_rejected(self):
        answer=GeneratedAnswer(sufficient=True,conclusion='结论[E2]',basis='',reasoning='',advice='',citations=['E2'])
        with self.assertRaises(ExtractionError):validate_citations(answer,[{'evidence_id':'E1'}])

    def test_missing_evidence_no_generation(self):
        dual={'entities':{},'canonical_entities':{},'alignments':[],'channels':{},'corpus_sha256':'x','candidate_set':[]}
        with patch('graphrag.answer_service.retrieve_dual',return_value=dual),patch('graphrag.answer_service.generate') as generate:
            result=ask_graphrag('问题',{})
        generate.assert_not_called()
        self.assertEqual(result['status'],'insufficient_evidence')
        self.assertFalse(result['sources'])

    def test_incompatible_region_excluded_even_high_grade(self):
        dual={'entities':{'region':'泊头市'},'canonical_entities':{'region':'泊头市'},'candidate_set':[
            {'candidate_id':'x','kind':'document_chunk','chunk':{'region':['US-CA'],'evidence_level':'A','source_url':'https://example.org'}}]}
        accepted,rejected=fuse_evidence(dual)
        self.assertFalse(accepted);self.assertTrue(rejected)

if __name__=='__main__':unittest.main()
