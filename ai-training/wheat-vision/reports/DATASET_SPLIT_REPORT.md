# 黄骅旱碱麦 视觉模型A 数据集划分报告（第11步）

本阶段仅做人工复核落库、修正错误近似分组、构建 clean manifest 与 group-aware 划分；未训练、未增强、未过采样、未修改 raw。

## 1. clean pool 总数

- clean pool = **1820**（usable=True 且非 needs_expert_review）

- clean manifest 行数 = 3469（含被排除项，供审计）

## 2. clean 四类数量

| 类别 | clean 数量 | 组数 | 来源数据集数 |
| --- | ---: | ---: | ---: |
| healthy | 791 | 765 | 3 |
| rust | 472 | 466 | 2 |
| leaf_spot_blight | 461 | 308 | 2 |
| nitrogen_deficiency | 96 | 95 | 1 |

## 3-5. 各 split 四类数量

**train**（共 1274）

| 类别 | 数量 |
| --- | ---: |
| healthy | 554 |
| rust | 330 |
| leaf_spot_blight | 323 |
| nitrogen_deficiency | 67 |

**val**（共 274）

| 类别 | 数量 |
| --- | ---: |
| healthy | 119 |
| rust | 71 |
| leaf_spot_blight | 69 |
| nitrogen_deficiency | 15 |

**test**（共 272）

| 类别 | 数量 |
| --- | ---: |
| healthy | 118 |
| rust | 71 |
| leaf_spot_blight | 69 |
| nitrogen_deficiency | 14 |

## 6. train/val/test 总量与比例

| split | 总量 | 占比 | 目标 |
| --- | ---: | ---: | ---: |
| train | 1274 | 70.0% | 70% |
| val | 274 | 15.1% | 15% |
| test | 272 | 14.9% | 15% |

## 7-12. 数据泄漏与污染检查

| 检查项 | 期望 | 实测 | 结果 |
| --- | ---: | ---: | --- |
| exact duplicate（SHA256）跨 split | 0 | 0 | PASS |
| 真实 group 跨 split | 0 | 0 | PASS |
| confirmed label conflict 进入 clean pool | 0 | 0 | PASS |
| needs_expert_review 进入 clean pool | 0 | 0 | PASS |
| augmented_copy 进入 clean pool | 0 | 0 | PASS |
| split_copy 进入 clean pool | 0 | 0 | PASS |
| corrupt 进入 clean pool | 0 | 0 | PASS |
| 同一 target 文件名重复 | 0 | 0 | PASS |
| raw 被修改或删除 | 0 | 0 | PASS |

## 13. 98 张误聚 group 处理

- 原 group `WG_f1b3d33d81b28e8b` 为 pHash 跨类误聚（healthy 84 / nitrogen_deficiency 6 / rust 8），人工复核确认无同一原图、无同一叶片、无增强裁剪副本。
- 处理：keep 的 93 张解除原 group，各自赋独立 `manual_unique_<image_id>`；needs_expert_review 的 5 张（M056、M085、M086、M088、M089）标记 usable=False 并禁止进入数据集。
- 解除后剩余 mixed-label group = 0。

## 14. 每个 split 的类别覆盖

- train/val/test 是否均覆盖 4 类：**是**
- nitrogen_deficiency：train=67, val=15, test=14

## 15. 是否满足正式训练 YOLO11n-cls 条件

- 划分满足类别覆盖与泄漏检查，可用于 YOLO11n-cls 分类训练：**是**
- 说明：num_classes=4；已知泄漏检查为 0 不证明来源/地块完全独立；nitrogen_deficiency 样本偏少，训练时需关注，但本阶段不做任何平衡或增强。
