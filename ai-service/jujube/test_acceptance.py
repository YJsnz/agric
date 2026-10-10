import json
from unittest.mock import patch
from .build import ROOT
from .service import extract,eligible,ask
from .compat import level,paths_for
from .validate import validate
from graphrag.answer_service import GeneratedAnswer,validate_citations
from graphrag.entity_extractor import ExtractionError
import pytest

def graph():return json.loads((ROOT/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
def chunks():return json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
def test_visual_mapping_not_disease():
    m=json.loads((ROOT/'knowledge_graph/jujube_visual_entity_mapping.json').read_text(encoding='utf-8'))
    assert len(m)==9 and len({x['visual_key'] for x in m})==9
    nodes={n['id']:n for n in graph()['nodes']}
    assert all(nodes[x['node_id']]['type'] in ('VisualSymptom','FruitCondition') and not x['is_diagnosis'] for x in m)
def test_tier_region_conservative():
    assert level({'region':'河北沧州、山东乐陵、天津静海'})=='L3'
    assert level({'region':'河北'})=='L2'
    assert level({'region':None})=='L3'
def test_no_region_inference():assert extract('沧州金丝小枣黄化')['region'] is None
def test_directed_real_multihop():
    g=graph();start=next(n['id'] for n in g['nodes'] if n['name']=='成熟期连续阴雨')
    paths=paths_for(g,[start],{e['id'] for e in g['edges']})
    assert any(len(p['edge_ids'])==2 for p in paths)
    lookup={e['id']:e for e in g['edges']}
    for p in paths:
        for i,eid in enumerate(p['edge_ids']):
            assert (lookup[eid]['source'],lookup[eid]['target'])==tuple(p['node_ids'][i:i+2])
def test_cross_stage_experiment_not_water_evidence():
    c=next(c for c in chunks() if c['metadata']['scope']=='cross_stage')
    assert eligible(c,extract('碰伤后采后风险'))
    assert not eligible(c,extract('生产期水分胁迫是否影响采后品质'))
    assert not eligible(c,extract('叶片黄化'))
def test_original_provenance_and_compat_fields():
    assert validate()['passed']
    for e in graph()['edges']:
        assert all(k in e for k in ('source_type','year','original_text','normalized_claim','evidence_level_compat'))
def test_fake_citation_rejected():
    a=GeneratedAnswer(sufficient=False,conclusion='无来源[E99]',basis='',reasoning='',advice='',citations=['E99'])
    with pytest.raises(ExtractionError):validate_citations(a,[])
def test_no_evidence_no_factual_generation():
    with patch('jujube.service.load_graph',return_value=graph()),patch('jujube.service.search',return_value=[]),patch('jujube.service.generate') as generate:
        result=ask('生产期水分胁迫是否可能影响采后品质？')
    generate.assert_not_called()
    assert result['status']=='insufficient_evidence' and not result['citations']
