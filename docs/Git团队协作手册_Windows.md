# Git 团队协作手册（Windows）

本手册适用于“田言耕智”项目团队成员。仓库地址：

```text
https://github.com/YJsnz/agric.git
```

团队统一采用：**从当前基础分支创建功能分支 → 推送到 GitHub → Pull Request 审核合并**。

> 不要直接在 `main` 分支开发，不要直接向 `main` 强制推送。

## 当前仓库状态（请先阅读）

仓库目前处于初始化过渡阶段：

```text
main                               只有初始化提交，暂时没有项目代码
agent/data-workspace-dashboard     当前完整基础工程和数据工作台代码
```

数据工作台正在通过 [PR #1](https://github.com/YJsnz/agric/pull/1) 等待合并到 `main`。

- **PR #1 合并以前**：从 `agent/data-workspace-dashboard` 创建功能分支，PR 目标暂时选择该分支。
- **PR #1 合并以后**：从 `main` 创建和同步功能分支，PR 目标选择 `main`。

如果 GitHub 的 `main` 中已经能看到 `frontend`、`src` 和 `README.md`，说明 PR #1 已合并；如果没有这些文件，说明仍处于合并前阶段。

## 1. 安装与首次配置

### 1.1 安装软件

建议安装：

- [Git for Windows](https://git-scm.com/download/win)
- Visual Studio Code 或 IntelliJ IDEA
- Node.js（前端开发需要）
- JDK 17（Spring Boot 开发需要）

安装 Git 时保持默认选项即可。安装后打开 **Git Bash** 或 **PowerShell**。

### 1.2 配置姓名和邮箱

每台电脑只需要配置一次：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱"
```

检查配置：

```bash
git config --global --list
```

### 1.3 登录 GitHub

推荐安装 GitHub CLI，然后执行：

```bash
gh auth login -h github.com
```

按照提示选择：

```text
GitHub.com
HTTPS
Login with a web browser
```

也可以在第一次 `git push` 时通过浏览器完成 GitHub 登录。

## 2. 第一次下载项目

在准备存放项目的目录中打开终端：

```bash
git clone https://github.com/YJsnz/agric.git
cd agric
```

目前克隆后还要切换到包含项目代码的分支：

```bash
git fetch origin
git switch --track origin/agent/data-workspace-dashboard
```

如果提示本地分支已经存在：

```bash
git switch agent/data-workspace-dashboard
git pull --ff-only
```

检查仓库状态：

```bash
git status
git branch -a
```

安装前端依赖：

```bash
cd frontend
npm install
cd ..
```

## 3. 团队分支规则

每个模块使用独立分支：

```text
main                                  最终稳定集成分支，目前只有初始化提交
agent/data-workspace-dashboard        当前基础工程、数据工作台和临时开发基线
feature/ai-assistant                  AI 问农主界面
feature/greenhouse-digital-twin       大棚内部数字孪生
fix/具体问题名称                       缺陷修复
```

分支名只能使用英文、数字、短横线和 `/`，不要使用空格或中文。

## 4. 开始开发新功能

### 4.1 当前阶段：PR #1 尚未合并

当前必须从 `agent/data-workspace-dashboard` 创建功能分支，不能从空的 `main` 创建：

```bash
git fetch origin
git switch agent/data-workspace-dashboard
git pull --ff-only origin agent/data-workspace-dashboard
```

然后创建自己的功能分支：

```bash
git switch -c feature/ai-assistant
```

大棚内部页面可以创建：

```bash
git switch -c feature/greenhouse-digital-twin
```

### 4.2 PR #1 合并以后

确认 `main` 已经包含项目代码后，后续新分支改为从 `main` 创建：

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/新的功能名称
```

确认当前分支：

```bash
git branch --show-current
```

必须确认输出的是自己的功能分支，再开始修改代码。

## 5. 日常保存代码

查看修改：

```bash
git status
git diff
```

暂存自己修改的文件：

```bash
git add frontend/src/views/AssistantView.vue
git add frontend/src/components/assistant
```

确认即将提交的内容：

```bash
git diff --cached
```

创建提交：

```bash
git commit -m "Implement AI assistant home page"
```

提交信息应该简短说明做了什么，例如：

```text
Implement greenhouse monitoring panel
Add AI chat history
Fix irrigation device switch
Update workspace responsive layout
```

不要使用 `修改一下`、`test`、`123` 等无法说明内容的提交信息。

## 6. 推送自己的分支

第一次推送：

```bash
git push -u origin feature/ai-assistant
```

以后继续推送同一分支：

```bash
git push
```

推送完成后，在 GitHub 仓库页面创建 Pull Request。PR #1 尚未合并时：

```text
base: agent/data-workspace-dashboard
compare: feature/ai-assistant
```

PR #1 合并以后改为：

```text
base: main
compare: feature/ai-assistant
```

PR 描述至少写明：

- 完成了什么功能；
- 修改了哪些页面；
- 如何测试；
- 是否存在尚未完成的内容。

在其他同学检查之前，建议先创建 **Draft Pull Request**。

## 7. 同步其他人的最新代码

开发期间应经常同步当前基础分支，避免最后产生大量冲突。

PR #1 尚未合并时，新手使用：

```bash
git switch feature/ai-assistant
git fetch origin
git merge origin/agent/data-workspace-dashboard
```

没有冲突时直接推送：

```bash
git push
```

PR #1 合并以后，基础分支改为 `main`：

```bash
git fetch origin
git merge origin/main
```

熟悉 rebase 的成员可以将上述 `merge` 换成 `rebase`。rebase 后更新远程分支需要使用 `git push --force-with-lease`，该命令只能用于自己的功能分支。

## 8. 解决代码冲突

执行 merge 后如果出现冲突，Git 会显示类似内容：

```text
CONFLICT (content): Merge conflict in frontend/src/router/index.ts
```

打开冲突文件，会看到：

```text
 <<<<<<< HEAD
自己的代码
 =======
基础分支中的代码
 >>>>>>> origin/agent/data-workspace-dashboard
```

处理步骤：

1. 和相关同学确认双方代码用途。
2. 手动保留正确内容，必要时合并双方代码。
3. 删除 `<<<<<<<`、`=======` 和 `>>>>>>>` 标记。
4. 重新检查并构建项目。
5. 标记冲突已解决并提交。

```bash
git add frontend/src/router/index.ts
git commit -m "Merge base branch and resolve router conflict"
git push
```

如果不确定如何处理，不要随意删除另一位同学的代码，应先在群里沟通。

## 9. 项目中的高冲突文件

以下文件多人修改时容易冲突：

```text
frontend/src/router/index.ts
frontend/src/App.vue
frontend/package.json
frontend/package-lock.json
README.md
```

建议：

- AI 页面组件放入 `frontend/src/components/assistant/`；
- 大棚页面组件放入 `frontend/src/components/greenhouse/`；
- 数据工作台组件放入 `frontend/src/components/workspace/`；
- 不要把所有页面都写进 `App.vue`；
- 修改公共路由和依赖前，在团队群中说明。

如果 `package.json` 发生冲突，应保留双方需要的依赖，然后执行：

```bash
cd frontend
npm install
npm run build
```

不要手工随意拼接 `package-lock.json`。使用 `npm install` 重新生成更加可靠。

## 10. 提交前检查

前端修改完成后：

```bash
cd frontend
npm run build
```

后端或完整项目修改完成后，在仓库根目录执行：

```bash
./mvnw test
```

Windows PowerShell 如果无法运行 `./mvnw`，可以执行：

```powershell
.\mvnw.cmd test
```

提交前还要检查：

```bash
git status
```

不要提交以下内容：

```text
frontend/node_modules/
.idea/
.vscode/
target/
个人密码、Token、数据库密码
临时截图和日志
```

## 11. 常见操作

### 查看提交历史

```bash
git log --oneline --graph --decorate --all
```

### 查看某个文件的修改

```bash
git diff frontend/src/router/index.ts
```

### 撤销尚未暂存的文件修改

```bash
git restore 文件路径
```

该操作会丢弃本地修改，执行前必须确认文件内容不再需要。

### 取消暂存但保留文件修改

```bash
git restore --staged 文件路径
```

### 修改最近一次提交信息

```bash
git commit --amend -m "新的提交信息"
```

如果旧提交已经推送，需要先和团队确认再更新远程分支。

### 临时保存未完成的修改

```bash
git stash push -m "unfinished work"
git switch agent/data-workspace-dashboard
```

恢复修改：

```bash
git switch 原来的功能分支
git stash pop
```

## 12. 禁止操作

除非团队负责人明确要求，否则不要执行：

```bash
git push --force origin main
git reset --hard
git clean -fd
```

不要：

- 直接在 `main` 开发；
- 把多个无关功能放进同一个分支；
- 未经沟通覆盖其他同学的组件；
- 将 GitHub Token、密码或私钥提交到仓库；
- 冲突未解决、构建未通过就合并 PR。

## 13. 推荐的每日工作流程

```bash
# 1. 进入自己的分支
git switch feature/ai-assistant

# 2. 获取当前基础分支的最新内容
git fetch origin
git merge origin/agent/data-workspace-dashboard

# 3. 编写代码后查看修改
git status
git diff

# 4. 暂存并提交
git add 你修改的文件
git commit -m "Describe the completed change"

# 5. 构建测试
cd frontend
npm run build
cd ..

# 6. 推送功能分支
git push
```

## 14. Pull Request 合并顺序

当前推荐顺序：

1. 将数据工作台 PR #1 合并到 `main`；
2. AI 页面分支同步合并后的 `main`，并把 PR 目标改为 `main`；
3. 大棚内部页面分支同步合并后的 `main`，并把 PR 目标改为 `main`；
4. 最后进行完整导航、路由和构建测试。

PR #1 合并后，已经建立的功能分支执行：

```bash
git fetch origin
git switch 自己的功能分支
git merge origin/main
```

以后每次有新 PR 合并到 `main`，其他成员都重复以上同步操作。

遇到不确定的问题时，先执行 `git status` 并把完整输出发给团队负责人，不要连续尝试可能破坏历史的命令。
