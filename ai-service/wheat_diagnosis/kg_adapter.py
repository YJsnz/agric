"""Visual hints aligned by the existing aligner to the real wheat snapshot."""
HINTS = {'rust':['rust','wheat rust','锈病'], 'leaf_spot_blight':['leaf spot','leaf blight','叶斑','叶枯'],
         'nitrogen_deficiency':['nitrogen deficiency','leaf yellowing','缺氮黄化','黄化'],
         'water_stress':['drought','water stress','soil moisture stress','干旱','干旱胁迫','土壤墒情','水分亏缺']}


def build_entity_hints(signals):
    return [{'signal':s['entity_hint'],'search_terms':list(HINTS[s['entity_hint']]),'diagnosis':False}
            for s in signals if s.get('entity_hint') in HINTS]


def align_visual_entities(signals, graph):
    from graphrag.entity_aligner import align_entities
    results = []
    for hint in build_entity_hints(signals):
        # No pear alias file, substring matching or fabricated graph entity.
        mentions = {field: hint['search_terms'] for field in ('disease','symptom','environment','risk')}
        aligned = align_entities(mentions, graph, rules=[])
        seen = set()
        for match in aligned['alignments']:
            for node in match['candidates']:
                if node['id'] in seen:
                    continue
                seen.add(node['id'])
                results.append({'entity_id':node['id'],'entity':node['name'],
                    'entity_type':node['type'],'alignment_score':1.0,
                    'alignment_method':'exact_name_or_declared_alias',
                    'source_signal':hint['signal'],'diagnosis':False})
    return results
