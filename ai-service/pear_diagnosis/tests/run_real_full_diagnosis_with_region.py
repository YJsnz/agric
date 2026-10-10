"""人工运行：模拟用户补充地区后继续诊断。无 mock，不修改业务状态。"""
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
REGION = '河北省沧州市泊头市'
REGION_SOURCE = 'user_provided_for_test'


def dump(value):
    print(json.dumps(value, ensure_ascii=False, indent=2), flush=True)


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')
    stage = '准备环境'
    observations = {'deepseek_http_responses': 0, 'calls': {}, 'completed': {}}
    try:
        if not os.environ.get('DEEPSEEK_API_KEY', '').strip():
            raise RuntimeError('DEEPSEEK_API_KEY 未设置，停止真实测试')
        from pear_diagnosis.vision.service import PearVisionService
        from pear_diagnosis.knowledge.causal_service import PearKnowledgeService
        from pear_diagnosis.context.context import PearDiagnosisContext
        from pear_diagnosis.diagnosis.candidate_ranker import PearCandidateRanker
        from pear_diagnosis.rag.graphrag_adapter import run_pear_graphrag
        from pear_diagnosis.rag.query_builder import build_retrieval_query

        image_dir = ROOT.parent / 'ai-training/pear-vision/data/prepared/classification/test/spot'
        images = sorted(p for p in image_dir.iterdir() if p.is_file()
                        and not p.name.startswith('._')
                        and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.bmp'})
        if not images:
            raise FileNotFoundError(f'没有测试集图片：{image_dir}')
        image = images[0]
        print('本测试模拟第二轮用户明确输入地区；不是系统根据品种推断。', flush=True)
        stage = '[1/6] YOLO视觉识别'
        print(stage, flush=True)
        print(f'image_path: {image}', flush=True)
        vision = PearVisionService().predict(image)
        dump(vision)

        stage = '[2/6] Vision → KG'
        print(stage, flush=True)
        knowledge = PearKnowledgeService().find_candidate_risks(vision['symptom'])
        counts = {'matched_symptom_count': len(knowledge['matched_symptom_nodes']),
                  'candidate_count': len(knowledge['candidate_risks'])}
        dump(counts)

        stage = '[3/6] 候选风险排序'
        print(stage, flush=True)
        context = PearDiagnosisContext(crop='泊头鸭梨', organ='leaf', region=REGION)
        dump({'context': context.to_dict(), 'region_source': REGION_SOURCE})
        ranked = PearCandidateRanker().rank(knowledge['candidate_risks'], context)
        dump(ranked)

        stage = '[4/6] GraphRAG双路检索'
        print(stage, flush=True)
        dump({'retrieval_query': build_retrieval_query(vision, context, ranked),
              'diagnosis_context': {'vision': vision, 'context': context.to_dict(),
                                    'candidate_ranking': ranked},
              'region_source': REGION_SOURCE})
        watched = {
            ('graph_web.server', 'load_graph'), ('server', 'load_graph'),
            ('graphrag.graph_retriever', 'retrieve_subgraph'),
            ('app.vector_rag', 'search'), ('graphrag.evidence_fusion', 'fuse_evidence'),
            ('graphrag.answer_service', 'generate'),
            ('graphrag.answer_service', 'validate_citations'),
            ('graphrag.grounding', 'audit_answer'),
        }

        def observe(frame, event, arg):
            nonlocal stage
            module, name = frame.f_globals.get('__name__'), frame.f_code.co_name
            if (module, name) in watched:
                key = module + '.' + name
                if event == 'call':
                    observations['calls'][key] = observations['calls'].get(key, 0) + 1
                    if name == 'generate' and stage.startswith('[4/6]'):
                        stage = '[5/6] DeepSeek生成与证据约束'
                        print(stage, flush=True)
                elif event == 'return' and arg is not None:
                    observations['completed'][key] = observations['completed'].get(key, 0) + 1
            if module == 'urllib.request' and name == 'urlopen' and event == 'return' and arg is not None:
                url = getattr(frame.f_locals.get('url'), 'full_url', '')
                if url.startswith('https://api.deepseek.com/'):
                    observations['deepseek_http_responses'] += 1

        previous_profile = sys.getprofile()
        try:
            sys.setprofile(observe)  # 只观察调用，不替换函数或网络响应。
            result = run_pear_graphrag(vision, context, ranked, top_k=5)
        finally:
            sys.setprofile(previous_profile)
        if stage.startswith('[4/6]'):
            stage = '[5/6] DeepSeek生成与证据约束'
            print(stage + '：现有流程提前返回，未进入生成层。', flush=True)
        stage = '[6/6] 最终研判'
        print(stage, flush=True)
        rag = result['graphrag']
        assert result['diagnosis_context']['context']['region'] == REGION
        summary = {
            'image_path': str(image), 'vision': vision, 'context': context.to_dict(),
            'region_source': REGION_SOURCE, 'kg': counts, 'ranking': ranked,
            'retrieval_query': result['retrieval_query'], 'retrieval': rag.get('channels'),
            'status': rag.get('status'), 'generation_called': rag.get('generation_called'),
            'answer': rag.get('answer'), 'clarification_questions': rag.get('clarification_questions', []),
            'citations': [c for s in rag.get('sources', []) for c in s.get('citations', [])],
            'grounding': rag.get('grounding_audit'), 'sources': rag.get('sources', []),
            'evidence': rag.get('evidence', []), 'execution_observation': observations,
        }
        dump(summary)
        print('完整最终JSON：', flush=True)
        dump({'summary': summary, 'knowledge': knowledge, **result})
        print('confidence仅为视觉分类置信度；ranking_score不是疾病概率。', flush=True)
    except Exception:
        print(f'失败阶段：{stage}', file=sys.stderr, flush=True)
        dump({'execution_observation': observations})
        raise


if __name__ == '__main__':
    main()
