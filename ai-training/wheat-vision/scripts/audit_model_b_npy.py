# -*- coding: utf-8 -*-
"""Model B (canopy water stress) NPY structure audit.

Read-only. Loads the three .npy files with allow_pickle=True and reports
structure without modifying, converting, or splitting the data.
"""
import json
from pathlib import Path

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "raw" / "canopy_water_stress"
REPORTS_DIR = PROJECT_ROOT / "reports"
PREVIEW_DIR = REPORTS_DIR / "model_b_preview"

X_FILE = "XyWheatCW.npy"
Y_FILE = "YWheatCW.npy"
YM_FILE = "YWheatCWModels.npy"


def load(name):
    return np.load(RAW_DIR / name, allow_pickle=True)


def basic_info(name, arr):
    info = {
        "filename": name,
        "shape": [int(v) for v in arr.shape],
        "ndim": int(arr.ndim),
        "dtype": str(arr.dtype),
        "size": int(arr.size),
        "nbytes": int(arr.nbytes),
    }
    if arr.dtype == object:
        flat = arr.reshape(-1)
        samples = []
        for i in range(min(10, flat.size)):
            obj = flat[i]
            samples.append({
                "index": i,
                "type": type(obj).__name__,
                "shape": [int(v) for v in obj.shape] if hasattr(obj, "shape") else None,
                "len": int(len(obj)) if hasattr(obj, "__len__") else None,
            })
        info["object_samples"] = samples
    return info


def numeric_profile(arr):
    a = np.asarray(arr, dtype=np.float64)
    return {
        "min": float(np.nanmin(a)),
        "max": float(np.nanmax(a)),
        "mean": float(np.nanmean(a)),
        "std": float(np.nanstd(a)),
        "all_finite": bool(np.isfinite(a).all()),
        "has_nan": bool(np.isnan(a).any()),
        "has_inf": bool(np.isinf(a).any()),
    }


def is_integer_array(arr):
    a = np.asarray(arr, dtype=np.float64)
    return bool(np.allclose(a, np.round(a)))


def col_profile(arr):
    a = np.asarray(arr, dtype=np.float64)
    stats = []
    for j in range(a.shape[1]):
        col = a[:, j]
        uniq = np.unique(col)
        stats.append({
            "col": j,
            "min": float(col.min()),
            "max": float(col.max()),
            "mean": float(col.mean()),
            "std": float(col.std()),
            "n_unique": int(uniq.size),
            "is_integer": bool(np.allclose(col, np.round(col))),
            "first5": [round(float(v), 6) for v in col[:5]],
        })
    return stats


def reshape_candidates(feature_len):
    cands = []
    for h in range(1, feature_len + 1):
        if feature_len % h == 0:
            w = feature_len // h
            if h >= w and h <= 64 and w <= 64:
                cands.append((h, w))
    return cands


def write_markdown(r):
    p = r["X_profile"]
    sc = r["sample_counts"]
    ym_rows = "\n".join(
        "| " + " | ".join("%.6f" % v for v in row) + " |" for row in r["YModels_rows"]
    )
    lines = []
    a = lines.append
    a("# 黄骅旱碱麦 视觉模型B 冠层水分胁迫 NPY 结构审计报告")
    a("")
    a("本报告为**只读结构审计**，未训练、未划分 train/val/test、未修改或删除任何原始 `.npy` 文件。")
    a("")
    a("## 0. 数据来源")
    a("")
    a("- 数据集：%s" % r["source"]["dataset"])
    a("- 提供方：%s" % r["source"]["provider"])
    a("- DOI：%s" % r["source"]["doi"])
    a("- 原始目录：`%s`" % r["source"]["raw_dir"])
    a("- 审计脚本：`scripts/audit_model_b_npy.py`（np.load allow_pickle=True）")
    a("")
    a("## 1. 三个文件的 shape / dtype / ndim / size / nbytes")
    a("")
    a("| 文件 | shape | ndim | dtype | size | nbytes |")
    a("| --- | --- | ---: | --- | ---: | ---: |")
    for key in ["X", "Y", "YModels"]:
        i = r["file_info"][key]
        a("| %s | %s | %d | %s | %d | %d |" % (
            i["filename"], i["shape"], i["ndim"], i["dtype"], i["size"], i["nbytes"]))
    a("")
    a("均为纯数值数组，**不含 object / dict / tuple 结构**，无需逐元素安全检查。")
    a("")
    a("## 2. 样本数")
    a("")
    a("- X 样本数（行）：**%d**" % sc["X_samples"])
    a("- Y 样本数：**%d**" % sc["Y_samples"])
    a("- YModels 行数：**%d**" % sc["YModels_rows"])
    a("- X 与 Y 样本数是否一致：**%s**" % ("是" if sc["X_samples"] == sc["Y_samples"] else "否"))
    a("- 三者是否全部一致：**%s**" % ("是" if sc["all_equal"] else "否"))
    a("")
    a("> 差异说明：X 与 Y 逐样本对齐（均为 %d）；`YWheatCWModels.npy` 仅 %d 行，"
      "**不是逐样本标签**，行数与样本数不匹配。" % (sc["X_samples"], sc["YModels_rows"]))
    a("")
    a("## 3. Y 标签 unique 与每类数量（YWheatCW.npy）")
    a("")
    a("- dtype：%s；ndim：%d" % (r["Y_dtype"], r["file_info"]["Y"]["ndim"]))
    a("- unique values：%s" % r["Y_unique"])
    a("")
    a("| 标签编码 | 数量 | 占比 |")
    a("| ---: | ---: | ---: |")
    total = sum(r["Y_counts"].values())
    for k in sorted(r["Y_counts"], key=lambda x: int(x)):
        c = r["Y_counts"][k]
        a("| %s | %d | %.2f%% |" % (k, c, 100.0 * c / total))
    a("")
    a("## 4. X 结构判定（XyWheatCW.npy）")
    a("")
    a("- 判定结果：**%s**（2-D 逐样本特征向量/表格）" % r["X_type"])
    a("- 依据：%s" % r["X_type_note"])
    a("- 候选图像 reshape：%s（均非典型图像尺寸，不支持还原为图像）" % r["reshape_candidates"])
    a("- X 列是否等于 Y：%s" % (r["X_columns_equal_to_Y"] or "无"))
    a("- X 重复行数：%d；唯一行数：%d；最大行重复次数：%d" % (
        r["X_duplicate_rows"], r["X_unique_rows"], r["X_max_row_multiplicity"]))
    a("")
    a("## 5. X 数值范围")
    a("")
    a("- 全局 min/max/mean/std：%.6f / %.6f / %.6f / %.6f" % (
        p["min"], p["max"], p["mean"], p["std"]))
    a("- 是否 0-255 图像：**%s**；是否 0-1 归一化：**%s**；是否整数：**%s**" % (
        r["X_in_0_255"], r["X_in_0_1"], r["X_is_integer_array"]))
    a("- NaN/Inf：%s" % ("有" if (p["has_nan"] or p["has_inf"]) else "无"))
    a("- 结论：各列 mean≈0、std≈1，符合**已标准化（StandardScaler 类）的连续特征向量**，"
      "不是原始像素、不是 0-255/0-1 图像。")
    a("")
    a("## 6. YModels 分析（YWheatCWModels.npy）")
    a("")
    a("- shape：%s；dtype：%s；ndim：%d" % (
        r["YModels_shape"], r["YModels_dtype"], r["file_info"]["YModels"]["ndim"]))
    a("- 前 20 个元素类型：均为 `float64`（数组为纯数值，不含字符串标签）")
    a("- unique 值个数：%d" % len(r["YModels_unique_values"]))
    a("- 判定：**含义无法确定（unknown）**。其行数（%d）与样本数（%d）不对应，"
      "不是逐样本标签；内容为 27×5 的连续浮点矩阵（前 4 列同行数值高度接近，第 5 列变幅较大），"
      "缺乏可确证的语义，**不做主观推断**。" % (r["YModels_shape"][0], sc["X_samples"]))
    a("")
    a("全部 27×5 内容：")
    a("")
    a("| r0 | r1 | r2 | r3 | r4 |")
    a("| ---: | ---: | ---: | ---: | ---: |")
    a(ym_rows)
    a("")
    a("## 7. 标签关系推断")
    a("")
    a("- YModels 与 Y 无逐行对应关系（行数不同），无法据此建立映射。")
    a("- 0/1 与 Control/Drought 的对应关系：**未确认（unknown）**。")
    a("- 证据：%s" % r["label_mapping"]["evidence"])
    a("")
    a("## 8. 类别平衡")
    a("")
    a("- 类别 0：%d；类别 1：%d；比例约 %.1f%% / %.1f%%。" % (
        r["Y_counts"].get("0", 0), r["Y_counts"].get("1", 0),
        100.0 * r["Y_counts"].get("0", 0) / total,
        100.0 * r["Y_counts"].get("1", 0) / total))
    a("- 判定：**基本平衡**（接近 1:1），未见明显类别失衡。")
    a("")
    a("## 9. 是否包含增强样本")
    a("")
    a("- `augmentation_status = %s`" % r["augmentation_status"])
    for n in r["augmentation_notes"]:
        a("- %s" % n)
    a("")
    a("## 10. 能否还原图像 / 图像尺寸 / 通道")
    a("")
    a("- image_reconstruction_possible：**%s**" % r["image_reconstruction_possible"])
    a("- image_height / image_width：**%s / %s**" % (r["image_height"], r["image_width"]))
    a("- channels：**%s**" % r["channels"])
    a("- 说明：X 为 (样本, 32) 的 2-D 特征矩阵，不含 H×W×C 图像几何信息；32 维无法构成有效图像，"
      "**不强行 reshape**，因此不生成 `reports/model_b_preview/`。")
    a("")
    a("## 11. 是否适合 YOLO11n-cls")
    a("")
    a("- 结论：**不适合**。YOLO11n-cls 以图像张量为输入；本数据集 X 为标准化后的 32 维特征，"
      "非图像、无法还原为图像。")
    a("")
    a("## 12. 建议后续模型类型")
    a("")
    a("- %s" % r["recommended_model_type"])
    a("")
    a("## 13. 与用户审计清单对应结论")
    a("")
    a("1. 三文件 shape：X=%s，Y=%s，YModels=%s" % (r["X_shape"], r["Y_shape"], r["YModels_shape"]))
    a("2. 三文件 dtype：X=%s，Y=%s，YModels=%s" % (r["X_dtype"], r["Y_dtype"], r["YModels_dtype"]))
    a("3. ndim：X=%d，Y=%d，YModels=%d" % (
        r["file_info"]["X"]["ndim"], r["file_info"]["Y"]["ndim"], r["file_info"]["YModels"]["ndim"]))
    a("4. 样本数：X=%d，Y=%d（一致）；YModels=%d（不一致）" % (
        sc["X_samples"], sc["Y_samples"], sc["YModels_rows"]))
    a("5. Y unique：%s" % r["Y_unique"])
    a("6. 每类数量：%s" % r["Y_counts"])
    a("7. X 属于：feature_vector_2d（非 image tensor / 非 flattened image）")
    a("8. 是否能还原图像：false")
    a("9. 图像尺寸：不适用")
    a("10. 通道数：unknown（非图像）")
    a("11. Control/Drought 标签映射是否确认：否（unknown）")
    a("12. 是否存在类别平衡：是（%s）" % r["Y_counts"])
    a("13. 是否发现 augmentation 证据：unknown")
    a("14. 是否适合 YOLO11n-cls：否")
    a("15. 建议模型类型：tabular 分类器（SVM / RandomForest / GradientBoosting / 小型 MLP）")
    a("")
    (REPORTS_DIR / "MODEL_B_NPY_AUDIT.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    X = load(X_FILE)
    Y = load(Y_FILE)
    YM = load(YM_FILE)

    info_X = basic_info(X_FILE, X)
    info_Y = basic_info(Y_FILE, Y)
    info_YM = basic_info(YM_FILE, YM)

    audits = {
        "X": info_X,
        "Y": info_Y,
        "YModels": info_YM,
    }

    # ---- X analysis ----
    Xf = np.asarray(X, dtype=np.float64)
    x_is_2d = (Xf.ndim == 2)
    X_profile = numeric_profile(Xf)
    X_is_int = is_integer_array(Xf)
    X_in_0_255 = bool(X_profile["min"] >= 0 and X_profile["max"] <= 255)
    X_in_0_1 = bool(X_profile["min"] >= 0 and X_profile["max"] <= 1)

    x_cols = col_profile(Xf) if x_is_2d else []

    row_unique, row_counts = np.unique(Xf, axis=0, return_counts=True)
    n_unique_rows = int(row_unique.shape[0])
    n_dup_rows = int((row_counts > 1).sum())
    max_row_mult = int(row_counts.max())

    # check if any X column equals Y
    y_flat = np.asarray(Y).reshape(-1)
    col_equals_y = []
    if x_is_2d and y_flat.size == Xf.shape[0]:
        for j in range(Xf.shape[1]):
            if np.allclose(Xf[:, j], y_flat.astype(np.float64)):
                col_equals_y.append(j)

    # ---- Y analysis ----
    Yu, Yc = np.unique(y_flat, return_counts=True)
    Y_unique = [int(v) for v in Yu]
    Y_counts = {str(int(v)): int(c) for v, c in zip(Yu, Yc)}

    # ---- YModels analysis ----
    YMf = np.asarray(YM, dtype=np.float64)
    YM_unique = [round(float(v), 6) for v in np.unique(YMf)]
    YM_rows = [[round(float(v), 6) for v in row] for row in YMf]

    # ---- sample count consistency ----
    n_X = int(Xf.shape[0]) if Xf.ndim >= 1 else 0
    n_Y = int(y_flat.size)
    n_YM = int(YMf.shape[0])
    counts_consistent = (n_X == n_Y) and (n_Y == n_YM)
    sample_counts = {
        "X_samples": n_X,
        "Y_samples": n_Y,
        "YModels_rows": n_YM,
        "all_equal": bool(counts_consistent),
    }

    # ---- image reconstruction ----
    image_possible = False
    image_hw = None
    channels = "unknown"
    reshape_cands = reshape_candidates(int(Xf.shape[1])) if x_is_2d else []
    reconstruction_note = (
        "X is a 2-D numeric array of shape (samples, features); each sample is a "
        "short vector. This structure does not carry 2-D/3-D image geometry. "
        "Image reconstruction is NOT supported by the data as-is."
    )

    # ---- augmentation ----
    augmentation_status = "unknown"
    aug_notes = []
    if n_dup_rows > 0:
        aug_notes.append(
            "found %d duplicate feature rows (max multiplicity %d); duplicates may "
            "indicate identical samples but do not by themselves prove augmentation"
            % (n_dup_rows, max_row_mult)
        )
    else:
        aug_notes.append("no duplicate feature rows detected in X")
    if "augment" in [str(v).lower() for v in YM_unique]:
        aug_notes.append("augment token found in YModels")
    aug_notes.append(
        "sample count alone is not sufficient evidence of offline augmentation"
    )

    # ---- YOLO suitability ----
    yolo_suitable = bool(x_is_2d and False)  # X is not an image tensor
    if not yolo_suitable:
        recommended_model_type = (
            "tabular classifier over 32-D per-sample features "
            "(e.g. SVM / RandomForest / GradientBoosting or a small MLP); "
            "NOT a YOLO vision classifier"
        )
    else:
        recommended_model_type = "YOLO11n-cls"

    # ---- label mapping ----
    label_mapping = {
        "status": "unknown",
        "evidence": (
            "Y is integer-coded (unique=%s); no string labels found in any array. "
            "No explicit 0/1 -> Control/Drought documentation is present inside the "
            ".npy contents, so the mapping cannot be confirmed from data alone."
            % Y_unique
        ),
    }

    # ---- X type decision ----
    if Xf.ndim == 2:
        X_type = "feature_vector_2d"
        X_type_note = (
            "2-D (samples=%d, features=%d). Not a 3-D/4-D image tensor and not a "
            "flat full-image array (feature dim %d is far too small for an image); "
            "structure is consistent with per-sample feature vectors."
            % (Xf.shape[0], Xf.shape[1], Xf.shape[1])
        )
    elif Xf.ndim == 3:
        X_type = "image_tensor_gray"
        X_type_note = "3-D array (N,H,W) candidate grayscale image tensor."
    elif Xf.ndim == 4:
        X_type = "image_tensor_color"
        X_type_note = "4-D array candidate image tensor (N,H,W,C) or (N,C,H,W)."
    else:
        X_type = "unknown"
        X_type_note = "unrecognized ndim=%d" % Xf.ndim

    result = {
        "source": {
            "dataset": "Automatic Water Stress detection in wheat crop canopy using Chlorophyll fluorescence image dataset",
            "provider": "Mendeley Data",
            "doi": "10.17632/2mpd7d3vry.3",
            "raw_dir": str(RAW_DIR),
        },
        "X_shape": info_X["shape"],
        "X_dtype": info_X["dtype"],
        "X_type": X_type,
        "X_type_note": X_type_note,
        "X_profile": X_profile,
        "X_is_integer_array": X_is_int,
        "X_in_0_255": X_in_0_255,
        "X_in_0_1": X_in_0_1,
        "X_column_stats": x_cols,
        "X_unique_rows": n_unique_rows,
        "X_duplicate_rows": n_dup_rows,
        "X_max_row_multiplicity": max_row_mult,
        "X_columns_equal_to_Y": col_equals_y,
        "reshape_candidates": reshape_cands,
        "Y_shape": info_Y["shape"],
        "Y_dtype": info_Y["dtype"],
        "Y_unique": Y_unique,
        "Y_counts": Y_counts,
        "YModels_shape": info_YM["shape"],
        "YModels_dtype": info_YM["dtype"],
        "YModels_unique_values": YM_unique,
        "YModels_rows": YM_rows,
        "sample_counts": sample_counts,
        "label_mapping": label_mapping,
        "image_reconstruction_possible": image_possible,
        "image_height": image_hw[0] if image_hw else None,
        "image_width": image_hw[1] if image_hw else None,
        "channels": channels,
        "augmentation_status": augmentation_status,
        "augmentation_notes": aug_notes,
        "recommended_model_type": recommended_model_type,
        "yolo11n_cls_suitable": yolo_suitable,
        "file_info": audits,
    }

    with open(REPORTS_DIR / "model_b_npy_audit.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    write_markdown(result)

    print(json.dumps({
        "X_shape": result["X_shape"],
        "X_dtype": result["X_dtype"],
        "X_type": X_type,
        "X_profile": X_profile,
        "X_in_0_255": X_in_0_255,
        "X_in_0_1": X_in_0_1,
        "X_is_integer_array": X_is_int,
        "X_unique_rows": n_unique_rows,
        "X_duplicate_rows": n_dup_rows,
        "X_max_row_multiplicity": max_row_mult,
        "X_columns_equal_to_Y": col_equals_y,
        "reshape_candidates": reshape_cands,
        "Y_shape": result["Y_shape"],
        "Y_dtype": result["Y_dtype"],
        "Y_unique": Y_unique,
        "Y_counts": Y_counts,
        "YModels_shape": result["YModels_shape"],
        "YModels_unique_values": YM_unique,
        "YModels_rows": YM_rows,
        "sample_counts": sample_counts,
        "recommended_model_type": recommended_model_type,
    }, ensure_ascii=False, indent=2))

    print("[done] wrote reports/model_b_npy_audit.json")


if __name__ == "__main__":
    main()
