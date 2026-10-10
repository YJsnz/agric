import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from jujube_diagnosis.app import create_app
from jujube_diagnosis import config
from jujube import service, runtime

class Registry:
    def load_all(self): pass
    def predict(self, task, image):
        return [{'class': self.label, 'label_zh': config.LABELS[task][self.label], 'confidence': self.score}]
    def health(self): return {'models': {}, 'status': 'ok'}
    models = {}
    label = 'yellow_leaf'
    score = .4

@pytest.fixture
def setup(monkeypatch):
    from jujube_diagnosis import leaf_service, bruise_service, freshness_service
    r=Registry()
    def analyze(registry, image):
        return {'prediction':{'class':r.label,'label_zh':r.label,'confidence':r.score,'topk':[]},
                'model_name':'test','model_version':'test','risk_semantics':{'type':'visual_evidence'}}
    for module in (leaf_service,bruise_service,freshness_service):monkeypatch.setattr(module,'analyze',analyze)
    f=io.BytesIO();Image.new('RGB',(32,32)).save(f,format='PNG')
    with TestClient(create_app(r)) as client:yield client,r,{'image':('x.png',f.getvalue(),'image/png')}

@pytest.mark.parametrize('task,label', [('leaf','anthracnose'),('leaf','yellow_leaf'),('fruit_bruise','bruised'),('fruit_freshness','rotten'),('fruit_freshness','fresh')])
def test_semantics(setup,monkeypatch,task,label):
    c,r,files=setup;r.label=label
    captured={}
    def ask(q,**kwargs):
        captured.update(kwargs)
        return {'status':'preliminary','answer':'待核验','evidence':[],'citations':[],'paths':[],'entities':{},'generation_called':False}
    monkeypatch.setattr(service,'ask',ask)
    resp=c.post('/api/jujube/diagnose',data={'task':task},files=files)
    assert resp.status_code==200,resp.text
    x=resp.json();assert not x['degraded'];assert x['mapped_entity']['is_diagnosis'] is False
    assert all(v is None for v in x['context'].values());assert x['risk']['level'] is None
    assert captured['diagnosis_context']['user_context']=={}
    if task=='leaf':assert '视觉证据较弱' in x['reasoning']['answer']
    if label=='yellow_leaf':assert x['reasoning']['status']=='insufficient_evidence'
    assert captured['diagnosis_context']['visual_task']==task
    if label=='bruised':assert '不能证明腐败已发生' in x['reasoning']['answer']
    if task=='fruit_freshness':assert '食品安全' in x['reasoning']['answer']

@pytest.mark.parametrize('mode',['kg','rag','llm','grounding'])
def test_degraded(setup,monkeypatch,mode):
    c,r,files=setup;r.label='bruised'
    def fail(*a,**kw):raise RuntimeError('injected outage')
    if mode=='kg':monkeypatch.setattr(runtime,'load_graph',fail)
    elif mode=='rag':monkeypatch.setattr(service,'ask',fail)
    else:
        monkeypatch.setattr(service,'ask',lambda *a,**k:{'status':'insufficient_evidence','generation_called':True,
            ('generation_error' if mode=='llm' else 'validation_error'):'injected',
            'paths':[{'edge_ids':['test']}], 'evidence':[{'source_id':'TEST','evidence_id':'E1','original_text':'测试原文'}]})
    x=c.post('/api/jujube/diagnose',data={'task':'fruit_bruise','storage_temperature':'高','notes':'user supplied'},files=files).json()
    assert x['success'] and x['degraded'];assert x['context']['storage_temperature']=='高'
    assert x['risk']['level'] is None
    if mode in ('llm','grounding'):
        assert x['reasoning']['citations'] and x['reasoning']['paths']
        assert x['reasoning']['grounding']['passed'] is None

@pytest.mark.parametrize('data,files,status', [({'task':'illegal'},True,422),({'task':'leaf'},False,422),({'task':'leaf'},'bad',400)])
def test_errors(setup,data,files,status):
    c,r,valid=setup
    response=c.post('/api/jujube/diagnose',data=data,files=valid if files is True else {'image':('bad',b'bad')} if files=='bad' else None)
    assert response.status_code==status

def test_query_preserves_context():
    from jujube_diagnosis.pipeline import query_for
    q,ctx=query_for({'class':'bruised','task':'fruit_bruise'}, {'storage_temperature':'high','humidity':None})
    assert '储藏温度=high' in q
    assert ctx=={'storage_temperature':'high'}

def test_mapping_failure(setup,monkeypatch,tmp_path):
    from jujube_diagnosis import pipeline
    monkeypatch.setattr(pipeline,'MAPPING',tmp_path/'absent.json')
    c,r,files=setup
    x=c.post('/api/jujube/diagnose',data={'task':'leaf'},files=files).json()
    assert x['degraded_mode']=='visual_mapping_unavailable' and x['mapped_entity'] is None
