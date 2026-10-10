from contextlib import asynccontextmanager
import io
import logging
import warnings
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from . import config, leaf_service, bruise_service, freshness_service
from .schemas import Task, AnalyzeResponse
from .model_loader import ModelRegistry, ModelUnavailable
from .pipeline import DiagnosisPipeline

def error(status, code, message):
    return JSONResponse(status_code=status, content={'success': False, 'error': {'code': code, 'message': message}})

def create_app(registry=None):
    registry = registry if registry is not None else ModelRegistry()
    @asynccontextmanager
    async def lifespan(app):
        await run_in_threadpool(registry.load_all)
        yield

    app = FastAPI(title='Jujube visual evidence service', lifespan=lifespan)
    app.state.registry = registry
    pipeline = DiagnosisPipeline(registry)
    app.state.pipeline = pipeline

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        return error(422, 'invalid_request', '请上传 image 图片，并指定 task：leaf、fruit_bruise 或 fruit_freshness')

    @app.get('/api/jujube/health')
    def health():
        return pipeline.health()

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
            return error(400, 'invalid_image', '图片无法解码，请上传有效的图片文件')
        return decoded

    @app.post('/api/jujube/vision/analyze', response_model=AnalyzeResponse)
    async def analyze(image: UploadFile = File(...), task: Task = Form(...)):
        decoded = await decode(image)
        if isinstance(decoded, JSONResponse): return decoded
        services = {'leaf': leaf_service, 'fruit_bruise': bruise_service, 'fruit_freshness': freshness_service}
        try:
            return await run_in_threadpool(services[task.value].analyze, registry, decoded)
        except ModelUnavailable as exc:
            return error(503, 'model_unavailable', str(exc))
        except Exception:
            logging.exception('Jujube inference failed: %s', task.value)
            return error(500, 'inference_failed', '模型推理失败，请稍后重试或联系服务管理员')
    @app.post('/api/jujube/diagnose')
    async def diagnose(image: UploadFile = File(...), task: Task = Form(...),
                       temperature: str | None = Form(None), humidity: str | None = Form(None),
                       storage_temperature: str | None = Form(None), storage_humidity: str | None = Form(None),
                       storage_days: float | None = Form(None, ge=0, allow_inf_nan=False),
                       harvest_method: str | None = Form(None), transport_condition: str | None = Form(None),
                       notes: str | None = Form(None, max_length=4000)):
        context = dict(temperature=temperature, humidity=humidity, storage_temperature=storage_temperature,
                       storage_humidity=storage_humidity, storage_days=storage_days, harvest_method=harvest_method,
                       transport_condition=transport_condition, notes=notes)
        decoded = await decode(image)
        if isinstance(decoded, JSONResponse): return decoded
        try:
            return await run_in_threadpool(pipeline.diagnose, decoded, task.value, context)
        except ModelUnavailable as exc:
            return error(503, 'model_unavailable', str(exc))
        except Exception:
            logging.exception('Jujube unified inference failed')
            return error(500, 'inference_failed', '视觉推理失败，请稍后重试')
    return app

app = create_app()
