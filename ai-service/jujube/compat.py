"""Additive provenance/visual compatibility; never turns model labels into disease facts."""
def level(metadata):
    if metadata.get('evidence_level')=='general_authoritative': return 'L3'
    region = metadata.get('region') or ''
    if isinstance(region, list): region = '、'.join(region)
    if any(x in region for x in ('山东', '天津', '及论文')): return 'L3'
    if '沧州' in region or '沧县' in region: return 'L1'
    if '河北' in region: return 'L2'
    return 'L4' if metadata.get('evidence_level') == 'transfer_pending' else 'L3'

def enrich(evidence, sources):
    for e in evidence:
        meta=e['metadata'];source=sources[e['source_id']]
        e.update(evidence_level=level(meta),region=meta.get('region'),
                 original_text=e['content'],source_type=source.get('source_type'),year=source.get('year'))
    return evidence

def paths_for(graph, start_ids, allowed, max_hops=2):
    """Directed bounded traversal; no reverse-edge causal inference."""
    adjacency={}
    for e in graph['edges']:
        if e['id'] in allowed: adjacency.setdefault(e['source'],[]).append(e)
    result=[]
    def walk(node, nodes, edges):
        if len(edges)>=max_hops:return
        for e in adjacency.get(node,[]):
            if e['target'] in nodes:continue
            ns=nodes+[e['target']];es=edges+[e]
            result.append({'node_ids':ns,'edge_ids':[x['id'] for x in es],
                           'relations':[x['relation'] for x in es],
                           'evidence_ids':[x['chunk_id'] for x in es],
                           'source_ids':list(dict.fromkeys(x['source_id'] for x in es))})
            walk(e['target'],ns,es)
    for node in start_ids:walk(node,[node],[])
    return result
