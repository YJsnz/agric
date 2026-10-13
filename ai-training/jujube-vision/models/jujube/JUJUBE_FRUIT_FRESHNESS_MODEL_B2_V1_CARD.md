# Jujube Model B2 v1 — 枣果实新鲜 / 腐败视觉分类模型

status=frozen；YOLO11n-cls；binary image classification；Ultralytics 8.3.40；imgsz=224。
模型：F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\jujube-vision\models\jujube\jujube_fruit_freshness_yolo11n_cls_v1.pt
来源：F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\jujube-vision\runs\jujube_fruit_freshness_yolo11n_cls_v1\weights\best.pt
SHA256：f5554560e60df3a61ed78848c56087cd33a18fb29c0cfc3cf1b8091f681f844b
仅按字节复制，未重新保存、导出或修改state_dict。推理沿用argmax，类别索引读取模型names。

## 用途与类别语义
对枣果实图像进行新鲜外观与腐败 / 变质类外观的视觉分类。
fresh → 新鲜果实外观；rotten → 腐败 / 变质类视觉表现。
不得解释为食品安全判定、是否可食用判断、微生物检测、腐败原因诊断、储藏寿命预测或质量等级最终认定。
分类得分不是食品安全概率。rotten仅作为视觉风险证据，不能单独作为最终采后品质结论；fresh不保证安全或可食用。

## 数据与评估边界
Train 280（fresh 140 / rotten 140）；Val 60（30 / 30）；Test 60（30 / 30）。
training_ready_image_level = true
training_ready_fruit_independent = false
fruit_independent_verified = false
当前为 image-level internal evaluation（配置值image_level_internal），不得称为 strict fruit-independent evaluation。
正式评估已确认跨split SHA256重复=0、像素完全重复=0。此前正式数据审计确认已确认同果实组和已确认同场景组不跨split。
本地正式评估时缺少完整分组清单，组隔离结论沿用此前正式数据审计报告。本轮冻结没有重新评估或重新验证全部fruit group。
公开数据没有完整fruit identity映射，仍有大量图片果实身份未验证，因此无法证明全部Train/Val/Test在果实个体层面独立。
仅60张内部测试图，不能外推为沧州金丝小枣实际田间/仓储环境准确率。

## 腐败漏检：主要已知短板
Rotten Recall = 86.67%。30张rotten中26张正确，4张被误判为fresh。
高置信度错误confidence >= 0.8为1张，>=0.9为1张。

## 已归档正式测试结果
Test=60；correct=56。混淆矩阵行为真实、列为预测，顺序fresh、rotten：
```text
[[30, 0],
 [4, 26]]
```
fresh -> rotten = 0；rotten -> fresh = 4。

| 指标 | 数值 |
|---|---:|
| accuracy | 0.9333 |
| macro_precision | 0.9412 |
| macro_recall | 0.9333 |
| macro_f1 | 0.9330 |
| balanced_accuracy | 0.9333 |
| weighted_f1 | 0.9330 |
| roc_auc | 0.9856 |

| 类别 | support | precision | recall | f1 |
|---|---:|---:|---:|---:|
| fresh | 30 | 0.8824 | 1.0000 | 0.9375 |
| rotten | 30 | 1.0000 | 0.8667 | 0.9286 |
