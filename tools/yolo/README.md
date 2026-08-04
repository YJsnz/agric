# 温室监控 YOLO 接入

这套工具训练并运行两个检测类别：

- `0 person`：每一名可见人员分别画紧致矩形框；
- `1 crop`：对可辨认的作物植株或连续冠层画框，所有图片保持同一种标注尺度。

最终网站不会实时运行 Python。`export_detections.py` 使用真实 YOLO + ByteTrack 分析视频，输出逐帧 JSON；Vue 根据视频当前时间绘制这些真实结果，因此播放性能与模型推理速度无关。

## 1. 创建环境

Linux：

```bash
python3 -m venv tools/yolo/.venv
source tools/yolo/.venv/bin/activate
python -m pip install -U pip
python -m pip install -r tools/yolo/requirements.txt
```

Windows PowerShell：

```powershell
py -m venv tools/yolo/.venv
tools\yolo\.venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r tools/yolo/requirements.txt
```

## 2. 抽帧与标注

在仓库根目录运行：

```bash
python tools/yolo/extract_frames.py
```

脚本会从 `docs/mo.mp4` 导出 38 帧，并按 train/val 放入：

```text
tools/yolo/dataset/
├── images/train
├── images/val
├── labels/train
└── labels/val
```

使用任意支持 YOLO Detection 格式的标注工具。每张图片对应一个同名 `.txt` 标签文件，并放进相同划分的 `labels` 目录。每行格式为：

```text
class_id center_x center_y width height
```

后四项必须是相对图片宽高归一化后的 `0–1` 数值。画面中没有目标时，也应创建一个空的同名 `.txt`。

如果使用 Labelme，JSON 保存到 `dataset/annotations/train` 和 `dataset/annotations/val` 后，执行：

```bash
python tools/yolo/labelme_to_yolo.py
```

转换器会检查图片是否全部标注、标签是否正确，并在 `dataset/labels` 中生成 YOLO `.txt`。

这 38 帧高度相似，只足以让模型拟合当前演示视频。若希望模型识别其他大棚监控，建议补充不同距离、光照、人员姿态和作物密度的图片后再训练。

## 3. 训练

```bash
python tools/yolo/train.py --epochs 80 --batch 8 --imgsz 640
```

默认从轻量 `yolo11n.pt` 迁移学习，RTX 4060 Laptop 使用 `batch=8`。如果显存不足改成 `--batch 4`。最佳权重输出到：

```text
tools/yolo/runs/greenhouse-person-crop/weights/best.pt
```

当前电脑必须先保证 `nvidia-smi` 正常，否则脚本会退回 CPU 训练。

## 4. 导出真实检测结果

```bash
python tools/yolo/export_detections.py
```

默认读取训练得到的 `best.pt` 和 `docs/mo.mp4`，使用 ByteTrack 保持目标 ID，并覆盖：

```text
frontend/public/assets/media/greenhouse-monitor.detections.json
```

然后刷新开发页面即可看到真实框。正式构建运行：

```bash
cd frontend
npm run build
```

如需调整漏检和误检，可重新导出：

```bash
python tools/yolo/export_detections.py --confidence 0.01 --iou 0.5 --imgsz 640
```
