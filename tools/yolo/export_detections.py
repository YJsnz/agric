"""使用真实 YOLO 权重逐帧跟踪视频，导出给 Vue 监控页读取的检测 JSON。"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import torch
from ultralytics import YOLO


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]
SUPPORTED_CLASSES = {"person", "crop"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export tracked YOLO detections for the monitor UI")
    parser.add_argument("--model", type=Path, help="best.pt；不提供时自动选择最新训练产物")
    parser.add_argument("--video", type=Path, default=PROJECT_ROOT / "docs" / "mo.mp4")
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "frontend" / "public" / "assets" / "media" / "greenhouse-monitor.detections.json")
    parser.add_argument("--confidence", type=float, default=0.01)
    parser.add_argument("--iou", type=float, default=0.5)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="auto")
    return parser.parse_args()


def model_names(model: YOLO) -> dict[int, str]:
    names = model.names
    if isinstance(names, list):
        return {index: name for index, name in enumerate(names)}
    return {int(index): str(name) for index, name in names.items()}


def main() -> None:
    args = parse_args()
    if args.model:
        model_path = args.model.resolve()
    else:
        candidates = list((SCRIPT_DIR / "runs").glob("greenhouse-person-crop*/weights/best.pt"))
        if not candidates:
            raise SystemExit("没有找到 best.pt，请先训练或通过 --model 指定权重")
        model_path = max(candidates, key=lambda path: path.stat().st_mtime).resolve()
    video_path = args.video.resolve()
    output_path = args.output.resolve()
    if not model_path.is_file():
        raise SystemExit(f"模型权重不存在：{model_path}")
    if not video_path.is_file():
        raise SystemExit(f"视频不存在：{video_path}")

    device: str | int = args.device
    if args.device == "auto":
        device = 0 if torch.cuda.is_available() else "cpu"
    model = YOLO(str(model_path))
    names = model_names(model)
    class_ids = [class_id for class_id, name in names.items() if name in SUPPORTED_CLASSES]
    missing = SUPPORTED_CLASSES - set(names.values())
    if missing:
        raise SystemExit(f"权重缺少类别 {sorted(missing)}；实际类别为 {names}")

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise SystemExit(f"OpenCV 无法打开视频：{video_path}")
    fps = float(capture.get(cv2.CAP_PROP_FPS) or 25.0)
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    frames: list[dict[str, Any]] = []
    frame_index = 0

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        result = model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=class_ids,
            conf=args.confidence,
            iou=args.iou,
            imgsz=args.imgsz,
            device=device,
            verbose=False,
        )[0]
        frame_detections: list[dict[str, Any]] = []
        boxes = result.boxes
        if boxes is not None and len(boxes):
            xyxy = boxes.xyxy.cpu().tolist()
            confidences = boxes.conf.cpu().tolist()
            classes = boxes.cls.int().cpu().tolist()
            track_ids = boxes.id.int().cpu().tolist() if boxes.id is not None else list(range(len(boxes)))
            for box, confidence, class_id, track_id in zip(xyxy, confidences, classes, track_ids):
                x1, y1, x2, y2 = box
                kind = names[class_id]
                frame_detections.append({
                    "id": f"{kind}-{track_id}",
                    "kind": kind,
                    "confidence": round(float(confidence), 4),
                    "x": round(max(0.0, x1 / width * 100), 3),
                    "y": round(max(0.0, y1 / height * 100), 3),
                    "width": round(min(100.0, (x2 - x1) / width * 100), 3),
                    "height": round(min(100.0, (y2 - y1) / height * 100), 3),
                })
        frames.append({
            "index": frame_index,
            "time": round(frame_index / fps, 4),
            "detections": frame_detections,
        })
        frame_index += 1
        print(f"\r推理进度：{frame_index}/{total}", end="", flush=True)

    capture.release()
    print()
    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "model": {"file": model_path.name, "classes": ["person", "crop"], "tracker": "ByteTrack"},
        "video": {"file": video_path.name, "fps": fps, "width": width, "height": height, "frameCount": len(frames), "duration": len(frames) / fps},
        "frames": frames,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"真实检测结果已写入：{output_path}")
    print(f"共导出 {len(frames)} 帧、{sum(len(item['detections']) for item in frames)} 个检测框。")


if __name__ == "__main__":
    main()
