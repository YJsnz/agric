import json
import re
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from pydantic import BaseModel,ConfigDict,Field
from .entity_extractor import settings,ExtractionError
from .dual_retriever import retrieve_dual
from .evidence_fusion import fuse_evidence
from .ranking import rank_evidence
from .query_policy import route_question
from .grounding import normalize_citations,audit_answer
from .prompt_builder import build_prompt

class GeneratedAnswer(BaseModel):
    model_config=ConfigDict(extra='forbid',strict=True)
    sufficient:bool
    conclusion:str=Field(max_length=3000)
    basis:str=Field(max_length=5000)
    reasoning:str=Field(max_length=3000)
    advice:str=Field(max_length=3000)
    citations:list[str]=Field(max_length=10)

def generate(messages):
    config=settings()
    if not config['DEEPSEEK_API_KEY']:raise ExtractionError('未配置 DeepSeek 密钥')
    payload={'model':config['DEEPSEEK_MODEL'],'messages':messages,'temperature':0,
             'max_tokens':2500,'response_format':{'type':'json_object'}}
    req=Request('https://api.deepseek.com/chat/completions',data=json.dumps(payload).encode(),
                headers={'Authorization':'Bearer '+config['DEEPSEEK_API_KEY'],'Content-Type':'application/json'})
    try:
        with urlopen(req,timeout=60) as response:data=json.load(response)
        choice=data['choices'][0]
        if choice['finish_reason']!='stop':raise ExtractionError('生成回答不完整，请重试')
        return GeneratedAnswer.model_validate_json(choice['message']['content'])
    except HTTPError as e:raise ExtractionError(f'DeepSeek 回答请求失败（HTTP {e.code}）') from None
    except (URLError,OSError):raise ExtractionError('DeepSeek 回答服务连接失败或超时') from None
    except (ValueError,KeyError,IndexError,TypeError):raise ExtractionError('回答格式校验失败，未采用生成结果') from None

def validate_citations(answer,evidence):
    allowed={e['evidence_id'] for e in evidence}
    text='\n'.join([answer.conclusion,answer.basis,answer.reasoning,answer.advice])
    inline=set(re.findall(r'\[(E\d+)\]',text))
    cited=set(answer.citations)
    if not cited<=allowed or inline!=cited or (answer.sufficient and (not cited or not inline)):
        raise ExtractionError('回答引用校验失败，未采用生成结果')
    return cited

def ask_graphrag(question,graph,top_k=5):
    policy=route_question(question)
    dual=retrieve_dual(question,graph,mode=policy['mode'],policy=policy)
    candidates,rejected=fuse_evidence(dual)
    base={'entities':list(dict.fromkeys(a['mention'] for a in dual['alignments'])),
          'extracted_entities':dual['entities'],'alignments':dual['alignments'],
          'channels':dual['channels'],'evidence_rejections':rejected,
          'corpus_sha256':dual['corpus_sha256'],'reasoning_paths':[],'sources':[],
          'generation_called':False,'policy':policy,'extraction_notice':dual.get('extraction_notice'),
          'pipeline_version':'agricultural-v2'}
    base['unresolved_entities']=dual.get('unresolved_entities',[])
    base['reference_materials']=dual.get('reference_materials',[])
    if dual.get('missing_scope'):
        names={'crop':'作物或品种','region':'种植或储藏所在地'}
        questions=['请补充'+names[k]+'。' for k in dual['missing_scope']]
        return {**base,'status':'needs_clarification','clarification_questions':questions,
                'answer':'当地生产建议还缺少适用条件。'+' '.join(questions)+'补充后再核查相应证据。'}
    if not candidates:
        # Reviewed research pointers remain outside the generator's evidence.
        if '梨' in question and any(term in question for term in ('高湿','湿度','湿润')):
            from pathlib import Path
            review_path=Path(__file__).resolve().parents[2]/'data/knowledge/metadata/humidity_gap_review.json'
            review=json.loads(review_path.read_text(encoding='utf-8'))
            extra=[{'source_id':s['source_id'],'title':s['title'],'url':s['url'],
                    'reasons':['仅为异地或受控研究；未验证泊头该阶段采后风险'],
                    'usable_for_answer':False} for s in review['sources']]
            dual['reference_materials']=extra+dual.get('reference_materials',[])[:2]
            base['reference_materials']=dual['reference_materials']
        unknown='、'.join(a['mention'] for a in dual.get('unresolved_entities',[]))
        detail=('尚未对齐：'+unknown+'。') if unknown else ''
        refs=dual.get('reference_materials',[])
        details='\n'.join(f"{r['title']}：{r['url']}（排除原因：{', '.join(r['reasons'])}；仅供资料核查，不用于本次结论）" for r in refs)
        clarification=[]
        if '持续高湿' in unknown:
            clarification=['请补充空气相对湿度、持续时间，以及叶片或果面是否持续有水膜；空气高湿不能直接等同于表面湿润。']
        return dict(base,status='insufficient_evidence',clarification_questions=clarification,
            answer='1. 结论\n证据不足，当前不能可靠回答该问题。\n2. 依据\n'+detail+'未检索到同时满足地区、作物和阶段的证据。\n3. 推理路径\n已对齐实体继续参与受约束检索，不能据此补造缺失的因果关系。\n4. 建议\n'+(' '.join(clarification) or '请补充有出处的当地适用资料。')+'\n5. 来源\n本次无符合条件的结论来源。'+('\n待核查资料（非结论依据）：\n'+details if details else ''))
    ranking=rank_evidence(question,candidates,top_k)
    ranked=ranking['results']
    base['ranking']={'fusion_config':ranking['fusion_config'],'candidate_count':ranking['candidate_count'],
                     'selected':[{'candidate_id':c['candidate_id'],'kind':c['kind'],
                                  'features':c['ranking_features']} for c in ranked]}
    messages,evidence=build_prompt(question,ranked,policy)
    draft=generate(messages)
    audit=None;failure=None
    for attempt in range(2):
        try:
            answer=normalize_citations(draft,evidence)
            cited=validate_citations(answer,evidence)
            audit=audit_answer(answer,evidence,policy,question)
            if audit['passed']:break
            failure='存在未由引用证据支持的内容'
        except ExtractionError as error:
            failure=str(error)
        if attempt==0:
            # One bounded revision. Evidence and scope remain unchanged.
            revision=messages+[{'role':'assistant','content':draft.model_dump_json()},
                {'role':'user','content':json.dumps({'instruction':'修正引用格式并删除证据不支持的内容；不可添加新证据。保留JSON格式。证据不足请明确拒答。',
                    'validation_error':failure,'checks':audit.get('checks',[]) if audit else []},ensure_ascii=False)}]
            draft=generate(revision)
    else:
        return {**base,'status':'validation_failed','generation_called':True,'grounding_audit':audit,
                'answer':'1. 结论\n本次回答未通过证据核查，未发布生成内容。\n2. 依据\n'+failure+
                         '\n3. 推理路径\n未发布未经核查的路径。\n4. 建议\n请缩小问题范围或补充原文资料。\n5. 来源\n暂无已通过核查的结论来源。'}
    sources={};paths=[]
    graph_sources={s['id']:s for s in dual['graph_sources']}
    for i,c in enumerate(ranked,1):
        if f'E{i}' not in cited:continue
        if c['kind']=='document_chunk':
            d=c['chunk'];sid=d['source_id']
            if sid not in sources:
                sources[sid]={'source_id':sid,'title':d['title'],'url':d['source_url'],'citations':[]}
            sources[sid]['citations'].append({'evidence_id':f'E{i}','chunk_id':d['chunk_id'],'section':d['section'],'pages':d.get('pages',[])})
        else:
            for j,e in enumerate(c['edges']):
                triple=[c['node_names'][j],e['relation'],c['node_names'][j+1]]
                if triple not in paths:paths.append(triple)
            for sid in c['source_ids']:
                s=graph_sources[sid]
                if 'kg:'+sid not in sources:
                    sources['kg:'+sid]={'source_id':sid,'title':s.get('title',s.get('name',sid)),'url':s.get('url',''),'citations':[]}
                sources['kg:'+sid]['citations'].append({'evidence_id':f'E{i}','edge_ids':[e['id'] for e in c['edges'] if sid in e['evidence_ids']]})
    rendered=f'1. 结论\n{answer.conclusion}\n2. 依据\n{answer.basis}\n3. 推理路径\n{answer.reasoning}\n4. 建议\n{answer.advice}\n5. 来源\n'+ '\n'.join(f"{' '.join('['+c['evidence_id']+']' for c in s['citations'])} {s['source_id']}：{s['title']} {s['url']}" for s in sources.values())
    return {**base,'status':'answered' if answer.sufficient else 'insufficient_evidence','answer':rendered,
            'sources':list(sources.values()),'reasoning_paths':paths,'evidence':evidence,
            'generation_called':True,'grounding_audit':audit,
            'validation':'引用格式规范化、编号校验及模型辅助证据核查；不是形式化蕴含证明'}
