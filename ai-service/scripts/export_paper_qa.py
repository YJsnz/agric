import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/botou_yali/evaluation/paper_qa_350'

def main():
    rows=[json.loads(s) for s in (OUT/'reviewed_questions.jsonl').read_text(encoding='utf-8').splitlines()]
    chunks={c['chunk_id']:c for c in map(json.loads,(ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl').read_text(encoding='utf-8').splitlines())}
    for r in rows:
        c=chunks[r['evidence']['chunk_id']]
        assert r['reference_answer'] in c['text'] and r['reference_answer']==r['evidence']['quote']
        assert not c.get('needs_layout_review') and c['source_type']=='paper'
        r['evidence_kind']='background_or_cited_discussion' if (r['evidence']['section'].startswith('0 ') or '引言' in r['question'] or re.search(r'\[\d+(?:[-,，]\d+)*\]',r['reference_answer'])) else 'reported_study_record'
        r['source_group']=r['gold_sources'][0]
        # Canonical graph labels require separate human alignment, not substring guesses.
        r['gold_entity_status']='surface_mentions_not_verified_graph_ids'
    rows.sort(key=lambda r:(r['evidence_kind']=='background_or_cited_discussion',r['gold_sources'][0],r['id']))
    if len(rows)<350:raise ValueError(f'只有{len(rows)}条通过机器复核的记录，拒绝填充')
    selected=rows[:350]
    for i,r in enumerate(selected,1):r['id']=f'QA_{i:04d}'
    path=OUT/'test_questions_350.jsonl'
    path.write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in selected)+'\n',encoding='utf-8')
    with (OUT/'test_questions_350.csv').open('w',encoding='utf-8-sig',newline='') as f:
        fields=['id','type','question','reference_answer','source_id','title','section','pages','source_url','chunk_id','evidence_kind','review_status']
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
        for r in selected:
            e=r['evidence'];writer.writerow({**{k:r[k] for k in fields if k in r},'source_id':r['gold_sources'][0],
                **{k:e[k] for k in ('title','section','source_url','chunk_id')},'pages':','.join(map(str,e['pages']))})
    lines=['# 鸭梨论文问答测试集：350题（待人工审定）','',
           '答案均为本地论文切块的原文片段，已经逐字校验和第二轮模型辅助题意审核。此文件不是专家审定金标准；背景记载不等于本研究实验验证。',
           '题目限定论文试验，不构成通用生产指导。页码为PDF物理页码。','']
    for r in selected:
        e=r['evidence'];lines.extend([f"## {r['id']} · {r['type']}",'',f"**问题：** {r['question']}",'',f"**答案（论文原文）：** {r['reference_answer']}",'',
            f"**定位：** {r['gold_sources'][0]} / {e['chunk_id']} / {e['section']} / PDF页 {e['pages']}",
            f"**记录类别：** {r['evidence_kind']}",f"**原始来源：** {e['source_url']}",''])
    (OUT/'测试题与答案350题.md').write_text('\n'.join(lines),encoding='utf-8')
    report={'selected':len(selected),'machine_reviewed_pool':len(rows),'human_approved':False,
        'exact_quote_checks_passed':len(selected),'unique_questions':len({r['question'] for r in selected}),
        'types':dict(Counter(r['type'] for r in selected)),'sources':dict(Counter(r['gold_sources'][0] for r in selected)),
        'evidence_kinds':dict(Counter(r['evidence_kind'] for r in selected)),
        'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    (OUT/'final_audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=True))

if __name__=='__main__':main()
