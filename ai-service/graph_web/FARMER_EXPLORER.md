# 图形化农业知识探索页面

## 展示结构

顶部六类问题图片 → 症状图片 → 有原文关系的候选病虫害 → 五个知识标签 → 右侧图片、摘要与来源。

完整的原有图谱、实体详情、作物和地区筛选、路径查询及导出工具保留在“查看完整知识图谱与资料工具”中。前端继续读取 `/api/graph`，没有改写 Neo4j 或新增模拟农业事实。

`farmer-explorer.js` 管理当前问题、症状、候选、标签与展开状态。候选来自当前筛选下的 `HAS_SYMPTOM` 关系。中心图包含该实体及已有 `HAS_PROCESS` 过程邻居，展示原图中的真实边。点击连线查看原始证据，点击节点展开或收起相关知识，可拖动和缩放。

默认黑星病为图鉴参考，尚未选择症状。当前库中“叶片黑色斑点”直接关联的是梨细菌性花枯病；“大片褐色斑”尚无精确匹配记录。页面不会为了匹配原型而把黑星病、褐斑病、轮纹病全部写成症状候选。原型中“春季多雨”“通风不良”等内容只有存在对应知识关系时才能出现。

图片源文件及名称映射位于 `data/botou_yali/evidence/images/image-manifest.json`。用户提供的图片是外观参考，不作为病害确诊或当地高发的证据。原型中的背景果树照片及农户人物插画没有独立原始素材，目前使用浅色背景及农户图标，未冒充现场照片。

## 工作台联动

- 跳转到 `/platform/workspaces/farm-01?module=vision`，自动打开现有视觉模块。
- 未登录仍进入现有登录页；登录后恢复该固定本地入口，不接受任意重定向地址。
- 视觉模块当前只检测人员和作物，不是梨病害识别模型。新增入口明确区分手动症状选择与模型输出。
- 回到 `http://<主机>:8090/?problem=leaf_spot` 自动选择叶斑；`leaf_curl` 选择卷叶；也支持 `pest`、`healthy`、`fruit`、`storage`。
- 未来视觉结果可通过检测项可选字段 `symptom` 携带枚举值。当前未伪造此结果，手动选择以 `from=manual_observation` 标记。

## 构建与检查

从 agric 目录运行：

```powershell
ai-service/.venv/Scripts/python.exe ai-service/scripts/build_farmer_ui.py
node ai-service/graph_web/test_farmer_explorer.mjs
node ai-service/graph_web/test_simple_interaction.mjs
```

展示层源文件为 `static/farmer-explorer.js`、`static/farmer-explorer.css`；构建脚本将其合并到现有 dashboard 静态入口，不需要增加 FastAPI 静态路由。图片重建仍使用 `scripts/build_graph_images.py`。

浏览器测试需要专用 Edge CDP 端口9229、图谱服务8090及工作台8081。测试覆盖图片加载、症状候选、无匹配状态、五个标签、搜索、证据弹窗、原页展开、菜单、返回参数和移动端宽度。工作台往返测试在独立浏览器页内模拟认证与工作台API响应，仅验证界面联动，不代表真实账号认证集成测试；图谱API使用本机真实数据。测试页结束即关闭。

工作台已执行 `npm run build`。本机8081后端通过静态资源优先目录读取新构建结果；`start-local.ps1` 保留该配置。

界面截图：`test-artifacts/farmer-desktop.png`、`test-artifacts/farmer-mobile.png`。
