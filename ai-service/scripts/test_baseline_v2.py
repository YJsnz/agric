import unittest
from unittest.mock import patch
import baseline_v2_experiment as experiment
from graphrag.answer_service import GeneratedAnswer


class AdapterTests(unittest.TestCase):
    def test_output_is_separate_from_v1(self):
        self.assertNotEqual(experiment.OUT.resolve(),experiment.OLD.resolve())
        self.assertEqual(experiment.OUT.name,'baseline_v2')

    def test_prepared_retrieval_cannot_cross_questions(self):
        token=experiment.CTX.set({'question':'question A','prepared':{'dual':{'candidate_set':[]}}})
        try:
            self.assertEqual(experiment.prepared_dual('question A',{}),{'candidate_set':[]})
            with self.assertRaises(AssertionError):experiment.prepared_dual('question B',{})
        finally:experiment.CTX.reset(token)

    def test_production_admission_must_match_precomputation(self):
        token=experiment.CTX.set({'question':'q','prepared':{'D_admitted_ids':['c'],'D_ranking':{'results':[]}}})
        try:
            self.assertEqual(experiment.prepared_ranking('q',[{'candidate_id':'c'}],5),{'results':[]})
            with self.assertRaises(AssertionError):experiment.prepared_ranking('q',[{'candidate_id':'other'}],5)
        finally:experiment.CTX.reset(token)

    def test_context_is_not_shared_between_calls(self):
        first={'question':'q','calls':[]};second={'question':'r','calls':[]}
        a=experiment.CTX.set(first)
        b=experiment.CTX.set(second)
        self.assertIs(experiment.CTX.get(),second)
        experiment.CTX.reset(b);self.assertIs(experiment.CTX.get(),first)
        experiment.CTX.reset(a)

    def test_closed_book_does_not_receive_gold(self):
        token=experiment.CTX.set({'calls':[]})
        output=GeneratedAnswer(sufficient=False,conclusion='不知道',basis='',reasoning='',advice='',citations=[])
        try:
            with patch.object(experiment,'generation',return_value=output) as generate:
                answer,evidence,_=experiment.baseline_answer('测试问题',[],'A')
            self.assertEqual(evidence,[])
            self.assertNotIn('reference_answer',str(generate.call_args))
            self.assertFalse(answer.sufficient)
        finally:experiment.CTX.reset(token)


if __name__=='__main__':unittest.main()
