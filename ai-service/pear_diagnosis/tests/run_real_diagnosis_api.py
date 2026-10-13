r"""Manual real HTTP test. No mocks; uses an isolated loopback port and real LLM.

Run from ai-service: .\.venv\Scripts\python.exe pear_diagnosis/tests/run_real_diagnosis_api.py
"""
import json
import mimetypes
import os
from pathlib import Path
import socket
import sys
import threading
import time

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))

import httpx
import uvicorn


def main():
    if not os.environ.get('DEEPSEEK_API_KEY'):
        raise RuntimeError('DEEPSEEK_API_KEY 未设置；不执行真实测试，不伪造回答')
    folder=ROOT.parent/'ai-training/pear-vision/data/prepared/classification/test/spot'
    images=sorted(p for p in folder.iterdir() if p.suffix.lower() in ('.jpg','.jpeg','.png','.webp'))
    if not images:
        raise FileNotFoundError(f'没有测试图片：{folder}')
    image=images[0]
    print('image_path:',image,flush=True)
    from pear_diagnosis.dev_server import app
    observation={}
    watched={('graph_web.server','load_graph'),('graphrag.graph_retriever','retrieve_subgraph'),
             ('app.vector_rag','search'),('graphrag.answer_service','generate'),
             ('graphrag.answer_service','validate_citations'),('graphrag.grounding','audit_answer')}

    def observe(frame,event,arg):
        pair=(frame.f_globals.get('__name__'),frame.f_code.co_name)
        if event=='return' and arg is not None and pair in watched:
            key='.'.join(pair)
            observation[key]=observation.get(key,0)+1

    sock=socket.socket()
    sock.bind(('127.0.0.1',0))
    port=sock.getsockname()[1]
    server=uvicorn.Server(uvicorn.Config(app,host='127.0.0.1',port=port,log_level='warning'))
    previous=threading.getprofile()
    threading.setprofile(observe)
    thread=threading.Thread(target=server.run,kwargs={'sockets':[sock]},daemon=True)
    thread.start()
    output=Path(__file__).parent/'artifacts'
    output.mkdir(exist_ok=True)
    try:
        deadline=time.monotonic()+20
        while not server.started:
            if not thread.is_alive() or time.monotonic()>deadline:
                raise RuntimeError('独立测试 HTTP 服务启动失败')
            time.sleep(.05)
        for name,data in [('without_region',{}),('with_region',{'region':'河北省沧州市泊头市'})]:
            observation.clear()
            print('请求:',name,flush=True)
            with image.open('rb') as file, httpx.Client(timeout=300,trust_env=False) as client:
                response=client.post(f'http://127.0.0.1:{port}/api/pear/diagnose',data=data,
                    files={'file':(image.name,file,mimetypes.guess_type(image.name)[0] or 'image/jpeg')})
            body=response.json()
            record={'image_path':str(image),'request_context':data,
                    'region_source':'user_provided_for_test' if data else None,
                    'http_status':response.status_code,'completed_calls':dict(observation),'response':body}
            (output/(name+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
            response.raise_for_status()
            assert response.status_code==200
            if not data:
                assert body['context']['region'] is None
                assert body['status']=='needs_clarification'
                assert body['clarification_questions']
            else:
                assert body['context']['region']==data['region']
                assert body['diagnosis_context']['context']['region']==data['region']
                for key in ('graph_web.server.load_graph','graphrag.graph_retriever.retrieve_subgraph','app.vector_rag.search'):
                    assert observation.get(key,0)>0, key
                if body['graphrag'].get('generation_called'):
                    for key in ('graphrag.answer_service.generate','graphrag.answer_service.validate_citations','graphrag.grounding.audit_answer'):
                        assert observation.get(key,0)>0,key
            print(json.dumps({'case':name,'http_status':response.status_code,'status':body['status'],
                'vision':body['vision'],'context':body['context'],
                'clarification_questions':body['clarification_questions'],
                'generation_called':body['graphrag'].get('generation_called'),
                'channels':body['graphrag'].get('channels'), 'citations':body['citations'],
                'grounding':body['grounding'],'answer':body['graphrag'].get('answer'),
                'completed_calls':dict(observation)},ensure_ascii=False,indent=2),flush=True)
    finally:
        server.should_exit=True
        thread.join(timeout=10)
        sock.close()
        threading.setprofile(previous)


if __name__=='__main__':
    main()
