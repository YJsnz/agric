# 按作物组织资料

各作物独立保存语料、评测、证据和向量索引。当前只有 botou_yali 已接入数据。

迁移映射：

- `botou_yali_graphrag_corpus_v1` → `data/botou_yali/graphrag_corpus_v1`
- `huanghua_hanjianmai_graphrag_kg_corpus_v1` → `data/huanghua_hanjianmai/graphrag_kg_corpus_v1`
- `data/documents` → `data/botou_yali/graphrag_corpus_v1/fulltext`
- `data/processed` → `data/botou_yali/graphrag_corpus_v1/processed`
- `data/knowledge` → `data/botou_yali/evidence`
- `data/evaluation` → `data/botou_yali/evaluation`
- `data/vector_store` → `data/botou_yali/vector`
