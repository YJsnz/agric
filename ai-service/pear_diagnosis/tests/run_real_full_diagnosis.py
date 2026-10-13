"""人工执行真实图片到 GraphRAG 测试，不由 unittest 收集，不使用 mock。"""
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))


def dump(value):
    print(json.dumps(value, ensure_ascii=False, indent=2), flush=True)


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')
    stage = '准备环境'
    try:
        if not os.environ.get('DEEPSEEK_API_KEY', '').strip():
            raise RuntimeError('DEEPSEEK_API_KEY 未设置，停止真实测试')
        from pear_diagnosis.vision.service import PearVisionService
        from pear_diagnosis.knowledge.causal_service import PearKnowledgeService
        from pear_diagnosis.context.context import PearDiagnosisContext
        from pear_diagnosis.diagnosis.candidate_ranker import PearCandidateRanker
        from pear_diagnosis.rag.graphrag_adapter import run_pear_graphrag

        image_dir = ROOT.parent / 'ai-training/pear-vision/data/prepared/classification/test/spot'
        images = sorted(p for p in image_dir.iterdir()
                        if p.is_file() and not p.name.startswith('._')
                        and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.bmp'})
        if not images:
            raise FileNotFoundError(f'没有测试集图片：{image_dir}')
        image = images[0]
        stage = '[1/5] YOLO视觉识别'
        print(stage, flush=True)
        print(f'真实测试图片：{image}', flush=True)
        vision = PearVisionService().predict(image)
        dump(vision)

        stage = '[2/5] Vision → KG'
        print(stage, flush=True)
        knowledge = PearKnowledgeService().find_candidate_risks(vision['symptom'])
        print(f"匹配症状：{len(knowledge['matched_symptom_nodes'])}；候选关系：{len(knowledge['candidate_risks'])}", flush=True)

        stage = '[3/5] 候选风险排序'
        print(stage, flush=True)
        context = PearDiagnosisContext(crop='泊头鸭梨', organ='leaf')
        dump(context.to_dict())
        ranked = PearCandidateRanker().rank(knowledge['candidate_risks'], context)
        for item in ranked:
            print(f"{item['candidate_name']} → {item['symptom_name']}：规则分 {item['ranking_score']}", flush=True)

        stage = '[4/5] GraphRAG证据检索'
        print(stage, flush=True)
        # 仅观察真实 urlopen 的成功返回，不替换网络函数，不打印请求头或密钥。
        network = {'deepseek_http_responses': 0}
        previous_profile = sys.getprofile()

        def observe(frame, event, arg):
            if event == 'return' and frame.f_code.co_name == 'urlopen' and arg is not None:
                if frame.f_globals.get('__name__') == 'urllib.request':
                    request = frame.f_locals.get('url')
                    url = getattr(request, 'full_url', '')
                    if url.startswith('https://api.deepseek.com/'):
                        network['deepseek_http_responses'] += 1

        try:
            sys.setprofile(observe)
            result = run_pear_graphrag(vision, context, ranked, top_k=5)
        finally:
            sys.setprofile(previous_profile)

        stage = '[5/5] 最终研判'
        print(stage, flush=True)
        rag = result['graphrag']
        channels = rag.get('channels', {})
        summary = {
            'visual_symptom': vision['symptom'],
            'visual_confidence': vision['confidence'],
            'kg_matched_symptom_count': len(knowledge['matched_symptom_nodes']),
            'kg_candidate_count': len(knowledge['candidate_risks']),
            'ranked_candidate_names': [item['candidate_name'] for item in ranked],
            'graphrag_status': rag.get('status'),
            'graph_retrieval_count': channels.get('neo4j', {}).get('count'),
            'vector_retrieval_count': channels.get('faiss', {}).get('count'),
            'deepseek_http_responses': network['deepseek_http_responses'],
            'generation_called': rag.get('generation_called'),
            'answer': rag.get('answer'),
            'sources': rag.get('sources', []),
            'grounding_audit': rag.get('grounding_audit'),
        }
        dump(summary)
        print('完整 JSON：', flush=True)
        dump({'image_path': str(image), 'knowledge': knowledge, **result,
              'execution_observation': network, 'summary': summary})
        print('视觉 confidence 为症状分类置信度；ranking_score 为规则排序分，均不是疾病确诊概率。', flush=True)
        print('DeepSeek HTTP 成功响应不等于生成层已调用，请结合 generation_called 判断。', flush=True)
    except Exception:
        print(f'失败阶段：{stage}', file=sys.stderr, flush=True)
        raise


if __name__ == '__main__':
    main()
