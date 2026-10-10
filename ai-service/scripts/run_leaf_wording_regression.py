"""Manual real GraphRAG regression: common farmer wording, no mocks."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from graph_web.server import load_graph
from graphrag.answer_service import ask_graphrag


def main():
    graph = load_graph()
    rows = []
    for wording in ['梨页有斑', '梨叶有斑', '梨叶子上有黑色斑点']:
        question = '作物：泊头鸭梨。用户提供所在地：河北省沧州市泊头市。' + wording
        result = ask_graphrag(question, graph)
        rows.append({'question': question, 'result': result})
        (ROOT / 'data/botou_yali/evaluation/leaf_wording_regression.json').write_text(
            json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps({'wording': wording, 'status': result['status'],
                          'sources': [s['source_id'] for s in result['sources']],
                          'generation_called': result['generation_called'],
                          'channels': result['channels'],
                          'answer': result['user_answer']}, ensure_ascii=False), flush=True)
        assert all(s['source_id'] != 'PAPER_001' for s in result['sources'])
        assert result['user_answer']


if __name__ == '__main__':
    main()
