"""Persist synthetic mechanism checks separately from real corpus admission."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.evidence_fusion import fuse_evidence
from test_evidence_fusion import example
ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
    accepted,rejected=fuse_evidence(example())
    report={'synthetic_example_not_agronomic_evidence':{'accepted':[c['candidate_id'] for c in accepted],'rejected':rejected}}
    metadata=json.loads((ROOT/'data/botou_yali/vector/metadata.json').read_text(encoding='utf-8'))
    context={'region':'泊头市','crop':'泊头鸭梨','stage':'储藏期'}
    dual={'entities':context,'canonical_entities':context,'candidate_set':[
        {'candidate_id':c['chunk_id'],'kind':'document_chunk','chunk':c} for c in metadata['chunks']]}
    accepted,rejected=fuse_evidence(dual)
    report['real_corpus']={'context':context,'corpus_sha256':metadata['corpus_sha256'],
        'input_count':len(dual['candidate_set']),'accepted_count':len(accepted),'rejected_count':len(rejected),
        'accepted_ids':[c['candidate_id'] for c in accepted],'rejected':rejected}
    (ROOT/'data/botou_yali/evaluation/evidence_fusion_check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('synthetic accepted: A; real corpus:',len(accepted),'accepted,',len(rejected),'rejected')
