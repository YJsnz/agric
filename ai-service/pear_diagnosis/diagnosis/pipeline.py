"""Compose the existing services; no diagnostic rules are implemented here."""
from threading import Lock

from pear_diagnosis.context.context import PearDiagnosisContext
from pear_diagnosis.vision.service import PearVisionService
from pear_diagnosis.knowledge.causal_service import PearKnowledgeService
from pear_diagnosis.diagnosis.candidate_ranker import PearCandidateRanker
from pear_diagnosis.rag.graphrag_adapter import run_pear_graphrag

DISCLAIMER = ('视觉 confidence 仅表示视觉症状分类置信度，不是疾病概率；'
              'ranking_score 仅为规则排序分，不是疾病概率；候选风险不是确诊。'
              '应结合证据适用范围与实际调查，不以本结果替代病原鉴定。')


class PearDiagnosisPipeline:
    def __init__(self):
        self._vision = None
        self._vision_lock = Lock()

    def diagnose(self, image_path, context: PearDiagnosisContext) -> dict:
        # YOLO's shared predictor is not used concurrently. Retrieval/generation
        # have per-request context and run outside this lock.
        with self._vision_lock:
            if self._vision is None:
                self._vision = PearVisionService()
            vision = self._vision.predict(image_path)
        knowledge = PearKnowledgeService().find_candidate_risks(vision['symptom'])
        ranking = PearCandidateRanker().rank(knowledge['candidate_risks'], context)
        adapter = run_pear_graphrag(vision, context, ranking, top_k=5)
        rag = adapter['graphrag']
        # Legacy visual clients already render graphrag.answer. Preserve the
        # original audited body separately, and expose the same simple guidance.
        if rag.get('user_answer'):
            rag = {**rag, 'grounded_answer': rag.get('answer'),
                   'answer': rag['user_answer']}
        sources = rag.get('sources', [])
        return {
            'status': rag['status'],
            'clarification_questions': rag.get('clarification_questions', []),
            'vision': vision, 'context': context.to_dict(),
            'knowledge_graph': knowledge, 'candidate_ranking': ranking,
            'graphrag': rag, 'sources': sources,
            'user_answer': rag.get('user_answer'),
            'general_guidance': rag.get('general_guidance'),
            'preliminary_assessment': rag.get('preliminary_assessment', {'available': False}),
            'local_conclusion': rag.get('local_conclusion', {'available': False}),
            'recommended_observations': rag.get('recommended_observations', []),
            'evidence_groups': rag.get('evidence_groups', {}),
            'reasoning_paths': rag.get('reasoning_paths', []),
            'grounding': rag.get('grounding_audit'),
            'citations': [c for source in sources for c in source.get('citations', [])],
            'retrieval_query': adapter.get('retrieval_query'),
            'diagnosis_context': adapter.get('diagnosis_context'),
            'disclaimer': DISCLAIMER,
        }
