// 研究模式：含假设，不代表经过本地审定的因果链。
MATCH p=(a:State {id: 'state:late_infection'})-[:PROMOTES|MAY_LEAD_TO*1..4]->(b)
RETURN p, [r IN relationships(p) | {id:r.id, kind:r.kind, review:r.review_status, evidence:r.evidence_ids}] AS evidence;

// 关系对应来源与小节。源码中保留来源原地区，不能冒充本地证据。
MATCH (a:KGEntity)-[r]->(b:KGEntity)
WHERE r.id = 'edge:024'
UNWIND r.evidence_ids AS sourceId
MATCH (s:Source {id:sourceId})
RETURN a.name, r.claim, r.locator, r.review_status, b.name, s.title, s.url, s.scope;

// 本地事实模式；当前不会返回黑星病的本地农技关系。
MATCH (a:KGEntity)-[r]->(b:KGEntity)
WHERE r.scope = 'local' AND r.kind = 'fact'
  AND r.review_status IN ['source_checked', 'local_expert_reviewed']
RETURN a.name, type(r), b.name, r.evidence_ids;
