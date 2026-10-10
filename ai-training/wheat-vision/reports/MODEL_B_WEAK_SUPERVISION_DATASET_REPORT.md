# Model B 弱监督数据集准备报告

This dataset uses treatment-derived weak labels.
The water_stress class represents canopy images from plots assigned to
post-anthesis deficit irrigation treatment.
Because the exact first post-anthesis deficit-irrigation date is unavailable,
the class must not be interpreted as image-level confirmation of actual
soil-water deficit.

water_stress 为实验处理组弱标签，不是逐图真实缺水状态确诊。normal 同样仅表示 control 处理组，不保证每张图健康或没有其他胁迫。

## 规则及范围

依用户本次批准的新任务定义，全部5个明确花前日期的450张图片同时排除，包含control和亏缺组。14个后期候选日期 phase=post_anthesis_candidate。标签仅依据README p2/p4小区分配；p5阶段说明只作候选范围依据，不将花后等同真实缺水。
两季开始日期仍unknown；confirmed_stress与stress_active均unknown，没有生成confirmed_stress=true。既有严格标签清单和时间证据报告全部保留，新弱标签仅写入model_b_weak_*文件。

## 小区分组与平衡

真实编号包含r1/r2/r3，合计90个编号+重复身份。跨季物理身份未明确，保守绑定同编号+重复的全部日期。再把同品种、同重复的control/deficit两个不同小区配成平衡对，配对并不声称二者是同一小区。
seed=42，45对按31/7/7分配，得到train62、val14、test14个小区。候选中所有日期在三个split都有覆盖；两类与两季均有覆盖。
训练集覆盖全部15种品种/混合组合；val/test各覆盖7种组合，且两种处理内组合完全一致。每个验证/测试集只有7个配对组，无法各覆盖15种组合；没有为增加覆盖而拆小区。验证与测试选择不同组合，保留训练覆盖，同时减少类别与品种的混杂。
第一季189 DAS缺34张的官方相机故障导致少量类数量差异；不重采样，不扩增，不复制少数类。SHA256冲突排除，完全重复只保留一个有效代表；不凭pHash或图像颜色改标签。

## 科学限制

这是伊朗试验处理组的视觉弱监督baseline，不是黄骅田间逐图含水量标注。成熟、品种、年份、光照、冷胁迫及标尺可能混杂；README记载第二季174 DAS冷胁迫日期已在排除范围内，末期标尺日期仍按用户范围纳入，需在后续模型分析中核验这些影响。
原目录date/DAS保留，包括第一季已记录的1天差异。不能用此模型输出干旱确诊、土壤含水量或实际胁迫概率；后续本地应用需要本地实测验证。本阶段没有训练或修改推理/前端。

## 统计与完整性

```json
{
  "seed": 42,
  "raw_total": 1676,
  "candidate_post_anthesis_images": 1226,
  "confirmed_pre_stress_excluded": 450,
  "clean_total": 1226,
  "normal": 617,
  "water_stress": 609,
  "control_plots_used": 45,
  "water_stress_plots_used": 45,
  "exclusions": {
    "confirmed_pre_stress": 450
  },
  "duplicates": {
    "exact_duplicate_groups": 0,
    "exact_duplicate_redundant": 0,
    "cross_label_exact_duplicate_groups": 0
  },
  "leakage": {
    "cross_split_plot": 0,
    "cross_split_sha256": 0,
    "cross_split_exact_duplicate": 0,
    "confirmed_pre_stress_entered": 0,
    "label_conflict_entered": 0,
    "corrupt_entered": 0,
    "confirmed_stress_true_entered": 0,
    "missing_plot_id_entered": 0,
    "target_filename_duplicate": 0,
    "raw_modified_deleted_added": 0
  },
  "stress_start": {
    "season1": "unknown",
    "season2": "unknown"
  },
  "cross_season_physical_identity": "unknown; identical numbered replicates are conservatively bound",
  "label_strength": "weak",
  "disclaimer": "This dataset uses treatment-derived weak labels.\nThe water_stress class represents canopy images from plots assigned to\npost-anthesis deficit irrigation treatment.\nBecause the exact first post-anthesis deficit-irrigation date is unavailable,\nthe class must not be interpreted as image-level confirmation of actual\nsoil-water deficit.",
  "splits": {
    "train": {
      "total": 848,
      "normal": 426,
      "water_stress": 422,
      "plots": 62,
      "control_plots": 31,
      "water_stress_plots": 31,
      "mixtures": [
        "Chamran",
        "Chamran+Pishtaz",
        "Chamran+Pishtaz+Shiraz",
        "Chamran+Shiraz",
        "Chamran+Sirvan",
        "Chamran+Sirvan+Pishtaz",
        "Chamran+Sirvan+Pishtaz+Shiraz",
        "Chamran+Sirvan+Shiraz",
        "Pishtaz",
        "Pishtaz+Shiraz",
        "Shiraz",
        "Sirvan",
        "Sirvan+Pishtaz",
        "Sirvan+Pishtaz+Shiraz",
        "Sirvan+Shiraz"
      ],
      "season1": 290,
      "season2": 558,
      "dates": [
        "2015-05-15",
        "2015-05-29",
        "2015-06-01",
        "2015-06-06",
        "2015-06-14",
        "2016-05-11",
        "2016-05-14",
        "2016-05-17",
        "2016-05-20",
        "2016-05-23",
        "2016-05-31",
        "2016-06-03",
        "2016-06-06",
        "2016-06-20"
      ]
    },
    "val": {
      "total": 189,
      "normal": 95,
      "water_stress": 94,
      "plots": 14,
      "control_plots": 7,
      "water_stress_plots": 7,
      "mixtures": [
        "Chamran+Pishtaz",
        "Chamran+Sirvan",
        "Chamran+Sirvan+Pishtaz",
        "Chamran+Sirvan+Pishtaz+Shiraz",
        "Pishtaz",
        "Shiraz",
        "Sirvan+Pishtaz+Shiraz"
      ],
      "season1": 63,
      "season2": 126,
      "dates": [
        "2015-05-15",
        "2015-05-29",
        "2015-06-01",
        "2015-06-06",
        "2015-06-14",
        "2016-05-11",
        "2016-05-14",
        "2016-05-17",
        "2016-05-20",
        "2016-05-23",
        "2016-05-31",
        "2016-06-03",
        "2016-06-06",
        "2016-06-20"
      ]
    },
    "test": {
      "total": 189,
      "normal": 96,
      "water_stress": 93,
      "plots": 14,
      "control_plots": 7,
      "water_stress_plots": 7,
      "mixtures": [
        "Chamran+Pishtaz+Shiraz",
        "Chamran+Shiraz",
        "Chamran+Sirvan+Shiraz",
        "Pishtaz+Shiraz",
        "Sirvan",
        "Sirvan+Pishtaz",
        "Sirvan+Shiraz"
      ],
      "season1": 63,
      "season2": 126,
      "dates": [
        "2015-05-15",
        "2015-05-29",
        "2015-06-01",
        "2015-06-06",
        "2015-06-14",
        "2016-05-11",
        "2016-05-14",
        "2016-05-17",
        "2016-05-20",
        "2016-05-23",
        "2016-05-31",
        "2016-06-03",
        "2016-06-06",
        "2016-06-20"
      ]
    }
  },
  "training_ready_weak_baseline": true
}
```

## 同季同日类别分布

|season|date|DAS|normal|water_stress|
|---|---|---|---|---|
|1|2015-05-15|175|45|45|
|1|2015-05-29|189|32|24|
|1|2015-06-01|192|45|45|
|1|2015-06-06|197|45|45|
|1|2015-06-14|205|45|45|
|2|2016-05-11|188|45|45|
|2|2016-05-14|191|45|45|
|2|2016-05-17|194|45|45|
|2|2016-05-20|197|45|45|
|2|2016-05-23|200|45|45|
|2|2016-05-31|208|45|45|
|2|2016-06-03|211|45|45|
|2|2016-06-06|214|45|45|
|2|2016-06-20|228|45|45|

所有原图采用copy2复制，逐张校验目标SHA256；raw全部文件前后哈希相同。原严格raw/clean/split manifest哈希相同。正式目录包含六个类别子目录，以及README.md、label_semantics.json。完成后停止，无训练。
