"""Second-pass support review; does not substitute for expert gold adjudication."""
import concurrent.futures
import json
import sys
import time
from pathlib import Path
from urllib.request import Request,urlopen
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from graphrag.entity_extractor import settings
from build_paper_qa import OUT,ROOT,norm

def review(task):
    cid,rows,chunk=task
    path=OUT/'reviews'/f'{cid}.json'
    if path.exists():return json.loads(path.read_text(encoding='utf-8'))
    config=settings()
    prompt='''你是严格的论文问答审核员。输入为论文原文切块及待审核题目。
只保留原文确实能回答的问题。修正问法使之准确、独立、自包含、明确处理/时期/样本。删除同一知识点的重复问法。
删除作者机构/邮箱/刊号等无关题；删除参考文献、引言中转引其他研究的结论题；不要把讨论中“可能”“推测”“相关”改为已证明因果。
answer_quote须是提供原文的连续逐字片段，可改用更完整片段以补齐条件，禁止修改数字或字符。
引用片段若包含错乱表格/不完整数值，不采用；答案必须实际回答问题（问数量不能答“有较大差距”）。
只输出JSON {"approved":[{"original_id":"PQA_x","question":"修正后具体问题","answer_quote":"完整原文片段","type":"原类型或factual"}],"rejected":[{"id":"PQA_x","reason":"原因"}]}。
这是证据核查，不能为凑数放过问题。'''
    payload={'model':config['DEEPSEEK_MODEL'],'temperature':0,'max_tokens':7000,'response_format':{'type':'json_object'},
             'messages':[{'role':'system','content':prompt},{'role':'user','content':json.dumps({'title':chunk['title'],'text':chunk['text'],'questions':rows},ensure_ascii=False)}]}
    for attempt in range(3):
        try:
            req=Request('https://api.deepseek.com/chat/completions',data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+config['DEEPSEEK_API_KEY'],'Content-Type':'application/json'})
            with urlopen(req,timeout=100) as r:d=json.load(r)
            c=d['choices'][0]
            if c['finish_reason']!='stop':raise ValueError('truncated')
            result=json.loads(c['message']['content']);path.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');return result
        except Exception:
            if attempt==2:return {'approved':[],'error':'review_failed'}
            time.sleep(2)

def main():
    (OUT/'reviews').mkdir(exist_ok=True)
    rows=[json.loads(s) for s in (OUT/'questions.jsonl').read_text(encoding='utf-8').splitlines()]
    chunks={c['chunk_id']:c for c in map(json.loads,(ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl').read_text(encoding='utf-8').splitlines())}
    groups={}
    for row in rows:groups.setdefault(row['evidence']['chunk_id'],[]).append(row)
    tasks=[(cid,rs,chunks[cid]) for cid,rs in groups.items()]
    output=[];seen=set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for (cid,rs,c),result in zip(tasks,pool.map(review,tasks)):
            originals={r['id']:r for r in rs}
            for a in result.get('approved',[]):
                quote=a.get('answer_quote','');q=a.get('question','');oid=a.get('original_id')
                if oid not in originals or not quote or quote not in c['text'] or not q:continue
                key=(c['source_id'],norm(quote))
                if key in seen:continue
                seen.add(key);r=originals[oid].copy();r['question']=f"根据《{c['title']}》，{q}"
                r['reference_answer']=quote;r['type']=a.get('type',r['type'])
                r['evidence']={**r['evidence'],'quote':quote,'start_offset_in_chunk':c['text'].index(quote)}
                r['review_status']='verbatim_and_second_model_reviewed_pending_human';output.append(r)
            print(cid,'reviewed total',len(output),flush=True)
    for i,r in enumerate(output,1):r['id']=f'PQA_REVIEWED_{i:04d}'
    (OUT/'reviewed_questions.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in output)+'\n',encoding='utf-8')
    print('REVIEWED',len(output),flush=True)

if __name__=='__main__':main()
