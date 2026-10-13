"""Manual real ASGI + YOLO + Neo4j + FAISS + DeepSeek diagnostic test. No mocks."""
import json
import logging
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from fastapi.testclient import TestClient
from main import app
from wheat_diagnosis.config import TRAINING_ROOTS


def first_image(folder):
    return next(p for p in sorted(folder.rglob('*')) if p.suffix.lower() in {'.png','.jpg','.jpeg'})


def main():
    logging.basicConfig(level=logging.INFO)
    root=next(p for p in TRAINING_ROOTS if (p/'data/leaf_classifier/test').is_dir())
    paths={'leaf_image':first_image(root/'data/leaf_classifier/test/rust'),
           'canopy_image':first_image(root/'data/canopy_water_stress/test/water_stress'),
           'head_image':first_image(root/'data/wheat_head_detection/images/test')}
    cases=[('leaf_only',('leaf_image',),{}),('canopy_only',('canopy_image',),{}),
           ('head_only',('head_image',),{}),('all_with_context',tuple(paths),
            {'growth_stage':'灌浆期','soil_moisture':'18.2','soil_salinity':'2.1','temperature':'31.5','humidity':'72'})]
    output=Path(__file__).parent/'artifacts/real_full_diagnosis.json';output.parent.mkdir(exist_ok=True)
    results={'timestamp':datetime.now(timezone.utc).isoformat(),'mock':False,
             'context_source':'user_provided_for_test; units unspecified; no region supplied',
             'input_paths':{k:str(v) for k,v in paths.items()},'cases':{}}
    with TestClient(app) as client:
        for name,fields,data in cases:
            print('START',name,flush=True)
            files={k:(paths[k].name,paths[k].read_bytes(),'image/png' if paths[k].suffix.lower()=='.png' else 'image/jpeg') for k in fields}
            response=client.post('/api/wheat/diagnose',files=files,data={**data,'knowledge_enabled':'true'})
            body=response.json()
            results['cases'][name]={'http_status':response.status_code,'response':body}
            output.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
            assert response.status_code==200,(name,body)
            assert body['environment_context']['region'] is None
            print(json.dumps({'case':name,'http':response.status_code,'status':body['status'],
                'retrieval':body['knowledge']['retrieval'],'generation_called':body['generation_called'],
                'grounding_status':body['grounding_status'],'citations':len(body['citations']),
                'warnings':body['warnings']},ensure_ascii=False),flush=True)
    print('Saved:',output,flush=True)


if __name__=='__main__':main()
