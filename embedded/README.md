# 串口设备接入与联调

运输车回报：协议类型 5、车辆端持久化回报适配器和平台完成确认链路见 [运输车到达与完成回报](../docs/运输车到达与完成回报.md)。

2026-10-16 优化：HTTP 与串口分线程，SQLite WAL 缓存去重、回执防重复下发、绝对时间指令过期检查、部分写补发及热插拔重连。Jetson 部署、CUDA 算子及比赛展示口径见 [Jetson串口与CUDA实现及创新点](../docs/Jetson串口与CUDA实现及创新点.md)。

本目录实现自研固件可直接采用的 **TY Serial v1**，包括 Python 编解码器、持久化串口网关、模拟固件和可移植 C 编解码库。它不是任何厂家设备的既有协议。现有传感器若使用 Modbus RTU 或私有寄存器表，需要按厂家资料实现适配；不能把本协议直接发给未知设备。

## 启动

1. 启动项目后端，准备平台账号并登录。网关使用同一套 JWT 鉴权；将登录返回的 token 设置到进程环境变量 `AGRIC_GATEWAY_TOKEN`，不要写入配置或提交仓库。JWT 过期后更新 token 并重启网关。
2. `python -m pip install -r embedded/requirements.txt`。
3. 复制 `embedded/gateway.example.json` 为自己的配置，修改 COM 口、波特率、设备地址和平台已有设备的 entityId。默认 115200、8N1、无流控。TTL UART、RS232、RS485 的电气接口由板卡/转换器决定，不能直接互接。
4. `python embedded/gateway.py --config embedded/gateway.example.json`。
5. 工作台进入“设施”→“串口设备通信”，选择设备发送采样/自检/开关/档位/停止指令，查看状态和遥测。原有演示开关仍是演示控制，真实串口指令使用这个面板。

本地模拟：准备一对虚拟串口（例如 COM3↔COM4），网关连接 COM3，运行 `python embedded/simulator.py --port COM4 --address 1`。模拟器状态写入 `var/serial-simulator.json`，不会操作真实设备。模拟地址必须与网关配置一致。单 UART 点对点建议只配置一个地址；多个设备需要独立端口或具备仲裁能力的 RS485 总线。当前模拟器周期主动上报，不提供多主总线仲裁。

## 报文

所有多字节整数小端；固定开销 13 字节；最大 JSON 载荷 2048 字节。

| 偏移 | 长度 | 字段 |
|---|---:|---|
| 0 | 2 | 帧头 `AA 55` |
| 2 | 1 | 版本 `01` |
| 3 | 1 | 设备地址 1–247，不使用广播控制 |
| 4 | 1 | 类型：1 遥测，2 指令，3 回执，4 预留 HELLO，5 车辆事件 |
| 5 | 4 | 无符号序号；指令使用后端 commandId（当前支持 32 位范围） |
| 9 | 2 | UTF-8 JSON 字节长度 |
| 11 | N | JSON 对象 |
| 11+N | 2 | CRC16/Modbus，初始 FFFF，多项式 A001，覆盖偏移 2 至载荷末尾 |

CRC 已知向量：ASCII `123456789` → `4B37`，线上字节顺序 `37 4B`。解码器支持粘包、拆包、噪声重同步、长度限制和 CRC 错误拒收。C 库见 `firmware/ty_serial.h`；在 UART DMA/中断的工作线程中逐字节调用 `ty_feed`，不要在硬中断内执行 JSON 解析或设备操作。回调完成前复制载荷，使用固件现有 JSON 库解析并校验字段。

遥测载荷：

```json
{"messageId":"bootUuid_123","measuredAt":"2026-10-15T08:00:00Z","readings":[{"metric":"temperature","value":24.5},{"metric":"airHumidity","value":68}]}
```

`messageId` 为设备持久化启动 UUID + 采样计数，1–64 个字母、数字、下划线、短横线；重试必须保持整包内容不变。采样时间使用带时区的 ISO 8601；允许过去 30 天至未来 120 秒，设备应通过网关/RTC 校时。无 RTC 的旧设备必须在适配器层明确采集时间来源。

| metric | 单位 | 接收范围 |
|---|---|---|
| temperature / soilTemperature | ℃ | -50–100 |
| airHumidity / soilMoisture / battery | % | 0–100 |
| co2 | ppm | 0–50000 |
| light | lux | 0–200000 |
| ph | pH | 0–14 |
| ec | mS/cm | 0–30 |
| flow | m³/h | 0–10000 |

这是数据合法性范围，不是农艺控制阈值。网关不猜测寄存器比例或单位。接收每包 1–32 项且同一指标不得重复；非法值整包回滚。入库使用 `farm_observations`，source=`serial:设备ID`，时间统一转 UTC 保存；真实数据同时在串口面板独立显示，农场演示总览仍保留演示口径，不能当成实时设备看板。

指令载荷：

```json
{"requestId":"uuid","action":"SET_ENABLED","value":1,"durationSeconds":15}
```

| action | value | 适用设备 |
|---|---|---|
| SAMPLE | 0 | 传感器、相机侧控制器、机器人、执行器 |
| SELF_TEST | 0 | 设备自检 |
| SET_ENABLED | 0 / 1 | actuator / robot |
| SET_LEVEL | 0–100 | actuator / robot，需要固件具体定义百分比含义 |
| STOP | 0 | actuator / robot |

`durationSeconds` 范围 0–3600，0 表示不附加定时；真实固件必须实现本地关闭定时器、最大运行时间和看门狗，不依赖网关在线。相机视频应经视频链路传输，串口只负责控制和小型状态消息。导航任务、图像和电机底层实时闭环不通过此 JSON 串口接口传输。

执行回执的帧序号必须等于指令序号，载荷 `{"success":true,"detail":"done"}`。设备必须持久化最近指令序号与回执，重复命令只重发回执，不重复驱动泵阀。模拟固件保存最近 256 条；真实固件应按任务频率设计 NVS/Flash 去重窗口及磨损策略。指令过期时间由服务端控制为 60 秒，网关 2 秒重试，最多 3 次；失败不改变平台设备开关状态。收包损坏不自动视为已执行。

遥测收到 `{"success":true,"scope":"gateway_durable","messageId":"..."}` 表示网关 SQLite 已持久化，**不表示后端已入库**。离线样本继续保存在网关，网络恢复后重传；服务端唯一键避免重复入库。网关收到 HTTP 400/404/409/413/422 时将数据保存到 SQLite `rejected` 表待人工纠正，避免毒消息阻塞后续样本。认证失败及网络错误保留重试。应监控磁盘容量并备份 SQLite 文件。

## 后端接口

前缀 `/api/farms/{farmId}/embedded/{entityId}`，全部需要 `Authorization: Bearer ...`：

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/telemetry` | 校验、去重、事务入库 |
| POST | `/commands` | 使用 requestId 幂等创建持久化指令 |
| GET | `/commands/pending` | 网关获取待发指令，回收过期项 |
| POST | `/acks` | `{commandId,success,detail}`；校验设备归属，更新执行状态 |
| GET | `/messages` | 最近 100 条报文/指令记录 |

状态：`PENDING` → `ACKED` / `FAILED` / `TIMED_OUT`；遥测为 `RECEIVED`。目前 JWT 权限沿用项目原有账号模型，未新增租户/设备独立凭证。公网或多租户部署前需加设备身份与农场授权。未连接实体串口、未刷写真实固件，因此本交付的实机适配和电气联调仍待具体板卡确认。

## 验证

```powershell
python -m unittest discover -s embedded -v
gcc -std=c99 -Wall -Wextra -Werror embedded/firmware/ty_serial.c embedded/firmware/test_codec.c -o tmp/test_codec.exe
./tmp/test_codec.exe
./mvnw.cmd -q -Dtest=EmbeddedWorkflowTests test
```

数据库测试连接独立 `tianyan_test` 库。覆盖数据去重、越界拒收、跨设备回执拒收、收到回执后才修改设备状态、植株档案完整性、离线缓存和有界重试。C 编解码验证已知 CRC、正常解码、坏包拒收及恢复。
