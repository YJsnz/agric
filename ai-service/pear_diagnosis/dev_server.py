"""Run: python -m uvicorn pear_diagnosis.dev_server:app --host 127.0.0.1 --port 8091"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pear_diagnosis.api.router import router
from pear_diagnosis.api.diagnosis_router import router as diagnosis_router

app = FastAPI(title='泊头鸭梨多模态智能诊断服务', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(router)
app.include_router(diagnosis_router)


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'pear_diagnosis'}
