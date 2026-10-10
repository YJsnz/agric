# Model C Dataset Report

## 1. 数据来源

[GWHD 2020官方CodaLab V4](https://zenodo.org/records/4298502)，DOI10.5281/zenodo.4298502。已下载本地包，未另行下载7GB数据；没有用2021或Kaggle版替换。官网说明测试标签需申请。

原始目录保留为 `F:\AIC2026\AIC-SmartAgriculture\agric\ai-training\wheat-vision\raw\global-wheat-codalab-official`；用户建议的global_wheat_head_2020命名不是硬性要求，未为改名移动/删除raw。

## 2. 原始图片数量

4698

## 3. 原始bbox数量

145411

## 4. 官方标注格式

COCO JSON per domain; absolute pixel bbox [x,y,width,height]; category_id1 -> YOLO0

JSON实际包含categories/images/annotations；图片path、file_name、width、height；annotation image_id/category_id/bbox/iscrowd。image_id在各域内解析，不误当跨域唯一。只使用真实bbox，不用segmentation编造新框。

## 5. 清洗规则

全量SHA256、解码像素SHA256、PIL完整解码检查。所有非有限/零面积/负面积/越界bbox记录并排除整图，不裁剪原标注。完全相同bbox的重复标注只在派生YOLO去重并记录。相同图像且框标注冲突整组排除；标注一致时保留一个代表。有COCO image记录但annotations为空才是有效零目标背景；没有COCO记录的图不能当负样本。

## 6. 最终usable图片

3422

无标注1276张保留在raw，未导出伪空txt；原已标注零框46张，去重后导出背景图46张，创建空txt。

## 7. train/val/test划分

没有可直接沿用的有标签官方三分列表。官方有标签训练池7个域；官方盲测4域无公开JSON。本次只在有标签池建立内部评估split，official_split_used=no；不声称内部test是官方盲测成绩。Ultralytics示例把ethz同时列于train/val并警告重叠，不能原样复制。seed42，整个domain作为不可拆分来源组，近似候选连接的domain共同归组；独立来源覆盖优先于精确70/15/15。穷举来源组划分，优化图片比例和bbox总数比例，不根据训练表现挑划分。该策略不可能让同一domain在三split都有覆盖；这是来源外推评估，不是随机图像划分。

{
  "arvalis_1": "train",
  "arvalis_2": "train",
  "arvalis_3": "val",
  "ethz_1": "train",
  "inrae_1": "train",
  "rres_1": "test",
  "usask_1": "train"
}

## 8. 各split bbox数量

{
  "train": {
    "images": 2382,
    "boxes": 109323,
    "domains": [
      "arvalis_1",
      "arvalis_2",
      "ethz_1",
      "inrae_1",
      "usask_1"
    ]
  },
  "val": {
    "images": 608,
    "boxes": 16878,
    "domains": [
      "arvalis_3"
    ]
  },
  "test": {
    "images": 432,
    "boxes": 19210,
    "domains": [
      "rres_1"
    ]
  }
}

## 9. Duplicate检查

exact文件哈希冗余0张；解码像素冗余0张。64位pHash距离≤4候选0对，其中像素RMSE≤0.025或灰度相关≥0.985佐证0对。pHash不证明同源，候选仅用于保守共同分组，不凭近似删除图像。没有穷尽所有裁剪/视角变化同源关系。

## 10. Corrupt检查

0

## 11. Bbox合法性检查

{
  "invalid_bbox": 0,
  "bbox_out_of_bounds": 0,
  "zero_area_bbox": 0,
  "duplicate_annotations": 0,
  "missing_annotations": 1276,
  "missing_annotation_images": 0
}

bbox_count_distribution与annotation_issues另存CSV；未知框数在manifest保持空，不伪装为0。normalized YOLO为0 xc yc w h，精度10小数；class0=wheat_head。路径yaml采用实际绝对目录，避免受YOLO工作目录设置影响。

## 12. 跨split重复

exact=0，像素/近似候选跨split=0。导出图片SHA及txt对应已核验，raw图像/JSON哈希和文件清单/时间戳未变。

## 13. 正式训练条件

具备内部有标签Model C训练/验证/测试的格式与完整性条件；没有开始训练。不具备官方盲测本地带标签评估条件，官方test标签仍需依来源申请。count可由框数计算；绝对田间density需要实际面积/尺度信息，不能仅按图像框数推断平方米密度。没有训练、增强、伪标签或人为补框。

## 完整统计

```json
{
  "raw_images": 4698,
  "usable_images": 3422,
  "raw_annotation_boxes": 145411,
  "total_boxes": 145411,
  "annotated_images": 3422,
  "images_without_boxes": 46,
  "usable_images_without_boxes": 46,
  "missing_annotations": 1276,
  "missing_annotation_images": 0,
  "corrupt_images": 0,
  "invalid_bbox": 0,
  "bbox_out_of_bounds": 0,
  "zero_area_bbox": 0,
  "duplicate_annotations": 0,
  "exact_duplicate_groups": 0,
  "exact_duplicate": 0,
  "pixel_duplicate_groups": 0,
  "pixel_duplicate_redundant": 0,
  "phash_candidate_pairs": 0,
  "confirmed_similar_pairs": 0,
  "cross_split_duplicate": 0,
  "cross_split_similar_candidate": 0,
  "official_split_used": false,
  "seed": 42,
  "raw_unchanged": true,
  "annotation_format": "COCO JSON per domain; absolute pixel bbox [x,y,width,height]; category_id1 -> YOLO0",
  "raw_path": "F:\\AIC2026\\AIC-SmartAgriculture\\agric\\ai-training\\wheat-vision\\raw\\global-wheat-codalab-official",
  "source_url": "https://zenodo.org/records/4298502",
  "source_version": "GWHD 2020 CodaLab official V4",
  "source_components": {
    "arvalis_1": "train",
    "arvalis_2": "train",
    "arvalis_3": "val",
    "ethz_1": "train",
    "inrae_1": "train",
    "rres_1": "test",
    "usask_1": "train"
  },
  "ready_for_internal_training": true,
  "ready_for_official_test_benchmark": false,
  "train_images": 2382,
  "train_boxes": 109323,
  "train_domains": [
    "arvalis_1",
    "arvalis_2",
    "ethz_1",
    "inrae_1",
    "usask_1"
  ],
  "val_images": 608,
  "val_boxes": 16878,
  "val_domains": [
    "arvalis_3"
  ],
  "test_images": 432,
  "test_boxes": 19210,
  "test_domains": [
    "rres_1"
  ]
}
```
