# -*- coding: utf-8 -*-
"""Step 11 - 5 个真实问答（纯文本确定性版，不需要视觉模型/真 LLM）。

跑通链路：
 用户问题
   → Entity Extraction（规则，无 LLM）
   → KG Retriever（graph-v1.json 关联子图）
   → Vector Retriever（Step 8 chunks，region/stage/stress 过滤）
   → Evidence Fusion（Step 10 优先级）
   → 排好序的 lang=zh 证据 + Citation + 结论分级（本地定论/候选研判）

说明：
  - 这里的“答案”先由证据驱动合成，标注 evidence 与 citation；
    生产上最后一段用 LLM 把这批已排序证据组织成自然语言即可。
  - 关键：不允许生成无证据 CAUSES；本地证据不足时输出“候选研判”而非拒绝。

执行：
  py scripts/qa_eval_v1.py
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
GRAPH = json.loads((ROOT / 'graph' / 'graph-v1.json').read_text(encoding='utf-8'))
EVID = ROOT / 'evidence' / 'evidence_v1.jsonl'
CHUNKS = ROOT / 'graphrag_kg_corpus_v1' / '04_fulltext_chunks' / 'chunks.jsonl'
EVAL = ROOT / 'evaluation'

POLICY = json.loads((ROOT / 'scripts' / 'entity_policy_v1.json').read_text(encoding='utf-8'))
PRIORITY = POLICY['evidence_fusion_priority']  # 1..6 权重降序

REGION_RANK = {
    '黄骅': 0, '中捷': 0, '海兴': 1, '沧州': 1, '南皮': 2,
    '河北': 3,
}
STAGE_ALIAS = {
    '播种': 'stage:sowing', '播前': 'stage:presowing', '出苗': 'stage:sowing',
    '雪山': 'stage:wintering', '越冬': 'stage:wintering', '返青': 'stage:regreening',
    '起身': 'stage:regreening', '拔节': 'stage:jointing', '抽穗': 'stage:heading',
    '开花': 'stage:heading', '灌浆': 'stage:filling', '收获': 'stage:harvest',
}


def load_evids():
    rows = [json.loads(l) for l in EVID.read_text(encoding='utf-8').splitlines() if l.strip()]
    return rows


def load_chunks():
    if not CHUNKS.exists():
        return []
    return [json.loads(l) for l in CHUNKS.read_text(encoding='utf-8').splitlines() if l.strip()]


def extract(q: str) -> dict:
    """Step 9 - 规则版实体抽取（无 LLM）。"""
    ent = {'crop': 'huanghua_hanjianmai', 'region': '', 'growth_stage': '',
           'soil_salinity': '', 'soil_moisture': '', 'temperature': '', 'rainfall': '',
           'stress': [], 'practice': [], 'variety': '', 'quality_intent': ''}
    # region
    for rk in ('黄骅', '中捷', '海兴', '沧州', '南皮', '河北'):
        if rk in q:
            ent['region'] = rk
            break
    # growth_stage
    for tok, sid in STAGE_ALIAS.items():
        if tok in q:
            ent['growth_stage'] = sid
            break
    # 数值槽
    m = re.search(r'(\d+(?:\.\d+)?)\s*(‰|%|克/升|g·kg|℃|°C|mm)', q)
    if m:
        val, unit = m.groups()
        if unit in ('‰', '%', '克/升', 'g'):
            ent['soil_salinity'] = f'{val}{unit}'
        elif unit in ('℃', '°C'):
            ent['temperature'] = f'{val}{unit}'
        elif unit == 'mm':
            ent['rainfall'] = f'{val}{unit}'
    # stress / practice
    for k in ('盐', '碱', '盐碱'):
        if k in q:
            ent['stress'].append('盐胁迫')
    if '干旱' in q or '墒情' in q or '缺水' in q or '干' in q:
        ent['stress'].append('干旱胁迫')
        ent['soil_moisture'] = ent['soil_moisture'] or '低'
    for k in ('沟播', '探墒', '镇压', '化控', '调控', '施肥', '一喷三防'):
        if k in q:
            ent['practice'].append(k)
    # variety
    for v in ('捷麦19', '捷麦20', '沧麦6002', '沧麦6003', '沧麦6005'):
        if v in q:
            ent['variety'] = v
            break
    # quality_intent
    for k in ('原粮', '小麦粉', '蛋白质', '容重', '水分', '面筋', '质量'):
        if k in q:
            ent['quality_intent'] = k
            break
    return ent


def region_rank_txt(region_text: str) -> int:
    """证据 region 的本地化优先分，越小越优先。"""
    if not region_text:
        return 99
    best = 99
    for tok, rank in REGION_RANK.items():
        if tok in region_text:
            best = min(best, rank)
    return best


def evidence_level_score(level: str) -> int:
    try:
        return POLICY['evidence_level_ranking'].index(level)
    except ValueError:
        return 99


def kg_retriever(ent, evids_by_id, sources):
    """Step 10a - KG 检索：命中 region/stage 相关关系。"""
    hits = []
    for e in GRAPH['edges']:
        # region 匹配
        evid = e.get('evidence_ids') or []
        region_text = e.get('region', '') or ''
        rrank = region_rank_txt(region_text)
        # stage 匹配
        sts = set((e.get('stage_ids') or []))
        stage_ok = (not ent['growth_stage']) or (ent['growth_stage'] in sts) or (not sts)
        if not stage_ok:
            continue
        # 主题相关：subject/object 与 question 关键词共现
        blob = str(e.get('source')) + str(e.get('target'))
        if ent['stress'] and not any(s in blob for s in ent['stress']):
            if not ent['practice']:
                continue
        hits.append({
            'stmt_id': e['id'], 'rel': e.get('relation'),
            'subj': e.get('source'), 'obj': e.get('target'),
            'region': region_text, 'region_rank': rrank,
            'evidence_ids': evid,
            'level': min((sources.get(sid, {}).get('evidence_level', '') for sid in
                          (e.get('source_id') or '').split(',')), default='') if (e.get('source_id')) else '',
        })
    hits.sort(key=lambda h: (h['region_rank'], len(h['evidence_ids'])))
    return hits


def vec_retriever(ent, chunks):
    """Step 10b - 向量/元数据检索：region+stage+stress 过滤 + 关键词评分。"""
    scored = []
    qkw = ' '.join(ent['stress']) + ' ' + ' '.join(ent['practice']) + ' ' + ent['region']
    for c in chunks:
        m = c['metadata']
        rrank = region_rank_txt(m['region'])
        if ent['region'] and ent['region'] not in m['region'] and ent['region'] != '河北':
            continue
        score = 100.0 - rrank * 10.0
        hit_kw = sum(1 for k in ent['stress'] + ent['practice'] if k in c['text'])
        score += hit_kw * 2.0
        # stage 加分
        if ent['growth_stage'] and ent['growth_stage'] in (m['growth_stage'] or ''):
            score += 10.0
        scored.append({'chunk_id': c['chunk_id'], 'text': c['text'], 'metadata': m,
                       'score': score, 'region_rank': rrank})
    scored.sort(key=lambda x: x['score'], reverse=True)
    return scored[:5]


def fuse(ent, kg_hits, vec_hits, evids_by_id):
    """Step 10 - 证据融合与结论分级。"""
    ev_used, rel_info = [], []
    for h in vec_hits:
        for eid in h['metadata'].get('evidence_ids', []):
            if eid in evids_by_id and eid not in {x['id'] for x in ev_used}:
                ev_used.append(evids_by_id[eid])
    for h in kg_hits[:12]:
        for eid in h['evidence_ids']:
            if eid in evids_by_id and eid not in {x['id'] for x in ev_used}:
                ev_used.append(evids_by_id[eid])
        rel_info.append({
            'subj': h['subj'], 'rel': h['rel'], 'obj': h['obj'],
            'region': h['region'], 'level': h['level'],
        })
    # 排序：本地证据优先
    ev_used.sort(key=lambda r: (region_rank_txt(r.get('region', ''))))

    local_count = sum(1 for r in ev_used if region_rank_txt(r.get('region', '')) <= 1)
    conclusion = 'LOCAL_CONCLUSION' if local_count >= 1 and ev_used else 'CANDIDATE_研判'
    if not ev_used:
        conclusion = 'NO_EVIDENCE'
    return ev_used, rel_info, conclusion


def run(q: str):
    ent = extract(q)
    chunks = load_chunks()
    evrows = load_evids()
    evids_by_id = {r['evidence_id']: r for r in evrows}
    sources = {s['id']: s for s in GRAPH['sources']}
    kg_hits = kg_retriever(ent, evids_by_id, sources)
    vec_hits = vec_retriever(ent, chunks)
    ev_used, rel_info, conclusion = fuse(ent, kg_hits, vec_hits, evids_by_id)
    return {'entity': ent, 'kg_hits': len(kg_hits), 'vec_top3': [v['chunk_id'] for v in vec_hits[:3]],
            'conclusion': conclusion, 'relations': rel_info, 'evidence': ev_used}


QUESTIONS = [
    "黄骅盐碱地土壤含盐量约2‰，播种期墒情不足，旱碱麦应该如何播种？",
    "旱碱麦播种偏晚后，春季应该采取哪些措施减灾促苗？",
    "灌浆期遇到持续高温干旱，旱碱麦主要面临什么风险？",
    "为什么宽幅沟播有助于旱碱麦抗旱躲盐？",
    "黄骅旱碱麦收获后，原粮质量主要应该关注哪些指标？",
]


def render_answer(q: str, res: dict) -> dict:
    ent = res['entity']
    lines = [f"Q: {q}", f"实体抽取: {json.dumps(ent, ensure_ascii=False)}"]
    if res['relations']:
        lines.append("KG 关联:")
        for r in res['relations'][:6]:
            lines.append(f"  {r['subj']} —[{r['rel']}]→ {r['obj']}  @{r['region'] or '未标region'} ({r['level']})")
    lines.append(f"结论分级: {res['conclusion']}")
    lines.append("证据与引用 (按本地化优先排序):")
    if not res['evidence']:
        lines.append("  (无本地证据 —— 输出候选研判，不拒绝回答)")
    for i, r in enumerate(res['evidence'][:8], 1):
        lines.append(f"  [{i}] [{r.get('region') or '未标'}][stage={r.get('growth_stage') or '未标'}] "
                     f"{r.get('evidence_text', '')}   (source={r.get('source_id')})")
    return {'q': q, 'entity': ent, 'conclusion': res['conclusion'],
            'kg_hits': res['kg_hits'], 'relations': res['relations'][:6],
            'evidence': res['evidence'][:8]}


def main():
    out = []
    print('=' * 60)
    print('旱碱麦 GraphRAG V1 · 5 个真实问答（确定性链路）')
    print('=' * 60)
    for q in QUESTIONS:
        res = run(q)
        render = render_answer(q, res)
        out.append(render)
        print('\n' + '# ' + q)
        print(f"实体: {json.dumps(res['entity'], ensure_ascii=False)}")
        print(f"KG命中 {res['kg_hits']} | VectorTop3 {res['vec_top3']} | 结论 {res['conclusion']}")
        for i, r in enumerate(res['evidence'][:5], 1):
            print(f"  证据[{i}] region={r.get('region')} stage={r.get('growth_stage')} "
                  f"src={r.get('source_id')} :: {r.get('evidence_text', '')[:60]}")
    (EVAL / 'qa_v1_results.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\n写盘: {EVAL / "qa_v1_results.json"}')


if __name__ == '__main__':
    main()