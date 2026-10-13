# 枣视觉排查知识与回答修复

日期：2026-10-10

## 根因

1. 黄化在 pipeline 中无条件覆盖成固定拒答，检索即使补齐也无法展示。
2. 炭疽、rotten 默认查询是“是否确诊/可食用”，命中模型卡边界分支，丢掉实际风险问答目的。
3. 原视觉节点仅是标签词表，没有鉴别排查边；原 16 块证据缺少叶片症状覆盖。

## 已完成

原图谱增量扩充为 122 节点、86 边，语料及 FAISS 索引扩充至 24 块/向量。保留原农业事实，新建 8 条排查规则、9 条 `PROMPTS_DIFFERENTIAL_CHECK` 边。这些是审核过的鉴别检索规则，不是“黄化导致某疾病”的因果事实。

新增资料：

- JV001 湖南省林业局《果树花叶病与黄叶病》：一般果树黄化/斑驳辨别，不是枣专属试验。
- JV002 北京市园林绿化局枣疯病资料：黄化、卷曲、异常丛枝的伴随特征。
- JV003 北京市园林绿化局《枣病虫害防治》：锈病叶背表现、炭疽为害器官、尺蠖和粘虫观察特征。
- JV004 加州大学 IPM《Powdery Mildew on Ornamentals》：白粉状物观察线索；观赏植物跨作物迁移，非金丝小枣病原证明。

所有 HTML 原件、提取文本、URL、SHA256 保存在 `data/cangzhou_jinsixiaozao/evidence/raw/JV00*` 和 `evidence/visual_sources.json`。原文摘录逐字验证，并保存文本字符偏移定位。只抽取症状，不导入旧药剂配方。地区保持湖南、北京、美国加利福尼亚；等级 L4/transfer_pending，仅经 `symptom_comparison_only` 审核后允许用于匹配类别的候选解释，禁止当作本地生产建议。

`knowledge_graph/visual_differential_rules.json` 保存具体核验问题和适用边界；`jujube/visual_knowledge.py` 可重复执行增量更新，`jujube.validate` 校验来源哈希、原文、地域、阶段等约束；原 validator 未放宽。

## 回答与页面

黄化保持 insufficient_evidence（现场病因未确定），但可以真实检索、生成有引用的候选研判。去除固定答案覆盖。炭疽/rotten 改成候选排查查询，明确询问可食用性时仍保留原边界规则。

原网址新增“先排查这几个方向”和最多三个核验问题；填写后通过现有 notes 字段继续分析。用户未填的信息不补造。结构化方向来自审核规则和实际检索命中的证据，LLM 不可用时也能显示，并明确非现场诊断。没有根据分数伪造风险级别。

## 验证

真实模型 + BGE/FAISS + DeepSeek + 原 citation/grounding：

| 案例 | 图谱路径 | 引用 | grounding |
|---|---:|---:|---|
| yellow_leaf | 4 | 4 | 通过；status 仍 insufficient_evidence |
| anthracnose | 2 | 2 | 通过 |
| bruised | 1 | 1 | 通过 |
| rotten | 0 | 4 | 通过；仅已有采后标准适用范围说明 |
| fresh | 0 | 4 | 此次生成缺字段引用被拒绝，正常降级为检索原文 |

没有把失败改成成功；没有为健康/新鲜图片强造病害路径。rotten/fresh 的“鲜果储藏病因”证据仍不足，现有干枣标准不能替代鲜果试验，本轮没有宣称所有类别的病因知识已补齐。

白粉类和虫害类：实际 BGE 检索及来源/路径回归测试通过；本轮没有声称它们单独做了真实图片 + DeepSeek 全链路验收。

真实响应：`jujube_diagnosis/tests/results/unified/`。新增 `jujube/test_visual_coverage.py`；后端共 113 项测试和 8 项 subtests 通过（包含所选梨/小麦回归）。前端 22 项测试通过，3 项 opt-in 真实浏览器测试在本轮普通测试中跳过；真实后端验收另行执行。前端 production build、枣模块局部 vue-tsc 检查通过。

随后新增黄化真实浏览器用例并单独执行：1/1 通过（真实图片、原 5175 页面、8093 后端、DeepSeek）。验证 insufficient_evidence 下仍展示排查卡片和非空路径；截图与返回保存在 `vision-frontend/tests/artifacts/jujube/yellow_leaf.png`、`yellow_leaf.json`。已重启旧枣后端加载最新代码，原前端服务保持运行。

## 代码文件

新增：jujube/fetch_visual_sources.py、jujube/visual_knowledge.py、jujube/test_visual_coverage.py。

修改：jujube/service.py、jujube_diagnosis/pipeline.py；vision-frontend/src/views/JujubeDiagnosisPage.vue、tests/jujube.spec.js。

数据更新：增量图谱、ontology、审核语料、FAISS 和 metadata；新增原文及排查规则。未训练/修改任何视觉权重，没有修改梨、小麦业务代码。

这次改变的是“资料如何支持下一步排查”，不是让模型凭空报病名。正式演示建议展示同一黄化图片：模型线索→四条原文支持的核验方向→三项补充观察→后续分析，同时展示本地适用性限制。
