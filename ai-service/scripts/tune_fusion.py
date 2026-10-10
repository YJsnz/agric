"""Tune only on independently annotated validation candidates, never smoke data."""
import argparse
import itertools
import json
import math
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.fusion import fuse, FusionConfig

def metrics(results, judgments, k=5):
    if any(type(grade) is not int or not 0 <= grade <= 3 for grade in judgments.values()):
        raise ValueError('人工相关性等级必须为 0～3 的整数')
    relevant = {cid for cid, grade in judgments.items() if grade > 0}
    if not relevant:
        raise ValueError('评测查询至少须有一个标注相关块')
    ids = [r['chunk_id'] for r in results[:k]]
    grades = [judgments.get(cid, 0) for cid in ids]
    dcg = sum((2**g-1)/math.log2(i+2) for i,g in enumerate(grades))
    ideal = sum((2**g-1)/math.log2(i+2) for i,g in enumerate(sorted(judgments.values(),reverse=True)[:k]))
    return {'ndcg@5':dcg/ideal, 'recall@5':len(set(ids)&relevant)/len(relevant),
            'mrr@5': next((1/(i+1) for i,cid in enumerate(ids) if cid in relevant),0)}

if __name__ == '__main__':
    p=argparse.ArgumentParser()
    p.add_argument('validation',type=Path);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();data=json.loads(a.validation.read_text(encoding='utf-8'))
    if data.get('split')!='validation' or not data.get('human_annotated') or not data.get('queries'):
        raise ValueError('需要独立人工标注的 validation 集')
    trials=[]
    for k,gw,mu in itertools.product([10,60],[0,0.5,1,2],[0,0.05,0.15]):
        config=FusionConfig(rrf_k=k,graph_weight=gw,metadata_strength=mu)
        reports=[]
        for q in data['queries']:
            r=fuse(q['semantic'],q['chunks'],q['subgraph'],q['source_mapping'],q.get('context'),config=config)
            if any(row['chunk_id'] not in q['judgments'] for row in r['results']):
                raise ValueError('候选结果缺少人工标注')
            reports.append(metrics(r['results'],q['judgments']))
        trials.append({'config':r['config'],'metrics':{m:sum(x[m] for x in reports)/len(reports) for m in reports[0]}})
    trials.sort(key=lambda t:-t['metrics']['ndcg@5'])
    a.output.write_text(json.dumps({'split':'validation','best':trials[0],'trials':trials},indent=2),encoding='utf-8')
