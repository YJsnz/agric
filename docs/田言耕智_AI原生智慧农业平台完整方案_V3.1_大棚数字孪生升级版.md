# 田言耕智
## AI 原生智慧农业与数字孪生平台完整方案

> 版本：V3.0（当前界面定稿版：双模式入口 + 农场中心化工作台 + 3D 数字孪生）  
> 用途：产品设计、前端原型、Codex 执行、课程答辩  
> 技术路线：Vue 3 + TypeScript + Vite + Vue Router + Pinia + SCSS + ECharts  
> 当前阶段：Mock 数据驱动的完整静态原型，预留后端和大模型接口  
> 视觉基调：Harvesta 式自然农业高级感 + ChatGPT 式智能问农入口 + 全屏农场数字孪生工作台 + 液态玻璃业务 Dock

---

# 1. 产品定位

## 1.1 品牌名称

中文名称：

**田言耕智**

产品副标题：

**AI 原生智慧农业与数字孪生平台**

品牌表达：

```text
田：以农场、地块和大棚为核心空间
言：以自然语言作为系统入口
耕：覆盖种植、灌溉、巡检和农事执行
智：通过数据、视觉识别和 AI 辅助决策
```

## 1.2 产品定义

田言耕智不是传统“左侧菜单 + 固定图表 + 大量卡片”的农业后台，而是一套：

> **以自然语言为入口、以农场空间为主界面、以 2.5D 航拍与 3D 数字孪生为核心载体、以专业业务页面为深度支撑的智慧农业 AI 工作空间。**

系统采用两套明确区分的主界面：

```text
智能问农：通过自然语言获取数据、图表、分析和操作建议
数据工作台：在完整农场空间中查看地块、环境、设备、监控、灌溉、作物和告警
```

用户进入系统后，不需要先寻找菜单。例如输入：

```text
查看 1 号温室最近 24 小时的土壤湿度
```

系统在对话中生成：

- 一句话分析结论；
- 当前湿度指标；
- 24 小时趋势图；
- 异常时段标记；
- 灌溉记录；
- AI 建议；
- 进入对应地块或固定结果的操作入口。

用户切换到数据工作台后，界面不再展示传统侧边栏和大量固定卡片，而是以完整农场地图或 3D 数字孪生场景为中心，通过点击地块、设备、摄像头和告警点按需展示信息。

## 1.3 产品口号

```text
不用寻找数据，直接询问数据。
不必浏览报表，直接进入农场。
AI 不只回答问题，还能定位、解释和辅助行动。
```

## 1.4 当前原型阶段

当前版本以视觉和交互原型为主：

- 使用 Mock 数据；
- 自然语言先通过预设意图和结构化 JSON 模拟；
- 2.5D 模式使用航拍图与 SVG/HTML 图层；
- 3D 模式使用 Three.js 或 TresJS；
- 高精度模型允许后续替换为 GLB/GLTF 资产；
- 不要求真实设备、真实 AI 模型或真实视频分析服务。

# 2. 总体结构

```text
田言耕智
├── 智能问农 Copilot
│   ├── ChatGPT 式极简入口
│   ├── 自然语言查询
│   ├── 数据卡、图表、地图与分析回答
│   ├── AI 原因解释和操作确认
│   └── 结果进入专业页面或农场工作台
│
├── 数据工作台 Farm Workspace
│   ├── 无左侧侧边栏
│   ├── 全屏 2.5D 航拍农场
│   ├── 3D 数字孪生农场
│   ├── 实景 / 数字孪生切换
│   ├── 点击对象后显示上下文抽屉
│   ├── 底部液态玻璃业务 Dock
│   └── 地块、监控、环境、设备、灌溉、作物和告警联动
│
└── 专业业务页面
    ├── 农场与地块
    ├── 环境与气候
    ├── 智能灌溉
    ├── 作物与病虫害
    ├── 设备、视频与大棚 AI 视觉监测
    ├── 无人机与机器人
    ├── 农事任务
    ├── 库存与溯源
    ├── 数据分析与报告
    └── 告警与系统管理
```

顶部中央始终保留模式切换：

```text
[ 智能问农 ] [ 数据工作台 ]
```

## 2.1 当前界面设计基线

本节为 Codex 和后续 UI 开发必须优先遵循的当前界面定稿要求。

### 智能问农模式

```text
保留极简左侧栏
+ 中央欢迎语和输入框
+ 顶部模式切换
+ 无固定右侧栏
+ 用户输入后才生成回答内容
```

左侧栏仅包含：

```text
新聊天
文件库
项目
更多
最近聊天
底部用户身份
```

不得在智能问农左侧栏堆叠环境、设备、灌溉、作物、告警等农业业务菜单。

### 数据工作台模式

```text
取消左侧侧边栏
取消右侧固定信息流
取消顶部六张统计卡
取消页面底部普通图表堆叠
```

默认页面只保留：

1. 顶部全局控制栏；
2. 中央全屏农场场景；
3. 地图对象标签和必要状态点；
4. 底部液态玻璃业务 Dock；
5. 用户点击对象后临时出现的右侧上下文抽屉。

### 信息出现原则

```text
默认不展示
用户选择后展示
关闭后恢复完整农场视野
```

右侧区域不得永久显示告警、AI 助手、用水趋势或其他卡片。

### 当前视觉重点

- 农场场景占据页面绝大部分；
- UI 只作为覆盖在场景上的轻量操作层；
- 2.5D 航拍和 3D 数字孪生共用同一套数据与状态；
- 底部 Dock 是数据工作台的主要业务导航；
- 右下角不设置独立悬浮 AI 助手按钮；
- AI 能力通过顶部“智能问农”模式或上下文面板中的分析入口体现。

## 2.2 两种主界面的职责边界

| 模式 | 核心任务 | 主要交互 |
|---|---|---|
| 智能问农 | 查询、解释、比较、预测、生成建议 | 输入自然语言，获得结构化回答 |
| 数据工作台 | 浏览农场、定位对象、切换业务图层、执行上下文操作 | 点击地块、设备、摄像头、告警点 |
| 专业页面 | 查看完整历史、编辑配置、批量管理 | 表格、图表、表单、抽屉和流程 |

专业页面仍然保留，但不再作为系统第一视觉入口。

# 3. 核心创新点

## 3.0 Farm-Centric Digital Twin Workspace

数据工作台不是卡片仪表盘，而是“农场即界面”。

```text
进入工作台
→ 看到完整农场
→ 从底部 Dock 选择业务图层
→ 点击地块、设备、摄像头或告警
→ 打开上下文信息
→ 完成查看、分析或下一步行动
```

核心特征：

- 无左侧业务菜单；
- 无固定右侧信息栏；
- 无大面积统计卡堆叠；
- 场景是页面主体；
- 数据按需出现；
- 2.5D 与 3D 状态连续切换；
- 所有业务围绕具体农场对象组织。

## 3.0.1 Aerial-to-3D 双视图

顶部或场景右侧提供：

```text
[ 实景 ] [ 数字孪生 ]
```

实景模式使用航拍底图与空间图层，数字孪生模式使用真实可旋转、缩放和选择的 3D 场景。切换时必须保留：

- 当前农场；
- 当前选中地块；
- 当前业务模块；
- 当前图层；
- 当前时间范围；
- 当前右侧详情内容。


## 3.1 Conversation to Dashboard

```text
自然语言提问
→ 生成指标、图表、地图和操作卡
→ 固定有价值的数据组件
→ 自动形成个人工作台
```

## 3.2 Generative Dashboard

用户输入：

```text
帮我创建一个灌溉管理工作台
```

系统自动生成水位、压力、阀门、用水趋势、湿度排行和 AI 节水建议。

## 3.3 Context-Aware Workspace

所有组件共享：

```text
当前农场 / 当前地块 / 当前作物 / 当前时间 / 当前指标
```

点击地图中的 2 号温室后，趋势图、设备表、告警和 AI 建议同步更新。

## 3.4 Farm Time Machine

拖动时间轴，恢复过去某个时刻的：

- 地块状态；
- 设备状态；
- 告警；
- 天气；
- 温湿度；
- 灌溉；
- 无人机轨迹。

## 3.5 Analysis Lens

地图上的可移动分析透镜，可切换 NDVI、温度、湿度、NPK 和病虫害风险。

## 3.6 Explainable AI

AI 建议分三层：

1. 一句话结论；
2. 数据依据与权重；
3. 可调整行动方案。

## 3.7 What-if 决策沙盘

调整灌溉、补光、温度和施肥，实时模拟产量、用水、成本、健康度和病害风险。

## 3.8 Digital Seed

每个作物批次拥有数字种子，记录从播种到采收全过程，并进入消费者溯源页。

## 3.9 Farm Vital Signs

```text
农场心率 / 生长活力 / 水分循环 / 营养平衡 / 设备协调度 / 风险压力
```

## 3.10 Liquid Farm Dock

数据工作台底部设置液态玻璃业务 Dock：

```text
总览 / 监控 / 环境 / 设备 / 灌溉 / 作物 / 告警
```

Dock 不负责普通页面跳转，而是控制当前农场场景中的业务图层和对象展示。

例如：

```text
点击监控 → 高亮摄像头与覆盖范围
点击环境 → 显示温度、湿度或光照图层
点击设备 → 显示传感器、水泵、阀门和风机
点击灌溉 → 显示水池、管线、阀门和水流
点击告警 → 只保留异常对象和风险等级
```

## 3.11 Greenhouse Vision Intelligence

大棚内摄像头不只是播放视频，而是持续生成结构化视觉事件，并与环境传感器、设备状态、地块位置和农事任务进行交叉验证。

核心能力：

```text
人员识别
作物状态识别
病虫害风险识别
环境安全识别
设备视觉状态识别
视频事件与传感器数据交叉验证
```

示例：

```text
设备系统上报：1号风机正在运行
视觉识别结果：风机叶片未转动
综合判断：疑似机械故障
```

视觉事件可直接：

- 定位到大棚区域；
- 跳转异常录像；
- 生成 AI 原因解释；
- 创建巡检或维修任务；
- 固定到工作台；
- 加入日报或告警闭环。

---

# 4. 视觉设计系统

## 4.1 设计语言

```text
Harvesta 的自然农业感
+ ChatGPT 的极简输入结构
+ Apple 的克制留白与液态玻璃
+ Linear 的层级和动效
+ 数字孪生平台的空间交互
```

禁止：

- 传统蓝色后台；
- 纯黑 ChatGPT 皮肤；
- 固定侧边栏占用数据工作台空间；
- 页面周围堆叠大量统计卡；
- 所有区域都做液态玻璃；
- 赛博朋克霓虹；
- 大面积荧光色；
- Element Plus 默认外观；
- 使用一张 2D 渲染图冒充可交互 3D 场景。

## 4.2 颜色变量

```scss
:root {
  --bg-page: #dfe2d4;
  --bg-sidebar: #eeeee5;
  --bg-surface: #f4f4ec;
  --bg-surface-strong: #ffffff;
  --bg-glass: rgba(244, 244, 236, 0.76);
  --bg-context-dark: rgba(17, 32, 25, 0.88);

  --brand-primary: #59684d;
  --brand-primary-hover: #48573f;
  --brand-primary-deep: #2f3b2a;
  --brand-primary-soft: #c9d0bf;

  --accent: #e4f600;
  --accent-hover: #d5e700;
  --accent-soft: rgba(228, 246, 0, 0.18);

  --text-primary: #1a2118;
  --text-secondary: #626b5d;
  --text-tertiary: #8e9688;
  --text-inverse: #f7f8f1;

  --success: #668150;
  --warning: #d1aa3c;
  --danger: #cc6257;
  --info: #71817a;

  --border-soft: rgba(47, 59, 42, 0.09);
  --shadow-sm: 0 8px 20px rgba(32, 43, 26, 0.08);
  --shadow-md: 0 16px 36px rgba(32, 43, 26, 0.12);
  --shadow-lg: 0 26px 68px rgba(32, 43, 26, 0.18);

  --radius-sm: 14px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 30px;
  --radius-pill: 999px;
}
```

配色比例：

```text
场景与自然背景 70%
米白或深色上下文面板 20%
深绿色文字和图标 8%
荧光黄绿色强调 2%
```

## 4.3 字体

```css
font-family:
  "HarmonyOS Sans SC",
  "MiSans",
  "PingFang SC",
  "Microsoft YaHei",
  "Inter",
  sans-serif;
```

## 4.4 表面与卡片

普通专业页面的数据卡使用米白实体表面：

```css
.data-card {
  background: rgba(244, 244, 236, 0.96);
  border: 1px solid rgba(47, 59, 42, 0.08);
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(32, 43, 26, 0.10);
}
```

数据工作台中不允许铺设大面积卡片网格。场景上只允许出现：

- 天气小卡；
- 对象标签；
- 地图工具；
- 模式切换；
- 上下文抽屉；
- 底部 Dock。

## 4.5 液态玻璃业务 Dock

```css
.farm-business-dock {
  background: linear-gradient(
    135deg,
    rgba(246, 248, 241, 0.74),
    rgba(221, 229, 214, 0.50)
  );
  backdrop-filter: blur(30px) saturate(155%);
  -webkit-backdrop-filter: blur(30px) saturate(155%);
  border: 1px solid rgba(255, 255, 255, 0.64);
  border-radius: 999px;
  box-shadow:
    0 24px 65px rgba(31, 48, 27, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}
```

选中项：

```css
.farm-dock-item.is-active {
  background: rgba(65, 105, 63, 0.92);
  color: #fff;
  box-shadow:
    0 10px 24px rgba(47, 83, 45, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
```

Dock 要求：

- 位于页面底部中央；
- 距离底部约 20px；
- 高度约 68–76px；
- 保留 7 个核心业务按钮；
- 不设置独立 AI 助手按钮；
- 悬停时轻微上浮，禁止夸张缩放；
- 在亮色和暗色农场场景上均保持可读性。

## 4.6 顶部模式切换

顶部中央使用紧凑的玻璃分段控件：

```text
智能问农 | 数据工作台
```

当前模式使用深绿色实体选中态。切换按钮必须居中，不与搜索框、时间选择器发生视觉偏移。

## 4.7 上下文抽屉

数据工作台右侧抽屉默认关闭，仅在选中对象时出现。

在航拍实景模式下优先使用浅米白半透明表面；在 3D 场景较暗时允许使用深绿色半透明表面。抽屉宽度建议为屏幕的 28%–32%，最大不超过 420px。

抽屉内容遵循：

```text
标题与关闭
对象标签页
核心概况
实时环境
设备状态
最新告警
下一步操作
```

## 4.8 场景标签

对象标签采用小型深绿色半透明浮层，显示：

```text
对象名称
一个核心指标
状态点与状态文字
```

默认不得同时展示大量环境指标，详细信息通过 Hover 或 Click 获取。

# 5. 智能问农设计

## 5.1 当前界面结构

智能问农采用接近 ChatGPT 的极简结构，但使用田言耕智的自然农业视觉。

```text
左侧极简会话栏
+ 顶部居中模式切换
+ 中央欢迎语
+ 中央大型输入框
+ 输入后出现对话内容
```

右侧默认完全不显示任何固定模块。

## 5.2 左侧栏定稿

左侧栏仅包含：

```text
田言耕智
搜索
收起侧栏

新聊天
文件库
项目
更多

最近聊天
- 今日农场状态
- 1号大棚湿度分析
- 设备异常诊断
- 番茄产量预测

底部用户栏
- 头像或姓名缩写
- 用户姓名
- 身份，例如“农场管理员”
```

要求：

- 收起按钮和搜索按钮位于侧边栏右上区域；
- 用户栏整体合体、匀称，头像、姓名、身份纵向对齐；
- 不显示环境、设备、灌溉、作物等农业业务菜单；
- 最近聊天数量适中，超出部分滚动；
- 左侧栏可折叠为图标栏。

## 5.3 中央欢迎状态

欢迎语：

```text
今天想了解农场的什么？
```

输入框占据视觉中心，提示语：

```text
询问农场、获取数据或生成分析……
```

输入框支持：

- 自然语言；
- `/` 快捷命令；
- `@` 农场对象引用；
- 图片上传；
- 文件上传；
- 语音输入。

输入框下方允许显示 4–6 个简洁推荐问题：

```text
分析今日农场状态
查看异常地块
生成灌溉建议
比较两座温室
预测本周产量
创建视觉监测分析
```

## 5.4 回答出现逻辑

在用户发送消息之前，右侧和中央不得预先展示数据卡、地图、告警或 AI 助手面板。

用户输入后，回答按需生成：

```text
AI 总结
+ 指标卡
+ 图表
+ 地图
+ 视频
+ 原因解释
+ 操作建议
```

复杂回答支持：

- 进入对应农场对象；
- 在数据工作台中定位；
- 打开专业页面；
- 加入报告；
- 创建任务；
- 继续追问。

## 5.5 模式切换

顶部中央显示：

```text
[ 智能问农 ] [ 数据工作台 ]
```

从智能问农切换到数据工作台时：

- 保留当前农场上下文；
- 如果回答中已选择地块，工作台自动定位该地块；
- 不保留智能问农的左侧栏；
- 数据工作台直接进入全屏农场场景。

# 6. 数据工作台设计

## 6.1 核心定位

数据工作台采用：

> **Farm-Centric Workspace｜以农场为中心的数字孪生工作台**

页面不再以统计卡和图表网格为主体，而是以完整农场空间为主体。

```text
地图就是主界面
对象就是数据入口
Dock 就是业务导航
抽屉就是上下文详情
```

## 6.2 页面总布局

```text
┌────────────────────────────────────────────────────────────┐
│ 品牌/农场选择      智能问农 | 数据工作台      搜索/时间/通知 │
├────────────────────────────────────────────────────────────┤
│ 天气卡                                 实景 | 数字孪生       │
│                                                            │
│                                                            │
│                 2.5D 航拍或真实 3D 农场场景                │
│                                                            │
│        大棚、地块、设备、摄像头、人员、机器人、告警          │
│                                                            │
│                          选中对象后右侧上下文抽屉            │
│                                                            │
│       [总览][监控][环境][设备][灌溉][作物][告警]             │
└────────────────────────────────────────────────────────────┘
```

## 6.3 必须取消的旧布局

数据工作台中取消：

- 左侧侧边栏；
- “新建工作台”大型左侧按钮；
- 顶部六张统计指标卡；
- 永久固定的右侧告警列表；
- 永久固定的 AI 助手卡；
- 永久固定的用水趋势卡；
- 页面下方温湿度、设备环图、作物环图等默认图表；
- 右下角独立 AI 助手悬浮按钮。

这些数据只在用户选中对应对象或功能后展示。

## 6.4 顶部全局控制栏

### 左侧

```text
田言耕智
智慧农场01 ▼
```

### 中间

```text
智能问农 | 数据工作台
```

### 右侧

```text
搜索设备、地块、数据……
今天 08:00–18:00
通知
全屏
```

搜索框、模式切换和时间控件必须位于统一基线，保持视觉居中。

## 6.5 2.5D 实景模式

实景模式使用：

- 航拍农场图片或地图；
- SVG 地块边界；
- HTML/CSS 对象标签；
- 摄像头与设备图标；
- 环境热力图；
- 灌溉管网；
- 告警脉冲点。

适合：

- 快速查看全局；
- 真实农场位置对应；
- 课程原型稳定展示；
- 无高质量 3D 模型时的默认方案。

## 6.6 3D 数字孪生模式

3D 模式必须是真实 WebGL 场景，而不是一张带透视感的 2D 图片。

推荐技术：

```text
Three.js 或 TresJS
GLTF / GLB
CSS2DRenderer 或 HTML Overlay
Pinia 共享状态
```

场景至少包含：

```text
地形
道路
水池
地块
三类大棚
仓库
泵房
水肥一体机
气象站
摄像头
传感器
农业机器人
无人机
灌溉管线
```

交互：

```text
左键拖动：旋转
右键拖动：平移
滚轮：缩放
单击：选择对象
双击：聚焦对象
点击空白：取消选择
```

### Codex 实现边界

Codex 可以完成：

- Three.js/TresJS 场景结构；
- 基础几何模型；
- GLB/GLTF 加载；
- 点击、聚焦、标签和动画；
- 场景与业务数据联动；
- 性能优化和模型复用。

高质量模型资产建议由：

- Blender；
- 现成 GLB/GLTF；
- 人工低多边形建模；
- 第三方合法模型资源

提供。Codex 不应被要求从零生成照片级农场美术资产。

## 6.7 实景 / 数字孪生切换

切换按钮：

```text
[ 实景 ] [ 数字孪生 ]
```

位置建议：

- 场景右上方；
- 或右侧地图工具栏顶部；
- 不放入底部业务 Dock。

切换时必须保留：

- 当前农场；
- 当前选中对象；
- 当前 Dock 模块；
- 当前图层；
- 当前时间范围；
- 当前抽屉标签页。

过渡建议：

```text
航拍轻微缩放
→ 地块边界保持
→ 3D 模型渐显
→ 摄像机切换为倾斜视角
```

时长建议为 600–900ms。

## 6.8 对象显示规则

### 默认状态

场景只显示必要标签：

```text
1号番茄温室
健康度 96
● 正常
```

### Hover

显示快速预览：

```text
作物
健康度
温度
空气湿度
土壤湿度
告警数量
```

### Click

- 高亮对象；
- 镜头轻微聚焦；
- 打开右侧上下文抽屉；
- 更新顶部上下文。

### Double Click

进入沉浸式对象模式：

- 其他对象降低透明度；
- 展开内部设备；
- Dock 仅作用于当前对象；
- 顶部显示返回农场。

## 6.9 右侧上下文抽屉

抽屉默认关闭。

点击不同对象后显示不同内容：

### 地块或大棚

```text
概况 / 环境 / 作物 / 设备 / 监控 / 任务 / 告警
```

### 摄像头

```text
实时预览
AI 视觉事件
当前识别对象
进入视觉监测中心
```

### 设备

```text
设备状态
当前值
所属区域
最后通信
运行记录
控制入口
```

### 告警

```text
原因
关联数据
影响范围
AI 建议
创建任务
```

关闭抽屉后恢复完整农场视野。

## 6.10 底部液态玻璃业务 Dock

数据工作台 Dock 固定为：

```text
总览
监控
环境
设备
灌溉
作物
告警
```

### 总览

恢复完整农场视角，显示基础状态。

### 监控

- 高亮摄像头；
- 显示摄像头朝向和覆盖范围；
- 点击后打开视频；
- 可进入大棚 AI 视觉监测中心。

### 环境

提供二级指标条：

```text
温度 / 空气湿度 / 土壤湿度 / 光照 / CO₂
```

在场景上显示热力图、数据柱或区域着色。

### 设备

显示：

- 传感器；
- 水泵；
- 阀门；
- 风机；
- 补光灯；
- 遮阳帘；
- 机器人。

### 灌溉

显示：

- 蓄水池；
- 泵房；
- 主管道；
- 支管；
- 阀门；
- 水流动画；
- 正在灌溉区域。

### 作物

显示：

- 作物类型；
- 生长阶段；
- 健康度；
- 成熟状态；
- 疑似异常区域。

### 告警

隐藏正常对象，只显示：

```text
关注 / 预警 / 严重 / 离线
```

## 6.11 场景工具栏

场景右侧只保留轻量工具：

```text
放大
缩小
复位视角
实景/3D
图层
全屏
```

不得再增加重复导航按钮。

## 6.12 数据面板的处理方式

旧版自由拖拽 Widget 不再作为默认主界面。

图表和指标通过以下方式出现：

- 对象抽屉；
- 场景浮层；
- 全屏分析模式；
- 智能问农回答；
- 专业详情页。

可以保留“保存场景视图”和“生成分析快照”，但不得破坏农场主场景的中心地位。

# 7. 场景与业务联动

## 7.1 视图状态共享

2.5D 实景和 3D 数字孪生共用：

```text
当前农场
当前选中对象
当前业务模块
当前图层
当前时间
当前告警
当前上下文抽屉
```

## 7.2 地块联动

点击 2 号温室后：

- 场景聚焦；
- 对象描边高亮；
- 右侧抽屉打开；
- 环境、设备、监控、任务和告警均切换到该温室；
- 从实景切换到 3D 后仍保持该温室选中。

## 7.3 监控联动

点击摄像头：

- 场景显示覆盖范围；
- 打开实时视频小窗；
- 视觉事件定位到对应大棚；
- 点击视觉事件后场景高亮异常区域。

## 7.4 环境联动

选择“土壤湿度”：

- 场景切换湿度热力图；
- 点击区域显示当前值；
- 抽屉展示历史趋势；
- 告警点与低湿度区域同步高亮。

## 7.5 设备联动

点击设备：

- 抽屉显示系统上报状态；
- 监控可显示视觉核验结果；
- 告警可关联设备异常；
- 灌溉模块可显示管线关系。

## 7.6 告警联动

点击告警：

- 场景定位；
- 对象高亮；
- 时间轴定位异常时间；
- 相关设备与摄像头高亮；
- 展开 AI 原因与处理建议。

## 7.7 智能问农到工作台

用户在智能问农中输入：

```text
定位 4 号生菜种植区的土壤湿度异常
```

切换到数据工作台后：

- 自动进入对应农场；
- 选择 4 号地块；
- 打开环境模块；
- 开启土壤湿度图层；
- 展开告警抽屉。

# 8. 核心业务交互闭环

## 8.1 地块三级交互

```text
Hover：快速预览
Click：侧边抽屉
查看完整详情：进入专业页面
```

## 8.2 告警闭环

```text
告警产生
→ 定位地块
→ 查看异常指标
→ 展示原因链
→ 选择方案
→ 确认执行
→ 模拟设备变化
→ 数据恢复
→ 告警关闭
→ 生成记录
```

## 8.3 AI 建议三级交互

第一层：

```text
建议今天16:00为2号温室滴灌12分钟
```

第二层：

```text
土壤湿度偏低 42%
无降雨 24%
坐果期需水增加 21%
昨日灌溉偏少 13%
```

第三层：

```text
立即执行
调整方案
加入计划
创建任务
忽略本次
```

## 8.4 设备控制安全逻辑

- 低风险：直接操作并反馈；
- 中风险：确认目标、时间和预计消耗；
- 高风险：风险提示、输入确认、倒计时和撤销入口。

## 8.5 任务业务约束

喷药任务进入“执行中”前检查天气和风速，提示：

```text
当前环境不适合喷药
继续执行
改期
查看推荐时间
```

---

# 9. 自然语言与模型方案

## 9.1 当前阶段

不训练模型，采用：

```text
关键词规则
+ 预设意图
+ Mock 数据
+ 固定组件协议
```

## 9.2 后续升级

接入现成大模型 API。模型只负责：

- 意图识别；
- 实体抽取；
- 时间理解；
- 组件选择；
- 数据查询计划；
- 总结文案。

模型不得：

- 直接执行任意前端代码；
- 直接操作设备；
- 绕过权限；
- 返回未经校验的 HTML。

推荐流程：

```text
用户输入
→ 意图识别
→ 结构化 JSON
→ Schema 校验
→ 权限校验
→ 查询农业 API
→ 固定组件渲染
→ 返回可执行动作
```

---

# 10. Widget 协议

```ts
export interface AssistantResponse {
  id: string;
  message: string;
  widgets: WidgetConfig[];
  suggestions?: SuggestionConfig[];
  actions?: ActionConfig[];
  context?: QueryContext;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  dataSource: string;
  query?: Record<string, unknown>;
  size?: {
    cols: number;
    rows: number;
  };
  options?: Record<string, unknown>;
  actions?: WidgetAction[];
}

export type WidgetType =
  | "metric"
  | "metric-group"
  | "line-chart"
  | "bar-chart"
  | "area-chart"
  | "pie-chart"
  | "radar-chart"
  | "gauge"
  | "table"
  | "farm-map"
  | "alert-list"
  | "device-list"
  | "task-list"
  | "recommendation"
  | "comparison"
  | "timeline"
  | "weather"
  | "report-preview"
  | "text-summary"
  | "action-confirmation"
  | "live-camera"
  | "camera-grid"
  | "vision-event-list"
  | "crop-vision-analysis"
  | "person-count"
  | "intrusion-alert"
  | "visual-device-status"
  | "camera-playback"
  | "greenhouse-heatmap";
```

示例：

```json
{
  "id": "response-001",
  "message": "2号温室当前土壤湿度偏低，建议进行滴灌。",
  "widgets": [
    {
      "id": "widget-01",
      "type": "metric",
      "title": "当前土壤湿度",
      "dataSource": "field-02-soil-moisture",
      "size": { "cols": 3, "rows": 2 },
      "actions": ["pin", "open-detail"]
    },
    {
      "id": "widget-02",
      "type": "line-chart",
      "title": "过去24小时湿度趋势",
      "dataSource": "field-02-soil-moisture-history",
      "size": { "cols": 6, "rows": 4 },
      "actions": ["pin", "change-range", "export"]
    },
    {
      "id": "widget-03",
      "type": "recommendation",
      "title": "智能灌溉建议",
      "dataSource": "field-02-irrigation-suggestion",
      "size": { "cols": 3, "rows": 4 },
      "actions": ["pin", "adjust", "create-task"]
    }
  ]
}
```

---

# 11. 工作台数据结构

```ts
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  layoutMode: "free" | "overview" | "map" | "analysis" | "presentation";
  globalContext: QueryContext;
  refreshInterval: number;
  widgets: WorkspaceWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceWidget {
  id: string;
  widget: WidgetConfig;
  x: number;
  y: number;
  w: number;
  h: number;
  locked?: boolean;
  followGlobalContext?: boolean;
}

export interface QueryContext {
  farmId?: string;
  fieldIds?: string[];
  cropIds?: string[];
  deviceIds?: string[];
  metrics?: string[];
  range?: string;
  startTime?: string;
  endTime?: string;
}
```


## 11.1 视觉监测数据类型

```ts
export interface Camera {
  id: string;
  name: string;
  greenhouseId: string;
  areaName: string;
  online: boolean;
  aiEnabled: boolean;
  resolution: string;
  streamUrl?: string;
  poster?: string;
  unreadEventCount: number;
}

export type VisionEventType =
  | "person"
  | "intrusion"
  | "crop-wilt"
  | "crop-disease"
  | "pest-risk"
  | "smoke"
  | "fire"
  | "water-leak"
  | "standing-water"
  | "blocked-path"
  | "device-mismatch";

export interface VisionEvent {
  id: string;
  cameraId: string;
  greenhouseId: string;
  type: VisionEventType;
  title: string;
  confidence: number;
  level: "info" | "warning" | "serious" | "urgent";
  status: "new" | "processing" | "resolved" | "false-positive";
  occurredAt: string;
  playbackTime: number;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relatedSensorIds?: string[];
  relatedDeviceIds?: string[];
  description: string;
  aiExplanation: string;
  suggestions: string[];
}

export interface VisionCorrelation {
  eventId: string;
  visualEvidence: Array<{
    label: string;
    value: string;
    confidence?: number;
  }>;
  sensorEvidence: Array<{
    metric: string;
    value: number;
    unit: string;
    status: "normal" | "warning" | "danger";
  }>;
  deviceEvidence: Array<{
    deviceId: string;
    reportedState: string;
    visualState: string;
    matched: boolean;
  }>;
  conclusion: string;
}
```

---


## 11.2 农场中心化工作台状态

```ts
export type FarmViewMode = "aerial" | "digital-twin";

export type FarmBusinessModule =
  | "overview"
  | "monitoring"
  | "environment"
  | "devices"
  | "irrigation"
  | "crops"
  | "alerts";

export type SceneEntityType =
  | "farm"
  | "field"
  | "greenhouse"
  | "building"
  | "camera"
  | "sensor"
  | "device"
  | "irrigation-node"
  | "robot"
  | "uav"
  | "alert";

export interface SceneEntity {
  id: string;
  type: SceneEntityType;
  name: string;
  status: "normal" | "attention" | "warning" | "danger" | "offline";
  position2D?: {
    x: number;
    y: number;
  };
  position3D?: {
    x: number;
    y: number;
    z: number;
  };
  rotation3D?: {
    x: number;
    y: number;
    z: number;
  };
  scale3D?: number;
  modelUrl?: string;
  relatedFieldId?: string;
  relatedDeviceId?: string;
}

export interface FarmWorkspaceState {
  farmId: string;
  viewMode: FarmViewMode;
  activeModule: FarmBusinessModule;
  selectedEntityId?: string;
  selectedEnvironmentMetric?:
    | "temperature"
    | "airHumidity"
    | "soilMoisture"
    | "light"
    | "co2";
  timeRange: {
    start: string;
    end: string;
  };
  contextDrawerOpen: boolean;
  contextDrawerTab?: string;
  sceneLayers: Record<string, boolean>;
}
```

## 11.3 3D 模型清单

```ts
export interface DigitalTwinAsset {
  id: string;
  name: string;
  category:
    | "terrain"
    | "road"
    | "greenhouse"
    | "building"
    | "device"
    | "vegetation"
    | "vehicle"
    | "water";
  modelUrl: string;
  fallbackPrimitive: "box" | "cylinder" | "plane" | "sphere" | "none";
  optimized: boolean;
  lod?: number;
}
```

# 12. 页面体系

系统共 39 个主要页面。

## AI 主入口

1. 登录页  
2. 智能问农  
3. 工作台列表  
4. 数据工作台  
5. 工作台演示模式  
6. 全局搜索  
7. 消息中心  

## 农场与地块

8. 农场列表  
9. 农场详情  
10. 地块地图  
11. 地块列表  
12. 地块详情  
13. 地块对比  

## 环境与灌溉

14. 环境总览  
15. 环境历史分析  
16. 气象站详情  
17. 灌溉总览  
18. 灌溉策略  
19. 灌溉记录  

## 作物与病虫害

20. 作物列表  
21. 作物详情  
22. 生长记录  
23. 病虫害识别  
24. 识别记录  

## 设备、视频与巡检

25. 设备总览  
26. 设备详情  
27. 视频监控  
28. 大棚 AI 视觉监测中心  
29. 无人机巡检  
30. 农业机器人  

## 运营与管理

31. 农事任务看板  
32. 农事日历  
33. 库存管理  
34. 批次溯源管理  
35. 消费者溯源页  
36. 数据分析中心  
37. 报告中心  
38. 告警中心  
39. 用户角色与系统设置  

---

# 13. 专业页面布局规范

## 13.1 农场中心化空间页面

适用于：

- 数据工作台；
- 农场总览；
- 地块定位；
- 灌溉空间展示；
- 无人机；
- 机器人。

结构：

```text
顶部全局控制
+ 全屏 2.5D / 3D 农场场景
+ 必要对象标签
+ 场景工具栏
+ 底部业务 Dock
+ 按需出现的上下文抽屉
```

数据工作台不得使用传统侧边栏和默认卡片仪表盘。

## 13.2 管理型页面

适用于：

- 作物；
- 设备；
- 库存；
- 告警；
- 用户；
- 报告。

结构：

```text
页面标题与主操作
统计卡
筛选栏
卡片或表格
分页
详情抽屉
```

## 13.3 分析型页面

适用于：

- 环境历史；
- 地块对比；
- 数据分析；
- 报告预览。

结构：

```text
全局筛选
大图表
AI 摘要
异常标记
数据表格
```


## 13.4 视觉监控型页面

适用于：

- 普通视频监控；
- 大棚 AI 视觉监测；
- 事件录像回放；
- 设备视觉核验。

桌面端推荐三栏结构：

```text
摄像头与大棚树
+ 中央实时视频或录像回放
+ 右侧 AI 事件、环境数据与处理建议
```

页面底部使用轻量液态玻璃视频控制栏：

```text
实时 / 回放 / 识别图层 / 宫格 / 截图 / 事件 / 全屏
```

视频画面叠加层必须与数据卡片保持统一视觉，避免使用传统安防平台的高饱和红蓝配色。

---

# 14. 关键页面设计摘要

## 14.1 登录页

- 左侧农业航拍图和品牌文案；
- 右侧米白登录面板；
- 荧光黄色主按钮；
- 演示账号；
- 不使用蓝色后台风格。

## 14.2 农场中心化数据工作台

当前农场总览与数据工作台采用统一空间界面：

- 无左侧侧边栏；
- 航拍实景或 3D 数字孪生占满内容区；
- 顶部显示品牌、农场、模式、搜索、时间和通知；
- 场景右上显示“实景 / 数字孪生”切换；
- 地块、大棚、设备、摄像头和告警以轻量标签显示；
- 点击对象后打开右侧上下文抽屉；
- 底部设置“总览、监控、环境、设备、灌溉、作物、告警”液态玻璃 Dock；
- 不设置右下角独立 AI 助手；
- 默认不显示固定统计卡、告警列表和图表。

### 3D 数字孪生要求

- 必须使用 WebGL 场景；
- 支持旋转、平移、缩放和对象选择；
- 支持地块聚焦；
- 支持大棚透明或内部查看；
- 支持设备、摄像头、机器人和管线图层；
- 支持场景与右侧抽屉联动；
- 允许使用低多边形模型和基础几何体作为第一阶段资产。

## 14.3 地块地图

- 全屏地图；
- 图层切换；
- 时间轴；
- 分析透镜；
- 地块详情抽屉；
- 异常区域标记；
- 创建巡检任务入口。

## 14.4 环境总览

- 温度、湿度、光照、CO₂、风速、降雨；
- 24 小时趋势；
- 地块对比；
- 天气预报；
- 环境建议；
- 异常指标。

## 14.5 灌溉总览

- 蓄水池、水泵、主管、支管、阀门、地块；
- 管道柔和水流动画；
- 当前压力、流量、用水、剩余水量；
- 灌溉计划和节水建议。

## 14.6 作物详情

- 作物图片、品种、批次、地块、阶段；
- 健康度和成熟倒计时；
- 生长趋势；
- 农事记录；
- 病虫害记录；
- 产量预测；
- 数字种子入口。

## 14.7 病虫害识别

- 图片上传；
- 扫描线；
- 识别步骤动画；
- 病害、置信度、风险、病斑占比；
- 处理建议；
- 农业知识关系图。

## 14.8 设备详情

- 设备状态；
- 功率、运行时长、通信时间、健康度；
- 控制面板；
- 维护记录；
- 操作日志；
- 告警记录。


## 14.9 大棚 AI 视觉监测中心

### 14.9.1 页面定位

该页面不是普通视频播放器，而是“大棚视觉感知、事件解释和任务闭环中心”。

核心目标：

```text
看见大棚里发生了什么
解释为什么发生
关联环境与设备数据
给出下一步行动
```

### 14.9.2 页面布局

桌面端采用三栏结构：

```text
┌────────────┬──────────────────────────────┬────────────────┐
│ 大棚/摄像头 │                              │ AI 事件流       │
│ 树形列表    │       实时视频 / 录像回放     │ 异常详情        │
│            │                              │ 环境数据        │
│            ├──────────────────────────────┤ 处理建议        │
│            │ 时间轴 / 播放 / 图层 / 宫格   │ 快捷操作        │
└────────────┴──────────────────────────────┴────────────────┘
```

顶部显示：

- 当前农场和大棚；
- 摄像头名称；
- 在线状态；
- AI 识别状态；
- 视频清晰度；
- 当前时间；
- 实时/回放切换。

### 14.9.3 摄像头导航

左侧树形结构：

```text
智慧农场01
├── 1号番茄温室
│   ├── CAM-01 东侧入口
│   ├── CAM-02 西侧种植区
│   └── CAM-03 水肥设备区
├── 2号草莓温室
├── 育苗区
├── 仓库
└── 设备间
```

支持：

- 按大棚和区域分组；
- 在线/离线状态；
- 摄像头搜索；
- 收藏常用摄像头；
- 多选加入四宫格或九宫格；
- 显示当前未处理视觉事件数量。

### 14.9.4 AI 识别对象

#### 人员识别

- 工作人员；
- 未授权人员；
- 人员数量；
- 进入和离开；
- 危险区域闯入；
- 长时间滞留；
- 未穿规定工作服；
- 跌倒或异常姿态。

#### 作物状态识别

- 植株覆盖率；
- 生长高度；
- 叶片颜色异常；
- 萎蔫；
- 倒伏；
- 缺苗；
- 成熟果实；
- 长势不均匀；
- 疑似病叶区域。

#### 病虫害风险识别

- 叶片病斑；
- 叶片缺损；
- 虫害聚集；
- 霉菌风险；
- 异常颜色；
- 害虫诱捕板数量变化。

#### 环境安全识别

- 烟雾；
- 火焰；
- 漏水；
- 地面积水；
- 通道堵塞；
- 异物掉落；
- 大棚薄膜破损；
- 门窗异常打开。

#### 设备视觉状态识别

- 风机是否真正转动；
- 补光灯是否点亮；
- 喷头是否喷水；
- 遮阳帘是否展开；
- 管道是否漏水；
- 农业机器人是否经过；
- 设备外观是否异常。

### 14.9.5 视频识别图层

视频画面可开关：

```text
人员
作物
病虫害
设备
安全
区域边界
活动轨迹
置信度
```

识别框显示：

```text
[工作人员 #P03 98%]
[疑似叶片萎蔫 89%]
[地面积水 91%]
[风机未转动 94%]
```

视觉风格要求：

- 正常目标使用低饱和绿色；
- 关注目标使用土黄色；
- 严重事件使用柔和红色；
- 标签背景半透明但必须可读；
- 目标框线宽统一；
- 不堆叠过多调试信息。

### 14.9.6 实时事件流

右侧事件时间线示例：

```text
11:02:13 工作人员进入1号温室
11:04:28 喷雾设备视觉确认启动
11:08:46 西侧出现疑似叶片萎蔫
11:09:02 传感器检测土壤湿度偏低
11:10:15 系统生成现场复检任务
```

事件分类：

```text
全部 / 人员 / 作物 / 病虫害 / 设备 / 安全
```

点击事件后：

- 视频跳转到发生时间；
- 识别目标高亮；
- 地图定位到大棚或区域；
- 展开同时段环境数据；
- 展示相关设备状态；
- 显示 AI 原因和处理建议。

### 14.9.7 视频与传感器交叉验证

该功能是模块的核心创新。

示例一：

```text
视觉识别：作物叶片出现萎蔫
土壤湿度：28%
空气温度：34.2℃
最近灌溉：18小时前
综合判断：高温与缺水共同导致萎蔫风险
```

示例二：

```text
设备系统：风机状态为运行
视觉识别：风机叶片没有转动
综合判断：疑似机械故障或状态上报异常
```

示例三：

```text
视觉识别：地面出现积水
阀门状态：已关闭
管道压力：异常下降
综合判断：疑似管道泄漏
```

### 14.9.8 异常详情与快捷操作

事件详情卡显示：

- 事件类型；
- 发生时间；
- 所属大棚；
- 摄像头；
- 置信度；
- 风险级别；
- 影响区域；
- 关联传感器；
- 关联设备；
- AI 解释；
- 建议复检时间。

快捷操作：

```text
查看环境趋势
查看异常录像
创建巡检任务
创建设备维修任务
生成灌溉建议
标记为误报
加入报告
固定到工作台
```

### 14.9.9 视觉事件闭环

```text
摄像头发现异常
→ 生成视觉事件
→ 与传感器和设备数据交叉验证
→ 判断风险等级
→ 地图与视频同时告警
→ 用户查看异常录像
→ AI 解释原因
→ 创建巡检或维修任务
→ 上传处理结果
→ 重新识别确认恢复
→ 告警关闭并归档
```

### 14.9.10 智能问农联动

支持自然语言：

```text
看看1号大棚现在有什么异常
调出2号大棚西侧摄像头
查看今天检测到的所有作物异常
找出风机运行但叶片不转的设备
对比上午和下午的作物覆盖情况
查看今天所有未授权人员事件
```

回答可以包含：

- 实时视频 Widget；
- 摄像头宫格；
- 视觉事件列表；
- 作物异常分析；
- 人员计数；
- 设备视觉核验；
- 大棚异常热力图；
- AI 总结。

### 14.9.11 大棚视觉监测工作台

通过一句话：

```text
创建一个大棚视觉监测工作台
```

自动生成：

- 1号大棚实时视频；
- 今日视觉事件；
- 当前人员数量；
- 疑似病虫害；
- 设备视觉状态；
- 大棚异常热力图；
- 环境数据；
- AI 风险总结。

### 14.9.12 前端原型实现方式

当前阶段不需要真实视觉模型。

使用：

- 本地 MP4 循环视频；
- CSS/SVG 绘制目标框；
- 预设目标轨迹；
- Mock 视觉事件；
- 时间轴驱动事件出现；
- 环境数据和设备状态联动；
- 假实时进度和识别动画。

必须确保：

- 视频资源不存在时有农业场景占位画面；
- 页面仍可离线运行；
- 识别框、事件时间和详情数据保持一致；
- 不宣称 Mock 识别是真实模型结果。

## 14.10 无人机巡检

- 航拍地图；
- 飞行路线；
- 电量、高度、速度和任务；
- 巡检胶卷；
- 异常照片与地图定位联动。

## 14.11 消费者溯源

- 独立 H5 页面；
- 产品主图；
- 批次、产地、采收、检测；
- 生长时间线；
- 农事记录；
- 物流；
- 数字种子故事。

---

# 15. 接口概要

## AI 与工作台

```text
POST   /api/assistant/chat
POST   /api/assistant/parse
POST   /api/assistant/explain
POST   /api/assistant/generate-workspace

GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id
POST   /api/workspaces/:id/widgets
PATCH  /api/workspaces/:id/layout
POST   /api/workspaces/:id/snapshots
```

## 农场与地块

```text
GET  /api/farms
POST /api/farms
GET  /api/farms/:id
GET  /api/fields
GET  /api/fields/map
GET  /api/fields/:id
GET  /api/fields/compare
```

## 环境与灌溉

```text
GET  /api/environment/summary
GET  /api/environment/realtime
GET  /api/environment/history
GET  /api/environment/forecast

GET  /api/irrigation/overview
GET  /api/irrigation/network
GET  /api/irrigation/strategies
POST /api/irrigation/actions
```

## 作物、病虫害与设备

```text
GET  /api/crops
GET  /api/crops/:id
GET  /api/crops/:id/growth-records
GET  /api/crops/:id/yield-forecast

POST /api/pests/diagnosis
GET  /api/pests/records

GET  /api/devices
GET  /api/devices/:id
GET  /api/devices/:id/metrics
POST /api/devices/:id/actions
```


## 视频与大棚 AI 视觉监测

```text
GET    /api/cameras
GET    /api/cameras/:id
GET    /api/cameras/:id/stream
GET    /api/cameras/:id/playback
GET    /api/cameras/:id/events
POST   /api/cameras/:id/ptz

GET    /api/vision/summary
GET    /api/vision/events
GET    /api/vision/events/:id
PATCH  /api/vision/events/:id/status
POST   /api/vision/events/:id/mark-false-positive
POST   /api/vision/events/:id/create-task
GET    /api/vision/greenhouses/:id/heatmap
GET    /api/vision/greenhouses/:id/crop-analysis
GET    /api/vision/devices/verification
```

---

# 16. 路由规划

```ts
const routes = [
  { path: "/login", component: LoginView },

  { path: "/", redirect: "/assistant" },
  { path: "/assistant", component: AssistantView },
  { path: "/workspaces", component: WorkspaceListView },
  { path: "/workspaces/:id", component: FarmWorkspaceView },
  { path: "/digital-twin", component: DigitalTwinView },
  { path: "/workspaces/:id/present", component: WorkspacePresentationView },
  { path: "/search", component: GlobalSearchView },
  { path: "/messages", component: MessageCenterView },

  { path: "/farms", component: FarmListView },
  { path: "/farms/:id", component: FarmDetailView },

  { path: "/fields/map", component: FieldMapView },
  { path: "/fields", component: FieldListView },
  { path: "/fields/compare", component: FieldCompareView },
  { path: "/fields/:id", component: FieldDetailView },

  { path: "/environment", component: EnvironmentOverviewView },
  { path: "/environment/history", component: EnvironmentHistoryView },
  { path: "/weather-stations/:id", component: WeatherStationDetailView },

  { path: "/irrigation", component: IrrigationOverviewView },
  { path: "/irrigation/strategies", component: IrrigationStrategyView },
  { path: "/irrigation/records", component: IrrigationRecordsView },

  { path: "/crops", component: CropListView },
  { path: "/crops/:id", component: CropDetailView },
  { path: "/crops/:id/growth", component: CropGrowthView },

  { path: "/pests/diagnosis", component: PestDiagnosisView },
  { path: "/pests/records", component: PestRecordsView },

  { path: "/devices", component: DeviceOverviewView },
  { path: "/devices/:id", component: DeviceDetailView },
  { path: "/monitoring", component: VideoMonitoringView },
  { path: "/monitoring/greenhouse-ai", component: GreenhouseVisionView },
  { path: "/monitoring/events/:id", component: VisionEventDetailView },

  { path: "/uav", component: UavView },
  { path: "/robots", component: RobotView },

  { path: "/tasks/board", component: TaskBoardView },
  { path: "/tasks/calendar", component: TaskCalendarView },

  { path: "/inventory", component: InventoryView },
  { path: "/traceability", component: TraceabilityBatchView },
  { path: "/trace/:code", component: ConsumerTraceView },

  { path: "/analytics", component: AnalyticsView },
  { path: "/reports", component: ReportsView },
  { path: "/alerts", component: AlertCenterView },
  { path: "/system", component: SystemView }
];
```

---

# 17. 组件库

## 基础组件

```text
AgriButton
AgriIconButton
AgriCard
AgriGlassPanel
AgriModal
AgriDrawer
AgriInput
AgriSelect
AgriSwitch
AgriTabs
AgriBadge
AgriAvatar
AgriTooltip
AgriSkeleton
AgriEmpty
AgriError
AgriPagination
AgriDateRange
```

## AI 组件

```text
AssistantComposer
AssistantMessage
AssistantWidgetRenderer
AssistantSuggestionChip
EntityMentionPicker
SlashCommandMenu
ActionConfirmationCard
ReasonEvidenceCard
StreamingStatus
```

## 工作台组件

```text
FarmWorkspaceShell
FarmTopBar
FarmViewSwitcher
AerialFarmMap
ThreeFarmScene
FarmBusinessDock
FarmSceneToolbar
FarmContextDrawer
FarmEntityLabel
FarmEntityHoverCard
FarmSceneLayerManager
FarmSceneTransition
DigitalTwinAssetLoader
DigitalTwinCameraController
WorkspaceSnapshotPanel
WorkspacePresentationControls
```

## 农业组件

```text
MetricPill
StatCard
CropCard
FieldCard
DeviceCard
AlertCard
TaskCard
ReportCard
WeatherCard
AiSuggestionCard
FarmMap
FieldPolygon
MapMarker
MapToolbar
FieldDrawer
AnalysisLens
FarmTimeline
ResourceFlow
LiveCameraWidget
CameraGridWidget
VisionEventList
VisionEventDrawer
VisionDetectionOverlay
VisionLayerControl
CameraTree
CameraPlaybackTimeline
GreenhouseHeatmap
CropVisionAnalysisCard
PersonCountCard
VisualDeviceVerificationCard
VisionEnvironmentCorrelation
IrrigationPipeLayer
EnvironmentHeatmapLayer
CameraCoverageLayer
DeviceMarkerLayer
CropStatusLayer
AlertPulseLayer
RobotPathLayer
```


---

# 18. 状态管理

## appStore

- 侧边栏；
- 主题；
- 全屏；
- 当前模式；
- 全局加载。

## assistantStore

- 会话；
- 消息；
- 流式状态；
- 当前引用；
- 推荐问题。

## workspaceStore

- 当前农场工作台；
- 实景/数字孪生模式；
- 当前业务 Dock 模块；
- 当前选中对象；
- 上下文抽屉；
- 场景图层；
- 时间范围；
- 保存视图；
- 演示模式。

## farmStore

- 农场列表；
- 当前农场；
- 地块与大棚；
- 2D 坐标；
- 3D 坐标、旋转和缩放；
- 模型资源地址；
- 设备和摄像头关系；
- 当前环境指标；
- 场景对象状态。

## alertStore

- 告警；
- 当前告警；
- 处理状态；
- 模拟恢复进度。


## visionStore

- 大棚与摄像头列表；
- 当前摄像头；
- 实时/回放模式；
- 当前播放时间；
- 识别图层开关；
- 视觉事件；
- 当前事件；
- 人员计数；
- 作物异常；
- 设备视觉核验；
- 视频与传感器关联数据；
- Mock 识别播放状态。

---

# 19. Mock 与演示数据

当前阶段使用本地 Mock：

- 每 3 秒小幅更新环境数据；
- 模拟告警；
- 模拟设备状态；
- 模拟 AI JSON；
- 模拟工作台保存；
- 模拟流式回复；
- 使用本地大棚视频模拟实时监控；
- 模拟人员、作物、病虫害、设备和安全事件；
- 模拟识别框、活动轨迹和置信度；
- 模拟视频事件与环境/设备数据交叉验证；
- 模拟异常事件处理与恢复；
- 提供农场对象 2D 与 3D 坐标；
- 提供低多边形大棚、道路、建筑和设备占位模型；
- 模拟实景/数字孪生视图切换；
- 模拟 Dock 图层切换；
- 模拟对象选中、镜头聚焦和上下文抽屉；
- 模拟灌溉水流、风机旋转、机器人移动和告警脉冲。

波动范围：

```text
温度 ±0.3℃
空气湿度 ±1%
土壤湿度 ±0.5%
NDVI ±0.01
设备功率 ±3%
```

至少支持以下预设输入：

```text
分析今日农场状态
查看1号温室湿度
查看最近7天温度
比较1号和2号温室
查看异常设备
生成灌溉建议
分析湿度偏低原因
预测本周番茄产量
生成农场日报
创建日常监测工作台
创建灌溉工作台
创建答辩展示工作台
看看1号大棚现在有什么异常
调出2号大棚西侧摄像头
查看今天检测到的所有作物异常
找出风机运行但叶片不转的设备
创建大棚视觉监测工作台
```

---

# 20. 页面与组件状态

必须设计：

```text
Loading
Empty
Error
Permission
Offline
Stale Data
Partial Data
Camera Offline
Video Loading
AI Vision Paused
Low Confidence
Event Processing
False Positive
3D Scene Loading
3D Asset Missing
WebGL Unsupported
Low FPS
Aerial Map Missing
```


工作台卡片还需支持：

```text
刷新中
数据过期
跟随全局筛选
已锁定
配置错误
```

---

# 21. 响应式策略

## 1440px 以上

### 智能问农

- 完整左侧会话栏；
- 中央输入框和对话流；
- 顶部模式切换。

### 数据工作台

- 不显示左侧栏；
- 农场场景全宽；
- Dock 完整显示图标和文字；
- 右侧上下文抽屉宽 360–420px；
- 支持完整 3D 交互。

## 1200–1439px

- 智能问农侧栏可收起；
- 数据工作台 Dock 适当缩小；
- 抽屉宽度约 340px；
- 场景标签减少次要信息。

## 992–1199px

- 智能问农侧栏默认折叠；
- 数据工作台仍无侧边栏；
- Dock 只显示图标和短标签；
- 抽屉覆盖在场景上；
- 3D 场景降低阴影和模型细节。

## 768px 以下

- 智能问农侧栏改为抽屉；
- 数据工作台以实景模式为默认；
- 3D 模式可选但降低模型数量；
- Dock 改为横向可滑动或 4 个核心入口；
- 上下文抽屉改为底部 Sheet；
- 场景标签只显示名称和状态。

# 22. 开发阶段

## 第一阶段：设计系统与双模式框架

- 田言耕智品牌；
- Tokens；
- 全局样式；
- 智能问农左侧栏；
- 顶部模式切换；
- 数据工作台无侧边栏框架；
- Router；
- Pinia。

## 第二阶段：智能问农

- 欢迎页；
- 对话流；
- 输入框；
- 快捷命令；
- @ 引用；
- Widget Renderer；
- Mock 解析器；
- 回答到农场对象的跳转。

## 第三阶段：2.5D 农场工作台

- 航拍底图；
- SVG 地块；
- 对象标签；
- Hover/Click；
- 右侧上下文抽屉；
- 液态玻璃业务 Dock；
- 监控、环境、设备、灌溉、作物和告警图层。

## 第四阶段：3D 数字孪生

- Three.js 或 TresJS；
- 地形、道路、地块和大棚基础模型；
- 镜头控制；
- 对象选择；
- CSS2D 标签；
- 实景/数字孪生切换；
- 状态共享；
- GLB/GLTF 资产加载；
- 性能优化。

## 第五阶段：专业核心页

- 环境；
- 灌溉；
- 作物；
- 病虫害；
- 设备；
- 大棚 AI 视觉监测中心；
- 视频与传感器交叉验证。

## 第六阶段：扩展、闭环与优化

- 无人机；
- 机器人；
- 任务；
- 库存；
- 溯源；
- 分析；
- 报告；
- 告警闭环；
- 时间回放；
- 决策沙盘；
- 响应式；
- README；
- Build 修复。

# 23. MVP 优先级

## P0 必须完成

- 田言耕智品牌与设计系统；
- 智能问农极简首页；
- 智能问农左侧栏定稿；
- 顶部双模式切换；
- 数据工作台取消侧边栏；
- 全屏 2.5D 农场地图；
- 地块、设备和摄像头点选；
- 右侧上下文抽屉；
- 底部液态玻璃业务 Dock；
- 监控、环境、设备、灌溉、作物、告警图层；
- Mock 自然语言解析；
- 大棚视觉监控基础页面。

## P1 重点亮点

- 实景/数字孪生切换；
- 可交互 Three.js 低多边形农场；
- 场景和抽屉联动；
- 场景和大棚监控联动；
- 环境热力图；
- 灌溉水流动画；
- 告警脉冲；
- 机器人移动；
- 视频与环境数据交叉验证；
- 农场时间回放。

## P2 扩展

- 高质量 GLB 模型替换；
- 大棚内部模式；
- 决策沙盘；
- 数字种子；
- 年度年轮；
- 无人机巡检胶卷；
- 消费者溯源。

# 24. 答辩演示主线

```text
登录田言耕智
→ 进入智能问农
→ 展示极简聊天首页和自然语言输入
→ 输入“今天农场有什么需要注意”
→ 返回告警摘要和地块定位入口
→ 点击“在数据工作台中查看”
→ 切换到无侧边栏的全屏农场实景
→ 自动定位2号温室
→ 点击环境 Dock
→ 开启土壤湿度图层
→ 打开右侧上下文抽屉
→ 展示湿度异常原因
→ 点击“数字孪生”
→ 场景平滑切换到真实可交互3D模型
→ 保持2号温室和环境图层不变
→ 旋转、缩放并双击进入温室聚焦模式
→ 点击监控 Dock
→ 选择摄像头并打开AI视觉事件
→ 展示“风机上报运行但视觉未转动”
→ 创建维修任务
→ 点击灌溉 Dock
→ 显示管网和水流动画
→ 模拟执行滴灌方案
→ 湿度恢复、告警关闭
→ 切回总览并展示完整农场
```

这条主线重点体现：

- ChatGPT 式低学习成本；
- 农场中心化工作台；
- 无侧边栏沉浸界面；
- 液态玻璃业务 Dock；
- 2.5D 与 3D 状态连续切换；
- 大棚视觉识别；
- 环境、设备、监控和告警闭环。

# 25. 大棚 AI 视觉监测模块验收清单

## 页面

- 大棚和摄像头树可切换；
- 支持单画面、四宫格和九宫格视觉状态；
- 实时和回放模式视觉完整；
- 视频底部控制栏完整；
- 右侧视觉事件流可筛选；
- 事件详情抽屉完整；
- 摄像头离线、视频加载失败和无事件状态完整。

## 识别叠加

- 人员、作物、病虫害、设备和安全图层可开关；
- 至少准备 8 类 Mock 视觉事件；
- 识别框、标签、置信度与时间轴事件一致；
- 点击事件可定位视频时间；
- 点击识别框可展开详情。

## 数据联动

- 视觉事件关联大棚和地图；
- 视觉事件关联环境指标；
- 设备状态与视觉状态可进行不一致核验；
- 可从事件创建巡检或维修任务；
- 可标记误报；
- 可固定到工作台；
- 可加入报告和告警中心。

## 智能问农

至少识别以下指令：

```text
看看1号大棚现在有什么异常
调出2号大棚西侧摄像头
查看今天检测到的所有作物异常
找出风机运行但叶片不转的设备
对比上午和下午的作物覆盖情况
创建大棚视觉监测工作台
```

---

# 26. 验收标准

## 视觉

- 自然农业风格统一；
- 不使用传统蓝色后台；
- 不使用纯黑 ChatGPT 皮肤；
- Harvesta 式高级感明显；
- 数据卡可读；
- 玻璃效果克制；
- 荧光色不滥用。

## 页面

- 39 个页面可访问；
- 智能问农和农场中心化工作台为主入口；
- 智能问农左侧栏保持极简；
- 数据工作台无左侧侧边栏；
- 数据工作台无固定右侧信息流；
- 页面不是空壳；
- 专业页面具备完整内容结构。

## 交互

- 自然语言可生成 Widget；
- Widget 可固定到工作台；
- 智能问农可定位农场对象；
- 实景与数字孪生可切换并保持上下文；
- 3D 场景可旋转、平移、缩放和选择对象；
- Dock 可切换监控、环境、设备、灌溉、作物和告警图层；
- 地图、3D场景与上下文抽屉联动；
- 告警闭环可演示；
- 大棚监控支持识别叠加层、事件时间线和录像定位；
- 视觉事件可与环境、设备、地图和任务联动；
- 大棚视觉监测 Widget 可固定到工作台；
- 演示模式可用。

## 工程

- Vue 3 + TypeScript；
- Three.js 或 TresJS 场景结构清晰；
- 2D 与 3D 共用状态；
- GLB/GLTF 资产可替换；
- API 和类型独立；
- Mock 独立；
- 组件职责清晰；
- `npm run build` 通过；
- README 完整。

---

# 27. Codex 执行提示词

```text
请完整阅读《田言耕智_AI原生智慧农业平台完整方案_V3.0_当前界面定稿版.md》。

当前界面设计已定稿，开发时必须优先遵守以下要求：

一、品牌与双模式
1. 平台名称统一为“田言耕智”。
2. 顶部中央设置“智能问农 / 数据工作台”模式切换。
3. 两种模式使用不同页面外壳，不要共用同一个侧边栏布局。

二、智能问农界面
1. 采用 ChatGPT 式极简结构。
2. 左侧栏只保留：新聊天、文件库、项目、更多、最近聊天和底部用户身份。
3. 左侧栏右上设置搜索和收起按钮。
4. 中央只显示欢迎语、输入框和少量推荐问题。
5. 右侧不得预先显示任何卡片、地图、AI 助手或告警。
6. 只有用户输入后，回答区域才生成数据、图表、地图和分析内容。

三、数据工作台界面
1. 完全取消左侧侧边栏。
2. 完全取消右侧固定告警、AI助手、用水趋势等卡片。
3. 取消顶部统计卡和底部默认图表。
4. 页面主体必须是全屏农场空间。
5. 默认使用2.5D航拍农场，可切换到真实可交互3D数字孪生。
6. 点击地块、设备、摄像头或告警后，才从右侧打开上下文抽屉。
7. 右下角不得设置独立AI助手悬浮按钮。

四、底部业务Dock
1. 使用液态玻璃效果。
2. 只保留：总览、监控、环境、设备、灌溉、作物、告警。
3. Dock用于切换场景图层，不是普通路由菜单。
4. 选中项使用深绿色实体状态。

五、3D数字孪生
1. 使用Three.js或TresJS实现真实WebGL场景，禁止用一张2D图片冒充3D。
2. 支持旋转、平移、缩放、单击选择和双击聚焦。
3. 第一阶段可使用基础几何体和低多边形模型。
4. 支持加载GLB/GLTF模型，后续可替换为高质量资产。
5. 实景与3D切换时必须保留当前地块、业务模块、图层、时间范围和抽屉状态。
6. 3D场景至少包含地形、道路、地块、大棚、水池、仓库、泵房、气象站、摄像头、设备、机器人和灌溉管线。
7. 实现环境热力图、灌溉水流、告警脉冲和机器人移动等基础动画。

六、工程要求
1. 使用Vue 3、TypeScript、Vite、Vue Router、Pinia、SCSS、ECharts和Three.js/TresJS。
2. 自然语言先使用关键词、预设意图和Mock JSON。
3. AI输出必须通过固定Widget组件渲染，禁止执行模型生成的HTML、Vue或JavaScript。
4. 所有页面必须有Loading、Empty、Error和资源缺失状态。
5. 每完成一个阶段运行类型检查与npm run build。
6. 不要删除用户已有代码，优先增量重构。
7. 最终README必须说明2.5D/3D切换、模型资源目录、交互方式和演示流程。

开发顺序：
1. 设计系统与双模式框架；
2. 智能问农定稿界面；
3. 2.5D农场中心化工作台；
4. 液态玻璃业务Dock与上下文抽屉；
5. Three.js/TresJS数字孪生场景；
6. 监控、环境、设备、灌溉、作物和告警图层；
7. 大棚AI视觉监测；
8. 专业详情页、响应式、状态和README。
```


---

# V3.1 更新内容：大棚内部数字孪生与空间化管理升级

> 本版本基于 V3.0 当前界面定稿版进行增量修改，不推翻原有双模式入口、农场中心化工作台和 3D 数字孪生架构。

## 1. 核心升级方向

V3.0 已完成：

- 智能问农模式；
- 数据工作台模式；
- 农场中心化空间界面；
- 实景/数字孪生切换；
- 液态玻璃业务 Dock；
- 地块、设备、环境、监控联动。

V3.1 新增：

> 从“农场级数字孪生”进一步深入到“单个大棚内部数字孪生”。

新的空间层级：

```
农场总览
    ↓
选择大棚
    ↓
进入大棚内部空间
    ↓
查看种植区域
    ↓
查看作物、设备、环境和视觉事件
```

---

# 2. 新增大棚内部页面

## 页面定位

大棚内部页面不是普通详情页，而是一个独立的空间工作台。

用户点击：

```
1号番茄温室
```

进入：

```
1号番茄温室数字孪生空间
```

页面以：

- 大棚内部实景；
- 大棚内部3D模型；
- 摄像头；
- 设备；
- 作物区域

作为主要内容。

---

# 3. 大棚内部界面布局调整

整体结构：

```
顶部状态栏

返回农场
当前大棚名称
健康度
环境状态


中央区域

大棚内部实景 / 3D模型


右侧上下文面板

概况
环境
作物
设备
任务
告警


底部液态玻璃 Dock

生长
灌溉
环境
监控
设备
AI诊断
分析
```

---

# 4. 大棚内部数字孪生

支持两种模式：

## 4.1 实景模式

数据来源：

- 摄像头；
- 大棚图片；
- 视频流。

显示：

- 种植区域；
- 设备位置；
- 摄像头覆盖范围；
- 异常位置。


## 4.2 3D模式

采用：

- Three.js / TresJS；
- GLTF / GLB模型。


模型包括：

```
温室结构

├── 种植架
├── 作物
├── 水肥管路
├── 风机
├── 补光灯
├── 摄像头
├── 传感器
└── 控制设备
```

---

# 5. 种植区域管理

大棚内部划分：

例如：

```
1号番茄温室

├── A区
├── B区
└── C区
```

点击区域显示：

## 作物信息

- 品种；
- 面积；
- 生长阶段；
- 健康指数；
- 长势趋势；
- 预计采收时间。


示例：

```
樱桃番茄

面积:
120㎡

阶段:
开花期

健康:
92

AI建议:
增加补钙
```

---

# 6. 环境数据升级

环境数据从农场级下降到区域级。

支持：

- 温度；
- 空气湿度；
- CO₂；
- 光照；
- VPD；
- 风速；
- 土壤湿度；
- EC值。


新增：

环境空间图层：

```
温度热力图

湿度热力图

CO₂分布图

光照分布图
```

---

# 7. 设备空间绑定

设备不再只存在设备列表中。

每个设备绑定空间坐标：

```
设备
 ↓
大棚
 ↓
区域
 ↓
具体位置
```

支持：

- 风机；
- 水肥机；
- 补光灯；
- 阀门；
- 摄像头；
- 传感器。


点击设备：

显示：

```
循环风机01

状态:
运行

运行时间:
320h

健康:
正常

最近维护:
2026-07-20
```

---

# 8. 大棚AI视觉监测融合

新增：

大棚内部视觉智能模块。

功能：

## 作物识别

- 生长状态；
- 萎蔫检测；
- 病虫害风险；
- 叶片异常。


## 设备视觉检测

例如：

系统：

```
风机状态：运行
```

视觉：

```
叶片未转动
```

AI判断：

```
疑似设备故障
```

---

# 9. AI诊断闭环

新增流程：

```
摄像头发现异常

↓

结合环境数据

↓

结合设备状态

↓

AI分析原因

↓

生成处理建议

↓

创建任务

↓

完成闭环
```

---

# 10. 前端新增组件

新增：

```
GreenhouseWorkspace

├── GreenhouseScene
├── GreenhouseModel
├── CropLayer
├── DeviceLayer
├── CameraLayer
├── EnvironmentHeatmap
├── IrrigationLayer
├── VisionEventLayer
├── GreenhouseDrawer
└── GreenhouseDock
```

---

# 11. 后端新增数据模型

## Greenhouse

```json
{
"id":1,
"name":"1号番茄温室",
"modelUrl":"greenhouse.glb",
"area":1200
}
```


## GreenhouseZone

```json
{
"id":1,
"name":"A区",
"crop":"番茄",
"health":92
}
```


## CropGrowthRecord

保存：

- 高度；
- 健康度；
- 生长阶段；
- 历史趋势；
- 预测数据。


---

# 12. Codex开发说明

Codex可以完成：

- Vue页面开发；
- Three.js场景框架；
- GLB模型加载；
- 交互逻辑；
- 数据绑定；
- 动画效果。


需要额外准备：

- 高质量农场模型；
- 大棚模型；
- 作物模型；
- 真实视频素材。


---

# 13. V3.1最终系统结构

```
田言耕智

├── 智能问农
│
├── 农场数字孪生
│
│    ├── 农场总览
│    │
│    └── 大棚内部数字孪生
│          │
│          ├── 作物
│          ├── 环境
│          ├── 设备
│          ├── 灌溉
│          ├── 视频
│          └── AI诊断
│
└── 专业业务页面
```

本版本保持 V3.0 的整体设计语言，只增加空间深度，实现：

```
看农场
→ 看大棚
→ 看区域
→ 看作物
→ 看设备
→ AI辅助决策
```
