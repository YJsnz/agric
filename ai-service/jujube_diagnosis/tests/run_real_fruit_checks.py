"""Opt-in real frozen-model, KG, vector and DeepSeek smoke test (no training)."""
import json
from pathlib import Path
import cv2
from fastapi.testclient import TestClient
from jujube_diagnosis.app import create_app
from jujube_diagnosis.config import AGRIC

def main():
    out=Path(__file__).parent/'results/fruit_checks'
    out.mkdir(parents=True,exist_ok=True)
    app=create_app()
    with TestClient(app) as client:
        for task,labels,dataset in [('fruit_bruise',['bruised','healthy'],'jujube_fruit_bruise_classifier_v2'),('fruit_freshness',['rotten','fresh'],'jujube_fruit_freshness_classifier_v1')]:
            for label in labels:
                for path in sorted((AGRIC/'ai-training/jujube-vision/data'/dataset/'test'/label).glob('*')):
                    if path.suffix.lower() not in ('.jpg','.jpeg','.png'):continue
                    if app.state.registry.predict(task,cv2.imread(str(path)))[0]['class']==label:break
                else:raise AssertionError('No matching real sample '+label)
                response=client.post('/api/jujube/diagnose',data={'task':task},files={'image':(path.name,path.read_bytes(),'image/jpeg')})
                assert response.status_code==200,response.text
                x=response.json();r=x['reasoning']
                (out/(label+'.json')).write_text(json.dumps({'sample':str(path),'response':x},ensure_ascii=False,indent=2),encoding='utf-8')
                print(json.dumps({'class':x['visual']['class'],'degraded':x['degraded'],'paths':len(r['paths']),'citations':len(r['citations']),'generation_called':r['generation_called'],'grounding':r['grounding'],'checks':r['differential_assessment']['available']},ensure_ascii=False),flush=True)
                assert r['differential_assessment']['available'] and r['paths']

if __name__=='__main__':main()
