# 黄骅旱碱麦前端接入验收

## 文件与复用审计

新增前端源码：

- `src/api/wheat.ts`：统一 multipart API、取消/超时、模型状态查询及图谱链接。
- `src/stores/wheatDiagnosis.ts`：本轮结果与预览的内存状态，不写入浏览器持久化存储。
- `src/components/workspace/DiagnosisImageInput.vue`：三个入口共享上传组件。
- `src/components/workspace/WheatDiagnosisResult.vue`：视觉页与风险详情共享结果、证据、限制和候选展示。
- `src/views/WheatDiagnosisView.vue`：两个路由共享的诊断/风险详情页。
- `tests/wheat-browser.mjs`、本报告及 `tests/artifacts/` 中的联调记录和截图。

修改已有前端：`src/router/index.ts`、`src/components/workspace/FarmContextDrawer.vue`、
`vite.config.ts`。另在现有知识图谱前端 `../ai-service/graph_web/static/dashboard.js`
增加仅在 `crop=wheat` 时启用的实体深链接，不涉及KG数据或后端规则。

梨界面实际位于独立的 `vision-frontend`。其 ImageUploader 的单图校验/更换交互可沿用，
但文字、数据契约和样式均写死梨，未跨两个Vue项目强行引用。此次上传组件据此做小型改造；
没有复制整套梨页面。可直接复用的是现有 frontend 的 FarmTopBar、FarmBusinessDock、
RouterLink、全局主题和登录守卫。小麦结果组件复用于视觉与风险路由。
未修改梨原有源码和行为；没有创建新Web项目、增加底部菜单或修改其他作物。

## 真实浏览器请求

入口：`/platform/crops/wheat/vision`。
风险详情：`/platform/crops/wheat/risk?crop=wheat`。
作物中心抽屉新增“黄骅旱碱麦 · AI视觉识别”链接。

联调启动了 frontend `http://127.0.0.1:5174/platform/` 与 ai-service `127.0.0.1:8092`；
避开原8090服务。通过Vite代理发出真实 `/api/wheat/diagnose` 请求，真实YOLO、Neo4j、
FAISS、DeepSeek运行，未替换诊断接口。**浏览器登录校验 `/api/auth/me` 使用测试夹具**，
因此这次不包含Java登录服务的端到端验证，也未绕过或修改生产登录守卫。

| 场景 | HTTP | 业务状态 | grounding | 引用数 |
|---|---:|---|---|---:|
| leaf-only | 200 | insufficient_evidence | grounded | 8 |
| canopy-only | 200 | insufficient_evidence | grounded | 8 |
| head-only | 200 | validation_failed | insufficient_evidence | 0 |
| 三图+context | 200 | insufficient_evidence | grounded | 4 |

麦穗单图未通过本轮生成核验，前端没有伪造结论，计数、检测框和已有证据仍显示。
生成结果可能随服务运行变化；表格对应保存的最后完整一轮，不承诺每次grounding都通过。
全部请求region未填写即未发送；没有从作物名推断黄骅。数值0可以发送，不当成空值。

真实返回：`artifacts/real-results.json`。
真实截图：`artifacts/real-leaf_only.png`、`real-canopy_only.png`、`real-head_only.png`、
`real-all_with_context.png`、`real-risk.png`。

## 逐项验收

1. 新增文件见以上清单。
2. 修改文件见以上清单。
3. 沿用梨上传校验和诊断交互；直接复用现有平台框架组件，小麦两页共享结果组件。
4. 未修改梨页面逻辑。
5. 视觉入口 `/platform/crops/wheat/vision`。
6. POST真实浏览器联调成功，四次均200。
7. leaf-only成功，未上传项显示“未提供该类图像”。
8. canopy-only成功。
9. head-only成功返回检测结果；本轮生成核验失败按业务降级展示。
10. 三图+context成功，修复了Vue数字输入转数字后的字符串序列化问题。
11. bbox以原图宽高作为SVG viewBox，与同一SVG中的图片同比缩放；浏览器验证框数和原图尺寸。
12. water_stress显示“疑似水分胁迫视觉表现”，说明弱监督及非缺水确诊。
13. nitrogen_deficiency显示“缺氮类黄化视觉表现”。
14. insufficient_evidence作为正常业务提示，不显示整页错误。
15. warnings显示“部分分析能力暂不可用”，保留成功部分；夹具回归通过。
16. citations与knowledge.evidence展示，视觉观测不作为文献。
17. recommendations展示action/basis；source_ids可滚动到证据。
18. 支持“进入AI风险分析”，以同一会话内存携带结果；刷新页面后提示重新分析。
19. 支持“在知识图谱中查看”；真实浏览器验证选中wheat并定位“锈病”实体。
20. 梨Playwright原有10项测试全部通过。
21. vue-tsc与Vite build通过；现有CSS有一个align-items:end兼容提示，不是构建失败。
22. 具备下一阶段风险中心的接口/UI联调基础；本阶段未继续改风险中心。

## 测试及部署范围

- 小麦浏览器夹具测试：四类输入、multipart封装、空项、证据不足、风险路由、bbox、warning、500提示、真实KG深链接；无pageerror。
- 梨：`PLAYWRIGHT_CHANNEL=msedge npm test`，10 passed。
- `npm run typecheck`通过；`npm run build -- --outDir dist-wheat-check`通过。
- `node --check tests/wheat-browser.mjs` 和 dashboard.js语法检查通过。
- 仓库没有配置lint命令；没有虚报ESLint通过，没有为此引入新的依赖。
- 构建使用隔离目录 `frontend/dist-wheat-check`，没有覆盖Java静态发布资源。
- Vite `/api/wheat` 默认代理8090，可通过 `WHEAT_API_TARGET` 指向8092等实际后端。
  生产部署需在同源网关配置 `/api/wheat/*` 转发ai-service，Vite代理不适用于静态生产部署。
- 图谱默认地址8090，可用 `VITE_GRAPH_URL` 配置；没有部署新的图谱页面。
- 没有训练、修改阈值、模型、KG、GraphRAG、DeepSeek逻辑或response语义。

```powershell
# 在 frontend 内；确保frontend及ai-service已运行
node tests/wheat-browser.mjs
node tests/wheat-browser.mjs --real
```
