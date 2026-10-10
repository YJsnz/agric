"""Bounded evidence-preserving traversal of a live Neo4j snapshot."""
from collections import deque
from knowledge_graph.query_v2 import select_edges

PRIORITY = ('PROMOTES', 'CAUSES', 'INCREASES_RISK', 'AFFECTS', 'INHIBITS',
            'REDUCES_RISK', 'INTERVENTION_FOR')
CONTEXT = ('HAS_DISEASE', 'HAS_PEST', 'HAS_DISORDER', 'HAS_PROCESS', 'HAS_SYMPTOM',
           'CONTROLLED_BY', 'OCCURS_AT_STAGE', 'HAS_PARAMETER', 'REQUIRES', 'RECOMMENDS')

def retrieve_subgraph(graph, entity_ids, max_hops=2, direction='both',
                      include_context=False, filters=None, max_edges=100):
    if type(max_hops) is not int or not 1 <= max_hops <= 3:
        raise ValueError('跳数必须为 1～3')
    if direction not in ('outgoing', 'incoming', 'both'):
        raise ValueError('方向必须为 outgoing、incoming 或 both')
    if type(max_edges) is not int or not 1 <= max_edges <= 300:
        raise ValueError('关系上限必须为 1～300')
    seeds = list(dict.fromkeys(entity_ids))
    nodes = {n['id']: n for n in graph['nodes']}
    if len(seeds) > 20 or any(s not in nodes for s in seeds):
        raise ValueError('起始实体必须为图谱内有效 ID，且最多 20 个')
    filters = filters or {}
    if filters.get('stage'):
        from .query_policy import stage_name
        requested_stage = stage_name(filters['stage'])
        filters = dict(filters, stage=requested_stage)
        # The website keeps its strict literal filters. GraphRAG normalizes verified synonyms here.
        graph = {**graph, 'nodes': [dict(n, name=stage_name(n['name'])) if n.get('type') in ('Stage','GrowthStage') else n for n in graph['nodes']]}
    if set(filters) - {'region', 'crop', 'stage', 'as_of', 'scope'}:
        raise ValueError('包含不支持的筛选条件')
    allowed = PRIORITY + (CONTEXT if include_context else ())
    sources = {s['id']: s for s in graph['sources']}
    eligible = []
    for edge in select_edges(graph, filters):
        if edge['relation'] not in allowed:
            continue
        refs = edge.get('evidence_ids', [])
        if not refs or not edge.get('locator') or any(s not in sources or sources[s].get('status') != 'read' for s in refs):
            continue
        eligible.append(edge)
    eligible.sort(key=lambda e: (allowed.index(e['relation']), e['id']))
    adjacency = {}
    for edge in eligible:
        if direction in ('outgoing', 'both'):
            adjacency.setdefault(edge['source'], []).append((edge, edge['target']))
        if direction in ('incoming', 'both'):
            adjacency.setdefault(edge['target'], []).append((edge, edge['source']))
    queue = deque((s, 0) for s in seeds)
    visited = set(seeds)
    chosen = {}
    truncated = False
    while queue:
        current, depth = queue.popleft()
        if depth >= max_hops:
            continue
        for edge, neighbor in adjacency.get(current, []):
            if edge['id'] not in chosen:
                if len(chosen) >= max_edges:
                    truncated = True
                    continue
                chosen[edge['id']] = dict(edge, hop=depth + 1)
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, depth + 1))
    edges = list(chosen.values())
    ids = set(seeds) | {e[k] for e in edges for k in ('source', 'target')}
    refs = {s for e in edges for s in e['evidence_ids']}
    return {'nodes': [nodes[s] for s in sorted(ids)], 'edges': edges,
            'triples': [{'source': nodes[e['source']]['name'], 'relation': e['relation'],
                         'target': nodes[e['target']]['name'], 'edge_id': e['id'],
                         'hop': e['hop'], 'evidence_ids': e['evidence_ids']} for e in edges],
            'sources': [sources[s] for s in sorted(refs)], 'seed_ids': seeds,
            'max_hops': max_hops, 'direction': direction, 'filters': filters,
            'truncated': truncated,
            'notice': '入边用于发现原因和干预，关系保持原方向；邻域不代表完整因果链或量化因果效应。'}
