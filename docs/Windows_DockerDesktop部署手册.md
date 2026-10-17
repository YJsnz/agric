# Windows 与 Docker Desktop 部署

本手册入口已统一到 [Windows 启动指南](windows.md)。项目根目录仅保留 `start.cmd` 作为启动和维护命令入口；启动实现与备份、恢复、测试和发行脚本集中在 `scripts/`。

请按以下顺序操作：

1. 安装 JDK 17+、Node.js 24+、Python 3.11、Docker Desktop（Linux 容器）和 Ollama，启动 Docker。
2. 在仓库根目录运行 `start.cmd`。首次会准备 MySQL、Agent、视觉模型和三个前端，然后启动 Spring Boot。
3. 浏览 `http://localhost:8081/`、`/platform/` 与 `/vision/`。
4. 按需在 `.env.local` 配置数据库、模型和 API 密钥。

常用维护操作：`start.cmd -Task Backup`、`start.cmd -Task Restore ...`、`start.cmd -Task Test`、`start.cmd -Task Release`。参数、已有数据库连接、常见故障和功能限制见 [Windows 启动指南](windows.md) 与 [软件演示交付检查](软件演示交付检查.md)。

Jetson 使用独立 Linux 部署流程，见 [Jetson 部署与验收](Jetson部署与验收.md)。
