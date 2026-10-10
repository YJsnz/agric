# 泊头鸭梨 GraphRAG 现有资料核对清单

核对日期：2026-09-29。仅核对本地文件，不等于重新核验外网发布或完成农学审核。

现有12份来源记录、10份全文（含1份需OCR）、9份可用文本来源、139个候选块；向量索引登记129块。原始摘要包、全文库、正式图谱是不同层次。

本清单中的关系均为提取建议，未导入图谱；HAS_SYMPTOM/REQUIRES不是因果效应，AFFECTS/PROMOTES也不得升级成已验证CAUSES。

## 关键缺口

- STD_001、PAPER_004缺全文；PAPER_002需OCR。
- GOV_001、UNI_001已有叶片病斑正文，但region为空；UNI_001机构归属仍需核实。
- 河北标准已有，但病虫害章节引用NY/T 2157，应核对被引规范正文，不凭引用补内容。
- 来源登记标题含编辑性括注，原始网页标题须回看HTML；不能将括注视为机构背书。
- production_retrieval_approved=false与研究检索实际可运行是不同状态，不应混淆为已审核。

## GOV_001 — 鸭梨黑星病夏季如何防治（农业农村局公开科普）

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 政府农技网页；来源链接见 metadata.json |
| 标题 | 鸭梨黑星病夏季如何防治（农业农村局公开科普）（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：通用梨园经验，非泊头专属 |
| 作物 | 鸭梨 |
| 阶段 | 元数据未标注；按章节原文审核，不能推断用户当前阶段 |
| 风险、症状、条件、措施 | 黑星病；叶背病斑和黑霉、早落叶；原文描述夏季高温高湿和雨水传播；摘除病叶病果、排水、修剪通风。地区未确认本地适用。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 黑星病—HAS_SYMPTOM→叶背病斑；高温高湿—PROMOTES→发生；清园/通风—INTERVENTION_FOR→黑星病（均待审核） |
| GraphRAG | 已有 1 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_html_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/government/GOV_001/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/government/GOV_001/browser.html)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/GOV_001.chunks.jsonl)
- 可切主题：网页正文

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `GOV_001_C0001`；网页正文；页码：网页，无页码；字符偏移 0–485
> 梨黑星病又叫梨疮痂病，是梨树的主要病害。当前正值夏季，高温高湿有利于梨黑星病的发生。梨黑星病病原菌借雨水在梨园中扩散侵染，主要危害叶片、果实。叶片染病后，在叶背面产生圆形、椭圆形或不规则形病斑，病斑沿叶脉扩展，产生辐射状黑色霉状物，严重时整个叶背面布满黑霉，引起早期落叶。果实感病后，在果实表面产生一些大小不等的圆形病斑，病斑硬化后，表面粗糙，凹陷龟裂，呈疮痂状，病部伤口遇雨水极易被霉菌感染而腐烂。防治方法 1.农业防治。发现病叶、病果及……

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "GOV_001", "s": "高湿/降雨环境", "r": "PROMOTES", "o": "梨黑星病发生与传播", "status": "candidate"}

## GOV_002 — 鸭梨的贮藏保鲜技术（政府林业科普资料）

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 政府林业科普网页；来源链接见 metadata.json |
| 标题 | 鸭梨的贮藏保鲜技术（政府林业科普资料）（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：非河北地方标准 |
| 作物 | 鸭梨 |
| 阶段 | 采收期、储藏期 |
| 风险、症状、条件、措施 | 采后果心/果肉褐变；原文讨论温度、湿度、气体条件及分级预冷。提到河北产地不代表所有参数本地验证。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 储藏条件—AFFECTS→采后生理伤害；不用于叶片症状诊断 |
| GraphRAG | 已有 4 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_html_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/government/GOV_002/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/government/GOV_002/browser.html)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/GOV_002.chunks.jsonl)
- 可切主题：网页正文；二、贮藏保鲜条件；三、贮藏方法；四、贮藏中的主要问题及防止措施

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `GOV_002_C0002`；二、贮藏保鲜条件；页码：网页，无页码；字符偏移 0–288
> 1、温度。不同梨品种要求的贮藏温度有所差异，长期贮藏保鲜的温度大致在-1℃至2℃之间。鸭梨对温度比较敏感，采后需在10-12℃温度下预冷并缓慢降温至0-3℃贮藏，如果采后立即放在0℃条件下贮藏，则会发生生理伤害，导致果心、果肉褐变。2、湿度。影响梨在贮藏期间失水的环境因素主要是湿度，贮藏库的相对湿度应保持在90-95%；梨的失水也与自身因素有关，如果实气孔的多少和张度、蜡质层厚薄、果胶的多少等。3、气体成分。总的来说梨对二氧化碳比较敏感……

## PAPER_001 — 不同O2浓度对鸭梨采后生理代谢及贮藏品质的影响

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 期刊论文；来源链接见 metadata.json |
| 标题 | 不同O2浓度对鸭梨采后生理代谢及贮藏品质的影响（来源登记标题，网页括注不视为原题） |
| 地区 | 河北省、石家庄市；备注：河北（试材来自石家庄地区） |
| 作物 | 鸭梨 |
| 阶段 | 储藏期、货架期 |
| 风险、症状、条件、措施 | 采后虎皮病、黑心病；氧气处理与果实品质。试材来自河北石家庄，不是泊头田间叶部验证。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 氧气处理—AFFECTS→采后品质/生理病害（必须保留试验条件） |
| GraphRAG | 已有 29 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_001/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_001/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/PAPER_001.chunks.jsonl)
- 可切主题：0  引言；1.1  材料与处理；48 h 后开始阶段缓慢降温，每1 d 降0.5℃，直至环境；1.2.1  虎皮指数和黑心指数  参照杜艳民等[23]方法；1.2.2  果皮颜色  利用CR-400 色差计（MINOLTA，；1.2.3  内在品质指标测定  利用果实质构仪（GS-15，；1.2.4  呼吸速率和乙烯产生速率  果实呼吸速率和；1.2.5  总RNA 提取与cDNA 合成  根据柱式植物总；1.2.6  乙烯合成基因表达分析  通过检索梨基因组；1.3  数据处理与分析；2.1.1  虎皮指数  气调处理可显著降低贮藏和货架；2.1.2  黑心指数发生情况  气调处理可显著降低鸭；2.2  不同O2浓度处理对内在品质的影响；2.3  不同O2浓度处理对乙醇含量的影响；2.4  不同O2浓度处理对呼吸速率和乙烯的影响；2.5  不同O2 浓度处理对乙烯生物合成关键基因相对；3.1  环境O2浓度与虎皮病和黑心病发生的关系；3.2  环境O2浓度与内在品质变化的关系；3.3  环境O2浓度与乙烯生物合成的关系；4  结论

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `PAPER_001_C0001`；正文（未识别章节）；页码：[1]；字符偏移 0–863
> 中国农业科学  2020,53(23):4918-4928 Scientia Agricultura Sinica                                                   doi: 10.3864/j.issn.0578-1752.2020.23.016收稿日期：2020-03-30；接受日期：2020-06-09基金项目：国家现代梨产业技术体系（CARS-28）、国家自然科学基金（32001……

- `PAPER_001_C0026`；3.1  环境O2浓度与虎皮病和黑心病发生的关系；页码：[8, 9]；字符偏移 0–537
> 虎皮病是梨采后贮藏过程中一种主要的生理病害[26]。低氧处理可有效降低果实贮藏期间活性氧（ROS）的积累，降低乙烯释放量，有效降低α-法尼烯及其氧化产物共轭三烯醇的积累，进而抑制虎皮病的发生[27-28]。近年来，超低氧气调贮藏技术（O2＜1.0%）和动态气调贮藏技术（O2＜0.6%）快速发展，与传统气调贮藏相比，更低的贮藏环境O2 浓度能更好地控制苹果和梨采后虎皮病的发生[29-30]。本研究中，5.0%及以下O2处理显著降低了鸭梨长……

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "PAPER_001", "s": "储藏氧气浓度", "r": "AFFECTS", "o": "鸭梨采后生理病害", "status": "candidate"}
- {"source_id": "PAPER_001", "s": "储藏氧气浓度", "r": "AFFECTS", "o": "鸭梨贮藏品质", "status": "candidate"}

## PAPER_002 — 自发气调对鸭梨果实生理生化品质的影响

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 期刊论文；来源链接见 metadata.json |
| 标题 | 自发气调对鸭梨果实生理生化品质的影响（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：未在当前公开摘要中确认 |
| 作物 | 鸭梨 |
| 阶段 | 储藏期 |
| 风险、症状、条件、措施 | PDF字体编码损坏，需OCR；具体症状、条件、措施暂不从摘要确认。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 暂不提取正文关系，现有摘要三元组仍待复核 |
| GraphRAG | 已有 0 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / needs_ocr；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_002/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_002/original.pdf)
- Evidence：无可用正文块；不以摘要充当原文证据。

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "PAPER_002", "s": "自发气调处理", "r": "AFFECTS", "o": "鸭梨黑心病风险", "status": "candidate"}

## PAPER_003 — 降温方法对不同采收期鸭梨采后果心褐变和膜脂组分的影响

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 期刊论文；来源链接见 metadata.json |
| 标题 | 降温方法对不同采收期鸭梨采后果心褐变和膜脂组分的影响（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：未在当前摘要中确认 |
| 作物 | 鸭梨 |
| 阶段 | 采收期、储藏期 |
| 风险、症状、条件、措施 | 采收期、降温方式与采后果心褐变；地区元数据未知。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 降温方式—AFFECTS→果心褐变（试验关系，不自动转为本地建议） |
| GraphRAG | 已有 21 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_003/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_003/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/PAPER_003.chunks.jsonl)
- 可切主题：10 min，加入酶液100 μL，立即记时，在234 nm 处测定；30 mL 研磨，再用此溶液30 mL 洗研钵，转入100 mL 烧；0.25 μm，美国Agilent 公司），采用程序升温方式，柱初

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `PAPER_003_C0001`；正文（未识别章节）；页码：[1]；字符偏移 0–786
> 第26 卷第8 期农业工程学报Vol.26 No.8 2010 年8 月Transactions of the CSAE Aug. 2010降温方法对不同采收期鸭梨采后果心褐变和膜脂组分的影响闫师杰1，梁丽雅1，陈计峦2，李晓丹1，胡小松3※（1．天津农学院食品科学系，天津300384；2．新疆石河子大学食品学院，石河子832003；3．中国农业大学食品科学与营养工程学院，北京100083）摘要：为了探讨缓慢降温抑制采后鸭梨果实褐变的机……

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "PAPER_003", "s": "降温方式", "r": "AFFECTS", "o": "鸭梨果心褐变", "status": "candidate"}
- {"source_id": "PAPER_003", "s": "采收期", "r": "MODIFIES_EFFECT_OF", "o": "降温方式", "status": "candidate"}

## PAPER_004 — 不同采收期对鸭梨采后贮藏香气成分的影响

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 期刊论文；来源链接见 metadata.json |
| 标题 | 不同采收期对鸭梨采后贮藏香气成分的影响（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：未在当前摘要中确认 |
| 作物 | 鸭梨 |
| 阶段 | 采收期、储藏期 |
| 风险、症状、条件、措施 | 仅摘要，缺全文；不能凭标题补出条件或措施。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 暂不提取正文关系 |
| GraphRAG | 已有 0 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | summary_only / no_fulltext；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_004/metadata.json)
- Evidence：无可用正文块；不以摘要充当原文证据。

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "PAPER_004", "s": "采收期", "r": "AFFECTS", "o": "鸭梨贮藏香气品质", "status": "candidate"}

## PAPER_005 — 窖藏和冷藏条件下鸭梨挥发性物质及其相关基因表达分析

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 期刊论文；来源链接见 metadata.json |
| 标题 | 窖藏和冷藏条件下鸭梨挥发性物质及其相关基因表达分析（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：河北研究机构参与 |
| 作物 | 鸭梨 |
| 阶段 | 储藏期 |
| 风险、症状、条件、措施 | 窖藏/冷藏与香气、品质变化；河北机构参与不等于泊头试验。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 贮藏方式—AFFECTS→香气/果实品质（试验关系） |
| GraphRAG | 已有 41 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_005/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/papers/PAPER_005/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/PAPER_005.chunks.jsonl)
- 可切主题：0  引言；1.1  试验材料；1.2.1  硬度、可溶性固形物及可滴定酸含量测定  采；1.2.2  呼吸速率和乙烯释放速率测定  将果实置于；1.2.3  电子鼻检测  将果实置于密闭容器中，密封2；1.2.4  挥发性物质含量测定  准确称取果皮和果肉；65 μm）吸附30 min，采用TQ-8040 型气相色谱-质谱；1.2.5  RNA 提取与定量分析  采用改良CTAB 法[21]；1.3  统计分析；2.1  果实品质变化；2.2  呼吸速率和乙烯释放速率变化；2.3   电子鼻检测结果；3 个月时，交叉叠加分布，然后窖藏1 个月、3 个月、；2.4  挥发性物质组分变化；2.5  乙烯合成及其信号转导相关基因的表达；2.6  香气物质合成相关基因的表达；2.7  基因表达量之间的相关性分析；3  讨论；4  结论

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `PAPER_005_C0002`；正文（未识别章节）；页码：[1]；字符偏移 920–1478
> 【结果】冷藏期间，鸭梨果实硬度变化较小，SSC 上升，TA 含量下降。窖藏时，果实硬度下降比较明显，但对SSC 的影响较小，而TA 含量增加。与冷藏相比，窖藏下果实呼吸速率较高，乙烯释放高峰提前1 个月出现，且其峰值较高。电子鼻可有效区分两种贮藏方式下的挥发性物质，其中W1W、W5S、W2W、W1S 这4 种传感器对挥发性物质区分起主要作用；窖藏期间果实挥发性物质较多。鸭梨果皮和果肉的挥发性物质包含醛类、酯类、醇类、萜类、烷烃类等，且果……

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "PAPER_005", "s": "贮藏方式", "r": "AFFECTS", "o": "鸭梨生理代谢与挥发性物质", "status": "candidate"}

## STD_001 — DB13/T 1176-2018 地理标志产品 泊头鸭梨

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 地方标准；来源链接见 metadata.json |
| 标题 | DB13/T 1176-2018 地理标志产品 泊头鸭梨（来源登记标题，网页括注不视为原题） |
| 地区 | 河北省、沧州市、泊头市；备注：河北省/沧州市/泊头市 |
| 作物 | 泊头鸭梨 |
| 阶段 | 元数据未标注；按章节原文审核，不能推断用户当前阶段 |
| 风险、症状、条件、措施 | 未取得全文，不能提取具体风险、症状或措施。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 无正文，不建立农业因果边 |
| GraphRAG | 已有 0 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | summary_only / no_fulltext；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_001/metadata.json)
- Evidence：无可用正文块；不以摘要充当原文证据。

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "STD_001", "s": "泊头鸭梨", "r": "HAS_REGION", "o": "泊头", "status": "candidate"}

## STD_002 — DB13/T 6276-2026 梨产业链质量控制技术规程

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 河北地方标准；来源链接见 metadata.json |
| 标题 | DB13/T 6276-2026 梨产业链质量控制技术规程（来源登记标题，网页括注不视为原题） |
| 地区 | 河北省；备注：河北省 |
| 作物 | 梨 |
| 阶段 | 元数据未标注；按章节原文审核，不能推断用户当前阶段 |
| 风险、症状、条件、措施 | 产业链管理；第10章为病虫害综合防治。不能由管理规范推导叶片病害确诊。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 管理措施—REQUIRES→规范要求（规范关系，不是因果） |
| GraphRAG | 已有 14 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_002/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_002/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/STD_002.chunks.jsonl)
- 可切主题：1 范围；3 术语和定义；4 园地选择与规划；5 砧木与品种选择；6 建园；7 整型修剪；8 土肥水管理；9 花果管理；10 病虫害综合防治；11 采收；12 商品化处理；13 运输管理

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `STD_002_C0002`；1 范围；页码：[5]；字符偏移 0–86
> 本文件规定了梨产业链质量控制的园地选择与规划、砧木与品种选择、建园、土肥水管理、花果管理、病虫害综合防治、采收、商品化处理与运输管理等内容。本文件适用于梨产业链的质量控制。

- `STD_002_C0011`；10 病虫害综合防治；页码：[6]；字符偏移 0–17
> 按照NY/T 2157的规定执行。

## STD_003 — DB13/T 6338-2026 盐碱地梨栽培技术规程

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 河北地方标准；来源链接见 metadata.json |
| 标题 | DB13/T 6338-2026 盐碱地梨栽培技术规程（来源登记标题，网页括注不视为原题） |
| 地区 | 河北省；备注：河北省 |
| 作物 | 梨 |
| 阶段 | 元数据未标注；按章节原文审核，不能推断用户当前阶段 |
| 风险、症状、条件、措施 | 盐碱地梨栽培；第10章仅引用NY/T 2157，没有展开黑星病诊断规则。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 盐碱地栽培—REQUIRES→防控规范（规范关系） |
| GraphRAG | 已有 19 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_003/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_003/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/STD_003.chunks.jsonl)
- 可切主题：1 范围；3 术语和定义；4 建园；5 品种和砧木选择；6 栽植；7 土肥水管理；7.1.1 深翻改土；7.1.2 行间生草；7.1.3 果园覆盖；7.2.1 施肥原则；7.2.2 基肥；7.2.3 追肥；8 整形修剪；9 花果管理；10 病虫害综合防控；11 果实采收及采后处理；12 生产记录

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `STD_003_C0017`；10 病虫害综合防控；页码：[7]；字符偏移 0–16
> 按NY/T 2157的规定执行。

## STD_004 — DB13/T 5390-2021 梨货架期品质维持技术规范

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 河北地方标准；来源链接见 metadata.json |
| 标题 | DB13/T 5390-2021 梨货架期品质维持技术规范（来源登记标题，网页括注不视为原题） |
| 地区 | 河北省；备注：河北省 |
| 作物 | 梨 |
| 阶段 | 储藏期、出库期、运输期、货架期 |
| 风险、症状、条件、措施 | 采后流通和销售品质维持；不能用于叶片黑斑诊断。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 采后措施—REQUIRES→货架条件；非叶部病害关系 |
| GraphRAG | 已有 7 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_pdf_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_004/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/standards/STD_004/original.pdf)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/STD_004.chunks.jsonl)
- 可切主题：前  言；1 范围；3 术语和定义；4 货架前技术要求；5 货架期技术要求

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `STD_004_C0003`；1 范围；页码：[5]；字符偏移 0–54
> 本文件规定了梨货架期品质维持技术规范的术语和定义、货架前和货架期技术要求。本文件适用于梨果实采后流通和销售。

- `STD_004_C0006`；4 货架前技术要求；页码：[5, 6]；字符偏移 0–530
> 4.1 质量应符合GB/T 10650 规定要求。4.2 保鲜剂宜用1-甲基环丙烯（1-MCP）。4.3 采后48  h 内在密闭空间进行1-MCP 熏蒸，白梨、砂梨、新疆梨处理浓度为0.5 μ L/L～1.0 μ l/L，西洋梨和秋子梨处理浓度0.2 μ L/L～0.5μ L/L，处理时间12 h～24 h。4.4 外包装宜用木箱、瓦楞纸箱、塑料箱等，箱体坚固耐用，无异味，内侧无尖突物。内包装宜采用保鲜纸+网套+箱内垫衬+二氧化碳高通……

## UNI_001 — 梨树9大病害全方面分析：黑星病（河北农业大学相关教学站点）

| 字段 | 已有内容/核对结果 |
|---|---|
| 来源 | 教学类网页，机构归属待核验；来源链接见 metadata.json |
| 标题 | 梨树9大病害全方面分析：黑星病（河北农业大学相关教学站点）（来源登记标题，网页括注不视为原题） |
| 地区 | 未知，保持空值；备注：河北 |
| 作物 | 梨 |
| 阶段 | 元数据未标注；按章节原文审核，不能推断用户当前阶段 |
| 风险、症状、条件、措施 | 含黑星病、轮纹病、黑斑病等；不可把全部症状和防控措施合并为黑星病。黑星病段有叶背病斑、霉层、落叶和冬季清园/花前花后防控。具体支持范围见下方Evidence；未出现的内容保持未知。 |
| 图谱关系 | 按病害小节分别提取HAS_SYMPTOM、INTERVENTION_FOR；机构与地区适用性先核实 |
| GraphRAG | 已有 3 个候选块；按下方章节拆分，症状/发生条件/措施应分块或加子节标记 |
| 状态 | fulltext_html_available / text_available_review_pending；production_retrieval_approved=False |

- 元数据：[metadata.json](../data/botou_yali/graphrag_corpus_v1/fulltext/university/UNI_001/metadata.json)
- 原件：[打开](../data/botou_yali/graphrag_corpus_v1/fulltext/university/UNI_001/http-original.html)
- 知识块：[全文块及定位](../data/botou_yali/graphrag_corpus_v1/processed/chunks/UNI_001.chunks.jsonl)
- 可切主题：网页正文

Evidence摘录（解析文本，PDF页码为物理页；完整内容见上述知识块）：

- `UNI_001_C0001`；网页正文；页码：网页，无页码；字符偏移 0–822
> 01黑星病梨黑星病是一种检疫性病害，病原为子囊菌亚门黑星菌属的纳雪星菌，可危害梨树地上部大部分幼嫩组织，并以叶片、果实为主。叶片受害，先在叶背面的主脉两侧与支脉之间产生多角形或圆形的淡黄色病斑，没有明显的边缘，随后病斑会遍布整个叶片；在叶背面产生辐射状霉层，病情严重时造成大量落叶。幼果发病为畸形果，会形成不规则的淡黄色至褐色病斑，且病斑上会长出黑色的霉层；成长期果实发病不畸形，但病斑部会凹陷并产生星状龟裂。叶柄、果梗症状相似，出现黑色椭……

原摘要包已有候选三元组（未审核，不代表正式图谱关系）：
- {"source_id": "UNI_001", "s": "梨黑星病", "r": "HAS_SYMPTOM", "o": "果实病斑/凹陷/龟裂", "status": "candidate"}
