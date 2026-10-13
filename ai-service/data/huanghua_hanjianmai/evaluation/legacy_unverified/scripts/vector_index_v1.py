# -*- coding: utf-8 -*-
"""Step 8 - 建立 Vector Index（metadata 优先）。

读取 Step 7 产出的全量 chunks，产出：
  - vector/metadata.json           逐 chunk 元数据（含全部检索所需字段）
  - vector/documents.json          （正文+元数据，供外部 embedding 模型灌入）
  - vector/index_manifest.json     索引说明

关键点（回答“黄骅旱碱麦播种期墒情不足怎么办？”不会误召回
        “黄骅旱碱麦小麦粉蛋白质标准”）：
  metadata 至少保留 crop/region/growth_stage/scope/stress/practice/source_id/evidence_level。

注意：本脚本不伪造向量。真实 embedding 由接入了 embedding 模型的服务填入
      `documents[i].embedding`，或直接落库到 faiss/chroma 等。当前 embedding=null。

执行：
  py scripts/vector_index_v1.py
"""
from pathlib import Path
import json
import hashlib

ROOT = Path(__file__).resolve().parents[1]
CHUNKS = ROOT / 'graphrag_kg_corpus_v1' / '04_fulltext_chunks' / 'chunks.jsonl'
VDIR = ROOT / 'vector'
VDIR.mkdir(parents=True, exist_ok=True)

INDEX_VERSION = '1.0.0'
CROP = 'huanghua_hanjianmai'


def md5_id(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]


def main():
    chunks = [json.loads(l) for l in CHUNKS.read_text(encoding='utf-8').splitlines() if l.strip()]
    metadata = []
    documents = []
    for c in chunks:
        m = c.get('metadata', {})
        base = {
            'crop': CROP,
            'region': m.get('region', ''),
            'growth_stage': m.get('growth_stage', '未标定'),
            'scope': m.get('scope', ''),
            'stress': m.get('stress', []),
            'practice': m.get('practice', []),
            'source_id': m.get('source_id', ''),
            'evidence_level': m.get('evidence_level', ''),
            'source_ids': m.get('source_ids', []),
            'evidence_ids': m.get('evidence_ids', []),
            'chunk_id': c.get('chunk_id', ''),
            'title': c.get('title', ''),
            'text': c.get('text', ''),
            'char_len': c.get('char_len', 0),
        }
        metadata.append(base)
        # 组合索引文本：标题 + region/stage + 正文（embedding 模型将在此文本上编码）
        index_text = ' '.join([base['title'], base['region'], base['growth_stage'],
                               base['scope'], base['text']])
        documents.append({
            'id': md5_id(index_text),
            'chunk_id': base['chunk_id'],
            'text': base['text'],
            'embedding': None,   # 诚实占位：待 embedding 服务填充
            'metadata': {k: base[k] for k in
                         ('crop', 'region', 'growth_stage', 'scope', 'stress',
                          'practice', 'source_id', 'evidence_level', 'source_ids',
                          'evidence_ids')},
        })

    (VDIR / 'metadata.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    (VDIR / 'documents.json').write_text(json.dumps(documents, ensure_ascii=False, indent=2), encoding='utf-8')
    manifest = {
        'crop_id': CROP, 'index_version': INDEX_VERSION,
        'documents': len(documents),
        'metadata_fields': list(metadata[0].keys()) if metadata else [],
        'embedding_model': None,
        'embedding_dim': None,
        'remark': 'metadata 先行；embedding 由外部模型填入，避免误召回跨 stage/region 内容。',
    }
    (VDIR / 'index_manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(manifest, ensure_ascii=False))
    print(f'写盘: {VDIR / "metadata.json"}, {VDIR / "documents.json"}, {VDIR / "index_manifest.json"}')


if __name__ == '__main__':
    main()