"""Typed graph-path/document candidate union, before ranking or generation."""
from collections import deque
import re
from .entity_extractor import extract_entities, ExtractionError
from .entity_aligner import align_entities, supplement_mentions, apply_diagnosis_entities
from .graph_retriever import retrieve_subgraph
from .vector_retriever import get_retriever
from .fusion import applicability
from .query_policy import route_question, effective_context, title_matches
from .symptom_scope import document_symptom_warnings, LEAF, FRUIT
from .evidence_tiers import classify, diagnostic_document_scope

def path_candidates(subgraph, limit=100):
    edges = subgraph.get('edges', [])
    adjacency = {}
    nodes = {n['id']: n for n in subgraph.get('nodes', [])}
    seeds = set(subgraph.get('seed_ids', []))
    for edge in edges:
        adjacency.setdefault(edge['source'], []).append(edge)
    queue = deque((n, [], {n}) for n in sorted(nodes))
    result = []
    visited_states = 0
    while queue:
        visited_states += 1
        if visited_states > 10000:
            return result, True
        current, path, visited = queue.popleft()
        if len(path) == 3:
            continue
        for edge in adjacency.get(current, []):
            if edge['target'] in visited:
                continue
            extended = path + [edge]
            seen = visited | {edge['target']}
            if seeds.intersection(seen):
                if len(result) == limit:
                    return result, True
                result.append({'candidate_id': 'path:' + '/'.join(e['id'] for e in extended),
                    'kind': 'graph_path', 'channel': 'neo4j', 'edges': extended,
                    'node_ids': [extended[0]['source']] + [e['target'] for e in extended],
                    'node_names': [nodes[extended[0]['source']]['name']] + [nodes[e['target']]['name'] for e in extended],
                    'source_ids': sorted({s for e in extended for s in e['evidence_ids']}),
                    'hop_count': len(extended)})
            queue.append((edge['target'], extended, seen))
    return result, False

def retrieve_dual(question, graph, entities=None, mode='research', policy=None, explicit_context=None, diagnosis_context=None):
    policy = policy or {'purpose':'legacy', 'mode':mode, 'titles':[]}
    extraction_notice = None
    if entities is not None:
        mentions = entities
    else:
        try:
            mentions = extract_entities(question).model_dump()
        except ExtractionError:
            mentions = {'crop':None,'region':None,'stage':None,'environment':[],'disease':[],'intent':'unknown'}
            extraction_notice = '模型抽取失败；仅使用问题中逐字出现的图谱实体，未推测缺失条件。'
    entity_text = re.sub(r'《[^》]+》', '', question) if policy['purpose']=='literature' else question
    leaf_explanation = (policy['purpose'] not in ('literature', 'legacy')
                        and bool(LEAF.search(entity_text)) and not FRUIT.search(entity_text))
    mentions = supplement_mentions(entity_text, graph, mentions)
    if diagnosis_context is not None:
        mentions = apply_diagnosis_entities(mentions, graph, diagnosis_context)
    elif explicit_context is not None:
        mentions = dict(mentions, region=explicit_context.get('region'))
    alignment = align_entities(mentions, graph)
    unresolved = [a for a in alignment['alignments'] if a['status'] != 'matched']
    context = effective_context(mentions, alignment['canonical_entities'], policy)
    if explicit_context is not None:
        # 诊断上下文是调用者明确提供的条件；禁止从品种名或候选地区补齐。
        context = {k: explicit_context.get(source) for k, source in
                   (('crop', 'crop'), ('region', 'region'), ('stage', 'growth_stage'))}
        if explicit_context.get('region'):
            context['region'] = alignment['canonical_entities'].get('region') or explicit_context['region']
    missing_scope=[k for k in ('crop','region') if not context.get(k)] if policy['purpose']=='local_advice' else []
    unresolved_scope = [a for a in unresolved if a['field'] in ('crop','region','stage')]
    blocked = (bool(unresolved_scope) and policy['purpose']!='literature') or not alignment['entity_ids']
    if blocked:
        subgraph = {'nodes': [], 'edges': [], 'sources': [], 'seed_ids': [], 'blocked': True}
    else:
        by_id = {n['id']:n for n in graph['nodes']}
        seeds = sorted(alignment['entity_ids'], key=lambda i: by_id[i]['type'] in ('Crop','Variety','Region','Stage','GrowthStage'))[:20]
        # Retrieve prospective temporal neighbours; admission below checks each whole path.
        graph_context = {k:v for k,v in context.items() if k!='stage'} if policy['purpose']!='legacy' else context
        subgraph = retrieve_subgraph(graph, seeds, 3, include_context=True, filters=graph_context)
    paths, truncated = path_candidates(subgraph)
    discovery_paths = []
    if diagnosis_context is not None and not blocked:
        # A separate discovery channel: no foreign path enters local evidence.
        discovery = retrieve_subgraph(graph, seeds, 3, include_context=True,
                                      filters={k:v for k,v in graph_context.items() if k != 'region'})
        discovery_paths, _ = path_candidates(discovery)
        discovery_paths = [{**p, 'usable_for_local_conclusion': False,
                            'evidence_scope': [classify(e, 'relation') for e in p['edges']]}
                           for p in discovery_paths]
    vector = get_retriever()
    documents = []; excluded = []; references = []
    retrieval_queries = [question]
    if leaf_explanation and '梨' in question and re.search(r'斑|点', entity_text):
        # A second symptom-level query improves recall for short farmer wording.
        # No disease name, observed colour or location is invented here.
        retrieval_queries.append('梨树叶片病斑症状的常见原因')
    retrieved = {}
    for query in retrieval_queries:
        for chunk in vector.search(query, 20):
            retrieved.setdefault(chunk['chunk_id'], chunk)
    for chunk in retrieved.values():
        accepted, features, warnings = applicability(chunk, context, policy['mode'])
        tier = classify(chunk, 'chunk')
        if diagnosis_context is not None or leaf_explanation:
            accepted, features, warnings, tier = diagnostic_document_scope(
                chunk, context, 'leaf' if leaf_explanation else (explicit_context or {}).get('organ'))
        symptom_scope = (['叶片症状'] if explicit_context is not None and explicit_context.get('organ') == 'leaf'
                         else alignment['canonical_entities'].get('symptom') or mentions.get('symptom', []))
        # Organ scope must survive a model that omitted the symptom field.
        # The short original question, not the retrieved documents, sets this scope.
        if diagnosis_context is None and LEAF.search(entity_text) and not FRUIT.search(entity_text):
            symptom_scope = ['叶片症状']
        organ_warnings = document_symptom_warnings(
            chunk, symptom_scope
        ) if policy['purpose'] != 'literature' else []
        if organ_warnings:
            accepted = False
            warnings.extend(organ_warnings)
        if not title_matches(chunk.get('title',''), policy) and policy['purpose']=='literature':
            accepted = False
            warnings.append('title:mismatch')
        if not accepted:
            excluded.append({'chunk_id': chunk['chunk_id'], 'reasons': warnings})
            # 部位不相干的资料仅保留排除记录，不作为“待核查资料”展示。
            if not organ_warnings:
                references.append({'source_id':chunk['source_id'],'title':chunk.get('title',''),
                                   'url':chunk.get('source_url',''),'chunk_id':chunk['chunk_id'],
                                   'reasons':warnings,'usable_for_answer':False})
            continue
        documents.append({'candidate_id': 'chunk:' + chunk['chunk_id'], 'kind': 'document_chunk',
                          'channel': 'faiss', 'chunk': chunk, 'warnings': warnings, 'features': features,
                          'evidence_scope': tier})
    candidates = paths + documents
    return {'question': question, 'entities': mentions, **alignment, 'policy':policy,'missing_scope':missing_scope,
            'retrieval_queries': retrieval_queries,
            'explicit_context': explicit_context,
            'diagnostic_explanation': diagnosis_context is not None or leaf_explanation,
            'query_organ': 'leaf' if leaf_explanation else (explicit_context or {}).get('organ'),
            'discovery_paths': discovery_paths,
            'effective_context':context, 'extraction_notice':extraction_notice,
            'candidate_set': candidates,
            'unresolved_entities':unresolved,
            'reference_materials':references[:5],
            'channels': {'neo4j': {'status': 'blocked_alignment' if blocked else 'partial_alignment' if unresolved else 'ok' if paths else 'empty',
                                   'count': len(paths), 'truncated': truncated or subgraph.get('truncated', False)},
                         'faiss': {'status': 'ok' if documents else 'empty', 'count': len(documents)}},
            'graph_sources': subgraph.get('sources', []), 'excluded_documents': excluded,
            'graph_context_nodes': [n for n in graph['nodes'] if n.get('type') in ('Crop','Variety','GrowthStage','Stage')],
            'corpus_sha256': vector.metadata['corpus_sha256'], 'mode': mode,
            'notice': '候选集尚未排序或生成答案；知识路径保持原方向，不等于已证实的因果链。'}
