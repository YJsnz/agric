"""Source-anchored QA draft generation. Answers must be exact local-paper spans."""
import concurrent.futures
import hashlib
import json
import re
import sys
import time
from pathlib import Path
from urllib.request import Request,urlopen
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.entity_extractor import settings
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/botou_yali/evaluation/paper_qa_350'
TYPES=['factual','disease','cultivation_management','environmental_risk','postharvest_storage','multi_hop','causal','intervention']

def norm(text):return re.sub(r'\s+','',text)

def generate(chunk):
    cache=OUT/'batches'/f"{chunk['chunk_id']}.json"
    if cache.exists():return json.loads(cache.read_text(encoding='utf-8'))
    n=min(16,max(4,len(chunk['text'])//65))
    system='''你是论文阅读测试出题员。只根据提供的论文段落提出互不重复的中文具体问题。
每题必须考察独立信息点，不要仅换一种问法凑数。忽略作者单位、页眉、参考文献、乱码、缺失表格、英语摘要重复内容。
问题明确限定本研究的材料、处理和时间；不要推广为泊头田间规律。不要把相关性或作者推测写成已证实因果。
每个 answer_quote 必须逐字复制原文中一个连续的完整答案片段，保留数字、条件、限定语；不得加字、纠错或翻译。
quote宜为20至300字。reference_answer将由程序直接取该原文，不另造答案。
type取 factual,disease,cultivation_management,environmental_risk,postharvest_storage,multi_hop,causal,intervention 之一；不要强行覆盖类别。
multi_hop需quote内至少两个明确证据环节，causal只能用于原文直接实验结果，其他相关性用factual。不要命题无依据的药剂剂量。
输出JSON对象 {"items":[{"question":"具体问题？","type":"factual","answer_quote":"连续原文","gold_entities":["原文实体词"]}]}。
如果原文没有足够独立信息可少出，严禁编造。'''
    config=settings()
    body={'model':config['DEEPSEEK_MODEL'],'temperature':0,'max_tokens':6500,'response_format':{'type':'json_object'},
          'messages':[{'role':'system','content':system},{'role':'user','content':json.dumps({'title':chunk['title'],'section':chunk['section'],'text':chunk['text'],'requested_questions':n},ensure_ascii=False)}]}
    for attempt in range(3):
        try:
            req=Request('https://api.deepseek.com/chat/completions',data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+config['DEEPSEEK_API_KEY'],'Content-Type':'application/json'})
            with urlopen(req,timeout=100) as r:response=json.load(r)
            choice=response['choices'][0]
            if choice['finish_reason']!='stop':raise ValueError('truncated')
            items=json.loads(choice['message']['content'])['items']
            cache.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
            return items
        except Exception:
            if attempt==2:return []
            time.sleep(2)

def main():
    OUT.joinpath('batches').mkdir(parents=True,exist_ok=True)
    corpus=ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl'
    chunks=[json.loads(s) for s in corpus.read_text(encoding='utf-8').splitlines()]
    chunks=[c for c in chunks if c['source_type']=='paper' and not c.get('needs_layout_review') and (len(re.findall('[\u4e00-\u9fff]',c['text']))>90 or (len(re.findall('[\u4e00-\u9fff]',c['text']))>25 and len(re.findall('[\u4e00-\u9fff]',c['text']))/len(c['text'])>0.2))]
    rows=[];rejected=[];seen_q=set();seen_a=set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for c,items in zip(chunks,pool.map(generate,chunks)):
            added=0
            for item in items:
                q=item.get('question','');a=item.get('answer_quote','');kind=item.get('type')
                reason=None
                if not isinstance(q,str) or not isinstance(a,str) or not 15<=len(a)<=500 or a not in c['text'] or kind not in TYPES:reason='invalid_or_not_verbatim'
                elif norm(q) in seen_q or (c['source_id'],norm(a)) in seen_a:reason='duplicate_question_or_answer'
                if reason:rejected.append({'chunk_id':c['chunk_id'],'reason':reason});continue
                seen_q.add(norm(q));seen_a.add((c['source_id'],norm(a)))
                rows.append({'question':f"根据《{c['title']}》的研究记录，{q}",'type':kind,
                    'gold_entities':[e for e in item.get('gold_entities',[]) if isinstance(e,str) and e in c['text']],
                    'gold_sources':[c['source_id']],'reference_answer':a,
                    'evidence':{'chunk_id':c['chunk_id'],'title':c['title'],'section':c['section'],'pages':c['pages'],
                                'page_basis':c['page_basis'],'source_url':c['source_url'],'quote':a,
                                'start_offset_in_chunk':c['text'].index(a),'text_sha256':c['text_sha256']},
                    'review_status':'verbatim_verified_question_semantics_pending_human_review',
                    'split':'unassigned','scope':'论文特定试验条件；非通用田间生产建议'})
                added+=1
            print(c['chunk_id'],added,'total',len(rows),flush=True)
    old_file=OUT/'questions.jsonl'
    old_rows=[json.loads(s) for s in old_file.read_text(encoding='utf-8').splitlines()] if old_file.exists() else []
    old_ids={(r['evidence']['chunk_id'],r['question']):r['id'] for r in old_rows}
    next_id=max((int(r['id'].split('_')[-1]) for r in old_rows),default=0)
    for row in rows:
        key=(row['evidence']['chunk_id'],row['question'])
        if key not in old_ids:
            next_id+=1;old_ids[key]=f'PQA_{next_id:04d}'
        row['id']=old_ids[key]
    (OUT/'questions.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+'\n',encoding='utf-8')
    report={'count':len(rows),'target':350,'human_approved':False,'corpus_sha256':hashlib.sha256(corpus.read_bytes()).hexdigest(),
            'sources':sorted({s for r in rows for s in r['gold_sources']}),'rejected':rejected,
            'types':{t:sum(r['type']==t for r in rows) for t in TYPES}}
    (OUT/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('DONE',len(rows),flush=True)

if __name__=='__main__':main()
