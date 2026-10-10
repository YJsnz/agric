"""Visual adapter to the existing crop-isolated wheat retrieval and GraphRAG.

The generic pear dual retriever has a different schema/index. Wheat retrieval,
admission and ranking are shared with wheat.service.ask, never reimplemented.
"""
import json
import logging
from queue import Queue, Empty
from threading import BoundedSemaphore, Thread
from .kg_adapter import build_entity_hints, align_visual_entities

logger = logging.getLogger(__name__)
_vector_slot = BoundedSemaphore(1)


def bounded_vector_search(search, *args, timeout=90):
    """Bound encoder latency; at most one lingering worker after timeout."""
    if not _vector_slot.acquire(blocking=False):
        raise TimeoutError('vector retrieval busy')
    result = Queue(maxsize=1)
    def work():
        try:
            result.put((True, search(*args)))
        except Exception as error:
            result.put((False, error))
        finally:
            _vector_slot.release()
    Thread(target=work, daemon=True).start()
    try:
        ok, value = result.get(timeout=timeout)
    except Empty:
        raise TimeoutError('vector retrieval timeout') from None
    if not ok:
        raise value
    return value


def prepare_retrieval(fused):
    context = dict(fused['environment_context'])
    measurements = {k: ({'value':context[k], 'unit':None, 'source':'user_provided'}
                        if context.get(k) is not None else None)
                    for k in ('soil_moisture','soil_salinity','temperature','humidity')}
    hints = build_entity_hints(fused['candidate_signals'])
    labels = [s['label_zh'] for s in fused['candidate_signals'] if s.get('label_zh')]
    terms = list(dict.fromkeys(t for h in hints for t in h['search_terms'] if any('\u4e00' <= c <= '\u9fff' for c in t)))
    parts = ['小麦田间视觉候选研判', *labels, *terms]
    if context.get('growth_stage'):
        parts.append('生育阶段：'+context['growth_stage'])
    if context.get('region'):
        parts.append('用户所在地：'+context['region'])
    query = '；'.join(parts)
    if len(query) > 500:
        raise ValueError('检索查询超过500字')
    structured = {'crop':'黄骅旱碱麦', 'visual_findings':labels,
                  'visual_evidence':fused['candidate_signals'],
                  'visual_observations':fused['visual_observations'],
                  'environment_context':context, 'measurements':measurements,
                  'region_source':'user_provided' if context.get('region') else None,
                  'retrieval_hints':hints,
                  'user_goal':'评估候选风险、证据缺口和下一步核验，不作现场确诊'}
    return {'retrieval_query':query,'diagnosis_context':fused,
            'structured_query_context':structured,'entity_hints':hints}


def disabled_knowledge():
    return {'enabled':False,'kg_entities':[],'aligned_entities':[],
            'graph_evidence':[],'vector_evidence':[],'evidence':[],
            'graphrag_result':None}


INSTRUCTIONS = '''本次为小麦多模态候选研判，所有视觉输出都不是确诊，模型分数不是疾病概率。
environment_context中的leaf_position、field_distribution、recent_operations、progression是用户观察，
仅用于区分下一步需要核验的问题，不是已验证的病因证据。不得将施药时间相关性写成药害因果。
优先回答下一步如何核验；不重复泛泛的资料不足表述。没有相应证据时不要编造具体疾病或处方。
Model A缺氮类黄化不能确认缺氮；Model B只是花后亏缺灌溉处理组弱监督视觉相似性。
Model C麦穗计数仅为表型，不能据此推断疾病、实际密度、缺水或产量损失。
visual_evidence和用户environment_context不是文献证据，不能充当[E编号]引用。
用户未提供的地区和环境条件保持未知，禁止从作物黄骅旱碱麦推断所在地。
measurements中unit=null的数值不能推断%、‰、摄氏度或分级阈值，不能判断干旱程度。
最终文字只解释检索资料支持的候选及不确定性；视觉分数/计数在API另行展示，无须写进事实段落。
不能把资料提到的其他病害说成图像已出现的症状。锈病名录不等于症状匹配或当地已发病。
通用/河北/沧州资料不等于黄骅用户地块实证。不得输出“已患”“确定为”“确诊为”等确定性诊断。
建议仅提供观察、补充信息或现场复核；不从视觉类别推荐药剂、剂量或生产处方。
引用原文只提及其他标准时，不能补造该标准正文。保持sufficient=false。
本次不是青县或泊头诊断，禁止引用提示模板中的地区作为用户所在地。
四个文本字段不得复述视觉分类、图中症状、计数或测量值；这些由独立visual_observations字段展示。
conclusion仅写引用资料支持的一条有条件的候选知识，并就地标注[E编号]；不要描述图像中已出现该病。
每个包含“资料没有/不涉及/未提供”的判断同样附实际被讨论资料的引用，不泛称全部资料。
没有证据支持的字段输出空字符串，尤其advice可以为空；不要添加孢子堆、霉层等未在原文出现的鉴别细节。
无症状信号的正常冠层/仅麦穗计数请求，不能凭空新增风险名称；可仅说明资料中的适用条件并附引用。
'''


def run_wheat_graphrag(fused):
    # Lazy imports: knowledge_enabled=false never touches retrieval or LLM.
    from wheat import service as wheat
    from graphrag.query_policy import route_question
    from graphrag.crop_runtime import grounded_answer

    prepared = prepare_retrieval(fused)
    question = prepared['retrieval_query']
    policy = route_question(question)
    user = fused['environment_context']
    context = wheat.extract(question)
    # Explicit context overrides extractor hints, including inferred dry soil.
    context.update(crop=wheat.CROP, region=user.get('region'),
                   growth_stage=user.get('growth_stage'),
                   soil_moisture=user.get('soil_moisture'),
                   soil_salinity=None, temperature=user.get('temperature'))
    warnings = []
    graph_status = 'ok'
    try:
        graph = wheat.load_graph()
        if any(not n['id'].startswith(wheat.CROP+':') for n in graph['nodes']):
            raise ValueError('wheat namespace mismatch')
    except Exception as error:
        graph_status = 'unavailable'
        logger.warning('[WHEAT] Neo4j unavailable (%s)', type(error).__name__)
        warnings.append({'component':'neo4j','message':'图谱检索不可用，尝试仅使用小麦文档证据。'})
        # Source catalogue for vector citations only, NOT a graph fallback.
        graph = {'nodes':[],'edges':[],'sources':[]}
        try:
            snapshot = json.loads((wheat.ROOT/'graph/graph-v1.json').read_text(encoding='utf-8'))
            graph['sources'] = snapshot['sources']
        except (OSError, ValueError, KeyError):
            pass
    aligned = align_visual_entities(fused['candidate_signals'], graph)
    vector_status = 'ok'
    def vector_search(*args):
        nonlocal vector_status
        try:
            return bounded_vector_search(wheat.search, *args)
        except Exception as error:
            vector_status = 'unavailable'
            logger.warning('[WHEAT] Vector unavailable (%s)', type(error).__name__)
            warnings.append({'component':'vector','message':'向量检索不可用；仅保留成功取得的图谱证据。'})
            return []
    try:
        retrieved = wheat.retrieve_evidence(question, context, graph, vector_search=vector_search,
                                             entity_ids=[a['entity_id'] for a in aligned])
    except Exception as error:
        logger.warning('[WHEAT] Retrieval/fusion unavailable (%s)', type(error).__name__)
        warnings.append({'component':'retrieval','message':'检索或证据融合失败，未生成结论。'})
        retrieved = {'graph_hits':[],'vectors':[],'evidence':[]}
        graph_status = vector_status = 'unavailable'
    source_by_id = {s['id']:s for s in graph['sources']}
    evidence = []
    for item in retrieved['evidence']:
        source = source_by_id.get(item['source_id'])
        if not source or not source.get('url'):
            warnings.append({'component':'citation','message':'缺少可追溯来源，未将该资料交给生成层。'})
            continue
        evidence.append({**item, 'source_metadata':source, 'url':source['url'],
                         'evidence_level':item['metadata'].get('evidence_level'),
                         'evidence_role':'candidate_explanation',
                         'usable_for_local_conclusion':False})
    knowledge = {'enabled':True, **prepared, 'policy':policy,
                 'kg_entities':aligned,'aligned_entities':aligned,
                 'graph_evidence':retrieved['graph_hits'],
                 'graph_nodes':graph['nodes'], 'graph_sources':graph['sources'],
                 'vector_evidence':retrieved['vectors'], 'evidence':evidence,
                 'visual_evidence':fused['candidate_signals'],'knowledge_evidence':evidence,
                 'retrieval':{'graph_status':graph_status,'vector_status':vector_status,
                              'graph_evidence_count':len(retrieved['graph_hits']),
                              'vector_evidence_count':len(retrieved['vectors'])}}
    from graphrag.dual_retriever import path_candidates
    paths, truncated = path_candidates({'nodes':graph['nodes'],'edges':retrieved['graph_hits'],
                                        'seed_ids':[a['entity_id'] for a in aligned]})
    knowledge.update(reasoning_paths=paths, paths_truncated=truncated)
    result = {'status':'insufficient_evidence','generation_called':False,
              'grounding':None,'citations':[],'preliminary_assessment':{'available':False}}
    if evidence:
        try:
            result = grounded_answer(question, prepared['structured_query_context'],
                                     evidence, graph['sources'], INSTRUCTIONS)
        except Exception as error:
            logger.warning('[WHEAT] Generation/grounding unavailable (%s)', type(error).__name__)
            from graphrag.entity_extractor import ExtractionError
            if isinstance(error, ExtractionError):
                logger.warning('[WHEAT] %s', str(error))
            warnings.append({'component':'graphrag','message':'LLM generation or grounding unavailable；保留检索证据，未发布结论。'})
            result.update(generation_called=False, generation_attempted=True, generation_status='failed')
    knowledge['graphrag_result'] = result
    if result.get('status') == 'validation_failed':
        warnings.append({'component':'grounding','message':'生成回答未通过引用或证据核验，结论未发布；视觉观测与检索证据仍保留。'})
    grounded = bool((result.get('grounding') or {}).get('passed')) and bool(result.get('preliminary_assessment',{}).get('available'))
    citations = result.get('citations', []) if grounded else []
    draft = result.get('grounded_answer') or {}
    assessment = result.get('answer') if grounded else None
    recommendations = []
    if grounded and draft.get('advice'):
        import re
        refs = set(re.findall(r'\[(E\d+)\]', draft['advice']))
        recommendations.append({'action':draft['advice'],
            'basis':'已通过现有引用和grounding核验的核验建议',
            'source_ids':sorted({c['source_id'] for c in citations if c['evidence_id'] in refs}),
            'evidence_ids':sorted(refs)})
    risks = []
    for signal in fused['candidate_signals']:
        if signal.get('entity_hint') not in {h['signal'] for h in prepared['entity_hints']}:
            continue
        matches = [a for a in aligned if a['source_signal']==signal['entity_hint']]
        risks.append({'risk':signal['label_zh'], 'status':'candidate',
                      'support':signal['strength'], 'visual_support':True,
                      'knowledge_support':False, 'local_evidence':False,
                      'aligned_entities':matches,
                      'reason':'视觉候选；实体对齐和资料召回本身不证明现场发生。',
                      'recommended_checks':[]})
    return {'knowledge':knowledge,'status':result['status'],
            'assessment':assessment,'recommendations':recommendations,
            'candidate_risks':risks,'citations':citations,
            'generation_called':result.get('generation_called',False),
            'grounding':result.get('grounding'),
            'grounding_status':'grounded' if grounded else 'insufficient_evidence',
            'warnings':warnings}
