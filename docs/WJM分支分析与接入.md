# WJM 多作物分支分析与接入

接入日期 2026年10月12日。来源为 [feature/wjm-multicrop-ai](https://github.com/YJsnz/agric/tree/feature/wjm-multicrop-ai)，固定提交 05190eb5fb19aa339a7f70cdb30850e5a4e05164，与用户交接说明相同。

## 分析结论

分支的增量集中于 ai-service、ai-training 和 vision-frontend。功能包括梨症状分类及循证研判、小麦叶片 冠层 麦穗三个模型、小枣叶片 碰伤 新鲜腐败三个任务，以及四作物 KG/GraphRAG。它们原先分散在不同端口，Python GraphRAG 与主 Java 问农也是不同链路，不能仅复制页面。

番茄视觉未完成，与交接说明一致：目前是数据审计 清洗 复核及划分。青县知识服务已存在，但不能把它当作番茄视觉已上线。历史训练与评估报告保留，不作为本次重新测得的精度。

## 接入实现

1. 保留三个新增目录的完整源资产，未用分支继承的公共文件覆盖现有 Agent、监控、梨叶摄像头检测或植物园 3D。
2. 主工作台新增多作物研判入口 /platform/multicrop；/platform/wheat-diagnosis 转入小麦页面。视觉和图谱页面通过主应用静态目录同源提供。
3. API 经 /api/multicrop 的原登录拦截器及明确白名单转发。上传重建 multipart，合计最多 8MB；客户端不能指定服务地址或训练接口。
4. Python 统一入口整合图谱问答、梨分类及融合、小麦路由和小枣子服务，只监听回环。重推理 POST 单个执行，轻量 GET 可并行。
5. Harness 增加 query_crop_knowledge，明确作物时约束 crop 参数；其他作物不沿用梨基地演示环境。未核验该作物知识时不发布任务结论。
6. 支持配置的 OpenAI 兼容模型，本地配置不复用云密钥。为本地生成缩减模型输入，原检索记录保留给引用和 grounding 核验，失败不伪装成功。

小麦麦穗默认路径指向缺失 v12，已修正为分支实际提交的 v13。新梨模型是分类，原 ONNX 是检测，结果分别展示，不合并分数或伪造检测框。

## 安装与运行

先完成原 setup-vision.ps1，然后执行：

```powershell
.\setup-multicrop.ps1 -InitializeKnowledge
.\start.ps1 -SkipBuild
```

首次初始化建立独立 agric-multicrop-neo4j 容器和数据卷，生成未提交的随机密码，下载 BGE 并导入四作物快照。7474 只映射回环；图谱按数据集管理，无数据库清空操作，原 MySQL 不受影响。

BGE 的 Google 归档在本机返回 403。下载器增加 FastEmbed 登记的 Qdrant/bge-small-zh-v1.5 来源，固定 revision 46fbe35fd4374a00fee7de77dfddaeb6dd6a2c59 并记录文件哈希。已有 FAISS 数据保留。

在另一终端启动主应用。正常 start.ps1 构建包含 vision-frontend；SkipBuild 要求已构建。AI 服务保持独立启动与停止，可单独调试。

配置包括 MULTICROP_BASE_URL、MULTICROP_PYTHON、MULTICROP_LLM_BASE_URL/MODEL/API_KEY。启动脚本默认使用 AGENT 模型配置，密钥只在服务器。原 branch GraphRAG 的引用和证据核查仍保留。

```powershell
.\create-release.ps1 -IncludeMultiCrop
.\scripts\create-jetson-release.ps1 -IncludeMultiCrop
```

发行 helper 只复制运行代码、知识快照、索引和模型配置及权重，排除训练报告、历史评估、虚拟环境、BGE 缓存和本机密钥。首次部署仍需初始化图谱和安装依赖。

## Jetson 边界

原 ONNX TensorRT 路径继续保留。新增模型通过 PyTorch/Ultralytics 接入，尚未完成七个新增模型的 TensorRT 转换或板端验证。8GB 展示配置默认不启用扩展，避免 Qwen、Neo4j、BGE 和全部模型同时驻留。

可选 agric-multicrop.service 需先安装与 JetPack 匹配的 NVIDIA PyTorch 和视觉依赖，配置 Neo4j/BGE、NEO4J_PASSWORD 及模型参数，再由集成人员安装启用。不要复制 Windows 虚拟环境，或让通用 pip CPU torch 覆盖 NVIDIA 运行时。

## 本轮验收

原后端 28 项回归、新增代理测试 2 项、Harness 3 项、原 Python 常驻推理 3 项通过。分支接口和输入校验 35 项通过，新增配置测试 2 项通过。

通过登录代理实际验证四作物实时图谱非空、梨分类、小麦三模型联合、小枣三视觉任务，均返回 200；番茄 vision_ready=false。未登录 401、未知路径 404 已检查。

视觉烟测用已有样例验证真实权重执行和结构，不是多作物精度评测。分支未提交完整的独立测试图像集，依赖该集的三项小枣测试没有计入通过。

浏览器验证了主入口、三作物视觉页面、四作物图谱、番茄视觉禁用、信息不足的追问及手机无横向溢出。小麦复查存在浏览器 IndexedDB，清理网站会删除，需导出；不是原服务器视觉历史。

完整知识生成依赖实际模型和证据核验。本机 Qwen CPU 首次完整请求超过分支 60 秒预算，已增加本地输入预算和受控失败响应。未通过生成、引用或核查的内容不发布。番茄正式训练、模型精度认证、多作物 Jetson 验收仍未完成。

调整后真实小麦问答完成图谱与向量融合，返回 8 条证据；模型生成未通过 grounding，响应状态 validation_failed，未发布结论。Agent 工具也拒绝采用该状态。本次证明链路和失败保护接通，不声称本机小模型的完整问答质量已经达标。


## 知识图谱自动启动修复（2026-10-14）

主程序的启动事件现在会带起已安装的多作物 Python 服务，按本地配置连接 Neo4j；本地 Neo4j 容器未运行时自动启动。服务异常退出后由主程序监督恢复，进入知识页面的请求也会等待服务就绪。现有服务可复用，仅关闭主程序自己创建的进程。远程服务不会被自动启动/停止；独立部署可设置 `MULTICROP_AUTO_START=false`。独立 `start-multicrop.ps1` 保留用于排查，已运行时不重复占用端口。

完整版 Windows 启动及发布版启动会安装多作物依赖，首次初始化知识数据库；新发布目录复用现有 Neo4j 容器时，安全读取既有配置的凭据，不重置数据库。Python及图谱数据首次安装仍需完整启动或 `setup-multicrop.ps1 -InitializeKnowledge`，随后 `start.ps1 -SkipBuild` 或直接启动 Java 均可自动带起服务。日志为 `var/logs/multicrop-runtime.log`。

知识页面等待和重试临时503，切换作物会取消旧请求；等待有75秒总上限，连接失败不再一直显示“正在连接”。图二的返回数据工作台、智能问农、视觉与融合研判、知识图谱与问答整组导航已删除，保留主平台导航和作物选择。未使用静态或虚构图谱代替数据库。

实际验证：停止主程序管理的 Python 服务并重启 Neo4j 后，页面自行恢复，鸭梨365个实体/315条关系、旱碱麦85/70、小枣129/114、设施蔬菜110/90均加载成功，数据库数据没有删除。Windows脚本语法检查、Java代理和自动管理测试、前端构建通过。
