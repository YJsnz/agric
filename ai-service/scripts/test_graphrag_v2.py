import copy
import sys
import unittest
from pathlib import Path
from unittest.mock import patch,MagicMock
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.query_policy import route_question,transition_target
from graphrag.entity_aligner import align_entities,supplement_mentions
from graphrag.evidence_fusion import fuse_evidence
from graphrag.grounding import normalize_citations
from graphrag.answer_service import GeneratedAnswer,validate_citations,ask_graphrag
from graphrag.entity_extractor import ExtractionError
from graphrag.ranking import rank_evidence
from graphrag.dual_retriever import retrieve_dual


def document():
    return {'candidate_id':'chunk:d1','kind':'document_chunk','chunk':{
        'chunk_id':'d1','source_id':'P1','title':'试验论文','text':'处理组的试验指标下降。',
        'section':'结果','pages':[1],'source_url':'https://example.org/paper',
        'crop':['鸭梨'],'region':['河北省'],'applicable_stages':['储藏期'],'evidence_level':'A','rank':1}}


def dual():
    return {'entities':{},'canonical_entities':{},'alignments':[],'channels':{},'corpus_sha256':'test',
            'candidate_set':[document()],'graph_sources':[]}


def answer(text='处理组指标下降。[E1]',citations=None):
    return GeneratedAnswer(sufficient=True,conclusion=text,basis='试验结果[E1]',reasoning='',advice='',citations=citations or ['E1'])


class PolicyTests(unittest.TestCase):
    def test_title_is_not_local_advice(self):
        self.assertEqual(route_question('根据《泊头鸭梨标准》，文中指标是什么？')['purpose'],'literature')
        self.assertEqual(route_question('根据《试验论文》，我家泊头鸭梨能照做吗？')['purpose'],'local_advice')
        self.assertEqual(route_question('根据《试验论文》，泊头可以采用这个方法吗？')['purpose'],'local_advice')
        self.assertEqual(route_question('黑星病有什么症状？')['purpose'],'general')

    def test_literature_scope_and_exact_title(self):
        d=dual();d['entities']={'region':'泊头市','stage':'果实膨大期'};d['canonical_entities']=d['entities']
        d['policy']=route_question('根据《试验论文》，结果是什么？')
        self.assertEqual(len(fuse_evidence(d)[0]),1)
        d['candidate_set'][0]['chunk']['title']='其他论文'
        self.assertFalse(fuse_evidence(d)[0])

    def test_unknown_is_distinct_from_mismatch(self):
        d=dual();d['entities']={'region':'泊头市'};d['canonical_entities']=d['entities']
        d['policy']={'purpose':'general','mode':'research','titles':[]}
        d['candidate_set'][0]['chunk']['region']=[]
        accepted,_=fuse_evidence(d)
        self.assertIn('region:unknown',accepted[0]['evidence_fusion']['warnings'])
        d['policy']['mode']='strict';self.assertFalse(fuse_evidence(d)[0])
        d['policy']['mode']='research';d['candidate_set'][0]['chunk']['region']=['广东省']
        self.assertFalse(fuse_evidence(d)[0])

    def test_cross_stage_requires_reviewed_transition(self):
        d=dual();d['entities']={'stage':'果实膨大期'};d['canonical_entities']=d['entities']
        d['policy']={'purpose':'local_advice','mode':'strict','titles':[]}
        d['graph_context_nodes']=[{'id':'c','type':'Crop','name':'鸭梨'},
            {'id':'s1','type':'GrowthStage','name':'果实膨大期'}, {'id':'s2','type':'GrowthStage','name':'储藏期'}]
        d['graph_sources']=[{'id':'doc','status':'read'}]
        e={'id':'e1','crop':'c','stage_ids':['s1','s2'],'region':'河北省','evidence_ids':['doc'],
           'locator':'3','evidence_level':'A','review_status':'source_checked',
           'from_stage':'s1','to_stage':'s2','transition_locator':'3.2','transition_evidence_ids':['doc']}
        e2={**e,'id':'e2','stage_ids':['s2']}
        for key in ('from_stage','to_stage','transition_locator','transition_evidence_ids'):e2.pop(key)
        d['candidate_set']=[{'candidate_id':'p','kind':'graph_path','edges':[e,e2]}]
        self.assertEqual(len(fuse_evidence(d)[0]),1)
        e.pop('transition_locator');self.assertFalse(fuse_evidence(d)[0])
        e['transition_locator']='3.2';e['to_stage']='invented'
        self.assertIsNone(transition_target(e,'果实膨大期',{n['id']:n for n in d['graph_context_nodes']}))

    def test_navigation_is_not_stage_occurrence(self):
        d=dual();d['entities']={'stage':'果实膨大期'};d['canonical_entities']=d['entities']
        d['policy']={'purpose':'local_advice','mode':'strict','titles':[]}
        d['graph_context_nodes']=[{'id':'c','name':'鸭梨','type':'Crop'}]
        d['graph_sources']=[{'id':'doc','status':'read'}]
        e={'id':'e','crop':'c','stage_ids':[],'evidence_ids':['doc'],'locator':'3',
           'evidence_level':'A','review_status':'source_checked','relation':'HAS_DISEASE'}
        d['candidate_set']=[{'candidate_id':'p','kind':'graph_path','edges':[e]}]
        accepted,_=fuse_evidence(d)
        self.assertIn('navigation_only:not_current_stage_occurrence',accepted[0]['evidence_fusion']['warnings'])

    def test_extended_entities_and_synonyms(self):
        graph={'nodes':[{'id':'q','name':'果实硬度','type':'Metric'},
            {'id':'i','name':'分选','type':'Intervention'},{'id':'r','name':'腐烂风险','type':'PostharvestRisk'},
            {'id':'s','name':'储藏期','type':'GrowthStage'}]}
        mentions=supplement_mentions('分选影响果实硬度及腐烂风险吗？',graph,{'stage':'贮藏期'})
        result=align_entities(mentions,graph)
        self.assertEqual(set(result['entity_ids']),{'q','i','r','s'})

    def test_transfer_pending_is_research_only(self):
        d=dual();d['graph_context_nodes']=[];d['graph_sources']=[{'id':'doc','status':'read'}]
        edge={'id':'e','evidence_level':'A','evidence_ids':['doc'],'locator':'section 1',
              'review_status':'transfer_pending','region':'US-CA'}
        d['candidate_set']=[{'candidate_id':'p','kind':'graph_path','edges':[edge]}]
        d['policy']={'purpose':'general','mode':'research','titles':[]}
        accepted,_=fuse_evidence(d)
        self.assertIn('research_only:local_transfer_unvalidated',accepted[0]['evidence_fusion']['warnings'])
        d['policy']={'purpose':'local_advice','mode':'strict','titles':[]}
        self.assertFalse(fuse_evidence(d)[0])

    def test_missing_local_scope_never_generates_advice(self):
        d=dual();d['missing_scope']=['region']
        with patch('graphrag.answer_service.retrieve_dual',return_value=d),patch('graphrag.answer_service.generate') as gen:
            result=ask_graphrag('我家的鸭梨应该怎么办？',{})
        self.assertEqual(result['status'],'needs_clarification');gen.assert_not_called()

    def test_extraction_failure_has_explicit_lexical_fallback(self):
        vector=MagicMock();vector.metadata={'corpus_sha256':'x'};vector.search.return_value=[]
        graph={'nodes':[{'id':'d','name':'黑星病','type':'Disease'}]}
        with (patch('graphrag.dual_retriever.extract_entities',side_effect=ExtractionError('bad')),
             patch('graphrag.dual_retriever.get_retriever',return_value=vector),
             patch('graphrag.dual_retriever.retrieve_subgraph',return_value={'nodes':[],'edges':[],'sources':[]})):
            result=retrieve_dual('黑星病有什么症状？',graph)
        self.assertEqual(result['entity_ids'],['d']);self.assertIsNotNone(result['extraction_notice'])


class CitationTests(unittest.TestCase):
    def test_normalization_does_not_invent_evidence(self):
        evidence=[{'evidence_id':'E1'},{'evidence_id':'E2'}]
        for text in ['结论E1','结论[E1]','结论【E1】','结论[E1,E2]','结论[E1][E2]']:
            result=normalize_citations(answer(text),evidence)
            validate_citations(result,evidence)
            self.assertNotIn('[[',result.conclusion)
            if 'E2' in text:self.assertIn('[E2]',result.conclusion)
        with self.assertRaises(ExtractionError):normalize_citations(answer('结论E99'),evidence)
        missing=answer('没有引用');missing.basis=''
        with self.assertRaises(ExtractionError):normalize_citations(missing,evidence)

    def test_fusion_is_used_after_neural_ranking(self):
        a=document();a['rank']=2;a['evidence_fusion']={'matches':{'region':1}}
        b=copy.deepcopy(a);b['candidate_id']='chunk:b';b['chunk']['evidence_level']='C';b['rank']=1
        fake=MagicMock();fake.rerank.return_value={'results':[b,a],'candidate_count':2}
        with patch('graphrag.ranking.get_reranker',return_value=fake):
            result=rank_evidence('问题',[a,b])
        self.assertEqual(result['results'][0]['candidate_id'],'chunk:d1')
        self.assertFalse(result['fusion_config']['calibrated'])

    def run_ask(self,draft,audits):
        ranking={'results':[dict(document(),ranking_features={})],'fusion_config':{},'candidate_count':1}
        with (patch('graphrag.answer_service.retrieve_dual',return_value=dual()),
             patch('graphrag.answer_service.rank_evidence',return_value=ranking) as rank,
             patch('graphrag.answer_service.generate',return_value=draft) as gen,
             patch('graphrag.answer_service.audit_answer',side_effect=audits)):
            result=ask_graphrag('根据《试验论文》，指标如何变化？',{})
        rank.assert_called_once();return result,gen.call_count

    def test_answer_source_is_actual_selected_document(self):
        result,calls=self.run_ask(answer('处理组指标下降E1'),[{'passed':True,'checks':[]}])
        self.assertEqual(calls,1);self.assertEqual(result['sources'][0]['source_id'],'P1')
        self.assertEqual(result['pipeline_version'],'agricultural-v2')

    def test_unsupported_answer_is_not_published(self):
        result,calls=self.run_ask(answer('风险下降99%[E1]'),[{'passed':False,'checks':[]}]*2)
        self.assertEqual(calls,2);self.assertEqual(result['status'],'validation_failed')
        self.assertNotIn('99%',result['answer']);self.assertEqual(result['sources'],[])


if __name__=='__main__':unittest.main()
