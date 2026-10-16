# Jetson 部署与验收

2026-10-16：补充了可选串口网关服务及自定义 CUDA 图像算子，构建、开启与验证步骤见 [Jetson串口与CUDA实现及创新点](Jetson串口与CUDA实现及创新点.md)。默认仍用 Pillow 预处理，CUDA 模式需先在板端完成数值与模型回归验收。

## 选型与基线

展示版选择 Jetson Orin Nano Super 8GB 开发套件、原装电源、主动散热和 256GB NVMe SSD。桌面或笔记本浏览器负责 3D 渲染，Jetson 负责 Java 服务、数据库、视觉和本地大模型；若直接使用板端 Chromium，需要另外测试 3D 与推理竞争共享内存的情况。不要把开发套件等同于通过工业认证的整机。

固定适配基线为 JetPack 6.2.1、Jetson Linux L4T 36.4.4、Ubuntu 22.04 ARM64、CUDA 12.6、TensorRT 10.3，避免混装桌面 CUDA wheel。该组合来自 [NVIDIA 6.2.1 发布说明](https://docs.nvidia.com/jetson/jetpack/6.2.1/release-notes/index.html)。其他 JetPack 版本必须重新构建和验收。

Qwen3 4B Q4_K_M 是本地展示配置，4096 token 上下文、512 token 单次生成、一个执行线程和两个总任务名额。llama.cpp 用 Orin 的 SM87 CUDA 编译，启用 Flash Attention 与 Q8 KV 缓存，关闭长思考。量化模型文件约 2.50GB，不代表总运行内存；上下文、视觉、系统和浏览器都占用共享内存。8GB 上的实际余量和时延必须上板测量。

## 制作发行包

在 Windows 开发机先运行 Maven 测试并打包，前端有改动时先构建 landing 与 frontend。随后执行：

```powershell
.\mvnw.cmd package
.\scripts\create-jetson-release.ps1
```

输出 target/jetson-release-时间戳.zip，包含 Java JAR、静态页面、Harness 源码和锁文件、ONNX 模型、许可证、部署脚本及 SHA-256 清单。不包含账号数据库、图像、密钥、node_modules、桌面虚拟环境或本地大模型权重。将发行包复制到板端后，校验 release-manifest.json 内每个文件再安装。

## 板端安装

先通过 NVIDIA SDK Manager 刷写 JetPack 6.2.1 并安装计算组件。安装 Docker Engine 与 Compose v2；不要在服务用户下开放 Docker socket。把发行包解压到 /opt/agric/releases/唯一版本，创建 /opt/agric/current 指向该目录，保留旧版本用于回滚。安装目录与路径不要包含空格。

```bash
cd /opt/agric/current
python3 deploy/jetson/verify-release.py
sudo bash deploy/jetson/bootstrap-host.sh
bash deploy/jetson/setup-runtime.sh
bash deploy/jetson/init-env.sh
bash deploy/jetson/build-llama.sh
sudo bash deploy/jetson/install-services.sh
```

bootstrap-host.sh 安装 JRE 17、Python venv、编译工具和 Nginx；缺少 Node 时下载并校验固定的 Node 24.14.1 ARM64。setup-runtime.sh 严格检查 L4T 与 TensorRT，创建能够读取 JetPack 系统包的 Python 虚拟环境。脚本不会自动刷机、改变功耗模式或删除已有数据。

init-env.sh 生成独立随机数据库密码、JWT 密钥和模型服务密钥。编辑 deploy/jetson/.env 后，重新运行 install-services.sh 才会更新 /etc/agric/edge.env。首次演示可开放注册，创建展示账号后改 AUTH_REGISTRATION_ENABLED=false。本应用暂未提供企业级租户与管理员权限隔离。

停止模型服务后在本板构建引擎，避免编译与大模型争抢内存：

```bash
sudo systemctl stop agric agric-llama
sudo bash deploy/jetson/download-model.sh /var/lib/agric/models
vision-runtime/jetson-venv/bin/python vision-runtime/build_engine.py \
  --output /var/lib/agric/models/pear-leaf-fp16.engine --precision fp16 --workspace-mb 512
sudo chown -R agric:agric /var/lib/agric/models
sudo docker compose --env-file deploy/jetson/.env -f deploy/jetson/compose.yaml up -d --wait
sudo systemctl start agric-llama agric
```

TensorRT 引擎是本机生成物，携带 ONNX、引擎哈希及 TensorRT 版本清单；升级计算栈或更换 GPU 后重建。显式选择 TensorRT 时失败会报错，不能把 CPU 回退误当成 GPU 成功。需要暂时改用 CPU 时，修改配置 VISION_BACKEND=onnx-cpu，重新安装环境文件并重启。

## 网络与摄像头

数据库、模型端口和 Java 默认仅监听回环。单机演示可以在浏览器访问 localhost；从另一台电脑使用摄像头采样时，要通过可信 HTTPS 访问应用。deploy/jetson/nginx.conf 是同源反向代理模板，替换域名和证书路径，经 nginx -t 检查后启用。局域网证书需要在客户端受信任，不能靠忽略证书错误作为交付方案。

网页摄像头属于打开网页的客户端。当前链路不是 Jetson CSI 摄像头，也不是多路 RTSP 解码管道；展示时使用笔记本摄像头或本地 USB 摄像头页面采样。连续检测逐帧等待再间隔 5 秒，不承诺视频每帧实时检测。天气、人脸云接口和远程模型需要外网；核心本地演示不应依赖它们。

## 启动检查与模型验收

```bash
sudo systemctl status agric agric-llama
curl --fail http://127.0.0.1:8081/api/health
sudo journalctl -u agric -u agric-llama -n 100 --no-pager
set -a
source deploy/jetson/.env
set +a
node deploy/jetson/smoke-llm.mjs /var/lib/agric/logs/llm-smoke.json
```

/api/health 仅代表 Java 存活。登录后的软件环境诊断显示数据库、模型与视觉配置；视觉第一次请求才启动工作进程，结果中的 runtime.backend 是实际执行后端。smoke-llm.mjs 会验证模型真正调用工具并使用返回值；仅能打开 /v1/models 不算 Agent 验收。

展示操作依次完成基地切换、六个侧栏、种植登记、批次采收至出库、Agent 查询已保存批次、梨叶上传与摄像头检测、人工复核、3D 导览和导出。断网重试这些步骤，验证天气或云接口失败不阻断主流程。GPU 加速和本地 Qwen3 配置目前尚无实机验收记录。

## 性能与精度验收

导出变量后运行板端基准，保存结果而不是填写估计值：

```bash
VISION_BACKEND=onnx-cpu "$VISION_PYTHON" vision-runtime/benchmark.py sample.jpg \
  --iterations 100 --output /var/lib/agric/logs/vision-cpu.json
VISION_BACKEND=tensorrt "$VISION_PYTHON" vision-runtime/benchmark.py sample.jpg \
  --iterations 100 --output /var/lib/agric/logs/vision-trt.json
"$VISION_PYTHON" vision-runtime/validate_backend.py sample.jpg another.jpg \
  --output /var/lib/agric/logs/vision-comparison.json
sudo tegrastats --interval 1000
```

比较脚本要求相同类别、框 IoU 至少 0.9、置信度差不超过 0.03；阈值附近出现差异必须人工分析，不能用调整检测阈值掩盖。还应使用覆盖正常、模糊、低光与各种症状的固定样本集进行专项验证。数值一致性不证明病害诊断准确性。INT8 没有校准数据，当前不启用；前后处理仍在 CPU，CUDA/TensorRT 负责神经网络计算。

展示验收目标为连续两小时无 OOM、界面与任务队列可用，GPU 与 CPU 输出比较通过，三次重复基准保存 p50/p95 和环境版本。建议视觉暖机 p95 不超过 500ms、单任务 Agent 在 180 秒内完成；这些是待验收目标，不是已有实测承诺。使用 tegrastats 记录共享内存、温度、功耗和频率。模型同时运行不稳时先停用板端浏览器、降低 GPU offload 或切换远程模型，不要增加并发。

## 运维与回滚

服务由 systemd 开机启动及失败重启，进程子树统一回收。数据库是 Compose 的持久卷；原图、模型、工作进程日志和 Harness 会话位于 /var/lib/agric。先停止应用写入再运行 sudo bash deploy/jetson/backup.sh；保存数据库和原图的带校验归档，密钥单独保管。恢复前在全新数据库和图像目录验证校验值，不覆盖运行库。

回滚步骤是停止两个服务、备份当前数据库、将 current 指向保留版本、恢复与该版本匹配的数据库快照、重建或选择匹配引擎，再启动并完成验收。当前 Hibernate 使用 ddl-auto=update，不能保证跨版本数据库可直接回退；正式销售前应采用版本化数据库迁移和自动恢复演练。

## 来源与已知边界

CUDA 编译和服务参数依据 [llama.cpp 构建说明](https://github.com/ggml-org/llama.cpp/blob/4762ad7316dcdec20016ab5985fb46a27902204d/docs/build.md) 与 [固定版本服务说明](https://github.com/ggml-org/llama.cpp/blob/4762ad7316dcdec20016ab5985fb46a27902204d/tools/server/README.md)。固定提交保证可重复，不表示它是最新的安全版本，商业发行需评估升级。Qwen 文件使用 [官方 GGUF 仓库](https://huggingface.co/Qwen/Qwen3-4B-GGUF)，按固定 revision 和 SHA-256 下载。

TensorRT 调用参考 [NVIDIA Python API](https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/python-api-docs.html)。此实现采用固定批量与显式 IO、复用缓冲区和流，尚未实现零拷贝摄像头解码、手写 CUDA 预处理、CUDA Graph 或 DLA 路径。Windows CPU 回归不能代替 Jetson CUDA 实测。
