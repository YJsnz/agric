from contextlib import asynccontextmanager
from enum import Enum
import io
import logging
import warnings
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from . import config
from .model_loader import ModelRegistry, ModelUnavailable

class Task(str, Enum):
    leaf = 'leaf'
    fruit_ripeness = 'fruit_ripeness'

def error(status, code, message):
    return JSONResponse(status_code=status, content={'success': False, 'error': {'code': code, 'message': message}})

def create_app(registry=None):
    registry = registry if registry is not None else ModelRegistry()
    @asynccontextmanager
    async def lifespan(app):
        await run_in_threadpool(registry.load_all)
        yield
    app = FastAPI(title='Tomato visual classification service', lifespan=lifespan)
    app.state.registry = registry

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        return error(422, 'invalid_request', '请上传 image，并指定 task：leaf 或 fruit_ripeness')

    @app.get('/api/tomato/health')
    def health():
        return registry.health()

    async def decode(image):
        try:
            data = await image.read(config.MAX_BYTES + 1)
        finally:
            await image.close()
        if len(data) > config.MAX_BYTES:
            return error(413, 'image_too_large', '图片不得超过20MB')
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('error', Image.DecompressionBombWarning)
                with Image.open(io.BytesIO(data)) as im:
                    if im.width * im.height > 40_000_000:
                        return error(413, 'image_too_large', '图片像素数量超过限制')
                    im.verify()
            decoded = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
            if decoded is None:
                raise ValueError('decode failed')
        except Exception:
            return error(400, 'invalid_image', '图片无法解码')
        return decoded

    @app.post('/api/tomato/vision/analyze')
    async def analyze(image: UploadFile = File(...), task: Task = Form(...)):
        decoded = await decode(image)
        if isinstance(decoded, JSONResponse):
            return decoded
        try:
            return await run_in_threadpool(registry.predict, task.value, decoded)
        except ModelUnavailable as exc:
            return error(503, 'model_unavailable', str(exc))
        except Exception:
            logging.exception('Tomato inference failed')
            return error(500, 'inference_failed', '模型推理失败，请检查服务日志')

    @app.post('/api/tomato/diagnose')
    async def diagnose(image: UploadFile = File(...), task: Task = Form(...)):
        from .pipeline import DiagnosisPipeline
        decoded = await decode(image)
        if isinstance(decoded, JSONResponse):
            return decoded
        try:
            return await run_in_threadpool(DiagnosisPipeline(registry).diagnose, decoded, task.value)
        except ModelUnavailable as exc:
            return error(503, 'model_unavailable', str(exc))
        except Exception:
            logging.exception('Tomato diagnosis vision failed')
            return error(500, 'inference_failed', '视觉推理失败')
    return app

app = create_app()
