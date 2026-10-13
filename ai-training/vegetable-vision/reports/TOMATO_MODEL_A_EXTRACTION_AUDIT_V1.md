# Vegetable Model A 第一阶段原始数据审计

## 来源与实际结构
Tomato Leaf Image Dataset (TLID/PTLID), Mendeley Version 2，DOI 10.17632/kt64b2kh89.2。
来源：https://data.mendeley.com/datasets/kt64b2kh89/2 （2026-10-10 核验）。发布页区分 256×256 TLID 和由它切出的 32×32 PTLID；本地真实类别结构及绝大多数尺寸符合 TLID，但存在非标准尺寸及格式差异，详见统计与 integrity_review.csv。
TLID path: `F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\vegetable-vision\raw\tomato_model_a_tlid`。该下载目录直接包含七个类别，每类有同名子目录，并无额外 TLID 包装目录。
PTLID path: 未在指定 raw 扫描范围内发现；PTLID excluded = true。未发现 train/val/test、patch 或增强子目录；仅凭目录与图像不能证明源数据从未经过任何生成加工。
发布页标称 15260 张；本地为 15254 张，少 6 张。没有官方逐文件清单，不能定位具体缺失文件或宣称下载完整。未下载补图或伪造样本。

## 统计
```json
{
  "raw_total": 15254,
  "classes": 7,
  "class_counts": {
    "healthy": 2688,
    "leaf_miner": 2255,
    "bacterial_spot": 2395,
    "powdery_mildew": 2181,
    "powdery_mildew_and_leaf_miner": 2361,
    "bacterial_spot_and_leaf_miner": 2502,
    "whitefly": 872
  },
  "candidate_total": 15254,
  "candidate_counts": {
    "healthy": 2688,
    "leaf_miner": 2255,
    "bacterial_spot": 2395,
    "powdery_mildew": 2181,
    "powdery_mildew_and_leaf_miner": 2361,
    "bacterial_spot_and_leaf_miner": 2502,
    "whitefly": 872
  },
  "integrity": {
    "corrupt": 0,
    "truncated_jpeg": 0,
    "zero_byte": 0,
    "invalid_extension": 0,
    "decode_failed": 0,
    "jpeg_eoi_missing": 0,
    "dimension_invalid": 0,
    "extension_format_mismatch": 2,
    "nonstandard_size": 19,
    "patch_size_suspected": 0
  },
  "duplicates": {
    "exact": {
      "pairs": 138,
      "same_label_pairs": 87,
      "cross_label_pairs": 51,
      "groups": 136
    },
    "pixel_identical": {
      "pairs": 138,
      "same_label_pairs": 87,
      "cross_label_pairs": 51,
      "groups": 136
    }
  },
  "cross_label_conflict_pairs": 51,
  "conflict_images": 101,
  "near_duplicate_candidates": 74269,
  "near_cross_label_candidates": 57745,
  "size_counts": {
    "256x256": 15235,
    "214x256": 1,
    "239x256": 2,
    "190x256": 1,
    "226x256": 1,
    "259x259": 2,
    "187x202": 1,
    "313x296": 1,
    "221x256": 1,
    "209x256": 1,
    "215x256": 1,
    "198x256": 1,
    "200x256": 1,
    "216x256": 1,
    "266x256": 1,
    "245x256": 1,
    "876x1133": 1,
    "456x534": 1
  },
  "ptlid_found": false,
  "ptlid_excluded": true,
  "raw_modification": 0,
  "raw_before_after_sha256_verified": true,
  "filename_collision": 0,
  "official_total": 15260,
  "local_count_difference": -6,
  "split_created": false,
  "training_started": false
}
```
详细类名、每类尺寸与格式见 tomato_model_a_class_inventory.csv；完整目录见 tomato_model_a_directory_tree.txt。

## 检查方法与解释
逐文件读取原始字节，SHA256，Pillow verify 后重新打开严格 load（不启用截断容忍），记录通道、尺寸、格式、异常及 JPEG EOI 标记。异常只记录，不修复或重编码。JPEG EOI 缺失与实际解码失败独立统计；此基础检查不替代所有编解码器的损坏检测。
像素完全重复使用未缩放、未旋转的解码 RGB 尺寸及字节 SHA256。两个重复指标分别计无序图像对，不能相加当独立重复数；跨标签冲突按两个指标的并集统计，原数据不删除。
近重复候选使用全量两两比较，64-bit pHash 汉明距离 <=6 或 64-bit dHash <=4。候选包含完全重复；跨类只标记风险，不能仅凭哈希判定标签冲突或同叶身份。背景相似可能产生误报，拍摄视角变化可能漏报。没有自动 same-leaf 分组。
文件名数字与前缀见 filename_patterns.csv，编号相邻候选见 sequence_candidates.csv（完整文件名均以 tomato_model_a_ 开头）。编号可能只是批量导出序号，不能证明同一叶片或植株；不据此建立来源组。

## 候选训练池
`F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\vegetable-vision\data\tomato_leaf_classifier_candidates_v1`。仅复制可正常解码、非32×32疑似patch的 TLID 文件；非标准尺寸、格式与扩展名不符、跨标签重复均原样保留并标记 needs_review，不把候选池冒充清洗完成数据。全部副本逐字节 SHA256 验证。文件名包含标准类别、内容哈希、相对路径哈希和原名，collision = 0。
候选集不是最终训练数据。近重复需后续审核；跨标签完全重复在 manifest 中 label_conflict=true，不得直接用于正式训练。数据量与发布页差异也需在下一阶段处理。

## 科学边界和停止条件
本数据为温室番茄资料，不是青县本地采集或本地验证。未来输出仅代表叶片病害/虫害视觉表现，不能直接解释为疾病确诊、虫害最终诊断或施药建议。
raw modification = 0：运行前后所有原文件路径、大小、mtime_ns、SHA256 一致。未重命名、移动、删除、缩放或重新编码 raw。未修改标签、未生成增强、未做 Train/Val/Test 划分、未训练。第一阶段完成后停止。
