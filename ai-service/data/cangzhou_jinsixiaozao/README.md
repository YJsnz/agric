# 沧州金丝小枣资料目录

已接入独立金丝小枣图谱与文本 GraphRAG，不复用鸭梨或旱碱麦证据。共享的是编码器、数据库传输、DeepSeek 生成及 citation/grounding 校验代码。

- graphrag_kg_corpus_v1/：用户下载资料包原样归档，种子关系未直接导入。
- graphrag_corpus_v1/：15 个核验原文主题块。
- knowledge_graph/：独立本体及 graph-v1.json，103 个节点、76 条有原文关系。
- source_registry/：来源元数据、标准状态、全文状态、SHA256。
- evaluation/：评测数据与历史结果。
- evidence/：证据来源与审核记录；目录归属不代表本地适用，仍按region/review_status核对。
- vector/：向量索引和配套元数据。

运行（ai-service 目录）：

```powershell
.\.venv\Scripts\python.exe -m jujube.build
.\.venv\Scripts\python.exe scripts/validate_jujube_kg.py
.\.venv\Scripts\python.exe -c "from jujube.runtime import import_graph,build_index; print(import_graph()); print(build_index())"
.\.venv\Scripts\python.exe -m unittest jujube.test_service wheat.test_wheat
.\.venv\Scripts\python.exe -m jujube.run_real
```

接口：`POST /api/jujube/ask`，JSON `question` 必填、`region` 选填。`GET /api/graph?crop=jujube` 实时读取独立 Neo4j 命名空间。8090 原页面选择“沧州金丝小枣”即可使用。

审核报告：`../../docs/jujube_source_audit.md`。J002、J009～J012、J019 等尚未取得可审核正文，未编造灌溉阈值、烘干参数或候选关系。关系数量低于目标，优先保证原文可追溯。

`insufficient_evidence` 表示尚不能支持用户具体地块的确定结论，不妨碍有引用的初步回答；`validation_failed` 不发布未通过核验的内容。grounding 是模型逐字段检查，不是专家审定或形式化证明。
