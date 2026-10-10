"""Evaluate the completed Model B only; never train or alter images/splits.

Run with the existing Ultralytics 8.3.40 environment:
    python scripts/evaluate_model_b.py
water_stress is a treatment-derived weak label, not a physical diagnosis.
"""
import csv
import hashlib
import json
import os
import tempfile
from collections import Counter, defaultdict
from pathlib import Path, PureWindowsPath

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
DATA = ROOT / "data/canopy_water_stress"
WEIGHTS = ROOT / "runs/wheat_water_stress_yolo11n_cls_v12/weights/best.pt"
CLASSES = ["normal", "water_stress"]
EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
# Keep library settings/cache out of raw, dataset, and the user profile.
os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(tempfile.gettempdir()) / "wheat_model_b_eval"))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import ultralytics
from sklearn.metrics import (accuracy_score, balanced_accuracy_score,
                             classification_report, confusion_matrix,
                             precision_recall_fscore_support)
from ultralytics import YOLO


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(name, rows, fields=None):
    with (REPORTS / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields or list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def sha(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def manifest_match(path, digest, manifest):
    """Match relocated datasets by target basename AND full SHA, never by label guess."""
    matches = [row for row in manifest if row["sha256"] == digest and
               (PureWindowsPath(row["target_path"]).name == path.name or
                Path(row["target_path"]).name == path.name)]
    if len(matches) > 1:
        raise ValueError(f"Ambiguous manifest match: {path}")
    if not matches:
        # Full SHA is stronger than a filename and survives relocation/renaming.
        matches = [row for row in manifest if row["sha256"] == digest]
        if len(matches) > 1:
            raise ValueError(f"Ambiguous SHA match: {path}")
    return matches[0] if matches else None


def audit_inputs(manifest):
    """Read and verify existing split membership, hashes, weak semantics and leakage."""
    snapshot, tests, statistics = {}, [], {}
    plots, hashes = {}, {}
    for split in ("train", "val", "test"):
        matched, counts = [], Counter()
        for label in CLASSES:
            for path in sorted((DATA / split / label).rglob("*")):
                if not path.is_file() or path.suffix.lower() not in EXTS:
                    continue
                digest = sha(path)
                snapshot[str(path)] = digest
                row = manifest_match(path, digest, manifest)
                if row is None:
                    raise ValueError(f"Cannot verify fixed split against manifest: {path}")
                if row["split"] != split or row["mapped_label"] != label:
                    raise ValueError(f"Split/label mismatch: {path}")
                if row.get("label_strength") != "weak" or row.get("confirmed_stress") != "unknown":
                    raise ValueError(f"Unexpected label semantics: {path}")
                matched.append(row)
                counts[label] += 1
                if split == "test":
                    tests.append((path, label, row))
        plots[split] = {row["plot_id"] for row in matched}
        hashes[split] = {row["sha256"] for row in matched}
        statistics[split] = {"sample_count": len(matched), **dict(counts), "plots": len(plots[split])}
    if len(snapshot) != len(manifest):
        raise ValueError("Dataset and manifest cardinalities differ")
    leakage = {"cross_split_plot": 0, "cross_split_sha256": 0}
    for a, b in (("train", "val"), ("train", "test"), ("val", "test")):
        leakage["cross_split_plot"] += len(plots[a] & plots[b])
        leakage["cross_split_sha256"] += len(hashes[a] & hashes[b])
    if any(leakage.values()) or statistics["test"] != {
            "sample_count": 189, "normal": 96, "water_stress": 93, "plots": 14}:
        raise ValueError(f"Fixed test/leakage check failed: {statistics}, {leakage}")
    return tests, snapshot, statistics, leakage


def metrics(rows):
    truth = [row["true_label"] for row in rows]
    pred = [row["pred_label"] for row in rows]
    p, r, f, support = precision_recall_fscore_support(truth, pred, labels=CLASSES, zero_division=0)
    return {
        "sample_count": len(rows), "accuracy": float(accuracy_score(truth, pred)),
        "macro_precision": float(p.mean()), "macro_recall": float(r.mean()),
        "macro_f1": float(f.mean()), "balanced_accuracy": float(balanced_accuracy_score(truth, pred)),
        "class_metrics": {c: {"precision": float(p[i]), "recall": float(r[i]),
                              "f1_score": float(f[i]), "support": int(support[i])}
                          for i, c in enumerate(CLASSES)},
    }


def grouped(rows, keys):
    groups = defaultdict(list)
    for row in rows:
        groups[tuple(row[k] for k in keys)].append(row)
    return sorted(groups.items())


def flat_metrics(m):
    out = {k: v for k, v in m.items() if k != "class_metrics"}
    for label, values in m["class_metrics"].items():
        out.update({f"{label}_{k}": v for k, v in values.items()})
    return out


def confidence_stats(rows):
    groups = [("all", rows), ("correct", [r for r in rows if r["correct"]]),
              ("wrong", [r for r in rows if not r["correct"]])]
    groups += [("predicted_" + label, [r for r in rows if r["pred_label"] == label]) for label in CLASSES]
    result = []
    for name, group in groups:
        values = [r["confidence"] for r in group]
        result.append({"group": name, "sample_count": len(group),
                       "mean_confidence": float(np.mean(values)) if values else None,
                       "median_confidence": float(np.median(values)) if values else None,
                       "min": min(values) if values else None, "max": max(values) if values else None})
    return result


def table(rows, fields):
    def fmt(value):
        return f"{value:.6f}" if isinstance(value, float) else str(value)
    return "| " + " | ".join(fields) + " |\n| " + " | ".join(["---"] * len(fields)) + " |\n" + "\n".join(
        "| " + " | ".join(fmt(row.get(k, "")) for k in fields) + " |" for row in rows)


def make_report(result, seasons, dates, plots, confidence, training, dataset, leakage):
    sections = ["# Model B Evaluation", "## 1. Task definition",
        "Model B 是实验处理组 weak supervision 冠层视觉分类器。normal 表示对照处理组；"
        "water_stress 是 treatment-derived weak label，表示 post-anthesis deficit-irrigation treatment group，"
        "不表示逐图确认实际缺水。模型置信度不是土壤缺水或疾病概率。", "## 2. Dataset",
        table([{"split": k, **v} for k, v in dataset.items()], ["split", "sample_count", "normal", "water_stress", "plots"]),
        f"本次重新按真实图像 SHA256 核对弱标签 split manifest：{leakage}。"
        "plot-aware split 将同编号 replicate 跨季保守绑定；同一 plot 的不同日期不是独立样本。"
        "原清理审计记录：pre-stress/冲突/损坏进入均为 0，raw 修改为 0；这些历史字段不等于逐图实测胁迫。"
        "清单保存的旧绝对路径与当前嵌套目录不同，本次使用目标文件名与完整 SHA256 匹配，未改清单。",
        "## 3. Training result", json.dumps(training, ensure_ascii=False, indent=2),
        "results.csv 验证最佳 epoch 和验证精度、记录至 epoch 21；early stop 原因由用户提供，"
        "args.yaml patience=15 与 epoch 6 后 15 轮一致。官方 test top1=0.587 是用户提供的参考，非本地日志读取。",
        "## 4. Formal test metrics",
        table([result], ["test_samples", "accuracy", "macro_precision", "macro_recall", "macro_f1", "balanced_accuracy"]),
        f"与参考 0.587 的绝对差：{result['reference_comparison']['absolute_difference']:.6f}；"
        "1 个百分点一致性检查通过。推理 Ultralytics 8.3.40 / imgsz=224 / workers=0 / FP32 / 无增强。",
        "## 5. Per-class metrics",
        table([{"class": c, **m} for c, m in result["class_metrics"].items()], ["class", "precision", "recall", "f1_score", "support"]),
        "## 6. Confusion matrix", "行是真实处理组弱标签，列是预测类别；顺序 normal, water_stress。无医学 TP/TN 含义。",
        "```json\n" + json.dumps(result["confusion_matrix"]) + "\n```", "![Confusion](model_b_confusion_matrix.png)",
        "## 7. Season-wise analysis",
        table(seasons, ["season", "sample_count", "accuracy", "macro_precision", "macro_recall", "macro_f1", "balanced_accuracy"]),
        f"两季 accuracy 差 {abs(seasons[0]['accuracy']-seasons[1]['accuracy']):.4f}；macro-F1 差 "
        f"{abs(seasons[0]['macro_f1']-seasons[1]['macro_f1']):.4f}。这是 season-dependent performance 描述，"
        "不能证明模型学到了季节背景。两季均出现在训练集，故此处不是留一季泛化实验。",
        "## 8. Date-wise analysis",
        table(dates, ["season", "das", "date", "sample_count", "normal_count", "water_stress_count", "accuracy", "macro_f1", "balanced_accuracy"]),
        "最高/最低日期按 accuracy 选取，平局全部保留于 JSON best_dates/worst_dates。每天仅少量测试 plot，"
        "最佳/最差差异不代表实际胁迫强度。",
        "\n".join(result["date_trend_analysis"]), "## 9. Plot-wise analysis",
        table(plots, ["plot_id", "season", "sample_count", "true_treatment", "correct_count", "accuracy", "mean_confidence"]),
        "按季列出 plot；跨季同编号已在 split 中绑定。accuracy≤0.2 仅作为几乎全部误判的描述阈值。"
        "对应组：" + json.dumps([{"plot_id": r["plot_id"], "season": r["season"], "accuracy": r["accuracy"]}
                               for r in plots if r["accuracy"] <= .2], ensure_ascii=False),
        "## 10. Misclassification analysis",
        f"错误 {result['wrong_count']} 张，confidence≥0.8 的错误 {result['high_confidence_wrong_count']} 张。"
        "详见 model_b_misclassified.csv，按置信度降序排列。错误针对处理组标签，不等价实际胁迫漏诊/误诊。",
        "## 11. Confidence analysis", table(confidence, ["group", "sample_count", "mean_confidence", "median_confidence", "min", "max"]),
        "置信度仅为类别模型输出；高置信度错误不能证明或否定实际水分状态。",
        "## 12. Weak-supervision limitations",
        "1. exact deficit-irrigation start date is unknown。\n"
        "2. water_stress is a treatment-derived weak label，未逐图实测胁迫。\n"
        "3. test accuracy should not be interpreted as clinical/physical diagnosis accuracy。\n"
        "4. visual output should be treated as one piece of evidence for downstream multimodal risk reasoning。\n"
        "5. 本数据来自原实验地点而非黄骅实地；尚未验证黄骅部署泛化。\n"
        "6. 日期/季节表现差异不能确认弱标签噪声、视觉捷径或模型容量不足的因果作用。",
        "## 13. Conclusion",
        f"该 baseline 整体 accuracy={result['accuracy']:.2%}、macro-F1={result['macro_f1']:.4f}，"
        "仅有有限处理组可分性，尚不支持实际缺水诊断。"
        f"最直接的实测问题是预测偏向 normal：{result['predicted_class_counts']['normal']}/{result['test_samples']} 张"
        f"预测为 normal，water_stress 处理组 recall 仅 {result['class_metrics']['water_stress']['recall']:.2%}。"
        f"日期 accuracy 范围 {min(r['accuracy'] for r in dates):.2%}–{max(r['accuracy'] for r in dates):.2%}。"
        "存在 date dependence，且没有后期日期单调改善的趋势；两季也存在一定表现差异。"
        "弱标签噪声与模型容量无法单凭这些评估确认。本阶段到此结束，不训练或修改数据。"]
    (REPORTS / "MODEL_B_EVALUATION.md").write_text("\n\n".join(sections) + "\n", encoding="utf-8")


def main():
    if ultralytics.__version__ != "8.3.40":
        raise RuntimeError(f"Required Ultralytics 8.3.40, got {ultralytics.__version__}")
    if not WEIGHTS.is_file():
        raise FileNotFoundError(WEIGHTS)
    manifest_path = REPORTS / "model_b_weak_split_manifest.csv"
    if not manifest_path.is_file():
        manifest_path = REPORTS / "model_b_split_manifest.csv"
    manifest = read_csv(manifest_path)
    tests, snapshot, dataset, leakage = audit_inputs(manifest)
    protected = {str(p): sha(p) for p in [WEIGHTS, manifest_path]}
    # Read-only before/after file metadata inventory catches accidental additions/writes.
    inventory = {str(p): (p.stat().st_size, p.stat().st_mtime_ns) for p in DATA.rglob("*") if p.is_file()}
    model = YOLO(str(WEIGHTS))
    names = {int(k): v for k, v in model.names.items()}
    if set(names.values()) != set(CLASSES):
        raise ValueError(f"Unexpected model classes: {names}")
    indices = {v: k for k, v in names.items()}
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"[info] v12 / {ultralytics.__version__} / {device} / {len(tests)} test images / names={names}", flush=True)
    rows = []
    for start in range(0, len(tests), 16):
        batch = tests[start:start + 16]
        results = model.predict([str(p) for p, _, _ in batch], imgsz=224, device=device,
                                workers=0, batch=16, half=False, augment=False, save=False, verbose=False)
        if len(results) != len(batch):
            raise RuntimeError("Prediction cardinality mismatch")
        for (path, truth, meta), output in zip(batch, results):
            if Path(output.path).resolve() != path.resolve():
                raise RuntimeError("Prediction path/order mismatch")
            prob = output.probs
            pred = names[int(prob.top1)]
            rows.append({"image_path": str(path), "filename": path.name, "true_label": truth,
                         "pred_label": pred, "correct": pred == truth, "confidence": float(prob.top1conf),
                         "prob_normal": float(prob.data[indices["normal"]]),
                         "prob_water_stress": float(prob.data[indices["water_stress"]]),
                         **{k: meta.get(k, "") for k in ("season", "das", "date", "plot_id", "treatment")}})
        print(f"[info] predicted {len(rows)}/{len(tests)}", flush=True)
    overall = metrics(rows)
    difference = abs(overall["accuracy"] - .587)
    if difference > .01:
        raise RuntimeError(f"STOP: accuracy={overall['accuracy']:.6f} differs from 0.587 by {difference:.6f}; "
                           "inspect preprocessing/classes/manifest/weights before accepting results")
    # Verify images, weights and manifest were not changed before writing accepted reports.
    for path, digest in {**snapshot, **protected}.items():
        if sha(Path(path)) != digest:
            raise RuntimeError(f"Input modified during evaluation: {path}")
    after = {str(p): (p.stat().st_size, p.stat().st_mtime_ns) for p in DATA.rglob("*") if p.is_file()}
    if inventory != after:
        raise RuntimeError("Dataset files/metadata changed")
    REPORTS.mkdir(exist_ok=True)
    write_csv("model_b_test_predictions.csv", rows)
    wrong = sorted([r for r in rows if not r["correct"]], key=lambda r: -r["confidence"])
    write_csv("model_b_misclassified.csv", wrong, list(rows[0]))
    seasons = [{"season": key[0], **flat_metrics(metrics(group))} for key, group in grouped(rows, ["season"])]
    write_csv("model_b_season_metrics.csv", seasons)
    dates = []
    for (season, das, date), group in grouped(rows, ["season", "das", "date"]):
        m = metrics(group)
        single = len({r["true_label"] for r in group}) < 2
        dates.append({"season": season, "das": int(das), "date": date, "sample_count": len(group),
                      "normal_count": sum(r["true_label"] == "normal" for r in group),
                      "water_stress_count": sum(r["true_label"] == "water_stress" for r in group),
                      "accuracy": m["accuracy"], "macro_f1": None if single else m["macro_f1"],
                      "balanced_accuracy": None if single else m["balanced_accuracy"],
                      "statistical_note": "single true class; two-class comparison unavailable" if single else "small per-date sample"})
    dates.sort(key=lambda r: (r["season"], r["das"]))
    write_csv("model_b_date_metrics.csv", dates)
    plots = []
    for (plot, season), group in grouped(rows, ["plot_id", "season"]):
        treatments = {r["treatment"] for r in group}
        if len(treatments) != 1:
            raise ValueError(f"Conflicting treatment for {plot}")
        correct = sum(r["correct"] for r in group)
        plots.append({"plot_id": plot, "season": season, "sample_count": len(group),
                      "true_treatment": next(iter(treatments)), "correct_count": correct,
                      "accuracy": correct / len(group), "mean_confidence": float(np.mean([r["confidence"] for r in group]))})
    write_csv("model_b_plot_metrics.csv", plots)
    confidence = confidence_stats(rows)
    write_csv("model_b_confidence_statistics.csv", confidence)
    cr = classification_report([r["true_label"] for r in rows], [r["pred_label"] for r in rows],
                               labels=CLASSES, output_dict=True, zero_division=0)
    write_csv("model_b_classification_report.csv", [{"class": c, "precision": cr[c]["precision"],
              "recall": cr[c]["recall"], "f1_score": cr[c]["f1-score"], "support": int(cr[c]["support"])}
              for c in CLASSES + ["macro avg", "weighted avg"]])
    matrix = confusion_matrix([r["true_label"] for r in rows], [r["pred_label"] for r in rows], labels=CLASSES).tolist()
    train = read_csv(WEIGHTS.parents[1] / "results.csv")
    best = max(train, key=lambda r: float(r["metrics/accuracy_top1"]))
    training = {"best_epoch": int(best["epoch"]), "best_val_top1": float(best["metrics/accuracy_top1"]),
                "last_recorded_epoch": int(train[-1]["epoch"]), "official_test_top1_user_provided": .587}
    best_dates = [d for d in dates if d["accuracy"] == max(r["accuracy"] for r in dates)]
    worst_dates = [d for d in dates if d["accuracy"] == min(r["accuracy"] for r in dates)]
    trends = []
    for season in ("1", "2"):
        series = [r for r in dates if r["season"] == season]
        monotonic = all(a["accuracy"] <= b["accuracy"] and a["macro_f1"] <= b["macro_f1"]
                        for a, b in zip(series, series[1:]) if a["macro_f1"] is not None and b["macro_f1"] is not None)
        trends.append(f"Season {season}: first→last accuracy {series[0]['accuracy']:.4f}→{series[-1]['accuracy']:.4f}，"
                      f"macro-F1 {series[0]['macro_f1']:.4f}→{series[-1]['macro_f1']:.4f}；"
                      + ("序列非递减，但不能解释为胁迫加重。" if monotonic else "中间日期有波动，无单调增强趋势；不能解释为胁迫强度变化。"))
    result = {"model_path": str(WEIGHTS), "dataset_path": str(DATA / "test"), "test_samples": len(rows),
              **{k: v for k, v in overall.items() if k != "sample_count"}, "class_order": CLASSES,
              "confusion_matrix": matrix, "season_metrics_summary": seasons,
              "best_date": best_dates[0], "worst_date": worst_dates[0], "best_dates": best_dates, "worst_dates": worst_dates,
              "high_confidence_wrong_count": sum(r["confidence"] >= .8 for r in wrong), "wrong_count": len(wrong),
              "predicted_class_counts": dict(Counter(r["pred_label"] for r in rows)),
              "observed_issue": "normal prediction bias and date-dependent performance; weak-label noise/model capacity not identifiable from this evaluation",
              "reference_comparison": {"reference_accuracy": .587, "absolute_difference": difference, "within_one_percentage_point": True},
              "training": training, "dataset_statistics": dataset, "leakage": leakage,
              "date_trend_analysis": trends, "ultralytics_version": ultralytics.__version__,
              "inference": {"imgsz": 224, "workers": 0, "device": device, "half": False, "augment": False},
              "integrity": {"dataset_images_verified": len(snapshot), "dataset_unchanged": True, "weights_unchanged": True,
                            "manifest_unchanged": True, "raw_accessed_or_modified": False},
              "disclaimer": "Treatment-derived weak labels; confidence is not physical water-deficit probability."}
    (REPORTS / "model_b_test_metrics.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(matrix, cmap="Blues", vmin=0)
    fig.colorbar(im, ax=ax)
    ax.set(xticks=[0, 1], yticks=[0, 1], xticklabels=CLASSES, yticklabels=CLASSES,
           xlabel="Predicted treatment-derived class", ylabel="True weak label", title="Model B: fixed test set")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(matrix[i][j]), ha="center", va="center", color="white" if matrix[i][j] > np.max(matrix)/2 else "black")
    fig.tight_layout()
    fig.savefig(REPORTS / "model_b_confusion_matrix.png", dpi=180)
    plt.close(fig)
    fig, ax = plt.subplots(figsize=(9, 4))
    for season in ("1", "2"):
        series = [r for r in dates if r["season"] == season]
        ax.plot([r["das"] for r in series], [r["accuracy"] for r in series], marker="o", label=f"Season {season} accuracy")
        ax.plot([r["das"] for r in series], [r["macro_f1"] for r in series], marker="x", linestyle="--", label=f"Season {season} macro-F1")
    ax.set(xlabel="DAS (original metadata)", ylabel="Score", ylim=(0, 1), title="Per-date treatment-group separability (weak labels)")
    ax.legend()
    fig.tight_layout()
    fig.savefig(REPORTS / "model_b_date_accuracy.png", dpi=180)
    plt.close(fig)
    make_report(result, seasons, dates, plots, confidence, training, dataset, leakage)
    print(json.dumps(result, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
