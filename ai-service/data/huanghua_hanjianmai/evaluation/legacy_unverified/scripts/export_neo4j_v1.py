# -*- coding: utf-8 -*-
"""Step 6 - 将 graph-v1.json 导出为 Neo4j 导入脚本（独立命名空间）。

命名空间隔离：
  - crop_id           = huanghua_hanjianmai
  - dataset 标记       = hanjianmai_evidence_v1  (存量快照轮换为 retired_hanjianmai_evidence_v1)
  - 节点统一 KGEntity，按 domain_types 打类型标签
  - 每条关系实体化为 KGStatement，挂 SUBJECT/OBJECT/APPLICABLE_CROP/SUPPORTED_BY/APPLICABLE_STAGE
  - 生成 evaluation/neo4j_counts.json

产物：
  generated/neo4j/import.cypher        （Neo4j Browser / cypher-shell 直接执行）
  evaluation/neo4j_counts.json

注意与泊头鸭梨完全隔离：唯一标识不同、dataset 不同，可安全并存同一 Neo4j 实例。

执行：
  py scripts/export_neo4j_v1.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
GRAPH = ROOT / 'graph' / 'graph-v1.json'
GEN = ROOT / 'graphrag_kg_corpus_v1'
OUTG = GEN / 'generated' / 'neo4j'
EVAL = ROOT / 'evaluation'
OUTG.mkdir(parents=True, exist_ok=True)
EVAL.mkdir(parents=True, exist_ok=True)

CROP = 'huanghua_hanjianmai'
DATASET = 'hanjianmai_evidence_v1'
RETIRED = 'retired_hanjianmai_evidence_v1'


def literal(v: str) -> str:
    """转义 Cypher 字符串字面值。"""
    return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"


def properties(d: dict) -> str:
    parts = []
    for k, v in d.items():
        if v is None:
            parts.append(f"{k}: null")
        elif isinstance(v, bool):
            parts.append(f"{k}: {'true' if v else 'false'}")
        elif isinstance(v, (int, float)):
            parts.append(f"{k}: {v}")
        elif isinstance(v, list):
            arr = ', '.join(literal(x) if isinstance(x, str) else json.dumps(x, ensure_ascii=False) for x in v)
            parts.append(f"{k}: [{arr}]")
        else:
            parts.append(f"{k}: {literal(str(v))}")
    return '{' + ', '.join(parts) + '}'


def main():
    graph = json.loads(GRAPH.read_text(encoding='utf-8'))
    ontology = json.loads((ROOT / 'ontology' / 'ontology-v1.json').read_text(encoding='utf-8'))
    managed = sorted(set(ontology.get('domain_types', [])) | {'Crop', 'Region', 'Stage'})

    lines = []
    lines.append('// ============ 黄骅旱碱麦 KG V1 导入 ============')
    lines.append(f'// crop_id = {CROP} , dataset = {DATASET}')
    lines.append('// 仅轮换本 crop 的旧快照，不影响泊头鸭梨(pear_evidence_v2)。')
    lines.append(f'MATCH ()-[r]->() WHERE r.dataset = "{DATASET}" SET r.dataset = "{RETIRED}";')
    lines.append(f'MATCH (n:KGEntity) WHERE n.dataset = "{DATASET}" AND n.crop = "{CROP}" SET n.dataset = "{RETIRED}";')
    lines.append(f'MATCH (s:KGStatement) WHERE s.dataset = "{DATASET}" AND s.crop = "{CROP}" SET s.dataset = "{RETIRED}";')

    lines.append('CREATE CONSTRAINT kg_statement_id IF NOT EXISTS FOR (s:KGStatement) REQUIRE s.id IS UNIQUE;')
    lines.append('CREATE CONSTRAINT kg_entity_id IF NOT EXISTS FOR (n:KGEntity) REQUIRE n.id IS UNIQUE;')

    # ---- 节点 ----
    node_stack = []
    for n in graph.get('nodes', []):
        nid = n['id']
        ntype = n['type']
        props = {k: v for k, v in n.items() if k in ('name', 'region', 'description')}
        props['crop'] = CROP
        props['dataset'] = DATASET
        props['node_type'] = ntype
        node_stack.append(
            f'MERGE (n:KGEntity {{id:{literal(nid)}}}) SET n += {properties(props)}, n:{ntype};'
        )
    lines.extend(node_stack)

    # ---- 来源 ----
    for s in graph.get('sources', []):
        sid = s['id']
        props = {k: v for k, v in s.items() if k != 'id'}
        props['crop'] = CROP
        props['dataset'] = DATASET
        lines.append(f'MERGE (so:Source {{id:{literal(sid)}}}) SET so += {properties(props)}, so:Source;')

    # ---- 关系实体化 ----
    rel_stack = []
    for e in graph.get('edges', []):
        prop_keys = ('relation', 'kind', 'region', 'effect_size', 'conditions', 'review_status')
        props = {k: v for k, v in e.items() if k in prop_keys}
        props['crop'] = CROP
        props['dataset'] = DATASET
        rel_ids = e.get('stage_ids') or []
        if not isinstance(props.get('conditions'), list):
            props['conditions'] = []
        sid = f"{e['id']}:statement"
        rel_stack.append(f'MATCH (s:KGStatement {{id:{literal(sid)}}}) DETACH DELETE s;')
        rel_stack.append(f'CREATE (s:KGStatement {{id:{literal(sid)}}}) SET s += {properties(props)};')
        refs = [('SUBJECT', e['source']), ('OBJECT', e['target']), ('APPLICABLE_CROP', CROP)]
        refs += [('SUPPORTED_BY', sid2) for sid2 in (e.get('evidence_ids') or []) if graph]
        refs += [('APPLICABLE_STAGE', st) for st in (e.get('stage_ids') or [])]
        for rel_name, target in refs:
            rel_stack.append(
                f'MATCH (s:KGStatement {{id:{literal(sid)}}}), (n:KGEntity {{id:{literal(target)}}}) '
                f'MERGE (s)-[r:{rel_name}]->(n) SET r.dataset="{DATASET}";'
            )
            # 来源 Source 节点用 SUPPORTED_BY 时端点类型为 Source
            if target.startswith('src:'):
                rel_stack[-1] = rel_stack[-1].replace(':KGEntity {', ':Source {')
    lines.extend(rel_stack)

    # ---- 区域层级：确保 Region 节点的 region 归属关系直观 ----
    # （区域上下级已在证据边中表达，这里仅打印提示）

    cypher = '\n'.join(lines) + '\n'
    for name in ('import.cypher',):
        (OUTG / name).write_text(cypher, encoding='utf-8')

    counts = {
        'crop_id': CROP, 'dataset': DATASET,
        'nodes_to_import': len(graph.get('nodes', [])),
        'sources_to_import': len(graph.get('sources', [])),
        'statements_to_import': len(graph.get('edges', [])),
        'provenance_edges': len(graph.get('edges', [])) * 3 + sum(len(x.get('stage_ids') or []) for x in graph.get('edges', [])),
        'cypher_lines': len(lines),
        'note': '独立命名空间；与泊头鸭梨可并存。',
    }
    (EVAL / 'neo4j_counts.json').write_text(json.dumps(counts, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(counts, ensure_ascii=False))
    print(f'写盘: {OUTG / "import.cypher"}')


if __name__ == '__main__':
    main()