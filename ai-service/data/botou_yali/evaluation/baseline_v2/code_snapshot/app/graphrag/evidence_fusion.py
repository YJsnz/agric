"""Evidence admission before neural reranking; no relevance score overrides scope."""
from .fusion import applicability
from .query_policy import effective_context, title_matches, transition_target, stage_name

def fuse_evidence(dual, allowed_levels=('A','B','C')):
    if not allowed_levels or not set(allowed_levels)<=set('ABC'):
        raise ValueError('证据准入等级必须为 A/B/C 的非空子集')
    policy=dual.get('policy', {'purpose':'legacy','mode':'strict','titles':[]})
    context=effective_context(dual['entities'],dual['canonical_entities'],policy)
    accepted=[];rejected=[];seen=set()
    nodes={n['id']:n for n in dual.get('graph_context_nodes',[])}
    sources={s['id']:s for s in dual.get('graph_sources',[])}
    for candidate in dual['candidate_set']:
        cid=candidate['candidate_id']
        if cid in seen:continue
        seen.add(cid)
        if candidate['kind']=='document_chunk':
            c=candidate['chunk']
            ok,features,reasons=applicability(c,context,policy['mode'])
            if policy['purpose']=='literature' and not title_matches(c.get('title',''),policy):
                ok=False;reasons.append('title:mismatch')
            if c.get('evidence_level') not in allowed_levels:
                ok=False;reasons.append('evidence:insufficient')
            if not c.get('source_url') or c.get('needs_layout_review'):
                ok=False;reasons.append('source:unavailable_or_layout_pending')
        elif candidate['kind']=='graph_path':
            ok=bool(candidate.get('edges'));reasons=[];features=[]
            current_stage=context.get('stage')
            if not ok:reasons.append('graph:empty_path')
            for e in candidate.get('edges',[]):
                metadata={'crop':[nodes[e['crop']]['name']] if e.get('crop') in nodes else [],
                          'region':e.get('region',[]),
                          'applicable_stages':[nodes[s]['name'] for s in e.get('stage_ids',[]) if s in nodes]}
                edge_context=dict(context)
                if current_stage:edge_context['stage']=current_stage
                navigation=e.get('relation') in ('HAS_DISEASE','HAS_PEST','HAS_DISORDER','HAS_PROCESS','HAS_PARAMETER')
                if navigation and not metadata['applicable_stages']:
                    edge_context.pop('stage',None)
                    reasons.append('navigation_only:not_current_stage_occurrence')
                next_stage=transition_target(e,current_stage,nodes) if policy['purpose']!='legacy' else None
                if next_stage:
                    # The reviewed transition explicitly describes its origin and outcome stages.
                    metadata['applicable_stages']=[current_stage]
                valid,match,why=applicability(metadata,edge_context,policy['mode'])
                features.append({'edge_id':e.get('id'),'matches':match,'from_stage':current_stage,'to_stage':next_stage})
                if next_stage and valid:current_stage=next_stage
                if not valid:ok=False;reasons.extend(why)
                if policy['purpose']=='literature' and policy.get('titles') and any(
                    s not in sources or not title_matches(sources[s].get('title',sources[s].get('name','')),policy)
                    for s in e.get('evidence_ids',[])):
                    ok=False;reasons.append('title:mismatch')
                reviews={'source_checked','local_expert_reviewed'}
                if policy['purpose'] in ('general','literature') and policy['mode']=='research':
                    reviews.add('transfer_pending')
                    if e.get('review_status')=='transfer_pending':reasons.append('research_only:local_transfer_unvalidated')
                if e.get('evidence_level') not in allowed_levels or e.get('review_status') not in reviews:
                    ok=False;reasons.append('graph:unreviewed_or_weak_evidence')
                if not e.get('locator') or not e.get('evidence_ids') or any(s not in sources or sources[s].get('status')!='read' for s in e.get('evidence_ids',[])):
                    ok=False;reasons.append('graph:missing_evidence')
        else:
            ok=False;features={};reasons=['candidate:unknown_type']
        if ok:accepted.append({**candidate,'evidence_fusion':{'accepted':True,'matches':features,'allowed_levels':list(allowed_levels),
                                                            'warnings':reasons,'purpose':policy['purpose']}})
        else:rejected.append({'candidate_id':cid,'reasons':reasons})
    return accepted,rejected
