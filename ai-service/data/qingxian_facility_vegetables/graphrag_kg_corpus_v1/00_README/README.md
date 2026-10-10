# 青县设施蔬菜 KG + GraphRAG 资料包 V1

用途：作为“盐田丰语”青县设施蔬菜子模块的知识图谱与 GraphRAG 初始资料层。

## 已完成
- 青县地方产业依据
- 河北设施蔬菜/番茄/黄瓜核心标准目录
- 可直接导入 RAG 的 documents.jsonl / chunks.jsonl
- KG 初始 entities.jsonl / relations.jsonl
- KG schema
- 证据抽取 Prompt
- 来源清单 CSV/JSONL

## 重要边界
本包不把标准标题/摘要推断成具体病害因果知识。
受版权限制，本包不复制标准全文。应从官方/合法渠道取得标准正文后放入 raw_sources，
再运行切块和证据抽取，形成真正的病害—症状—环境—措施证据图谱。

## V1 推荐核心
青县地方资料明确支持：黄瓜、番茄、甜瓜等是当地特色果蔬。
第一版 KG/GraphRAG 建议以“设施黄瓜 + 设施番茄”为主干；甜瓜作为第二阶段扩展。
