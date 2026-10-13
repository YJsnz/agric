# Model B Validation-set Threshold Calibration

仅对固定 v12 best.pt 决策阈值校准；不重新训练、不改权重或数据。

water_stress 仍是 treatment-derived weak label，表示 deficit-irrigation treatment group。prob_water_stress 是 model score / water-stress-treatment visual similarity score，不是真实缺水概率。

## Procedure and locked selection

Ultralytics 8.3.40；imgsz=224；workers=0；FP32；无增强。验证集 189 张（normal95/water_stress94），0.05–0.95（0.01步长）共91阈值。预测规则：score≥threshold 则 water_stress，否则 normal。

选取 Val Balanced Accuracy 严格最高者；仅1e-12内的数值平局按 water_stress Recall、Precision、距0.5最近、较低阈值依次打破。没有任意放宽最高BA的‘接近’范围，没有用test设置precision门槛。平局时优先recall，再以precision避免不必要牺牲；实际precision变化如下表披露，不通过test回调。

best Macro-F1 threshold=0.35, Val Macro-F1=0.674294。
best Balanced Accuracy threshold=0.37, Val BA=0.681691。
selected_threshold=0.37；锁定时间 2026-10-03T08:32:24.128411+00:00；锁定文件 model_b_threshold_lock.json。

| rule | threshold | accuracy | macro_f1 | balanced_accuracy | water_stress_recall | water_stress_precision |
| --- | --- | --- | --- | --- | --- | --- |
| default | 0.500000 | 0.603175 | 0.558700 | 0.601512 | 0.287234 | 0.771429 |
| selected | 0.370000 | 0.682540 | 0.673763 | 0.681691 | 0.521277 | 0.765625 |

阈值在test推理前写入锁定文件，test期间锁定SHA不变。两候选阈值的选择只看val，test只计算0.5和最终固定阈值，未在test扫描/选择阈值。

## Fixed test comparison

| decision_rule | threshold | sample_count | accuracy | macro_precision | macro_recall | macro_f1 | balanced_accuracy | normal_precision | normal_recall | normal_f1_score | water_stress_precision | water_stress_recall | water_stress_f1_score | confusion_matrix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| default | 0.500000 | 189 | 0.587302 | 0.666667 | 0.581653 | 0.523837 | 0.581653 | 0.555556 | 0.937500 | 0.697674 | 0.777778 | 0.225806 | 0.350000 | [[90, 6], [72, 21]] |
| calibrated | 0.370000 | 189 | 0.634921 | 0.657895 | 0.631720 | 0.617801 | 0.631720 | 0.601504 | 0.833333 | 0.698690 | 0.714286 | 0.430108 | 0.536913 | [[80, 16], [53, 40]] |

矩阵行列顺序均为normal, water_stress；不使用医学诊断TP/TN语义。默认结果与此前正式评估完全一致。

## Improvement and limitations

{
  "accuracy": 0.04761904761904756,
  "macro_f1": 0.09396414470253944,
  "balanced_accuracy": 0.05006720430107525,
  "water_stress_recall": 0.20430107526881722,
  "water_stress_precision": -0.06349206349206349
}

按预先固定的描述性标准（Macro-F1 和 Balanced Accuracy 均提升≥0.05），改善明显；default 0.5 threshold is poorly calibrated for this model。此处没有开展显著性检验，不能称为统计显著；同一 plot 多日期图像也并非独立样本。

阈值校准改变分类操作点，不提升特征/分数排序能力，也不是概率校准。表现仅针对原实验测试集；不能推断黄骅实地缺水诊断能力。exact deficit-irrigation start date is unknown；未确认逐图实际水分胁迫。

## Integrity

按现有manifest核对1226张图完整SHA256，跨split plot/SHA泄漏：{'cross_split_plot': 0, 'cross_split_sha256': 0}；运行前后图像、数据文件清单/时间戳、模型、manifest均未改变。raw未访问/修改。本次只新增校准脚本与报告，不覆盖此前正式baseline评估报告。

## Artifacts

- model_b_threshold_sweep_val.csv
- model_b_threshold_test_comparison.csv
- model_b_threshold_curve.png
- model_b_threshold_lock.json
- model_b_threshold_val_predictions.csv
- model_b_threshold_test_scores.csv

本阶段完成后停止，未训练或继续按test调参。
