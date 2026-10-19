# 番茄叶片病害分类模型 A 正式评估

## 评估对象

| 项 | 内容 |
| --- | --- |
| 模型文件 | `agric/ai-training/vegetable-vision/models/tomato/tomato_leaf_yolo11n_cls_v1.pt` |
| 模型 SHA256 | `564ff6bff3fb69f7165816682a1e24e2241f66642f5e0d083a725f28dbf886c6` |
| 任务类型 | 图像分类（YOLO11n-cls），7 类叶片状态 |
| 类别顺序（checkpoint `names`） | `{0: bacterial_spot, 1: bacterial_spot_and_leaf_miner, 2: healthy, 3: leaf_miner, 4: powdery_mildew, 5: powdery_mildew_and_leaf_miner, 6: whitefly}` |
| 冻结状态 | 只读推理，未训练、未微调、未修改权重 |

## 评估数据

| 项 | 内容 |
| --- | --- |
| 官方测试集 | `agric/ai-training/vegetable-vision/data/tomato_leaf_classifier_v1/test` |
| 测试图片数 | **2101** |
| 划分来源 | 数据集目录内既有 `train/val/test`，未重新划分、未使用 Test 调参 |

测试集类别构成（与 checkpoint `names` 一一对应，目录名已逐类校验）：

| 类别 | 图片数 |
| --- | --- |
| bacterial_spot | 352 |
| bacterial_spot_and_leaf_miner | 374 |
| healthy | 376 |
| leaf_miner | 325 |
| powdery_mildew | 278 |
| powdery_mildew_and_leaf_miner | 347 |
| whitefly | 49 |

> 说明：`tomato_leaf_classifier_clean_v2` 只有类别目录、没有官方 split，本次**未使用**；评估全程基于 `tomato_leaf_classifier_v1` 的既有 test 划分。

## 评估命令

```bash
python agric/ai-training/reports/visual_model_comparison/run_classifier_eval.py \
  --model agric/ai-training/vegetable-vision/models/tomato/tomato_leaf_yolo11n_cls_v1.pt \
  --test <PART>/agric/ai-training/vegetable-vision/data/tomato_leaf_classifier_v1/test \
  --name tomato_leaf_v1 \
  --out <PART>/agric/ai-training/vegetable-vision/reports
```

推理设置：逐张 `cv2.imread` → `cv2.resize(224,224)` → 批量 32 张送入模型；`imgsz=224`，CPU，无 TTA，无增强，决策规则为 softmax `argmax`。

## 总体指标（Test = 2101 张）

| 指标 | 数值 |
| --- | --- |
| Accuracy | **0.8715（87.15%）** |
| Macro-F1 | **0.8473** |
| Balanced Accuracy | **0.8423** |
| Weighted-F1 | 0.8709 |

## 分类别指标

| 类别 | Precision | Recall | F1 | Support |
| --- | --- | --- | --- | --- |
| bacterial_spot | 0.8409 | 0.8409 | 0.8409 | 352 |
| bacterial_spot_and_leaf_miner | 0.8623 | 0.8369 | 0.8494 | 374 |
| healthy | 0.9084 | 0.9495 | 0.9285 | 376 |
| leaf_miner | 0.8852 | 0.9015 | 0.8933 | 325 |
| powdery_mildew | 0.8537 | 0.8813 | 0.8673 | 278 |
| powdery_mildew_and_leaf_miner | 0.8889 | 0.8530 | 0.8706 | 347 |
| whitefly | 0.7381 | 0.6327 | 0.6813 | 49 |

主要混淆对（真实 → 预测）：

- `bacterial_spot_and_leaf_miner → bacterial_spot`：49 张
- `bacterial_spot → bacterial_spot_and_leaf_miner`：35 张
- `powdery_mildew_and_leaf_miner → powdery_mildew`：26 张
- `powdery_mildew → powdery_mildew_and_leaf_miner`：15 张
- `powdery_mildew → healthy`：12 张；`healthy → leaf_miner`：11 张

可见误差集中在**单一病害与"病害共现"类别之间**（复合类别易被拆成单一类别），符合 7 类细粒度任务的特征。

## 置信度分布

- 置信度 < 0.5 的样本仅 40 张（1.9%），其中判对率 55%，说明模型整体置信度偏高、低置信样本集中于边界样本。
- 该现象提示：若下游按阈值拒识，需重新标定阈值，不能直接沿用默认值。

## 产出文件

- `tomato_leaf_v1_model_metrics.json`：模型 SHA256、类别顺序、总体与分类别指标、混淆矩阵
- `tomato_leaf_v1_predictions.csv`：逐图真实类/预测类/置信度（2101 行）
- `tomato_leaf_v1_classification_report.csv`：分类别 P/R/F1/support
- `tomato_leaf_v1_confusion_matrix.png`：混淆矩阵图

## 风险与限制

1. **长尾类别**：`whitefly` 仅 49 张，F1 0.6813，是 macro-F1 的主要拖累项；其置信区间宽，不宜单独对外承诺该类精度。
2. **数据独立性**：仓库内无该数据集划分脚本的运行日志与去重报告（`tomato_leaf_classifier_v1` 仅有 `train/val/test` 目录），无法从仓库层面证明训练/测试无近重复图像；如需对外引用，应补充去重审计。
3. **预处理差异**：本次为 Resize 到 224×224 直接推理，未复现训练时的完整增强/裁剪流水线；属复现性评估口径。
4. **未做阈值调优**：决策固定为 argmax，未在 test 上做任何调参，因此不存在测试集信息泄漏。
5. 本结果**不可**与枣/梨/麦分类任务或检测任务（mAP）直接横向比较。
