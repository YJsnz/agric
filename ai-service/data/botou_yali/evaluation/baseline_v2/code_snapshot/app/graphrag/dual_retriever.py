"""Typed graph-path/document candidate union, before ranking or generation."""
from collections import deque
import re
from .entity_extractor import extract_entities, ExtractionError
from .entity_aligner import align_entities, supplement_mentions
from .graph_retriever import retrieve_subgraph
from .vector_retriever import get_retriever
from .fusion import applicability
from .query_policy import route_question, effective_context, title_matches

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

def retrieve_dual(question, graph, entities=None, mode='research', policy=None):
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
    mentions = supplement_mentions(entity_text, graph, mentions)
    alignment = align_entities(mentions, graph)
    unresolved = [a for a in alignment['alignments'] if a['status'] != 'matched']
    context = effective_context(mentions, alignment['canonical_entities'], policy)
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
    vector = get_retriever()
    documents = []; excluded = []; references = []
    for chunk in vector.search(question, 20):
        accepted, features, warnings = applicability(chunk, context, policy['mode'])
        if not title_matches(chunk.get('title',''), policy) and policy['purpose']=='literature':
            accepted = False
            warnings.append('title:mismatch')
        if not accepted:
            excluded.append({'chunk_id': chunk['chunk_id'], 'reasons': warnings})
            references.append({'source_id':chunk['source_id'],'title':chunk.get('title',''),
                               'url':chunk.get('source_url',''),'chunk_id':chunk['chunk_id'],
                               'reasons':warnings,'usable_for_answer':False})
            continue
        documents.append({'candidate_id': 'chunk:' + chunk['chunk_id'], 'kind': 'document_chunk',
                          'channel': 'faiss', 'chunk': chunk, 'warnings': warnings, 'features': features})
    candidates = paths + documents
    return {'question': question, 'entities': mentions, **alignment, 'policy':policy,'missing_scope':missing_scope,
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
