# Jujube Model B2 v1 正式评估

模型：YOLO11n-cls；Ultralytics 8.3.40；Train 280 / Val 60 / Test 60。固定使用指定 best.pt、224输入与原训练crop_fraction，CPU FP32、argmax，不重新训练，不用Test选择阈值或超参数。prob_* / confidence 是模型分类得分，不是食品安全概率。

## 真实结果
Precision / Recall / F1 采用 rotten 为正类；Macro为两类等权平均；ROC-AUC使用prob_rotten连续得分，未搜索阈值。混淆矩阵行为真实、列为预测，顺序fresh、rotten。

```json
{
  "model_path": "F:\\AIC2026\\AIC-SmartAgriculture\\agric\\ai-training\\jujube-vision\\runs\\jujube_fruit_freshness_yolo11n_cls_v1\\weights\\best.pt",
  "model_sha256": "f5554560e60df3a61ed78848c56087cd33a18fb29c0cfc3cf1b8091f681f844b",
  "ultralytics_version": "8.3.40",
  "dataset": "F:\\AIC2026\\AIC-SmartAgriculture\\agric\\ai-training\\jujube-vision\\data\\jujube_fruit_freshness_classifier_v1",
  "image_size": 224,
  "decision_rule": "argmax; no threshold calibration",
  "training": {
    "max_epochs": 80,
    "actual_epochs": 30,
    "best_val_top1": 0.98333,
    "patience": 20,
    "epochs_tied_best_val_top1": [
      7,
      10
    ],
    "stop_reason": "Not verified: server stopping log unavailable; 30 epochs completed, best Top-1 tied at 7 and 10"
  },
  "metrics": {
    "test_images": 60,
    "accuracy": 0.9333333333333333,
    "precision": 1.0,
    "recall": 0.8666666666666667,
    "f1": 0.9285714285714286,
    "positive_class": "rotten",
    "macro_precision": 0.9411764705882353,
    "macro_recall": 0.9333333333333333,
    "macro_f1": 0.9330357142857143,
    "balanced_accuracy": 0.9333333333333333,
    "weighted_f1": 0.9330357142857143,
    "roc_auc": 0.9855555555555555,
    "per_class": {
      "fresh": {
        "support": 30,
        "precision": 0.8823529411764706,
        "recall": 1.0,
        "f1": 0.9375
      },
      "rotten": {
        "support": 30,
        "precision": 1.0,
        "recall": 0.8666666666666667,
        "f1": 0.9285714285714286
      }
    },
    "confusion_matrix": [
      [
        30,
        0
      ],
      [
        4,
        26
      ]
    ],
    "confusion_matrix_order": [
      "fresh",
      "rotten"
    ],
    "rotten_missed_as_fresh": 4,
    "fresh_predicted_rotten": 0,
    "wrong_confidence_ge_08": 1,
    "wrong_confidence_ge_09": 1
  },
  "integrity": {
    "corrupt": 0,
    "cross_split_sha256": 0,
    "cross_split_pixel_identical": 0,
    "inputs_unchanged": true
  },
  "training_ready_image_level": true,
  "training_ready_fruit_independent": false,
  "group_isolation_provenance": "Prior stage audit/user declaration; local B2 group manifest absent, not reverified in this evaluation"
}
```

## 腐败漏检与高置信度错误
Rotten Recall = 0.866667；真实rotten被预测fresh：4 / 30。

错误且confidence≥0.8：1；≥0.9：1。清单见 model_b2_high_confidence_errors.csv，若无错误仅保留表头。

## 数据与评价边界
training_ready_image_level = true

training_ready_fruit_independent = false

本次为 image-level internal evaluation，不是 strict fruit-independent evaluation。上一阶段仅保证已确认同果实组不跨split、已确认同场景组不跨split、SHA256及像素完全重复不跨split。当前本地缺少B2分组manifest，因此组隔离沿用上一阶段审计/用户声明，本次未独立重验；SHA256及解码像素跨split检查已对当前400张实际文件重新执行。完整性清单见 model_b2_evaluation_input_integrity.csv。

由于大量图片fruit identity尚未完全核验，不能证明全部Train/Val/Test在果实个体层面独立。测试仅60张，结果对少量错误敏感，不能外推为沧州金丝小枣真实田间/仓储准确率。训练早停信息若列出，仅由results.csv和args.yaml推断，不冒充服务器停止日志。

## 类别语义
- fresh → 新鲜果实外观。
- rotten → 腐败/变质类视觉表现。

不得解释为食品安全判定、是否可食用判定、微生物检测、腐败原因诊断或储藏寿命预测。

本次未修改数据、权重、Model A或Model B1，未执行训练或Test调参。完成评估后停止。
