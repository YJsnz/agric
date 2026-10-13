"""Same-host integration entry. Branch services retain their crop-specific semantics."""
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
import asyncio
from fastapi import Request
from fastapi.responses import JSONResponse

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'graph_web'))
from api import app
from pear_diagnosis.api.router import router as pear_vision
from pear_diagnosis.api.diagnosis_router import router as pear_diagnosis
from jujube_diagnosis.app import app as jujube_app
app.include_router(pear_vision)
app.include_router(pear_diagnosis)
app.mount('/jujube',jujube_app)
slots=asyncio.Semaphore(1)

@asynccontextmanager
async def lifespan(_):
    async with jujube_app.router.lifespan_context(jujube_app):
        yield
app.router.lifespan_context=lifespan

@app.middleware('http')
async def admission(request:Request,call_next):
    # Loopback binding is mandatory; the Java application authenticates public requests.
    if request.method=='GET':
        return await call_next(request)
    if slots.locked():
        return JSONResponse({'error':'多作物推理正在执行，请稍后重试'},status_code=429)
    async with slots:
        return await call_next(request)

@app.get('/api/integration/health')
def health():
    from wheat_diagnosis.service import get_service
    return {'status':'ok','source_commit':'05190eb5fb19aa339a7f70cdb30850e5a4e05164',
            'pear':{'classification_model_present':(ROOT/'models/pear/pear_symptom_yolo11n_cls_v1.pt').is_file()},
            'wheat':get_service().status(),'jujube':jujube_app.state.registry.health(),
            'vegetable':{'vision_ready':False,'stage':'data_preparation_only','knowledge_enabled':True}}

from graphrag.entity_extractor import ExtractionError
@app.exception_handler(ExtractionError)
async def model_error(request,error):
    return JSONResponse({'error':'模型没有产生可核验的作物知识回答，请检查配置或重新缩小问题范围'},status_code=503)

if __name__=='__main__':
    import uvicorn
    uvicorn.run(app,host='127.0.0.1',port=int(os.getenv('MULTICROP_PORT','8090')),workers=1)
