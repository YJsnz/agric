# 金丝小枣果实采后核验补强

日期：2026-10-10。范围：金丝小枣果实碰伤、新鲜/腐败视觉服务及现有页面；未修改模型、训练数据或梨/小麦业务逻辑。

## 修复内容

原机械伤查询仅允许检索离体刺伤接种试验，鲜度查询又可能混入干枣标准。现在依据 task + visual class 检索经过原文核验的鲜枣采后资料，四种果实输出都关联核验步骤，而不是把分类结果建立成疾病因果事实。

新增 7 个证据块、7 个 PostharvestCheck 节点和 28 条 PROMPTS_POSTHARVEST_CHECK 关系。完整本地图谱为 129 节点、114 关系；审核语料及 BGE/FAISS 索引均为 31 块。原图谱验证器通过。

页面复用叶片的观察补充交互，增加“采后核验与处理”“满足条件后可以做”。各措施显示条件和真实 evidence id；用户回答回传现有诊断接口。无 LLM 时仍可展示原文支持的结构化核验内容，不伪称生成核查通过。

## 来源审核

- JF001：农业农村部农产品冷链物流标准化技术委员会《鲜枣贮藏保鲜操作规程》，https://scs.moa.gov.cn/ccll/jszn/202302/t20230203_6419772.htm 。用于鲜枣分选、轻拿轻放、堆码承重、采后时间及外观变化核验。属于技术指导，不冒充强制标准。
- JF002：中国农业大学新闻网转载《鲜枣家族各有特长》，https://news.cau.edu.cn/art/2019/10/12/art_8779_641338.html 。用于果皮、果柄、软化和成熟颜色变化观察；标明转载科普，非原创实验。
- JF003：国家邮政局《圆通给你送“小糖豆”了》，https://www.spb.gov.cn/gjyzj/c100196/202510/3fc167f538174e3094920dcbdd388e13.shtml 。是沧州冬枣物流案例，仅归档，没有转为金丝小枣病因或处理效果证据。

HTML、全文文本与 SHA256 位于 data/cangzhou_jinsixiaozao/evidence/raw 和 evidence/fruit_sources.json。每个新增块保留原始文本及字符位置；HTML 内联换行仅在查找时忽略，保存的引文未重写。

JF001/JF002 是全国鲜枣通用 L3 资料，不是沧州本地验证。所有鲜枣建议先确认鲜枣/干枣、品种、是否入库和设施条件；不输出药剂、剂量、温度阈值或储藏期限。原 citation validator 和 grounding 未放宽。不能据视觉结果判定可食用、食品安全或具体腐败病原。

## 验证

- 后端：`python -m pytest jujube jujube_diagnosis/tests -q`：54 passed。
- 新增四个 fruit task/class 的真实图谱检索回归测试：来源、原文追溯、条件、引用关联、LLM 故障保留核验内容、通用资料不得升级 L1；新增整体图谱验证。
- 页面：8 个 Playwright 模拟接口交互测试通过；局部 vue-tsc、Vite 构建通过。
- 重启 8093 服务后，原页面真实上传碰伤与新鲜图片的两个浏览器端到端测试均通过（36 秒）；页面与实际接口响应一致。
- `python -m jujube_diagnosis.tests.run_real_fruit_checks` 使用正式冻结模型、真实本地图谱、BGE/FAISS 和 DeepSeek，四种实测结果如下。网络受限的沙箱试跑先触发了降级；下表为网络可用后重新执行的正式结果。

| 真实预测 | 图谱路径 | 引用 | generation_called | grounding.passed | degraded |
| --- | ---: | ---: | --- | --- | --- |
| bruised | 7 | 7 | true | true | false |
| healthy | 7 | 7 | true | true | false |
| rotten | 7 | 7 | true | true | false |
| fresh | 7 | 7 | true | true | false |

完整响应与真实图片路径在 jujube_diagnosis/tests/results/fruit_checks/。grounding 是模型逐字段证据核查，不等于专家审定或形式化证明。

## 主要代码

jujube/fetch_fruit_sources.py、fruit_knowledge.py、service.py、compat.py、test_fruit_coverage.py；jujube_diagnosis/pipeline.py 及测试；vision-frontend/src/views/JujubeDiagnosisPage.vue、tests/jujube.spec.js。更新审核语料、规则、图谱、本体和向量索引。现有诊断服务显式使用本地审核图谱；本次不声称已同步 Neo4j 快照。
