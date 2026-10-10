# 金丝小枣视觉 Model A v1 — Model Card

冻结日期：2026-10-08。正式 baseline，仅用于叶片视觉症状分类，不是沧州本地田间确诊模型。
## 来源与可追溯性
- 正式训练 run：`runs\jujube_leaf_yolo11n_cls_v13`。未使用 v1/v12 run。
- 正式副本：`models\jujube\jujube_leaf_yolo11n_cls_v1.pt`；仅文件复制，不重新保存 checkpoint。
- SHA256：`57531b0b9e57b5714602cb79717148442ba662309df0e9bb1c3d2e092779c5a2`。
- 公开数据来源：Mendeley `yxmf3cd865`、`58py9f3nsy`。两个来源可能共享采集机构/贡献者，不等于独立本地田间样本。
- 正式评估数据版本：`jujube_leaf_classifier_v3_final`；Train 2288 / Val 456 / Test 452。
- 数据按清单保留既有划分；冲突已排除、已确认近重复按组绑定。仍有 14614 对未确认近重复候选风险，不宣称全部同源风险已消除。
- 本地正式评估时历史 JPEG 规范化清单缺失；实际测试输入哈希记录于 model_a_test_input_integrity.csv。该限制随版本保留。
## 训练与固定推理
- YOLO11n-cls，参数量 1,532,429，Ultralytics 8.3.40，imgsz=224。
- optimizer=AdamW，batch=32，lr0=0.001，seed=0。
- max epochs=80，actual epochs=49，best epoch=29，patience=20，best Val Top-1=82.675%。
- early stopping=true：依据 results.csv 与 args.yaml 推断，未读取服务器终止日志。完整训练配置保留在原 run。
- 固定 argmax 分类，不调阈值。评估采用 OpenCV cv2.imread 与官方 ClassificationDataset 相同读取方式，224 Resize + CenterCrop、crop_fraction=1.0、无推理增强。
- 后端必须读取 checkpoint.names 获取输出索引，不得把配置 classes 列表次序当模型 logit 索引。
## 正式 Test
| 指标 | 值 |
|---|---:|
| accuracy | 0.811947 |
| macro_precision | 0.795888 |
| macro_recall | 0.750284 |
| macro_f1 | 0.768390 |
| balanced_accuracy | 0.750284 |
| weighted_f1 | 0.811090 |

| 类别 | support | P | R | F1 |
|---|---:|---:|---:|---:|
| healthy | 173 | 0.8466 | 0.9249 | 0.8840 |
| anthracnose | 106 | 0.7203 | 0.8019 | 0.7589 |
| powdery_mildew | 28 | 0.5769 | 0.5357 | 0.5556 |
| insect_damage | 59 | 1.0000 | 0.7797 | 0.8762 |
| yellow_leaf | 86 | 0.8356 | 0.7093 | 0.7673 |

Top-5=1.0，因总类别数为5，无实际区分意义。
## 已知限制
- powdery_mildew 是主要弱类：Test support=28，Recall=53.57%，F1=0.5556。
- 最大混淆：yellow_leaf → anthracnose=17张，不能将黄化直接解释为炭疽病。
- 来源间性能差异/domain gap：yxmf3cd865 Accuracy=86.75%（151张），58py9f3nsy=78.41%（301张）。该差异不构成因果解释。
- 高置信度错误≥0.8：25张；≥0.9：9张。模型得分不是确诊概率。
- 当前模型不是沧州本地田间确诊模型；尚不能证明跨品种、光照、拍摄背景和生育期泛化能力。
## 固定类别语义
- `healthy`：健康叶片视觉状态。
- `anthracnose`：炭疽病类视觉表现。
- `powdery_mildew`：白粉病类视觉表现。
- `insect_damage`：虫害损伤视觉表现。
- `yellow_leaf`：黄化视觉表现。

yellow_leaf 禁止直接翻译为缺氮、缺铁、盐害或具体病害。healthy 也不证明没有潜在病害。
## 后续 KG / GraphRAG 接入原则
仅传递 visual observation / visual candidate、分类得分及模型版本；结合环境、生育阶段、管理信息和 KG/GraphRAG 检索证据生成风险研判。缺失上下文保持未知，不从作物名推断地区，不把视觉标签作为病害事实写入 KG。
保留证据来源及适用范围；候选与确诊分离。不得凭视觉类别直接给出缺素、盐害或具体病害确诊，亦不得把模型分数转换成诊断概率。
本阶段未接入后端、未启动 v2 实验、未训练、未调参。完整逐图结果、置信度错误和混淆矩阵保留在 reports。
