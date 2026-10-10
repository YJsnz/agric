"""Resolve mentions against live graph IDs; never fabricate missing entities."""
import json
import unicodedata
from .query_policy import stage_name
from pathlib import Path

TYPES = {'crop': {'Crop', 'Variety'}, 'region': {'Region'},
         'stage': {'GrowthStage', 'Stage'},
         'environment': {'EnvironmentFactor', 'StorageCondition', 'Condition'},
         'disease': {'Disease', 'PhysiologicalDisorder'},
         'pest': {'Pest'}, 'symptom': {'Symptom'}, 'quality': {'QualityIndicator', 'HarvestIndicator', 'Metric'},
         'intervention': {'Intervention', 'AgriculturalPractice', 'PreventionMeasure', 'HarvestProcess'},
         'risk': {'PostharvestRisk', 'Risk'}}
ALIAS_FILE = Path(__file__).resolve().parents[2] / 'data/knowledge/metadata/entity_aliases.json'

def normalize(text):
    return ''.join(unicodedata.normalize('NFKC', text).casefold().split())

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
            key = normalize(stage_name(mention) if field == 'stage' else mention)
            candidates = {}
            for node in nodes:
                if node.get('type') not in types:
                    continue
                names = [node['name'], *node.get('aliases', [])]
                for rule in rules:
                    if rule['canonical_name'] == node['name'] and rule['type'] == node['type']:
                        names.extend(rule['aliases'])
                if key in {normalize(stage_name(name) if field == 'stage' else name) for name in names}:
                    candidates[node['id']] = {k: node.get(k) for k in ('id', 'name', 'type', 'crop', 'region')}
            matches = list(candidates.values())
            status = 'matched' if len(matches) == 1 else 'ambiguous' if matches else 'unmatched'
            result = {'field': field, 'mention': mention, 'status': status,
                      'entity_id': matches[0]['id'] if status == 'matched' else None,
                      'canonical_name': matches[0]['name'] if status == 'matched' else None,
                      'candidates': matches}
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
