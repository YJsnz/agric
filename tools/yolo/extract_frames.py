"""从监控视频抽帧，并建立 Ultralytics YOLO 数据集目录。"""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract frames for person/crop annotation")
    parser.add_argument("--video", type=Path, default=PROJECT_ROOT / "docs" / "mo.mp4")
    parser.add_argument("--dataset", type=Path, default=SCRIPT_DIR / "dataset")
    parser.add_argument("--every", type=int, default=1, help="Save every Nth frame")
    parser.add_argument("--val-every", type=int, default=5, help="Put every Nth saved image into val")
    parser.add_argument("--jpeg-quality", type=int, default=94)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    video_path = args.video.resolve()
    dataset = args.dataset.resolve()
    if args.every < 1 or args.val_every < 2:
        raise SystemExit("--every 必须 >= 1，--val-every 必须 >= 2")
    if not video_path.is_file():
        raise SystemExit(f"视频不存在：{video_path}")

    for split in ("train", "val"):
        (dataset / "images" / split).mkdir(parents=True, exist_ok=True)
        (dataset / "labels" / split).mkdir(parents=True, exist_ok=True)

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise SystemExit(f"OpenCV 无法打开视频：{video_path}")

    source_stem = video_path.stem
    frame_index = 0
    saved = 0
    train_count = 0
    val_count = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if frame_index % args.every == 0:
            split = "val" if saved % args.val_every == args.val_every - 1 else "train"
            output = dataset / "images" / split / f"{source_stem}_{frame_index:06d}.jpg"
            if not cv2.imwrite(str(output), frame, [cv2.IMWRITE_JPEG_QUALITY, args.jpeg_quality]):
                raise RuntimeError(f"图片写入失败：{output}")
            saved += 1
            if split == "train":
                train_count += 1
            else:
                val_count += 1
        frame_index += 1
    capture.release()

    print(f"抽帧完成：train={train_count}, val={val_count}, total={saved}")
    print(f"图片目录：{dataset / 'images'}")
    print("下一步：为每张图片标注 person(0) 与 crop(1)，标签保存到对应 labels 目录。")


if __name__ == "__main__":
    main()
