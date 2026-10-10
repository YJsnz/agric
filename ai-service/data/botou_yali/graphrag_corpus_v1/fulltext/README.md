# 泊头鸭梨原始文档库

共 12 份来源记录，10 份已取得全文，2 份仍缺全文。7 份 PDF 合计 57 页，另有 3 篇网页正文。PAPER_002 的 PDF 可阅读，但文字编码损坏，需 OCR；其余 9 份可进入文本分块审核。

| ID | 标题 | 全文 | 文本处理 |
| --- | --- | --- | --- |
| STD_001 | DB13/T 1176-2018 地理标志产品 泊头鸭梨 | 未取得 | 仅摘要/目录 |
| STD_002 | DB13/T 6276-2026 梨产业链质量控制技术规程 | [打开原件](standards/STD_002/original.pdf) | 可分块，待内容审核 |
| STD_003 | DB13/T 6338-2026 盐碱地梨栽培技术规程 | [打开原件](standards/STD_003/original.pdf) | 可分块，待内容审核 |
| STD_004 | DB13/T 5390-2021 梨货架期品质维持技术规范 | [打开原件](standards/STD_004/original.pdf) | 可分块，待内容审核 |
| PAPER_001 | 不同O2浓度对鸭梨采后生理代谢及贮藏品质的影响 | [打开原件](papers/PAPER_001/original.pdf) | 可分块，待内容审核 |
| PAPER_002 | 自发气调对鸭梨果实生理生化品质的影响 | [打开原件](papers/PAPER_002/original.pdf) | 需 OCR |
| PAPER_003 | 降温方法对不同采收期鸭梨采后果心褐变和膜脂组分的影响 | [打开原件](papers/PAPER_003/original.pdf) | 可分块，待内容审核 |
| PAPER_004 | 不同采收期对鸭梨采后贮藏香气成分的影响 | 未取得 | 仅摘要/目录 |
| PAPER_005 | 窖藏和冷藏条件下鸭梨挥发性物质及其相关基因表达分析 | [打开原件](papers/PAPER_005/original.pdf) | 可分块，待内容审核 |
| GOV_001 | 鸭梨黑星病夏季如何防治（农业农村局公开科普） | [打开原件](government/GOV_001/browser.html) | 可分块，待内容审核 |
| UNI_001 | 梨树9大病害全方面分析：黑星病（河北农业大学相关教学站点） | [打开原件](university/UNI_001/http-original.html) | 可分块，待内容审核 |
| GOV_002 | 鸭梨的贮藏保鲜技术（政府林业科普资料） | [打开原件](government/GOV_002/browser.html) | 可分块，待内容审核 |

## 未完成获取的两份全文

- STD_001：DB13/T 1176-2018。已查询官方详情及备案记录，当前未找到公开的全文附件；不能以备案公告代替标准正文。
- PAPER_004：不同采收期对鸭梨采后贮藏香气成分的影响。期刊摘要已保存；PDF 链接在普通请求、带引用页请求及正常浏览器请求中均返回 HTTP 403。后续需取得可访问的作者/期刊全文或通过学校图书馆获取。

## metadata 使用约定

- 全库清单：`metadata/sources.jsonl`；每个来源目录同时保存独立 `metadata.json`。
- `source_id` 延用原资料包编号；`kg_source_ids` 对应已有 Neo4j Source ID，避免重复创建同一标准。
- `crop`、`region`、`applicable_stages` 是可筛选列表；未知地区保持空列表，原有说法保留在 `region_note`。
- 阶段是文档主题标签，不能替代每条知识的原文适用条件。
- `availability` 表示是否取得全文，`extraction_status` 表示文本可用性，`production_retrieval_approved` 当前均为 false。
- `evidence_level` 沿用用户清单的来源等级，保留分级依据；不是因果效应强度或概率。
- `artifacts` 记录文件路径、字节数及 SHA-256；`acquisition_attempts` 保留失败与成功记录。
- GOV_002 年份已按网页时间改为 2004；UNI_001 通过 HTTP 获取，机构归属仍需核验。
- 药剂信息、储藏参数和地域适用性仍须单独审核，不自动转成生产建议。

原始摘要与候选三元组保留在用户原资料包及 processed/imported_candidates，未导入 Neo4j。
