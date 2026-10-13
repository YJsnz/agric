# 沧州特色农产品多模态智能诊断 · V1

独立 Vue 3 / Vite / Axios 前端。顶部作物下拉框支持泊头鸭梨和黄骅旱碱麦，切换作物时取消旧请求并清空该轮图片与结果。复用现有后端业务、GraphRAG、图谱和模型。

小麦页面支持叶片、冠层、麦穗三类图片单独或联合上传，同源调用 `/api/wheat/diagnose`。Vite 将请求代理到 `http://127.0.0.1:8092`，可用 `WHEAT_API_TARGET` 指定目标。生产环境需配置同路径反向代理，或用 `VITE_WHEAT_API_BASE_URL` 指定允许跨域的后端；梨仍使用 `VITE_API_BASE_URL`（默认 8091）。留空的田间信息不发送、不从作物名推断。

浏览器回归测试：`npm test`。人工真实联调：`node tests/run-real-wheat.mjs`（需要本地测试图片及运行中的前后端，会调用真实 GraphRAG）。联调结果与截图保存到 `tests/artifacts/unified-wheat-real.*`。

## 小麦田间排查与复查

小麦后端返回 `decision_support`，每轮最多询问三个尚未填写的观察项。回答通过原诊断接口的 `leaf_position`、`field_distribution`、`recent_operations`、`progression` 字段进入下一轮 GraphRAG 结构化上下文，不充当引用证据。问题目前属于观察采集流程，不是经过专家审核的病因鉴别规则；不能用它生成药剂或灌溉处方。

地块记录保存在当前浏览器的 IndexedDB `wheat-field-review` 中，包含图片、录入上下文、操作备注与当轮返回结果。可按地块查看、与当前图片并排比较、导出包含图片的 JSON。清理网站数据或更换浏览器会导致记录不可访问；这不是服务器档案服务。页面不推断病情变化百分比。收割/储藏决策、审核后的条件化农艺规则和云端地块档案尚未实现。

## 启动

后端（ai-service目录，先确认Neo4j、现有模型/索引和DEEPSEEK_API_KEY可用，勿打印密钥）：

```powershell
.\.venv\Scripts\python.exe -m uvicorn pear_diagnosis.dev_server:app --host 127.0.0.1 --port 8091
```

注意：现有 dev_server.py 只定义ASGI应用，直接 `python pear_diagnosis/dev_server.py` 不会启动HTTP服务。

前端：

```powershell
cd F:\AIC2026\AIC-SmartAgriculture\agric\vision-frontend
npm install
npm run dev
```

访问 http://127.0.0.1:5175 。API地址统一配置在 `.env.development`；生产构建可通过环境变量 `VITE_API_BASE_URL` 指定。`npm run build` 输出dist。

## 目录与新增文件

```text
vision-frontend/
├─ src/
│  ├─ api/diagnosis.js
│  ├─ components/
│  │  ├─ ImageUploader.vue
│  │  ├─ VisionResultCard.vue
│  │  ├─ DiagnosisProgress.vue
│  │  ├─ ContextPanel.vue
│  │  ├─ CandidateRiskPanel.vue
│  │  ├─ KnowledgeGraphPanel.vue
│  │  ├─ EvidencePanel.vue
│  │  ├─ ReasoningPathPanel.vue
│  │  ├─ GroundingStatus.vue
│  │  └─ DiagnosisSummary.vue
│  ├─ views/DiagnosisPage.vue
│  ├─ App.vue
│  ├─ main.js
│  ├─ style.css
│  └─ layout.css
├─ tests/
│  ├─ diagnosis.spec.js
│  └─ real-interaction.mjs
├─ artifacts/
│  ├─ initial.png
│  ├─ needs-clarification.png
│  ├─ with-region.png
│  └─ real-api-results.json
├─ .env.development
├─ .gitignore
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
├─ playwright.config.js
└─ README.md
```

## 交互与证据边界

桌面两栏：左侧图片、地区补充与视觉结果；右侧综合研判，下面为候选风险、知识关系、证据来源。1440×900优先，允许滚动，窄屏折叠单栏。

首轮仅传file和organ=leaf。地区选择初始为空，用户主动选择/填写后，同一File发送第二轮。空字段不发送，数值0仍发送。当前API仅支持叶片，因此不引导上传果实或枝梢。重新选图会取消旧请求、清空旧结果和上下文，并释放预览URL。

过程动画明确为等待提示，不假装实时阶段回调或百分比。needs_clarification显示友好补充卡，不是请求错误。insufficient_evidence保留视觉、候选与已有引用。validation_failed显示“本次 AI 研判未通过证据完整性校验”、后端安全回答与真实grounding原因，不显示成500。兼容success/grounded/ok/answered，未知状态保留原值。

没有真实reasoning_paths时仅显示诊断数据链，不伪造因果关系。来源只使用API返回，安全链接仅允许HTTP(S)。引用为空明确提示，grounding为空显示“未执行”，false显示“未通过”。视觉置信度和规则排序分不作为疾病概率。

## 测试与真实联调

```powershell
# 可以使用已安装的Edge；或先 npx playwright install chromium
$env:PLAYWRIGHT_CHANNEL='msedge'
npm test
node tests/real-interaction.mjs
```

自动测试9组，覆盖：未选择图片、非法格式、图片上传、needs_clarification、主动补地区后二次请求、insufficient_evidence、validation_failed、success/grounded/ok/answered、网络中断、空引用、grounding未执行/未通过、多候选、换图清空和旧响应隔离。

**Mock仅存在于tests/diagnosis.spec.js的状态覆盖测试。生产src没有模拟诊断结果；real-interaction.mjs没有mock，真实浏览器直接请求后端。**

2026-09-29真实浏览器联调：

- 输入：按文件名排序的测试集首张spot图片 `006958c6c311f550e8b94288d38de2489a6d650d01edcd87f64c06e983c45ee7.jpg`。
- 第1轮：HTTP200 / needs_clarification，region=null，显示未预选地区的补充卡。
- 第2轮：主动选择河北省沧州市泊头市，HTTP200 / insufficient_evidence。
- 真实视觉：spot / 叶斑症状，confidence=0.999997615814209。
- generation_called=true，grounding.passed=true；引用E1 → GOV_001_C0001。
- 未改写真实业务状态，最终依然不支持本地确诊。
- 浏览器pageerror为空，实际跨域上传成功；沿用现有后端CORS，未修改后端。
- validation_failed在自动化状态测试中通过；本次最终真实请求并非该状态，不能宣称真实得到validation_failed。

完整返回和截图见artifacts。截图来自真实页面与真实API，不是设计稿。

## 当前限制

仅鸭梨叶片可用；其余作物禁用。阶段进度不是后端实时回调。补充地区会重新上传同一图片并重跑全链路，没有服务端会话复用。AI生成结果可能因证据完整性不同返回validation_failed；页面按原始状态显示，不降低验证规则。权威本地证据仍不足，不是前端能解决的问题。当前独立工作台未接登录、主项目前端或生产部署。
