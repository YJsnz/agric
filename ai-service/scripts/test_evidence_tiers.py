import copy
import json
import unittest
from graphrag.evidence_tiers import ROOT, classify, diagnostic_document_scope
from graphrag.evidence_fusion import fuse_evidence
from graphrag.fusion import applicability


class EvidenceTierTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        p = ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl'
        cls.chunks = {c['chunk_id']: c for c in map(json.loads, p.read_text(encoding='utf-8').splitlines())}

    def test_generic_use_not_local_advice(self):
        c = self.chunks['GOV_001_C0001']; before = copy.deepcopy(c)
        ctx = {'crop':'泊头鸭梨','region':'泊头市','stage':None}
        self.assertFalse(applicability(c,ctx,'strict')[0])
        ok,_,warnings,tier = diagnostic_document_scope(c,ctx,'leaf')
        self.assertTrue(ok)
        self.assertEqual(tier['status'],'general_authoritative')
        self.assertFalse(tier['local_disease_validation'])
        self.assertTrue(any('not_local' in w for w in warnings))
        self.assertEqual(c,before)

    def test_changed_text_revokes_review(self):
        c = dict(self.chunks['GOV_001_C0001'],text='改写原文')
        self.assertFalse(diagnostic_document_scope(c,{},'leaf')[0])

    def test_unknown_context_not_filled(self):
        ctx={'crop':'泊头鸭梨','region':None,'stage':None}
        diagnostic_document_scope(self.chunks['GOV_001_C0001'],ctx,'leaf')
        self.assertIsNone(ctx['region'])
        self.assertIsNone(ctx['stage'])

    def test_postharvest_excluded(self):
        for c in self.chunks.values():
            if c['source_id'].startswith('PAPER_') or c['source_id']=='GOV_002':
                self.assertFalse(diagnostic_document_scope(c,{},'leaf')[0])

    def test_unverified_and_summary_excluded(self):
        self.assertEqual(classify({'source_id':'UNI_001'})['status'],'authority_pending')
        self.assertIn('fulltext_required',classify({'source_id':'STD_001'})['restrictions'])
        for c in self.chunks.values():
            if c['source_id']=='UNI_001':
                self.assertFalse(diagnostic_document_scope(c,{},'leaf')[0])

    def test_foreign_stays_transfer(self):
        for region in ('US-CA','AU-VIC'):
            tier=classify({'region':region,'review_status':'source_checked','evidence_level':'A'},'relation')
            self.assertEqual(tier['status'],'transfer_pending')
            self.assertEqual(tier['allowed_uses'],['candidate_discovery'])
            self.assertFalse(tier['local_disease_validation'])

    def test_background_does_not_supply_referenced_text(self):
        c=self.chunks['STD_003_C0017']
        ok,_,warnings,tier=diagnostic_document_scope(c,{'crop':'鸭梨','region':'泊头市'},'leaf')
        self.assertTrue(ok)
        self.assertEqual(tier['allowed_uses'],['production_background'])
        self.assertTrue(any('referenced_standard' in w for w in warnings))
        self.assertIn('NY/T 2157',c['text'])

    def test_fusion_rechecks_and_preserves_strict_path(self):
        c=self.chunks['GOV_001_C0001']
        ctx={'crop':'泊头鸭梨','region':'泊头市','organ':'leaf'}
        dual={'entities':ctx,'canonical_entities':ctx,'explicit_context':ctx,
              'effective_context':ctx,'policy':{'purpose':'local_advice','mode':'strict','titles':[]},
              'candidate_set':[{'candidate_id':'gov','kind':'document_chunk','chunk':c}]}
        self.assertFalse(fuse_evidence(dual)[0])
        dual['diagnostic_explanation']=True
        self.assertEqual(len(fuse_evidence(dual)[0]),1)
        dual['candidate_set'][0]['chunk']=dict(c,needs_layout_review=True)
        self.assertFalse(fuse_evidence(dual)[0])


if __name__=='__main__':unittest.main()
