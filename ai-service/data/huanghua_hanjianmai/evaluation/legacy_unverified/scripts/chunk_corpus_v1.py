# -*- coding: utf-8 -*-
"""Step 7 - GraphRAG Corpus 细粒度切块（单主题 + 单生育阶段 + 单地区）。

规则（来自需求）：
  - 不以固定字符数硬切；按“主题×阶段×地区”为块边界。
  - 每块约 200~500 中文字。
  - 每个 chunk 的 metadata 至少保留：
    crop / region / growth_stage / scope / stress / practice / source_id / evidence_level

输入：
  - evidence/evidence_v1.jsonl      （91 条证据，逐条已带 region/stage/subject/object/evidence_text）
  - graphrag_kg_corpus_v1/03_graphrag_seed_chunks/seed_chunks.jsonl （来源级段落，保留）

输出：
  - graphrag_kg_corpus_v1/04_fulltext_chunks/chunks.jsonl
  - evaluation/corpus_chunk_stats.json

执行：
  py scripts/chunk_corpus_v1.py
"""
from pathlib import Path
import json
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
EVID = ROOT / 'evidence' / 'evidence_v1.jsonl'
SEED = ROOT / 'graphrag_kg_corpus_v1' / '03_graphrag_seed_chunks' / 'seed_chunks.jsonl'
OUTD = ROOT / 'graphrag_kg_corpus_v1' / '04_fulltext_chunks'
EVAL = ROOT / 'evaluation'
OUTD.mkdir(parents=True, exist_ok=True)
EVAL.mkdir(parents=True, exist_ok=True)

# 主题域 -> 关联的 stress / practice 关键词（用于给 chunk 打标签）
STRESS_KEYWORDS = ['盐', '旱', '强', '胁迫', '低温', '寡照', '倒伏', '干热风', '晚播弱苗']
PRACTICE_KEYWORDS = ['沟播', '探墒', '保播', '镇压', '化控', '调控', '施肥', '灌', '秸秆', '轮作',
                     '深松', '有机肥', '种子处理', '一喷三防', '绿色防控', '预警']
# 生育阶段名（用于归一化 stage 标签）
STAGE_NAMES = {
    'presowing': '播前准备', 'sowing': '播种期', 'wintering': '越冬期',
    'regreening': '返青期', 'jointing': '拔节期', 'heading': '抽穗期', 'filling': '灌浆期',
}


def guess_tags(text: str, subj: str, obj: str) -> dict:
    blob = text + ' ' + subj + ' ' + obj
    stress = [k for k in STRESS_KEYWORDS if k in blob]
    practice = [k for k in PRACTICE_KEYWORDS if k in blob]
    return {'stress': stress, 'practice': practice}


def main():
    ev = []
    if EVID.exists():
        ev = [json.loads(l) for l in EVID.read_text(encoding='utf-8').splitlines() if l.strip()]

    seeds = []
    if SEED.exists():
        seeds = [json.loads(l) for l in SEED.read_text(encoding='utf-8').splitlines() if l.strip()]

    # 先并入来源级 seed 段落，再按 (source_id, region, growth_stage, scope) 聚合证据句
    buckets = defaultdict(list)
    for s in seeds:
        buckets[(s['source_id'], s.get('region', ''), '')].append(
            {'text': s.get('text', ''), 'evid': s.get('chunk_id', ''), 'kind': 'seed'})
    for r in ev:
        key = (r.get('source_id'), r.get('region', ''), r.get('growth_stage', ''), )
        buckets[key].append({'text': r.get('evidence_text', ''), 'evid': r.get('evidence_id', ''),
                             'kind': 'evidence', 'subject': r.get('subject', ''),
                             'object': r.get('object', '')})

    level_by_src = {s['source_id']: s.get('evidence_level', '') for s in seeds}
    chunks = []
    for (sid, region, stage, ), items in sorted(buckets.items()):
        # 题目描述
        title = next((s['title'] for s in seeds if s['source_id'] == sid), f'未登记-{sid}')
        # 拼接文本并控制长度 ~200-500
        texts = []
        for it in items:
            t = it['text'].strip()
            # 避免 seed 与证据重复
            if t and not any(t in x for x in texts):
                texts.append(t)
        body = '；'.join(texts)
        if len(body) > 500:
            body = body[:497] + '…'
        if len(body) < 20:
            continue  # 太短不足成块
        # 标签
        allsubj = ' '.join(it.get('subject', '') for it in items)
        allobj = ' '.join(it.get('object', '') for it in items)
        tags = guess_tags(body, allsubj, allobj)
        stage_label = stage if stage else '未标定'
        scope = next((s.get('scope', '') for s in seeds if s['source_id'] == sid), '')
        chunks.append({
            'chunk_id': f"HH-src-{sid}-{len(chunks)+1:02d}",
            'source_id': sid,
            'title': title,
            'text': f"[{region}/{stage_label}] {body}",
            'metadata': {
                'crop': 'huanghua_hanjianmai',
                'region': region,
                'growth_stage': stage_label,
                'scope': scope,
                'stress': tags['stress'],
                'practice': tags['practice'],
                'source_id': sid,
                'evidence_level': level_by_src.get(sid, ''),
                'source_ids': sorted({sid}),
                'evidence_ids': [it['evid'] for it in items if it['kind'] == 'evidence'],
            },
            'char_len': len(body),
        })

    with (OUTD / 'chunks.jsonl').open('w', encoding='utf-8') as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + '\n')

    stats = {
        'chunks': len(chunks),
        'avg_chars': round(sum(c['char_len'] for c in chunks) / max(len(chunks), 1), 1),
        'by_region': dict(__import__('collections').Counter(
            c['metadata']['region'] for c in chunks).most_common()),
        'by_stage': dict(__import__('collections').Counter(
            c['metadata']['growth_stage'] for c in chunks).most_common()),
        'by_source': dict(__import__('collections').Counter(
            c['source_id'] for c in chunks).most_common()),
    }
    (EVAL / 'corpus_chunk_stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(stats, ensure_ascii=False))
    print(f'写盘: {OUTD / "chunks.jsonl"}')


if __name__ == '__main__':
    main()