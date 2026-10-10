# Model C Evaluation

Global Wheat Head Dataset 2020：raw4698、usable3422、总框145411；train2382 / val608 / test432。

source-domain-separated internal split，官方无标签test1276张未参与。指定模型v12，未替换v13。

最佳epoch：训练CSV为53；用户提供54。给定Val四项指标与CSV第53个epoch一致，不能将epoch54写成已验证事实。

## Formal metrics

```json
{
  "model_path": "F:\\AIC2026\\AIC-SmartAgriculture\\agric\\ai-training\\wheat-vision\\runs\\wheat_head_yolo11n_v12\\weights\\best.pt",
  "model_sha256": "be670bf83a377689fa6f82bde0cb545be2101d6868142a00e5560c2c2f4bdbea",
  "best_epoch": 53,
  "best_epoch_user_reported": 54,
  "best_epoch_note": "CSV epoch is authoritative; user supplied 54 is retained separately.",
  "val_metrics_from_training_csv": {
    "precision": 0.90433,
    "recall": 0.84388,
    "map50": 0.92081,
    "map50_95": 0.49065
  },
  "test_images": 432,
  "test_instances": 19210,
  "precision": 0.9372729238133554,
  "recall": 0.8711675385076266,
  "map50": 0.9420716607866151,
  "map50_95": 0.5874689360017177,
  "count_mae": 3.0787037037037037,
  "count_rmse": 4.079079416840139,
  "count_bias": -1.7083333333333333,
  "count_pearson_r": 0.9510910974589155,
  "count_r2": 0.884242905832544,
  "count_confidence_threshold": 0.25,
  "nms_iou": 0.7,
  "max_det": 300,
  "image_size": 640,
  "ap_min_confidence": 0.001,
  "ultralytics_version": "8.3.40",
  "reference_absolute_differences": {
    "precision": 0.000272923813355308,
    "recall": 0.00016753850762663003,
    "map50": 7.166078661513531e-05,
    "map50_95": 0.00046893600171771244
  },
  "domain_metrics": [
    {
      "source_domain": "rres_1",
      "image_count": 432,
      "gt_boxes": 19210,
      "pred_boxes": 18472,
      "count_mae": 3.0787037037037037,
      "count_rmse": 4.079079416840139,
      "count_bias": -1.7083333333333333,
      "count_pearson_r": 0.9510910974589155,
      "count_r2": 0.884242905832544,
      "precision": 0.9372729238133554,
      "recall": 0.8711675385076266,
      "map50": 0.9420716607866151,
      "map50_95": 0.5874689360017177
    }
  ],
  "worst_over_count": 10,
  "worst_under_count": -17,
  "count_mae_divided_by_mean_gt": 0.06923477355543987,
  "recommend_freeze_v1": true,
  "source_domain_comparison": "Not assessable: test contains rres_1 only.",
  "evaluation_scope": "internal source-domain-separated test; not official GWHD test",
  "input_integrity_verified": true
}
```

检测指标直接来自Ultralytics官方model.val(split=test)。Precision/Recall是官方PR曲线选择的操作点，不等于固定0.25计数操作点的检测P/R。AP使用conf0.001保留PR曲线，计数仅取同次NMS后score>=0.25的框；未按Test调参。

## Counting and errors

MAE=mean(abs(pred-gt))，RMSE=sqrt(mean((pred-gt)^2))，Bias=mean(pred-gt)。Pearson r为线性相关；R²采用sklearn r2_score(gt,pred)，不是Pearson r平方。计数误差不能区分漏检、误检与重复检测的抵消。

Top20详情：model_c_worst_count_errors.csv。

- rres_1__a6dce2b4-e3d8-407f-a8a6-dec17e0b5f49.png: GT=57, pred=40, error=-17
- rres_1__2888c041-47a0-431b-8e25-fc2ffeb522b8.png: GT=53, pred=40, error=-13
- rres_1__5699d546-a6de-4b45-8ac7-c737425198cd.png: GT=32, pred=20, error=-12
- rres_1__d2d7eb74-ce3e-45c3-8d83-b08f13ee2762.png: GT=63, pred=51, error=-12
- rres_1__354abd56-ae55-4738-98d5-7d3f8e9483ac.png: GT=63, pred=52, error=-11
- rres_1__7c781b1b-2ab7-4141-a03f-376cee4ec19e.png: GT=53, pred=42, error=-11
- rres_1__959ce974-e2d4-4788-86d9-1c5737b5b482.png: GT=56, pred=45, error=-11
- rres_1__a7c03b71-5885-4ffb-aef5-ee3bfda1e2cd.png: GT=57, pred=46, error=-11
- rres_1__ef29cf10-0bac-4902-8d45-1e1ab4c0d057.png: GT=63, pred=52, error=-11
- rres_1__37d0061b-98c3-4263-9776-774fac736fbb.png: GT=61, pred=51, error=-10
- rres_1__61195cc9-0870-49f8-b23b-63c26e016f97.png: GT=44, pred=34, error=-10
- rres_1__bc1fc19f-44b9-4b76-bf17-37bf435d8cf6.png: GT=49, pred=39, error=-10
- rres_1__e31bbcd3-0d31-4040-abb9-44782b8c781b.png: GT=46, pred=56, error=10
- rres_1__14911706-7117-4f55-bdbb-3e88e5012223.png: GT=41, pred=32, error=-9
- rres_1__1c76aa4d-11f4-47d1-8bdd-2cb78deeeccf.png: GT=53, pred=62, error=9
- rres_1__421cf6a6-bf72-4082-86df-f1f00b3c4526.png: GT=43, pred=34, error=-9
- rres_1__481fa04c-4237-49ff-b0d6-d044bad5355f.png: GT=48, pred=39, error=-9
- rres_1__5d398c46-a93c-4ab2-9358-a586166738f7.png: GT=46, pred=37, error=-9
- rres_1__b6adeb8e-36d8-42e8-be9b-3773546cdce3.png: GT=60, pred=51, error=-9
- rres_1__edddd4ca-3f15-42cc-9653-dbe3148e8dc8.png: GT=61, pred=52, error=-9

## Source domains

来源从图像SHA与既有manifest可靠匹配。Test只有rres_1，所以该域检测指标与整体相同；不能比较不同来源域性能，也不能宣称不存在域差异。

## Limitations and freeze recommendation

仅内部rres_1测试，未验证官方盲测、黄骅本地或跨设备泛化。count MAE依赖conf0.25/NMS0.7/640输入；mAP高不代表计数必然准确。good_detection按计数误差小选取，不保证定位无误；示例绿框GT、红框预测。真实面积密度需要面积/尺度元数据。

建议冻结Model C v1：是，作为内部原型候选。采用描述性判据：mAP50>=0.9、mAP50-95>=0.5且MAE/平均GT<=15%。这不是田间性能认证；实际冻结不在本阶段执行。

原数据YAML含服务器路径，评估使用临时副本和专用YAML；缓存仅写临时副本。原始split/labels/权重哈希及数据清单未变，raw未触碰。未训练。
