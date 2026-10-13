import json
from unittest.mock import patch
import pytest
from .build import ROOT
from .service import ask
from .validate import validate
from graphrag.entity_extractor import ExtractionError

@pytest.mark.parametrize('task,label', [('fruit_bruise','bruised'),('fruit_bruise','healthy'),('fruit_freshness','fresh'),('fruit_freshness','rotten')])
def test_fruit_checks_are_traceable_and_survive_generation_outage(task,label):
    mappings=json.loads((ROOT/'knowledge_graph/jujube_visual_entity_mapping.json').read_text(encoding='utf-8'))
    m=next(m for m in mappings if m['visual_key']==task+':'+label)
    with patch('jujube.service.generate',side_effect=ExtractionError('test outage')):
        r=ask('果实视觉表现，需要怎样核验和处理？',graph_backend='file',diagnosis_context={'visual_task':task,'visual_class':label,'visual_entity':{'id':m['node_id'],'type':m['node_type']}})
    assert r['generation_called'] and r['paths']
    a=r['differential_assessment']
    assert a['available'] and a['kind']=='postharvest_checks'
    assert len(a['questions'])==3 and len(a['actions'])==4
    ids={e['evidence_id'] for e in r['evidence']}
    assert {e['source_id'] for e in r['evidence']}=={'JF001','JF002'}
    for e in r['evidence']:
        assert e['evidence_level']=='L3'  # "非沧州专项验证" must never become local L1.
        assert e['original_text'] in (ROOT/e['metadata']['locator']['file']).read_text(encoding='utf-8')
    for action in a['actions']:
        assert action['condition'] and set(action['evidence_ids'])<=ids
    assert not a['local_verified'] and not r['local_conclusion']['available']

def test_fruit_graph_passes_original_validator():
    assert validate()['passed']
