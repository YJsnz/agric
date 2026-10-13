"""Read-only acceptance checks against live Neo4j, not the build JSON."""
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent/'graph_web'))
from server import load_graph, query_database
from query_v2 import paths, ask
from refine_v2 import REQUIRED_TYPES

QUERIES={
 'entity': "MATCH (n:KGEntity) WHERE n.dataset='pear_evidence_v2' AND (n.name='黑星病' OR '黑星病' IN coalesce(n.aliases,[])) RETURN n.name,labels(n),properties(n)",
 'neighbors': "MATCH (n:KGEntity)-[r]-(m) WHERE n.dataset='pear_evidence_v2' AND '黑星病' IN coalesce(n.aliases,[]) AND r.dataset='pear_evidence_v2' RETURN n.name,type(r),m.name LIMIT 50",
 'two_three_hops': "MATCH p=(n:KGEntity)-[*2..3]-(m:KGEntity) WHERE n.dataset='pear_evidence_v2' AND '黑星病' IN coalesce(n.aliases,[]) AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') AND all(x IN nodes(p) WHERE x:KGEntity AND NOT x:Source) RETURN [x IN nodes(p)|x.name],[r IN relationships(p)|type(r)] LIMIT 50",
 'production_postharvest': "MATCH p=(a:KGEntity)-[*1..4]->(b:KGEntity) WHERE a.name='牵拉果梗' AND b.name='梗基腐烂风险' AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') RETURN [x IN nodes(p)|x.name],[r IN relationships(p)|type(r)] LIMIT 10",
 'unsupported_humidity_rot': "MATCH p=(a:KGEntity)-[*1..4]->(b:KGEntity) WHERE a.name='持续湿润' AND b.name='采后腐烂风险' AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') RETURN [x IN nodes(p)|x.name] LIMIT 10",
 'labels': "MATCH (n:KGEntity) WHERE n.dataset='pear_evidence_v2' RETURN n.type,count(n),collect(DISTINCT labels(n))[0]",
 'source_links': "MATCH (s:KGStatement)-[r:SUPPORTED_BY]->(d:Source) WHERE s.dataset='pear_evidence_v2' AND r.dataset='pear_evidence_v2' RETURN count(r)",
 'missing_evidence_links': "MATCH (s:KGStatement) WHERE s.dataset='pear_evidence_v2' AND NOT EXISTS { MATCH (s)-[r:SUPPORTED_BY]->(d:Source) WHERE r.dataset='pear_evidence_v2' AND d.dataset='pear_evidence_v2' } RETURN count(s)",
}

def main():
    graph=load_graph(); ids={n['name']:n['id'] for n in graph['nodes']}
    results=query_database(list(QUERIES.values()))
    rows={name:[d['row'] for d in result['data']] for name,result in zip(QUERIES,results)}
    types=Counter(n['type'] for n in graph['nodes']); types['Source']=len(graph['sources'])
    checks={
      'required_types':all(types[t]>0 for t in REQUIRED_TYPES),
      'entity_alias_query':bool(rows['entity']), 'neighbors':bool(rows['neighbors']),
      'two_three_hops':bool(rows['two_three_hops']),
      'production_postharvest':bool(rows['production_postharvest']),
      'no_invented_humidity_rot':not rows['unsupported_humidity_rot'],
      'evidence_links':rows['missing_evidence_links']==[[0]],
      'node_properties':all(all(k in n for k in ['id','name','type','description','crop','region','source_count']) for n in graph['nodes']),
      'relation_evidence':all(e.get('evidence_ids') and e.get('locator') and e.get('evidence_level') and 'crop' in e and 'region' in e and 'stage_ids' in e for e in graph['edges']),
      'no_uncalibrated_confidence':all(e.get('confidence') is None for e in graph['edges']),
      'local_scope_excludes_foreign_scab':not ask(graph,'黑星病',{'region':'泊头市'})['edges'],
      'scab_to_postharvest_symptom':bool(paths(graph,ids['梨黑星病'],ids['储藏中显现黑星病斑'],{})),
    }
    questions=['黑星病是什么','黑星病有什么症状','什么因素促进黑星病','黑星病有什么防治措施','黑星病与哪些品质风险有关','机械损伤与采后腐烂风险']
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'origin':graph['origin'],'counts':graph['counts'],
      'types':dict(types),'relations':dict(Counter(e['relation'] for e in graph['edges'])), 'checks':checks,
      'cypher_results':rows,'questions':{q:ask(graph,q,{}) for q in questions},
      'limitations':['黑星病参考证据来自异地，不等于泊头本地验证。','持续湿润到采后腐烂缺乏已收录证据，不生成该路径。','路径不是反事实模型，未估计损耗概率。']}
    folder=ROOT/'audit'; folder.mkdir(exist_ok=True)
    (folder/'live-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (folder/'acceptance.cypher').write_text('\n\n'.join('// '+k+'\n'+v+';' for k,v in QUERIES.items()),encoding='utf-8')
    print(json.dumps({'checks':checks,'counts':graph['counts']}))
    if not all(checks.values()): raise SystemExit(1)

if __name__=='__main__':main()
