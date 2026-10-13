"""Auditable rank fusion, after evidence admission; no score overrides rejection."""
from .reranker import get_reranker


def rank_evidence(question,candidates,top_k=5,rrf_k=60,metadata_strength=.10):
    if not 5 <= top_k <= 10 or rrf_k <= 0 or not 0 <= metadata_strength <= .2:
        raise ValueError('无效融合参数')
    ranked=get_reranker().rerank(question,candidates,top_k,return_all=True)
    output=[]
    for item in ranked['results']:
        neural=(rrf_k+1)/(rrf_k+item['rank'])
        document=item['kind']=='document_chunk'
        retrieval_rank=item['chunk'].get('rank') if document else None
        # Paths have no independent semantic retrieval rank; do not invent one.
        semantic=(rrf_k+1)/(rrf_k+retrieval_rank) if retrieval_rank else neural
        relevance=(neural+semantic)/2
        admission=item.get('evidence_fusion',{})
        matches=admission.get('matches',{})
        if isinstance(matches,list):
            values=[v for m in matches for v in m.get('matches',{}).values() if v is not None]
        else:
            values=[v for v in matches.values() if v is not None]
        scope=min(values) if values else 1.0
        levels=[item['chunk'].get('evidence_level')] if document else [e.get('evidence_level') for e in item['edges']]
        quality=min(({'A':1.,'B':.7,'C':.4}.get(level,0.) for level in levels),default=0.)
        score=relevance*(1-metadata_strength+metadata_strength*(scope+quality)/2)
        output.append({**item,'fusion_score':score,'ranking_features':{'neural_rank':item['rank'],
            'vector_rank':retrieval_rank,'scope_match':scope,'evidence_quality':quality,'relevance_rrf':relevance}})
    output.sort(key=lambda c:(-c['fusion_score'],c['candidate_id']))
    # No compulsory graph quota: irrelevant paths must never crowd out documents.
    return {**ranked,'results':[dict(c,rank=i+1) for i,c in enumerate(output[:top_k])],
            'fusion_config':{'rrf_k':rrf_k,'metadata_strength':metadata_strength,'calibrated':False},
            'notice':'排名融合参数尚未经独立验证集调优；图路径只作为原有证据，不代表因果识别。'}
