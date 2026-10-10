# 第五阶段：实体抽取

检索缺口修复：未匹配的病害/环境不再阻断所有已匹配实体；未知作物/地区/阶段仍阻断图谱以免放宽范围。接口增加 unresolved_entities 和 reference_materials。后者只显示被筛选排除的候选标题、URL 与原因，usable_for_answer=false，不传给生成器，不计入 sources 或 reasoning_paths。高湿不自动映射到持续湿润。示例问题仍可能返回 insufficient_evidence，这是本地知识覆盖限制，不能以伪造别名或范围标签消除。

## 第十一至十三阶段：GraphRAG V1 问答

第十二阶段验收记录：`data/botou_yali/evaluation/deepseek_stage12_smoke.json`。补齐“贮藏/储藏/贮藏期 → 储藏期”的查询别名，避免已存在的阶段被误当未知。生成回答的引用编号必须与正文引用一致；来源条目增加 citations，可追溯 evidence_id、chunk_id、章节和页码（图谱来源追溯 edge_ids）。密钥沿用本机 .env.local，不回显、不发送前端。

第十一阶段专项修复：evidence_fusion.py 对文档及每条图谱边均独立检查地区、作物、阶段；图谱还核验来源已读取、原文定位、审核状态及 A/B/C 准入。缺失查询所需范围不作为全国/全阶段；不将“果实期”自动视为“果实膨大期”，这种粒度差异需要明确本体映射。支持 allowed_levels 收紧为仅 A；语义分 0.93 不能抵消范围冲突，过滤后才交由 Reranker 排序，未宣称所有 A 都应优先于相关性更强的 B。

`scripts/test_evidence_fusion.py` 覆盖用户 A/B 示例、单项冲突、缺失元数据、证据等级配置、重复候选、图谱跨地区与失效来源。`scripts/evidence_fusion_check.py` 保存合成机制案例和真实语料审核统计到 `data/botou_yali/evaluation/evidence_fusion_check.json`；真实统计是适用性准入结果，不是问答准确率或检索质量提升。

`POST /api/graphrag/ask`，请求 `{"question":"泊头鸭梨果实膨大期持续高湿有什么风险？"}`。网页右侧新增“GraphRAG 证据问答”。本入口串联 DeepSeek 实体抽取、对齐、双路检索、evidence_fusion.py、BGE 重排、prompt_builder.py 和 DeepSeek 生成。

回答入口默认严格范围约束：明确查询地区、作物或阶段但资料缺少对应标签时不用于生成；文档只接纳 A/B/C、具有来源 URL 且无版面复核标记的候选；图谱边还须 source_checked/local_expert_reviewed。证据等级作为准入门槛，不宣称标准等级能自动证明因果关系。来源等级及文档农学适用性仍依赖原始元数据与人工审核。

无合格候选时返回 insufficient_evidence，直接给出五段式不足说明，不调用生成模型。否则精排 Top5，并把完整原文及原图谱路径送入受约束 Prompt。返回 answer、entities、extracted_entities、reasoning_paths、sources、evidence、channels、generation_called 等字段。实体列表保留用户原词；reasoning_paths 只从被引用的真实图谱候选复制，不采纳模型创造的路径；sources 由服务端证据生成。

生成采用 JSON 格式，结构及引用编号校验失败返回 502；模型或数据库不可用返回明确错误。提示词要求证据不足时说明、禁止补造论文/标准/关系/剂量/百分比，并禁止提供具体农药剂量。**结构与引用校验不等于已证明每句话被原文蕴含**；目前未实现事实级自动验证或人工农学复审，仍属研究原型。

本地仅保留必需的 BGE Embedding 和 BGE Reranker；没有下载生成式大模型，也没有训练大模型。DeepSeek 密钥继续读取 Git 忽略的 .env.local，不写入前端。只有当前问题和入选证据发送至 DeepSeek。

实测记录 `data/botou_yali/evaluation/graphrag_v1_smoke.json`。指定“泊头鸭梨＋果实膨大期＋持续高湿”目前缺少符合约束的证据，正确返回不足，而不是示例中的虚构完整风险链。普通储藏问题用于验证真实生成及来源追溯。前阶段研究浏览接口仍保留，不能把研究浏览结果与严格问答结果混作同一个评测设置。

## 第十阶段：BGE 模型精排

现在 `reranker.py` 使用真正的 BAAI/bge-reranker-base CrossEncoder（FastEmbed 0.8.0 + ONNX Runtime CPU），不再只是融合函数别名；第八阶段融合函数仍保持兼容。

流程：第九阶段图谱路径 + FAISS Top20 → 问题/候选成对评分 → 窗口最大值聚合 → 候选去重 → Top5～10。路径序列化保留关系方向和适用条件；文档序列化为标题、章节、正文。超过长度的内容按最多 350 字、重叠 50 字分窗，并验证每个问题/窗口对不超过 512 token；问题超过 240 token 明确拒绝。全候选保留原文和证据，另返回最高分窗口。最大窗口聚合可能偏好长文档；不同长度和图谱/文档类型的评分未校准，需要后续独立评测。

API：`POST /api/graphrag/rerank`，请求 question、可选 entities、mode、top_k（5～10，默认5）。自动串联双路检索，返回 results、channels、graph_sources、alignments、corpus_sha256。数据不足时不补造到指定数量；所有候选都不相关时也可能返回低分 TopK，目前没有经验证的拒答阈值。尚未调用答案生成大模型。

网页右侧选择“BGE 精排 Top5”即可使用。模型文件位于 models/reranker，Git 忽略。`scripts/download_reranker.py` 从 BAAI ModelScope 仓库下载 ONNX 与分词器；manifest.json 记录源地址、大小、SHA-256，当前跟踪 master 下载快照而非固定远端 revision。

本机实测：20 个文档候选、36 个窗口约 9.36 秒；11 条图谱路径加 20 个文档候选、56 个窗口约 11.74 秒。耗时不含首次模型加载，只代表本机这次测试。完整结果：data/botou_yali/evaluation/reranker_smoke.json。精排质量和提升幅度尚未用人工标注集评估。

验证命令：`python scripts/test_reranker.py`；真实模型复测：`python scripts/rerank_smoke.py`。官方模型说明：https://huggingface.co/BAAI/bge-reranker-base 。分数为模型相关性输出，非概率，不因分数高而解除地区、阶段或证据审核限制。

## 第九阶段：图谱与文档候选集

`dual_retriever.py` / `POST /api/graphrag/dual` 接受 question、可选 entities（完整六字段抽取结构）、mode。未提供 entities 时调用 DeepSeek，然后进行实体对齐、Neo4j 快照子图检索与 FAISS Top20 检索。两通道当前顺序执行，属于逻辑双路，并未声明并行提速。

返回 candidate_set：graph_path 包含原方向的 edges、node_ids、node_names、source_ids；document_chunk 包含完整块及原文 URL、页码、排名、余弦值与适用性提示。路径最多 3 边、100 条，显式报告截断。返回 graph_sources 供解析路径证据。路径仅为有向简单知识路径，不是量化因果结论。

此层保留两路候选而不预先融合掉图谱独有证据；第八阶段融合排序是下游可选步骤，当前不自动生成答案。图谱未匹配或歧义时标记 blocked_alignment，仍执行文档检索；数据库或索引故障返回 503，不伪装成空知识。每个通道有独立状态/count。研究模式的 unknown 适用范围仍须审核。

图谱右侧选择“图谱 + 文档双路检索”即可输入问题。实测保存在 `data/botou_yali/evaluation/dual_retrieval_smoke.json`；单元测试 `scripts/test_dual_retriever.py` 验证方向、深度、限额和图谱阻断后的文档保留。并非所有问题都有完整知识路径；缺失时不能补写用户示例链。

## 第八阶段：农业融合检索

已实现显式适用性过滤、语义与图谱双通道召回、加权 RRF、有限元数据调整与来源限额。详细公式、限制、API、调参方法见 [算法说明](../../docs/农业GraphRAG检索算法说明.md) 和同目录 Word 文档。`POST /api/graphrag/search` 可直接调用；`scripts/agricultural_search.py` 可复现实验。当前实体解析网页仍展示第七阶段结果，融合检索通过新 API/CLI 使用。默认参数未经验证集优化，不声明性能提升。

## 第七阶段：子图检索

`graph_retriever.py` 在每次请求读取的 Neo4j 实时快照上执行多起点 BFS，支持 1～3 跳（默认 2）、入边/出边/双向邻域（默认双向）。保留边的原始方向，去重并限制返回最多 100 条边（可设 1～300）；截断通过 truncated 明确报告。当前为小规模图谱内存遍历，不是直接在 Neo4j 执行变长路径查询。

默认只选 PROMOTES、CAUSES、INCREASES_RISK、AFFECTS、INHIBITS、REDUCES_RISK、INTERVENTION_FOR。include_context=true 时额外允许 HAS_PROCESS、HAS_SYMPTOM、CONTROLLED_BY、OCCURS_AT_STAGE，以连接病害与发生状态；这些仍标记为原关系，不当作因果边。仅返回带已读取来源和原文定位的关系，保留适用条件、证据等级、地区、阶段、审核状态与有效日期。

`POST /api/graphrag/retrieve` 示例：

```json
{"entity_ids":["v2:435c70a2381d781d"],"max_hops":3,"direction":"both","include_context":true,"filters":{}}
```

filters 支持 region、crop、stage、as_of、scope；地区含上级适用范围，阶段严格匹配。默认研究浏览可包含境外待迁移证据，**不表示已适用于泊头**；明确地区后不满足范围的边会排除。返回 nodes、edges、triples、sources；triples 用名称展示，edges 保留端点 ID 和证据详情。无路径时返回空数组，不补造关系。

抽取接口已串联“抽取 → 对齐 → 2 跳检索”，从已对齐的地区、作物、阶段生成约束；任何未匹配或歧义输入会阻止自动检索，避免静默放宽条件。右侧实体解析面板可查看子图结果。尚未加入向量融合或生成式证据回答。实测记录：`data/botou_yali/evaluation/graph_retrieval_smoke.json`；测试：`python scripts/test_graph_retriever.py`。

## 第六阶段：实体对齐（已接入）

`entity_aligner.py` 将抽取后的原始词映射到实时 Neo4j 图谱的节点 ID。使用节点 name、aliases 和 `data/botou_yali/evidence/metadata/entity_aliases.json` 的显式查询别名；别名文件只维护用词映射，不包含替代数据库的节点。当前图谱标准名称是“梨黑星病”，因此“黑星病 / 梨树黑星病 / 鸭梨黑星 / 黑星”均指向现有节点，不改动其名称或证据。

匹配经过 Unicode NFKC、空白和大小写归一化，并限制实体类型。仅一个候选返回 matched；多个候选返回 ambiguous；没有候选返回 unmatched。后两者不输出可供检索的节点 ID，也不通过相似度强行匹配。缺少地区、阶段实体时明确保留未匹配结果。实体对齐不意味着地区证据适用，后续图谱检索仍需检查每条关系的时空范围。

`POST /api/graphrag/extract` 现在执行“DeepSeek 抽取 → 实时图谱对齐”，响应保留 entities 原词，新增 canonical_entities、alignments、entity_ids、requires_clarification。

`POST /api/graphrag/align` 接收与 Entities 相同的六字段结构，无需调用 DeepSeek 即可测试对齐。前端右侧选择“DeepSeek 实体解析与对齐”，展示原始实体、标准实体和匹配明细。测试：`python -m unittest discover -s scripts -p "test_entity*.py"`。

`entity_extractor.py` 调用 DeepSeek JSON Output，Pydantic 严格检查字段、枚举与类型，并核对实体是否出现在原始问题中。缺失标量为 null、列表为 []。地域不自动补成河北，输入“泊头鸭梨”时允许提取其中的“泊头”。输出仅表示查询实体，不代表诊断或已通过知识图谱验证。

`pipeline.py` 提供当前实体解析入口。此阶段尚未实现完整的图谱与向量融合、重排和证据回答；后续分别加入 graph_retriever.py、vector_retriever.py、reranker.py、fusion.py、prompt_builder.py，现有普通向量基线保持独立。

配置从环境变量优先读取，其次读取被 Git 忽略的 `ai-service/.env.local`：`DEEPSEEK_API_KEY`，可选 `DEEPSEEK_MODEL`（默认 deepseek-chat）。密钥不返回前端。只发送用户提交的问题，不上传文档库。请求超时 45 秒，失败不会伪装成成功抽取。

在 ai-service 运行：

```powershell
.venv/Scripts/python.exe scripts/extract_entities.py "泊头鸭梨果实膨大期持续高湿会有什么风险？"
.venv/Scripts/python.exe scripts/test_entity_extractor.py
```

HTTP：`POST /api/graphrag/extract`，请求体 `{"question":"问题"}`，响应包含 entities、method、notice。图谱网页右侧问答区域选择“DeepSeek 实体解析”后提交即可查看；其他模式保留原图谱证据查询。

官方协议参考：https://api-docs.deepseek.com/guides/json_mode/ 。JSON 模式不保证语义正确，因此增加了本地验证；对同义词标准化、否定范围、多作物歧义仍需后续实体对齐与人工评测。
