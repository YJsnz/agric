# 田言耕智 Windows + Docker Desktop 部署手册

本文面向第一次运行本项目的 Windows 团队成员。部署方式与项目开发机保持一致：使用 Docker Desktop 运行 `mysql:8.4`，再通过项目自带的 `start.sh` 一键构建并启动完整系统。

启动完成后可以访问：

- 官网：`http://localhost:8081/`
- 数据工作台：`http://localhost:8081/platform/`
- 智能问农：`http://localhost:8081/platform/assistant`

## 1. 安装所需软件

需要安装：

| 软件 | 建议版本 | 用途 |
|---|---:|---|
| Git for Windows | 最新稳定版 | 下载代码并提供 Git Bash |
| Eclipse Temurin JDK | 17 | 运行 Spring Boot |
| Node.js | 18 LTS | 构建 React 和 Vue 前端 |
| Docker Desktop | 最新稳定版 | 运行 MySQL 8.4 容器 |
| Chrome 或 Edge | 最新稳定版 | 访问系统和显示 3D 场景 |

官方安装地址：

- Git：<https://git-scm.com/download/win>
- JDK 17：<https://adoptium.net/temurin/releases/?version=17>
- Node.js：<https://nodejs.org/en/download>
- Docker Desktop：<https://www.docker.com/products/docker-desktop/>

安装 JDK 时勾选：

```text
Set JAVA_HOME variable
Add to PATH
```

Git、Node.js 保持默认安装选项即可。

## 2. 启用 WSL 2

Docker Desktop 在 Windows 上推荐使用 WSL 2 后端。以管理员身份打开 PowerShell：

```powershell
wsl --install
```

执行完成后重启电脑。如果系统已经安装 WSL，这条命令会提示已安装，可以继续下一步。

重启后检查：

```powershell
wsl --status
wsl --version
```

如果 `wsl --install` 不可用，请先运行 Windows 更新。学校机房或单位电脑若禁用了虚拟化，需要在 BIOS 中开启 CPU Virtualization，或联系管理员处理。

## 3. 安装和启动 Docker Desktop

安装 Docker Desktop 时保留 `Use WSL 2 instead of Hyper-V` 选项。安装完成后：

1. 启动 Docker Desktop；
2. 接受首次使用协议；
3. 等待左下角或状态栏显示 Docker Engine 正常运行；
4. 在 Settings → General 中确认启用了 WSL 2 engine。

Docker Desktop 登录账号不是运行本项目的必要条件。

打开 PowerShell 或 Git Bash 检查：

```bash
docker version
docker info
```

如果只显示 Client、没有 Server，说明 Docker Desktop 还没有启动完成。

## 4. 下载 main 分支

打开 **Git Bash**，进入准备保存项目的目录：

```bash
git clone -b main --single-branch https://github.com/YJsnz/agric.git
cd agric
```

如果项目已经下载过：

```bash
git switch main
git pull --ff-only origin main
```

确认输出的分支是 `main`：

```bash
git branch --show-current
git status
```

本文后续项目命令均在项目根目录的 **Git Bash** 中运行，不要使用 Windows CMD。

## 5. 创建与开发机一致的 MySQL 容器

项目开发机使用以下配置：

```text
镜像：mysql:8.4
容器名：mysql
端口：3306:3306
数据库：tianyan
用户：root
密码：Root_123456
重启策略：unless-stopped
```

最简单的方式是在项目根目录打开 Git Bash，直接执行：

```bash
chmod +x setup-mysql.sh start.sh mvnw
./setup-mysql.sh
./start.sh
```

`setup-mysql.sh` 可以重复执行：容器不存在时自动拉取并创建，容器存在但停止时自动启动，不会重复创建或清空数据。下面是脚本内部使用的等价 Docker 命令，仅在需要手动排查时使用：

```bash
docker run -d \
  --name mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=Root_123456 \
  -e MYSQL_DATABASE=tianyan \
  -v tianyan-mysql-data:/var/lib/mysql \
  mysql:8.4
```

其中 `tianyan-mysql-data` 是 Docker 数据卷。即使删除并重新创建容器，数据库数据也不会因为容器删除而立即丢失。

检查容器：

```bash
docker ps
docker logs mysql --tail 30
```

`docker ps` 中应看到名为 `mysql` 的容器，状态为 `Up`，端口包含 `0.0.0.0:3306->3306/tcp`。

项目启动后会自动创建数据库表，并初始化“智慧农场01”的演示数据，不需要手动导入 SQL。

## 6. 创建本机密钥配置

在项目根目录的 Git Bash 中执行：

```bash
cp .env.example .env.local
```

使用 VS Code 或记事本打开 `.env.local`，填写：

```dotenv
DEEPSEEK_API_KEY=同学自己的DeepSeek_API_Key
JWT_SECRET=请填写至少32字节且足够随机的字符串

DB_URL=jdbc:mysql://localhost:3306/tianyan?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=Root_123456
MYSQL_CONTAINER=mysql
```

说明：

- 智能问农需要有效的 `DEEPSEEK_API_KEY`，其他页面不依赖它。
- 普通注册和密码登录不需要百度密钥。
- 人脸注册和人脸登录还需要填写 `BAIDU_FACE_AK` 与 `BAIDU_FACE_SK`。
- `.env.local` 已被 Git 忽略，禁止把真实密钥写入 `.env.example`、README、聊天群或 Git 提交。

如果暂时没有 DeepSeek Key，可以保留占位符，但智能问农调用会失败。

## 7. 检查运行环境

在 Git Bash 中执行：

```bash
git --version
java -version
node -v
npm -v
docker version
```

要求：

- `java -version` 显示 17；
- Node.js 和 npm 能显示版本号；
- Docker 同时显示 Client 和 Server 信息；
- Docker Desktop 保持运行。

## 8. 一键启动完整项目

仍在项目根目录的 Git Bash 中执行：

```bash
chmod +x start.sh mvnw
./start.sh
```

脚本会自动：

1. 读取 `.env.local`；
2. 检查并启动名为 `mysql` 的容器；
3. 等待 MySQL 就绪；
4. 首次运行时安装两套前端依赖；
5. 构建 React 官网；
6. 构建 Vue 数据工作台；
7. 启动 Spring Boot 后端。

第一次启动需要下载 npm 和 Maven 依赖，耗时通常比后续启动长。看到类似日志表示启动成功：

```text
Started TyApplication
Tomcat started on port 8081
```

然后访问：

```text
http://localhost:8081/
```

按 `Ctrl + C` 停止 Spring Boot。MySQL 容器可以继续运行；Docker Desktop 下次启动时会根据 `unless-stopped` 策略自动恢复容器。

## 9. 首次功能验证

建议依次验证：

1. 打开官网，确认首页、导航和底部栏正常显示；
2. 注册一个新账号并使用密码登录；
3. 进入数据工作台，确认农场数据正常加载；
4. 切换实景和 3D 场景；
5. 打开智能问农，输入“查看01号大棚的状况”；
6. 控制一个设备或灌溉单元，刷新后确认状态仍然保留。

如果没有配置百度人脸密钥，跳过人脸注册和人脸登录测试即可。

## 10. 后续启动与更新

以后启动前先打开 Docker Desktop，然后在 Git Bash 中执行：

```bash
cd agric
git switch main
git pull --ff-only origin main
./start.sh
```

如果确认前端没有变化，可以跳过前端构建：

```bash
./start.sh --skip-build
```

如果拉取的新代码修改了 `landing`、`frontend`、`package.json` 或前端资源，不要使用 `--skip-build`。

## 11. 常见问题

### Docker Desktop 提示 WSL 2 installation is incomplete

以管理员身份运行：

```powershell
wsl --update
wsl --set-default-version 2
```

然后重启电脑和 Docker Desktop。

### `docker: command not found`

确认 Docker Desktop 已安装并启动，然后关闭 Git Bash 再重新打开。Docker Desktop 安装后需要新终端才能识别 PATH。

### 找不到容器 `mysql`

说明第 5 节的 `docker run` 没有成功执行。检查全部容器：

```bash
docker ps -a
```

如果容器存在但已停止：

```bash
docker start mysql
```

### 容器名 `/mysql` 已被占用

电脑中已经存在同名容器。先查看它：

```bash
docker ps -a --filter name=mysql
```

如果它就是本项目以前创建的 MySQL，直接运行 `docker start mysql`，不要再次创建。不要在不确认数据用途时删除已有容器或数据卷。

### 3306 端口被占用

常见原因是 Windows 本机已经安装并启动了 MySQL。可以在任务管理器或 `services.msc` 中停止本机 MySQL 服务，再启动 Docker 容器。

PowerShell 检查端口：

```powershell
netstat -ano | findstr :3306
```

### `Access denied for user 'root'`

确认 `.env.local` 中：

```dotenv
DB_USERNAME=root
DB_PASSWORD=Root_123456
```

如果同名容器来自以前的其他项目，它可能使用了不同密码。此时应先确认容器是否包含重要数据，再决定使用新的容器名和独立端口。

### npm 下载慢或失败

先确认网络正常，再重新运行 `./start.sh`。已经成功安装的依赖不会每次重新安装。不要随意升级依赖版本，本项目已固定兼容版本。

### 8081 端口被占用

在 PowerShell 中检查：

```powershell
netstat -ano | findstr :8081
```

根据最后一列 PID 找到并关闭占用程序，然后重新运行 `./start.sh`。

### 页面仍是旧版本

不要使用 `--skip-build`，重新执行：

```bash
./start.sh
```

启动完成后在浏览器中按 `Ctrl + F5` 强制刷新。

### 3D 场景黑屏或卡顿

使用最新版 Chrome 或 Edge，开启浏览器硬件加速并更新显卡驱动。远程桌面或没有可用 GPU 的电脑可能无法流畅运行 3D 场景。

### 智能问农提示 Key 未配置

检查 `.env.local` 中是否填写了有效的 `DEEPSEEK_API_KEY`。修改配置后按 `Ctrl + C` 停止项目，再重新执行 `./start.sh --skip-build`。

## 12. 安全和协作要求

- 不要共享或提交 `.env.local`。
- 不要把 DeepSeek、百度人脸识别等密钥写入源代码。
- 开发功能时，从最新 `main` 创建个人功能分支，不要直接在 `main` 上开发。
- 提交报错截图或日志前，先遮挡密钥、JWT、邮箱和其他个人信息。
