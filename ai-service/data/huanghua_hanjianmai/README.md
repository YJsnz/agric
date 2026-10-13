# 黄骅旱碱麦 GraphRAG V1

2026-09-30 核验版。代码在 `ai-service/wheat/`，仅修改 ai-service 内文件。未训练视觉模型，未改鸭梨事实或向量库。

## 当前成果与缺口

- 12 份优先资料取得 10 份真实全文 PDF；W009、W010 尚需合法取得全文，不进入发布图谱/向量库。
- 85 个领域节点、70 条语义关系、37 个主题块、37 条 BGE 512 维真实向量。
- **未达到建议的 100～200 节点、150～300 关系规模。** 未将标题、摘要、研发方向伪装成实证因果来凑数。
- Neo4j 使用 `crop_id=huanghua_hanjianmai`、`dataset=wheat_reviewed_v1`，只更新自己的记录，不删除其他作物记录。
- `http://127.0.0.1:8090/` 选择黄骅旱碱麦即可查看；复用鸭梨图谱、筛选、详情、风险及来源展示。关系详情展示原文及 PDF 页码。
- `POST /api/wheat/ask`：JSON `{"question":"黄骅旱碱麦收获后，原粮质量主要应该关注哪些指标？"}`。

## 当前发布文件

```text
huanghua_hanjianmai/
├── evidence/
│   ├── raw/                       # 真实 *_fulltext.pdf / *.pages.json
│   ├── source_audit.json          # 下载URL、哈希、页数、失败记录
│   └── evidence_v1.jsonl          # 逐条原文、页码、范围、关系
├── ontology/ontology-v1.json
├── graph/graph-v1.json            # 当前审核图谱
├── graphrag_corpus_v1/reviewed_chunks.json
├── vector/
│   ├── reviewed.faiss
│   └── reviewed_metadata.json
├── evaluation/
│   ├── legacy_unverified/        # 旧图谱/证据/脚本备份
│   ├── reviewed_validation.json
│   ├── real_qa_reviewed.json      # 五问完整答案/引用/grounding
│   ├── real_api_reviewed.json     # 真实HTTP结果
│   ├── dashboard-test.json
│   └── dashboard-wheat.png
└── scripts/                      # 旧命令转发新审核流程
```

旧 `graph-wheat-v2.json`、空 embedding 索引描述、历史手写“核验记录”及旧评测仅作为历史材料，新页面/问答不读取。`verbatim_verified` 表示原文对照通过，不表示专家审定或地块适用性验证。

## 证据规则

未知地区、阶段、天气保持 null；2‰ 换算为 0.2%，不推断损失比例。图谱和向量均按作物、生产/原粮/面粉、阶段过滤，晚播资料要求晚播语境。相关证据内优先黄骅、沧州、河北、区域论文、其他权威资料；不升级地域标签。

论文研发方向保留 RESEARCH_TARGET；引用 GB 标准不补造正文。主题块保留单主题/阶段/地区，短条款不为达到200字而拼接。真实生成复用现有 citation validator 和逐字段 grounding，最多基于同一证据修正一次，仍失败则 validation_failed，不发布正文。

本版只作初步研判，保留 insufficient_evidence 和 local_conclusion.available=false。grounding 是模型辅助核查，不是形式化证明或专家审定。

## 最终真实五问

| 问题 | 图谱关系 | 向量块 | 引用 | DeepSeek | grounding | 状态 |
|---|---:|---:|---:|---|---|---|
| 2‰、播种墒情不足 | 8 | 8 | 7 | 已调用 | 通过 | insufficient_evidence |
| 晚播后春季促苗 | 4 | 8 | 8 | 已调用 | 通过 | insufficient_evidence |
| 灌浆高温干旱 | 6 | 4 | 4 | 已调用 | 通过 | insufficient_evidence |
| 宽幅沟播抗旱躲盐 | 3 | 8 | 5 | 已调用 | 通过 | insufficient_evidence |
| 收获后原粮指标 | 11 | 2 | 2 | 已调用 | 通过 | insufficient_evidence |

不同粒度数量不能直接相加。完整答案见 JSON。中间调试曾出现无引用建议被拒绝，以及2‰/0.3%比较错误；增加确定性单位校验及晚播过滤后重新运行。本次通过不保证未来生成必然通过，拒绝机制保留。

106 项现有 GraphRAG + 旱碱麦回归测试通过。浏览器测试覆盖作物切换、原文定位、风险面板、切回鸭梨无节点残留。

## 复现（ai-service 目录）

```powershell
# 重新下载只更新审核归档，不改KG
.\.venv\Scripts\python.exe -m wheat.audit_sources
.\.venv\Scripts\python.exe -m wheat.build
.\.venv\Scripts\python.exe -m wheat.validate
.\.venv\Scripts\python.exe -m wheat.vector
.\.venv\Scripts\python.exe -m wheat.repository
.\.venv\Scripts\python.exe -m unittest wheat.test_wheat
# 需要真实Neo4j、本地BGE、已配置DeepSeek；不打印密钥
.\.venv\Scripts\python.exe -m wheat.run_real
.\.venv\Scripts\python.exe -m wheat.run_real_api
node scripts/test_wheat_dashboard.mjs
```

build 按审核页段锚点抽取，原文变化会报错，不猜测。W009/W010 全文与关系规模扩充仍待后续取得资料和逐条审核。
