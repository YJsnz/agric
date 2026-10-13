import argparse,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.vector_rag import VectorRetriever,build_index

if __name__=='__main__':
    if hasattr(sys.stdout,'reconfigure'):sys.stdout.reconfigure(encoding='utf-8')
    p=argparse.ArgumentParser(description='BGE + FAISS 普通向量检索，不调用大模型')
    p.add_argument('--build',action='store_true');p.add_argument('--query');p.add_argument('--top-k',type=int,default=5);p.add_argument('--json',action='store_true')
    a=p.parse_args()
    if a.build:print(json.dumps(build_index(),ensure_ascii=False,indent=2))
    if a.query:
        results=VectorRetriever().search(a.query,a.top_k)
        if a.json:print(json.dumps(results,ensure_ascii=False,indent=2))
        else:
            for r in results:
                print(f"\nTop{r['rank']}  cosine={r['score']:.4f}  {r['chunk_id']}\n{r['title']}\n章节：{r['section']}  页码：{r['pages'] or '网页无页码'}\n来源：{r['source_url']}\n{r['text']}\n")
    if not a.build and not a.query:p.error('请提供 --build 或 --query')
