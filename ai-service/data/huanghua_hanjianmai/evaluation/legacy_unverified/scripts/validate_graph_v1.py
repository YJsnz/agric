# -*- coding: utf-8 -*-
"""graph-v1.json 图谱校验器（Step 5）

对黄骅旱碱麦 V1 图谱做“关系干净度”门禁校验，提前规避泊头鸭梨踩过的坑。

检查项（与 ontology-v1.json 的 rules 对应）：
  V01 每条关系必须有 source_id / evidence_ids
  V02 region 不跨级乱升级（本地证据不被自动标成沧州/河北结论）
  V03 stage 缺失处理：缺失必须标 “未标定”，不当作全部阶段
  V04 数值必须带单位，且不得伪造无校准的 effect_size
  V05 标准元数据不得被误当标准正文条款（seed 类证据禁止当结论）
  V06 生产期与采后（品质/储运）两条链不得串线
  V07 无证据 CAUSES 禁止入库
  V08 引用完整性：边的端点必须存在对应节点；source_id 对应 sources 列表
  V09 节点 quality：source_ids 去重；region 字段与类型一致

用法：
  py scripts/validate_graph_v1.py            # 校验数据/graph/graph-v1.json
  py scripts/validate_graph_v1.py --json     # 输出 machine-readable 报告到 evaluation/
"""
from pathlib import Path
import json
import sys
import argparse
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]           # data/huanghua_hanjianmai
GRAPH = ROOT / 'graph' / 'graph-v1.json'
EVID = ROOT / 'evidence' / 'evidence_v1.jsonl'
ONTO = ROOT / 'ontology' / 'ontology-v1.json'
OUT = ROOT / 'evaluation'
OUT.mkdir(parents=True, exist_ok=True)

# 区域广度（越靠后说明越“宽/上位”），用于判断是否非正当升级
REGION_RANK = {
    '黄骅': 0, '中捷': 0, '海兴': 0, '沧州运东': 1,
    '沧州': 2, '河北低平原': 2, '滨海盐碱': 2,
    '河北': 3, '中国': 4,
}
# 来源 -> 其自身区域（广度）。用于 V02：边的区域广度不得大于其来源所能支持的最大广度。
SOURCE_REGION = {
    'W001': '河北滨海盐碱区/黄骅', 'W002': '河北', 'W003': '河北', 'W004': '沧州',
    'W005': '沧州', 'W006': '沧州', 'W007': '沧州', 'W008': '沧州',
    'W009': '沧州海兴', 'W010': '沧州/黄骅', 'W011': '河北低平原/黄骅',
    'W012': '黄骅', 'W013': '黄骅', 'W014': '黄骅/沧州',
    'W015': '黄骅/沧州', 'W016': '黄骅/沧州', 'W017': '河北', 'W018': '河北',
}
# 不能当作“生产结论”的证据等级（仅元数据/摘要/种子，需全文复核）
NOT_CONCLUSION_LEVELS = {
    'seed_requires_fulltext_review', 'metadata_only',
}
# 采后/品质链实体前缀（V06 生产期与采后不得互相串线）
POSTHARVEST_QUALITY_TYPES = {'QualityIndicator', 'Product'}
STAGE_IDS = {f'stage:{s}' for s in
             ['sowing', 'wintering', 'regreening', 'jointing', 'heading', 'filling', 'presowing']}


def region_breadth(text: str) -> int:
    if not text:
        return -1
    best = -1
    for tok, r in REGION_RANK.items():
        if tok in text:
            best = max(best, r)
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', action='store_true', help='输出 machine-readable 报告')
    args = ap.parse_args()

    errors, warnings, info = [], [], []

    # 载入
    graph = json.loads(GRAPH.read_text(encoding='utf-8'))
    ontology = json.loads(ONTO.read_text(encoding='utf-8')) if ONTO.exists() else {}
    ev_rows = []
    if EVID.exists():
        ev_rows = [json.loads(l) for l in EVID.read_text(encoding='utf-8').splitlines() if l.strip()]
    ev_by_id = {r.get('evidence_id'): r for r in ev_rows}

    nodes = graph.get('nodes', [])
    edges = graph.get('edges', [])
    sources = graph.get('sources', [])
    node_by_id = {n['id']: n for n in nodes}
    source_by_id = {s['id']: s for s in sources}
    edge_region_counter = Counter()
    edge_stage_missing = 0

    # 有效节点 id 集合
    node_ids = set(node_by_id)

    # ---- V07 无证据 CAUSES ----
    for e in edges:
        rel = e.get('relation', e.get('kind', ''))
        if rel == 'CAUSES':
            src = 'src:' + str(e.get('source_id', '')) if e.get('source_id') else ''
            has_ev = bool(e.get('evidence_ids')) or bool(src in source_by_id)
            if not has_ev:
                errors.append(f"[V07] CAUSES 无证据: {e['id']}")

    # ---- V01 / V08 / V03 / V06 / V05 ----
    for e in edges:
        eid = e.get('id', '?')
        evs = e.get('evidence_ids') or []
        # V01 每条关系必须有 source
        if not evs:
            errors.append(f"[V01] 该关系无 source_id/evidence_ids: {eid} ({e.get('source')} -[{e.get('relation')}]-> {e.get('target')})")
            continue
        # 校验 evidence source 是否在 source 注册表中
        for sid in evs:
            if sid not in source_by_id:
                warnings.append(f"[V08] 关系 {eid} 引用的 source {sid} 不在 sources 列表")
        # region 广度过宽 -> V02
        er = e.get('region', '')
        if er:
            edge_region_counter[er] += 1
            eb = region_breadth(er)
            # 找出该关系来源所能支持的最大广度
            max_src_breadth = -1
            for sid in evs:
                sname = sid.replace('src:', '')
                sreg = SOURCE_REGION.get(sname, '')
                max_src_breadth = max(max_src_breadth, region_breadth(sreg))
            # 引用标准/元数据类的证据本身广于实测层，不因来源广而放行“本地结论”
            if eb > max_src_breadth and max_src_breadth >= 0:
                errors.append(f"[V02] 区域可能乱升级: {eid} 边 region='{er}' 广度{eb} > 来源支持广度{max_src_breadth}")
        # V03 stage 缺失
        st = e.get('stage_ids') or []
        if not st:
            edge_stage_missing += 1
            info.append(f"[V03] 关系 {eid} 未标定生育阶段（应按'未标定'处理，不当作全部阶段适用）")
        # V06 生产期与采后串线：品质/产品实体直接与生产期 Stress 连接，但无 stage 且属采后链
        stypes = set()
        for sid in (e.get('source'), e.get('target')):
            nd = node_by_id.get(sid)
            if nd:
                stypes.add(nd.get('type'))
        if POSTHARVEST_QUALITY_TYPES & stypes and not st:
            # 采后实体上挂的“工艺/生产”型关系，若无阶段标注需提示
            if rel_str := e.get('relation'):
                if rel_str in ('OCCURS_AT_STAGE', 'MITIGATES', 'REDUCES_RISK', 'REQUIRES'):
                    warnings.append(f"[V06] 生产期与采后可能串线(注意复核): {eid} {e.get('source')}-[{rel_str}]->{e.get('target')}")
        # V05 标准元数据被当正文：来源 level 为 seed/metadata 且关系类型是结论性/规范级
        for sid in evs:
            src = source_by_id.get(sid)
            if not src:
                continue
            lv = src.get('evidence_level', '')
            if lv in NOT_CONCLUSION_LEVELS or 'metadata' in lv:
                rel = e.get('relation', e.get('kind', ''))
                if rel in ('OCCURS_AT_STAGE', 'INHIBITS', 'INCREASES_RISK', 'REDUCES_RISK', 'RECOMMENDS', 'MITIGATES'):
                    warnings.append(f"[V05] 来源 {sid} 属元数据/种子级，却被作结论性关系: {eid} -[{rel}]->")

    # ---- V04 数值单位 ----
    # 只对“小数测量值”做缺单位告警，避免把品种名(捷麦19)与年份(2013-2023)误报。
    import re
    UNIT_TOKENS = ('%', '‰', 'cm', 'mm', 'kg', 'hm', '克', '克/升', '克/厘米', '公斤', '斤',
                   '万亩', '万吨', '×10', '℃', '°C', '天', '月', '年', '粒', '万穗', '万粒子',
                   '‰', '米', '亩', 'g', 't')
    for r in ev_rows:
        txt = r.get('evidence_text', '')
        if re.search(r'\d+\.\d+', txt) and not any(u in txt for u in UNIT_TOKENS):
            warnings.append(f"[V04] 小数测量值文本缺失单位: {r.get('evidence_id')} | {r.get('source_id')} | {txt[:80]}")
    for e in edges:
        ef = e.get('effect_size')
        if ef is not None and not isinstance(ef, (int, float)):
            warnings.append(f"[V04] effect_size 非数值: {e['id']} = {ef!r}")
        if ef is not None and not e.get('effect_unit'):
            errors.append(f"[V04] 设置了 effect_size={ef!r} 但缺 effect_unit: {e['id']}")

    # ---- V08 端点完整性 ----
    for e in edges:
        if e.get('source') not in node_ids:
            errors.append(f"[V08] 边 {e['id']} 起点 {e.get('source')} 不在 nodes")
        if e.get('target') not in node_ids:
            errors.append(f"[V08] 边 {e['id']} 终点 {e.get('target')} 不在 nodes")

    # ---- V09 节点 quality ----
    for n in nodes:
        nid = n['id']
        sids = n.get('source_ids') or []
        dup = [s for s, c in Counter(sids).items() if c > 1]
        if dup:
            info.append(f"[V09] 节点 {nid} source_ids 有重复: {sorted(dup)}")
        ntype = n.get('type')
        if ntype == 'Region' and not n.get('region', '') and nid not in node_by_id:
            pass
        # Region 节点的 region 字段应等于其自身标识
        if ntype == 'Region':
            expected = nid.replace('reg:', '')
            if n.get('region', '') != expected:
                warnings.append(f"[V09] Region 节点 {nid} 的 region 字段='{n.get('region')}'，应为'{expected}'")

    # ---- 汇总 ----
    summary = {
        'dataset': graph.get('crop_id', 'huanghua_hanjianmai'),
        'nodes': len(nodes), 'edges': len(edges), 'sources': len(sources),
        'evidence_records': len(ev_rows),
        'errors': errors, 'warnings': warnings, 'info': info,
        'totals': {'errors': len(errors), 'warnings': len(warnings),
                   'info': len(info), 'stage_missing_edges': edge_stage_missing},
        'edge_region_counts': dict(edge_region_counter),
        'verdict': 'FAIL' if errors else ('WARN' if warnings else 'PASS'),
    }
    (OUT / 'graph_validation_v1.json').write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    if args.json:
        print(json.dumps(summary, ensure_ascii=False))
        return
    print(f"== graph-v1.json 校验报告 ==")
    print(f"节点 {len(nodes)} | 关系 {len(edges)} | 来源 {len(sources)} | 证据记录 {len(ev_rows)}")
    print(f"结论: {summary['verdict']}  (errors={len(errors)}, warnings={len(warnings)}, info={len(info)})")
    for tag, items in (('ERROR', errors), ('WARN', warnings)):
        for i in items:
            print(f"  [{tag}] {i}")
    if summary['verdict'] == 'FAIL':
        sys.exit(2)


if __name__ == '__main__':
    main()