# 盐田丰语 AI 服务

当前包括 Neo4j 知识图谱、FastAPI 中文网页和泊头鸭梨文档库。项目主入口仍为 http://localhost:8081/platform/，知识图谱为 http://localhost:8090/。

## 目录

```text
ai-service/
├── app/                         文档 metadata 查询模块
├── data/
│   ├── documents/
│   │   ├── standards/          标准原件与摘要
│   │   ├── papers/             论文原件与摘要
│   │   ├── government/         政府文章原始网页
│   │   ├── university/         教学站点材料，单独标注来源身份
│   │   ├── books/              教材预留，当前无全文
│   │   └── metadata/           sources.jsonl 与图谱来源映射
│   ├── processed/              分页文本、采集日志、待审核候选
│   ├── vector_store/           BGE + FAISS 普通向量检索基线
│   ├── evaluation/             文档库检查结果
│   └── knowledge/              现有图谱证据目录，保留兼容
├── models/                     模型预留
├── scripts/                    下载、整理和校验脚本
├── main.py                     FastAPI 统一启动入口
├── graph_web/                  已有网页与图谱接口
├── knowledge_graph/            本体、构建、导入和验收
└── data\\botou_yali\\graphrag_corpus_v1/ 用户原始资料包，保留不改写
```

先阅读 [文档库目录与获取状态](data/botou_yali/graphrag_corpus_v1/fulltext/README.md)。每份来源有独立 `metadata.json`，`summary.md` 表示用户整理摘要，不是全文。原始 PDF 为 `original.pdf`；网页原件为 `browser.html` 或 `http-original.html`。

分页文本与空白页标记见 `data/botou_yali/graphrag_corpus_v1/processed/<source_id>/pages.json`。全文已取得不代表提取文字正确，更不代表农业内容已审核。

## 文档库维护

在 `agric` 根目录执行：

```powershell
ai-service/.venv/Scripts/python.exe -m pip install -r ai-service/scripts/requirements.txt
ai-service/.venv/Scripts/python.exe ai-service/scripts/organize_corpus.py
ai-service/.venv/Scripts/python.exe -m unittest discover -s ai-service/scripts -p test_corpus.py
```

整理脚本重建文档 metadata，不修改 Neo4j，也不自动联网下载。采集计划与成功/失败日志位于 `data/botou_yali/graphrag_corpus_v1/processed/acquisition/`。

从 `ai-service` 可调用 `app.document_catalog.find_documents(crop='鸭梨', stage='储藏期', fulltext_only=True)` 筛选。地区与作物按明确标签匹配，不把未知产区当作泊头。`project_focus` 只是项目主题，不等于证据适用地区。

## 服务

首次部署由主项目的 `start.cmd` 准备 Python 运行时、Neo4j 与知识初始化。Multi-crop 服务由 Spring Boot 自动管理；需要单独运行时，在主项目根目录执行 `start.cmd -Task MultiCropSetup` 和 `start.cmd -Task MultiCrop`。独立调试服务可先在 `.venv` 安装 `graph_web/requirements.txt`，然后从 `ai-service` 运行 `.venv/Scripts/python.exe main.py`。文档整理不需要重启现有服务。

参见 [知识图谱 V2.1](knowledge_graph/README-V2.md) 和 [第一阶段验收](knowledge_graph/audit/README.md)。
全文解析和候选切块已实现，见 [第三阶段切块说明](data/botou_yali/graphrag_corpus_v1/processed/chunks/README.md)。
运行 `.venv/Scripts/python.exe scripts/chunk_documents.py` 可重建全文候选块。
普通向量检索已实现，见 [第四阶段操作说明](data/botou_yali/vector/README.md)。尚未完成全文分块人工审核，索引用于研究基线，不代表农业知识审核通过；`ready_for_chunking` 只表示可进入分块审核。本阶段不调用 LLM。
