"""Stage 5 extraction entry; retrieval/generation are not yet orchestrated."""
from .entity_extractor import extract_entities
from .entity_aligner import align_entities
from .graph_retriever import retrieve_subgraph

def analyze_question(question, graph=None):
    entities = extract_entities(question).model_dump()
    result = {'entities': entities,
            'method': 'DeepSeek JSON 实体抽取 + 结构与原文校验',
            'notice': '这是查询实体解析，不是风险结论；尚未执行 GraphRAG 融合检索。'}
    if graph is not None:
        result.update(align_entities(entities, graph))
        result['method'] += ' → 实时图谱实体对齐'
        context = result['canonical_entities']
        filters = {k: context[k] for k in ('crop', 'region', 'stage') if context.get(k)}
        # Unresolved constraints must not silently broaden the retrieval scope.
        if any(a['status'] != 'matched' for a in result['alignments']):
            result['graph_retrieval'] = {'triples': [], 'blocked': True,
                                         'notice': '存在未匹配或歧义实体，请确认后再检索子图。'}
        else:
            result['graph_retrieval'] = retrieve_subgraph(graph, result['entity_ids'], filters=filters)
        result['method'] += ' → 2 跳证据子图检索'
    return result

def retrieve_agricultural(question, graph, entity_ids, context=None, mode='research', top_k=5, config=None):
    import json
    from app.vector_rag import ROOT
    from .vector_retriever import get_retriever
    from .fusion import fuse
    retriever = get_retriever()
    context = context or {}
    subgraph = retrieve_subgraph(graph, entity_ids, max_hops=3, include_context=True, filters=context)
    semantic = retriever.search(question, 20)
    mapping = json.loads((ROOT / 'data/documents/metadata/kg_source_mapping.json').read_text(encoding='utf-8'))
    result = fuse(semantic, retriever.metadata['chunks'], subgraph, mapping, context, mode, top_k, config)
    result['graph_retrieval'] = subgraph
    result['corpus_sha256'] = retriever.metadata['corpus_sha256']
    return result
