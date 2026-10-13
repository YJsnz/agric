# 面向沧州农业的证据约束 GraphRAG 融合检索算法

版本：V0.1 实验实现；日期：2026-09-19。适用项目：盐田丰语。本文描述已实现代码，不声明已验证的性能提升。

## 1. 设计目标与研究依据

用户建议将语义、图谱、地区、阶段、证据五种分数加权求和。其困难是余弦值、路径长度、地区匹配和证据等级没有统一量纲；不相关但等级高的标准也可能被推到前列。

本实现先排除明确不适用候选，再使用加权 Reciprocal Rank Fusion（RRF）融合语义与图谱两个相关性排名，最后进行有限幅度的元数据调整。RRF 依据排名而非各检索器原始分数融合，原论文使用 k=60；这里仅将其作为可调初始值，不认为适合农业语料的最佳参数。[1]

Microsoft GraphRAG 研究通过实体图、社区摘要处理面向全语料的全局问题。本项目借鉴图结构组织检索的思想，但实现的是有范围约束的局部证据检索，不复现其社区摘要算法，也不沿用其论文性能结论。[2]

项目贡献定位：农业适用范围约束、可追溯的图谱—文档桥接、缺失证据显式降级，以及可解释的融合排序工程原型。是否构成算法研究创新，应由后续对照与消融实验验证。

## 2. 输入、输出与数据流

输入：问题 question、对齐后的真实实体 ID、可选 crop/region/stage 上下文、research 或 strict 模式。自动实体抽取仍可使用前阶段 DeepSeek；本阶段 CLI/API 接受实体 ID，便于固定抽取结果开展检索实验。

数据流：BGE/FAISS 召回 Top20 原始块；Neo4j 实时快照上做最多 3 跳检索；将图谱关系通过来源映射和章节定位关联到文档块；合并候选；适用性检查；排名融合；元数据有限调整；同来源限额；返回完整块与评分依据。

输出包含：chunk、semantic_rank、semantic_cosine、graph_rank、graph_score、edge_ids、features、warnings、rrf_score、metadata_score、score。另返回 excluded、graph_channel_active、effective_metadata_strength、config、corpus_sha256。分数均不是农学事实置信度或损耗概率。

## 3. 适用性过滤

作物采用显式继承：泊头鸭梨可参考泊头鸭梨、鸭梨、梨资料；其他作物不自动获得“梨”的继承资格。地区采用已有行政层级，泊头市允许泊头市、沧州市、河北省、全国。阶段要求明确标签精确匹配。

明确不兼容的作物、地区、阶段直接排除，不能靠其他高分补偿。缺失标签不等于适用全国：research 模式保留但记 unknown、该项得分为 0；strict 模式在用户指定该条件且候选缺少标签时排除。未指定条件的特征不参与元数据归一化。

图谱边继续按已有 valid_from/valid_to 过滤，但文档块缺少完整的标准有效期字段，因此尚未实现文档层面的历史有效性审计。论文实验地点字段也不能自动当成适用范围；目前使用已有 region 元数据，仅供研究候选排序，需人工复核。

## 4. 图谱分与证据桥接

来源映射文件为 data/botou_yali/graphrag_corpus_v1/fulltext/metadata/kg_source_mapping.json，目前仅 STD_002→6276、STD_003→6338、STD_004→5390 三组。只有来源 ID 相交，并且文档 section 开头的编号与边 locator 完全相等，才建立块—边关联。4.1 不匹配 4.10；无编号或范围定位暂不推断。该关联是章节级定位，不声称已完成句子级语义蕴含审核。

G(c)=max(1/hop(e))，e 为该块关联的已检索关系。取最大值而不累计，避免重复边或高连接度节点无端抬分。图谱分相同的候选使用相同竞争排名；没有可靠关联的块不参与图谱排名。

默认图谱关系为前阶段指定的影响、促进、风险、干预关系，并启用 HAS_PROCESS、HAS_SYMPTOM 等辅助关系；不将辅助边改写为因果边。边必须保留来源、locator 和原方向。hop 是多起点 BFS 邻域层数，不等价于可识别的因果效应。

## 5. 融合公式

设语义排名为 r_s，图谱排名为 r_g，缺失通道对该候选贡献为零。参数 w_s>0、w_g>=0、k>=0。

R(c)=[w_s×(k+1)/(k+r_s)+w_g×(k+1)/(k+r_g)]/[w_s+w_g]。

当全部候选都缺少图谱关联或 w_g=0 时，关闭图谱通道，分母仅使用 w_s，同时关闭元数据重排，保留语义顺序（仍执行过滤与来源限额）。这是防止缺证据时用来源等级替代相关性的降级策略。

元数据 Q(c) 为当前参与项的加权平均：地区匹配、本阶段匹配、证据等级。精确匹配 1，上级可兼容范围 0.7，未知 0。证据 A/B/C/D 初始映射 1/0.7/0.4/0.1，未知为 0。这些均是待验证的工程先验，不是概率，也不表示所有 A 类证据有相同因果强度。

最终 F(c)=R(c)×[1−μ+μ×Q(c)]，0<=μ<=1。元数据只能在有限范围内调整相关性分，不能创建一个纯元数据候选。每个来源默认最多返回两个块，减少同一文献重复占据 TopK；该限制可能降低召回，必须做消融。

初始配置：k=60、w_s=1、w_g=1、μ=0.15；地区/阶段/证据权重为 0.4/0.3/0.3；来源上限为 2。未经过验证集调优，不是最终推荐值。

## 6. 工程实现和运行

graphrag/fusion.py：候选过滤、来源桥接、排名融合与解释。
graphrag/vector_retriever.py：复用普通 Vector RAG，缓存模型实例；重建索引后应重启服务。
graphrag/reranker.py：解释性融合重排接口，不包含训练后的 CrossEncoder。
graphrag/pipeline.py：retrieve_agricultural 组织图谱和向量通道。
scripts/agricultural_search.py：终端运行，可用 --config 指定 FusionConfig JSON。
POST /api/graphrag/search：请求 question、entity_ids、filters、mode、top_k；返回检索证据，不生成农技答案。

在 ai-service 目录运行：
.venv/Scripts/python.exe scripts/agricultural_search.py "泊头鸭梨黑星病在什么条件下容易发生？" --entity-id v2:435c70a2381d781d --crop 泊头鸭梨 --region 泊头市 --output data/botou_yali/evaluation/fusion_smoke.json

当前仅 129 个候选文档块，图谱检索读取有界实时快照并在内存遍历；不是大规模数据库性能方案。语义通道 Top20 的截断可能漏召回候选，应作为可调实验变量。新增图谱匹配候选从全部已索引块中补入，不局限于语义 Top20。

## 7. 验证集调参与公平实验

至少覆盖事实、病害条件、生产到采后、多跳、地区冲突、阶段冲突、无证据问题。由人工对候选块标注 0/1/2/3 相关性，同时标记适用范围与原文支撑。按问题模板和资料来源分组，隔离开发、验证、测试集，避免近重复泄漏。

scripts/tune_fusion.py 读取独立人工 validation JSON，枚举 k∈{10,60}、w_g∈{0,0.5,1,2}、μ∈{0,0.05,0.15}，以平均 nDCG@5 选配置，同时报告 Recall@5、MRR@5。工具要求 split=validation、human_annotated=true，每个查询包含 semantic、chunks、subgraph、source_mapping、context 和 judgments（chunk_id→0～3等级）。候选快照须固定，所有返回候选需有标注。标志不是自动证明人工质量，仍须保存标注人及复核记录。

无相关文档的问题应独立评估拒答率、错误返回率；现有指标函数要求至少一个相关块，不把此类问题混入其平均值。当前没有合格的人工验证集，因此未运行权重优化、未报告准确率或宣称优于普通 RAG。

对比：原始 Vector RAG；Vector+相同过滤；双通道 RRF；RRF+元数据；完整方案。消融分别关闭图谱、元数据、来源限额。保持语料快照、BGE 模型、问题和候选预算一致；另外报告图谱桥接覆盖率、地域违规率、阶段违规率、空结果率与延迟。最终参数只在验证集选，测试集一次性评估。

## 8. 当前实测与局限

fusion_smoke.json 保存真实本地语料测试。黑星病示例尚无匹配本地文档章节的图谱边，graph_channel_active=false；系统回退语义排序，不补造桥接。此问题无法证明图谱增益，暴露的是来源映射覆盖不足。

代码测试验证：章节精确匹配、图谱候选提升、无图谱降级、范围冲突硬排除、严格模式未知阶段拒绝、非法参数校验。测试仅验证机制；合成测试不是农学实验。

目前无最终答案生成、无训练的学习排序器、无定量因果推断。优先扩充人工核验的来源及章节映射、修正元数据、建立独立评测集，再决定是否采用 CrossEncoder 或学习排序模型。

## 9. 参考资料

[1] Cormack, Clarke, Büttcher. Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods. SIGIR 2009, pp. 758–759. DOI: 10.1145/1571941.1572114. 作者全文：https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf 。已阅读公式与实验讨论；本文权重、过滤和降级规则为项目工程设计，不是原文结论。

[2] Edge et al. From Local to Global: A Graph RAG Approach to Query-Focused Summarization. 2024. https://www.microsoft.com/en-us/research/publication/from-local-to-global-a-graph-rag-approach-to-query-focused-summarization/ 。已阅读官方摘要；未将其全局社区摘要实验结果推广到本项目。
