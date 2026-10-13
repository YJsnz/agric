# 新版四组配对重测

独立于`baseline_v1`，旧目录不写入。沿用其64个固定题号、原始资料、向量索引和Neo4j真实快照，重新生成与评分。350题向量检索也在本目录重跑。

## 四组

- A：DeepSeek闭卷。
- B：普通Vector Top20取Top5。
- C：新版实体与图谱导航、无农业范围过滤的路径+Vector Top20、BGE重排Top5。
- D：生产`ask_graphrag`主链路，包含用途路由、农业证据准入、BGE+融合排序、生成与核查。

B/C/D共同使用新版引用规范化、证据核查和一次反馈修订。统一生成上限2500 tokens，评分2400 tokens，temperature=0。图路径统一20条候选，与V1相同，低于线上默认100条。D依赖适配器只复用真实预计算结果，并断言问题和准入候选一致；不是写死返回答案，也不影响线上服务。

新旧对比包含上述协议变化，不是纯粹的检索消融。64题已参与诊断，属于开发回归集，不能当独立盲测集。没有农业专家人工评分，模型辅助指标不能冒充人工准确率。

## 执行

从agric目录：

```powershell
ai-service/.venv/Scripts/python.exe -u ai-service/scripts/baseline_v2_experiment.py
ai-service/.venv/Scripts/python.exe ai-service/scripts/baseline_v2_report.py
```

单进程锁防止混跑；完成的任务（含失败）恢复时不重抽。manifest冻结输入/代码及旧目录全部文件哈希；code_snapshot保存当次源文件。改参数、代码或题目须开新目录，不得沿用缓存。

## 产物

- `新版农业GraphRAG_ABCD对比评估报告.docx`：新结果与V1对照、限制与案例。
- `summary.json`、`per_question_metrics.jsonl`：汇总和逐题分数。
- `human_review.csv`：问题、答案、gold原文与定位信息、机器评语和人工审核空栏。
- `answers/`：发布回答、API生成记录、独立评分与失败。
- `retrieval/`：候选、范围排除、图谱参与和D排名结果。
- `completed.json`：全部任务结束及旧目录未变的确认。

四组主指标只比较实际输入Top5的Recall@5/MRR@5；350题向量结果另列@5/10/20。失败计入正确率分母。幻觉代理仅在已评分回答中统计，须同时看失败与拒答率。来源相同不等于命中正确段落。生成调用用量不含所有抽取/核查用量，不能当完整账单。
