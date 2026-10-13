# Jujube Model B1 同果实分组复核 V2

## 结论与统计

```json
{
  "raw_total": 1464,
  "healthy": 732,
  "bruised": 732,
  "candidate_pairs": 6702,
  "review_pairs": 95,
  "review_decisions": {
    "confirmed_same_fruit": 42,
    "uncertain": 53
  },
  "confirmed_fruit_groups": 28,
  "confirmed_grouped_images": 63,
  "singleton_unverified_images": 1401,
  "confirmed_healthy_fruit_groups": 8,
  "confirmed_bruised_fruit_groups": 20,
  "split_counts": {
    "train": 1022,
    "test": 223,
    "val": 219
  },
  "split_reassigned_images": 9,
  "seed": 42,
  "cross_split_fruit_group_id": 0,
  "cross_split_sha256": 0,
  "cross_split_pixel_hash": 0,
  "raw_unchanged": true,
  "model_a_unchanged": true,
  "training_ready_image_level": true,
  "training_ready_fruit_independent": false,
  "fruit_independent_test_proven": false,
  "dataset": "F:\\AIC2026\\AIC-SmartAgriculture\\agric\\ai-training\\jujube-vision\\data\\jujube_fruit_bruise_classifier_v2_level_a"
}
```

当前划分仅保证已确认同果实组不跨split，但由于公开数据未提供完整fruit identity映射，不能证明全部Train/Val/Test在果实个体层面独立。

本次确认指助手逐对视觉复核支持的分组，并非作者提供的fruit_id，也不是人工专家签字认证。
可以开展 Level A: confirmed-group-safe image split 的后续图像级实验；不能称为 fruit-independent test。
本阶段没有训练。未修改raw、既有v1数据集、Model A模型或其数据。

## 方法与限制

- 同类别Top-5邻居、相邻编号、现有组边界与组内配对，共6702候选；实际视觉复核95对。未复核候选不自动确认。
- 复用固定ImageNet预训练YOLO11n-cls的1280维embedding，不训练新模型；权重SHA及预处理见review目录method.json和v1方法文件。
- pHash、果实区域ORB双向ratio匹配、仿射RANSAC、轮廓面积/长宽比辅助核验。背景抑制是颜色启发式，不能保证完整分割果实。
- 全部1464张原图没有可用EXIF时间。编号相邻仅用于提名，许多明确同果图编号跨度很大，未推断拍摄顺序。
- 伤痕拓扑、细纹和散点相对布局是确认依据；健康果尤其不能只看颜色和轮廓。姿态不同不直接判为different_fruit。
- 每个组所有两两配对均已确认；额外补查4对以闭合三图组。A≈B、B≈C但缺A≈C时程序拒绝成组。
- 复核表提供confirmed_same_fruit/different_fruit/uncertain。本轮没有足够把握的different_fruit判定，未强填。
- 论文610果（healthy327、bruised283）只作sanity check，既未硬凑组数，也未把singleton数解释为真实果实数。
- 仅63/1464张进入确认组，身份覆盖仍低；未确认多视角跨split风险仍存在，测试指标可能偏乐观。

## 划分与校验

保留seed42的原有约70/15/15划分，只把新确认组内跨split成员移至该组原split多数；平票用seed42选择。
只改变9张的split，未做全量重新随机划分。所有singleton保持原split；fruit_group_id留空，另设singleton split_group_id并标记fruit_identity_unverified=true。
新复制数据：`data/jujube_fruit_bruise_classifier_v2_level_a/`。全部复制件通过SHA256、RGB像素哈希和解码检查。
确认组、SHA256、pixel-identical跨split均为0；这不是对未恢复fruit identity的无泄漏保证。
raw全部文件名称、大小、mtime与SHA256对照原审计快照不变；Model A保护清单不变。
程序自检包括跨类别拒绝、链式误合拒绝、全配对组三项。

## 可追溯文件

- model_b1_manifest_v2.csv：全量图像、分组、split和身份未知标记。
- model_b1_fruit_groups_v2.csv：成员、类别、定性置信描述。
- model_b1_group_consistency_v2.csv：每个组全部配对的复核编号及证据。
- model_b1_split_adjustments_v2.csv：仅必要的split变化。
- model_b1_split_statistics_v2.csv：每split每类统计。
- model_b1_same_fruit_review_v2/review.csv、V001–V095.jpg及8张联系图。

数据与论文来源（沿用前轮核验）：https://data.mendeley.com/datasets/3mtdhrwgfr/5 ，https://pmc.ncbi.nlm.nih.gov/articles/PMC12545820/ 。
数据来自孟加拉Ziziphus mauritiana，不能据此宣称为沧州金丝小枣本地独立验证。
