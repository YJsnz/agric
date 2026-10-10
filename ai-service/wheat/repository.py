"""Parameterized, crop-isolated Neo4j storage; never modifies pear records."""
import base64,json,os
from urllib.request import Request,urlopen
from .build import ROOT,CROP
DATASET='wheat_reviewed_v1'

def transaction(statements):
    user=os.environ.get('NEO4J_USER','neo4j')
    password=os.environ.get('NEO4J_PASSWORD',os.environ.get('LOCAL_NEO4J_PASSWORD',''))
    endpoint=os.environ.get('NEO4J_HTTP_URL','http://127.0.0.1:7474').rstrip('/')+'/db/neo4j/tx/commit'
    req=Request(endpoint,json.dumps({'statements':statements}).encode(),{'Content-Type':'application/json','Authorization':'Basic '+base64.b64encode(f'{user}:{password}'.encode()).decode()})
    with urlopen(req,timeout=30) as r: data=json.load(r)
    if data.get('errors'): raise RuntimeError(str(data['errors']))
    return data['results']

def import_graph():
    from .validate import validate
    graph=json.loads((ROOT/'graph/graph-v1.json').read_text(encoding='utf-8'))
    errors=validate(graph)
    if errors:raise ValueError(errors)
    params={'crop':CROP,'dataset':DATASET}
    stmts=[]
    # Retire only our own previous snapshot, then reactivate matching rows.
    stmts.append({'statement':'MATCH (n:WheatEntity {crop_id:$crop,dataset:$dataset}) SET n.active=false','parameters':params})
    stmts.append({'statement':'MATCH ()-[r:WHEAT_RELATION {crop_id:$crop,dataset:$dataset}]->() SET r.active=false','parameters':params})
    for n in graph['nodes']:
        stmts.append({'statement':'MERGE (n:WheatEntity {id:$id,crop_id:$crop}) SET n.dataset=$dataset,n.active=true,n.payload=$payload', 'parameters':{**params,'id':n['id'],'payload':json.dumps(n,ensure_ascii=False)}})
    for e in graph['edges']:
        stmts.append({'statement':'MATCH (a:WheatEntity {id:$a,crop_id:$crop}), (b:WheatEntity {id:$b,crop_id:$crop}) MERGE (a)-[r:WHEAT_RELATION {id:$id,crop_id:$crop}]->(b) SET r.dataset=$dataset,r.active=true,r.payload=$payload','parameters':{**params,'a':e['source'],'b':e['target'],'id':e['id'],'payload':json.dumps(e,ensure_ascii=False)}})
    stmts.append({'statement':'MERGE (s:WheatSnapshot {crop_id:$crop,dataset:$dataset}) SET s.sources=$sources','parameters':{**params,'sources':json.dumps(graph['sources'],ensure_ascii=False)}})
    transaction(stmts)
    return {'nodes':len(graph['nodes']),'edges':len(graph['edges'])}

def load_graph():
    params={'crop':CROP,'dataset':DATASET}
    queries=['MATCH (n:WheatEntity {crop_id:$crop,dataset:$dataset,active:true}) RETURN n.payload ORDER BY n.id',
             'MATCH (:WheatEntity {crop_id:$crop,active:true})-[r:WHEAT_RELATION {crop_id:$crop,dataset:$dataset,active:true}]->(:WheatEntity {crop_id:$crop,active:true}) RETURN r.payload ORDER BY r.id',
             'MATCH (s:WheatSnapshot {crop_id:$crop,dataset:$dataset}) RETURN s.sources']
    rows=transaction([{'statement':q,'parameters':params} for q in queries])
    if not rows[2]['data']:raise RuntimeError('旱碱麦已审核图谱尚未导入Neo4j')
    nodes=[json.loads(r['row'][0]) for r in rows[0]['data']];edges=[json.loads(r['row'][0]) for r in rows[1]['data']]
    sources=json.loads(rows[2]['data'][0]['row'][0])
    return {'crop_id':CROP,'nodes':nodes,'edges':edges,'sources':sources,'origin':'Neo4j 实时数据库 · 旱碱麦独立命名空间','counts':{'domain_entities':len(nodes),'semantic_edges':len(edges),'total_relationships':len(edges),'statement_nodes':0,'provenance_edges':0,'publication_groups':len(sources)}}

if __name__=='__main__': print(import_graph())
