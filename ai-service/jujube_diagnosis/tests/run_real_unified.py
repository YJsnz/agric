"""Real frozen models + existing local KG/BGE/FAISS + configured DeepSeek."""
import json
from pathlib import Path
from unittest.mock import patch
import cv2
from fastapi.testclient import TestClient
from jujube_diagnosis.app import create_app
from jujube_diagnosis.config import AGRIC
from graphrag.entity_extractor import ExtractionError

def main():
    root=AGRIC/'ai-training/jujube-vision/data'
    out=Path(__file__).parent/'results/unified';out.mkdir(parents=True,exist_ok=True)
    app=create_app();results=[]
    cases=[('anthracnose','leaf','jujube_leaf_classifier_v3_final','anthracnose'),
           ('yellow_leaf','leaf','jujube_leaf_classifier_v3_final','yellow_leaf'),
           ('bruised','fruit_bruise','jujube_fruit_bruise_classifier_v2','bruised'),
           ('rotten','fruit_freshness','jujube_fruit_freshness_classifier_v1','rotten'),
           ('fresh','fruit_freshness','jujube_fruit_freshness_classifier_v1','fresh'),
           ('low_leaf','leaf','jujube_leaf_classifier_v3_final','anthracnose')]
    with TestClient(app) as c:
        samples={}
        for name,task,dataset,label in cases:
            for path in sorted((root/dataset/'test'/label).glob('*')):
                if path.suffix.lower() not in ('.jpg','.png','.jpeg'):continue
                pred=app.state.registry.predict(task,cv2.imread(str(path)))[0]
                if (pred['confidence']<.6 if name=='low_leaf' else pred['class']==label):break
            else:raise AssertionError('No matching sample '+name)
            samples[name]=path
            response=c.post('/api/jujube/diagnose',data={'task':task},files={'image':(path.name,path.read_bytes(),'image/jpeg')})
            assert response.status_code==200,response.text
            x=response.json();record={'case':name,'sample':str(path),'response':x}
            (out/(name+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
            summary={'case':name,'class':x['visual']['class'],'status':x['reasoning']['status'],'degraded':x['degraded'],
                     'generation_called':x['reasoning'].get('generation_called'), 'citations':len(x['reasoning'].get('citations',[])), 'grounding':x['reasoning'].get('grounding')}
            results.append(summary);print(json.dumps(summary,ensure_ascii=False),flush=True)
        (out/'health_real.json').write_text(json.dumps(c.get('/api/jujube/health').json(),ensure_ascii=False,indent=2),encoding='utf-8')
        path=samples['bruised']
        for name,target,exc in [('rag_down','jujube.service.ask',RuntimeError('injected outage')),
                                 ('deepseek_down','jujube.service.generate',ExtractionError('injected outage'))]:
            with patch(target,side_effect=exc):
                x=c.post('/api/jujube/diagnose',data={'task':'fruit_bruise'},files={'image':(path.name,path.read_bytes())}).json()
            assert x['success'] and x['degraded']
            if name=='deepseek_down':assert x['reasoning']['evidence'] and x['reasoning']['citations']
            (out/(name+'.json')).write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
        assert c.post('/api/jujube/diagnose',data={'task':'illegal'},files={'image':('x',b'x')}).status_code==422
        assert c.post('/api/jujube/diagnose',data={'task':'leaf'}).status_code==422
        (out/'health.json').write_text(json.dumps(c.get('/api/jujube/health').json(),ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'summary.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':main()
