"""Record reproducible retrieval examples, not an accuracy evaluation."""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.vector_rag import ROOT, VectorRetriever

if __name__ == '__main__':
    retriever = VectorRetriever()
    questions = ['泊头鸭梨黑星病在什么条件下容易发生？', '梨采收时如何避免机械损伤？', '梨货架期如何控制温湿度？']
    report = {
        'created_at': datetime.now(timezone.utc).isoformat(),
        'kind': 'retrieval_smoke_not_accuracy_evaluation',
        'model': retriever.metadata['model'],
        'corpus_sha256': retriever.metadata['corpus_sha256'],
        'index_sha256': retriever.metadata['index_sha256'],
        'llm_used': False, 'graph_used': False,
        'cases': [{'question': q, 'results': retriever.search(q, 3)} for q in questions]
    }
    path = ROOT / 'data/botou_yali/evaluation/vector_retrieval_smoke.json'
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(path)
