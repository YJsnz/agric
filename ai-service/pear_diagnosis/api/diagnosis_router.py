"""Multipart endpoint for the independent, evidence-grounded pear pipeline."""
import logging
from pathlib import Path
import tempfile
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from pear_diagnosis.context.context import PearDiagnosisContext
from pear_diagnosis.diagnosis.pipeline import PearDiagnosisPipeline

router = APIRouter(prefix='/api/pear', tags=['鸭梨统一诊断'])
logger = logging.getLogger(__name__)
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
FORMATS = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp'}
SUFFIXES = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp'}
_pipeline = PearDiagnosisPipeline()


def get_pipeline():
    return _pipeline


def optional_text(value):
    return value.strip() or None if value is not None else None


@router.post('/diagnose')
def diagnose(
    file: Annotated[UploadFile, File()],
    region: Annotated[str | None, Form(max_length=200)] = None,
    organ: Annotated[Literal['leaf'], Form()] = 'leaf',
    scene: Annotated[str | None, Form(max_length=200)] = None,
    growth_stage: Annotated[str | None, Form(max_length=100)] = None,
    temperature: Annotated[float | None, Form(allow_inf_nan=False)] = None,
    humidity: Annotated[float | None, Form(ge=0, le=100, allow_inf_nan=False)] = None,
    rainfall: Annotated[float | None, Form(ge=0, allow_inf_nan=False)] = None,
    pipeline: PearDiagnosisPipeline = Depends(get_pipeline),
):
    """Current model supports leaves only. Numeric units: °C, %RH and mm.

    needs_clarification/insufficient_evidence are HTTP 200 business outcomes.
    """
    path = None
    try:
        if file.content_type not in SUFFIXES:
            raise HTTPException(400, '只支持 JPG、PNG、WEBP 图片')
        with tempfile.NamedTemporaryFile(delete=False, suffix=SUFFIXES[file.content_type]) as temp:
            path = Path(temp.name)
            total = 0
            while block := file.file.read(1024 * 1024):
                total += len(block)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, '图片不能超过 20 MB')
                temp.write(block)
        if total == 0:
            raise HTTPException(400, '上传图片不能为空')
        try:
            with Image.open(path) as image:
                if FORMATS.get(image.format) != file.content_type:
                    raise HTTPException(400, '图片实际格式与上传类型不一致')
                if getattr(image, 'n_frames', 1) != 1:
                    raise HTTPException(400, '请上传单帧图片')
                image.verify()
            with Image.open(path) as image:
                image.load()
        except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
            raise HTTPException(400, '无法读取图片，请上传有效图片') from exc
        context = PearDiagnosisContext(
            crop='泊头鸭梨', organ=organ, region=optional_text(region),
            scene=optional_text(scene), growth_stage=optional_text(growth_stage),
            temperature=temperature, humidity=humidity, rainfall=rainfall,
        )
        return pipeline.diagnose(path, context)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Pear diagnosis pipeline failed')
        raise HTTPException(500, '诊断服务执行失败，请查看服务日志；未生成诊断结论') from exc
    finally:
        file.file.close()
        if path is not None:
            path.unlink(missing_ok=True)
