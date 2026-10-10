# 泊头鸭梨知识图谱核对与补充记录
日期：2026-09-25

## 结论与核对边界
不能宣称图谱全部内容已经科学验证。本次对全量数据做结构检查，对农业农村部、UC IPM及两篇鸭梨论文做重点证据核对。旧关系仍需农业专家逐条复核；来源可靠不等于因果效应成立。

## 前端发现
泊头鸭梨页面包含一般梨类和异地资料。分类导航虚线不是数据库农业事实边。已增加待本地适用性审核提示，防止把分类归属误读成本地产生的结论。显示关系总数包含溯源，实际农业语义边315条。

## 黑星病范围
UC IPM描述的是加州梨及Venturia pirina。保留异地适用性标记；不能把它无条件当成泊头鸭梨病原鉴定或当地用药依据。黑星病到采后腐烂的普遍因果链未获本次材料支持，不补造。

## 采后规范
农业农村部区分侵染性病害和冷害、二氧化碳伤害等生理问题，并单列鸭梨温控要求。不同品种气体指标不能移植；本文未新增农药或消毒剂剂量建议。

## 新增论文知识
新增2份独立论文来源、9个实体、8条关系。2024研究支持特定高成熟度鸭梨快速降温组的若干品质观察；2025研究比较不同成熟度在缓冷条件下的表现。均来自辛集试材，标记transfer_pending，不输出泊头风险概率。方法条件逐条附在conditions中。

## 科学表达限制
2025文中部分描述存在表述不一致风险，本次仅抽取方法及结果3.1的限定比较，不采用其前言中的泛化机制，不计算因果效应。两文的成熟度和降温方案不同，不构成简单互相否定，也不能据此推荐所有鸭梨快冷。

## 文档存储
yali2024.html及txt为开放论文原始网页与文本；moa和ucscab为官方网页快照及文本。yali2025.download-blocked.html是反机器人验证页，不是论文全文。2025正文经浏览工具读取，其结构化知识已整理，但不声称本地已取得该文完整原件。

## 数据集用途
reviewed_claims.jsonl为经本次资料核对的知识关系及条件；sources.jsonl为原件清单与SHA256；audit.json为数据检查；graph-before.json为变更前备份。未重建FAISS或350题评测集，不能声称问答精度已经提高。

## 前后数量
{
  "review_date": "2026-09-25",
  "scope": "结构全量检查；四份原文重点核对，不是307条旧关系逐条专家复审",
  "before": {
    "nodes": 356,
    "edges": 307,
    "sources": 30
  },
  "after": {
    "nodes": 365,
    "edges": 315,
    "sources": 32
  },
  "live_matches_disk": true,
  "edge_review_status": {
    "source_checked": 193,
    "transfer_pending": 122
  },
  "missing_evidence": [],
  "unverified_causal_probability": []
}
yali2024：https://pmc.ncbi.nlm.nih.gov/articles/PMC11011782/
yali2025：https://pmc.ncbi.nlm.nih.gov/articles/PMC12191683/
moa：https://scs.moa.gov.cn/ccll/jszn/202302/t20230203_6419771.htm
ucscab：https://ipm.ucanr.edu/agriculture/pear/pear-scab/