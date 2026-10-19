# 枣果实碰伤分类模型 B1 正式评估

## 评估对象

| 项 | 内容 |
| --- | --- |
| 模型文件 | `agric/ai-training/jujube-vision/models/jujube/jujube_fruit_bruise_yolo11n_cls_v1.pt` |
| 模型 SHA256 | `ad52101dca33fe9eb642994ee7246bb21522cada3dd0bf89b98ecacf164608c7` |
| 任务类型 | 图像分类（YOLO11n-cls） |
| 类别顺序（checkpoint `names`） | `{0: bruised, 1: healthy}` |
| 冻结状态 | 只读推理，未训练、未微调、未修改权重 |

## 评估数据

| 项 | 内容 |
| --- | --- |
| 官方测试集 | `agric/ai-training/jujube-vision/data/jujube_fruit_bruise_classifier_v2/test` |
| 测试图片数 | **223**（bruised 113，healthy 110） |
| 划分来源 | 数据集目录内既有 `train/val/test`，未重新划分、未使用 Test 调参 |

> 口径说明：`JUJUBE_MODEL_B1_DATASET_AUDIT.md` 记录的 test 规模为 110+110=220，而 `classifier_v2/test` 目录实际为 113+110=223（bruised 多 3 张）。差异原因在仓库中无记录可查，本次评估以目录实际文件为准，并如实标注该出入。

## 评估命令

```bash
python agric/ai-training/reports/visual_model_comparison/run_classifier_eval.py \
  --model agric/ai-training/jujube-vision/models/jujube/jujube_fruit_bruise_yolo11n_cls_v1.pt \
  --test <PART>/agric/ai-training/jujube-vision/data/jujube_fruit_bruise_classifier_v2/test \
  --name jujube_fruit_bruise_v1 \
  --out <PART>/agric/ai-training/jujube-vision/reports
```

推理设置：逐张 `cv2.imread` → `cv2.resize(224,224)` → 批量 32 张送入模型；`imgsz=224`，CPU，无 TTA，无增强，决策规则为 softmax `argmax`。

## 总体指标（Test = 223 张）

| 指标 | 数值 |
| --- | --- |
| Accuracy | **0.9776（97.76%）** |
| Macro-F1 | **0.9776** |
| Balanced Accuracy | **0.9778** |
| Weighted-F1 | 0.9776 |

## 分类别指标

| 类别 | Precision | Recall | F1 | Support |
| --- | --- | --- | --- | --- |
| bruised（碰伤） | 0.9909 | 0.9646 | 0.9776 | 113 |
| healthy（健康） | 0.9646 | 0.9909 | 0.9776 | 110 |

混淆情况：113 张碰伤中 4 张被判为健康（漏检），110 张健康中 1 张被判为碰伤（误报）。

## 产出文件

- `jujube_fruit_bruise_v1_model_metrics.json`：模型 SHA256、类别顺序、总体与分类别指标、混淆矩阵
- `jujube_fruit_bruise_v1_predictions.csv`：逐图真实类/预测类/置信度
- `jujube_fruit_bruise_v1_classification_report.csv`：分类别 P/R/F1/support
- `jujube_fruit_bruise_v1_confusion_matrix.png`：混淆矩阵图

## 风险与限制

1. **样本独立性问题**：数据来源为 Mendeley v5（Ziziphus mauritiana，孟加拉国 Savar），原始数据存在同果多视角。审计仅确认 10 组果实身份，1442 张身份不确定，跨划分仍有 6652 对未确认的相似候选；无法从现有材料完全排除同果跨划分。
2. **规模与构成**：Test 仅 223 张、2 类均衡，指标方差较大，healthy 类仅 1 次误报即可影响 0.9 个百分点。
3. **数据版本出入**：审计记录 220 张，实际目录 223 张，需回溯数据准备脚本确认。
4. **预处理差异**：本次为 Resize 到 224×224 后直接推理，未复现训练时的完整增强/裁剪流水线；属复现性评估口径。
5. 本结果**不可**与叶片病害分类、检测任务（mAP）横向比较或换算。
