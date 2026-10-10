# 金丝小枣统一视觉服务

从 ai-service 目录运行：

```powershell
.\.venv\Scripts\python.exe -m uvicorn jujube_diagnosis.app:app --host 127.0.0.1 --port 8093
.\.venv\Scripts\python.exe -m pytest jujube_diagnosis/tests -q
```

POST `/api/jujube/vision/analyze`：multipart 字段 `image`、`task`。
task 为 leaf / fruit_bruise / fruit_freshness。GET `/api/jujube/health` 返回每个模型状态。
Swagger：`http://127.0.0.1:8093/docs`。

默认从相邻 ai-training/jujube-vision/models/jujube 读取冻结权重及同名JSON，启动时核对SHA256、类别和冻结状态。
支持环境变量 JUJUBE_MODEL_DIR、JUJUBE_DEVICE（默认cpu），以及 JUJUBE_LEAF_MODEL_PATH、JUJUBE_FRUIT_BRUISE_MODEL_PATH、JUJUBE_FRUIT_FRESHNESS_MODEL_PATH。指定权重旁必须有同名冻结JSON。
依赖当前 ai-service 虚拟环境：Ultralytics 8.3.40、PyTorch、FastAPI、python-multipart、OpenCV、Pillow、uvicorn；测试使用pytest、httpx。

模型启动时一次加载，单模型推理加锁。缺失模型不会阻止其他任务使用；health返回degraded，对应推理返回503。
错误采用 `success=false,error={code,message}`。非法/缺失参数422，解码错误400，超过大小限制413，模型不可用503，推理失败500。

A输出leaf visual symptom evidence；B1/B2输出postharvest visual risk evidence。confidence为模型分类得分，所有结果均is_diagnosis=false。禁止解释为食品安全、可食用性、储藏寿命、疾病最终确诊或腐败原因诊断。yellow_leaf只代表黄化。
不接KG/GraphRAG，不改前端或pear/wheat。不保存用户上传图片。

B1部署副本恢复说明：本地冻结副本缺失，本次从原runs权重按字节复制，经此前冻结SHA256 `ad52101dca33fe9eb642994ee7246bb21522cada3dd0bf89b98ecacf164608c7` 核对一致；未重训或导出。
