# Jujube Model A 最终数据定版 v3

所有原图重新读取并验证 SHA256、EXIF 校正 RGB 解码像素签名；v3 副本逐一验证 SHA256。未训练、未改 raw、未覆盖 v1、未重新随机划分。
## 定版统计
```json
{
  "raw_total": 3220,
  "clean_v1": 3201,
  "pixel_identical_conflict_images_excluded": 4,
  "exact_duplicate_images_excluded": 5,
  "exact_duplicate_new_exclusions": 1,
  "exact_duplicate_conflict_images_excluded": 8,
  "confirmed_near_duplicate_groups": 6,
  "clean_v3_total": 3196,
  "classes": {
    "anthracnose": 715,
    "healthy": 1161,
    "insect_damage": 393,
    "powdery_mildew": 217,
    "yellow_leaf": 710
  },
  "splits": {
    "test": 452,
    "train": 2288,
    "val": 456
  },
  "all_splits_five_classes": true,
  "all_splits_two_sources": true,
  "residual_uncertain_pairs": 14614,
  "checks": {
    "cross_split_sha256": 0,
    "cross_split_pixel_identical": 0,
    "cross_split_confirmed_near_duplicate": 0,
    "pixel_identical_conflict_entered": 0,
    "exact_duplicate_conflict_entered": 0,
    "corrupt_entered": 0,
    "unknown_class_entered": 0,
    "target_filename_duplicate": 0,
    "raw_modification": 0
  },
  "training_ready": true
}
```
## 排除与同源处理
4 张新增冲突图片属于两组解码像素相同但文件 SHA 不同的跨标签图像。组内全部排除，没有选择某个标签。详细原路径、原类别、签名和 conflict_group_id 见 model_a_pixel_conflicts_excluded_v3.csv。
同标签完全重复（包括像素相同）只留原 clean 内 image_id 排序最前的代表。exact_duplicate_images_excluded 是相对全部 raw 的冗余数量，新增剔除量见 exact_duplicate_new_exclusions。不同标签的完全重复全部排除。
6 对确认跨源近重复保留全部可用成员，以 near_duplicate_group_id 绑定；核对均在同一 split。未根据一般 pHash 候选建立真实同源组。
v3 manifest 包含所有 raw 行（含 usable=false），训练目录严格只复制 usable=true 的行。split 保留旧分配，不补齐被剔除数量。
## 审计局限
v2 共 14749 候选对，10 对完全重复（含 5 对标签冲突）、6 对近重复、119 对背景误报，仍有 14614 对 uncertain。
存在未完全人工审核的 near-duplicate 候选风险（residual near-duplicate uncertainty）。相似绿叶、背景、构图可造成 pHash/SSIM/CNN 高分；1434 张候选大组不是一个真实同源组。uncertain 不等于重复，不单独作为排除或训练阻塞条件。
零跨 split 检查限于 SHA、解码像素及已确认近重复，不能证明未知近重复完全不存在。该数据为内部划分，两个来源共享机构/贡献者；来源覆盖不等于独立域泛化验证。
## 准入
全部指定硬性检查通过，training_ready=true。此结论为当前公开叶片数据准备准入，不代表模型已训练，也不证明对沧州金丝小枣本地场景的诊断性能。正式输入使用 data/jujube_leaf_classifier_v3，旧目录不再作为本次正式输入。
