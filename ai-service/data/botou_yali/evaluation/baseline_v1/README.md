# 第十五阶段：四组 baseline 初步实验

## 范围

- 350题：全部运行原始 BGE + FAISS 向量检索，保存 Top20。
- 64题：固定样本，运行 DeepSeek / Vector RAG / 普通图检索对照 / 农业约束 GraphRAG。
- 固定选样：全部27道非事实标签题，加37道按SHA-256排序、论文轮转选择的事实题；不按结果挑题。
- 每组生成采用同一 DeepSeek 模型、temperature=0。B/C/D共用证据Prompt、Top5和引用校验。
- C/D最多各20个图路径候选+20个向量候选，使用同一BGE重排模型。C关闭地域/作物/阶段过滤；D保留严格适用性与证据准入。不是Microsoft GraphRAG官方复现。

## 文件

`农业GraphRAG_Baseline评估报告.docx`为生成报告；`summary.json`为汇总。
`manifest.json`冻结题号、索引和语料哈希；`graph_snapshot.json`是真实Neo4j快照。
`vector/`记录350题向量排名，`entities/`记录64题实体抽取，`retrieval/`记录C/D排名和剔除原因。
`answers/`记录回答、真实API标识、引用及盲评；`per_question_metrics.jsonl`为逐题指标。
`human_review.csv`预留人工准确性、幻觉与审核者字段，尚未人工审核。
`rejected_responses/`保留启用诊断记录后的校验失败样本；早期未保存的原始失败回答无法补造。

## 指标解释

正确率是模型辅助的严格correct比例（分母64），接口失败和拒答均不计正确。
证据命中率以答案实际引用的gold块为准，另报来源级命中；失败按0。
Recall@K和MRR@K以gold chunk为相关项；目前每题1个gold块，未穷尽所有等价证据。
实体召回是答案对原题表面词的逐字覆盖，不是标准图实体对齐准确率。
幻觉率为“证据不支持回答率”代理，仅对成功盲评回答统计；区分明确矛盾与未能验证，不能将其写成客观虚假比例。
因果正确率只取12道非背景causal题，不意味着已实现反事实推断。

## 复现

从agric目录运行：

```powershell
ai-service/.venv/Scripts/python.exe ai-service/scripts/test_baseline_experiment.py
ai-service/.venv/Scripts/python.exe -u ai-service/scripts/baseline_experiment.py --workers 4
ai-service/.venv/Scripts/python.exe ai-service/scripts/baseline_report.py
```

已有结果断点复用。完成主实验后才可用`--retry-answers`重试失败项，不能与主实验并行。
密钥从已有本地配置读取，不写入结果。修改Prompt或检索预算后须建立新的实验目录，不能混合缓存。

## 结论边界

这是三篇论文的阅读集，存在标题提示、同源相关、同模型制题与评审偏差，并非独立专家金标准。
没有训练或基于结果调参；本实验不声称统计显著差异。
如果图路径未参与，报告必须说明C退化为向量+重排；不得将其成绩解释为因果推理提升。
350题只有向量全量结果，不能声称完成350题四组生成评测。

方法参考：RAGAS https://arxiv.org/abs/2309.15217；BEIR指标 https://github.com/beir-cellar/beir/wiki/Metrics-available 。本项目为自定义评测，不使用官方RAGAS分数名义。
