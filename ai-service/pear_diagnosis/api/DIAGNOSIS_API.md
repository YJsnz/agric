# 鸭梨统一诊断 API

在 ai-service 目录启动独立服务：

```powershell
.\.venv\Scripts\python.exe -m uvicorn pear_diagnosis.dev_server:app --host 127.0.0.1 --port 8091
```

`POST /api/pear/diagnose`，请求格式 `multipart/form-data`。

| 字段 | 说明 |
|---|---|
| file | 必填，单帧 JPEG/PNG/WEBP，最多20MB |
| region | 可选，明确提供的地区；空白转为 null |
| organ | 默认 leaf；当前模型仅支持叶片，其他值返回422 |
| scene / growth_stage | 可选，未提供为 null |
| temperature | 可选，有限数值，摄氏度 |
| humidity | 可选，0～100，相对湿度百分数 |
| rainfall | 可选，非负毫米数 |

crop固定为此专用接口的“泊头鸭梨”，不据此推断所在地。

```powershell
curl.exe -X POST http://127.0.0.1:8091/api/pear/diagnose -F "file=@实际图片路径.jpg"
curl.exe -X POST http://127.0.0.1:8091/api/pear/diagnose -F "file=@实际图片路径.jpg" -F "region=河北省沧州市泊头市"
```

HTTP200包括正常业务状态 `needs_clarification`、`insufficient_evidence`，及现有GraphRAG返回的其他状态。`status`保持原值，不将证据不足升级为确诊。返回包含vision、context、knowledge_graph、candidate_ranking、graphrag、sources、reasoning_paths、grounding、disclaimer，以及clarification_questions、citations、retrieval_query、diagnosis_context。

图片/格式错误为400，超限413，字段校验422，真实执行异常500；异常完整写入服务日志，不向客户端暴露内部错误详情。无论成功失败均清理临时上传文件。同步路由在线程池中执行，共享YOLO预测器串行使用；所有请求上下文保持独立。

复用链路：PearVisionService → PearKnowledgeService → PearCandidateRanker → run_pear_graphrag。没有复制检索、排序或生成规则。旧视觉接口 `/api/vision/pear` 保留；未修改原项目main.py、graph_web/api.py。

自动测试：

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s pear_diagnosis/tests -p test_*.py -v
```

真实HTTP测试（需要现有模型、Neo4j、向量索引、DeepSeek Key及网络）：

```powershell
.\.venv\Scripts\python.exe pear_diagnosis/tests/run_real_diagnosis_api.py
```

该脚本启动临时本机HTTP服务，自动选择测试集第一张spot图片，通过真实multipart请求运行两次，不mock。结果保存在 `pear_diagnosis/tests/artifacts/without_region.json` 和 `with_region.json`；包含完整返回、HTTP状态和实际业务函数完成次数。测试结束自动停止临时服务，不占用8091。

## 2026-09-29 真实运行记录

两次均使用测试集首张 `006958c6c311f550e8b94288d38de2489a6d650d01edcd87f64c06e983c45ee7.jpg`，模型返回 spot，confidence=0.999997615814209（视觉分类置信度）。

| 请求 | HTTP | 业务状态 | generation_called | grounding |
|---|---|---|---|---|
| 无region | 200 | needs_clarification | false | null |
| 用户明确提供河北省沧州市泊头市 | 200 | validation_failed | true | passed=false |

无地区返回“请补充种植或储藏所在地。”，其余可选信息保持null。

有地区请求真实完成load_graph、图谱检索、向量检索；本地准入图谱路径0，向量证据1。DeepSeek生成与引用校验各完成2次，grounding各完成2次（包括原有的一次修订）。最终结论字段缺少实际引用，因此现有GraphRAG拒绝发布生成内容；统一接口保留validation_failed，sources/citations为空。没有为了得到成功状态而重试挑选答案或降低核查规则。

这证明API实际连接完整后端链路，但本次生成结果未通过证据核查，不能报告为“grounding通过”。统一接口范围内未修改GraphRAG业务代码。
