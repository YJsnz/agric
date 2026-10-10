# 金丝小枣统一风险诊断服务第一阶段验收

日期：2026-10-09。

## 接口与实现

- `POST /api/jujube/diagnose`：multipart image、task；可选 temperature、humidity、storage_temperature、storage_humidity、storage_days、harvest_method、transport_condition、notes。
- 未提交字段保持 null；温湿度允许用户原始描述（如 high），不自动推断数值、所在地或环境条件。storage_days 为非负有限数值。
- 复用现有三种 visual service、审核实体映射、jujube.service.ask、BGE/FAISS、两跳 KG 检索以及原有 citation/grounding validators。
- 映射实体作为图检索起点；用户条件进入查询及生成上下文。风险级别始终为 null，视觉分数分层不是疾病概率。
- 原 `/api/jujube/vision/analyze` 保留；health 新增 vision_models、kg、graphrag、llm。
- 独立启动：在 ai-service 执行 `.venv\Scripts\python.exe -m uvicorn jujube_diagnosis.app:app --host 127.0.0.1 --port 8093`。

## 真实依赖

Model A / B1 / B2：三个正式冻结模型均成功加载，在 CPU 上完成实际图片推理。

KG backend：`local_review_graph`，114 nodes / 77 edges；显式默认 JUJUBE_DIAGNOSIS_KG_BACKEND=file，可配置 neo4j。没有重建或改动图谱。

GraphRAG：现有审核语料及 BGE/FAISS 检索真实运行。LLM：当前配置密钥与用户提供值一致；真实 DeepSeek 生成及逐字段 grounding 调用成功。报告不记录密钥。

Neo4j 的 TCP 端口在本轮健康检查中可连接，记录为 `reachable_not_authenticated`，没有宣称认证或数据库查询成功；当前诊断并未使用 Neo4j。健康检查的 GraphRAG 状态表示依赖文件就绪，真实检索可用性由接口验收确认。

## 真实接口验收

完整响应保存在 `jujube_diagnosis/tests/results/unified/`。

| 图片案例 | 真实模型输出 | reasoning.status | LLM generation | 引用数 | 核查 |
|---|---|---|---|---:|---|
| anthracnose | anthracnose | preliminary | false | 1 | 模型卡使用边界通过 |
| yellow_leaf | yellow_leaf | insufficient_evidence | false | 0 | 无病因事实主张 |
| bruised | bruised | preliminary | true | 1 | DeepSeek grounding 通过 |
| rotten | rotten | preliminary | false | 1 | 模型卡使用边界通过 |
| fresh | fresh | preliminary | true | 4 | DeepSeek grounding 通过 |
| low_leaf | anthracnose，分数低于 0.6 | preliminary | false | 1 | 明确视觉证据较弱 |

另完成非法 task、缺少 image，以及真实模型推理下的 GraphRAG 故障、DeepSeek 故障注入，共 10 个验收场景。六张图按测试类别及所需模型输出选择，仅用于接口覆盖，不是新的模型准确率评估。

两次真实 LLM 场景通过原 citation validator 和 grounding。初次联网生成中出现部分字段无引用，已被原核查器拒绝；只加强 prompt 的逐字段引用要求后重跑成功，没有放宽 validator，也没有伪造引用。此结果不保证未来每次生成都通过，未通过时继续降级。

模型卡 P1 引用仅证明模型使用边界，不作为农业病因证据。黄化无合适原文时不生成病因或伪造引用。fresh 召回包含干枣标准，只可陈述其适用边界，不外推为新鲜果实风险结论。

## 降级与边界

映射、KG、GraphRAG、LLM、grounding 失败均保留成功的视觉结果；LLM/grounding 失败保留已检索 paths/evidence/citations，以原文摘录模板返回 insufficient_evidence。降级引用标记 `retrieved_excerpt_not_validated_generated_claim`，grounding.passed=null，不伪装为通过审核的生成答案。

碰伤证据限定为室内离体刺伤接种，不声称自然碰伤必然腐败。yellow_leaf 不解释为缺氮、缺铁或盐害；rotten 不解释为不可食用、食品安全或病原诊断。低置信度叶片提示视觉证据弱。所有模型分数均不用于 risk.level。

`health.json` 是故障注入结束后的快照，因此 llm.status=unavailable 是注入测试遗留状态；真实 LLM 可用和核查成功以 bruised.json、fresh.json 和 summary.json 为准。运行脚本已增加故障注入前独立 health_real 快照，后续运行可直接比较。

## 回归测试

最终本地命令覆盖：jujube_diagnosis/tests/test_api.py、test_unified.py；jujube/test_service.py、test_acceptance.py；pear_diagnosis/tests/test_diagnosis_api.py、test_graphrag_adapter.py；wheat_diagnosis/tests/test_decision_support.py、test_knowledge_pipeline.py、test_wheat_diagnosis.py。

共 107 项通过，另 8 项 subtests 通过。其中：原视觉 API 10；原小枣 KG/GraphRAG 19；新增统一服务 14；所选梨回归 15；所选小麦回归 49。没有声称执行梨/小麦全项目所有测试。只有测试依赖弃用警告。

新增测试覆盖五类语义、低置信度叶片、null 上下文、用户条件传递、实体映射失败、KG/RAG/LLM/grounding 降级，以及非法 task/缺图/非图片。故障测试明确使用注入，未冒充真实网络故障。

## 本轮文件

- 修改 `jujube_diagnosis/app.py`：统一接口、复用解码、扩展 health。
- 新增 `jujube_diagnosis/pipeline.py`：轻量编排、映射、上下文和降级。
- 修改 `jujube/runtime.py`：允许调用方显式指定现有 graph backend。
- 修改 `jujube/service.py`：接收诊断上下文及映射检索起点、证据 URL、核查异常保留证据、强化引用输出要求。
- 新增 `jujube_diagnosis/tests/test_unified.py`、`run_real_unified.py`。
- 保存 `jujube_diagnosis/tests/results/unified/` 真实响应；原视觉接口测试更新其既有结果文件。
- 本报告。

没有修改 pear/wheat 业务代码、前端、冻结模型、数据集或 KG 内容；未训练，未启动下一阶段。
