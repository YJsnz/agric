# 泊头鸭梨 视觉模型 独立评估报告

评估日期：2026-10-18
评估对象：`agric/ai-service/models/pear/pear_symptom_yolo11n_cls_v1.pt`

## 1. 模型与任务

- 架构：YOLO11n-cls，视觉任务为**梨叶症状图像分类**（既非病害确诊，也非病果/健果二分类）。
- 类别（与类内预处理映射一致）：`curl`（卷叶症状）、`healthy`（健康叶片）、`slug`（虫害损伤）、`spot`（叶斑症状）。
- 模型 SHA256：`a7fba665a0db3bf0d533bae3725716f3690bbf8a94ded4bc2f78c8ca40954dce`
- 该权重是当前 `pear_diagnosis` 服务实际加载的部署模型（同源），本评估不做任何权重修改。

## 2. 测试数据

- 数据集：`ai-training/pear-vision/data/prepared`（来源 `Pear/leaves`，已按 SHA256 去重、按固定种子 `seed=42` 8:1:1 官方划分）。
- 本评估仅使用官方 **test** 划分：`data/prepared/classification/test`。
- 原始类别规模（train/val/test）：curl 43/6/5，healthy 35/4/4，slug 1620/203/202，spot 707/89/88（supplement 均为 1 张权重辅助，见 prepared report）。

Test 实际样本：**299 张**（curl=5，healthy=4，slug=202，spot=88）。

## 3. 指标口径

- 推理：CPU，`imgsz=224`，FP32，无增强，argmax 决策；图像先经 `cv2.resize` 至 224（与 Ultralytics 分类预处理一致）。
- Accuracy = 全部正确 / 总数；Macro-F1 = 类别 F1 无加权平均；Balanced Accuracy = 各类 Recall 平均；混淆矩阵行为真实、列为预测。
- 未使用 Test 进行任何调参或阈值搜索。

## 4. 正式指标

| 指标 | 数值 |
|---|---:|
| Test 图片数 | 299 |
| Accuracy | 0.8863 |
| Macro-F1 | 0.8260 |
| Balanced Accuracy | 0.7754 |

| 类别 | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| curl | 1.0000 | 0.8000 | 0.8889 | 5 |
| healthy | 1.0000 | 0.5000 | 0.6667 | 4 |
| slug | 0.9570 | 0.8812 | 0.9175 | 202 |
| spot | 0.7570 | 0.9205 | 0.8308 | 88 |

混淆矩阵见 `pear_confusion_matrix.png`；逐图预测见 `pear_predictions.csv`；分类报告见 `pear_classification_report.csv`；机器可读指标见 `pear_model_metrics.json`。

## 5. 数据风险与限制

1. **类别严重不平衡**：slug/spot 占 97%，curl(5) 与 healthy(4) 测试样本极少，其单类 Recall 波动极大，macro-F1 受小类影响。
2. **healthy 仅 4 张**，Recall=0.5 对应约 2 张误差，不能据此断言健康叶识别能力。
3. 本权重在仓库中没有配套训练日志与冻结清单（`pear-vision/runs` 与 `models` 为空），因此**无法从仓库内证明训练集与测试划分离散**；测试划分本身由固定种子生成且从未参与本评估调参。
4. 预处理器为固定 `Resize(224)+模型原归一化`，与 `train_classifier.py` 描述的确定性 Resize+CenterCrop 存在微小差异，指标为在官方划分上的复现评估而非官方首发结果。
5. 视觉置信度/类别是**症状线索**，不是病害确诊依据。

## 6. 结论

模型在官方 Test 划分上可复现评估：Accuracy=0.8863、Macro-F1=0.8260。本评估未修改任何训练数据、权重或官方划分，未进行训练。