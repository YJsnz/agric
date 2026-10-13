"""Provenance and scope checks; no candidate-file import shortcuts."""
import hashlib
import json
from .build import ROOT,CROP,normalized

def validate(graph=None,chunks=None):
    graph=graph or json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
    chunks=chunks or json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
    src={s['id']:s for s in graph['sources']};cs={c['chunk_id']:c for c in chunks};ns={n['id']:n for n in graph['nodes']}
    for s in src.values():
        assert hashlib.sha256((ROOT/s['local_path']).read_bytes()).hexdigest()==s['sha256'],s['id']+' source hash'
    for c in chunks:
        m=c['metadata'];sid=m['source_id'];loc=m['locator']
        assert m['crop']==CROP and m['review_status']=='verbatim_verified'
        assert m['standard_status'] not in ('abolished','superseded')
        if sid=='J001':raw=json.loads((ROOT/'evidence/raw/J001_fulltext.pages.json').read_text(encoding='utf-8'))[loc['page']-1]['text']
        elif sid=='J007':raw=(ROOT/'evidence/processed/J007_page1_verified.txt').read_text(encoding='utf-8')
        else:raw=(ROOT/f'evidence/raw/{sid}.txt').read_text(encoding='utf-8')
        assert normalized(c['text']) in normalized(raw),c['chunk_id']+' quote mismatch'
    for e in graph['edges']:
        for key in ['source_id','title','region','crop','growth_stage','subject','relation','object','evidence_text','page','section','evidence_level','review_status']:
            assert key in e,key
        assert e['source'] in ns and e['target'] in ns
        c=cs[e['chunk_id']];m=c['metadata']
        assert e['source_id'] in src and e['crop_id']==CROP
        assert e['region']==m['region'],'region upgrade'
        assert e['growth_stage']==m['growth_stage'],'stage mismatch'
        assert e['evidence_text']==c['text'],'quote mismatch'
        assert e['relation']!='CAUSES','causal claim requires independent review'
        assert m['scope']!='postharvest' or m['organ']=='fruit','postharvest organ mismatch'
        assert ns[e['source']]['type']!='Pest' or m['organ'] or m['growth_stage'] or (e['relation']=='MANAGED_AT' and ns[e['target']]['type']=='GrowthStage'),'pest missing organ/stage'
        assert not any(ch.isdigit() for ch in e['object']) or e['relation']=='MANAGED_AT','numeric entity requires unit review'
    return {'passed':True,'nodes':len(ns),'edges':len(graph['edges']),'chunks':len(cs)}

if __name__=='__main__':print(validate())
