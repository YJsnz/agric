# Model B v1 Model Card

## 1. 模型任务

小麦冠层水分胁迫弱监督视觉分类器，属于 weak-supervision visual evidence model。冻结版本 wheat_water_stress_yolo11n_cls_v1，架构 YOLO11n-cls。只输出实验处理组视觉相似性证据，不是实际水分状态诊断。

## 2. 数据来源

Diverse Canopy of Wheat Cultivar Mixtures，Zenodo DOI 10.5281/zenodo.10694706，https://zenodo.org/records/10694706 。原实验为伊朗两季小麦品种/混合冠层数据，不是黄骅田间缺水标注。标签依据 README.pdf 的 experimental plots / treatment metadata，未按发黄程度改标签。

## 3. Clean 数据

原图1676张；排除5个花前日期450张（两类均排除），保留14个post-anthesis候选日期，共1226张：normal617、water_stress609。没有生成逐图confirmed_stress=true。

## 4. 实验小区

45 control / 45 deficit plots，共90个编号+replicate身份，包含r1/r2/r3。跨季同编号小区物理身份未知，保守绑定。control/deficit相同品种和重复可配对，但不解释为同一小区。

## 5. Plot-aware split

| split | sample_count | normal | water_stress | plots |
| --- | --- | --- | --- | --- |
| train | 848 | 426 | 422 | 62 |
| val | 189 | 95 | 94 | 14 |
| test | 189 | 96 | 93 | 14 |

分组seed42，45配对组按31/7/7划分。同一编号+replicate的全部日期和两季归于同一split。cross-split plot=0、cross-split SHA256=0。重复日期样本不是统计独立观测。冻结阶段未重新划分或修改任何数据。

## 6. Weak-label 定义

water_stress 是 treatment-derived weak label，代表“冠层视觉表现更接近花后亏缺灌溉实验处理组”。normal代表对照正常灌溉处理组，不保证没有其他胁迫。water_stress不是实际缺水确诊、土壤水分状态或缺水发生概率。

## 7. 灌溉起始时间

exact irrigation start unknown / exact deficit-irrigation start date is unknown。两季精确处理开始日期均未知，只有花后处理的实验规则。post-anthesis候选日期不能自动视为每张图已出现实际胁迫。

## 8. YOLO11n-cls训练配置

{
  "model": "yolo11n-cls.pt",
  "epochs": 60,
  "patience": 15,
  "batch": 32,
  "imgsz": 224,
  "optimizer": "AdamW",
  "lr0": 0.001,
  "lrf": 0.01,
  "weight_decay": 0.0005,
  "seed": 0,
  "deterministic": true,
  "pretrained": true,
  "amp": true,
  "workers": 8,
  "cache": false,
  "auto_augment": "randaugment",
  "erasing": 0.4,
  "fliplr": 0.5
}

以上来自原训练args.yaml，只记录既有训练配置；本次不训练。评估/部署固定Ultralytics8.3.40、224输入、workers=0、FP32、无推理增强。

## 9. 最佳epoch

原results.csv验证 best epoch=6、best val top1=0.60317（约60.3%），最后记录epoch21；原设置patience15与用户报告early stop一致。冻结的是完整v12的best.pt，不是中断v1的权重。

## 10. 默认阈值结果

| rule | threshold | accuracy | macro_f1 | balanced_accuracy | normal_precision | normal_recall | normal_f1_score | water_stress_precision | water_stress_recall | water_stress_f1_score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| default | 0.500000 | 0.587302 | 0.523837 | 0.581653 | 0.555556 | 0.937500 | 0.697674 | 0.777778 | 0.225806 | 0.350000 |

默认0.5混淆矩阵为 [[90,6],[72,21]]，行列均按normal, water_stress排列。189张test中96 normal / 93 water_stress。

## 11. Threshold calibration方法

验证集189张（normal95、水分处理组94），扫描0.05–0.95、步长0.01。主要目标为Val Balanced Accuracy，数值平局按water_stress Recall、Precision、距0.5最近、较低阈值依次选择。阈值先写入lock，再对test进行一次推理；没有按test回调。

selected threshold was determined only on validation data.

The test set was not used for threshold selection.

best Macro-F1 threshold=0.35，Val Macro-F1=0.674294；best Balanced Accuracy threshold=0.37，Val BA=0.681691。两者不同，最终严格按BA选择0.37。阈值校准只改变操作点，不是模型分数概率校准。

## 12. Selected threshold

WATER_STRESS_THRESHOLD = 0.37，IMAGE_SIZE = 224。规则：water_stress model score >= 0.37 → water_stress；否则 → normal。不得用argmax或0.5覆盖正式冻结阈值。

## 13. Calibrated Test结果

| rule | threshold | accuracy | macro_f1 | balanced_accuracy | normal_precision | normal_recall | normal_f1_score | water_stress_precision | water_stress_recall | water_stress_f1_score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| calibrated | 0.370000 | 0.634921 | 0.617801 | 0.631720 | 0.601504 | 0.833333 | 0.698690 | 0.714286 | 0.430108 | 0.536913 |

相对默认：Accuracy增加4.76个百分点，Macro-F1增加0.093964，Balanced Accuracy增加5.01个百分点，water_stress Recall增加20.43个百分点；Precision由77.78%降至71.43%。这是描述性改善，未证明统计显著。

## 14. Confusion matrix

```text
[[80,16],
 [53,40]]
```

行=真实处理组弱标签，列=预测类别；顺序normal, water_stress。不使用医学TP/TN语义。

## 15. Season / date dependence

现有正式默认0.5评估：Season1 n63、Accuracy61.90%、Macro-F1=0.5809；Season2 n126、Accuracy57.14%、Macro-F1=0.4913。最佳日期2015-06-01和2016-06-06 Accuracy85.71%，最差2016-05-17 Accuracy42.86%。存在date dependence及一定season表现差异，无日期推后而单调改善趋势。以上分组指标是原默认阈值结果，未重算校准阈值的season/date指标，不应混用。不能据此断言season背景捷径、真实胁迫加重或模型容量不足。

## 16. Limitations

- 处理组weak label没有逐图土壤/植株水分实测支撑，精确灌溉开始日期未知。
- 成熟、品种、日期、年份、光照、标尺等因素可能混杂；现有测试不能确定因果。
- test中仅14个编号小区，跨日期图像相关；两季均在train中，非留一季泛化验证。
- 校准后water_stress Recall仅43.01%，仍有53/93处理组图片判为normal，能力有限。
- test accuracy should not be interpreted as clinical/physical diagnosis accuracy。
- 未做黄骅本地实测验证；不支持自动灌溉决策或缺水确诊。

## 17. Deployment interpretation

配置保存于models/wheat/wheat_water_stress_yolo11n_cls_v1.json；model_path相对于包含models/data/reports/runs/scripts的实际项目根解析。本项目当前多嵌套一层wheat-vision，绝对路径如下。

F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\wheat-vision\wheat-vision\models\wheat\wheat_water_stress_yolo11n_cls_v1.pt

读取模型names确定water_stress索引，获取该类分数作为visual_score；两种输出都使用water_stress score，不使用top1 confidence替代。应用阈值0.37决定visual_class。visual_score只是water-stress-treatment visual similarity score，不是soil water deficit probability。

| class | label_zh | explanation |
| --- | --- | --- |
| normal | 正常冠层视觉状态 | 当前冠层视觉表现更接近正常灌溉处理组。 |
| water_stress | 疑似水分胁迫视觉表现 | 当前冠层视觉表现更接近花后亏缺灌溉处理组，建议结合土壤水分、天气、生育期及知识图谱证据进一步判断。 |

禁止输出“已发生缺水”“土壤已经缺水”“缺水概率XX%”；不得返回probability_of_water_deficit。normal中文名称是界面标签，不保证实际无胁迫。

visual output should be treated as one piece of evidence for downstream multimodal risk reasoning。该阶段只冻结资产与配置，不新增API、训练或实验。

### 冻结完整性

权重SHA256：`14f5e8592020f81adb94500e100b8b7e62c56dfb819e21499af6545eebf3422e`。从v12 best.pt逐字节复制；原文件保留。正式v1应视为版本固定资产，修改权重或阈值须另起版本。本次不设置Windows只读属性，避免改变原文件或后续文件管理行为。
