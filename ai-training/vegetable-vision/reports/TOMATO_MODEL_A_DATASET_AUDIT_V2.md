# 设施番茄 Model A 数据审计 V2

本阶段未训练、未调整模型或使用 Test 表现选择参数。固定 seed=42，类别分层、整组约70/15/15划分。

## 数据与原始保全
来源：TLID/PTLID，Mendeley DOI 10.17632/kt64b2kh89.2。本地 15254 张，发布页标称15260张的6张差额尚无逐文件清单可核验。PTLID未使用。原始raw与V1候选池全部SHA256再次一致，raw大小与修改时间也一致，无重编码。

## 清洗与视觉复核
完全重复以SHA256或解码RGB像素哈希连通分量计数，跨标签整个组排除；同标签组按规范化源路径字典序保留一张。未投票、未重标标签。额外看图确认的跨标签同源冲突隔离双方及其直接确认同类关联组，独立记录原因，不跨类别建立同叶身份组。
19张非标准尺寸及2张PNG内容/JPG扩展名逐张查看，共21张；主体为叶片、能解码，未因尺寸/扩展名自动剔除，仍服从重复/标签冲突规则。未转码。
固定ImageNet预训练YOLO11n-cls池化embedding（不是任何本项目训练模型），同类每图Top10，结合pHash/dHash、编号、边框HSV背景代理、SIFT-RANSAC及配准后相关性。方法/权重SHA见review目录。边框背景与灰色抠图背景不证明同场景。
先看全部Tier A与高风险Tier B候选，再对跨split最危险候选做多轮（第4～11轮）迭代复核，直至跨split高阈值候选清零。实际复核786对，超出约200～500对目标，但没有遍历审核74269对。复核以并排图、配准叠加图（R/G重合）与“同类别不同叶”配准相关性零分布对照执行，由AI助手读取，不冒充人类专家审定。所有原图和配对大图均保留，可再次核验。影像身份确认不代表疾病标签被专家认证。

## 防链式误聚类
只有实际复核确认的同类别关系进入split约束。组内逐对核查是否有直接复核记录；完整图才标确认同叶/同源身份，否则标uncertain、identity_verified=false，但保守放同一split避免已确认边被拆开。不会由A≈B和B≈C宣称A=C。一致性记录见group_consistency_v2.csv。

## 结果
```json
{
  "raw_images": 15254,
  "exact": {
    "duplicate_groups": 136,
    "duplicate_images": 273,
    "same_label_groups": 86,
    "same_label_exact_duplicate": 86,
    "cross_label_groups": 50,
    "cross_label_exact_duplicate_conflict": 101
  },
  "excluded_reasons": {
    "reviewed_cross_label_same_source_conflict": 1045,
    "cross_label_exact_duplicate_conflict": 101,
    "same_label_exact_duplicate": 86
  },
  "confirmed_group_counts": {
    "same_leaf": 110,
    "same_source_transform": 138,
    "uncertain": 1
  },
  "confirmed_group_images": {
    "same_leaf": 220,
    "same_source_transform": 276,
    "same_scene": 0
  },
  "identity_unverified_images": 13526,
  "candidate_pairs_automatically_scored": 209738,
  "candidate_pairs_visually_reviewed": 786,
  "reviewer": "assistant_visual_review_not_human_expert",
  "human_expert_reviews": 0,
  "remaining_high_threshold_cross_split_candidates": 0,
  "remaining_candidates_are_not_confirmed_independent": true,
  "clean_total": 14022,
  "class_split_statistics": [
    {
      "class_name": "bacterial_spot",
      "clean": 2348,
      "train": 1644,
      "val": 352,
      "test": 352
    },
    {
      "class_name": "bacterial_spot_and_leaf_miner",
      "clean": 2496,
      "train": 1747,
      "val": 375,
      "test": 374
    },
    {
      "class_name": "healthy",
      "clean": 2510,
      "train": 1757,
      "val": 377,
      "test": 376
    },
    {
      "class_name": "leaf_miner",
      "clean": 2170,
      "train": 1519,
      "val": 326,
      "test": 325
    },
    {
      "class_name": "powdery_mildew",
      "clean": 1854,
      "train": 1298,
      "val": 278,
      "test": 278
    },
    {
      "class_name": "powdery_mildew_and_leaf_miner",
      "clean": 2316,
      "train": 1621,
      "val": 348,
      "test": 347
    },
    {
      "class_name": "whitefly",
      "clean": 328,
      "train": 230,
      "val": 49,
      "test": 49
    }
  ],
  "split_totals": {
    "test": 2101,
    "train": 9816,
    "val": 2105
  },
  "cross_split": {
    "sha256": 0,
    "pixel_identical": 0,
    "group": 0,
    "same_leaf": 0,
    "same_source_transform": 0,
    "same_scene": 0
  },
  "training_ready_image_level": true,
  "training_ready_leaf_independent": false,
  "local_qingxian_validated": false,
  "raw_modification": 0,
  "candidate_v1_modification": 0,
  "ptlid_used": false,
  "seed": 42,
  "remaining_risk": "Unreviewed near duplicates and incomplete leaf/plant/scene identity; no strict leaf-independent claim"
}
```

clean pool: data/tomato_leaf_classifier_clean_v2/
正式数据: data/tomato_leaf_classifier_v1/{train,val,test}/{class}/
图片只按源字节复制，无过采样、无增强、无为了平衡删除whitefly。clean与正式目录是两个数据版本，不能合并一起训练。最终副本重新解码、SHA256和pixel hash均核验，并检查所有已确认group不跨split。

## 评估解释与剩余限制
training_ready_image_level 仅表示当前审核范围内已确认重复/同源约束无跨split泄漏；大量单张图片身份仍未核实，未声称所有近重复或隐藏同叶都已发现。跨split高阈值检查是风险排查，不是叶片独立性的证明。详见cross_scan与cross_split_review文件，未审核风险不得冒充不同叶片。
最终重新执行跨split全量embedding>=0.98且pHash距离<=10的扫描，remaining候选清零；逐对记录见tomato_model_a_remaining_cross_split_candidates_v2.csv（当前为空表）。此外独立执行了与split无关的全局扫描：跨标签近重复（cos>=0.98且pHash<=10）未复核=0，同类别近重复未复核=0且跨split=0。该结论只覆盖此阈值范围，不能声称所有隐藏近重复为0，镜像翻转、非刚性姿态或同植株场景关系仍可能未被发现。白粉/虫道等视觉类别和whitefly之间的跨标签同源是本数据的明显风险，不能将当前内部测试当作真实现场泛化。局部仿射检查覆盖轻微旋转/缩放/平移。
training_ready_leaf_independent=false。local_qingxian_validated=false。不是青县现场数据；后续结果只能称公开温室番茄图像内部评估，不能称青县准确率。视觉类别不等于农学确诊或施药建议。
完成数据准备后停止；未训练YOLO。
