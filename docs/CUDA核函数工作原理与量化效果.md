# CUDA 核函数工作原理与量化效果

本文介绍 `vision-runtime/cuda/agric_ops.cu` 中用于梨叶视觉流水线的四个 CUDA 核函数：`letterbox_rgb`、`image_moments`、`decode_candidates` 与 `greedy_nms`。它们覆盖图像预处理、质量统计和检测后处理；TensorRT 仍负责神经网络推理。

## 一帧图像如何经过 CUDA 路径

```text
Pillow 解码 JPEG/PNG + EXIF ──> pinned RGB ──H2D──┐
                                                    ├─> GPU RGB
nvImageCodec GPU 解码 JPEG + EXIF ────────────────┘      ├─ letterbox_rgb → TensorRT 输入显存
                                                           └─ image_moments → 统计 partial → D2H/同步
                                                                                ↓
                                                                CPU 质量门控与元数据
                                                                                ↓
TensorRT 推理 ──> [默认] 完整输出 D2H → CPU 解码/NMS ──┐
              └─> [可选] CUDA 解码/NMS → 最多 50 框 D2H ─┴─> 结果与复核页面
```

Java 通过常驻 Python 视觉 worker 调用此流程。Python 使用 `ctypes` 调用 CUDA 共享库；`DeviceTensor` 携带显存指针、张量形状和 stream 标识，TensorRT 后端会检查这些信息。显存、pinned 主机缓冲区、统计缓冲区和推理输入缓冲区按需扩容并复用，不在每帧重新分配。

## 预处理核函数

### `letterbox_rgb`

核函数以二维网格覆盖目标输入图像，block 为 **16×16（256 个线程）**，一个线程负责一个目标像素。线程按保持宽高比的 letterbox 几何关系定位源图像；有效图像区采用半像素坐标的双线性采样和边缘复制，周围填入灰值 **114**。随后直接写入 FP32、CHW 排列的 TensorRT 输入，并将像素值除以 255 归一化。

缩放采样、补边、通道布局变换和归一化被融合在一次输出遍历中。这样省去了逐步生成缩放图、补边图、CHW 图等中间图像，也避免将完成预处理的整张张量先搬回 CPU、再上传到 TensorRT 显存。目标边长上限为 4096，源图像像素数上限为 2000 万；尺寸或指针参数非法时，接口返回 CUDA 错误。

### `image_moments`

每个线程处理一个源 RGB 像素，先计算三通道算术平均值 `v=(R+G+B)/3`，并累加 `v` 与 `v²`。每个 **256 线程 block** 使用 shared memory 做树形规约，写出该块的和与平方和。Python 端只把这些小块统计值复制回主机，再汇总得到整张输入图像的亮度均值和标准差，供现有图像质量门控使用。

统计仍需 CPU 读取，因此主机侧在检查数值前会同步当前 stream。同步只为读回分块统计，不是整张归一化模型输入的 GPU→CPU 往返。

## 检测后处理核函数

默认路径仍在 CPU 上用 NumPy/Python 解码与 NMS。设置 `VISION_POSTPROCESS=cuda-nms` 且使用 TensorRT 后端时，推理输出暂留在 TensorRT 输出显存，由以下两个核函数接着处理。两者都使用 TensorRT 的同一条 CUDA stream；scratch buffer 和 pinned 输出缓冲区在 worker 初始化时分配并复用。

### `decode_candidates`

每个线程处理一个 YOLO 候选框。它沿类别通道取最大分数（相同分数时保留编号更小的类别），套用置信度阈值，并把中心点/宽高 `(cx, cy, w, h)` 转为角点 `(x1, y1, x2, y2)`。输出为紧凑的分数、类别、坐标和有效标记数组，后续 NMS 不再读取整个模型输出。模型输出非有限值会被记录，主机读回后按 CPU 路径相同规则报错。

### `greedy_nms`

单个 CUDA 线程按分数从高到低迭代选框，分数并列时保持模型候选原始顺序；选中后只抑制同类别且 IoU ≥ **0.45** 的剩余框。它保留现有行为：坐标映射回原图并裁剪到图像边界，最多返回 **50** 个有效框。这个实现把大张量复制和 Python 循环移出主机，但 NMS 的贪心选择是串行执行的；实际收益需要用目标设备的完整流水线计时确认。

GPU 只回传固定大小的结果缓冲区（50 个检测槽位及计数/错误标记），而不是完整 `[1, 4+类别数, 候选数]` 张量。当前后处理只接受 FP32、固定形状 YOLO 输出，输入布局或精度不符合时会在启动阶段报错。

## 量化结果

下表来自仓库原始基准 [`cuda-preprocess-rtx4060.json`](benchmarks/cuda-preprocess-rtx4060.json)：Windows 11 x86_64、NVIDIA RTX 4060 Laptop GPU、CUDA Toolkit 12.0；输入 **416×416 RGB**，输出 **640×640**；预热 5 次、计时 30 次。CUDA 项包含 pinned-buffer 上传、图像统计和同步，预处理张量留在显存；不包含图片解码、TensorRT、摄像头和串口。

| 路径 | 中位数 | P95 | 与该 CUDA 路径的中位数比值 | 输出位置 |
|---|---:|---:|---:|---|
| 新 CUDA 预处理路径（上传 + 两个预处理核函数 + 统计同步） | **0.237 ms** | **0.495 ms** | 1× | GPU 显存 |
| 同一采样约定的 CPU/Numpy 参考实现 | 47.075 ms | 48.356 ms | 约 **198.3×** | 主机内存 |
| 原生产 Pillow 预处理 | 10.162 ms | 10.670 ms | 约 **42.8×** | 主机内存 |

新 CUDA 路径与 CPU 参考的张量最大绝对误差为 **0.0**。比值是这台 RTX 4060 上的预处理路径耗时比，不代表整套视觉推理或 Jetson 的加速倍数。尤其 Pillow 路径可能使用抗混叠缩小，与 CUDA 核函数采用的半像素双线性采样不同；该行仅作当前生产路径耗时参照，不能据此声称两种预处理输出等价。基准中的 CPU 参考也没有包含 Pillow 实现。

## 效果与适用边界

- **降低 CPU 预处理耗时**：缩放、补边、布局转换、归一化和统计并行处理，减少 CPU 对高分辨率像素逐项计算的工作量。
- **减少中间张量搬运**：模型输入由 CUDA 核函数直接写入 TensorRT 输入显存，省去完整预处理张量的主机输出及再次 H2D 上传。
- **维持图像质量检查**：统计核函数仍输出亮度均值和标准差所需数据，GPU 路径没有跳过质量门控。
- **GPU 后处理是新增可选路径**：`cuda-nms` 让 TensorRT 输出留在 GPU，并只回传最多 50 个框；它不改变模型权重或准确率。GPU NMS 目前采用单线程贪心遍历，收益需要在目标板实测。
- **整条链路仍不是零拷贝**：Pillow 解码路径会上传 RGB；nvImageCodec 路径可以省去该 RGB 上传，但仍有压缩文件读取、质量统计同步、最终框回传和 CPU/Java 结果处理。因此预处理表格不能当作端到端加速比。

### 当前视觉链路与后续优化方向

当前梨叶检测链路已包含 **nvImageCodec JPEG GPU 解码（可选）+ CUDA 预处理（可选）+ TensorRT 推理 + CUDA NMS（可选）**。PNG 等非 JPEG 仍走 Pillow；Pillow 负责识别输入格式和检查原始尺寸，nvImageCodec 默认应用 EXIF 方向并输出设备端 HWC sRGB，可直接交给 `letterbox_rgb`，不经过整图 D2H/H2D。GPU 功能均需显式启用。单张图片可能因解码初始化和调度成本而不受益。

| 尚未完成的方向 | 当前限制 | 后续工作与预期收益 |
|---|---|---|
| NMS 并行化 | `greedy_nms` 按置信度串行选框；候选很多时 GPU 单线程可能成为后处理瓶颈 | 在固定样本上测量候选规模和 `postprocessMs`；若占比显著，再实现并行候选抑制或分块方案，并保持类别内抑制语义及逐框回归 |
| 质量统计同步优化 | `image_moments` 在 GPU 统计后需要同步回 CPU，质量门控会形成串行点 | 使用 Nsight Systems 先确认等待占比，再评估异步门控或与后续工作重叠；需保证质量拒绝状态及时且一致 |
| 摄像头/视频输入 | 当前输入为图片文件；没有 CSI、RTSP 解码或跨帧 CUDA 缓冲区链路 | 按目标摄像头接入设备端帧缓冲与生命周期管理，减少压缩帧到 CPU RGB 的往返；需单独验收帧丢失、方向、颜色和长时间内存稳定性 |
| TensorRT engine 调优 | 当前支持 FP16/FP32 engine 的板端验证，没有 Jetson 性能记录 | 收集 engine 与各阶段中位数/P95、温度、功耗和内存，再判断精度、输入形状及缓冲区配置；不能用 RTX 桌面结果替代 Jetson 数据 |

结果格式化和持久化仍由 CPU/Java 完成，回传框数量很少，目前没有值得新增 GPU 化的工作项。

`benchmark.py` 现在汇总图片解码、预处理、推理、后处理和总耗时的中位数/P95；在 Jetson 上分别运行不同 precision engine 与 CPU/GPU 选项，再用 `validate_backend.py` 做检测一致性门槛。若分段计时仍不足以定位瓶颈，可用 Nsight Systems 观察 nvImageCodec、CUDA kernel、TensorRT enqueue 和同步位置，再决定是否优化贪心 NMS 的选框步骤。

CUDA 加速只会改变执行时间和数据路径，**不会自动让梨叶分类/检测更准确**。准确率要靠适合作物与地区的标注数据、训练/校准和独立测试集验证；当前公开梨叶权重未经泊头鸭梨独立验证，仍是项目视觉效果的重要限制。

采样契约与 `cuda_preprocess.cpu_reference` 对齐，但与 Pillow 的抗混叠行为不保证逐像素一致。CUDA 预处理默认 `VISION_PREPROCESS=pillow`，后处理默认 `VISION_POSTPROCESS=cpu`。`cuda-fused` 和 `cuda-nms` 均须与 `VISION_BACKEND=tensorrt` 一起使用，显式启用后初始化或执行失败会报错，不会静默改走 CPU。

## 验证状态与启用

仓库已有 RTX 4060 Laptop GPU 基准验证的是原预处理版本，覆盖随机/常量输入、补边、极端尺寸和缓存复用；表中数字也只属于预处理。**本次新增的 CUDA 解码/NMS 核函数和 nvImageCodec Python 路径尚未在本机或 Jetson 编译、运行**：当前环境有 CUDA Toolkit，但没有 CMake 和 MSVC C++ 工具链；Jetson 板也未连接。Python 语法和脚本格式检查已通过，这不能替代 CUDA 编译或板端逐框验收。

Jetson Orin 的目标构建基线为 JetPack 6.2.1、CUDA 12.6、TensorRT 10.3，构建脚本指定 SM 87。**目前没有 Jetson 板端 CUDA 核函数或端到端性能实测**；部署前需在目标板重新编译，并用固定样本集运行一致性验证和完整推理基准。CPU/Pillow 对比的验收门槛为检测状态一致、匹配框 IoU ≥ 0.9、置信度差 ≤ 0.03；这些是数值回归门槛，不是作物诊断准确率。

JPEG 加速依赖为可选项，不装入默认 runtime：

```bash
vision-runtime/jetson-venv/bin/pip install -r deploy/jetson/requirements-vision-gpu.txt
```

nvImageCodec 的 Python API支持 GPU/CPU 后端、CUDA Array Interface 零拷贝视图和默认 EXIF 方向处理，Jetson 安装包使用 Tegra CUDA 12 变体；是否由硬件 JPEG 引擎执行以及实际收益，应在目标设备记录验证。参考 [NVIDIA nvImageCodec 文档](https://docs.nvidia.com/cuda/nvimagecodec/) 与 [Jetson nvJPEG Decoder API](https://docs.nvidia.com/jetson/archives/r36.4/ApiReference/classNvJPEGDecoder.html)。

```bash
bash deploy/jetson/build-cuda.sh
export VISION_CUDA_LIBRARY="$PWD/vision-runtime/cuda/build/libagric_cuda.so"
export VISION_POSTPROCESS=cuda-nms
export AGRIC_TEST_CUDA=1
vision-runtime/jetson-venv/bin/python -m unittest discover \
  -s vision-runtime -p test_cuda_preprocess.py -v

# 同一块板上构建 FP16/FP32 engine，逐一做一致性验收，再测 Pillow/CUDA 组合。
AGRIC_BENCH_ITERATIONS=100 bash deploy/jetson/benchmark-vision-matrix.sh \
  target/vision-matrix sample1.jpg sample2.jpg
```

矩阵脚本对每个组合先运行 `validate_backend.py` 的逐框门槛，通过后才保存 benchmark；输出包含各阶段中位数、P95、总时延和按总时延估算的 FPS。nvImageCodec 组合需要安装可选依赖；非 JPEG 样本仍按 Pillow 路径测量。

完整构建、模型一致性门槛和回退方法见[Jetson 串口与 CUDA 实现说明](Jetson串口与CUDA实现及创新点.md)及[Jetson 部署与验收](Jetson部署与验收.md)。
