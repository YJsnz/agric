"""Auditable rank fusion, after evidence admission; no score overrides rejection."""
import os
from .reranker import get_reranker, candidate_text


def rank_evidence(question,candidates,top_k=5,rrf_k=60,metadata_strength=.10):
    if not 5 <= top_k <= 10 or rrf_k <= 0 or not 0 <= metadata_strength <= .2:
        raise ValueError('无效融合参数')
    try:
        if os.getenv('MULTICROP_RANKING_MODE', 'baseline' if os.getenv('MULTICROP_LLM_BASE_URL') else 'neural')=='baseline':
            raise FileNotFoundError('Explicit edge baseline mode')
        ranked=get_reranker().rerank(question,candidates,top_k,return_all=True)
    except FileNotFoundError:
        # Explicit low-memory baseline; retain evidence admission and never invent neural scores.
        query=set(question[i:i+2] for i in range(max(0,len(question)-1)))
        rows=[]
        for candidate in {c['candidate_id']:c for c in candidates}.values():
            text=candidate_text(candidate)
            tokens=set(text[i:i+2] for i in range(max(0,len(text)-1)))
            score=len(query & tokens)/max(1,len(query))
            rows.append({**candidate,'lexical_score':score})
        rows.sort(key=lambda c:(-c['lexical_score'],c['candidate_id']))
        ranked={'results':[dict(c,rank=i+1) for i,c in enumerate(rows)],
                'model':'graph-vector-lexical-baseline','candidate_count':len(rows),
                'notice':'当前使用图谱、向量与词项轻量检索；未生成神经重排分数。'}
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
