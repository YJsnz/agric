# 全文解析与切块 V1

运行 `ai-service/.venv/Scripts/python.exe ai-service/scripts/chunk_documents.py` 重建本目录。

- `chunks.jsonl`：全部候选块，保留标题、章节、原件物理页码范围、来源 URL、文件哈希、作物、地区、阶段及证据等级。
- `<source_id>.chunks.jsonl`：单文献的候选块。被跳过的来源文件为空，不使用摘要补位。
- `<source_id>.pages.json`：此次解析的逐页原文。PDF 包含文本块坐标及页眉页脚剔除标记；使用原生块顺序，避免简单按整页纵坐标交织双栏。
- `sections.jsonl`：章节正文及逐字符页码映射。每个 chunk 的 start_offset/end_offset 可精确回查该章节文本。
- `layout_review.jsonl`：长句、图表混排等需要额外版式复核的片段。
- `report.json`：实际数量、长度分布与跳过原因。

## 切分约定

目标 800 字符，常规上限 1000，重叠预算 100 字符。长度为 Unicode 字符数（含标点和英文），并非 token 数。
优先在完整句子后切分，不在小数点、分号、规则中间硬切；重叠只能取完整句子，因此可能少于预算或为零。
不同章节不强行拼接，短章节/尾块允许不足 500 字符，并记录 size_exception。单条无可靠断句位置的超长段保留完整，列入 layout_review，而非按字符截断。
参考文献保留在解析结果中，不作为农业正文块。章节识别是规则方法，论文图表、英文缩写、公式及扫描文字仍需人工复核。

PDF `page` 为从 1 开始的物理文件页码，不是纸面页脚编号。跨页块保留 `pages` 和 `page_end`。网页没有页码，值为 null，不伪造 page=1。
作物/地区/阶段继承文档 metadata，属于文档主题范围，后续还须做规则级适用范围核对。
所有块的 production_retrieval_approved 均为 false；这是待审核语料，不代表已完成 GraphRAG。

## Word 和单文件解析

```powershell
ai-service/.venv/Scripts/python.exe ai-service/scripts/chunk_documents.py --parse-file path/to/document.docx --output ai-service/data/botou_yali/graphrag_corpus_v1/processed/manual_document
```

支持 DOCX 段落、标题样式和表格文本，生成 pages.json 和 sections.json。DOCX 在没有排版引擎时不能确定页码，保留 null；旧式 `.doc` 需先转换为 DOCX。
当前资料库没有 Word 原件，因此 DOCX 能力使用合成测试文档验证。单文件解析后须先登记来源 metadata，才能纳入全库构建。

## 当前限制

STD_001 与 PAPER_004 缺全文，PAPER_002 字体乱码待 OCR；这三份不产生正文块。
原资料包的 chunks_v1.jsonl 是摘要候选，不与本目录的全文块混用。没有修改 Neo4j 或建立向量索引。
