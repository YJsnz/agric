# 泊头鸭梨叶片症状数据集 独立性核验

核验日期：2026-10-19
核验对象：`ai-training/pear-vision/data/prepared`（梨叶四分类，`curl` / `healthy` / `slug` / `spot`）
核验性质：**只读审计**。未修改任何图片、标签、划分、权重或脚本；未训练、未调参、未重新划分。
数据文件数：3006（8.6 GB）。所有结论均由本次实际扫描得到，无法确认处标注“无法确认”。

配套材料：

- 机器可读汇总：[PEAR_DATASET_AUDIT.json](PEAR_DATASET_AUDIT.json)
- 重复与近重复候选：[PEAR_DUPLICATE_CANDIDATES.csv](PEAR_DUPLICATE_CANDIDATES.csv)
- 审计脚本：[audit_pear_dataset_independence.py](audit_pear_dataset_independence.py)、[deep_near_dup_audit.py](deep_near_dup_audit.py)
- 评估核对：[PEAR_TEST_EVALUATION_VERIFICATION.md](PEAR_TEST_EVALUATION_VERIFICATION.md)
- 既有评估归档（未改动）：[../pear-leaf/](../pear-leaf/)

---

## 1. 数据集结构与类别统计

`data/prepared` 由 `ai-training/pear-vision/scripts/prepare_dataset.py` 生成，结构为
`classification/{train,val,test}/{curl,healthy,slug,spot}`，另含 `matched_yolo_labels/`（已有 YOLO 框，仅供核对）
和 `manifest.json`、`report.json`、`class_mapping.json`。

本次逐目录实测（与 `report.json` 的 `split_counts` 完全一致）：

| split | curl | healthy | slug | spot | 合计 |
|---|---:|---:|---:|---:|---:|
| train | 43 | 35 | 1620 | 707 | 2405 |
| val | 6 | 4 | 203 | 89 | 302 |
| test | 5 | 4 | 202 | 88 | **299** |
| 合计 | 54 | 43 | 2025 | 884 | 3006 |

- **Test 实际为 299 张，与历史评估报告记录的 299 张一致。**
- 类别严重不平衡：`slug`+`spot` 占 97.7%，`curl`(test 5) 与 `healthy`(test 4) 极少。

标签映射（`class_mapping.json`，按字母序）：`curl=0`、`healthy=1`、`slug=2`、`spot=3`；
与评估 `pear_model_metrics.json` 的 `classes` 顺序一致（见评估核对文档）。

## 2. 损坏、无法读取与标签异常

- 3006 张图片**全部可正常解码**，`corrupt_count = 0`。
- 全部 3006 张均有有效 YOLO 标注（`yolo_status=valid`，共 3019 个框，`--yolo-nc 1` 单一类别空间）。
- `report.json` 的唯一 issue 是 `macos_metadata_file`（2920 个 `._*` macOS 旁文件，已忽略），
  **没有** `corrupt_image`、`duplicate_image`、`conflicting_class_duplicate` 记录。
- 结论：在可读性与标签一致性层面没有发现异常。

## 3. 完全重复图片检查（SHA-256）

对全部 3006 张图片逐字节计算 **文件 SHA-256**（8.6 GB 全量读取），并另按 `prepare_dataset.py` 的
解码像素哈希（`sha256(str(rgb.size)+rgb.tobytes())`，`exif_transpose`+`RGB`）交叉验证。

| 检查范围 | 文件 SHA-256 | 解码像素哈希（= 文件名 stem） |
|---|---:|---:|
| 集合内重复 | 0 | 0 |
| train ↔ val | 0 | 0 |
| train ↔ test | **0** | 0 |
| val ↔ test | 0 | 0 |

- prepared 文件名即 `<像素哈希><扩展名>`；抽样复算 139 张（train 60、val 40、test 39）
  **文件名与真实像素哈希 100% 吻合**，故“文件名重复”可作为解码像素重复的判据。
- 结论：**在已检查范围内不存在任何跨集合完全重复图片，也不存在集合内完全重复。**

## 4. 近重复与图像派生样本检查（dHash）

对全部 3006 张计算 64 位 dHash（9×8 灰度相邻比较，JPEG `draft` 加速），仅比较**跨集合**样本对，
汉明距离越小越相似。距离分布高度集中在 18–40，说明绝大多数样本显著不同；仅在极小距离处出现候选：

| 汉明距离阈值 | 候选对数 | 同类别 | 跨类别 |
|---|---:|---:|---:|
| ≤ 2 | 2 | 2 | 0 |
| ≤ 4 | 3 | 3 | 0 |
| ≤ 6 | 4 | 4 | 0 |
| ≤ 8 | 6 | 6 | 0 |
| ≤ 10 | 8 | 8 | 0 |
| ≤ 12 | 16 | 14 | 2 |

**最强的跨集合候选（距离 ≤3，且原始文件名编号相邻）**：

| 距离 | 集合 | 原始文件 | 类别 | 分辨率 | 设备 |
|---:|---|---|---|---|---|
| 1 | train ↔ val | `slug/u767.jpg` ↔ `slug/u768.jpg` | slug | 3968×2976 | HUAWEI BLN-L21 |
| 1 | train ↔ test | `slug/u2936.jpg` ↔ `slug/u2935.jpg` | slug | 3968×2976 | HUAWEI BLN-L21 |
| 3 | train ↔ test | `slug/u2367.jpg` ↔ `slug/u2366.jpg` | slug | 2976×3968 | HUAWEI BLN-L21 |
| 5 | train ↔ test | `curl/u3061.jpg` ↔ `curl/u3063.jpg` | curl | 5184×3456 | Canon EOS 60D |
| 7 | train ↔ val | `spot/u412.jpg` ↔ `spot/u402.jpg` | spot | 2976×3968 | HUAWEI BLN-L21 |
| 8 | train ↔ test | `slug/u1001.jpg` ↔ `slug/u1002.jpg` | slug | 2976×3968 | HUAWEI BLN-L21 |

- 上述前三对距离极小（1、1、3）且**原始编号相邻**（767/768、2935/2936、2366/2367），
  高度疑似**同一叶片/同一场景的连续拍摄**，属跨 train/test、train/val 的近重复风险候选。
- 距离 5–12 的候选（含 2 对跨类别）同设备同尺寸，可能为连续拍摄，也可能是同类不同叶片或误报。
- **判定状态一律为“待人工复核”**：感知哈希只是候选，不能据此判定为泄漏，也不能据“未超过阈值”断言完全独立。
  完整 16 条候选见 [PEAR_DUPLICATE_CANDIDATES.csv](PEAR_DUPLICATE_CANDIDATES.csv)。

## 5. 划分脚本与来源追踪

- **划分规则**（`prepare_dataset.py`）：按类别分别 `random.Random(f'{seed}:{class}')` 洗牌后按 8:1:1 切分，
  `seed=42`。即**逐类别随机划分**，未按来源分组。
- **原始来源**：`Pear/leaves/{curl,healthy,slug,spot}`，对应公开数据集 **DiaMOS Plant** 的梨子集
  （标注 `Pear/annotation/csv/diaMOSPlant.csv` 共 3006 行；图片名形如 `u<编号>.jpg`）。
- **元数据事实**：3006 个 prepared 文件全部能回溯到唯一的原始文件（`distinct_origins = 3006`，
  无同一原图被复制到多个集合），且 3006 张全部带 EXIF。但原始命名仅含单一编号，
  **不存在植株 ID、果园 ID、拍摄批次或分组标识**。
- `report.json` 的 `source`/`labels` 记录的绝对路径属于另一个工作树
  （`AIC-SmartAgriculture/agric/ai-training/Pear/...`），与本仓库 `pear-vision/Pear/...` 布局不同，
  属**溯源路径不一致**，需注意。
- 该数据集 README 已明确写明：“完全相同的解码像素仅保留一份，避免跨集合重复；**近似图片及同株连续拍摄需另行分组**”
  —— 即官方流程本身**未**处理同株/连续拍摄分组。

## 6. 独立性结论、证据与边界

| 层级 | 结论 | 依据 |
|---|---|---|
| 完全重复（文件/像素） | **已排除跨集合完全重复** | 3006 张全量 SHA-256 与像素哈希，跨集合均为 0 |
| 近重复（感知哈希） | **发现疑似跨集合近重复候选，待人工复核** | ≤6 距离 4 对；其中 3 对距离 ≤3 且原图编号相邻 |
| 样本级独立 | **仅在“无完全重复”意义上成立**；近重复层面存在未排除风险 | 上述两类检查的合并结论 |
| 植株级 / 果园级 / 批次级独立 | **无法确认（证据不足）** | 无植株/果园/批次元数据；划分为逐类别随机，非分组划分 |

**严格口径结论**：

1. 可以确认：**不存在跨集合完全重复图片**，不存在集合内完全重复。
2. 不能确认：训练集与测试集在**样本级完全独立**——存在至少 4 对（阈值 ≤6）跨集合近重复候选，
   其中 3 对高度疑似同株连续拍摄，尚待人工复核。
3. 不能确认：**植株级、果园级、拍摄批次级独立**——数据缺少相应标识，且划分是逐类别随机划分
   （seed=42 仅保证可复现，不能保证跨集合来自不同植株）。
4. 因此，**不应仅凭“未发现重复文件”宣布训练集与测试集完全独立**；也不应据现有材料反推
   “测试集包含训练叶片”。正确表述是：完全重复层面独立，近重复与个体层面证据不足。

## 7. 可复现命令（只读）

```bash
python docs/vision-evaluation-archive/pear/audit_pear_dataset_independence.py \
  --prepared <path>/ai-training/pear-vision/data/prepared \
  --out-json <out>/full_audit.json --out-csv <out>/duplicate_candidates.csv \
  --phash-distance 6 --pixel-sample 15

python docs/vision-evaluation-archive/pear/deep_near_dup_audit.py
```

`deep_near_dup_audit.py` 默认读取相对路径 `ai-training/pear-vision/data/prepared`，需在仓库根目录或调整 `ROOT` 常量后运行。
两个脚本均只读，不写入数据集。
