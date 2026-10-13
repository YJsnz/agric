// entity
MATCH (n:KGEntity) WHERE n.dataset='pear_evidence_v2' AND (n.name='黑星病' OR '黑星病' IN coalesce(n.aliases,[])) RETURN n.name,labels(n),properties(n);

// neighbors
MATCH (n:KGEntity)-[r]-(m) WHERE n.dataset='pear_evidence_v2' AND '黑星病' IN coalesce(n.aliases,[]) AND r.dataset='pear_evidence_v2' RETURN n.name,type(r),m.name LIMIT 50;

// two_three_hops
MATCH p=(n:KGEntity)-[*2..3]-(m:KGEntity) WHERE n.dataset='pear_evidence_v2' AND '黑星病' IN coalesce(n.aliases,[]) AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') AND all(x IN nodes(p) WHERE x:KGEntity AND NOT x:Source) RETURN [x IN nodes(p)|x.name],[r IN relationships(p)|type(r)] LIMIT 50;

// production_postharvest
MATCH p=(a:KGEntity)-[*1..4]->(b:KGEntity) WHERE a.name='牵拉果梗' AND b.name='梗基腐烂风险' AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') RETURN [x IN nodes(p)|x.name],[r IN relationships(p)|type(r)] LIMIT 10;

// unsupported_humidity_rot
MATCH p=(a:KGEntity)-[*1..4]->(b:KGEntity) WHERE a.name='持续湿润' AND b.name='采后腐烂风险' AND all(r IN relationships(p) WHERE r.dataset='pear_evidence_v2') RETURN [x IN nodes(p)|x.name] LIMIT 10;

// labels
MATCH (n:KGEntity) WHERE n.dataset='pear_evidence_v2' RETURN n.type,count(n),collect(DISTINCT labels(n))[0];

// source_links
MATCH (s:KGStatement)-[r:SUPPORTED_BY]->(d:Source) WHERE s.dataset='pear_evidence_v2' AND r.dataset='pear_evidence_v2' RETURN count(r);

// missing_evidence_links
MATCH (s:KGStatement) WHERE s.dataset='pear_evidence_v2' AND NOT EXISTS { MATCH (s)-[r:SUPPORTED_BY]->(d:Source) WHERE r.dataset='pear_evidence_v2' AND d.dataset='pear_evidence_v2' } RETURN count(s);