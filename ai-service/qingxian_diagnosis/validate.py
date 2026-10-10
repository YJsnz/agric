import hashlib,json
import pymupdf
from .build import ROOT,DOMAIN,norm
from wheat.audit_sources import TextParser

def validate(graph=None,chunks=None):
    graph=graph or json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
    chunks=chunks or json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
    sources={s['id']:s for s in graph['sources']};nodes={n['id']:n for n in graph['nodes']};byid={c['chunk_id']:c for c in chunks};texts={}
    for sid,s in sources.items():
        raw=ROOT/s['local_path'];assert hashlib.sha256(raw.read_bytes()).hexdigest()==s['sha256'],'source hash mismatch'
        if raw.suffix=='.pdf':
            with pymupdf.open(raw) as doc:texts[sid]=[norm(p.get_text()) for p in doc]
        else:
            p=TextParser();p.feed(raw.read_text(encoding='utf-8'));texts[sid]=[norm('\n'.join(p.parts))]
    for c in chunks:
        m=c['metadata'];assert m['domain']==DOMAIN and m['review_status']=='verbatim_verified'
        original=texts[c['doc_id']][(m['page'] or 1)-1]
        assert c['text'] in original,'quote not in raw source'
        assert m['source_sha256']==sources[c['doc_id']]['sha256']
        assert m['evidence_grade'] in ('A','B','C')
    for e in graph['edges']:
        for k in ['source_id','evidence_text','page','section','evidence_level','condition','crop','region','growth_stage']:assert k in e,k
        assert e['source'] in nodes and e['target'] in nodes
        assert e['domain']==DOMAIN and e['review_status']=='verbatim_verified'
        m=byid[e['chunk_id']]['metadata'];assert e['region']==m['region'],'region upgrade'
        assert e['evidence_text']==byid[e['chunk_id']]['text']
        assert e['relation']!='CAUSES','unsupported causal upgrade'
        assert e['evidence_grade']!='D'
        if m['evidence_level']=='transfer_pending':assert e['relation'] in ('HAS_SYMPTOM','AFFECTS_ORGAN','ASSOCIATED_WITH'),'foreign operational advice'
        if e['crop'] and m['crop']:assert m['crop'] in e['crop'],'crop contamination'
    return {'passed':True,'nodes':len(nodes),'edges':len(graph['edges']),'chunks':len(chunks),'sources':len(sources)}

if __name__=='__main__':print(validate())
