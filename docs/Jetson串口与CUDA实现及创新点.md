# Jetson 串口与 CUDA 实现及创新点

更新日期：2026-10-19。本文描述代码及验证边界，可用于创赛技术说明。目标设备为 Jetson Orin 系列，尚未连接 Jetson 实机；本机 NVIDIA GPU 验证不能称为“已完成 Jetson 部署”。

## 1. 已完成的链路

设备 UART / USB 串口 → TY Serial v1 解帧、CRC → Jetson 网关 SQLite WAL 持久化 → HTTP 鉴权 → 后端校验与幂等入库 → 工作台查询。

控制方向：平台指令持久化 → 网关拉取有效指令 → 串口发包与有界重试 → 设备执行回执 → 网关持久化回执 → 后端更新状态。未收到确认时，实际设备状态未知，不能把超时解释成“硬件一定没有执行”。

视觉方向：默认 Pillow 解码；可选 nvImageCodec JPEG GPU 解码并直接交给 CUDA 预处理 → TensorRT 推理 → 默认 CPU 解码/NMS 或可选 CUDA 解码/NMS → 原有结果与证据界面。PNG 等非 JPEG 仍由 Pillow 解码。当前生产调用接在 `vision-runtime/pipeline.py` 的梨叶检测流水线；算子本身处理通用 RGB 图像，但番茄分类模型及其他作物尚未逐一迁移到这条 TensorRT 路径，不能宣称全作物均已 CUDA 化。

串口 JSON、CRC、数据库与网络操作继续由 CPU 负责。串口报文规模小，逐包搬到 GPU 不划算；GPU 用于图像这种并行密集任务。本次未改动模型权重，也没有生成假遥测或自动驱动真实泵阀。

## 2. 串口优化及对应代码

| 改动 | 目的 | 实现位置 |
|---|---|---|
| HTTP 工作线程独立连接 SQLite | 网络等待不阻塞串口接收和回执 | `embedded/gateway.py: network_worker` |
| WAL、FULL 同步与事务提交后回执 | 掉线、重启后保留待上传数据 | `Gateway.__init__ / receive` |
| 缓存内 messageId 唯一键与内容冲突检查 | 同一遥测重发不重复挤占缓存；内容变化不确认 | `Gateway.receive` |
| 持久化 receipts，与入队 SQL 原子检查 | 设备已执行、HTTP 仍为 PENDING 时不再次下发 | `Gateway.queue_receipt / poll` |
| 有界重试、绝对 expiresAt 检查 | 网关离线再启动时不执行陈旧指令 | `Gateway.retry` |
| 回执优先上传；每轮最多 4 个上传项 | 避免大量遥测长期排在控制回执前 | `Gateway.flush` |
| 部分写继续发送、无进展即报错 | 适应串口分段写入 | `Gateway.write_packet` |
| 串口断开后 1–30 秒退避重连、重置解码状态 | USB 转换器热插拔后恢复连接 | `main` |
| 缓存容量上限 | 满时不确认未保存的遥测，让固件保留重试 | `maxSpoolRows` |

SQLite 的旧表会自动补充 `message_key` 和 `expires`。旧 `sent` 行没有有效过期时间时按过期处理，不在重启后补发。`receipts` 在后端不再返回该指令时清理。行数限制涵盖 uplink 与 rejected，不能替代磁盘字节配额，运维仍需检查 rejected、数据库和 WAL 占用。设备侧须保留指令去重、最大运行时间和本地停止机制，参见 `embedded/README.md`。

## 3. 自定义 CUDA 算子

源码：`vision-runtime/cuda/agric_ops.cu`。不是只设置 `device=cuda`，其中有真实的 `__global__` 定义和 `<<<grid, block, 0, stream>>>` 发射。

1. `letterbox_rgb`：每线程一个目标像素，16×16 线程块。融合双线性采样、114 灰色补边、HWC→CHW 和 `/255` 归一化，直接写 FP32 TensorRT 输入缓冲区。支持非方形输入和极端长宽比，源图上限 2000 万像素、目标边长上限 4096。
2. `image_moments`：每块 256 线程，通过共享内存规约输出 RGB 灰度均值的和、平方和；CPU 只汇总较小的分块统计，以维持过暗、过曝和低细节质量门控。
3. `decode_candidates` 与 `greedy_nms`：仅在 `VISION_POSTPROCESS=cuda-nms` 时启用。前者并行处理候选类别、阈值和框坐标；后者按分数顺序做类别内 IoU 抑制，最多保留 50 个框，只把压缩结果复制回 CPU。后处理要求 FP32 YOLO 输出；贪心选框为单线程，Jetson 性能仍需实测。

Python 通过带 ABI 版本检查的 ctypes 调用共享库。输入 pinned host buffer、输入显存和统计缓冲区按需增长并复用；TensorRT 输入显存继续复用。CUDA 操作和推理使用同一条 stream。质量统计读取前显式同步，故不能声称这条链路实现了多帧完全重叠或零同步。

`DeviceTensor` 校验指针、shape 和 stream 属于当前 TensorRT backend。正常预处理路径没有“预处理图像 D2H → 再 H2D”的中间往返；启用 CUDA NMS 后，模型输出也不会完整下载，只回传最终检测框。Pillow 路径仍上传解码后的 RGB；nvImageCodec 路径让 JPEG 解码结果直接留在设备显存。压缩文件读取、质量统计同步、最终框回传和知识检索仍涉及 CPU，**不是端到端零拷贝**。

内核采用半像素坐标双线性采样，与 `cuda_preprocess.cpu_reference` 对齐。原生产 Pillow 缩小时还可能做抗混叠，输出不保证逐像素一致，因此默认仍为 `VISION_PREPROCESS=pillow`。启用 CUDA 必须先比较完整检测结果；指定 CUDA 后发生异常会报错，不会悄悄回退成 CPU 后仍标注 GPU。

## 4. Jetson 构建、启用与回退

沿用项目固定适配基线 JetPack 6.2.1（CUDA 12.6、TensorRT 10.3），见 [NVIDIA 官方说明](https://developer.nvidia.com/embedded/jetpack-sdk-621)。stream、异步拷贝及同步设计参考 [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html)。

```bash
# 在 Orin 板端的发行包根目录执行；需要 cmake、JetPack CUDA 开发组件。
bash deploy/jetson/build-cuda.sh
export VISION_CUDA_LIBRARY="$PWD/vision-runtime/cuda/build/libagric_cuda.so"
export AGRIC_TEST_CUDA=1
vision-runtime/jetson-venv/bin/python -m unittest discover -s vision-runtime -p test_cuda_preprocess.py -v

# 先使用现有 build_engine.py 在本板构建模型对应的 engine。
export VISION_ENGINE=/var/lib/agric/models/pear-leaf-fp16.engine
vision-runtime/jetson-venv/bin/python vision-runtime/validate_backend.py \
  sample1.jpg sample2.jpg --gpu-preprocess cuda-fused --output target/jetson-cuda-validation.json

# CUDA 后处理可单独对比；正式启用前应通过逐框一致性验收。
vision-runtime/jetson-venv/bin/python vision-runtime/validate_backend.py \
  sample1.jpg sample2.jpg --gpu-preprocess pillow --gpu-postprocess cuda-nms \
  --output target/jetson-cuda-nms-validation.json

# JPEG 解码 + CUDA 预处理，对照 CPU/Pillow 检测结果。
vision-runtime/jetson-venv/bin/python vision-runtime/validate_backend.py \
  sample1.jpg sample2.jpg --gpu-image-decode nvimgcodec --gpu-preprocess cuda-fused \
  --output target/jetson-nvimgcodec-validation.json
```

CUDA 模式要求模型输入 IO 为 FP32；TensorRT 内部仍可启用 FP16。模型 engine 不跨设备、版本复制使用。对比程序始终用 CPU+Pillow 为基线，检查状态一致、相同类别框的 IoU≥0.9、置信度差≤0.03；这只是数值回归门槛，不是疾病诊断准确率。需扩充多光照、病斑尺度及健康/异常叶片的独立测试集。

nvImageCodec JPEG 解码是额外依赖，按需安装：

```bash
vision-runtime/jetson-venv/bin/pip install -r deploy/jetson/requirements-vision-gpu.txt
```

验收通过后在 `/etc/agric/edge.env` 可设置 `VISION_IMAGE_DECODE=nvimgcodec`、`VISION_PREPROCESS=cuda-fused`、`VISION_POSTPROCESS=cuda-nms` 和 `VISION_CUDA_LIBRARY`，重启 agric 服务；对应回退值为 `pillow`、`pillow` 与 `cpu`。nvImageCodec 默认应用 EXIF 方向；PNG 等非 JPEG 自动走 Pillow。当前 Windows 前端/后端不自动切换为 GPU。

独立算子基准与完整流水线基准分别执行：

```bash
vision-runtime/jetson-venv/bin/python vision-runtime/benchmark_cuda.py sample1.jpg \
  --iterations 100 --output target/jetson-operators.json
VISION_BACKEND=tensorrt VISION_PREPROCESS=cuda-fused \
  VISION_IMAGE_DECODE=nvimgcodec VISION_POSTPROCESS=cuda-nms \
  vision-runtime/jetson-venv/bin/python vision-runtime/benchmark.py sample1.jpg \
  --iterations 100 --output target/jetson-full-pipeline.json

# 构建 FP16/FP32 engine，逐项做检测一致性检查，并输出各阶段中位数/P95。
AGRIC_BENCH_ITERATIONS=100 bash deploy/jetson/benchmark-vision-matrix.sh \
  target/vision-matrix sample1.jpg sample2.jpg
```

串口网关为单独的可选 systemd 服务，不在安装时直接控制设备：

```bash
# install-services.sh 会安装 service 并建立 agric 用户和 serial 数据目录。
# 将 deploy/jetson/serial.example.json 复制到 /etc/agric/serial.json 后修改设备映射。
# 使用 /dev/serial/by-id/... 稳定路径；板载 UART 请按实际 Jetson 引脚、电平另行确认。
# /etc/agric/serial.env 内容为 AGRIC_GATEWAY_TOKEN=有效平台令牌。
sudo chown root:agric /etc/agric/serial.json /etc/agric/serial.env
sudo chmod 640 /etc/agric/serial.json /etc/agric/serial.env
sudo systemctl enable --now agric-serial
sudo journalctl -u agric-serial -f
```

令牌到期需更新；当前未引入设备独立身份或自动刷新凭证。串口先用模拟器/虚拟串口联调，再按固件、电气接线和厂家协议验收。TY Serial v1 不自动兼容 Modbus 厂商寄存器。

## 5. 已完成的本机验证

- 串口 15 项自动化测试：分包/粘包/噪声、CRC、掉线缓存、重启去重、过期指令拒发、缓存满不确认、部分写，以及 HTTP 线程阻塞时串口仍能持久化回执。
- 已有 CUDA 预处理版本的 GPU/接口验证：随机及常量图像、补边、单像素长宽比、缓存增长复用；DeviceTensor 路径不重复 H2D，拒绝其他 stream。新增 GPU NMS 与 nvImageCodec 路径尚未执行这些板端验收。
- 原视觉流水线 3 项回归测试通过，CPU worker 连续推理及坏图恢复正常。
- 预处理基准来自本机 RTX 4060 Laptop GPU、CUDA Toolkit 12.0、Windows x86_64；它不覆盖本次新增的 NMS 核函数和 nvImageCodec 路径。当前开发环境缺少 CMake 与 MSVC C++ 工具链，新增 `.cu` 代码尚未编译；需在 Jetson 匹配 JetPack 的工具链构建并验收。
- 5 次预热、30 次采样，416×416 RGB → 640×640：CUDA 预处理路径中位约 0.24ms，原 Pillow 路径约 10.16ms；同采样规则 CPU 参考与 GPU 最大绝对误差为 0。完整原始数据见 `docs/benchmarks/cuda-preprocess-rtx4060.json`。CUDA 路径计入原图上传、统计与同步，输出留在显存；CPU 输出留在主存。原 Pillow 与新内核采样算法存在差异，性能数据不代表同精度模型端到端加速倍数。

尚未验证：Jetson ARM64 构建和 TensorRT 真机端到端调用、Jetson 整机时延/FPS/功耗/温升、摄像头持续流、多串口真实设备、固件执行与现场网络。不要用本机 RTX 数字替代这些项目。

## 6. 创赛可以陈述的工程创新点

| 展示表述 | 代码证据 | 可复现实验 |
|---|---|---|
| 面向弱网的设备接入，采集、持久化与网络传输解耦 | 双线程 SQLite WAL 网关、回执优先队列 | 阻塞 HTTP，确认串口仍回执；恢复网络后核对入库唯一性 |
| 控制指令贯穿串口与平台的幂等确认 | 固件指令去重、网关 receipts、后端 requestId 与状态机 | 在 ACK 上传前重启网关，确认同一控制不重复发包；过期命令不下发 |
| 面向边缘视觉的算子融合、缓冲区复用与 GPU 后处理 | 四个 CUDA kernel、ctypes ABI、DeviceTensor 与 TensorRT 同 stream | 参考数值比对、Nsight 查看 kernel/拷贝、预处理及全链路独立测速 |
| 可核验的端侧部署与回退 | 板端编译、engine 校验、明确运行后端、发行包清单 | 核验模型/engine 版本；CUDA 不可用时明确失败，按配置回退 CPU |

推荐答辩表述：“我们实现了面向 Jetson 的弱网串口设备网关和视觉 CUDA 算子，将设备确认链路与图像计算分开调度，支持持久化重传、指令防重及 TensorRT 显存输入复用。当前已完成本机 NVIDIA GPU 算子验证，Jetson 的性能和现场设备联调是下一阶段验收内容。”

这些属于面向农业场景的工程集成与实现改进。CRC、WAL、幂等队列、双线性采样和 CUDA 规约是已有技术，不表述为原创基础算法、全球首创或已经获专利；农业效果和现场收益需试验数据支撑。
