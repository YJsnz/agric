def fuse(visual_observations, context):
    signals = []
    leaf, canopy, head = (visual_observations[k] for k in ('leaf','canopy','head'))
    if leaf is not None:
        signals.append({'signal_type':'leaf_symptom','entity_hint':leaf['class'],
                        'label_zh':leaf['label_zh'],'evidence_strength':'visual',
                        'source':'model_a','strength':'visual','score':leaf['score']})
    if canopy is not None:
        signals.append({'signal_type':'canopy_state','entity_hint':canopy['class'],
                        'label_zh':canopy['label_zh'],'evidence_strength':'weak_visual',
                        'source':'model_b','strength':'weak_visual','score':canopy['visual_score']})
    if head is not None:
        signals.append({'signal_type':'wheat_head_phenotype','entity_hint':None,
                        'source':'model_c','strength':'phenotype','wheat_head_count':head['wheat_head_count']})
    return {'visual_observations':visual_observations,'environment_context':context.model_dump(),
            'candidate_signals':signals}
