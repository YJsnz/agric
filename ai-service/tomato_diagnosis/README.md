# Tomato visual service

独立 FastAPI 服务。视觉接口仅加载两个冻结 V1 模型；诊断接口在视觉结果之后接入现有青县知识组件。

在 `agric/ai-service` 目录运行（Windows）：

```powershell
& .\.venv\Scripts\python.exe -m uvicorn tomato_diagnosis.app:app --host 127.0.0.1 --port 8014
```

Linux 使用已有环境的 `python -m uvicorn`，其余参数相同。

- `GET /api/tomato/health`：两个模型加载状态、模型版本、device、加载错误。
- `POST /api/tomato/vision/analyze`：multipart `image` 和 `task`（`leaf` / `fruit_ripeness`）。
- 返回 `task`、`class`、`confidence`、`probabilities`（类别名到概率的映射）、模型版本及视觉证据边界。
- 类别按 checkpoint 的 names 映射，不能将成熟阶段顺序当成模型输出索引。
- 输入错误 422、解码失败 400、文件超限 413、模型不可用 503、推理失败 500；统一 error JSON。

默认从项目相对路径 `ai-training/vegetable-vision/models/tomato` 加载；可使用
`TOMATO_MODEL_DIR`、`TOMATO_LEAF_MODEL_PATH`、`TOMATO_FRUIT_RIPENESS_MODEL_PATH` 更换部署位置，
但权重必须通过固定 V1 SHA256 校验。`TOMATO_DEVICE` 默认 cpu，可指定部署机器上的设备。
不会下载缺失权重。固定输入 imgsz=224、crop_fraction=1.0、augment=False。

真实模型集成测试（需要本地正式 test 样例）：

```powershell
& .\.venv\Scripts\python.exe -m unittest discover -s tomato_diagnosis/tests -v
```

本服务输出为视觉分类证据，不代表疾病最终确诊、食品安全或实际采收决策；尚未经青县现场验证。
不注册到其他作物服务、不修改其 API，也不接入前端。

## 第二阶段：知识辅助分析

`POST /api/tomato/diagnose` 使用与视觉接口相同的 multipart `image`、`task`。
返回 `crop`、`visual`、`entity_alignment`、`kg`、`rag`、`limitations` 和 `degraded`。

- 只读 `data/qingxian_facility_vegetables/knowledge_graph/graph-v1.json`；不依赖 Neo4j 在线，不导入或修改图谱。
- 复用 `qingxian_diagnosis` 的知识服务、候选排序、证据适用规则与其 CropStore 向量检索。
- 叶片使用现有 grounded_answer；成熟度单独使用管理问答提示，复用 DeepSeek transport、引用校验与 grounding。
- 只按实际存在的番茄节点匹配。混合类别逐部分匹配，缺失部分进入 `unmapped_entities`；疾病节点对齐不表示确诊。
- 目前成熟阶段节点缺失，六类均可能 unmapped；仍可检索一般光照与植株管理资料，但明确不代表阶段专属建议或采收判断。
- `kg.relations` 是检索到的资料关系，不表示已证明该成熟度导致某种风险。
- 推理依赖失败时保留视觉与已获得的检索结果；`degraded=true`，不会假称 DeepSeek 成功。
- DeepSeek 使用现有配置，不写入密钥；API 仅发送分类结果和知识证据，不发送原图。

默认测试不会调用付费生成服务。真实全链路测试：

```powershell
$env:TOMATO_RUN_LIVE_RAG_TESTS='1'
& .\.venv\Scripts\python.exe -X utf8 -m unittest discover -s tomato_diagnosis/tests -v
```

真实响应记录在 `tomato_diagnosis/.runtime/diagnosis_live_results.json`（不提交 Git）。

2026-10-12 本地验收：真实叶片样例输出 `powdery_mildew`，匹配1个实体、检索6条关系；
真实果实样例输出 `breakers`，该阶段 unmapped，检索1条一般管理关系。
两次请求均完成 BGE/FAISS 检索、DeepSeek 生成及 grounding 校验（passed=true）。
常规测试6项通过；真实全链路测试单独启用并通过。外部 API 的可用性和生成校验结果可能随请求变化。
