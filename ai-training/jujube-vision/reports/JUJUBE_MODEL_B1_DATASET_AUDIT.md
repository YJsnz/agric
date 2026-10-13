# Jujube Model B1 数据集审计

当前路径已经更换为正确的 healthy/bruised 原图。旧的 Model A 副本来源阻塞已解除。本阶段未训练。
## 来源与采样单位
[Mendeley v5](https://data.mendeley.com/datasets/3mtdhrwgfr/5)，DOI 10.17632/3mtdhrwgfr.5。
[原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12545820/) Table 4 确认 healthy 327颗、bruised 283颗，分别732张照片。物种为 Ziziphus mauritiana，来源孟加拉国 Savar；存在同果多视角。论文并未提供本地文件到610颗果实的身份映射。
## 审计与候选复核
原图目录匹配论文 healthy/healthy_N.jpg 与 bruised/bruise_N.jpg；三个(1)后缀和一个尾部空格记录为本地命名差异，不单凭名称删除。未发现 augmented/preprocessed/rotation/flip/brightness/contrast/zoom 文件或目录。仅根据分发结构确认原图身份，不声称能从像素证明完整编辑历史。
逐图严格解码、verify、检查EOI、捕获PIL warning、记录尺寸/模式/EXIF与SHA、EXIF校正RGB像素哈希。不改写raw。所有图为512×512 RGB，EXIF为空，缺少时间、设备和果实编号证据。
全图pHash≤8、ImageNet预训练CNN top6及同类文件编号相邻≤2仅用于召回；阈值不是身份确认条件。CNN为YOLO11n-cls 1000类预训练池化特征，不使用Model A病害权重、不训练。详见model_b1_same_fruit_review/method.json。
93对联系图均进行了AI辅助目视查看，14对在大图中确认纹理/伤痕对应；其余保持uncertain。不冒称人工专家签字，不根据相似分数凑610组。B089是同果转动视角，其余确认对为强近重复视角。
确认组编号由成员稳定哈希生成；无法确认的 fruit_group_id 在CSV留空，语义为null，fruit_group_uncertain=true。未给单张未知身份强造fruit编号。
## 统计与泄漏检查
```json
{
  "raw_total": 1464,
  "usable_total": 1464,
  "classes": {
    "bruised": 732,
    "healthy": 732
  },
  "confirmed_fruit_groups": 10,
  "fruit_group_uncertain_images": 1442,
  "split_totals": {
    "train": 1024,
    "val": 220,
    "test": 220
  },
  "split_classes": {
    "train": {
      "bruised": 512,
      "healthy": 512
    },
    "val": {
      "bruised": 110,
      "healthy": 110
    },
    "test": {
      "bruised": 110,
      "healthy": 110
    }
  },
  "seed": 42,
  "cross_split_sha256": 0,
  "cross_split_pixel_identical": 0,
  "cross_split_confirmed_near_duplicate": 0,
  "cross_split_confirmed_fruit_group": 0,
  "corrupt": 0,
  "label_conflict_images": 0,
  "same_label_exact_duplicate_images": 0,
  "jpeg_issues": 0,
  "non_rgb": 0,
  "dimensions": {
    "512x512": 1464
  },
  "exif_available": 0,
  "candidate_pairs": 14352,
  "reviewed_pairs": 93,
  "confirmed_same_fruit_pairs": 14,
  "cross_split_unconfirmed_candidate_pairs": 6652,
  "raw_modification": 0,
  "model_a_unchanged": true,
  "split_files_ready": true,
  "training_ready": false,
  "training_readiness_reason": "Only partial fruit identities verified; dataset paper explicitly contains multiple views per fruit, so current provisional split cannot certify unseen-fruit evaluation"
}
```
## 划分解释与训练准入
按seed=42、类别分层、已确认fruit组绑定生成70/15/15左右的副本。未知身份样本作为临时分配单元，不等于已证实独立果实；跨split未确认候选数量不是已确认泄漏数量，但提示剩余风险。
**training_ready=false**：结构和已知重复检查通过，但大量果实身份尚未确认。当前目录是可追溯的暂定划分，不能宣称严格果实独立的正式评估集。需要进一步身份映射/复核才能解除；没有因为达到预期数量强行宣布通过。
原图仍全部保留，复制目标逐文件SHA一致，原图前后SHA/大小/mtime一致；Model A模型、数据、报告、run元数据核对无变化。
## 语义边界
建议称“枣属果实碰伤视觉感知模型”或“金丝小枣采后碰伤迁移视觉辅助模型”。存在物种、产地和拍摄环境迁移，不得称为“沧州金丝小枣碰伤确诊模型”。
## 产物
- model_b1_manifest_v1.csv：原图元数据、标签、身份不确定性与暂定split。
- model_b1_same_fruit_candidates.csv：14352对候选及审计决定。
- model_b1_same_fruit_review/：93张双图、8张联系表、review.csv。
- model_b1_fruit_groups.csv：已确认组的成员和依据。
- model_b1_split_statistics.csv / model_b1_audit_summary.json：统计与检查结果。
