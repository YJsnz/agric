"""Shared live Neo4j repository used by FastAPI and acceptance checks."""
import base64
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / 'knowledge_graph'))
from query_v2 import paths, ask
QUERIES = [
    "MATCH (n:KGEntity) WHERE NOT n:Source AND n.dataset = 'pear_evidence_v2' RETURN properties(n) ORDER BY n.id LIMIT 1001",
    "MATCH (a:KGEntity)-[r]->(b:KGEntity) WHERE r.dataset = 'pear_evidence_v2' RETURN properties(r), a.id, b.id, type(r) ORDER BY r.id LIMIT 3001",
    "MATCH (s:KGEntity:Source) WHERE s.dataset = 'pear_evidence_v2' RETURN properties(s) ORDER BY s.id LIMIT 1001",
    "MATCH (s:KGStatement) WHERE s.dataset = 'pear_evidence_v2' OPTIONAL MATCH (s)-[r]->() WHERE r.dataset = 'pear_evidence_v2' RETURN count(DISTINCT s), count(r)",
]


def query_database(statements):
    password = os.environ.get('NEO4J_PASSWORD', os.environ.get('LOCAL_NEO4J_PASSWORD', ''))
    user = os.environ.get('NEO4J_USER', 'neo4j')
    token = base64.b64encode(f'{user}:{password}'.encode()).decode()
    endpoint = os.environ.get('NEO4J_HTTP_URL', 'http://127.0.0.1:7474').rstrip('/') + '/db/neo4j/tx/commit'
    body = json.dumps({'statements': [{'statement': q} for q in statements]}).encode()
    req = Request(endpoint, body, {'Authorization': 'Basic ' + token, 'Content-Type': 'application/json'})
    with urlopen(req, timeout=12) as response:
        data = json.load(response)
    if data.get('errors'):
        raise ValueError('数据库查询失败，请检查数据库服务和访问权限。')
    return data['results']


def load_graph():
    results = query_database(QUERIES)
    nodes = [row['row'][0] for row in results[0]['data']]
    edges = [dict(row['row'][0], source=row['row'][1], target=row['row'][2], relation=row['row'][3]) for row in results[1]['data']]
    sources = [row['row'][0] for row in results[2]['data']]
    if len(nodes) > 1000 or len(edges) > 3000 or len(sources) > 1000:
        raise ValueError('图谱已超过当前网页容量，请先按专题拆分图谱后查看。')
    counts=results[3]['data'][0]['row']
    return {'nodes': nodes, 'edges': edges, 'sources': sources,
            'counts':{'domain_entities':len(nodes),'semantic_edges':len(edges),'statement_nodes':counts[0],
                      'provenance_edges':counts[1],'total_relationships':len(edges)+counts[1],
                      'publication_groups':len({s.get('publication_group',s['id']) for s in sources})}, 'origin': 'Neo4j 实时数据库',
            'loaded_at': datetime.now(timezone.utc).isoformat()}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('api:app', host='127.0.0.1', port=int(os.environ.get('GRAPH_WEB_PORT', '8090')))