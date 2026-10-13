# 下一步实施顺序

1. 将本包解压到项目知识库目录，例如 knowledge/qingxian_vegetable/。
2. source_manifest.csv 是资料采购/下载清单。
3. 从官方或合法来源取得标准全文，保存到 raw_sources/，文件名用 source_id。
4. 文本解析后按 500~800 中文字符、80~120 overlap 切块；每块保留 doc_id/title/url/page/section。
5. 用 evidence_extraction_prompt.txt 抽取候选三元组。
6. 对 Disease/Pest、环境风险和干预效果三类关系人工抽查证据；不要人工改训练标签，只是知识证据质检。
7. 实体归一：设施黄瓜→黄瓜，设施番茄→番茄；症状、病害保留 aliases。
8. 导入 Neo4j：实体节点 + 带 source_id/evidence_text 的关系。
9. chunks.jsonl 进入现有 Vector Retriever。
10. 复用泊头鸭梨 GraphRAG：Graph Retriever + Vector Retriever + Evidence Fusion + DeepSeek。
11. 建立 qingxian context：region=青县，scene=facility；温湿度等仅来自真实传感器/用户输入。
12. 做 10~20 条 gold QA 测试：要求回答中的风险结论可回溯到 KG 边和 RAG 原文。
