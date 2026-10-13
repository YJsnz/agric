"""Crop-isolated storage/vector adapters; shared wheat encoder and Neo4j transport."""
import hashlib
import json
import os
import faiss
from wheat.repository import transaction
from wheat.vector import encoder, QUERY_PREFIX
from .build import ROOT, CROP, save

def import_graph():
    graph=json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
    # One snapshot property, constrained by crop_id: does not touch any other crop.
    transaction([{'statement':'MERGE (s:JujubeSnapshot {crop_id:$crop}) SET s.payload=$payload',
                  'parameters':{'crop':CROP,'payload':json.dumps(graph,ensure_ascii=False)}}])
    statements=[]
    for n in graph['nodes']:
        statements.append({'statement':'MERGE (n:JujubeEntity {crop_id:$crop,id:$id}) SET n.name=$name,n.type=$type',
            'parameters':{**n,'crop':CROP}})
    for e in graph['edges']:
        statements.append({'statement':'MATCH (a:JujubeEntity {crop_id:$crop,id:$source}), (b:JujubeEntity {crop_id:$crop,id:$target}) MERGE (a)-[r:JUJUBE_RELATION {crop_id:$crop,id:$id}]->(b) SET r.relation=$relation,r.payload=$payload',
            'parameters':{**e,'crop':CROP,'payload':json.dumps(e,ensure_ascii=False)}})
    transaction(statements)
    return {'nodes':len(graph['nodes']),'edges':len(graph['edges'])}

def load_graph(backend=None):
    if (backend or os.environ.get('JUJUBE_GRAPH_BACKEND'))=='file':
        graph=json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
        graph['origin']='local reviewed graph-v1.json (explicit file backend)'
        return graph
    rows=transaction([{'statement':'MATCH (s:JujubeSnapshot {crop_id:$crop}) RETURN s.payload','parameters':{'crop':CROP}}])
    if not rows[0]['data']:raise RuntimeError('金丝小枣审核图谱尚未导入 Neo4j')
    graph=json.loads(rows[0]['data'][0]['row'][0]);graph['origin']='Neo4j · 金丝小枣独立命名空间'
    graph['counts']={'domain_entities':len(graph['nodes']),'semantic_edges':len(graph['edges']),'total_relationships':len(graph['edges']),'statement_nodes':0,'provenance_edges':0,'publication_groups':len(graph['sources'])}
    return graph

def build_index():
    path=ROOT/'graphrag_corpus_v1/reviewed_chunks.json';chunks=json.loads(path.read_text(encoding='utf-8'))
    v=encoder().encode([c['metadata']['topic']+' '+c['text'] for c in chunks])
    idx=faiss.IndexFlatIP(v.shape[1]);idx.add(v)
    faiss.write_index(idx,str(ROOT/'vector/reviewed.faiss'))
    save(ROOT/'vector/reviewed_metadata.json',{'model':'BAAI/bge-small-zh-v1.5','corpus_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'chunks':chunks})
    return {'vectors':idx.ntotal,'dimension':idx.d}

def search(question,eligible,top_k=6):
    meta=json.loads((ROOT/'vector/reviewed_metadata.json').read_text(encoding='utf-8'))
    if meta['corpus_sha256']!=hashlib.sha256((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_bytes()).hexdigest():raise ValueError('Jujube corpus/index mismatch')
    idx=faiss.read_index(str(ROOT/'vector/reviewed.faiss'))
    if idx.ntotal!=len(meta['chunks']):raise ValueError('Jujube index count mismatch')
    scores,ids=idx.search(encoder().encode([QUERY_PREFIX+question]),idx.ntotal)
    return [{**meta['chunks'][int(i)],'score':float(s)} for s,i in zip(scores[0],ids[0]) if eligible(meta['chunks'][int(i)])][:top_k]
