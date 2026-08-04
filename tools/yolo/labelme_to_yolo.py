"""将 Labelme rectangle JSON 转换为 Ultralytics YOLO Detection 标签。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
CLASS_IDS = {"person": 0, "crop": 1}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert Labelme rectangles to YOLO labels")
    parser.add_argument("--dataset", type=Path, default=SCRIPT_DIR / "dataset")
    parser.add_argument("--split", choices=("train", "val", "all"), default="all")
    return parser.parse_args()


def convert_split(dataset: Path, split: str) -> tuple[int, int]:
    image_dir = dataset / "images" / split
    annotation_dir = dataset / "annotations" / split
    label_dir = dataset / "labels" / split
    label_dir.mkdir(parents=True, exist_ok=True)
    images = sorted(path for path in image_dir.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    missing = [image.name for image in images if not (annotation_dir / f"{image.stem}.json").is_file()]
    if missing:
        raise SystemExit(f"{split} 缺少 {len(missing)} 个 Labelme JSON：{', '.join(missing[:5])}")

    box_count = 0
    for image in images:
        annotation = annotation_dir / f"{image.stem}.json"
        data = json.loads(annotation.read_text(encoding="utf-8"))
        width = float(data["imageWidth"])
        height = float(data["imageHeight"])
        if width <= 0 or height <= 0:
            raise SystemExit(f"图片尺寸无效：{annotation}")
        lines: list[str] = []
        for shape in data.get("shapes", []):
            label = shape.get("label")
            points = shape.get("points", [])
            if label not in CLASS_IDS:
                raise SystemExit(f"未知标签 {label!r}：{annotation}")
            if shape.get("shape_type") != "rectangle" or len(points) != 2:
                raise SystemExit(f"只支持 rectangle：{annotation}")
            (x1, y1), (x2, y2) = points
            left, right = sorted((max(0.0, min(width, float(x1))), max(0.0, min(width, float(x2)))))
            top, bottom = sorted((max(0.0, min(height, float(y1))), max(0.0, min(height, float(y2)))))
            box_width = right - left
            box_height = bottom - top
            if box_width < 1 or box_height < 1:
                raise SystemExit(f"发现空框：{annotation}")
            center_x = (left + right) / 2 / width
            center_y = (top + bottom) / 2 / height
            lines.append(
                f"{CLASS_IDS[label]} {center_x:.6f} {center_y:.6f} "
                f"{box_width / width:.6f} {box_height / height:.6f}"
            )
            box_count += 1
        (label_dir / f"{image.stem}.txt").write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
    return len(images), box_count


def main() -> None:
    args = parse_args()
    dataset = args.dataset.resolve()
    splits = ("train", "val") if args.split == "all" else (args.split,)
    for split in splits:
        images, boxes = convert_split(dataset, split)
        print(f"{split} 转换完成：{images} 张图片，{boxes} 个检测框")


if __name__ == "__main__":
    main()
