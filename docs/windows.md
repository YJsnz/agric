# Windows 启动指南

支持 Windows 10/11、Windows PowerShell 5.1 和 PowerShell 7。无需 Git Bash 或 WSL 终端。

## 准备环境

安装 JDK 17 或更新版本（必须包含 javac）、Node.js LTS、Git 和 Docker Desktop。Docker Desktop 使用 Linux 容器模式，启动后等待引擎就绪。安装后重新打开终端，确保 `java -version`、`javac -version`、`node --version` 和 `docker info` 正常。

首次构建需要联网下载 npm 和 Maven 依赖、MySQL 镜像。Maven 使用仓库自带的 `mvnw.cmd`，无需单独安装。

## 一键运行

在项目根目录双击 `start.cmd`，或在 PowerShell 执行：

```powershell
.\start.cmd
```

脚本自动创建并启动 MySQL，使用 lockfile 安装两套前端依赖并构建，再启动 Spring Boot。看到后端 Started 日志后访问 http://localhost:8081/，平台位于 http://localhost:8081/platform/。按 Ctrl+C 停止后端，数据库继续运行并保留数据。

Windows 默认容器 `agric-mysql`、数据卷 `agric-mysql-data`、数据库 `tianyan`，宿主机端口 `3307`，仅绑定本机。这样可以与已有的 3306 数据库共存。不会读取或删除其他项目的容器。默认密码为 `Root_123456`，仅用于本地演示。

```powershell
.\start.cmd -SkipBuild       # 已有前端产物时仅启动后端
.\start.cmd -Check           # 检查工具、初始化数据库和检查后端端口
.\setup-mysql.cmd            # 单独初始化数据库
docker stop agric-mysql      # 停止数据库，数据保留
```

这些 CMD 入口为本次脚本进程设置 ExecutionPolicy Bypass，不修改系统执行策略。也可直接执行 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start.ps1`。

## 本机配置与已有数据库

按需将 `.env.example` 复制为 `.env.local`，填写配置。文件已被 Git 忽略。脚本支持空行、注释、`KEY=VALUE` 和成对引号；值按字面量读取，不执行命令、不展开变量。文件内配置覆盖当前进程的同名环境变量。第三方 API Key 可留空，AI 在线回答和人脸识别需要自己的有效密钥。

使用已有数据库时设置 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`，数据库须提前创建，然后运行：

```powershell
.\start.cmd -ExternalDatabase
```

此模式无需 Docker。自定义 Docker 端口可设置 `MYSQL_PORT`，脚本自动生成 JDBC 地址；显式设置的 `DB_URL` 优先。更改容器名、数据卷、数据库名可使用 `MYSQL_CONTAINER`、`MYSQL_VOLUME`、`DB_NAME`。已有容器的端口映射和密码不会被改写，配置必须与其实际值一致。更改 `.env.local` 中密码不能改变已初始化数据卷里的 MySQL 密码。

## 开发与测试

前端独立开发仍使用 `npm.cmd ci` 和 `npm.cmd run dev`，分别在 landing 与 frontend 目录执行，地址为 5174 和 5173。开发代理默认连接 8081 后端；自定义后端端口时设置 `VITE_API_TARGET=http://localhost:你的端口`。

后端测试依赖真实 MySQL。在根目录 PowerShell 中读取相同配置并初始化数据库，再执行 Maven：

```powershell
. .\scripts\windows-common.ps1
Import-LocalEnvironment
Initialize-MySql
.\test.ps1
.\mvnw.cmd package
```

`test.ps1` 自动创建独立 `tianyan_test` 数据库，并通过 TEST_DB_URL 运行测试，避免测试上下文影响正在运行的 Agent。使用外部数据库时填写 TEST_DB_URL、TEST_DB_USERNAME 和 TEST_DB_PASSWORD。直接执行 Maven 测试也使用独立测试地址，须提前创建对应数据库。

## 本地农业 Agent

新问农入口为 `/platform/assistant`，原工作台保留在 `/platform/assistant/legacy`。安装并启动 Ollama，执行 `ollama pull qwen2.5:7b` 下载默认模型；已有模型无需重复下载。可通过 AGENT_BASE_URL、AGENT_MODEL 和 AGENT_API_KEY 配置兼容的本地服务。

任务真实调用农场查询、关键词资料检索和环境阈值核验三个工具。任务与过程存入 MySQL，可刷新后读取、取消和查看失败记录。当前任务事件采用增量轮询，服务重启后的未完成任务标记失败，保留记录供重新发起。这里使用原项目共享演示数据，尚未实现 GraphRAG、病害概率、采后执行或真实设备控制。

## 常见问题

- Docker 连接失败：打开 Docker Desktop，确认 Linux 引擎运行。
- 数据库端口冲突：首次创建前设置 `MYSQL_PORT`。已有容器的映射需要另行调整，脚本不会自动删除容器或数据。
- 数据库认证失败：检查容器对应的实际密码，执行 `docker logs agric-mysql --tail 50`。脚本通过 SQL 登录验证就绪，而非仅检查端口。
- 后端端口占用：停止已有服务或设置 `SERVER_PORT`。
- Java/JAVA_HOME 错误：JAVA_HOME 应指向 JDK 根目录，PATH 应包含其 bin，不能指向 JRE。
- 下载失败：检查网络和 npm/Maven 仓库连通性；修复网络后重新启动。安装或构建失败时脚本立即停止。
- 项目目录含空格、中文：从 CMD 入口或 PowerShell 入口启动，脚本按自己的位置定位项目，无需先切换目录。

Linux/macOS 继续使用原有 `setup-mysql.sh` 和 `start.sh`，其默认数据库端口仍为 3306。

## 鸭梨视觉

安装 Python 3.11 后，正常 Windows 启动会执行 `setup-vision.ps1`，首次下载固定梨叶权重并转换为本地 ONNX。也可单独双击 `setup-vision.cmd`。推理在 CPU 执行，不依赖 Ollama；Agent 解读仍需要配置的语言模型服务。数据工作台的独立「病虫害」支持上传叶片、公开样例和内置 / USB 摄像头采样，「监控」保留原窗口设计，「3D」支持地块联动。摄像头要求 localhost 或 HTTPS，并由用户主动开启。配置与模型许可见 [鸭梨视觉与3D](鸭梨视觉与3D.md)。

## 观测历史

启动后每 30 秒保存一次农场级演示观测；人工模拟调整与模拟灌溉也记录来源。数据面板的观测页支持指标切换、曲线、来源明细和 JSON 导出。首次启动不会补造历史，数据库保留记录供重启后查询。接口 GET /api/farms/{farmId}/observations?metricKey=soilMoisture 返回最近最多 240 条，按采集时间升序；查询须登录。Agent 环境核验工具携带墒情历史。当前不支持真实传感器历史导入、地块级时序或生产数据质量审核。
