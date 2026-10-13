# 金丝小枣 V1 验收记录

真实调用 Neo4j、BGE/FAISS、DeepSeek 生成及原有引用/grounding 校验，无 mock。

|问题|图谱关系命中|向量块命中|生成|Grounding|引用|状态|
|---|---:|---:|---|---|---:|---|
|沧州金丝小枣成熟期遇到连续降雨，为什么容易出现浆烂和裂果？|12|6|True|True|7|insufficient_evidence|
|果实出现浆烂、腐烂时，KG有哪些病害和病原候选？|11|6|True|True|6|insufficient_evidence|
|春季萌芽和花果期常见哪些虫害？主要危害哪些部位？|9|2|True|True|2|insufficient_evidence|
|河北低平原地区使用微咸水灌溉时，要注意什么风险？|6|1|True|True|1|insufficient_evidence|
|采收后进入晾晒、烘干、贮藏时，主要有哪些采后风险？|13|4|True|True|4|insufficient_evidence|

原始返回：`evaluation/real_qa.json`。微咸水问题只能解释现有土壤墒情条款及证据缺口，没有输出未取得正文的矿化度阈值。

26 项金丝小枣/旱碱麦单元与回归测试通过。页面在金丝小枣→梨→旱碱麦→金丝小枣切换，无 JavaScript 异常，AI 输入启用。

尚未完成的资料任务：J002 等全文仍待取得，不能声称所有原始资料已完成审核。当前关系 76 条，未为凑数增加弱关系。