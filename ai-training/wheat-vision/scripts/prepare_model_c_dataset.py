"""Read-only GWHD 2020 CodaLab COCO audit and leakage-aware YOLO preparation.

No training, augmentation, pseudo labels, clipping, or raw mutation. Official
unlabeled test domains remain excluded; true COCO zero-box images are distinct.
Usage: python scripts/prepare_model_c_dataset.py
"""
import argparse
import csv
import hashlib
import itertools
import json
import math
import random
import shutil
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.fft import dctn

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
SPLITS = ("train", "val", "test")
RATIOS = (.70, .15, .15)
SOURCE_URL = "https://zenodo.org/records/4298502"


def digest(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def csv_write(path, rows, fields=None):
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields or list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def bbox_problem(bbox, width, height):
    if not isinstance(bbox, list) or len(bbox) != 4:
        return "invalid_bbox_format"
    if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in bbox):
        return "invalid_bbox_nonfinite"
    x, y, w, h = bbox
    if w <= 0 or h <= 0:
        return "zero_or_negative_area_bbox"
    if not (0 <= x < width and 0 <= y < height and x + w <= width and y + h <= height):
        return "bbox_out_of_bounds"
    return ""


def yolo_box(bbox, width, height):
    problem = bbox_problem(bbox, width, height)
    if problem:
        raise ValueError(problem)
    x, y, w, h = bbox
    return ((x + w / 2) / width, (y + h / 2) / height, w / width, h / height)


class UnionFind:
    def __init__(self, keys):
        self.parent = {key: key for key in keys}

    def find(self, key):
        while self.parent[key] != key:
            self.parent[key] = self.parent[self.parent[key]]
            key = self.parent[key]
        return key

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        self.parent[max(a, b)] = min(a, b)


def parse_coco(raw):
    records, annotations, issues = {}, {}, []
    total_annotations = 0
    for source in sorted(raw.glob("*.json")):
        data = json.loads(source.read_text(encoding="utf-8"))
        if not all(isinstance(data.get(key), list) for key in ("images", "annotations", "categories")):
            raise ValueError(f"Not the inspected COCO schema: {source}")
        categories = {c["id"]: c["name"] for c in data["categories"]}
        if len(categories) != 1 or list(categories.values()) != ["wheat_head"]:
            raise ValueError(f"Unknown class mapping: {source}, {categories}")
        image_ids, annotation_ids = {}, set()
        for image in data["images"]:
            if image["id"] in image_ids:
                raise ValueError(f"Duplicate COCO image ID within source: {source}")
            path = (raw / image["path"]).resolve()
            if not path.is_relative_to(raw.resolve()):
                raise ValueError(f"Unsafe COCO path: {path}")
            if Path(image["file_name"]).name != path.name:
                raise ValueError(f"COCO path/file_name mismatch: {path}")
            if str(path) in records:
                raise ValueError(f"Image described by multiple COCO files: {path}")
            image_ids[image["id"]] = str(path)
            records[str(path)] = {"image_id": f"{source.stem}:{image['id']}",
                                  "annotation_source": str(source), "domain": source.stem,
                                  "expected_width": image["width"], "expected_height": image["height"]}
            annotations[str(path)] = []
            if not path.is_file():
                issues.append({"image_path": str(path), "annotation_id": "", "reason": "annotation_image_missing", "bbox": ""})
        for annotation in data["annotations"]:
            total_annotations += 1
            if annotation["id"] in annotation_ids:
                raise ValueError(f"Duplicate annotation ID: {source}:{annotation['id']}")
            annotation_ids.add(annotation["id"])
            if annotation["image_id"] not in image_ids:
                raise ValueError(f"Orphan annotation: {source}:{annotation['id']}")
            if annotation["category_id"] not in categories or annotation.get("iscrowd", 0) != 0:
                raise ValueError(f"Unsupported category/crowd annotation: {source}:{annotation['id']}")
            annotations[image_ids[annotation["image_id"]]].append(annotation)
    if not records:
        raise ValueError("No inspected official COCO JSON annotations found")
    return records, annotations, issues, total_annotations


def inspect_image(item):
    path, raw, record, annotations = item
    row = {"image_id": record.get("image_id", path.relative_to(raw).as_posix()),
           "image_path": str(path), "filename": path.name, "width": "", "height": "",
           "bbox_count": len(annotations) if record else "",
           "annotation_source": record.get("annotation_source", ""),
           "sha256": digest(path), "usable": False, "exclude_reason": "",
           "domain": path.parent.name, "annotation_status": "annotated" if record else "missing",
           "pixel_sha256": "", "phash": "", "duplicate_annotations": 0,
           "invalid_bbox_count": 0, "out_of_bounds_bbox_count": 0,
           "zero_area_bbox_count": 0, "valid_unique_bbox_count": 0}
    problems, issues, boxes = [], [], []
    thumbnail = None
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            rgb = image.convert("RGB")
            width, height = rgb.size
            row.update(width=width, height=height)
            row["pixel_sha256"] = hashlib.sha256(str(rgb.size).encode() + rgb.tobytes()).hexdigest()
            grey = rgb.convert("L")
            values = np.asarray(grey.resize((32, 32), Image.Resampling.LANCZOS), dtype=float)
            frequencies = dctn(values, type=2, norm="ortho")[:8, :8].reshape(-1)
            bits = frequencies > np.median(frequencies[1:])
            bits[0] = False
            row["phash"] = f"{sum(int(v) << i for i, v in enumerate(bits)):016x}"
            thumbnail = np.asarray(grey.resize((64, 64), Image.Resampling.LANCZOS), dtype=np.float32) / 255
        if record and (width != record["expected_width"] or height != record["expected_height"]):
            problems.append("annotation_dimension_mismatch")
        seen = set()
        for annotation in annotations:
            bbox = annotation.get("bbox")
            problem = bbox_problem(bbox, width, height)
            if problem:
                row["invalid_bbox_count"] += 1
                row["out_of_bounds_bbox_count"] += int(problem == "bbox_out_of_bounds")
                row["zero_area_bbox_count"] += int(problem == "zero_or_negative_area_bbox")
                problems.append(problem)
                issues.append({"image_path": str(path), "annotation_id": annotation["id"], "reason": problem, "bbox": json.dumps(bbox)})
                continue
            key = tuple(bbox)
            if key in seen:
                row["duplicate_annotations"] += 1
                issues.append({"image_path": str(path), "annotation_id": annotation["id"], "reason": "duplicate_annotation", "bbox": json.dumps(bbox)})
                continue
            seen.add(key)
            boxes.append(bbox)
    except (OSError, ValueError, SyntaxError) as error:
        problems.append("corrupt_image")
        issues.append({"image_path": str(path), "annotation_id": "", "reason": f"corrupt_image: {error}", "bbox": ""})
    if not record:
        problems.append("annotation_missing_not_negative")
    row["valid_unique_bbox_count"] = len(boxes)
    row["exclude_reason"] = ";".join(sorted(set(problems)))
    row["usable"] = not problems
    return row, boxes, thumbnail, issues


def duplicate_groups(rows, key):
    groups = defaultdict(list)
    for index, row in enumerate(rows):
        if row[key]:
            groups[row[key]].append(index)
    return [indices for indices in groups.values() if len(indices) > 1]


def similar_pixels(a, b):
    """Conservative corroboration: pHash alone is not source-identity evidence."""
    rmse = float(np.sqrt(np.mean((a - b) ** 2)))
    if rmse <= .025:
        return True, rmse, "pixel_rmse<=0.025"
    if float(a.std()) > .01 and float(b.std()) > .01:
        correlation = float(np.corrcoef(a.reshape(-1), b.reshape(-1))[0, 1])
        if correlation >= .985:
            return True, rmse, "grayscale_correlation>=0.985"
    return False, rmse, "phash_only_candidate"


def choose_domain_split(rows, uf, seed):
    """Whole domain/near-linked components, exhaustive ratio/box optimization."""
    components = defaultdict(list)
    for index, row in enumerate(rows):
        if row["usable"]:
            components[uf.find(row["domain"])].append(index)
    keys = sorted(components)
    if len(keys) < 3:
        raise ValueError("Fewer than three independent source groups; cannot create leakage-free splits")
    totals = [len([r for r in rows if r["usable"]]),
              sum(r["valid_unique_bbox_count"] for r in rows if r["usable"])]
    rng = random.Random(seed)
    assignments = list(itertools.product(range(3), repeat=len(keys)))
    rng.shuffle(assignments)  # seed 42 resolves equal optimization scores
    best, best_score = None, float("inf")
    for assignment in assignments:
        if set(assignment) != {0, 1, 2}:
            continue
        counts, boxes = [0]*3, [0]*3
        for key, split in zip(keys, assignment):
            counts[split] += len(components[key])
            boxes[split] += sum(rows[i]["valid_unique_bbox_count"] for i in components[key])
        score = sum(abs(counts[s]/totals[0]-RATIOS[s]) for s in range(3))
        score += .35 * sum(abs(boxes[s]/totals[1]-RATIOS[s]) for s in range(3)) if totals[1] else 0
        if score < best_score:
            best, best_score = assignment, score
    mapping = {key: SPLITS[split] for key, split in zip(keys, best)}
    for row in rows:
        row["source_group"] = uf.find(row["domain"])
        row["split"] = mapping[row["source_group"]] if row["usable"] else ""
    return mapping


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw", type=Path, default=ROOT / "raw/global-wheat-codalab-official")
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()
    raw = args.raw.resolve()
    destination = ROOT / "data/wheat_head_detection"
    reports = ROOT / "reports"
    if destination.exists():
        raise FileExistsError(f"Refusing to overwrite existing prepared dataset: {destination}")
    if not raw.is_dir():
        raise FileNotFoundError(raw)
    records, annotations, issues, total_annotations = parse_coco(raw)
    images = sorted(p for p in raw.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS)
    raw_files = sorted(p for p in raw.rglob("*") if p.is_file())
    before_metadata = {str(p): (p.stat().st_size, p.stat().st_mtime_ns) for p in raw_files}
    annotation_hashes = {str(p): digest(p) for p in raw.glob("*.json")}
    print(f"[1/4] Official COCO JSON: {len(images)} images, {total_annotations} annotations", flush=True)
    rows, boxes, thumbnails = [], [], []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        items = [(p, raw, records.get(str(p), {}), annotations.get(str(p), [])) for p in images]
        for index, (row, b, thumb, problems) in enumerate(pool.map(inspect_image, items), 1):
            rows.append(row); boxes.append(b); thumbnails.append(thumb); issues.extend(problems)
            if index % 250 == 0 or index == len(images):
                print(f"[audit] {index}/{len(images)}", flush=True)
    exact = duplicate_groups(rows, "sha256")
    pixels = duplicate_groups(rows, "pixel_sha256")
    for group in pixels:
        eligible = [i for i in group if rows[i]["usable"]]
        if len(eligible) < 2:
            continue
        signatures = {tuple(sorted(tuple(b) for b in boxes[i])) for i in eligible}
        if len(signatures) != 1:
            for i in eligible:
                rows[i]["usable"] = False
                rows[i]["exclude_reason"] = "duplicate_image_annotation_conflict"
        else:
            for i in eligible[1:]:
                rows[i]["usable"] = False
                rows[i]["exclude_reason"] = "exact_pixel_duplicate_redundant"
    print("[2/4] Exact/pixel duplicates and conservative near-duplicate screening", flush=True)
    uf = UnionFind({r["domain"] for r in rows})
    near = []
    candidates = [i for i, row in enumerate(rows) if thumbnails[i] is not None]
    for position, i in enumerate(candidates):
        phash_i = int(rows[i]["phash"], 16)
        for j in candidates[:position]:
            distance = (phash_i ^ int(rows[j]["phash"], 16)).bit_count()
            if distance > 4:
                continue
            confirmed, rmse, reason = similar_pixels(thumbnails[i], thumbnails[j])
            near.append({"image_a": rows[j]["image_path"], "image_b": rows[i]["image_path"],
                         "domain_a": rows[j]["domain"], "domain_b": rows[i]["domain"],
                         "phash_distance": distance, "thumbnail_rmse": rmse,
                         "similarity_confirmed": confirmed, "criterion": reason})
            # Conservatively co-group all pHash candidates when both images are eligible.
            # Candidates are not deleted or claimed to be confirmed duplicates.
            if rows[i]["usable"] and rows[j]["usable"]:
                uf.union(rows[i]["domain"], rows[j]["domain"])
    mapping = choose_domain_split(rows, uf, seed=42)
    reports.mkdir(exist_ok=True)
    csv_write(reports / "model_c_raw_manifest.csv", rows)
    csv_write(reports / "model_c_annotation_issues.csv", issues,
              ["image_path", "annotation_id", "reason", "bbox"])
    csv_write(reports / "model_c_near_duplicate_pairs.csv", near,
              ["image_a", "image_b", "domain_a", "domain_b", "phash_distance", "thumbnail_rmse", "similarity_confirmed", "criterion"])
    split_rows = [{**r, "target_image": str(destination / "images" / r["split"] / (r["domain"]+"__"+r["filename"])),
                   "target_label": str(destination / "labels" / r["split"] / (r["domain"]+"__"+Path(r["filename"]).stem+".txt"))}
                  for r in rows if r["usable"]]
    csv_write(reports / "model_c_split_manifest.csv", split_rows)
    print(f"[3/4] Source-exclusive internal split: {mapping}", flush=True)
    for split in SPLITS:
        (destination / "images" / split).mkdir(parents=True)
        (destination / "labels" / split).mkdir(parents=True)
    def export(index):
        row = rows[index]
        filename = row["domain"]+"__"+row["filename"]
        output = destination / "images" / row["split"] / filename
        label = destination / "labels" / row["split"] / (Path(filename).stem+".txt")
        shutil.copy2(row["image_path"], output)
        content = "".join("0 " + " ".join(f"{v:.10f}" for v in yolo_box(b, row["width"], row["height"])) + "\n" for b in boxes[index])
        label.write_text(content, encoding="utf-8")
        if digest(output) != row["sha256"]:
            raise RuntimeError(f"Copy integrity failure: {output}")
        parsed = [line.split() for line in label.read_text().splitlines()]
        if len(parsed) != len(boxes[index]) or any(line[0] != "0" or len(line) != 5 or
                not all(0 <= float(v) <= 1 for v in line[1:]) for line in parsed):
            raise RuntimeError(f"YOLO verification failure: {label}")
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for count, _ in enumerate(pool.map(export, [i for i,r in enumerate(rows) if r["usable"]]), 1):
            if count % 500 == 0:
                print(f"[export] {count}/{len(split_rows)}", flush=True)
    # Absolute dataset root avoids Ultralytics settings/cwd-dependent path resolution.
    yaml_text = f"path: {json.dumps(destination.as_posix())}\ntrain: images/train\nval: images/val\ntest: images/test\nnames:\n  0: wheat_head\n"
    (destination / "wheat_head.yaml").write_text(yaml_text, encoding="utf-8")
    print("[4/4] Full raw hashes, split leakage and output correspondence verification", flush=True)
    for row in rows:
        if digest(Path(row["image_path"])) != row["sha256"]:
            raise RuntimeError(f"Raw image changed: {row['image_path']}")
    for path, sha in annotation_hashes.items():
        if digest(Path(path)) != sha:
            raise RuntimeError(f"Raw annotation changed: {path}")
    after_metadata = {str(p): (p.stat().st_size, p.stat().st_mtime_ns) for p in raw.rglob("*") if p.is_file()}
    if after_metadata != before_metadata:
        raise RuntimeError("Raw file inventory changed")
    sets = {split: {r["sha256"] for r in rows if r["split"] == split} for split in SPLITS}
    cross_exact = sum(len(sets[a] & sets[b]) for a,b in itertools.combinations(SPLITS, 2))
    cross_near = sum(bool(rows[i]["split"] and rows[j]["split"] and rows[i]["split"] != rows[j]["split"])
                     for group in pixels for i,j in itertools.combinations(group, 2))
    paths = {r["image_path"]: r for r in rows}
    cross_near += sum(bool(paths[p["image_a"]]["split"] and paths[p["image_b"]]["split"] and
                           paths[p["image_a"]]["split"] != paths[p["image_b"]]["split"]) for p in near)
    if cross_exact or cross_near:
        raise RuntimeError("Cross-split duplicate/similarity leakage")
    stats = {"raw_images": len(images), "usable_images": len(split_rows), "raw_annotation_boxes": total_annotations,
             "total_boxes": sum(r["valid_unique_bbox_count"] for r in rows if r["usable"]),
             "annotated_images": sum(bool(r["annotation_source"]) for r in rows),
             "images_without_boxes": sum(bool(r["annotation_source"]) and r["bbox_count"] == 0 for r in rows),
             "usable_images_without_boxes": sum(r["usable"] and r["valid_unique_bbox_count"] == 0 for r in rows),
             "missing_annotations": sum(not r["annotation_source"] for r in rows),
             "missing_annotation_images": sum(i["reason"] == "annotation_image_missing" for i in issues),
             "corrupt_images": sum("corrupt_image" in r["exclude_reason"] for r in rows),
             "invalid_bbox": sum(r["invalid_bbox_count"] for r in rows),
             "bbox_out_of_bounds": sum(r["out_of_bounds_bbox_count"] for r in rows),
             "zero_area_bbox": sum(r["zero_area_bbox_count"] for r in rows),
             "duplicate_annotations": sum(r["duplicate_annotations"] for r in rows),
             "exact_duplicate_groups": len(exact), "exact_duplicate": sum(len(g)-1 for g in exact),
             "pixel_duplicate_groups": len(pixels), "pixel_duplicate_redundant": sum(len(g)-1 for g in pixels),
             "phash_candidate_pairs": len(near), "confirmed_similar_pairs": sum(p["similarity_confirmed"] for p in near),
             "cross_split_duplicate": cross_exact, "cross_split_similar_candidate": cross_near,
             "official_split_used": False, "seed": 42, "raw_unchanged": True,
             "annotation_format": "COCO JSON per domain; absolute pixel bbox [x,y,width,height]; category_id1 -> YOLO0",
             "raw_path": str(raw), "source_url": SOURCE_URL, "source_version": "GWHD 2020 CodaLab official V4",
             "source_components": mapping, "ready_for_internal_training": True,
             "ready_for_official_test_benchmark": False}
    for split in SPLITS:
        subset = [r for r in rows if r["split"] == split]
        stats[f"{split}_images"] = len(subset)
        stats[f"{split}_boxes"] = sum(r["valid_unique_bbox_count"] for r in subset)
        stats[f"{split}_domains"] = sorted({r["domain"] for r in subset})
        images_out = list((destination / "images" / split).iterdir())
        labels_out = list((destination / "labels" / split).iterdir())
        if len(images_out) != len(subset) or {p.stem for p in images_out} != {p.stem for p in labels_out}:
            raise RuntimeError("Image/label correspondence failure")
    csv_write(reports / "model_c_split_statistics.csv", [{"metric":k,"value":json.dumps(v) if isinstance(v,(list,dict)) else v} for k,v in stats.items()])
    distribution = Counter(r["bbox_count"] for r in rows if r["annotation_source"])
    csv_write(reports / "model_c_bbox_count_distribution.csv", [{"bbox_count":k,"image_count":v} for k,v in sorted(distribution.items())])
    (reports / "model_c_audit.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    (reports / "model_c_raw_integrity.json").write_text(json.dumps({"image_sha256":{r["image_path"]:r["sha256"] for r in rows}, "annotation_sha256":annotation_hashes, "raw_unchanged":True},indent=2),encoding="utf-8")
    report = ["# Model C Dataset Report", "## 1. 数据来源",
              f"[GWHD 2020官方CodaLab V4]({SOURCE_URL})，DOI10.5281/zenodo.4298502。"
              "已下载本地包，未另行下载7GB数据；没有用2021或Kaggle版替换。官网说明测试标签需申请。",
              f"原始目录保留为 `{raw}`；用户建议的global_wheat_head_2020命名不是硬性要求，未为改名移动/删除raw。",
              "## 2. 原始图片数量", str(stats["raw_images"]), "## 3. 原始bbox数量", str(total_annotations),
              "## 4. 官方标注格式", stats["annotation_format"],
              "JSON实际包含categories/images/annotations；图片path、file_name、width、height；annotation image_id/category_id/bbox/iscrowd。"
              "image_id在各域内解析，不误当跨域唯一。只使用真实bbox，不用segmentation编造新框。",
              "## 5. 清洗规则",
              "全量SHA256、解码像素SHA256、PIL完整解码检查。所有非有限/零面积/负面积/越界bbox记录并排除整图，不裁剪原标注。"
              "完全相同bbox的重复标注只在派生YOLO去重并记录。相同图像且框标注冲突整组排除；标注一致时保留一个代表。"
              "有COCO image记录但annotations为空才是有效零目标背景；没有COCO记录的图不能当负样本。",
              "## 6. 最终usable图片", str(stats["usable_images"]),
              f"无标注{stats['missing_annotations']}张保留在raw，未导出伪空txt；原已标注零框{stats['images_without_boxes']}张，"
              f"去重后导出背景图{stats['usable_images_without_boxes']}张，创建空txt。",
              "## 7. train/val/test划分",
              "没有可直接沿用的有标签官方三分列表。官方有标签训练池7个域；官方盲测4域无公开JSON。"
              "本次只在有标签池建立内部评估split，official_split_used=no；不声称内部test是官方盲测成绩。"
              "Ultralytics示例把ethz同时列于train/val并警告重叠，不能原样复制。"
              "seed42，整个domain作为不可拆分来源组，近似候选连接的domain共同归组；独立来源覆盖优先于精确70/15/15。"
              "穷举来源组划分，优化图片比例和bbox总数比例，不根据训练表现挑划分。"
              "该策略不可能让同一domain在三split都有覆盖；这是来源外推评估，不是随机图像划分。",
              json.dumps(mapping,indent=2), "## 8. 各split bbox数量",
              json.dumps({s:{"images":stats[f'{s}_images'],"boxes":stats[f'{s}_boxes'],"domains":stats[f'{s}_domains']} for s in SPLITS},indent=2),
              "## 9. Duplicate检查",
              f"exact文件哈希冗余{stats['exact_duplicate']}张；解码像素冗余{stats['pixel_duplicate_redundant']}张。"
              f"64位pHash距离≤4候选{len(near)}对，其中像素RMSE≤0.025或灰度相关≥0.985佐证{stats['confirmed_similar_pairs']}对。"
              "pHash不证明同源，候选仅用于保守共同分组，不凭近似删除图像。没有穷尽所有裁剪/视角变化同源关系。",
              "## 10. Corrupt检查", str(stats["corrupt_images"]),
              "## 11. Bbox合法性检查",
              json.dumps({k:stats[k] for k in ['invalid_bbox','bbox_out_of_bounds','zero_area_bbox','duplicate_annotations','missing_annotations','missing_annotation_images']},indent=2),
              "bbox_count_distribution与annotation_issues另存CSV；未知框数在manifest保持空，不伪装为0。"
              "normalized YOLO为0 xc yc w h，精度10小数；class0=wheat_head。路径yaml采用实际绝对目录，避免受YOLO工作目录设置影响。",
              "## 12. 跨split重复", f"exact={cross_exact}，像素/近似候选跨split={cross_near}。导出图片SHA及txt对应已核验，raw图像/JSON哈希和文件清单/时间戳未变。",
              "## 13. 正式训练条件",
              "具备内部有标签Model C训练/验证/测试的格式与完整性条件；没有开始训练。"
              "不具备官方盲测本地带标签评估条件，官方test标签仍需依来源申请。"
              "count可由框数计算；绝对田间density需要实际面积/尺度信息，不能仅按图像框数推断平方米密度。没有训练、增强、伪标签或人为补框。",
              "## 完整统计", "```json\n"+json.dumps(stats,ensure_ascii=False,indent=2)+"\n```"]
    (reports / "MODEL_C_DATASET_REPORT.md").write_text("\n\n".join(report)+"\n",encoding="utf-8")
    print(json.dumps(stats,ensure_ascii=False,indent=2),flush=True)


if __name__ == "__main__":
    main()
