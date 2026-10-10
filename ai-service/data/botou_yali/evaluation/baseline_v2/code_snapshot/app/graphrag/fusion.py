"""Applicability-gated weighted RRF with bounded metadata adjustment."""
import math
import re
from dataclasses import dataclass, asdict
from knowledge_graph.query_v2 import REGIONS
from .query_policy import stage_name

@dataclass(frozen=True)
class FusionConfig:
    rrf_k: float = 60
    semantic_weight: float = 1
    graph_weight: float = 1
    metadata_strength: float = 0.15
    region_weight: float = 0.4
    stage_weight: float = 0.3
    evidence_weight: float = 0.3
    per_source: int = 2

    def __post_init__(self):
        for key, value in asdict(self).items():
            if not math.isfinite(value) or value < 0:
                raise ValueError('参数必须是有限非负数')
        if self.semantic_weight <= 0 or not 0 <= self.metadata_strength <= 1 or type(self.per_source) is not int or self.per_source < 1:
            raise ValueError('无效融合参数')
        if self.region_weight + self.stage_weight + self.evidence_weight <= 0:
            raise ValueError('元数据权重和必须大于零')

def values(value):
    return value if isinstance(value, list) else [value] if value else []

def applicability(chunk, context, mode):
    """Unknown is distinct from explicit incompatibility."""
    if mode not in ('research', 'strict'):
        raise ValueError('mode 必须为 research 或 strict')
    features = {}
    reasons = []
    for field, metadata in [('crop', 'crop'), ('region', 'region'), ('stage', 'applicable_stages')]:
        query = context.get(field)
        actual = values(chunk.get(metadata))
        if field == 'stage':
            query = stage_name(query)
            actual = [stage_name(v) for v in actual]
        if not query:
            features[field] = None
            continue
        if not actual:
            features[field] = 0
            reasons.append(field + ':unknown')
            if mode == 'strict':
                return False, features, reasons
            continue
        compatible = {query}
        if field == 'crop':
            compatible = {'泊头鸭梨': {'泊头鸭梨', '鸭梨', '梨'}, '鸭梨': {'鸭梨', '梨'}}.get(query, {query})
        elif field == 'region':
            compatible = set(REGIONS.get(query, [query]))
        if not compatible.intersection(actual):
            return False, features, reasons + [field + ':mismatch']
        features[field] = 1 if query in actual else 0.7
    return True, features, reasons

def graph_links(chunk, subgraph, source_mapping):
    """Conservative source + exact numbered section match, not textual entailment."""
    match = re.match(r'^\s*(\d+(?:\.\d+)*)(?:\s|$)', chunk.get('section', ''))
    if not match:
        return []
    ids = set(source_mapping.get(chunk['source_id'], []))
    return [e for e in subgraph.get('edges', [])
            if ids.intersection(e['evidence_ids']) and e.get('locator', '').strip() == match[1]]

def fuse(semantic, chunks, subgraph, source_mapping, context=None, mode='research', top_k=5, config=None):
    config = config or FusionConfig()
    context = context or {}
    if not 1 <= top_k <= 20:
        raise ValueError('top_k 必须为 1～20')
    sem = {c['chunk_id']: c for c in semantic}
    candidates = {}
    excluded = []
    for chunk in chunks:
        links = graph_links(chunk, subgraph, source_mapping)
        if chunk['chunk_id'] not in sem and not links:
            continue
        accepted, features, reasons = applicability(chunk, context, mode)
        if not accepted:
            excluded.append({'chunk_id': chunk['chunk_id'], 'reasons': reasons})
            continue
        candidates[chunk['chunk_id']] = {'chunk': chunk, 'features': features, 'warnings': reasons,
            'edge_ids': sorted(e['id'] for e in links),
            'graph_score': max((1 / e['hop'] for e in links), default=0)}
    # Equal graph scores share ranks so identifier order cannot invent relevance.
    graph_scores = sorted((x['graph_score'] for x in candidates.values() if x['graph_score']), reverse=True)
    graph_ranks = {score: graph_scores.index(score) + 1 for score in set(graph_scores)}
    active_graph = bool(graph_scores) and config.graph_weight > 0
    denominator = config.semantic_weight + (config.graph_weight if active_graph else 0)
    output = []
    for cid, candidate in candidates.items():
        sr = sem.get(cid, {}).get('rank')
        gr = graph_ranks.get(candidate['graph_score'])
        semantic_part = config.semantic_weight * (config.rrf_k + 1) / (config.rrf_k + sr) if sr else 0
        graph_part = config.graph_weight * (config.rrf_k + 1) / (config.rrf_k + gr) if gr else 0
        relevance = (semantic_part + graph_part) / denominator
        if relevance <= 0:
            continue
        features = candidate['features']
        features['evidence'] = {'A': 1, 'B': 0.7, 'C': 0.4, 'D': 0.1}.get(candidate['chunk'].get('evidence_level'), 0)
        terms = [(features.get(name), weight) for name, weight in
                 [('region', config.region_weight), ('stage', config.stage_weight), ('evidence', config.evidence_weight)]]
        weight_sum = sum(w for v, w in terms if v is not None)
        quality = sum(v * w for v, w in terms if v is not None) / weight_sum if weight_sum else 0
        # With no mapped graph evidence, retain semantic order rather than let
        # source prestige overwhelm small RRF rank differences.
        strength = config.metadata_strength if active_graph else 0
        score = relevance * (1 - strength + strength * quality)
        output.append({**candidate, 'chunk_id': cid, 'score': score, 'semantic_rank': sr,
                       'semantic_cosine': sem.get(cid, {}).get('score'), 'graph_rank': gr,
                       'rrf_score': relevance, 'metadata_score': quality})
    output.sort(key=lambda x: (-x['score'], x['chunk_id']))
    counts = {}; selected = []
    for row in output:
        sid = row['chunk']['source_id']
        if counts.get(sid, 0) >= config.per_source:
            continue
        counts[sid] = counts.get(sid, 0) + 1
        selected.append(dict(row, rank=len(selected) + 1))
        if len(selected) == top_k:
            break
    return {'results': selected, 'excluded': excluded, 'candidate_count': len(candidates),
            'graph_channel_active': active_graph, 'effective_metadata_strength': config.metadata_strength if active_graph else 0,
            'config': asdict(config), 'mode': mode,
            'status': 'ok' if selected else 'insufficient_evidence',
            'notice': '实验性检索排序分，不是事实置信度或风险概率；权重尚未由验证集选择。'}
