"""Explicit real integration run; failures retain complete tracebacks."""
import json,traceback
from .service import QUESTIONS,ask
from .build import ROOT,save

def main():
    results=[]
    for i,q in enumerate(QUESTIONS,1):
        print(f'[{i}/5] {q}',flush=True)
        try:
            result=ask(q)
            print(json.dumps({k:result[k] for k in ['status','generation_called','retrieval','grounding']},ensure_ascii=False),flush=True)
        except Exception:
            result={'question':q,'status':'exception','traceback':traceback.format_exc()};print(result['traceback'],flush=True)
        results.append(result);save(ROOT/'evaluation/real_qa_reviewed.json',results)
    if any(r['status']=='exception' for r in results):raise SystemExit(1)

if __name__=='__main__':main()
