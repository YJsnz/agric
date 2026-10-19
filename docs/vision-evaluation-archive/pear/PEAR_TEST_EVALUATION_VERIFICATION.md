# 泊头鸭梨叶片症状模型 评估结果核对

核对日期：2026-10-19
核对对象：既有梨叶评估材料（未改动），权重 `pear_symptom_yolo11n_cls_v1.pt`
核对性质：**只读复核**。从原始逐图预测复算指标，未训练、未调参、未修改标签或测试数据、未重新推理。
既有评估归档：[../pear-leaf/](../pear-leaf/)；数据集独立性核验：[PEAR_DATASET_INDEPENDENCE_AUDIT.md](PEAR_DATASET_INDEPENDENCE_AUDIT.md)。

## 1. 待核对的历史记录

| 项目 | 历史记录 |
|---|---|
| 测试集规模 | 299 张 |
| Accuracy | 88.63%（0.8862876…） |
| Macro-F1 | 0.8260（0.8259628…） |

材料：`ai-training/pear-vision/reports/PEAR_MODEL_EVALUATION.md`、`pear_model_metrics.json`、
`pear_predictions.csv`（299 行）、`pear_classification_report.csv`、`pear_confusion_matrix.png`。
**这些是待核对记录，本核对不预先认定其全部正确。**

## 2. 复算方法

不重新推理，直接由 `pear_predictions.csv` 的 `true_class` / `predicted_class` 复算：
Accuracy = 全对/总数；每类 Precision/Recall/F1；Macro-F1 = 各类 F1 无加权平均；
Balanced Accuracy = 各类 Recall 平均；混淆矩阵行=真实、列=预测。
复算脚本：[verify_pear_eval.py](verify_pear_eval.py)。

## 3. 复算结果与一致性

| 指标 | 本次复算（由预测直接计算） | 存储值（pear_model_metrics.json） | 绝对差 |
|---|---:|---:|---:|
| Test 图片数 | 299 | 299 | 0 |
| Accuracy | 0.8862876254 | 0.8862876254180602 | 1.8×10⁻¹¹ |
| Macro-F1 | 0.8259626399 | 0.8259627500000001 | 1.1×10⁻⁷ |
| Balanced Accuracy | 0.7754106661 | 0.77541075 | 8.4×10⁻⁸ |

- **与历史记录的 88.63% / 0.8260 一致**（差异仅为存储时对每类指标取 6 位小数后再平均的舍入残差，
  量级 ≤1.2×10⁻⁷，非实质差异）。
- 逐类指标（P/R/F1/support）复算结果与 `pear_classification_report.csv`、`pear_model_metrics.json` 完全一致：
  curl 1.000/0.800/0.889/5；healthy 1.000/0.500/0.667/4；slug 0.956989/0.881188/0.917526/202；spot 0.757009/0.920455/0.830769/88。
- 混淆矩阵复算（行=真实，列=预测）与存储矩阵一致：
  curl→[curl 4, slug 1]；healthy→[healthy 2, spot 2]；slug→[slug 178, spot 24]；spot→[spot 81, slug 7]。

## 4. 测试样本、标签与覆盖率

- `pear_predictions.csv` 共 **299 行**，与磁盘 test 目录实际文件数 **299** 一致。
- 预测条目集合与磁盘 test 文件集合**完全相同**（无多余、无缺失）。
- 每类数量一致：curl 5、healthy 4、slug 202、spot 88（预测与磁盘同为 299）。
- 预测文件中的 `true_class` 与文件所在类别目录**逐一吻合**，标签无异常。
- 类别顺序 `[curl, healthy, slug, spot]` 与 `pear_model_metrics.json` 的 `classes` 一致。
- 结论：测试样本数量、真实标签、预测标签**一致**。

## 5. 权重、数据与预测的可追溯性

| 项 | 状态 |
|---|---|
| 权重文件 | 存在：`AIC-SmartAgriculture/agric/ai-service/models/pear/pear_symptom_yolo11n_cls_v1.pt`（3,191,621 字节） |
| 权重 SHA-256 实测 | `a7fba665a0db3bf0d533bae3725716f3690bbf8a94ded4bc2f78c8ca40954dce` |
| 与报告记录的哈希 | **一致**（`PEAR_MODEL_EVALUATION.md` / `pear_model_metrics.json` 同值） |
| 该权重是否 `pear_diagnosis` 实际加载 | 是（既有归档与总索引已注明；本次不改权重） |
| 评估使用的 Test 数据 | `ai-training/pear-vision/data/prepared/classification/test`，299 张 |
| 推理口径 | `imgsz=224`、CPU、FP32、无增强、argmax（与报告一致） |
| 训练冻结溯源 | **无法确认** |

**无法确认项（重要）**：

1. 该权重位于**另一个工作树**（`AIC-SmartAgriculture/agric/...`），不在本归档仓库内；
   仓库内没有配套的训练日志、冻结清单或 `runs/classifier/` 产物（`pear-vision/runs`、`pear-vision/models` 为空）。
   因此**无法从仓库内证明该权重是在本 `prepared` 划分上训练的**。
2. 缺少权重的原始冻结记录（`.sha256` 存档、metadata、model card），仅有评估报告中的哈希值可核对。
3. 数据集独立性未获证（详见独立性核验文档）：Test 与 Train 无完全重复，但存在跨集合近重复候选，
   且无植株/批次元数据。

## 6. 结论

- 历史指标 **Accuracy 88.63% / Macro-F1 0.8260 / Balanced Accuracy 0.7754 / Test 299 张** 可由
  `pear_predictions.csv` **复现一致**（差异仅为 6 位舍入口径），样本数与类别口径一致。
- 该评估使用当前归档的权重文件（哈希一致）与 Test 数据（299 张，与预测一一对应）。
- **限制**：权重训练溯源与数据集（植株级）独立性**无法确认**；本核对是既有结果的复算核对，
  不构成“训练/测试完全独立”的证明，也不代表现场部署准确率。
