"""Rebuild a read-only classification sidecar; never rewrite source/KG content."""
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.evidence_tiers import ROOT, REGISTRY, classify


def build():
    base = ROOT/'data/botou_yali'
    corpus = base/'graphrag_corpus_v1'
    graph_path = ROOT/'knowledge_graph/data/graph-v2.json'
    source_path = corpus/'fulltext/metadata/sources.jsonl'
    chunk_path = corpus/'processed/chunks/chunks.jsonl'
    graph = json.loads(graph_path.read_text(encoding='utf-8'))
    sources = [json.loads(s) for s in source_path.read_text(encoding='utf-8').splitlines()]
    chunks = [json.loads(s) for s in chunk_path.read_text(encoding='utf-8').splitlines()]
    rows = []
    for kind, records in [('source', sources), ('kg_source', graph['sources']),
                          ('chunk', chunks), ('relation', graph['edges'])]:
        for record in records:
            rows.append({'kind': kind, 'id': record.get('chunk_id', record.get('source_id', record.get('id'))),
                'evidence_scope': classify(record, kind),
                'record_sha256': hashlib.sha256(json.dumps(record, ensure_ascii=False, sort_keys=True).encode()).hexdigest(),
                'evidence_ids': record.get('evidence_ids', []),
                'locator': record.get('locator', {'section': record.get('section'), 'pages': record.get('pages')}),
                'conditions': record.get('conditions')})
    destination = base/'evidence/metadata'
    (destination/'evidence_tiers.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
    manifest = {'records':len(rows), 'input_sha256':{
        str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()
        for p in (graph_path, source_path, chunk_path, REGISTRY)}}
    (destination/'evidence_tiers_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'sources':len(sources),'kg_sources':len(graph['sources']),
                      'chunks':len(chunks),'relations':len(graph['edges'])}))


if __name__ == '__main__':
    build()
