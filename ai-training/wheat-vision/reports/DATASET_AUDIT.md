# 模型A数据集审计

本阶段仅审计，未训练、划分、平衡、增强或修改raw。压缩包内部使用 archive::member 定位；RAR临时展开用于解码，随后清理审计缓存。

## 口径

SHA256唯一仅表示文件字节不同，不代表独立原图。unique_count为可解码的SHA256唯一数（含待审核冲突）；conflict_free_exact_unique_count进一步排除所有冲突涉及路径。增强图仍可能计入唯一数，不能直接作为训练样本量。
近似重复为64位pHash距离不大于6的候选对，不自动删除；不保证检出所有裁剪、旋转或增强，也可能误报。近似冲突默认隔离待人工复核，不自动选标签。
标签仅忽略大小写、空格、连字符和下划线；control/deficiency/diseased没有明确文件夹语义对应表，保留unmapped。labels.txt仅列类名，不证明目录到类别的对应关系。

## 实际统计

```json
{
  "images": 14550,
  "datasets": {
    "nitrogen_rust": 1459,
    "wheat_disease_original": 11603,
    "wheat_leaf": 407,
    "winter_wheat_nitrogen": 1081
  },
  "classes": [
    {
      "mapped_label": "healthy",
      "total_count": 2352,
      "unique_count": 1351,
      "source_dataset_count": 2,
      "conflict_free_exact_unique_count": 1336,
      "non_augmented_candidate_unique_count": 351
    },
    {
      "mapped_label": "rust",
      "total_count": 208,
      "unique_count": 208,
      "source_dataset_count": 1,
      "conflict_free_exact_unique_count": 208,
      "non_augmented_candidate_unique_count": 208
    },
    {
      "mapped_label": "leaf_spot_blight",
      "total_count": 2497,
      "unique_count": 1433,
      "source_dataset_count": 2,
      "conflict_free_exact_unique_count": 1433,
      "non_augmented_candidate_unique_count": 461
    },
    {
      "mapped_label": "nitrogen_deficiency",
      "total_count": 0,
      "unique_count": 0,
      "source_dataset_count": 0,
      "conflict_free_exact_unique_count": 0,
      "non_augmented_candidate_unique_count": 0
    }
  ],
  "exact_duplicate_excess": 5366,
  "exact_groups": 4978,
  "corrupt": 0,
  "conflict_image_count": 84,
  "counts": {
    "exact_pairs": 5996,
    "exact_cross_split_pairs": 92,
    "near_pairs": 43826,
    "near_cross_split_pairs": 7077,
    "near_conflict_pairs": 136
  },
  "archives": [
    {
      "path": "nitrogen_rust/Ndeficient.zip",
      "images": 600,
      "status": "scanned"
    },
    {
      "path": "nitrogen_rust/WheatLeafRust.zip",
      "images": 859,
      "status": "scanned"
    },
    {
      "path": "wheat_disease_original/Disease Dataset of Wheat Original, Augmented, and Balanced for Deep Learning/Wheat Disease.zip",
      "images": 11603,
      "status": "scanned"
    },
    {
      "path": "wheat_leaf/wheat_leaf.rar",
      "images": 407,
      "status": "scanned"
    }
  ],
  "phash_threshold": 6,
  "cross_dataset_sources": []
}
```

## 标签清单

- nitrogen_rust / control → unmapped：791
- nitrogen_rust / deficiency → unmapped：300
- nitrogen_rust / diseased → unmapped：368
- wheat_disease_original / BlackPoint → exclude：2303
- wheat_disease_original / FusariumFootRot → exclude：2250
- wheat_disease_original / HealthyLeaf → healthy：2250
- wheat_disease_original / LeafBlight → leaf_spot_blight：2400
- wheat_disease_original / WheatBlast → exclude：2400
- wheat_leaf / Healthy → healthy：102
- wheat_leaf / septoria → leaf_spot_blight：97
- wheat_leaf / stripe_rust → rust：208
- winter_wheat_nitrogen / Wheat Dataset → unmapped：1081

## 数据泄漏与下一步

- Wheat Disease包README明确：先增强到每类1000张，再切分Train/Validation/Test。因此现有切分存在同源增强泄漏风险，不可当作独立评估。Original/Augmented/Split副本不能混成新样本。
- exact/near跨split、跨数据集对见duplicate_report.csv；组内样本未来必须整体划分。跨数据集近似对只能作为污染警示，需人工核验。
- winter_wheat_nitrogen为平铺IMG时间戳文件，缺少逐图标签及plot/处理元数据；时间戳可能来自连续拍摄，不能据目录名全部标成缺氮，也不能证明同一实验plot独立。
- 当前没有数据集可直接确认为External Test。应先核对采集地、地块、实验处理、拍摄序列和跨库重复；独立来源的未增强原图且覆盖目标类别才可候选。winter_wheat_nitrogen须补齐标签与地块资料后再评估，不直接推荐为现成外测集。
- 四类是否足够须按独立原图及隔离冲突后判断，不能用增强副本填充数量。nitrogen_deficiency若为0，必须先核验Ndeficient目录标签映射及冬小麦逐图实验记录。
- 暂不建议正式划分train/val/test；先审核未知标签、冲突与近似组，恢复增强来源分组，再按原图/序列/plot/source分组划分。
- 视觉缺氮类只表示缺氮类黄化视觉表现，不是缺氮确诊。
- 不存在的源目录自动跳过；未做数据授权/许可及来源真实性核验。

## 决策提示

- healthy：健康叶片；rust：锈病类视觉症状；leaf_spot_blight：叶斑/叶枯类视觉症状；nitrogen_deficiency：缺氮类黄化视觉表现。
- non_augmented_candidate_unique_count仅排除路径中明确的增强版/划分副本及待复核冲突，再按SHA256计数。它不保证剩余图片没有作者未标明的增强，也未去除所有近似重复，不能称为已确认的独立生物样本。
- 氮相关数据并非没有图片：Ndeficient.zip里有300张deficiency、300张control。labels.txt提供control和Nitrogen_deficient名称，但没有明确目录对应表；WheatLeafRust.zip则用control/diseased目录，而labels.txt写healthy/leaf_rust。下一步应向来源核验这两个包的映射，确认后增加“限定数据集/压缩包的映射”，不要把control/diseased设成全局同义词。
- 136对冲突是pHash近似冲突，并非已证实错标；涉及HealthyLeaf及范围外类别，相关路径一律标记待复核。完全重复的已知标签冲突为0。未知标签之间的语义冲突无法自动判定，因此“0”不代表全库没有错标。
- 本轮阈值内没有检测到跨数据集重复；不等于证明数据集之间独立，pHash可能漏掉裁剪、旋转等变化。
- 若必须优先挑外部评估候选，可先审查wheat_leaf的407张未明确标注增强的图片，但目前rust仅来自该库，把它整体留出会导致训练集缺少rust。因此当前不能批准它作为完整四类External Test；应先核验nitrogen_rust标签与来源，再决定是否整库留出wheat_leaf，缺氮仍需独立外部来源。

## 复现命令

在项目根目录运行：
```powershell
.\agric\ai-service\.venv\Scripts\python.exe .\agric\ai-training\wheat-vision\scripts\audit_raw_datasets.py
.\agric\ai-service\.venv\Scripts\python.exe .\agric\ai-training\wheat-vision\scripts\test_audit_raw_datasets.py
```
使用既有Python环境，未安装依赖，未训练。完整扫描包括ZIP/RAR内部图片，raw原始1085个文件保留（4个压缩包及1081张JPEG）。
