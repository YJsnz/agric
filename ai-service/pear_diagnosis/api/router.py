"""Independent upload API for pear visual symptoms."""
import logging
from pathlib import Path
import tempfile
from threading import Lock

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from pear_diagnosis.vision.service import PearVisionService

router = APIRouter(prefix='/api/vision', tags=['梨叶视觉症状'])
logger = logging.getLogger(__name__)
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
FORMATS = {'JPEG': 'image/jpeg', 'PNG': 'image/png', 'WEBP': 'image/webp'}
SUFFIXES = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp'}
_vision_service = None
_inference_lock = Lock()


@router.post('/pear')
def predict_pear(file: UploadFile = File(...)):
    """上传一张 JPG/PNG/WEBP，返回视觉症状，不作病害确诊。"""
    global _vision_service
    temp_path = None
    try:
        if file.content_type not in SUFFIXES:
            raise HTTPException(400, '只支持 JPG、PNG、WEBP 图片')
        total = 0
        with tempfile.NamedTemporaryFile(delete=False, suffix=SUFFIXES[file.content_type]) as temp_file:
            temp_path = Path(temp_file.name)
            while chunk := file.file.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, '图片不能超过 20 MB')
                temp_file.write(chunk)
        if total == 0:
            raise HTTPException(400, '上传图片不能为空')
        try:
            with Image.open(temp_path) as image:
                if FORMATS.get(image.format) != file.content_type:
                    raise HTTPException(400, '图片实际格式与上传类型不一致')
                if getattr(image, 'n_frames', 1) != 1:
                    raise HTTPException(400, '请上传单帧图片')
                image.verify()
            with Image.open(temp_path) as image:
                image.load()
        except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
            raise HTTPException(400, '无法读取图片，请上传有效的 JPG、PNG 或 WEBP') from exc
        # A synchronous route runs in FastAPI's thread pool. Serialize access to
        # the shared YOLO predictor; load the weights once, on the first request.
        with _inference_lock:
            if _vision_service is None:
                _vision_service = PearVisionService()
            result = _vision_service.predict(temp_path)
        return {
            'success': True,
            'crop': result['crop'],
            'vision': {key: result[key] for key in (
                'symptom', 'symptom_cn', 'confidence', 'confidence_percent', 'model')},
            'diagnosis_level': 'symptom',
            'message': '视觉结果为症状分类，不代表病害确诊',
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Pear visual inference failed')
        raise HTTPException(500, '视觉识别暂时失败，请查看服务日志') from exc
    finally:
        file.file.close()
        if temp_path:
            temp_path.unlink(missing_ok=True)
