"""Export semantic graph and reified evidence statements without deleting prior data."""
import json
from pathlib import Path
from kg import export, literal, properties
from query_v2 import validate
from refine_v2 import PARENTS

ROOT=Path(__file__).resolve().parent
graph=json.loads((ROOT/'data/graph-v2.json').read_text(encoding='utf-8'))
counts=validate(graph)
export(graph,ROOT/'generated')
file=ROOT/'generated/import.cypher'
# Retire only this dataset's previous snapshot. Preserve old facts for audit;
# reactivation below handles renamed nodes and changed relation endpoints.
retire='''MATCH ()-[r]->() WHERE r.dataset = "pear_evidence_v2" SET r.dataset = "retired_pear_evidence_v2";
MATCH (n:KGEntity) WHERE n.dataset = "pear_evidence_v2" SET n.dataset = "retired_pear_evidence_v2";
MATCH (n:KGStatement) WHERE n.dataset = "pear_evidence_v2" SET n.dataset = "retired_pear_evidence_v2";
'''
# Remove only managed type labels on the current node IDs before reclassification.
managed=json.loads((ROOT/'ontology-v2.json').read_text(encoding='utf-8'))['domain_types']
managed=sorted(set(managed+['Condition','Crop','Stage','Risk']))
for n in graph['nodes']:
    retire+=f'MATCH (n:KGEntity {{id:{literal(n["id"])}}}) REMOVE n:'+':'.join(managed)+';\n'
file.write_text(retire+file.read_text(encoding='utf-8'),encoding='utf-8')
lines=['CREATE CONSTRAINT kg_statement_id IF NOT EXISTS FOR (n:KGStatement) REQUIRE n.id IS UNIQUE;']
for n in graph['nodes']:
    for parent in PARENTS.get(n['type'],[]):
        lines.append(f'MATCH (n:KGEntity {{id:{literal(n["id"])}}}) SET n:{parent};')
links=0
for e in graph['edges']:
    sid=e['id']+':statement'
    props={k:v for k,v in e.items() if k not in ('id','source','target')}
    lines.append(f'MERGE (s:KGStatement {{id:{literal(sid)}}}) SET s += {properties(props)};')
    refs=[('SUBJECT',e['source']),('OBJECT',e['target']),('APPLICABLE_CROP',e['crop'])]
    refs += [('SUPPORTED_BY',s) for s in e['evidence_ids']]
    refs += [('APPLICABLE_STAGE',s) for s in e['stage_ids']]
    for rel,target in refs:
        lines.append(f'MATCH (s:KGStatement {{id:{literal(sid)}}}), (n:KGEntity {{id:{literal(target)}}}) MERGE (s)-[r:{rel}]->(n) SET r.dataset="pear_evidence_v2";')
        links+=1
with (ROOT/'generated/import.cypher').open('a',encoding='utf-8') as f:f.write('\n'.join(lines)+'\n')
counts.update(statement_nodes=len(graph['edges']),provenance_edges=links,total_relationships=links+len(graph['edges']),
    source_publication_groups=len({s['publication_group'] for s in graph['sources']}))
(ROOT/'generated/counts.json').write_text(json.dumps(counts,indent=2),encoding='utf-8')
print(json.dumps(counts))
