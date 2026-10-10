# 向量索引

已构建普通向量检索基线：BGE-small-zh-v1.5（ONNX / CPU，512 维）+ FAISS IndexFlatIP，向量归一化后的内积即余弦相似度。不调用 Neo4j、重排模型或大语言模型。

在 `ai-service` 目录运行：

```powershell
.venv/Scripts/python.exe -m pip install -r scripts/vector_requirements.txt
.venv/Scripts/python.exe scripts/download_embedding.py
.venv/Scripts/python.exe scripts/vector_search.py --build
.venv/Scripts/python.exe scripts/vector_search.py --query "泊头鸭梨黑星病在什么条件下容易发生？" --top-k 3
.venv/Scripts/python.exe scripts/test_vector.py
.venv/Scripts/python.exe scripts/vector_smoke.py
```

`index.faiss` 保存索引，`metadata.json` 保存原始块、页码、来源、向量映射及模型/语料/索引 SHA-256。下载遇系统代理故障时可显式使用 `--direct`。

本次输入 139 个候选块，排除 6 个需要版面复核的块和 4 个封面/前言块，129 个块生成 225 条向量。BGE 输入上限 512 token，因此使用最多 350 字、重叠 50 字的内部窗口，并逐窗验证 token 数；检索以最高窗口分数聚合、去重后返回完整原始块，不改变第三阶段的规则切块。查询附加 BGE 中文检索指令，文档不附加。默认 Top5，可指定 Top1～20。

所有条目仍是研究候选，未通过完整农学人工审核；普通基线不做地域、阶段、证据图谱过滤。来源地区、年份和审核字段随结果保留，非本地资料不能直接当作泊头适用结论，网页未核实的机构归属仍须复核。

示例问题 Top1 为 GOV_001_C0001（黑星病夏季防治），余弦相似度约 0.6595；Top2 为黑心病/虎皮病论文段落，属于检索噪声。完整三组实测结果见 `../evaluation/vector_retrieval_smoke.json`。这些是功能验证，**不是准确率**；正式 Recall@K、MRR 等需独立人工标注的评测集。后续 GraphRAG 应使用相同语料快照和评测问题比较。
