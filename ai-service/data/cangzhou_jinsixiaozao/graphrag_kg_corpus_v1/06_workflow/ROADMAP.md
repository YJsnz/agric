# 完整路线
1. 全文获取与审核：优先 J001/J002/J007/J008/J009/J010/J011/J012/J017/J019。
2. 固定本体。
3. 每条Evidence记录 source_id/page/section/region/stage/scope/subject/predicate/object/evidence_text/evidence_level。
4. 抽取KG候选。
5. 审核 current/historical、region、scope、数值单位、因果强度。
6. 输出 graph-v1.json，建议80–150节点、100–220关系。
7. Neo4j独立命名空间 crop_id=cangzhou_jinsixiaozao。
8. GraphRAG按单主题+单阶段+单地区+单用途切块，200–500中文字。
9. 向量metadata至少保留 crop/region/stage/organ/scope/risk/evidence_level/standard_status/source_id。
10. Query Policy抽 crop/region/stage/organ/symptom/disease_or_pest/weather/rainfall/humidity/irrigation/harvest_intent/storage_intent。
11. Evidence Fusion优先级：现行沧州/保护区标准 > 本地同行评议 > 河北权威 > 本地历史 > 通用权威 > 迁移。
12. 复用DeepSeek → citation validator → grounding。
13. 跑五问真实测试。
14. 封 POST /api/jujube/ask；有视觉后再做 /api/jujube/diagnose。
15. 前端复用已有图谱页和风险页，不重做。
