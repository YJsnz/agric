# 第9步：数据源语义核验与原图隔离

仅更新映射及manifest，没有修改raw、复制训练图片、划分、增强、平衡或训练。重新逐张解码并计算哈希；第8步报告保留历史口径。

## 来源核验

[官方Mendeley记录](https://data.mendeley.com/datasets/th422bg4yd/1)确认健康对照、缺氮及叶锈子数据集。限定archive及成员根目录映射control/deficiency/diseased，禁止全局映射。实际Ndeficient.zip为300 control + 300 deficiency，共600；与页面中300的文字歧义明确区分。原图指原发布分区图片，已做背景分割，并非未经处理的相机原片。

## 实测汇总

```json
{
  "classes": [
    {
      "mapped_label": "healthy",
      "verified_unique_count": 792,
      "group_count": 683,
      "source_dataset_count": 3
    },
    {
      "mapped_label": "rust",
      "verified_unique_count": 472,
      "group_count": 459,
      "source_dataset_count": 2
    },
    {
      "mapped_label": "leaf_spot_blight",
      "verified_unique_count": 461,
      "group_count": 308,
      "source_dataset_count": 2
    },
    {
      "mapped_label": "nitrogen_deficiency",
      "verified_unique_count": 100,
      "group_count": 94,
      "source_dataset_count": 1
    }
  ],
  "source_variant_counts": {
    "original_source_partition": 1866,
    "augmented_or_split": 10000,
    "original": 1603,
    "auxiliary_unlabeled": 1081
  },
  "excluded_reasons": {
    "unusable_conflict": 620,
    "unusable_duplicate": 71,
    "augmented_or_split": 10000,
    "excluded_class": 953,
    "auxiliary_unlabeled": 1081
  },
  "nitrogen_rust_counts": {
    "nitrogen/control": 300,
    "nitrogen/deficiency": 300,
    "rust/control": 491,
    "rust/diseased": 368
  },
  "conflict_pairs": 3555,
  "conflict_sha256_count": 626,
  "pair_counts": {
    "exact_pairs": 5996,
    "near_pairs": 43826
  },
  "usable_groups": 1542,
  "largest_usable_group": 98,
  "mixed_label_usable_groups": 1,
  "winter_metadata_candidates": []
}
```

## 隔离策略

- wheat_disease_original仅精确匹配Original Dataset目录为原图；其余Augmented及Split副本全部禁用。真正原图1603，增强与划分副本10000。范围内原图仅HealthyLeaf 250、LeafBlight 400，之后继续扣除重复及冲突。
- winter_wheat_nitrogen目录无逐图标签时保持auxiliary_unlabeled，不能依据研究用途标缺氮。若未来找到元数据须人工核验逐图对应，本脚本不猜。
- 先排除版本、范围、坏图和冲突，再在合格原图中按SHA256保留一个稳定代表。不能让先遇到的增强图挤掉原图。conflict_flag独立记录，避免排除原因优先级遮蔽冲突。
- 已知类别之间的exact/near冲突重新按新映射检查，同SHA的副本一起隔离。近似冲突是待复核嫌疑，不是已证实错标。未知类无法自动判定冲突。
- 所有exact/near边的连通分量建立稳定group_id，包括被排除增强图的同源连接；同组未来必须同split。非冲突的近似组不删除。传递相似可能形成大组，需人工复核，group不等于已证明同一植株或plot。

## 是否可以划分

四类非零后具备编制分组划分方案的基础，但不批准直接随机划分或照搬原split。先检查near_duplicate_groups_verified.csv的大组、混合标签组及冲突；需要保留采集来源、同拍序列和plot分组信息。pHash不能证明所有增强均已检出。当前仍不训练、不自动划分。

## 运行

`ai-service/.venv/Scripts/python.exe ai-training/wheat-vision/scripts/verify_dataset_sources.py`（agric目录）。
主要文件：model_a_verified_manifest.csv、class_statistics_verified.csv、nitrogen_rust_mapping.csv、wheat_disease_variant_inventory.csv、label_conflicts_verified.csv。

## 重要复核事项

缺氮标签已恢复为300张；不是只有100张原始缺氮图片。按当前保守隔离策略，172张涉及pHash近似标签冲突、28张为其余候选中的完全重复，剩余100张可用唯一图片。

新映射后共3555对近似标签冲突，完全重复标签冲突为0。近似哈希受叶片轮廓、纯色背景、分割预处理影响，不能证明3555对都被错标。此处严格按“冲突先隔离”的要求设置usable=false，未删除任何图片。应人工复核后决定恢复哪些样本，不能为了凑数量自动降低阈值或任选标签。

一个传递相似组含98张当前可用图片，跨healthy/nitrogen_deficiency/rust三个标签。同组并不意味着同一病例，可能是pHash相似链；当前保留全部非直接冲突样本，但后续必须整组划分，先人工确认该组是否过度合并。不建议现在直接确定train/val/test比例。

当前manifest共14550行、usable=true共1825行；已检查可用SHA256不重复，所有可用行无冲突标记且来自允许的原始版本。8项解析与分组回归测试通过。所有新增文件均在wheat-vision内，raw不变；未开始训练、划分或复制训练图片。
