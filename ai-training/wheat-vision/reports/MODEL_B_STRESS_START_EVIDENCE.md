# Model B：胁迫开始时间证据核验

## 结论

两季精确 anthesis date/DAS 均 unknown；两季首次花后亏缺灌溉 date/DAS 均 unknown。
找到 B 级同一实验的**相对时间规则**：处理从开花后的第一次灌溉开始，不能等同开花当天。仍没有 A/B 级证据支持精确开始日期。

cannot safely construct normal/water_stress image classifier from this dataset with the current metadata

## 本地检索范围

完整读取本地 README.pdf 全部 5 页，关键词包含 anthesis、flowering、irrigation、deficit、well-irrigated、field capacity、FC、50%、post-anthesis、watering、water、treatment、season、date、DAS、heading、Zadoks、GS60、GS65。所有命中上下文与完整原文见 model_b_stress_readme_contexts.txt。
对 agric 下 43 份 PDF 提取文字并检索目标 DOI/作者，只有此 README 匹配，未找到三篇目标实验论文的本地全文。相关本地文字/metadata 检索也未找到新增开始时间证据。此结果仅适用于已扫描项目，不声称检查了电脑其他磁盘。

## 证据来源与等级

- A：README p1、p2/p4 确定处理为花后亏缺灌溉、50% FC，1–15 为 control、16–30 为 deficit treatment，各有 r1/r2/r3。
- A：README p5 给出拍摄当天冠层阶段，不能直接证明首次亏缺灌溉已实施。
- B：[Wheat grain width: a clue for re-exploring visual indicators of grain weight](https://link.springer.com/article/10.1186/s13007-022-00891-1)，Methods > Field experiment。论文描述同一地点、两季、90小区、15混合处理，并引用主实验 DOI 10.1016/j.eja.2020.126188，因此可作为同一实验的公开方法证据。
- B：该论文说明两季播种月日为 11月20日、11月5日；结合明确的2014–15和2015–16季节记录，时间线以2014-11-20、2015-11-05计算，来源标为 external paper evidence。README p1 **也确实写出这两个月日**，不能说 README 未包含；这里以独立外部论文作主引用，而非伪造来源。
- B：该论文明确“from the first irrigation after anthesis”，但没有给首次灌溉的具体日期。10天灌溉间隔没有时间锚点，不能倒推事件。
- 差异：README使用50% field capacity，论文灌溉段使用50%蒸散需求；保留原说法，不擅自认定二者的量化定义完全相同。
- C：根据冠层阶段可以提出大致开花阶段窗口，但混合品种物候并不一致，不能给每个小区赋同一开花日期，也不能将窗口变成正式标签。
- D：凭照片外观、灌浆期、成熟期或10天间隔猜测开始日，禁止用于标签。

## 目标实验论文的获取核查

|资料|可核验内容|限制|
|---|---|---|
|10.1016/j.eja.2020.126188|出版者索引/摘要确认2014–15、2015–16及花后研究|ScienceDirect正文访问失败，未取得可核验方法全文或灌溉事件表|
|10.1016/j.compag.2020.105740|出版者索引摘要确认同一两季、90小区试验|ScienceDirect正文403；未取得开始日期|
|10.1016/j.compag.2018.11.020|出版者索引/摘要及README对应引用|ScienceDirect正文403；2017预印本10.1101/239798的PDF也403；不把摘要当作方法全文|
|10.1186/s13007-022-00891-1|开放出版者HTML的完整Methods已核验|相对开始规则明确，精确事件日期仍缺失|

上述访问状态为本次核查结果，不表示文献不存在，也不表示论文全文一定未记载日期。没有将搜索摘要当作精确时间证据。

## 两季时间结论

|season|anthesis date|anthesis DAS|stress start date|stress start DAS|精确日期证据|相对开始规则|
|---|---|---|---|---|---|---|
|1|unknown|unknown|unknown|unknown|无可用A/B|B：开花后的第一次灌溉|
|2|unknown|unknown|unknown|unknown|无可用A/B|B：开花后的第一次灌溉|

辅助开花阶段窗口：第一季在2015-04-25（155 DAS，孕穗）至2015-05-15（175 DAS，灌浆）之间；第二季在2016-04-27（174 DAS，孕穗至出穗）至2016-05-11（188 DAS，开花刚结束）之间。窗口推导为 C，仅表述冠层阶段转换，**不是每小区50%开花日或处理开始日**。第二季5月11日“anthesis just finished”只确认当天冠层描述，不表示开花刚结束后已经完成第一次亏缺灌溉。

## 播种日期与目录DAS核对

difference_days = folder_date − (外部论文播种日期 + 原目录DAS)。第一季7个日期全部 +1 天；第二季12个日期全部0。原目录DAS和日期均保留，不改1天差异。

|season|DAS|folder_date|calculated_date|difference_days|images|anthesis_status|stress date_status|
|---|---|---|---|---|---|---|---|
|1|104|2015-03-05|2015-03-04|1|90|confirmed_pre_anthesis|confirmed_pre_stress|
|1|155|2015-04-25|2015-04-24|1|90|confirmed_pre_anthesis|confirmed_pre_stress|
|1|175|2015-05-15|2015-05-14|1|90|clearly_post_anthesis|uncertain|
|1|189|2015-05-29|2015-05-28|1|56|clearly_post_anthesis|uncertain|
|1|192|2015-06-01|2015-05-31|1|90|clearly_post_anthesis|uncertain|
|1|197|2015-06-06|2015-06-05|1|90|uncertain|uncertain|
|1|205|2015-06-14|2015-06-13|1|90|clearly_post_anthesis|uncertain|
|2|47|2015-12-22|2015-12-22|0|90|confirmed_pre_anthesis|confirmed_pre_stress|
|2|93|2016-02-06|2016-02-06|0|90|confirmed_pre_anthesis|confirmed_pre_stress|
|2|174|2016-04-27|2016-04-27|0|90|confirmed_pre_anthesis|confirmed_pre_stress|
|2|188|2016-05-11|2016-05-11|0|90|clearly_post_anthesis|uncertain|
|2|191|2016-05-14|2016-05-14|0|90|clearly_post_anthesis|uncertain|
|2|194|2016-05-17|2016-05-17|0|90|clearly_post_anthesis|uncertain|
|2|197|2016-05-20|2016-05-20|0|90|clearly_post_anthesis|uncertain|
|2|200|2016-05-23|2016-05-23|0|90|clearly_post_anthesis|uncertain|
|2|208|2016-05-31|2016-05-31|0|90|clearly_post_anthesis|uncertain|
|2|211|2016-06-03|2016-06-03|0|90|clearly_post_anthesis|uncertain|
|2|214|2016-06-06|2016-06-06|0|90|clearly_post_anthesis|uncertain|
|2|228|2016-06-20|2016-06-20|0|90|clearly_post_anthesis|uncertain|

## 可安全报告的日期边界

confirmed_pre_stress：season1 2015-03-05 (104 DAS), season1 2015-04-25 (155 DAS), season2 2015-12-22 (47 DAS), season2 2016-02-06 (93 DAS), season2 2016-04-27 (174 DAS)

confirmed_post_stress：无。不能把 clearly_post_anthesis 代换为 confirmed_post_stress。

uncertain：season1 2015-05-15 (175 DAS), season1 2015-05-29 (189 DAS), season1 2015-06-01 (192 DAS), season1 2015-06-06 (197 DAS), season1 2015-06-14 (205 DAS), season2 2016-05-11 (188 DAS), season2 2016-05-14 (191 DAS), season2 2016-05-17 (194 DAS), season2 2016-05-20 (197 DAS), season2 2016-05-23 (200 DAS), season2 2016-05-31 (208 DAS), season2 2016-06-03 (211 DAS), season2 2016-06-06 (214 DAS), season2 2016-06-20 (228 DAS)

5个花前日期共有450张图；其中225张属于亏缺处理小区。其余14个日期共有1226张图，冠层描述进入花后，但精确水分处理状态仍不确定。本次所有 date_status 只用于证据审核，不回写 raw/clean manifest，不产生训练标签。

## 完整性与停止条件

已有 raw/clean/split manifest SHA256 前后相同；raw 下全部1677个文件（1676图像+README）相对上一完整性审计，修改/删除/新增数为 0。
没有训练，没有划分，没有创建训练目录，没有修改既有标签或准备脚本。下一步需要原实验两季**首次花后亏缺灌溉事件日期**和其对应DAS/计日定义，以及必要的品种/小区差异说明；在获得之前保持 blocked。
