"""Resolve mentions against live graph IDs; never fabricate missing entities."""
import json
import unicodedata
import re
from copy import deepcopy
from .query_policy import stage_name
from pathlib import Path

TYPES = {'crop': {'Crop', 'Variety'}, 'region': {'Region'},
         'stage': {'GrowthStage', 'Stage'},
         'environment': {'EnvironmentFactor', 'StorageCondition', 'Condition'},
         'disease': {'Disease', 'PhysiologicalDisorder'},
         'pest': {'Pest'}, 'symptom': {'Symptom'}, 'quality': {'QualityIndicator', 'HarvestIndicator', 'Metric'},
         'intervention': {'Intervention', 'AgriculturalPractice', 'PreventionMeasure', 'HarvestProcess'},
         'risk': {'PostharvestRisk', 'Risk'}}
ALIAS_FILE = Path(__file__).resolve().parents[1] / 'data/botou_yali/evidence/metadata/entity_aliases.json'

def normalize(text):
    return ''.join(unicodedata.normalize('NFKC', text).casefold().split())


def symptom_key(text):
    """只消除部位和表现之间的肯定连接词，保留颜色、部位和否定词。"""
    return re.sub(r'(叶片|叶面|叶背|叶缘|果面|果实)(?:出现了|出现|长有|长出|有)',
                  r'\1', normalize(text))


def region_matches(raw, nodes):
    """只处理明确提供的行政区链；只返回真实 Region 节点，不创建实体。"""
    if not raw:
        return []
    # 已知行政区链，避免把任意包含“泊头”的文本当成所在地。
    chain = ('河北省', '沧州市', '泊头市')
    forms = {'河北省沧州市泊头市', '河北沧州泊头', '河北省泊头市', '沧州市泊头市'}
    levels = list(reversed(chain)) if raw in forms else [raw]
    for level in levels:
        variants = {level, level[:-1]} if level.endswith(('省', '市')) else {level}
        matches = [n for n in nodes if n.get('type') == 'Region'
                   and variants.intersection([n['name'], *n.get('aliases', [])])]
        if matches:
            return matches
    return []


def apply_diagnosis_entities(mentions, graph, diagnosis):
    """KG结构化类型优先；任何ID/名称/类型不一致均不采纳。"""
    result = deepcopy(mentions)
    by_id = {n['id']: n for n in graph['nodes']}
    additions = {}
    for candidate in diagnosis.get('candidate_ranking', []):
        node = by_id.get(candidate.get('candidate_id'))
        if not node or node.get('name') != candidate.get('candidate_name') or node.get('type') != candidate.get('candidate_type'):
            continue
        field = next((f for f, types in TYPES.items() if node['type'] in types), None)
        if field in ('disease', 'pest', 'risk'):
            additions.setdefault(field, []).append(node['name'])
    symptoms = []
    for provided in diagnosis.get('matched_symptom_nodes', []):
        node = by_id.get(provided.get('id'))
        if node and node.get('type') == provided.get('type') == 'Symptom' and node['name'] == provided.get('name'):
            symptoms.append(node['name'])
    if symptoms:
        # 泛化视觉语义不是新的KG实体；使用已检索并核实的具体症状。
        result['symptom'] = list(dict.fromkeys(symptoms))
    for field, names in additions.items():
        for other in ('disease', 'pest', 'risk'):
            if other != field:
                result[other] = [n for n in result.get(other, []) if n not in names]
        result[field] = list(dict.fromkeys(result.get(field, []) + names))
    ctx = diagnosis.get('context', {})
    for field, source in (('crop', 'crop'), ('region', 'region'), ('stage', 'growth_stage')):
        result[field] = ctx.get(source)
    return result

def align_entities(entities, graph, rules=None):
    if rules is None:
        rules = json.loads(ALIAS_FILE.read_text(encoding='utf-8'))['rules']
    nodes = graph['nodes']
    results = []
    list_fields = set(TYPES) - {'crop', 'region', 'stage'}
    canonical = {**entities, **{field: [] for field in list_fields}}
    for field, types in TYPES.items():
        value = entities.get(field)
        mentions = value if isinstance(value, list) else [value] if value else []
        if field not in list_fields:
            canonical[field] = None
        for mention in mentions:
            normalizer = symptom_key if field == 'symptom' else normalize
            key = normalizer(stage_name(mention) if field == 'stage' else mention)
            candidates = {}
            for node in nodes:
                if node.get('type') not in types:
                    continue
                names = [node['name'], *node.get('aliases', [])]
                for rule in rules:
                    if rule['canonical_name'] == node['name'] and rule['type'] == node['type']:
                        names.extend(rule['aliases'])
                if key in {normalizer(stage_name(name) if field == 'stage' else name) for name in names}:
                    candidates[node['id']] = {k: node.get(k) for k in ('id', 'name', 'type', 'crop', 'region')}
            matches = list(candidates.values())
            if field == 'region' and not matches:
                matches = [{k: n.get(k) for k in ('id', 'name', 'type', 'crop', 'region')}
                           for n in region_matches(mention, nodes)]
            status = 'matched' if len(matches) == 1 else 'ambiguous' if matches else 'unmatched'
            result = {'field': field, 'mention': mention, 'status': status,
                      'entity_id': matches[0]['id'] if status == 'matched' else None,
                      'canonical_name': matches[0]['name'] if status == 'matched' else None,
                      'candidates': matches}
            if field == 'region':
                result.update(raw_region=mention, aligned_region=result['canonical_name'])
            results.append(result)
            if status == 'matched':
                if field in list_fields:
                    if matches[0]['name'] not in canonical[field]:
                        canonical[field].append(matches[0]['name'])
                else:
                    canonical[field] = matches[0]['name']
    return {'canonical_entities': canonical, 'alignments': results,
            'entity_ids': list(dict.fromkeys(r['entity_id'] for r in results if r['status'] == 'matched')),
            'requires_clarification': any(r['status'] != 'matched' for r in results)}


def supplement_mentions(question, graph, entities):
    """Exact surface mentions only; graph vocabulary supplements an incomplete extractor."""
    result = dict(entities)
    rules = json.loads(ALIAS_FILE.read_text(encoding='utf-8'))['rules']
    for field, types in TYPES.items():
        matches = set()
        for node in graph['nodes']:
            if node.get('type') not in types:
                continue
            names = [node['name'], *node.get('aliases', [])]
            for rule in rules:
                if rule['canonical_name'] == node['name'] and rule['type'] == node['type']:
                    names.extend(rule['aliases'])
            matches.update(name for name in names if len(name) >= 2 and name in question)
        # Do not generate nested aliases for the same mention (鸭梨 inside 泊头鸭梨).
        matches = sorted((m for m in matches if not any(m != n and m in n for n in matches)), key=lambda m:(-len(m),m))
        if field in ('crop','region','stage'):
            if not result.get(field) and len(matches) == 1:
                result[field] = matches[0]
        else:
            result[field] = list(dict.fromkeys(result.get(field, []) + matches))[:20]
    return result
