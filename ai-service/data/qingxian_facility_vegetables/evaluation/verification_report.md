# 青县设施蔬菜 V1 验证记录

新增主体位于 qingxian_diagnosis、data/qingxian_facility_vegetables；新增共享适配 graphrag/crop_runtime.py。现有入口修改 graph_web/api.py、graph_web/static/dashboard.js。未修改其他界面、非 ai-service 文件夹或其他作物知识数据。

原始下载包采用复制，下载目录保留。六份标准PDF和农技网页保留原文哈希，未经全文核验的资料不作为KG事实。

## 真实问答

|问题|图谱关系|向量块|DeepSeek|引用|Grounding|状态|
|---|---:|---:|---|---:|---|---|
|1|17|6|True|2|True|insufficient_evidence|
|2|17|6|True|2|True|insufficient_evidence|
|3|1|6|True|1|True|insufficient_evidence|
|4|6|6|True|1|True|insufficient_evidence|
|5|3|4|True|1|True|insufficient_evidence|

五次均为真实Neo4j、BGE向量、DeepSeek生成与核查，无mock。首次核查失败记录保留于real_qa_initial.json，未降低核查规则。

## 页面与回归

36项单元/回归测试通过；源文档哈希与图谱校验通过。浏览器实际切换青县蔬菜、鸭梨、旱碱麦、金丝小枣均展示图谱，无JavaScript错误；右侧问答实际POST成功、DeepSeek调用、引用与grounding通过。

## 当前限制

第一版重点黄瓜与番茄，不包含蔬菜视觉模型或实时传感器接入。一般候选研判保留insufficient_evidence，不代表本地确诊。部分来源缺全文，未纳入事实。第五问虽通过事实核查，对施肥前后清水原因的回答仍不充分；grounding通过仅证明发布事实被引用支持，不等于问答覆盖率或农技专家评审通过。

后续跨界面、视觉及传感器链路见 docs/青县设施蔬菜_视觉与传感器风险链路设计.docx。