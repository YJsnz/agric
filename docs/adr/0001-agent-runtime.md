# 农业 Agent 运行时接入

状态：2026-10-01 已切换为官方 DeepSeek Harness SDK，固定 npm 版本 0.2.0-rc.2。

只读源码参考 commit `639ed015397290b3745d163aafe02ffee4aa3f84`。应用使用官方 `DeepSeekHarness` 启动 `dsh --profile sdk-minimal`，通过 overlay 禁用默认 Bash / PowerShell 工具，加入 pi-ai 本地模型路由与农业工具插件。实际 Agent 循环、工具参数管线及会话日志由 Harness 提供；Vue 前端保留本项目界面，按事件渲染执行过程。

Java 继续负责用户认证、任务所属校验、队列限流和 MySQL 事件记录；Node 按任务隔离子进程与 Harness home。插件通过随机令牌认证的 loopback 桥请求 Java 执行三项只读工具，模型不能指定其他农场。工具参数再次由 Java 白名单校验。正式设备操作尚未开放。

任务缺少必要核验时，SDK 在同一会话追加补核验提示，最多三次；服务端拒绝没有完成农场读取、资料检索和必要阈值核验的结论。该措施不能保证模型全部语义事实正确，真实生产建议仍需农技复核。

运行要求：Node 24+，`npm ci --prefix agent-runtime`；Windows start.ps1 自动安装。AGENT_ENGINE 默认 harness；legacy 可回退原 Java 有界循环，原有单元测试显式选 legacy。AGENT_NODE 可以指定 Node 路径，AGENT_BASE_URL / AGENT_MODEL / AGENT_API_KEY 配置模型。

取消会终止任务 Node 与 DSH 子进程；Node 240 秒预算、Java 260 秒兜底。最多两个运行任务、四个在途任务、20 次工具调用。Harness 原始 session 事件保存在 MySQL，也保留 `target/harness-sessions/<runId>` 的原生 JSONL，target 清理会删除后者。重启后的在途任务标记失败并保留日志，不自动续跑。

本机验证：官方 SDK handshake 成功，Qwen2.5 7B 真实任务调用三项农业工具并完成回答。12 项原有后端回归通过，前端类型检查与构建通过。

仍有限制：官方版本是 RC；前端采用增量轮询，不是 token SSE；会话目前以单任务为单位，尚未提供用户多轮追问；支持 yantian-01 与 farm-01 两个共享演示基地，任务和工具按基地传递数据范围，尚无正式农场权限模型；资料是关键词检索基线，尚非 GraphRAG；没有视觉病害、因果模型、采后执行和真实设备集成。

## 软件演示交付更新（2026-10-03）

已增加视觉与业务记录工具，现有五项农业只读工具。任务核验流程、事件、结果与来源可导出；失败/取消后重试关联旧任务；完成后的追问引用有界历史摘录并重新核验数据，不恢复模型隐藏状态。

本地推理默认预算调整为 600 秒（可配置 60–900 秒），Java 另加 20 秒兜底。模型输出上限 768 tokens，声明上下文为 8192。显存繁忙时可使用共享 Qwen2.5 7B 权重的 CPU 配置。业务工具只返回最近 30 条事件，长说明截取 600 字，完整记录留在业务面板。

项目按纯软件演示交付，不要求真实硬件或测绘资料。农事、采后批次和模拟回执已经接入；GraphRAG、因果模型不作为当前已实现能力。
