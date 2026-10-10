"""Paired rerun, immutable V1 inputs and separate outputs; no gold in generation."""
import concurrent.futures as cf
import contextvars
import json
import time
import shutil
from datetime import datetime,timezone
from pathlib import Path
import baseline_experiment as b
from graphrag import answer_service as service
from graphrag.entity_extractor import extract_entities,settings
from graphrag.entity_aligner import align_entities,supplement_mentions
from graphrag.dual_retriever import retrieve_dual,path_candidates
from graphrag.graph_retriever import retrieve_subgraph
from graphrag.evidence_fusion import fuse_evidence
from graphrag.ranking import rank_evidence
from graphrag.reranker import get_reranker
from graphrag.vector_retriever import get_retriever
from graphrag.query_policy import route_question
from graphrag.prompt_builder import build_prompt
from graphrag.grounding import normalize_citations,audit_answer

OUT=b.ROOT/'data/botou_yali/evaluation/baseline_v2'
OLD=b.ROOT/'data/botou_yali/evaluation/baseline_v1'
CTX=contextvars.ContextVar('experiment_context')
A_SYSTEM='''你是农业知识辅助决策系统。依据自身已有知识回答问题。不知道具体论文内容时明确说明，不编造论文、标准、数字或因果关系。仅输出JSON：{"sufficient":true或false,"conclusion":"结论","basis":"依据","reasoning":"推理路径","advice":"建议","citations":[]}。简明回答，不调用外部工具。'''


def generation(messages):
    record=b.rpc(messages,lambda value:service.GeneratedAnswer.model_validate(value),2500)
    CTX.get()['calls'].append(record)
    return service.GeneratedAnswer.model_validate(record['result'])


def prepared_dual(question,graph,**kwargs):
    state=CTX.get()
    assert question==state['question']
    return state['prepared']['dual']


def prepared_ranking(question,candidates,top_k):
    state=CTX.get()
    assert question==state['question'] and top_k==5
    assert {c['candidate_id'] for c in candidates}==set(state['prepared']['D_admitted_ids'])
    return state['prepared']['D_ranking']


def captured_normalize(answer,evidence):
    result=normalize_citations(answer,evidence)
    CTX.get()['normalized']=result
    return result


def baseline_answer(question,candidates,arm):
    policy={'purpose':'unconstrained_baseline','notice':'依据检索证据回答，未执行农业范围筛选。'}
    messages,evidence=build_prompt(question,candidates,policy)
    if arm=='A':
        messages[0]['content']=A_SYSTEM
        answer=generation(messages)
        if answer.citations:raise ValueError('closed_book_citations')
        return answer,evidence,{'status':'answered' if answer.sufficient else 'insufficient_evidence'}
    if not candidates:
        return service.GeneratedAnswer(sufficient=False,conclusion='证据不足。',basis='',reasoning='',advice='',citations=[]),[],{'status':'insufficient_evidence'}
    draft=generation(messages);audit=None;failure=None
    for attempt in range(2):
        try:
            answer=normalize_citations(draft,evidence)
            service.validate_citations(answer,evidence)
            audit=audit_answer(answer,evidence,policy,question)
            if audit['passed']:return answer,evidence,{'status':'answered' if answer.sufficient else 'insufficient_evidence','grounding_audit':audit}
            failure='存在未由引用证据支持的内容'
        except service.ExtractionError as error:failure=str(error)
        if attempt==0:
            draft=generation(messages+[{'role':'assistant','content':draft.model_dump_json()},
                {'role':'user','content':json.dumps({'instruction':'修正引用格式并删除证据不支持的内容；不可添加新证据。保留JSON格式。证据不足请明确拒答。',
                 'validation_error':failure,'checks':audit.get('checks',[]) if audit else []},ensure_ascii=False)}])
    return None,evidence,{'status':'validation_failed','grounding_audit':audit,'failure':failure}


def task(row,arm,prepared,graph,chunks,docs):
    path=OUT/'answers'/f"{row['id']}_{arm}.json"
    if path.exists():return b.read(path)  # Finished outcomes, including failures, are immutable.
    state={'question':row['question'],'prepared':prepared,'calls':[]}
    token=CTX.set(state);start=time.perf_counter()
    candidates=[] if arm=='A' else docs[:5] if arm=='B' else prepared.get(arm,[])[:5]
    result={'id':row['id'],'arm':arm,'candidate_ids':[c['candidate_id'] for c in candidates]}
    try:
        if arm in 'CD' and 'error' in prepared:raise RuntimeError('retrieval_failed:'+prepared['error'])
        if arm=='D':
            output=service.ask_graphrag(row['question'],graph)
            result['service_response']=output
            evidence=output.get('evidence',[])
            if output['status']=='validation_failed':answer=None
            elif output.get('generation_called'):answer=state['normalized']
            else:answer=service.GeneratedAnswer(sufficient=False,conclusion=output['answer'],basis='',reasoning='',advice='',citations=[])
        else:
            answer,evidence,output=baseline_answer(row['question'],candidates,arm)
            result['service_response']=output
        result['evidence']=evidence
        if answer is None:
            result['error']='validation_failed'
        else:
            result['answer']=answer.model_dump()
            text='\n'.join(getattr(answer,k) for k in ('conclusion','basis','reasoning','advice'))
            cited={int(e[1:])-1 for e in answer.citations}
            result['citation_hit']=int(any(i<len(candidates) and candidates[i]['kind']=='document_chunk' and candidates[i]['chunk']['chunk_id']==row['evidence']['chunk_id'] for i in cited))
            result['citation_source_hit']=int(any(i<len(candidates) and candidates[i]['kind']=='document_chunk' and candidates[i]['chunk']['source_id'] in row['gold_sources'] for i in cited))
            result['entity_recall']=b.entity_recall(row,text)
            # Gold becomes visible only here, after the published answer has been fixed.
            payload={'question':row['question'],'reference_answer':row['reference_answer'],
                     'original_evidence':chunks[row['evidence']['chunk_id']]['text'],'retrieved_evidence':evidence,'answer':text}
            result['judge']=b.rpc([{'role':'system','content':b.JUDGE},
                                  {'role':'user','content':json.dumps(payload,ensure_ascii=False)}],b.validate_judge,2400)
    except Exception as error:
        result['error']=type(error).__name__+': '+str(error)[:160]
    finally:
        result['generation_calls']=state['calls'];result['seconds']=time.perf_counter()-start
        b.save(path,result);CTX.reset(token)
    print('ANSWER',row['id'],arm,result.get('judge',{}).get('result',{}).get('correctness',result.get('error')),flush=True)
    return result


def prepare(row,graph,docs):
    path=OUT/'retrieval'/(row['id']+'.json')
    if path.exists():return b.read(path)
    start=time.perf_counter()
    try:
        dual=retrieve_dual(row['question'],graph,policy=route_question(row['question']))
        # A common fixed resource budget, matching V1, applied before admission.
        paths=[c for c in dual['candidate_set'] if c['kind']=='graph_path'][:20]
        dual['candidate_set']=paths+[c for c in dual['candidate_set'] if c['kind']=='document_chunk']
        admitted,rejected=fuse_evidence(dual)
        d_rank=rank_evidence(row['question'],admitted,5)
        mentions=supplement_mentions(row['question'],graph,dual['entities'])
        aligned=align_entities(mentions,graph)
        nodes={n['id']:n for n in graph['nodes']}
        seeds=sorted(aligned['entity_ids'],key=lambda i:nodes[i]['type'] in ('Crop','Variety','Region','Stage','GrowthStage'))[:20]
        subgraph=retrieve_subgraph(graph,seeds,3,include_context=True)
        paths,truncated=path_candidates(subgraph,20)
        c_rank=get_reranker().rerank(row['question'],paths+docs,5,return_all=True)
        result={'dual':dual,'D_admitted_ids':[c['candidate_id'] for c in admitted],
                'D_ranking':d_rank,'C':c_rank['results'],'D':d_rank['results'],
                'D_rejections':rejected,'C_graph_candidates':len(paths),'D_graph_candidates':sum(c['kind']=='graph_path' for c in admitted),
                'seconds':time.perf_counter()-start}
    except Exception as error:result={'error':type(error).__name__+': '+str(error)[:160],'seconds':time.perf_counter()-start}
    b.save(path,result);return result


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    # Prevent concurrent runs writing the same question files.
    import msvcrt
    lock=(OUT/'run.lock').open('a+b');lock.seek(0);lock.write(b'0');lock.flush();lock.seek(0)
    msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
    b.OUT=OUT  # RPC validation diagnostics must never write into V1.
    old=b.read(OLD/'manifest.json')
    rows=[json.loads(s) for s in b.QA.read_text(encoding='utf-8').splitlines()]
    selected=[r for r in rows if r['id'] in old['selected_ids']]
    vector=get_retriever()
    assert b.sha(b.QA)==old['qa_sha256'] and vector.metadata['index_sha256']==old['index_sha256']
    for r in rows:assert r['reference_answer'] in vector.chunks[r['evidence']['chunk_id']]['text']
    files=list((b.ROOT/'graphrag').glob('*.py'))+[Path(__file__),Path(b.__file__)]
    frozen={'version':'paired-64-v2','selected_ids':[r['id'] for r in selected],'qa_sha256':b.sha(b.QA),
            'index_sha256':vector.metadata['index_sha256'],'graph_sha256':b.sha(OLD/'graph_snapshot.json'),
            'model':settings()['DEEPSEEK_MODEL'],'top_k':5,'graph_path_budget':20,'vector_candidates':20,
            'temperature':0,'max_tokens':2500,'judge_max_tokens':2400,'workers':4,
            'source_hashes':{str(f.relative_to(b.ROOT)):b.sha(f) for f in files},
            'comparison':'B/C/D share citation normalization, grounding and one revision. D uses production ask with prepared real retrieval.',
            'old_files':{str(f.relative_to(OLD)):b.sha(f) for f in OLD.rglob('*') if f.is_file()}}
    if (OUT/'manifest.json').exists():
        stored=b.read(OUT/'manifest.json')
        assert all(stored[k]==v for k,v in frozen.items()),'Frozen protocol changed'
    else:
        shutil.copyfile(OLD/'graph_snapshot.json',OUT/'graph_snapshot.json')
        for f in files:
            destination=OUT/'code_snapshot'/f.relative_to(b.ROOT);destination.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,destination)
        b.save(OUT/'manifest.json',{**frozen,'started_at':datetime.now(timezone.utc).isoformat()})
    graph=b.read(OUT/'graph_snapshot.json')
    assert b.sha(OUT/'graph_snapshot.json')==frozen['graph_sha256']
    for i,row in enumerate(rows):
        path=OUT/'vector'/(row['id']+'.json')
        if not path.exists():
            b.save(path,[{'candidate_id':'chunk:'+c['chunk_id'],'kind':'document_chunk','channel':'faiss','chunk':c} for c in vector.search(row['question'],20)])
        if (i+1)%50==0:print('VECTOR',i+1,flush=True)
    # Dependency adapters are process-local; no production service or code is changed.
    service.generate=generation;service.retrieve_dual=prepared_dual
    service.rank_evidence=prepared_ranking;service.normalize_citations=captured_normalize
    futures=[]
    with cf.ThreadPoolExecutor(max_workers=4) as pool:
        for row in selected:
            docs=b.read(OUT/'vector'/(row['id']+'.json'))
            for arm in 'AB':futures.append(pool.submit(task,row,arm,{},graph,vector.chunks,docs))
        for i,row in enumerate(selected):
            docs=b.read(OUT/'vector'/(row['id']+'.json'))
            prepared=prepare(row,graph,docs)
            for arm in 'CD':futures.append(pool.submit(task,row,arm,prepared,graph,vector.chunks,docs))
            print('RETRIEVAL',i+1,'/64','ERROR' if 'error' in prepared else 'ok',flush=True)
        for f in cf.as_completed(futures):f.result()
    assert all(b.sha(OLD/name)==digest for name,digest in frozen['old_files'].items()),'V1 modified'
    b.save(OUT/'completed.json',{'finished_at':datetime.now(timezone.utc).isoformat(),'old_files_unchanged':True,'outcomes':len(list((OUT/'answers').glob('*.json')))})
    print('COMPLETE; V1 files unchanged',flush=True)


if __name__=='__main__':main()
