"""Fail-closed provenance gate against archived page text and reviewed chunks."""
import json,re
from .build import ROOT,CROP,compact

def validate(graph):
    errors=[];nodes={n['id']:n for n in graph['nodes']};sources={s['id'] for s in graph['sources']}
    chunks={c['chunk_id']:c for c in json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))}
    for e in graph['edges']:
        reasons=[];c=chunks.get(e.get('chunk_id'))
        if e.get('source_id') not in sources:reasons.append('missing_source')
        if e.get('crop_id')!=CROP:reasons.append('crop_namespace')
        if e['source'] not in nodes or e['target'] not in nodes:reasons.append('missing_endpoint')
        if 'growth_stage' not in e:reasons.append('missing_stage_field')
        if e.get('relation')=='CAUSES':reasons.append('unreviewed_causality')
        if e.get('effect_size') is not None and not e.get('effect_unit'):reasons.append('numeric_unit')
        if not c:reasons.append('missing_chunk')
        else:
            m=c['metadata'];loc=m['locator'];relative_path=loc['file'].replace('\\','/');p=(ROOT/relative_path).resolve()
            if not p.is_relative_to(ROOT.resolve()):reasons.append('invalid_locator')
            else:
                pages=json.loads(p.read_text(encoding='utf-8'));text=compact(pages[loc['page']-1]['text'])
                if text[loc['start']:loc['end']]!=c['text'] or e.get('evidence_text')!=c['text']:reasons.append('nonverbatim_quote')
            for k in ('region','scope','growth_stage','source_id','review_status'):
                if e.get(k)!=m.get(k):reasons.append('metadata_mismatch:'+k)
            if '规范性引用文件' in c['text'] and e['relation']!='REFERENCES_STANDARD':reasons.append('reference_list_as_body')
            if e.get('scope') in ('grain','flour') and e.get('growth_stage') not in ('采后','加工期'):reasons.append('postharvest_stage')
        errors.extend(e['id']+':'+reason for reason in reasons)
    return errors

if __name__=='__main__':
    g=json.loads((ROOT/'graph/graph-v1.json').read_text(encoding='utf-8'));errors=validate(g)
    report={'nodes':len(g['nodes']),'edges':len(g['edges']),'errors':errors,'passed':not errors}
    (ROOT/'evaluation/reviewed_validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(report);raise SystemExit(bool(errors))
