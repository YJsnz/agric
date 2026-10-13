import json
from unittest.mock import patch
import pytest
from .build import ROOT
from .runtime import load_graph
from .service import ask,eligible,extract
from .validate import validate
from graphrag.entity_extractor import ExtractionError

@pytest.mark.parametrize('label',['yellow_leaf','anthracnose','insect_damage','powdery_mildew'])
def test_visual_directions_have_real_paths_and_quotes(label):
    mappings=json.loads((ROOT/'knowledge_graph/jujube_visual_entity_mapping.json').read_text(encoding='utf-8'))
    m=next(m for m in mappings if m['visual_key']=='leaf:'+label)
    with patch('jujube.service.generate',side_effect=ExtractionError('injected unavailable')):
        r=ask('叶片视觉异常，哪些方向需要进一步核验？',graph_backend='file',diagnosis_context={'visual_class':label,'visual_entity':{'id':m['node_id'],'type':m['node_type']}})
    assert r['paths'] and r['evidence'] and r['differential_assessment']['available']
    assert all(e['source_id'].startswith('JV') and e['evidence_level']=='L4' for e in r['evidence'])
    for e in r['evidence']:
        raw=(ROOT/e['metadata']['locator']['file']).read_text(encoding='utf-8')
        assert e['original_text'] in raw
    assert not r['local_conclusion']['available']

def test_transfer_requires_explicit_review_and_matching_visual_label():
    cs=json.loads((ROOT/'graphrag_corpus_v1/reviewed_chunks.json').read_text(encoding='utf-8'))
    c=next(c for c in cs if c['chunk_id']=='JVC_powder')
    assert not eligible(c,extract('叶片黄化'))
    assert not eligible(c,extract('果实储藏腐败'))
    assert c['metadata']['source_crop']=='观赏植物'
    assert validate()['passed']

def test_default_visual_queries_do_not_trigger_boundary_only_answers():
    from jujube_diagnosis.pipeline import query_for
    for task,label in [('leaf','anthracnose'),('fruit_freshness','rotten')]:
        q,_=query_for({'task':task,'class':label},{})
        assert '确认' not in q and '食用' not in q
