# 视觉评估总索引

本次为已有材料归档，非新的模型评测。分支 archive/vision-evaluations-20261019 基于 2026-10-19 fetch 后的 origin/main 建立；本目录归档不改变 main。

| 任务／模型 | 冻结状态 | 原始评估材料（归档副本） | 数据及规模 | Accuracy / Macro-F1 / Balanced Accuracy | 独立测试与现场验证 |
|---|---|---|---|---|---|
| 番茄叶片 tomato_leaf_yolo11n_cls_v1 | 已有冻结权重，哈希与此次找到的指标 JSON 一致 | [报告](tomato-leaf/TOMATO_MODEL_A_LEAF_V1_EVALUATION.md)、[指标](tomato-leaf/tomato_leaf_v1_model_metrics.json)、同目录预测 CSV、分类报告、混淆矩阵 | TLID 公开温室番茄；2101 张，七类；本机 PART 正式 test 目录 | 87.14898% / 0.847319 / 84.22553% | 存在本地测试执行材料；叶片个体独立性未验证；青县现场未验证 |
| 番茄成熟度 tomato_ripeness_yolo11n_cls_v1 | 冻结 V1，完整哈希与原指标一致 | [报告](https://github.com/YJsnz/agric/blob/0294d16ff1163fb6561da9090d89540a0f615d82/ai-training/vegetable-vision/reports/TOMATO_MODEL_B_V1_EVALUATION.md)、[指标](https://github.com/YJsnz/agric/blob/0294d16ff1163fb6561da9090d89540a0f615d82/ai-training/vegetable-vision/reports/tomato_model_b_v1_metrics.json)、预测、两种混淆矩阵、高置信错误 | AerialYield-T2M；数据 V2，Test 2201 张；模型 V1 与数据 V2 不混淆 | 94.04816% / 0.536366 / 50.99909% | 图像级内部评测；session/fruit 非独立；青县现场未验证 |
| 番茄成熟度 tomato_ripeness_yolo11n_cls_v2 | 研究实验，不能替换冻结 V1 | [报告](https://github.com/YJsnz/agric/blob/0294d16ff1163fb6561da9090d89540a0f615d82/ai-training/vegetable-vision/reports/TOMATO_MODEL_B_V2_EVALUATION.md)、[指标](https://github.com/YJsnz/agric/blob/0294d16ff1163fb6561da9090d89540a0f615d82/ai-training/vegetable-vision/reports/tomato_model_b_v2_metrics.json)、预测、两种混淆矩阵、高置信错误 | AerialYield-T2M；Test 2201 张 | 91.41299% / 0.511251 / 54.33750% | 图像级内部评测；保留四对 uncertain 风险；无青县现场验证 |
| 梨叶 pear_symptom_yolo11n_cls_v1 | 当前 pear_diagnosis 加载权重，哈希与报告一致；缺完整训练冻结溯源 | [报告](pear-leaf/PEAR_MODEL_EVALUATION.md)、[指标](pear-leaf/pear_model_metrics.json)、预测、分类报告、混淆矩阵；[脚本](../../ai-training/pear-vision/scripts/evaluate_pear.py) | Pear/leaves 经项目准备的 test 299 张：curl 5、healthy 4、slug 202、spot 88 | 88.62876% / 0.825963 / 77.54108% | 已有本地测试执行结果，但无法证明部署权重的训练集与测试集独立；严格口径：**本地独立验证尚未完成**；现场未验证 |
| 枣果碰伤 jujube_fruit_bruise_yolo11n_cls_v1 | 本次仅归档既有补充评测 | [报告](jujube-bruising/JUJUBE_MODEL_B1_FRUIT_BRUISE_V1_EVALUATION.md)、同目录指标、预测、混淆矩阵 | 223 张 | 97.7578% / 0.977578 / 97.7755% | 以原报告所述样本身份独立性和预处理限制为准，不补充现场验证结论 |

## 已有材料复用

- [番茄成熟度 V1 Model Card](../../ai-training/vegetable-vision/models/tomato/TOMATO_RIPENESS_YOLO11N_CLS_V1_MODEL_CARD.md)、同目录 metadata JSON、SHA256 与冻结权重：已在本地 main 及缓存 origin/main 中，不重复归档。
- 番茄叶片冻结权重和 `ai-service/models/pear/pear_symptom_yolo11n_cls_v1.pt` 也在本地 main 及缓存 origin/main 中。完整实测 SHA256 见 MODEL_HASH_CHECK.json；本次没有复制或提交权重。
- [小麦评估目录](../../ai-training/wheat-vision/reports/)和[小枣评估目录](../../ai-training/jujube-vision/reports/)已有受跟踪报告及指标，不重复复制。

## 差异、缺失及不能扩大解释的事项

1. 番茄叶片历史线索 87.05% / 0.8465 / 84.36% / AUC 0.9818 与本次找到的后续独立运行结果不同。本次保留找到的原文件，不拼接两次评测。历史那一轮的完整报告、指标、预测与归档模型卡尚未定位；不能将本次材料冒充该历史运行。
2. 叶片冻结权重存在，但配套的历史 `.sha256` 文本、metadata JSON、Model Card 不齐全；新生成的 MODEL_HASH_CHECK.json 是本次文件完整性检查，不冒充原冻结归档。
3. 番茄成熟度 V1 的 red 类 Recall/F1 为 0，breakers Recall 23.08%，pink Recall 32.14%；总体 Accuracy 不代表少数类均能可靠识别。V2 Macro-F1 未超过 V1，不能只选择有利指标声称全面改善。
4. 果实四对 uncertain 近重复风险、类别不均衡、fruit/session 非独立及 local_qingxian_validated=false 均保留。无现场生产准确率声明。
5. 梨叶报告称固定 seed 的划分为“官方”，但仅据项目准备脚本无法证明数据发布方官方划分；归档不修改原文，索引采用“项目准备的 test 划分”。报告还明确缺训练日志及数据独立性证明，并说明预处理差异。不能因为报告标题有“独立”就判定训练／测试完全独立。
6. 评估脚本存在本机绝对路径，原样归档；未执行脚本、未修正预处理、未重算指标。
7. 已成功 fetch 并核对远端引用。本次不创建 PR、不合并、不对 main 或已有分支提交。


## 2026-10-19 新评测

用户授权对缺失历史材料重新评测；[新报告](tomato-leaf/reevaluation-20261019/EVALUATION.md)、[完整指标与元数据](tomato-leaf/reevaluation-20261019/metrics.json)、[新模型卡](tomato-leaf/reevaluation-20261019/MODEL_CARD.md)。这是新运行，不是对历史记录的恢复。采用 Ultralytics 原生逐图预处理，与归档的先 cv2.resize 再 predict 的评测有区别，不按 Test 选择有利结果。冻结权重与 Test 文件评测前后 SHA256 相同。


成熟度原始材料与三个历史评估脚本已存在于远端历史，不重复提交副本；完整不可变链接见 [已有远端材料](ALREADY_ON_GITHUB.md)。本地候选副本仅供审核，不进入提交。
