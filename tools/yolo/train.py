"""训练只有 person / crop 两个类别的 YOLO 检测模型。"""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
import yaml
from ultralytics import YOLO


SCRIPT_DIR = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train greenhouse person/crop detector")
    parser.add_argument("--data", type=Path, default=SCRIPT_DIR / "dataset.yaml")
    parser.add_argument("--model", default="yolo11n.pt", help="Pretrained model or local .pt path")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--device", default="auto", help="auto, cpu, 0, 0,1 ...")
    parser.add_argument("--name", default="greenhouse-person-crop")
    parser.add_argument("--workers", type=int, default=4)
    return parser.parse_args()


def runtime_dataset_yaml(source: Path) -> Path:
    source = source.resolve()
    config = yaml.safe_load(source.read_text(encoding="utf-8"))
    dataset_root = Path(config.get("path", "."))
    if not dataset_root.is_absolute():
        dataset_root = (source.parent / dataset_root).resolve()
    config["path"] = str(dataset_root)
    runtime = SCRIPT_DIR / ".dataset.runtime.yaml"
    runtime.write_text(yaml.safe_dump(config, allow_unicode=True, sort_keys=False), encoding="utf-8")
    return runtime


def validate_dataset(dataset_root: Path) -> None:
    for split in ("train", "val"):
        images = list((dataset_root / "images" / split).glob("*"))
        labels = list((dataset_root / "labels" / split).glob("*.txt"))
        if not images:
            raise SystemExit(f"{split} 没有图片：{dataset_root / 'images' / split}")
        if not labels:
            raise SystemExit(f"{split} 没有 YOLO 标签：{dataset_root / 'labels' / split}")


def main() -> None:
    args = parse_args()
    data_source = args.data.resolve()
    config = yaml.safe_load(data_source.read_text(encoding="utf-8"))
    dataset_root = Path(config.get("path", "."))
    if not dataset_root.is_absolute():
        dataset_root = (data_source.parent / dataset_root).resolve()
    validate_dataset(dataset_root)

    device: str | int = args.device
    if args.device == "auto":
        device = 0 if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        print("警告：CUDA 当前不可用，将使用 CPU；训练会明显变慢。")

    runtime_yaml = runtime_dataset_yaml(data_source)
    try:
        model = YOLO(args.model)
        results = model.train(
            data=str(runtime_yaml),
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            device=device,
            workers=args.workers,
            project=str(SCRIPT_DIR / "runs"),
            name=args.name,
            pretrained=True,
            amp=device != "cpu",
            patience=20,
            plots=True,
        )
    finally:
        runtime_yaml.unlink(missing_ok=True)

    best = Path(results.save_dir) / "weights" / "best.pt"
    print(f"训练完成。最佳权重：{best}")


if __name__ == "__main__":
    main()
