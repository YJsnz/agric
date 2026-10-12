# Tomato Ripeness YOLO11n-cls V1 Model Card

状态：冻结的 V1 baseline。此归档不表示模型已通过部署验收。

## 模型与数据

设施番茄果实六阶段成熟度视觉分类；YOLO11n-cls。
数据来源：AerialYield-T2M；正式数据版本 tomato_ripeness_classifier_v2。Train=10047，Val=1936，Test=2201。
类别（成熟顺序）：green, breakers, turning, pink, light_red, red
注意：实际模型索引不同于成熟顺序，推理必须读取 names。实际索引：{"0": "breakers", "1": "green", "2": "light_red", "3": "pink", "4": "red", "5": "turning"}
训练：43 epochs；最佳 epoch=23（Val Top-1），best Val Top-1=0.89607。

## 正式指标

- accuracy: 0.9404815992730577
- macro_precision: 0.632194961319187
- macro_recall: 0.5099909186045296
- macro_f1: 0.5363658231459278
- balanced_accuracy: 0.5099909186045296
- weighted_precision: 0.9341725029789456
- weighted_recall: 0.9404815992730577
- weighted_f1: 0.9321993922035312
- macro_roc_auc_ovr: 0.9799802383253765
- stage_mae: 0.09359382099045888
- within_1_stage_accuracy: 0.9750113584734211

| 类别 | Support | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| green | 1894 | 0.974039 | 0.990496 | 0.982199 |
| breakers | 26 | 0.545455 | 0.230769 | 0.324324 |
| turning | 77 | 0.714286 | 0.584416 | 0.642857 |
| pink | 56 | 0.857143 | 0.321429 | 0.467532 |
| light_red | 134 | 0.702247 | 0.932836 | 0.801282 |
| red | 14 | 0.000000 | 0.000000 | 0.000000 |

## 限制与用途

- 仅代表AerialYield-T2M公开温室内部图像级测试，不是青县现场准确率或真实生产环境泛化准确率。
- 果实身份未完全核验，4对uncertain近重复风险仍存在，不能声称fruit-independent测试。
- red测试14张，Recall/F1均为0；breakers Recall为23.08%，pink Recall为32.14%。
- 类别严重不平衡；94.05%的总体Accuracy不能代表六类均能可靠识别。
- 高置信错误confidence>=0.8有34张，>=0.9有13张。
- 输出仅为成熟阶段视觉分类，不是品质最终判定、食品安全判定或采收决策最终结论。
- 冻结为可复现V1 baseline，不表示已达到部署验收条件。

image_level=true  
fruit_independent=false  
session_independent=false  
local_qingxian_validated=false

## 冻结溯源

源模型：`runs/tomato_ripeness_yolo11n_cls_v1/weights/best.pt`
冻结模型：`models/tomato/tomato_ripeness_yolo11n_cls_v1.pt`
SHA256：`09d0c0d8d75e9c1c25a8ba59e015594000cc1169dc234bf1098cbf02f78b8b75`
大小：3196610 bytes。
权重仅逐字节复制，未加载后重存或导出。源哈希与既有正式评估记录一致，源与冻结文件哈希一致。
完整指标见 JSON 中 metrics；V1原报告与权重保留未改动。
