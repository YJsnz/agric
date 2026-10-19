# Ubuntu 云主机演示部署

本目录用于把盐田丰语打包后部署到通用 x86_64 Ubuntu 云主机。该方案不依赖 CUDA、TensorRT 或 Jetson；Agent 通过远程 OpenAI 兼容模型接口运行。部署后由 Java 托管网站和业务 API，MySQL 保存业务数据，Neo4j 为多作物知识服务提供图数据，Node.js Harness 执行 Agent 工具，Python ONNX Runtime 执行 CPU 视觉推理。

## 主机规格与网络

建议 Ubuntu 22.04 或 24.04、x86_64、4 vCPU、16 GB 内存和 60 GB 系统盘。安装时会构建前端与 Java 服务、安装 Python/Node 依赖、下载约百 MB 的 BGE 嵌入模型并首次导入 Neo4j 数据，因此首次部署需要稳定的外网访问和可用磁盘空间。8 GB 内存可能启动基础页面，但多作物模型与数据库同时运行时余量有限。

云防火墙只开放 TCP 22 和 80；DNS 指向主机后再通过 Certbot 配置 HTTPS，并开放 TCP 443。不要开放 3307、7474、7687、8081 或 8090，这些端口只绑定主机回环地址或由防火墙限制。需要浏览器摄像头时必须使用 HTTPS；IP 地址上的 HTTP 页面不满足摄像头安全上下文要求。

## 生成部署包

在 Windows 项目根目录运行：

```powershell
.\deploy\cloud\package.ps1
```

包生成在 `target/agric-cloud-时间戳.tar.gz`。脚本从当前工作区收集 Git 跟踪文件和未忽略的新增文件，纳入梨叶 ONNX 模型及多作物运行所需模型；省略训练数据集、Jetson 文件、缓存、虚拟环境和 `.env.local`。真实密钥不会进入部署包。包内根目录为 `current/`，可直接解压到服务器的 `/opt/agric/`。

若本机没有 `vision-runtime/models/pear-leaf.onnx`，打包会失败并指出缺失文件。模型权重受 Git 忽略规则排除，但部署包会显式收录这份运行模型。

## 上传与安装

将生成的压缩包上传至 Ubuntu 主机。以下示例中的 SSH 用户、IP 地址和文件名按实际情况替换：

```powershell
$package = Get-ChildItem .\target\agric-cloud-*.tar.gz |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
scp $package.FullName ubuntu@SERVER_IP:/tmp/agric-cloud.tar.gz
ssh ubuntu@SERVER_IP 'sudo install -d -o ubuntu -g ubuntu /opt/agric'
ssh ubuntu@SERVER_IP 'sudo tar -xzf /tmp/agric-cloud.tar.gz -C /opt/agric'
ssh ubuntu@SERVER_IP 'sudo bash /opt/agric/current/deploy/cloud/install.sh'
```

安装脚本要求在 `/opt/agric/current` 下以 root 身份运行。它会安装 JDK 17、Node.js 24、Python、Docker Compose、Nginx 和 Certbot；建立专用 `agric` 服务账户；创建 Python 虚拟环境并安装依赖；构建三套前端与 Spring Boot JAR；准备 Harness 与本地模型文件；下载 BGE 嵌入模型；生成随机数据库密码和 JWT 密钥；启动 MySQL/Neo4j 并把项目知识图谱导入 Neo4j。首次运行需较长时间，安装日志会显示当前阶段。

第一次安装会创建 `/etc/agric/cloud.env`，权限为 `0640 root:agric`。尚未配置模型 API Key 时，安装会准备依赖、数据库和 systemd/Nginx 服务，但不会启动 Java 应用。编辑服务器配置文件：

```bash
sudoedit /etc/agric/cloud.env
```

至少填写有效的模型服务地址、模型名和 API Key：

```dotenv
AGENT_BASE_URL=https://api.deepseek.com/v1
AGENT_MODEL=deepseek-chat
AGENT_API_KEY=你的模型服务密钥
```

Agent 和多作物问答共用上述模型配置。不要复制本机 `.env.local`，也不要把真实密钥写入仓库或部署包。配置完成后启动应用：

```bash
sudo systemctl enable --now agric
sudo systemctl status agric agric-cloud-stack --no-pager
curl -fsS http://127.0.0.1:8081/api/health
```

访问 `http://SERVER_IP/`，注册演示账号并打开 `/platform/`。系统环境诊断、Agent 和多作物页面依赖分别检查实际模型、数据库与 Python worker 状态；`/api/health` 只代表 Java HTTP 服务可用。

## 配置 HTTPS

先将域名的 DNS A 记录指向主机，再运行：

```bash
sudo sed -i 's/server_name _;/server_name demo.example.com;/' /etc/nginx/sites-available/agric
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d demo.example.com
sudo certbot renew --dry-run
```

按提示填写邮箱并允许 HTTP 自动跳转 HTTPS。确认云防火墙已开放 TCP 443 后，通过 `https://demo.example.com/` 演示。摄像头访问和跨网络登录应使用 HTTPS 域名。

## 更新部署

先生成并上传新的压缩包，再在服务器执行：

```bash
sudo systemctl stop agric
sudo tar -xzf /tmp/agric-cloud.tar.gz -C /opt/agric
sudo bash /opt/agric/current/deploy/cloud/install.sh
```

已有 `/etc/agric/cloud.env` 会保留，数据库 Docker volumes 与 `/var/lib/agric/vision` 中的文件不会被重建。安装脚本仅在尚未初始化时导入 Neo4j 初始数据。更新后检查 `systemctl status agric agric-cloud-stack` 与应用日志。

## 日常运维

```bash
sudo journalctl -u agric -f
sudo journalctl -u agric-cloud-stack --no-pager
sudo docker compose --env-file /etc/agric/cloud.env \
  -f /opt/agric/current/deploy/cloud/compose.yaml ps
curl -fsS http://127.0.0.1:8081/api/health
```

MySQL 与 Neo4j 数据分别保存在 Docker volumes；视觉文件保存在 `/var/lib/agric/vision`。试用结束前使用项目备份功能导出业务数据库及视觉文件，再从云控制台删除不再需要的实例、磁盘和公网 IP。不要直接删除数据库 volumes 来处理应用升级。

## 演示限制

该配置面向软件展示：账号注册默认开放，JPA 使用 `ddl-auto=update`，没有生产级租户隔离、数据库迁移或完整运维加固。仅使用演示数据，不录入真实用户、农场或设备信息。云主机不运行本地大模型；模型 API 费用由模型服务方另行计费。多作物视觉模型只提供已有模型输出，不代表作物病害确诊或生产处置建议。
