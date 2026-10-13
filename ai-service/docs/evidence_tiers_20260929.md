# 泊头鸭梨证据分级与真实测试记录（2026-09-29）

## 已落地的边界

原始 PDF、HTML、正文 chunk 和 graph-v2.json 均未修改。新增独立分级清单覆盖 12 份语料来源、32 个 KG 来源、139 个 chunk、315 条 KG 关系。

`data/botou_yali/evidence/metadata/evidence_scope_review.json` 保存用途审核；`evidence_tiers.jsonl` 为完整分级快照，含记录哈希、定位、原始条件及证据 ID。执行 `python scripts/build_evidence_tiers.py` 可重建快照。

分级是多维的：地域状态与 `postharvest_only`、`fulltext_required`、`text_extraction_required` 等限制分别保存。`authority_pending` 表示机构身份尚未核实。`verified` 仅指来源/适用范围核验，不代表病害确诊、因果验证或专家审核。

只有经过逐块用途审核、文本 SHA256 一致的资料，才能进入诊断解释分支。原来的当地生产建议准入不改变。`region=None` 不补造地区，仍保留澄清流程。显式阶段、作物与部位约束继续生效。

- `candidate_explanation`：通用症状、机理及候选解释，不能支持本地确诊或本地用药。
- `production_background`：河北生产范围或标准背景，不证明本地某病发生。
- `candidate_discovery`：异地关系保留原始 evidence_ids、conditions、locator、review_status；不进入本地结论证据。

图谱有两个明确分离的检索用途：原来的本地证据通道继续按地区过滤；另行发现的异地路径放在 `discovery_paths`，标记 `usable_for_local_conclusion=false`，不混入生成证据。不能把河北背景与通用病害知识拼接成“泊头已验证”。生成提示和 grounding 核查均包含此限制。

## 重点资料核验

| 资料 | 处理结果 | 仍存在的缺口 |
|---|---|---|
| GOV_001 | 已核实怀化市农业农村局政府页面，2017-01-17，农业科技报供稿；`general_authoritative`；正文原样保留 | 无河北/泊头当地病害验证；旧文药剂及剂量未核验当前登记，禁止作为当地用药建议 |
| UNI_001 | `authority_pending`，不进入诊断生成证据 | zwbch.com 页面自称高校机构，尚未找到高校官方域名的独立归属证明 |
| DB13/T 1176-2018 | 标准身份与泊头范围可核实；`fulltext_required` | 官方备案及现有详情接口未提供正文；标准图书馆无法访问，其他检索结果为摘要/受限预览，未取得可核验全文 |
| DB13/T 6276-2026 | 现有全文已按条款切块，范围和第10章作为背景用途审核 | 第10章仅要求按 NY/T 2157 执行，不能补写其技术条文 |
| DB13/T 6338-2026 | 同上，限定盐碱地栽培背景 | 第10章同样仅引用 NY/T 2157；不能推导当前叶斑病因 |
| 鸭梨贮藏论文、GOV_002、STD_004 | `postharvest_only`，叶片诊断排除 | PAPER_002 还需 OCR；PAPER_004 仅摘要 |

## 新取得的来源与用途

原件、下载 URL、文件 SHA256、逐份审核记录位于 `data/botou_yali/evidence/review_20260929/`。未直接导入 KG 或向量库，避免把科研/出口背景硬塞进叶片诊断。

1. 河北省农林科学院《梨抗黑星病机理及新种质创制的研究与应用》项目公示，PDF 原件已取得。第1页说明抗性育种研究，第2页说明实施单位与含泊头的示范范围。只支持科研及特定新品种推广背景，不可把香红梨、晚玉梨的结果迁移为鸭梨叶片诊断证据。
2. 商务部全球法规网《中国鸭梨输往美国的植物检疫工作计划》，HTML 原件已取得。Ⅰ.A、Ⅰ.B 为河北/山东指定区域出口鸭梨与关注病原清单。属于出口检疫背景，当前有效性仍需核验，不能证明本地叶片发病。
3. 全国标准信息公共服务平台《GB/T 28072-2011 梨黑斑病菌检疫鉴定方法》，官方元数据页已取得。河北出入境检验检疫局参与起草；全文尚未取得，标记 `fulltext_required`，不抽取检测步骤。

因此，“补齐3～5份直接适用河北叶片病害的全文资料”尚未完成，不能把以上三份都计作合格现场诊断证据。另查到 DB13/T 829-2006《梨黑星病综合防治技术规程》已列入河北废止目录，不采用为当前生产规程。

核验入口：
- GOV_001：https://www.huaihua.gov.cn/nyncj/c108787/201701/42df409e86984028bf763bd70bccab13.shtml
- STD_001 官方备案：https://dbba.sacinfo.org.cn/rnDetail/c86e930b07e8117a6e3aa19b417b7a52
- 科研公示：见 acquisition.json 中河北省农林科学院原始 PDF URL。
- 出口计划：https://policy.mofcom.gov.cn/pact/pactContent.shtml?id=951
- 检疫鉴定标准：https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D7E378D3A7E05397BE0A0AB82A
- 废止目录：https://scjg.hebei.gov.cn/uploads/1/file/public/202301/20230104171839_b1nmm0xh1y.pdf

## 真实端到端结果

未修改两个端到端测试脚本、YOLO模型、原始语料、图谱数据、前端。

运行：`.\.venv\Scripts\python.exe pear_diagnosis\tests\run_real_full_diagnosis_with_region.py`

- YOLO：spot，视觉分类置信度 0.999997615814209，不是疾病概率。
- Vision→KG：4个匹配症状、3条候选关系；规则排序仍为梨细菌性花枯病、梨黑星病、梨黑星病。
- 地区：用户提供“河北省沧州市泊头市”，对齐实际 KG 节点“泊头市”。
- 本地图谱证据：0；独立候选发现路径：31。未将其冒充当地已验证关系。
- 向量准入证据：1，GOV_001_C0001。没有采后论文进入最终证据。
- `generation_called=true`；真实 DeepSeek HTTP 响应3次（抽取、生成、核查）。
- 引用校验完成；`grounding_audit.passed=true`，为模型辅助核查而非形式化证明。
- 最终 `status=insufficient_evidence`：解释叶斑相关候选与通用资料，明确本地验证不足，要求补充叶背/叶面、病斑形态、生育期、气象等实际信息，不确诊。

完整返回：`data/botou_yali/evaluation/evidence_tiers_real_result.json`。
受限网络首次运行在 DeepSeek 连接处失败，其异常日志保留在 `evidence_tiers_real_run.txt`；允许联网重跑的完整输出为 `evidence_tiers_real_run_network.txt`。

回归：82项检索/分级测试 + 8项适配器测试通过。新增8项分级测试验证通用解释与本地建议分离、原文指纹变更撤销审核、缺失地区不补造、采后排除、未核实/摘要阻断、异地不升级、引用标准不补造和融合层再次检查。
