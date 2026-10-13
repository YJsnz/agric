import unittest
from unittest.mock import Mock, patch

from graphrag.entity_aligner import align_entities
from graphrag.symptom_scope import document_symptom_warnings, normalize_leaf_question, LEAF
from graphrag.dual_retriever import retrieve_dual


class SymptomRetrievalTests(unittest.TestCase):
    def test_farmer_wording_and_narrow_typo_repair(self):
        for text in ['梨页有斑','梨叶有斑','梨叶子上有黑色斑点']:
            self.assertRegex(normalize_leaf_question(text),LEAF)
        self.assertEqual(normalize_leaf_question('论文第二页有斑点图片'),'论文第二页有斑点图片')
        self.assertEqual(normalize_leaf_question('梨页有斑'),'梨叶片有斑')
        self.assertEqual(normalize_leaf_question('梨叶子上有黑色斑点'),'梨叶片上有黑色斑点')
        self.assertNotIn('黑星病',normalize_leaf_question('梨页有斑'))

    def test_fruit_paper_rejected_for_leaf_synonyms(self):
        for text in ['梨叶有斑','叶子上有斑点']:
            self.assertTrue(document_symptom_warnings({'title':'鸭梨采后生理代谢及贮藏品质','text':'果心褐变'},[text]))

    def setUp(self):
        self.graph = {'nodes': [
            {'id': 'leaf', 'name': '叶片黑色斑点', 'type': 'Symptom'},
            {'id': 'fruit', 'name': '果面黑色斑点', 'type': 'Symptom'},
            {'id': 'disease', 'name': '黑星病', 'type': 'Disease'},
        ], 'edges': [], 'sources': []}

    def test_positive_connector_aligns_only_symptom(self):
        for term in ('叶片出现黑色斑点', '叶片出现了黑色斑点', '叶片有黑色斑点'):
            with self.subTest(term=term):
                result = align_entities({'symptom': [term]}, self.graph, rules=[])
                self.assertEqual(result['entity_ids'], ['leaf'])
                self.assertEqual(result['canonical_entities']['disease'], [])

    def test_no_fuzzy_guess_or_negation_removal(self):
        for term in ('叶片没有黑色斑点', '叶片未出现黑色斑点', '叶片褐色斑点', '黑色斑点', 'spot'):
            self.assertEqual(align_entities({'symptom': [term]}, self.graph, rules=[])['entity_ids'], [])

    def test_ambiguity_preserved(self):
        self.graph['nodes'].append({'id': 'another', 'name': '叶片黑色斑点', 'type': 'Symptom'})
        result = align_entities({'symptom': ['叶片出现黑色斑点']}, self.graph, rules=[])
        self.assertEqual(result['alignments'][0]['status'], 'ambiguous')

    def test_organ_scope(self):
        fruit = {'title': '鸭梨采后贮藏', 'text': '果实黑心病', 'applicable_stages': ['储藏期']}
        self.assertTrue(document_symptom_warnings(fruit, ['叶片黑色斑点']))
        self.assertFalse(document_symptom_warnings(fruit, []))
        self.assertFalse(document_symptom_warnings(fruit, ['果面黑色斑点']))
        self.assertFalse(document_symptom_warnings({'text': '叶片黑色病斑，也危害果实'}, ['叶片黑色斑点']))
        self.assertFalse(document_symptom_warnings({'text': '病原传播的研究'}, ['叶片黑色斑点']))
        self.assertTrue(document_symptom_warnings(
            {'title': '梨采后果心褐变', 'text': '[19] 张某. 竹叶片研究[J]. 林业研究，2009.'},
            ['叶片黑色斑点']))

    def test_irrelevant_documents_do_not_enter_candidates(self):
        vector = Mock(metadata={'corpus_sha256': 'test'})
        vector.search.return_value = [
            {'chunk_id': 'fruit', 'source_id': 's', 'title': '鸭梨采后贮藏', 'text': '果实黑心指数'},
            {'chunk_id': 'leaf', 'source_id': 's2', 'title': '叶片病斑', 'text': '叶片黑色斑点'},
        ]
        with patch('graphrag.dual_retriever.get_retriever', return_value=vector):
            result = retrieve_dual('叶片出现黑色斑点', self.graph,
                                   entities={'symptom': ['叶片出现黑色斑点']})
        self.assertEqual([c['chunk']['chunk_id'] for c in result['candidate_set']], ['leaf'])
        self.assertIn('organ:mismatch', result['excluded_documents'][0]['reasons'][0])
        self.assertEqual(result['unresolved_entities'], [])
        self.assertFalse(any(r['chunk_id'] == 'fruit' for r in result['reference_materials']))

    def test_leaf_scope_survives_missing_extracted_symptom(self):
        vector = Mock(metadata={'corpus_sha256': 'test'})
        vector.search.return_value = [{'chunk_id':'fruit','source_id':'s','title':'鸭梨采后贮藏','text':'果实黑心指数'}]
        with patch('graphrag.dual_retriever.get_retriever', return_value=vector):
            result = retrieve_dual('叶片出现黑色斑点', self.graph, entities={'symptom': []})
        self.assertEqual(result['candidate_set'], [])
        self.assertIn('organ:mismatch', result['excluded_documents'][0]['reasons'][0])

    def test_short_leaf_question_gets_second_symptom_query(self):
        vector = Mock(metadata={'corpus_sha256':'test'})
        vector.search.side_effect = [
            [{'chunk_id':'fruit','source_id':'s','title':'鸭梨采后贮藏','text':'果实黑心指数'}],
            [{'chunk_id':'leaf','source_id':'gov','title':'梨树叶部病害','text':'叶片病斑'}]]
        with patch('graphrag.dual_retriever.get_retriever',return_value=vector), \
             patch('graphrag.dual_retriever.diagnostic_document_scope',return_value=(True,{},[],{})):
            result=retrieve_dual('梨叶片有斑',self.graph,entities={'symptom':[]},
                                 policy={'purpose':'general','mode':'research','titles':[]})
        self.assertEqual([c['chunk']['chunk_id'] for c in result['candidate_set']],['leaf'])
        self.assertEqual(vector.search.call_count,2)
        self.assertNotIn('黑星病',result['retrieval_queries'][1])


if __name__ == '__main__':
    unittest.main()
