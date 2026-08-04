# 田言耕智 · 数据工作台主界面

本仓库当前由团队协作开发。本模块负责“数据工作台”主界面，视觉基线为 `docs/主界面.png`，实现全屏农场场景、空间对象交互与 2.5D/3D 双视图。

## 官网与平台（同源部署）

本仓库由 Spring Boot 单进程托管两个前端：

| 入口 | 路径 | 技术栈 | 源码 | 构建输出 |
|---|---|---|---|---|
| 官网（多页营销站） | `/`、`#/product`、`#/solutions`、`#/digital-twin`、`#/about`、`#/contact`、`#/sign-in`、`#/sign-up` | React 18 + Tailwind + lucide-react + react-router | `landing/` | `src/main/resources/static` 根目录 |
| 智慧农业平台 | `/platform/` | Vue 3 + Vite + Three.js | `frontend/` | `src/main/resources/static/platform` |

官网首页为全屏背景视频 hero，导航栏提供「产品 / 解决方案 / 数字孪生 / 关于我们」四个独立营销页（HashRouter 路由，`#/xxx`）；「进入平台」等按钮指向 `/platform/`，实现“官网 → 平台”的站内联动跳转。`/platform`、`/platform/` 及 `/platform/**` 深链由 `PlatformSpaForwardController` / `PlatformSpaForward` 转发到平台首页。登录、人脸识别、AI 助手和数据主界面均已接入 Spring Boot 后端。

数据主界面没有连接真实传感器，后端会初始化一套“智慧农场01”虚拟数据，并每 30 秒生成新的环境读数写入 MySQL。设备开关和灌溉控制会真实持久化，刷新页面后状态仍保留。相关表为 `farm_assets`、`farm_devices`、`environment_metrics`、`irrigation_units` 和 `farm_alerts`；接口均受 JWT 保护：

- `GET /api/farms/farm-01/dashboard`：获取主界面完整快照；
- `PATCH /api/farms/farm-01/devices/{entityId}`：控制设备开关；
- `PATCH /api/farms/farm-01/irrigation/{unitId}`：控制灌溉并保存时长；
- `POST /api/farms/farm-01/devices/{entityId}/self-test`：执行在线设备自检；
- `PATCH /api/farms/farm-01/alerts/{alertId}/handle`：处理告警并持久化状态。

## 已实现

- 全屏智慧农场航拍实景，独立场景底图位于 `frontend/public/assets/farm-aerial.png`；
- 顶部品牌、农场选择、主模式切换、搜索、时间、通知和全屏控制；
- 天气悬浮卡和农场空间对象标签；
- 地块、温室、气象站、蓄水池、设备、摄像头和机器人点选；
- 温室与露天地块按航拍轮廓建立多边形热区，Hover 时描边、提亮并展示作物、面积、生长阶段和环境摘要；
- 实景与 3D 共用对象 ID 和空间坐标，Hover 预览、单击详情、双击聚焦状态可连续传递；
- 实景与真实 Three.js WebGL 数字孪生切换；
- 3D 场景组合 8 个本地 GLB 农业公模，并包含加载进度、模型自动归一化、软阴影、起伏地形、树阵和温室内部作物；
- 3D 场景提供第一人称巡场模式：WASD 移动、鼠标控制视角、Shift 加速、准星选择设施、Esc 退出；
- 六座温室按业务数据分别种植番茄、草莓、黄瓜、育苗、叶菜和生态番茄，并配有独立运转风机、控制箱、状态屏与指示灯；
- 温室门口设置对应作物的卡通圆形徽章，第一人称近景可快速识别棚内品种；
- 3D 天空按本地真实时间同步昼夜光照、晨昏色温、星空和缓慢移动云层；
- 第一人称支持数字键 `1–7` 快速切换总览、监控、环境、设备、灌溉、作物和告警 Dock；
- Dock 数字角标仅在第一人称巡场时出现；切换业务后，对应可管理单位上方会显示红色三角候选标记；
- 第一人称为温室、建筑、水池、种植区、机器人及水利设备设置碰撞箱，并支持贴边滑动；
- 场景新增本地 CC0 农业 Rover，以及可交互的渠道闸门、控制屏、增压泵组和运行灯；
- 重复作物改为 InstancedMesh 批量渲染，第一人称采用独立像素比、静态阴影按需刷新并降低高频拾取次数；
- 园区道路使用浏览器端轻量化沥青细节、路缘和中心标线，兼顾近景质感与 WebGL 性能；
- 总览、监控、环境、设备、灌溉、作物、告警 7 项液态玻璃 Dock；
- 液态玻璃业务 Dock 使用统一线性 SVG 图标，分别进入总览、园区监控、环境中心、设备管理、灌溉控制、作物档案和告警中心；
- 监控模式支持选择任意温室或种植区，并打开对应实时画面、摄像头切换、AI 分析和录像操作弹窗；
- 监控视频已接入真实 YOLO 离线检测链路，仅训练 `person / crop` 两类；逐帧结果由 ByteTrack 保持目标 ID，并导出 JSON 与视频时间同步显示，训练与标注说明见 `tools/yolo/README.md`；
- 左侧“小田”AI 农业助手使用透明角色素材，悬停时从常规形象自然切换为招手形象，并提供液态玻璃多轮对话面板；
- AI 助手自动携带当前场景、业务模块和选中对象上下文，通过受 JWT 保护的 Spring Boot 接口代理调用 DeepSeek，API Key 不进入浏览器；
- 环境中心直接展示实时指标、24 小时趋势和 AI 调控建议，不改变场景图层；
- 设备中心支持地图选机、在线/异常状态、设备开关、自检与参数入口；
- 灌溉中心显示静态渠道和可控灌溉单元，支持开停、灌溉时长与计划保存；
- 作物中心按温室或地块展示长势、生育阶段、病虫害风险和农事任务；
- 右侧上下文抽屉、详情标签页、设备状态和告警信息；
- 桌面、平板及手机尺寸响应式布局；
- 前端构建产物输出到 Spring Boot 的 `src/main/resources/static`。

## 本地启动

### 一键启动完整 Demo（推荐）

根目录脚本会启动已有的 `mysql` Docker 容器、安装缺失的前端依赖、构建官网与平台，
最后启动 Spring Boot：

```bash
chmod +x start.sh   # 首次执行
./start.sh
```

启动后访问 `http://localhost:8080/`，按 `Ctrl+C` 停止。仅修改 Java 或已经手动构建前端时，
可快速启动：

```bash
./start.sh --skip-build
```

MySQL 容器名不是 `mysql` 时使用 `MYSQL_CONTAINER=你的容器名 ./start.sh`。AI 助手和人脸识别的
Key 仍通过下文所列环境变量按需注入。

环境内 Node 版本为 12，因此依赖已固定到兼容版本。

```bash
cd frontend
npm install
npm run dev
```

打开 `http://localhost:5173/platform/`（平台路由基址为 `/platform/`），默认进入 `/platform/workspaces/farm-01`。官网开发服务器为 `cd landing && npm run dev`，端口 5174。

## 构建

### 平台（Vue，`/platform/`）

```bash
cd frontend
npm run build
```

构建会先执行 Vue/TypeScript 类型检查，再将产物写入 `src/main/resources/static/platform`。平台路由基址为 `/platform/`，因此 `npm run dev` 本地开发时访问 `http://localhost:5173/platform/`。

### 官网（React，`/`）

```bash
cd landing
npm install   # 首次
npm run build
```

构建产物写入 `src/main/resources/static` 根目录，官网访问路径为 `/`。官网开发服务器端口为 5174。

### 启动后端

默认连接本机 Docker MySQL：`localhost:3306/tianyan`，用户名 `root`、密码
`Root_123456`。可通过 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD` 覆盖；部署环境还必须设置
至少 32 字节的 `JWT_SECRET`。

```bash
export JWT_SECRET="请替换为至少32字节的随机密钥"
export DEEPSEEK_API_KEY="你的 DeepSeek API Key"
./mvnw spring-boot:run
```

一个进程同时托管官网（`/`）与平台（`/platform/`）。

平台路由会在进入时调用 `/api/auth/me` 校验登录态；未登录或 JWT 过期会自动返回官网登录页。
登录页的「Keep me signed in」勾选后使用 `localStorage`，未勾选时仅在当前浏览器会话中保持登录。

AI 助手默认使用 `deepseek-v4-flash`。如需切换模型或兼容地址，可在启动前设置：

```bash
export DEEPSEEK_MODEL="deepseek-v4-flash"
export DEEPSEEK_BASE_URL="https://api.deepseek.com"
```

配置只应放在本机环境变量或部署平台的 Secret 中，不要把真实 Key 写进 `application.yaml`。后端接口为 `POST /api/assistant/chat`，平台请求会携带现有 JWT 登录令牌。

## 交互说明

- 悬浮温室或地块：显示与航拍实景匹配的边界及地块信息；
- 点击空间标签或 3D 对象：打开或切换右侧对象抽屉；
- 双击空间标签：聚焦该对象；
- 点击空白场景：关闭对象选择；
- 点击“实景 / 3D”：保留当前 Dock 模块和对象上下文并切换场景；
- 点击 Dock：切换业务对象与图层；
- 环境 Dock 提供温度、空气湿度、土壤湿度、光照和 CO₂ 二级指标；
- 3D 鸟瞰模式支持拖动旋转、滚轮缩放和对象点击；
- 点击 3D 场景右上角“第一人称巡场”，WASD 移动、鼠标观察、Shift 加速、左键选择温室或设备、Esc 返回鸟瞰视角。

## 3D 模型资产

公模统一存放在 `frontend/public/assets/models`，运行时从项目本地加载，不依赖第三方 CDN。当前模型来自 Quaternius，经 Poly Pizza 提供 GLTF 下载，均为 CC0 1.0。完整来源与许可见 `frontend/public/assets/models/LICENSES.md`。

Three.js 会按模型包围盒自动归一化尺寸并落到地面，因此后续替换模型时只需修改 `ThreeFarmScene.vue` 中的资源地址、目标尺寸、位置和旋转值。

## 团队边界

大棚内部以及其他专业业务页面仍由团队其他模块接入。本模块对外共享的核心状态位于 `frontend/src/stores/workspace.ts`，AI 助手实现集中在 `FarmAiAssistant.vue` 与后端 `assistant` 包中，方便后续独立维护。

团队成员首次参与开发前，请阅读 [Git 团队协作手册（Windows）](docs/Git团队协作手册_Windows.md)。
