# 小麦统一诊断第二阶段验收

## 真实请求结果

通过 `main:app` 的 TestClient 执行真实 ASGI 请求，无 mock；三个模型使用 CPU。
测试结果见 `tests/artifacts/real_full_diagnosis.json`。测试上下文来自测试显式输入，
四组 region 均为 null，土壤数值没有补造单位。本结果不构成模型准确率评估。

| 场景 | HTTP | 图谱关系 | 向量块 | generation_called | grounding | 发布引用数 | status |
|---|---:|---:|---:|---|---|---:|---|
| 叶片 | 200 | 1 | 8 | true | grounded | 2 | insufficient_evidence |
| 冠层 | 200 | 0 | 8 | true | grounded | 8 | insufficient_evidence |
| 麦穗 | 200 | 0 | 8 | true | grounded | 5 | insufficient_evidence |
| 三图＋灌浆期等上下文 | 200 | 2 | 4 | true | grounded | 4 | insufficient_evidence |

图谱关系为0不是通道未运行。冠层这张测试图片实际预测 normal；不强迫输出 water_stress。
grounded 表示现有模型辅助引用核验通过，不表示确诊或专家审定。
前一轮生成因无引用的视觉复述、越出原文的观察建议被核验拦截；仅调整了适配层提示，
没有修改 citation/grounding 规则。最终一轮结果如上。

## 按任务清单逐项汇报

1. 新增：`tests/test_knowledge_pipeline.py`、`tests/run_real_full_diagnosis.py`、
   `tests/artifacts/real_full_diagnosis.json`、本报告。
2. 修改：`fusion.py`、`kg_adapter.py`、`graphrag_adapter.py`、`schemas.py`、
   `router.py`、`service.py`、`README.md`、`tests/test_wheat_diagnosis.py`、
   `tests/run_real_smoke.py`；以及 `../wheat/service.py` 提取共享检索函数。
   按用户后续要求更新 `../.env.local` 及 Windows 用户级 DeepSeek 环境变量。
3. 未修改 pear 代码。
4. 未修改 `app/graphrag` 或实际 `graphrag` 核心代码。
5. 复用真实小麦 Neo4j/FAISS、原小麦准入与排序、通用实体对齐、query_policy、
   dual_retriever.path_candidates、crop_runtime.grounded_answer、生成与引用/grounding。
   没有调用梨专用 `query_v2.select_edges`、`retrieve_dual`、`get_retriever`、
   `fuse_evidence`：审计确认其地区白名单、索引和 A/B/C 审核字段与小麦不兼容。
   采用真实小麦 `/api/wheat/ask` 的已有实现，而不是转换或伪造小麦证据等级。
6. 真实实体对齐成功；缺少匹配则空数组，不补造节点。
7. rust 对齐到 Disease“锈病”，真实 ID：
   `huanghua_hanjianmai:95402fe74542c564`。这不是现场已发病判定。
8. nitrogen_deficiency 保留“缺氮类黄化视觉表现”，未确认缺氮。
9. Model B 保持 weak_visual，阈值0.37不变。
10. Model C仅为表型计数，conf=0.25不变，不推算疾病、产量或无面积尺度的密度。
11. knowledge_enabled=false 纯视觉绕过所有知识/LLM调用；回归验证通过。
12. true 调用真实小麦双路检索及共享生成服务，以上四组均完成。
13. DeepSeek已真实调用；新密钥写入本地配置和用户环境变量，报告和结果不含密钥。
14. grounding已真实执行，最终四组均通过。
15. citations保留 source_id、title、url、metadata、evidence_level 和原始来源字段。
16. insufficient_evidence 保持，不因高视觉分数或生成流畅改成success。
17. Neo4j失败可降级至文档通道；只从本地目录读取来源元数据，不伪装本地图为Neo4j结果。
18. DeepSeek失败可保留检索和视觉结果，assessment=null；降级测试通过。
19. 四组完整诊断均HTTP200；该HTTP状态不是病害确认。
20. real_full_diagnosis.json已生成，并检查不含密钥前缀。
21. 新增知识链测试25/25；原视觉测试21/21，合计46/46。
22. pear原测试15/15。
23. wheat原测试15/15。
24. `/api/wheat/ask` 保持正常；共享函数提取没有改变原准入或排序，另有生成回归测试。
25. 已具备前端联调接口条件，本阶段没有修改前端。知识库症状覆盖仍有限，不能把候选视为确诊。

## 证据及运行边界

- 原文的 region、review_status、evidence_level、locator 保留，不人为升级为本地已验证。
- 视觉证据与文献证据分开返回。aligned_entities不是疾病诊断，候选默认candidate。
- 引用不足的生成被抑制；普通“请补充信息”类核验请求可能没有source_ids，不能宣称为文献事实。
- Model A现有锈病资料主要是标准中的防治对象名录，不能支撑图像症状确诊；缺氮和叶斑节点未强行补齐。
- 未修改权重、阈值、训练数据、split、KG数据、索引、旧问答接口或前端；没有训练。
- 重启长期运行服务后才会使用更新的环境变量；已启动进程不会自动读取新的Windows用户环境。

## 命令

在 ai-service 中运行：

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s wheat_diagnosis/tests -p 'test_*.py'
.\.venv\Scripts\python.exe -m unittest discover -s pear_diagnosis/tests -p 'test_*.py'
.\.venv\Scripts\python.exe -m unittest wheat.test_wheat
.\.venv\Scripts\python.exe wheat_diagnosis/tests/run_real_full_diagnosis.py
```
