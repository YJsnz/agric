# 黄骅旱碱麦 视觉模型B 冠层水分胁迫 NPY 结构审计报告

本报告为**只读结构审计**，未训练、未划分 train/val/test、未修改或删除任何原始 `.npy` 文件。

## 0. 数据来源

- 数据集：Automatic Water Stress detection in wheat crop canopy using Chlorophyll fluorescence image dataset
- 提供方：Mendeley Data
- DOI：10.17632/2mpd7d3vry.3
- 原始目录：`F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\wheat-vision\raw\canopy_water_stress`
- 审计脚本：`scripts/audit_model_b_npy.py`（np.load allow_pickle=True）

## 1. 三个文件的 shape / dtype / ndim / size / nbytes

| 文件 | shape | ndim | dtype | size | nbytes |
| --- | --- | ---: | --- | ---: | ---: |
| XyWheatCW.npy | [17328, 32] | 2 | float64 | 554496 | 4435968 |
| YWheatCW.npy | [17328] | 1 | int64 | 17328 | 138624 |
| YWheatCWModels.npy | [27, 5] | 2 | float64 | 135 | 1080 |

均为纯数值数组，**不含 object / dict / tuple 结构**，无需逐元素安全检查。

## 2. 样本数

- X 样本数（行）：**17328**
- Y 样本数：**17328**
- YModels 行数：**27**
- X 与 Y 样本数是否一致：**是**
- 三者是否全部一致：**否**

> 差异说明：X 与 Y 逐样本对齐（均为 17328）；`YWheatCWModels.npy` 仅 27 行，**不是逐样本标签**，行数与样本数不匹配。

## 3. Y 标签 unique 与每类数量（YWheatCW.npy）

- dtype：int64；ndim：1
- unique values：[0, 1]

| 标签编码 | 数量 | 占比 |
| ---: | ---: | ---: |
| 0 | 8678 | 50.08% |
| 1 | 8650 | 49.92% |

## 4. X 结构判定（XyWheatCW.npy）

- 判定结果：**feature_vector_2d**（2-D 逐样本特征向量/表格）
- 依据：2-D (samples=17328, features=32). Not a 3-D/4-D image tensor and not a flat full-image array (feature dim 32 is far too small for an image); structure is consistent with per-sample feature vectors.
- 候选图像 reshape：[(8, 4), (16, 2), (32, 1)]（均非典型图像尺寸，不支持还原为图像）
- X 列是否等于 Y：无
- X 重复行数：0；唯一行数：17328；最大行重复次数：1

## 5. X 数值范围

- 全局 min/max/mean/std：-4.917215 / 4.688392 / -0.000664 / 0.986889
- 是否 0-255 图像：**False**；是否 0-1 归一化：**False**；是否整数：**False**
- NaN/Inf：无
- 结论：各列 mean≈0、std≈1，符合**已标准化（StandardScaler 类）的连续特征向量**，不是原始像素、不是 0-255/0-1 图像。

## 6. YModels 分析（YWheatCWModels.npy）

- shape：[27, 5]；dtype：float64；ndim：2
- 前 20 个元素类型：均为 `float64`（数组为纯数值，不含字符串标签）
- unique 值个数：116
- 判定：**含义无法确定（unknown）**。其行数（27）与样本数（17328）不对应，不是逐样本标签；内容为 27×5 的连续浮点矩阵（前 4 列同行数值高度接近，第 5 列变幅较大），缺乏可确证的语义，**不做主观推断**。

全部 27×5 内容：

| r0 | r1 | r2 | r3 | r4 |
| ---: | ---: | ---: | ---: | ---: |
| 0.912868 | 0.912716 | 0.912716 | 0.912843 | 0.959995 |
| 0.906520 | 0.906408 | 0.906408 | 0.906504 | 8.715801 |
| 0.906520 | 0.906282 | 0.906282 | 0.906463 | 7.862695 |
| 0.903635 | 0.903383 | 0.903383 | 0.903571 | 4.920478 |
| 0.902481 | 0.902275 | 0.902275 | 0.902435 | 1.834418 |
| 0.866705 | 0.866654 | 0.866654 | 0.866700 | 0.852309 |
| 0.865840 | 0.865705 | 0.865705 | 0.865810 | 4.077600 |
| 0.824293 | 0.823167 | 0.823167 | 0.822476 | 19.325542 |
| 0.821408 | 0.820349 | 0.820349 | 0.819768 | 13.705822 |
| 0.802943 | 0.803053 | 0.803053 | 0.802942 | 0.052625 |
| 0.746682 | 0.746455 | 0.746455 | 0.746562 | 0.080699 |
| 0.745817 | 0.745553 | 0.745553 | 0.745657 | 2.439062 |
| 0.745528 | 0.745314 | 0.745314 | 0.745420 | 9.148067 |
| 0.745239 | 0.744969 | 0.744969 | 0.745072 | 0.128089 |
| 0.744662 | 0.744399 | 0.744399 | 0.744502 | 0.153955 |
| 0.744662 | 0.744399 | 0.744399 | 0.744502 | 0.060570 |
| 0.743220 | 0.743698 | 0.743698 | 0.742844 | 0.046330 |
| 0.741777 | 0.741606 | 0.741606 | 0.741706 | 0.055852 |
| 0.742354 | 0.741477 | 0.741477 | 0.740753 | 0.263241 |
| 0.731102 | 0.731246 | 0.731246 | 0.731085 | 0.057938 |
| 0.722158 | 0.722158 | 0.722158 | 0.722165 | 3.541477 |
| 0.663301 | 0.663499 | 0.663499 | 0.663233 | 7.647301 |
| 0.662724 | 0.662915 | 0.662915 | 0.662662 | 11.168420 |
| 0.652337 | 0.652374 | 0.652374 | 0.652348 | 0.073913 |
| 0.637046 | 0.637011 | 0.637011 | 0.637050 | 0.086988 |
| 0.582227 | 0.583417 | 0.583417 | 0.577843 | 0.079175 |
| 0.498557 | 0.498491 | 0.498491 | 0.498557 | 0.038248 |

## 7. 标签关系推断

- YModels 与 Y 无逐行对应关系（行数不同），无法据此建立映射。
- 0/1 与 Control/Drought 的对应关系：**未确认（unknown）**。
- 证据：Y is integer-coded (unique=[0, 1]); no string labels found in any array. No explicit 0/1 -> Control/Drought documentation is present inside the .npy contents, so the mapping cannot be confirmed from data alone.

## 8. 类别平衡

- 类别 0：8678；类别 1：8650；比例约 50.1% / 49.9%。
- 判定：**基本平衡**（接近 1:1），未见明显类别失衡。

## 9. 是否包含增强样本

- `augmentation_status = unknown`
- no duplicate feature rows detected in X
- sample count alone is not sufficient evidence of offline augmentation

## 10. 能否还原图像 / 图像尺寸 / 通道

- image_reconstruction_possible：**False**
- image_height / image_width：**None / None**
- channels：**unknown**
- 说明：X 为 (样本, 32) 的 2-D 特征矩阵，不含 H×W×C 图像几何信息；32 维无法构成有效图像，**不强行 reshape**，因此不生成 `reports/model_b_preview/`。

## 11. 是否适合 YOLO11n-cls

- 结论：**不适合**。YOLO11n-cls 以图像张量为输入；本数据集 X 为标准化后的 32 维特征，非图像、无法还原为图像。

## 12. 建议后续模型类型

- tabular classifier over 32-D per-sample features (e.g. SVM / RandomForest / GradientBoosting or a small MLP); NOT a YOLO vision classifier

## 13. 与用户审计清单对应结论

1. 三文件 shape：X=[17328, 32]，Y=[17328]，YModels=[27, 5]
2. 三文件 dtype：X=float64，Y=int64，YModels=float64
3. ndim：X=2，Y=1，YModels=2
4. 样本数：X=17328，Y=17328（一致）；YModels=27（不一致）
5. Y unique：[0, 1]
6. 每类数量：{'0': 8678, '1': 8650}
7. X 属于：feature_vector_2d（非 image tensor / 非 flattened image）
8. 是否能还原图像：false
9. 图像尺寸：不适用
10. 通道数：unknown（非图像）
11. Control/Drought 标签映射是否确认：否（unknown）
12. 是否存在类别平衡：是（{'0': 8678, '1': 8650}）
13. 是否发现 augmentation 证据：unknown
14. 是否适合 YOLO11n-cls：否
15. 建议模型类型：tabular 分类器（SVM / RandomForest / GradientBoosting / 小型 MLP）
