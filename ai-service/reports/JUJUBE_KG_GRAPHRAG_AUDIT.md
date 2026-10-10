# 金丝小枣 KG + GraphRAG 验收与补强

## 结论
复用原系统，未重新设计KG/GraphRAG。此次为部分通过：固定问题安全行为符合预期，但Q3只有室内离体刺伤接种证据，不能宣称已补齐自然碰伤→真实仓储腐败链。其余缺口逐项保留，不用无来源知识填充。

## 原实现清单（修改前已扫描）
1. KG目录：data/cangzhou_jinsixiaozao/knowledge_graph/
2. GraphRAG目录：jujube/；复用graphrag/answer_service.py、grounding.py，不修改共享代码。
3. 节点：graph-v1.json.nodes
4. 边：graph-v1.json.edges
5. Evidence：graphrag_corpus_v1/reviewed_chunks.json；evidence/raw/；source_registry/；边内含原文与定位。
6. BGE/FAISS：vector/reviewed.faiss、reviewed_metadata.json；models/embedding/中的现有BGE权重。
7. Query：jujube/service.py::extract
8. Retrieval：jujube/service.py::ask + runtime.py::load_graph/search，新增有向2跳paths。
9. Answer：原有generate、validate_citations、audit_answer；模型使用边界引用现有Model Card单独标明policy，不充当农学论文。
10. API：已有jujube/router.py /api/jujube/ask，由graph_web/api.py挂载；此次只补返回字段，未改路由或前端。
11. Tests：jujube/test_service.py、test_acceptance.py、run_acceptance.py。
12. Reports：docs/jujube_source_audit.md、data/cangzhou_jinsixiaozao/evaluation/，此次reports/。
完整文件清单见jujube_implementation_inventory.txt。

## 规模与类型
修改前103节点/76边/15知识块。实际Source记录4条，未伪装为Source节点。原类型Symptom、EnvironmentFactor、AgriculturalPractice、StorageCondition仍保留，不做大范围改名。
L1–L4是新增兼容字段evidence_level_compat，保留旧evidence_level以兼容既有逻辑。计数单位为审核chunk，边引用不重复计成新证据。混合河北/山东/天津研究保守为L3，不升级本地；模型使用说明单独L4-policy，不参与农业证据计数。

```json
{
  "nodes": 114,
  "edges": 77,
  "evidence_records": 16,
  "edge_evidence_links": 77,
  "node_types": {
    "Crop": 1,
    "AgriculturalPractice": 14,
    "GrowthStage": 18,
    "EnvironmentFactor": 7,
    "Pest": 6,
    "Disease": 6,
    "Symptom": 18,
    "HarvestProcess": 5,
    "StorageCondition": 13,
    "PostharvestRisk": 6,
    "WeatherRisk": 2,
    "Pathogen": 3,
    "PlantOrgan": 5,
    "FruitCondition": 5,
    "VisualSymptom": 5
  },
  "relations": {
    "APPLIES_AT": 8,
    "REQUIRES": 14,
    "SUPPORTS": 1,
    "USES": 7,
    "CONDITIONED_BY": 1,
    "MANAGED_AT": 9,
    "AVOIDS": 5,
    "ASSOCIATED_WITH": 3,
    "PROMOTES": 1,
    "HAS_SYMPTOM": 15,
    "HAS_PATHOGEN": 4,
    "OVERWINTERS_IN": 1,
    "DAMAGES": 5,
    "SPREADS_VIA": 1,
    "REDUCES": 1,
    "INCREASES_RISK_OF": 1
  },
  "evidence_levels": {
    "L1": 9,
    "L2": 0,
    "L3": 7,
    "L4": 0
  },
  "production_nodes": 71,
  "postharvest_nodes": 21,
  "harvest_nodes": 4,
  "cross_stage_edges": 1,
  "field_production_to_storage_validated_edges": 0,
  "visual_mappings": 9,
  "strict_six_question_passes": 5,
  "citation_nonempty_passes": 4,
  "grounding_checks": [
    {
      "question": 1,
      "status": "insufficient_evidence",
      "graph_edges": 0,
      "vector_hits": 0,
      "citations": 0,
      "citation_fields_valid": null,
      "generation_called": false,
      "grounding_passed": true,
      "grounding_method": "no_factual_claims",
      "meets_strict_question_target": true
    },
    {
      "question": 2,
      "status": "preliminary",
      "graph_edges": 0,
      "vector_hits": 6,
      "citations": 1,
      "citation_fields_valid": true,
      "generation_called": false,
      "grounding_passed": true,
      "grounding_method": "verified_model_card_usage_policy",
      "meets_strict_question_target": true
    },
    {
      "question": 3,
      "status": "preliminary",
      "graph_edges": 1,
      "vector_hits": 1,
      "citations": 1,
      "citation_fields_valid": true,
      "generation_called": true,
      "grounding_passed": true,
      "grounding_method": "DeepSeek逐字段证据核查，非形式化证明或专家审定",
      "meets_strict_question_target": false
    },
    {
      "question": 4,
      "status": "preliminary",
      "graph_edges": 13,
      "vector_hits": 4,
      "citations": 4,
      "citation_fields_valid": true,
      "generation_called": true,
      "grounding_passed": true,
      "grounding_method": "DeepSeek逐字段证据核查，非形式化证明或专家审定",
      "meets_strict_question_target": true
    },
    {
      "question": 5,
      "status": "preliminary",
      "graph_edges": 0,
      "vector_hits": 4,
      "citations": 1,
      "citation_fields_valid": true,
      "generation_called": false,
      "grounding_passed": true,
      "grounding_method": "verified_model_card_usage_policy",
      "meets_strict_question_target": true
    },
    {
      "question": 6,
      "status": "insufficient_evidence",
      "graph_edges": 0,
      "vector_hits": 0,
      "citations": 0,
      "citation_fields_valid": null,
      "generation_called": false,
      "grounding_passed": true,
      "grounding_method": "no_factual_claims",
      "meets_strict_question_target": true
    }
  ],
  "causal_warnings": 1,
  "region_warnings": 0,
  "validator_errors": 0,
  "validator_warnings": 2,
  "coverage": {
    "叶片病害": "部分：枣锈病防控时间；缺炭疽/白粉叶片鉴别证据",
    "虫害": "覆盖：6个Pest及危害部位、阶段",
    "黄化": "仅视觉词表；病因缺证据",
    "水分胁迫": "缺失；水分供给/墒情不是胁迫机理",
    "盐碱胁迫": "缺失；微咸水标准未取得正文",
    "营养胁迫": "缺失；施肥要求不是缺素诊断",
    "温度": "部分：采后防热/防冻，缺生产温度机理",
    "湿度": "部分：果面阴湿及采后温湿度要求",
    "降雨": "覆盖：成熟期连续阴雨关联",
    "土壤水分": "覆盖：水分供给受土壤墒情约束",
    "灌溉": "部分：水分供给阶段，缺用量阈值",
    "生育期": "覆盖：GrowthStage节点",
    "碰伤": "仅外观词表；刺伤接种为间接参考",
    "机械损伤": "部分：离体刺伤接种实验，不是实际运输碰伤",
    "腐败": "部分：果实病害症状，不能等同采后原因",
    "霉变": "部分：墨绿色霉层等生产期症状，缺储藏霉变链",
    "失水": "缺失",
    "裂果": "覆盖：成熟期降雨关联",
    "成熟度": "覆盖：鲜食脆熟/干制完熟采收要求",
    "采摘方式": "缺失",
    "运输振动": "缺失",
    "包装": "原文9.1有条文，尚未抽取为图谱关系",
    "堆压": "仅堆码整齐要求，缺堆压损伤关系",
    "预冷": "缺失",
    "储藏温度": "部分：防热、防冻、温湿度适宜，无数值阈值",
    "储藏湿度": "部分：防潮、温湿度适宜，无数值阈值",
    "储藏时间": "原文要求尽量缩短待运时间，无货架寿命模型",
    "通风": "覆盖：干枣阴凉通风/通风良好"
  }
}
```

用户列举但未出现的节点类型计数为0（例如Region、AbioticStress、EnvironmentalFactor、StorageFactor、TransportFactor、Intervention、Source）；不将现有近义类型无声重分类。原关系名称保留大写，HAS_SYMPTOM可对应has_symptom，ASSOCIATED_WITH可对应associated_with，新增INCREASES_RISK_OF可对应increases_risk_of。其他请求关系若未列出均为0，原关系统计完整列于JSON。
production/postharvest节点按具有相应scope的证据边端点计数，可交叉，不包括孤立视觉词表节点。

## 补强与边界
新增JJC_AUDIT_001/JJE_AUDIT_001，逐字来自J008第2.3节：刺伤接种发病率高于无伤接种。cross_stage标记含义是生产果实进入离体试验，不是生产到仓储效果已验证；现场生产→采后稳定性已验证关系仍为0。causal warning 1即这一外推风险，已在条件和prompt限制。
九个映射全部为VisualSymptom/FruitCondition，无确诊Disease、食品安全不合格映射。黄化不等于缺氮。
原region抽取不由作物名推断；缺失仍为None。混合研究地区不变。数据节点地区与用户所在地不同字段，不混用。
原文引用的GB/T26908等标准没有正文，不能把其内容补作本标准证据。原文未提供的知识缺口仍列于coverage。

## 检索与真实六问
真实BGE/FAISS检索已执行，索引仅增量数据补充后重新编码16条，不重建检索实现。Neo4j本机连接被拒绝，未报告Neo4j成功，未修改数据库。验收显式设置JUJUBE_GRAPH_BACKEND=file，读取实际审核graph-v1.json；默认仍走原Neo4j。部署需用原import_graph同步金丝小枣独立命名空间后再验收Neo4j，不影响其他作物。
Q1/Q6拒绝无证据归因；Q2/Q5引用模型边界卡片而非LLM农学推断；Q3/Q4真实DeepSeek生成及原有逐字段grounding通过。
strict六问要求通过5/6；Q3仅部分满足，不能虚构自然碰伤腐败路径。非空citation字段校验4/4；农业LLM grounding 2/2，policy核验2/2，无事实拒答2/2。不得把这六种结果合称六次LLM grounding通过。
无证据答复不附伪引用，citations=[]并明确insufficient_evidence。status=preliminary仅在发布候选/边界回答时出现；没有把本地证据不足改成supported。原有citation/grounding门槛未降低。
19项回归测试通过（原11项+新增8项）。方向路径测试基于真实“连续阴雨→裂果→管理阶段”二跳，组合路径不代表新的因果关系。
validator warnings 2：Neo4j未运行；Q3自然碰伤/储藏证据缺口。validator_errors=0指原文、出处、scope等本地校验，不意味着全部业务覆盖完成。

## 修改文件
- jujube/compat.py
- jujube/supplement.py
- jujube/service.py
- jujube/runtime.py
- jujube/test_acceptance.py
- jujube/run_acceptance.py
- jujube/audit_acceptance.py
- data/cangzhou_jinsixiaozao/knowledge_graph/graph-v1.json
- data/cangzhou_jinsixiaozao/knowledge_graph/ontology.json
- data/cangzhou_jinsixiaozao/knowledge_graph/jujube_visual_entity_mapping.json
- data/cangzhou_jinsixiaozao/graphrag_corpus_v1/reviewed_chunks.json
- data/cangzhou_jinsixiaozao/vector/reviewed.faiss
- data/cangzhou_jinsixiaozao/vector/reviewed_metadata.json

另生成reports/jujube_six_question_acceptance.json、jujube_implementation_inventory.txt、jujube_kg_graphrag_audit.json及本报告。
未修改jujube_diagnosis、pear/wheat、共享GraphRAG、前端或原始资料；没有训练。
复现：JUJUBE_GRAPH_BACKEND=file；python -m jujube.run_acceptance；python -m jujube.audit_acceptance。
