# Zenodo 两季亏缺灌溉开始日期：进一步核验

核查日期：2026-10-03。仅开展资料核查，未修改 raw、manifest 标签、split 或训练代码。

## 结论

|生长季|首次花后亏缺灌溉日期|对应原数据DAS|结论|
|---|---|---|---|
|2014–15（season1）|unknown|unknown|尚无可核验精确日期|
|2015–16（season2）|unknown|unknown|尚无可核验精确日期|

这是“本次未确认”的结论，不声称原始论文或作者记录中一定没有日期。

## 本次新增核查

1. [Zenodo 官方记录](https://zenodo.org/records/10694706)以及官方 API `https://zenodo.org/api/records/10694706`：22个附件，即19个日期图像包、README.pdf、Field view.zip、Output of phenotyping models.zip。说明页描述花后亏缺灌溉与50% FC，没有两季具体开始日期，也没有单独列出的灌溉事件表。
2. 对官方 Output of phenotyping models.zip 使用HTTP Range读取完整ZIP中央目录，核验3111个目录条目，见 `model_b_zenodo_output_inventory.json`。文件名显示Canopy CCGR和Canopy GSM分析产物；这一步不是对全部PDF内容的全文检索，不能据此断言整个压缩包一定没有任何日期说明。
3. 进一步读取并校验CRC的四份汇总CSV：CCGR的155 DAS和192 DAS结果；GSM的season1 175 DAS与season2 188 DAS指数拟合表。CCGR字段为冠层覆盖、绿色指数、RGB均值/方差等；GSM字段为拟合系数、R²、RMSE等。这四份表没有首次亏缺灌溉或开花事件字段。实际表头保存于 `model_b_zenodo_output_headers.json`。没有用颜色指数或CSV数字推断处理日期。
4. [主实验论文](https://doi.org/10.1016/j.eja.2020.126188)：出版者正文/ResearchGate全文未能取得；检索到的作者Elsevier分享链接标注的有效期截止2020-12-21，本次也未能获取可核验全文。OpenAlex当前记录没有开放PDF地址；此索引结果不是“全文不存在”的证明。
5. [同一试验的开放论文](https://link.springer.com/article/10.1186/s13007-022-00891-1)，Methods → Field experiment：明确相对时间规则为“from the first irrigation after anthesis”。该规则说明首次亏缺灌溉与开花日是两个事件，但没有给两季首次灌溉的日历日期/DAS。原文同时描述10天灌溉间隔；没有首个事件锚点，仍不能倒推出开始日。

## 不能用于赋值的替代日期

- season1的2015-05-15（175 DAS）只记为拍摄时冠层灌浆，不等于当天开始亏缺灌溉。
- season2的2016-05-11（188 DAS）只记为拍摄时开花刚结束，不等于当天已经进行了第一次花后亏缺灌溉。
- 原目录日期/DAS保留不变；第一季DAS相对已核验播种日有1天差异，不能通过自行改DAS解决时间证据缺口。

## 能真正解除阻断的记录

需要原实验作者或方法全文/附表提供：2014–15和2015–16分别的首次花后亏缺灌溉日期、对应DAS及其计日定义；如果不同品种/小区分别启动，还需要小区级开始记录。明确开花阶段与灌溉事件之间的关系，才可将图像拍摄时间与处理状态对齐。

可向作者核对的准确问题（仅草稿，未发送）：

> For the 2014–15 and 2015–16 seasons in Zenodo dataset 10.5281/zenodo.10694706, what were the calendar dates and dataset-compatible DAS of the first post-anthesis deficit-irrigation events? Was the deficit treatment initiated on the same date for all deficit-irrigated plots, or separately by cultivar/plot? Please also clarify the one-day offset between the first-season folder DAS and the reported sowing date.

在获得上述记录前，`season1 stress start` 与 `season2 stress start` 继续为 `unknown`。
