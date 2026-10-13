# Model B 全量数据准备审计

状态：BLOCKED：缺少可靠的胁迫开始时间

## 原文核验

README.pdf p1：伊朗 Shiraz University，2014–15/2015–16 两季，RCBD，15 种品种组合 × 2 灌溉处理 × 3 重复；小区 2×2 m。四品种为 Chamran、Sirvan、Pishtaz、Shiraz，混播等比例。

p2/p4：文件名 1–30 + r1/r2/r3；1–15 为足量灌溉，16–30 为对应的花后亏缺灌溉（50% FC）。处理和布局跨季一致；具体物理小区是否复用未明说。不能使用忽略 r 重复编号的 30 组划分。

p1/p5：第一季 189 DAS 因相机存储故障只有 56 张。逐日期阶段、拍摄时间和特殊说明保存在 model_b_readme_text.txt。第二季 174 DAS 有冷胁迫，末期有标尺/泡沫框，成熟与照明均可能成为混杂因素。

## 未解决的信息与阻断原因

两季具体处理开始日期/DAS：unknown。花后处理描述及拍摄时的灌浆/成熟阶段，不等于已证明首次亏缺灌溉的日期。严禁将后期图像自动标签为 water_stress。前期分蘖/孕穗可确定属于花前；其 water-stress treatment 图像按 pre_stress 排除。control 图像没有可确认已开始胁迫的同日对照，暂不成为 normal 训练标签。

没有伪造正式训练集；空 clean/split CSV 只表示科学条件未满足，泄漏为零不等于准备成功。原始物理小区跨季身份 unknown；未来采用同编号+重复跨季保守绑定，不假定独立。

可补充经审核原文的 --metadata JSON：stress_start 中每季需 date、das、source、locator。脚本会核验日期/DAS、与花前阶段是否冲突，再进行同季同日双类匹配、去重、seed=42 小区划分和复制完整性检查。

## 官方资料核查

数据集：https://zenodo.org/records/10694706 （页面确认总量与花后处理，但无具体开始日期）。README 引用 https://doi.org/10.1016/j.eja.2020.126188；公开可访问摘要未提供所需精确日期，本次未取得可核验的方法全文。

## 全量统计与泄漏检查

```json
{
  "raw_total": 1676,
  "season1": 596,
  "season2": 1080,
  "date_directory_count": 19,
  "numbered_replicate_identities": 90,
  "physical_identity_across_seasons": "unknown",
  "sowing_date_das_discrepancies": [
    {
      "season": 1,
      "das": 104,
      "date": "2015-03-05",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 105,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 155,
      "date": "2015-04-25",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 156,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 175,
      "date": "2015-05-15",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 176,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 189,
      "date": "2015-05-29",
      "raw_count": 56,
      "expected_count": 56,
      "elapsed_from_readme_sowing": 190,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 192,
      "date": "2015-06-01",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 193,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 197,
      "date": "2015-06-06",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 198,
      "normal_count": 0,
      "water_stress_count": 0
    },
    {
      "season": 1,
      "das": 205,
      "date": "2015-06-14",
      "raw_count": 90,
      "expected_count": 90,
      "elapsed_from_readme_sowing": 206,
      "normal_count": 0,
      "water_stress_count": 0
    }
  ],
  "grouping_policy": "same numbered replicate kept together across seasons conservatively",
  "plot_id_parsed": 1676,
  "missing_plot_id": 0,
  "control_plots": 45,
  "water_stress_plots": 45,
  "control_raw": 842,
  "water_stress_raw": 834,
  "stress_start": {
    "1": "unknown",
    "2": "unknown"
  },
  "exclusion_counts": {
    "missing_stress_start": 1451,
    "pre_stress": 225
  },
  "dimensions": {
    "3264x2448": 1676
  },
  "clean_total": 0,
  "normal": 0,
  "corrupt_total": 0,
  "abnormal_dimensions_total": 0,
  "water_stress": 0,
  "duplicates": {
    "exact_duplicate_groups": 0,
    "exact_duplicate_redundant": 0,
    "cross_label_exact_duplicate_groups": 0
  },
  "leakage": {
    "cross_split_plot": 0,
    "cross_split_exact_duplicate": 0,
    "label_conflict_entered": 0,
    "pre_stress_entered": 0,
    "corrupt_entered": 0,
    "missing_plot_id_entered": 0,
    "duplicate_target_filename": 0,
    "raw_modified_deleted_added": 0
  },
  "training_ready": false,
  "blocked_reasons": [
    "season1_stress_start_unknown",
    "season2_stress_start_unknown",
    "no_eligible_time_matched_images"
  ],
  "splits": {
    "train": {
      "total": 0,
      "normal": 0,
      "water_stress": 0,
      "plots": 0,
      "season1": 0,
      "season2": 0,
      "dates": []
    },
    "val": {
      "total": 0,
      "normal": 0,
      "water_stress": 0,
      "plots": 0,
      "season1": 0,
      "season2": 0,
      "dates": []
    },
    "test": {
      "total": 0,
      "normal": 0,
      "water_stress": 0,
      "plots": 0,
      "season1": 0,
      "season2": 0,
      "dates": []
    }
  }
}
```

## 日期覆盖

|season|DAS|date|raw|expected|normal|water_stress|
|---|---|---|---|---|---|---|
|1|104|2015-03-05|90|90|0|0|
|1|155|2015-04-25|90|90|0|0|
|1|175|2015-05-15|90|90|0|0|
|1|189|2015-05-29|56|56|0|0|
|1|192|2015-06-01|90|90|0|0|
|1|197|2015-06-06|90|90|0|0|
|1|205|2015-06-14|90|90|0|0|
|2|174|2016-04-27|90|90|0|0|
|2|188|2016-05-11|90|90|0|0|
|2|191|2016-05-14|90|90|0|0|
|2|194|2016-05-17|90|90|0|0|
|2|197|2016-05-20|90|90|0|0|
|2|200|2016-05-23|90|90|0|0|
|2|208|2016-05-31|90|90|0|0|
|2|211|2016-06-03|90|90|0|0|
|2|214|2016-06-06|90|90|0|0|
|2|228|2016-06-20|90|90|0|0|
|2|47|2015-12-22|90|90|0|0|
|2|93|2016-02-06|90|90|0|0|

## 缺失图像身份

```json
{
  "1stS_189DAS_20150529": [
    "12r3",
    "13r2",
    "14r3",
    "15r2",
    "17r3",
    "20r2",
    "21r1",
    "21r2",
    "21r3",
    "22r1",
    "22r3",
    "23r1",
    "24r1",
    "25r1",
    "25r3",
    "26r1",
    "26r2",
    "26r3",
    "27r1",
    "27r2",
    "28r1",
    "28r3",
    "29r1",
    "2r2",
    "30r1",
    "30r3",
    "3r3",
    "4r2",
    "4r3",
    "5r3",
    "8r2",
    "8r3",
    "9r2",
    "9r3"
  ]
}
```

仅以 SHA256 判定完全重复；没有使用 pHash 删除、聚类或推断来源。本次没有训练、增强、重采样、移动或修改原图。
