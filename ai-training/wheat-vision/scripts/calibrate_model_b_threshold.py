"""Validation-only threshold selection, followed by one fixed test comparison.

No training, augmentation, split changes, or weight updates. Model scores are
for treatment-derived weak labels, not probabilities of physical water deficit.
Run: python scripts/calibrate_model_b_threshold.py
"""
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import evaluate_model_b as evaluation

E = evaluation


def evaluate_threshold(rows, threshold):
    predictions = [{**row, "pred_label": "water_stress" if row["prob_water_stress"] >= threshold else "normal"}
                   for row in rows]
    metrics = E.flat_metrics(E.metrics(predictions))
    matrix = E.confusion_matrix([r["true_label"] for r in predictions],
                               [r["pred_label"] for r in predictions], labels=E.CLASSES).tolist()
    return {"threshold": threshold, **metrics, "confusion_matrix": json.dumps(matrix)}


def select_best(sweep, objective):
    """Never sees test data. Max objective; exact ties favor recall then precision.

    'Very close' is limited to numerical equality (1e-12). This avoids sacrificing
    validation balanced accuracy through an arbitrary tolerance/precision floor.
    Recall tie-breaking never overrides the primary objective. Precision is the
    next tie-break, then proximity to 0.5, then lower threshold for reproducibility.
    """
    maximum = max(row[objective] for row in sweep)
    tied = [row for row in sweep if abs(row[objective] - maximum) <= 1e-12]
    return max(tied, key=lambda row: (row["water_stress_recall"], row["water_stress_precision"],
                                     -abs(row["threshold"] - .5), -row["threshold"]))


def predict_scores(model, items, device, phase):
    indices = {name: index for index, name in model.names.items()}
    if set(indices) != set(E.CLASSES):
        raise ValueError(f"Unexpected model classes: {indices}")
    rows = []
    for start in range(0, len(items), 16):
        batch = items[start:start + 16]
        outputs = model.predict([str(path) for path, _, _ in batch], imgsz=224, workers=0,
                                device=device, batch=16, half=False, augment=False, save=False, verbose=False)
        if len(batch) != len(outputs):
            raise RuntimeError("Prediction cardinality mismatch")
        for (path, label, meta), output in zip(batch, outputs):
            if Path(output.path).resolve() != path.resolve():
                raise RuntimeError("Prediction path mismatch")
            scores = {f"prob_{c}": float(output.probs.data[indices[c]]) for c in E.CLASSES}
            rows.append({"image_path": str(path), "filename": path.name, "true_label": label, **scores,
                         **{k: meta.get(k, "") for k in ("season", "date", "plot_id", "treatment")}})
        print(f"[{phase}] scores {len(rows)}/{len(items)}", flush=True)
    return rows


def main():
    if E.ultralytics.__version__ != "8.3.40":
        raise RuntimeError("Requires Ultralytics 8.3.40")
    manifest_path = E.REPORTS / "model_b_weak_split_manifest.csv"
    manifest = E.read_csv(manifest_path)
    test_items, snapshot, dataset, leakage = E.audit_inputs(manifest)
    protected = {str(p): E.sha(p) for p in (E.WEIGHTS, manifest_path)}
    inventory = {str(p): (p.stat().st_size, p.stat().st_mtime_ns)
                 for p in E.DATA.rglob("*") if p.is_file()}
    val_items = []
    for label in E.CLASSES:
        for path in sorted((E.DATA / "val" / label).rglob("*")):
            if path.is_file() and path.suffix.lower() in E.EXTS:
                meta = E.manifest_match(path, snapshot[str(path)], manifest)
                val_items.append((path, label, meta))
    if Counter(label for _, label, _ in val_items) != {"normal": 95, "water_stress": 94}:
        raise ValueError("Unexpected validation composition")
    device = 0 if E.torch.cuda.is_available() else "cpu"
    model = E.YOLO(str(E.WEIGHTS))
    print("[1/3] Validation inference only; no test scores used for selection", flush=True)
    val_rows = predict_scores(model, val_items, device, "val")
    E.write_csv("model_b_threshold_val_predictions.csv", val_rows)
    sweep = [evaluate_threshold(val_rows, integer / 100) for integer in range(5, 96)]
    E.write_csv("model_b_threshold_sweep_val.csv", sweep)
    best_f1 = select_best(sweep, "macro_f1")
    best_ba = select_best(sweep, "balanced_accuracy")
    lock = {"locked_at_utc": datetime.now(timezone.utc).isoformat(), "selection_split": "val",
            "test_used_for_selection": False, "scan": {"minimum": .05, "maximum": .95, "step": .01},
            "selection_rule": "Max validation balanced accuracy; numerical ties (1e-12): higher water_stress recall, higher precision, closer to 0.5, lower threshold",
            "best_macro_f1": best_f1, "best_balanced_accuracy": best_ba,
            "selected_threshold": best_ba["threshold"], "model_sha256": protected[str(E.WEIGHTS)],
            "manifest_sha256": protected[str(manifest_path)], "val_samples": len(val_rows),
            "score_semantics": "water-stress-treatment visual similarity model score; treatment-derived weak label"}
    lock_path = E.REPORTS / "model_b_threshold_lock.json"
    lock_path.write_text(json.dumps(lock, ensure_ascii=False, indent=2), encoding="utf-8")
    lock_digest = E.sha(lock_path)
    selected = json.loads(lock_path.read_text(encoding="utf-8"))["selected_threshold"]
    print(f"[2/3] LOCKED from validation: threshold={selected}; "
          f"BA={best_ba['balanced_accuracy']:.6f}, WS recall={best_ba['water_stress_recall']:.6f}, "
          f"WS precision={best_ba['water_stress_precision']:.6f}", flush=True)
    # Only after the durable lock is written do we run inference on the test set.
    print("[3/3] One test inference pass; evaluate 0.5 and locked threshold only", flush=True)
    test_rows = predict_scores(model, test_items, device, "test")
    comparison = [{"decision_rule": name, **evaluate_threshold(test_rows, threshold)}
                  for name, threshold in (("default", .5), ("calibrated", selected))]
    baseline, calibrated = comparison
    if abs(baseline["accuracy"] - .587) > .01 or json.loads(baseline["confusion_matrix"]) != [[90, 6], [72, 21]]:
        raise RuntimeError("STOP: default test baseline does not match formal Model B evaluation")
    if E.sha(lock_path) != lock_digest:
        raise RuntimeError("Threshold lock changed during test evaluation")
    for path, digest in {**snapshot, **protected}.items():
        if E.sha(Path(path)) != digest:
            raise RuntimeError(f"Protected input changed: {path}")
    after = {str(p): (p.stat().st_size, p.stat().st_mtime_ns)
             for p in E.DATA.rglob("*") if p.is_file()}
    if after != inventory:
        raise RuntimeError("Dataset file inventory/metadata changed")
    E.write_csv("model_b_threshold_test_comparison.csv", comparison)
    E.write_csv("model_b_threshold_test_scores.csv", test_rows)
    deltas = {metric: calibrated[metric] - baseline[metric]
              for metric in ("accuracy", "macro_f1", "balanced_accuracy", "water_stress_recall", "water_stress_precision")}
    # Descriptive threshold is predetermined; not a statistical significance test.
    material = deltas["macro_f1"] >= .05 and deltas["balanced_accuracy"] >= .05
    conclusion = ("按预先固定的描述性标准（Macro-F1 和 Balanced Accuracy 均提升≥0.05），改善明显；"
                  "default 0.5 threshold is poorly calibrated for this model。"
                  if material else "未达到两项均提升≥0.05的描述性改善标准；decision threshold is not the main bottleneck。")
    conclusion += "此处没有开展显著性检验，不能称为统计显著；同一 plot 多日期图像也并非独立样本。"
    val_default = next(row for row in sweep if row["threshold"] == .5)
    report = ["# Model B Validation-set Threshold Calibration",
              "仅对固定 v12 best.pt 决策阈值校准；不重新训练、不改权重或数据。",
              "water_stress 仍是 treatment-derived weak label，表示 deficit-irrigation treatment group。"
              "prob_water_stress 是 model score / water-stress-treatment visual similarity score，不是真实缺水概率。",
              "## Procedure and locked selection",
              "Ultralytics 8.3.40；imgsz=224；workers=0；FP32；无增强。验证集 189 张（normal95/water_stress94），"
              "0.05–0.95（0.01步长）共91阈值。预测规则：score≥threshold 则 water_stress，否则 normal。",
              "选取 Val Balanced Accuracy 严格最高者；仅1e-12内的数值平局按 water_stress Recall、Precision、"
              "距0.5最近、较低阈值依次打破。没有任意放宽最高BA的‘接近’范围，没有用test设置precision门槛。"
              "平局时优先recall，再以precision避免不必要牺牲；实际precision变化如下表披露，不通过test回调。",
              f"best Macro-F1 threshold={best_f1['threshold']:.2f}, Val Macro-F1={best_f1['macro_f1']:.6f}。\n"
              f"best Balanced Accuracy threshold={best_ba['threshold']:.2f}, Val BA={best_ba['balanced_accuracy']:.6f}。\n"
              f"selected_threshold={selected:.2f}；锁定时间 {lock['locked_at_utc']}；锁定文件 model_b_threshold_lock.json。",
              E.table([{"rule": name, **row} for name, row in (("default", val_default), ("selected", best_ba))],
                      ["rule", "threshold", "accuracy", "macro_f1", "balanced_accuracy", "water_stress_recall", "water_stress_precision"]),
              "阈值在test推理前写入锁定文件，test期间锁定SHA不变。两候选阈值的选择只看val，"
              "test只计算0.5和最终固定阈值，未在test扫描/选择阈值。",
              "## Fixed test comparison",
              E.table(comparison, ["decision_rule", "threshold", "sample_count", "accuracy", "macro_precision", "macro_recall",
                                   "macro_f1", "balanced_accuracy", "normal_precision", "normal_recall", "normal_f1_score",
                                   "water_stress_precision", "water_stress_recall", "water_stress_f1_score", "confusion_matrix"]),
              "矩阵行列顺序均为normal, water_stress；不使用医学诊断TP/TN语义。默认结果与此前正式评估完全一致。",
              "## Improvement and limitations", json.dumps(deltas, indent=2), conclusion,
              "阈值校准改变分类操作点，不提升特征/分数排序能力，也不是概率校准。"
              "表现仅针对原实验测试集；不能推断黄骅实地缺水诊断能力。"
              "exact deficit-irrigation start date is unknown；未确认逐图实际水分胁迫。",
              "## Integrity", f"按现有manifest核对1226张图完整SHA256，跨split plot/SHA泄漏：{leakage}；"
              "运行前后图像、数据文件清单/时间戳、模型、manifest均未改变。raw未访问/修改。"
              "本次只新增校准脚本与报告，不覆盖此前正式baseline评估报告。",
              "## Artifacts", "- model_b_threshold_sweep_val.csv\n- model_b_threshold_test_comparison.csv\n"
              "- model_b_threshold_curve.png\n- model_b_threshold_lock.json\n"
              "- model_b_threshold_val_predictions.csv\n- model_b_threshold_test_scores.csv",
              "本阶段完成后停止，未训练或继续按test调参。"]
    (E.REPORTS / "MODEL_B_THRESHOLD_CALIBRATION.md").write_text("\n\n".join(report)+"\n", encoding="utf-8")
    fig, ax = E.plt.subplots(figsize=(9, 5))
    for metric in ("macro_f1", "balanced_accuracy", "water_stress_recall", "water_stress_precision"):
        ax.plot([r["threshold"] for r in sweep], [r[metric] for r in sweep], label="Val " + metric)
    ax.axvline(selected, color="black", linestyle="--", label=f"Locked threshold {selected:.2f}")
    ax.set(xlabel="water_stress treatment-derived model score threshold", ylabel="Validation score",
           ylim=(0, 1.02), title="Model B threshold selection: validation only")
    ax.legend()
    fig.tight_layout()
    fig.savefig(E.REPORTS / "model_b_threshold_curve.png", dpi=180)
    E.plt.close(fig)
    print(json.dumps({"best_macro_f1": best_f1, "best_balanced_accuracy": best_ba,
                      "selected_threshold": selected, "test_comparison": comparison,
                      "test_deltas": deltas, "conclusion": conclusion}, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
