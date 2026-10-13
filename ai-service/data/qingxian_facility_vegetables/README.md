# 青县设施蔬菜知识库 V1

资料包原样保存在 graphrag_kg_corpus_v1，下载目录没有删除。新增审核正文位于 evidence/raw；原始资料和未经全文核验的种子关系没有直接导入正式图谱。

第一版范围为黄瓜、番茄。已取得六份河北地方标准全文，补充三篇农技文章及一份青县产业背景报道。未取得全文的标准不抽取条文。标准 DB13/T 5574-2022 的范围保留为河北冀中南地区；河南、吉林资料仍为 transfer_pending，仅用于经核对的症状或机理比较。

目录：
- source_registry/source_manifest.json：15条来源核验状态
- evidence/download_audit.json、supplement_audit.json：获取记录、哈希和全文状态
- evidence/raw：PDF和网页原文
- evidence/evidence_reviewed.jsonl：逐条原文、定位和关系
- knowledge_graph/graph-v1.json：110节点、90关系
- knowledge_graph/ontology.json：独立本体
- graphrag_corpus_v1/reviewed_chunks.json：25个主题知识块
- vector/reviewed.faiss：本地BGE向量索引
- evaluation/real_qa.json：真实Neo4j、向量、DeepSeek与grounding结果

知识块按原文条款和症状主题切分，短条文不为凑字数混入其他主题。每条关系可回溯source_id、页/节、原文及哈希。verbatim_verified表示程序与原文核对通过，不代表农技专家审定。

Neo4j使用独立domain=qingxian_facility_vegetables；无作物信息先返回needs_clarification，不根据“设施蔬菜”栏目猜黄瓜。缺失传感器、地区、生育期保持None。

API：POST /api/qingxian/ask，question必填；crop可填黄瓜/番茄，region、organ、scene、growth_stage、season、temperature、humidity、light、soil_moisture、ec、ph可选。尚不接真实传感器与蔬菜视觉模型，不代表已完成图像诊断。

运行（ai-service目录）：
python -m qingxian_diagnosis.validate
python -m unittest qingxian_diagnosis.test_service wheat.test_wheat jujube.test_service
python -m qingxian_diagnosis.run_real

生成状态允许insufficient_evidence：有依据的候选研判不等于现场确诊。validation_failed表示引用或grounding未通过，未发布该回答。规则分数不是疾病概率。数值上下文尚未建立审核过的自动阈值匹配，仅交由证据约束研判，不自动报警。
