import json
import sys
import time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.reranker import get_reranker
ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    cases=json.loads((ROOT/'data/botou_yali/evaluation/dual_retrieval_smoke.json').read_text(encoding='utf-8'))
    model=get_reranker();results=[]
    for case in cases:
        start=time.perf_counter()
        result=model.rerank(case['request']['question'],case['response']['candidate_set'],5)
        result['elapsed_seconds']=time.perf_counter()-start
        results.append({'question':case['request']['question'],'result':result})
        print('candidates',result['candidate_count'],'windows',result['window_count'],'seconds',round(result['elapsed_seconds'],2),flush=True)
    (ROOT/'data/botou_yali/evaluation/reranker_smoke.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
