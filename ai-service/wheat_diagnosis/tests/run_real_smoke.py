"""Manual real YOLO/ASGI smoke test; does not call KG, LLM or train models."""
import json
import logging
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from fastapi.testclient import TestClient
from main import app
from wheat_diagnosis.config import TRAINING_ROOTS


def main():
    logging.basicConfig(level=logging.INFO)
    root=next(p for p in TRAINING_ROOTS if (p/'data/leaf_classifier/test').is_dir())
    paths={
        'leaf_image':next(p for p in sorted((root/'data/leaf_classifier/test').rglob('*')) if p.suffix.lower() in {'.jpg','.jpeg','.png'}),
        'canopy_image':next(p for p in sorted((root/'data/canopy_water_stress/test').rglob('*')) if p.suffix.lower() in {'.jpg','.jpeg','.png'}),
        'head_image':next(p for p in sorted((root/'data/wheat_head_detection/images/test').glob('*')) if p.suffix.lower() in {'.jpg','.jpeg','.png'})}
    client=TestClient(app)
    results={}
    for fields in [('leaf_image',),('canopy_image',),('head_image',),tuple(paths)]:
        files={key:(paths[key].name,paths[key].read_bytes(),'image/png' if paths[key].suffix.lower()=='.png' else 'image/jpeg') for key in fields}
        response=client.post('/api/wheat/diagnose',files=files,data={'knowledge_enabled':'false'})
        assert response.status_code==200,(fields,response.text)
        body=response.json();assert body['warnings']==[],body['warnings']
        assert body['environment_context']['region'] is None
        for key in ['leaf','canopy','head']:
            assert (body['visual_observations'][key] is not None)==(key+'_image' in fields)
        assert body['knowledge']['enabled'] is False
        results['+'.join(fields)]={'http_status':response.status_code,'response':body}
        print('PASS real request:',fields,flush=True)
    status=client.get('/api/wheat/models/status');assert status.status_code==200
    assert all(m['loaded'] for m in status.json().values())
    results['model_status']=status.json()
    results['input_paths']={k:str(v) for k,v in paths.items()}
    output=Path(__file__).parent/'artifacts';output.mkdir(exist_ok=True)
    (output/'real_smoke.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(status.json(),ensure_ascii=False,indent=2))


if __name__=='__main__':main()
