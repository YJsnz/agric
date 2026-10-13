# 数据准备

在项目根目录执行（Python 需安装 Pillow）：

```powershell
python agric/ai-training/pear-vision/scripts/prepare_dataset.py
```

默认读取 `ai-training/Pear/leaves/{healthy,slug,spot,curl}`，匹配
`ai-training/Pear/annotation/YOLO/leaves` 中的已有标注。
输出到 `pear-vision/data/prepared`，以固定种子 42 按每类 80%/10%/10% 划分。

- `classification/{train,val,test}/{类别}/`：可用于目录式分类训练。
- `class_mapping.json`：按字母顺序生成的分类映射，curl=0、healthy=1、slug=2、spot=3。
- `manifest.json`：来源、哈希、划分、尺寸及 YOLO 匹配状态。
- `report.json`：损坏图片、缺失/无效/孤立标注、重复或跨类别冲突等完整清单。
- `matched_yolo_labels/`：同一划分下的有效已有标注，仅供核对，不是检测训练数据包。

YOLO 原始类别空间与分类映射分开：默认检查原标注为单类别（`--yolo-nc 1`），
不推断这个类别的语义，不将目录类别冒充检测框类别，也不生成不存在的框。
缺失/无效框不影响文件夹分类图片使用；损坏图片与跨类别内容冲突不进入划分。
完全相同的解码像素仅保留一份，避免跨集合重复；近似图片及同株连续拍摄需另行分组。

可用参数：`--source`、`--labels`、`--output`、`--ratios 0.8 0.1 0.1`、`--seed`、
`--yolo-nc`、`--check-only`（只写报告）、`--strict`（任何检查问题退出码为 2）。
输出目录非空时拒绝覆盖，请选择新的 `--output`。原数据不会修改。
缺少类别目录或某类没有可用图片时退出码为 2；其他问题默认记录到报告后继续。

测试：`python -m unittest discover -s agric/ai-training/pear-vision/scripts -p "test_prepare_dataset.py"`

## Baseline 分类训练（服务器）

只使用原始类别分布进行迁移学习，不做类别重采样、加权损失或随机数据增强。
训练、验证与测试统一采用确定性的 Resize + CenterCrop + ToTensor。
类别编号沿用已有 `class_mapping.json`。

建议使用 Python 3.11 独立环境。根据服务器显卡安装对应 CUDA 的
`torch==2.5.1` 和 `torchvision==0.20.1`，然后在 `pear-vision` 目录执行：

```bash
python -m pip install -r scripts/requirements-classifier.txt
python scripts/train_classifier.py --dry-run
python scripts/train_classifier.py --device 0 --epochs 80 --batch 32
```

首次运行默认下载 `yolo11n-cls.pt`。无网络服务器可事先将权重上传，并指定
`--model /path/to/yolo11n-cls.pt`。数据路径默认相对于脚本定位，不依赖当前工作目录。
把 `data/prepared` 整个目录上传，包含 manifest 和 class_mapping；不需要原始 Pear 目录。
脚本启动时核对划分清单、类别及重复项，并对实际文件内容生成数据指纹。

输出默认位于 `runs/classifier/`：

- `baseline_seed42/weights/best.pt`：按 **验证集 Macro-F1** 选择；测试集不参与选模。
- `baseline_seed42/weights/last.pt`：最后一轮权重。
- `baseline_seed42/evaluation_val/` 和 `evaluation_test/`：每类 Precision/Recall/F1、
  Accuracy、Macro-F1、Balanced Accuracy、混淆矩阵 CSV/图像。
- `metrics.json`、`metrics.csv`、`summary.json`：评估汇总。
- `experiment_plan.json`、`environment.json`：参数、数据指纹和依赖版本。

CPU 检查可使用 `--device cpu --epochs 1 --workers 0 --batch 4`；正式训练建议用单 GPU。
可选 `--seeds 42 43 44` 重复 Baseline，汇总均值与样本标准差。只运行一个种子时标准差为 null。
已有输出不会覆盖，请用 `--output runs/baseline_second_run` 指定新的目录。
当前不支持 DDP 或断点续训，也不会将测试结果反馈给训练。

报告中应同时列出每类样本量和 Recall/F1；healthy 与 curl 测试样本很少，单次结果波动会较大。
`--dry-run` 无需安装训练依赖，也不会下载模型或开始训练。
