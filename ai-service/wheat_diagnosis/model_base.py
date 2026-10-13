import logging
import math
from pathlib import Path
from threading import RLock
from .exceptions import WheatDiagnosisError
from .image_input import normalize_image

logger = logging.getLogger(__name__)


class ModelService:
    def __init__(self, path, component, task, classes, image_size):
        self.path = Path(path).resolve()
        self.component, self.task, self.classes, self.image_size = component, task, set(classes), image_size
        self.model = None
        self.load_error = None
        self.device = None
        self._lock = RLock()

    def _load(self):
        if self.model is not None:
            return
        try:
            if not self.path.is_file():
                raise WheatDiagnosisError('模型文件不存在', 'model_missing')
            import torch
            from ultralytics import YOLO
            self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
            if self.device == 'cpu':
                logger.info('[WHEAT] CUDA unavailable, fallback to CPU')
            model = YOLO(str(self.path))
            if model.task != self.task or set(model.names.values()) != self.classes:
                raise WheatDiagnosisError('模型任务或类别与配置不匹配', 'model_schema_mismatch')
            self.model, self.load_error = model, None
            logger.info('[WHEAT][%s] loaded threshold/conf=%s', self.component, getattr(self, 'threshold', None))
        except Exception as error:
            self.load_error = str(error) if isinstance(error, WheatDiagnosisError) else '模型加载失败'
            logger.error('[WHEAT][%s][ERROR] %s', self.component, self.load_error)
            raise WheatDiagnosisError(self.load_error, 'model_load_failed') from error

    def run(self, image, **kwargs):
        image = normalize_image(image)
        with self._lock:
            self._load()
            try:
                results = self.model.predict(image, imgsz=self.image_size, device=self.device, workers=0,
                                             save=False, verbose=False, augment=False, half=False, **kwargs)
                if len(results) != 1:
                    raise ValueError('Expected one result')
                return results[0]
            except Exception as error:
                logger.error('[WHEAT][%s][ERROR] inference failed (%s)', self.component, type(error).__name__)
                raise WheatDiagnosisError('模型推理失败') from error

    def status(self):
        with self._lock:
            return {'model_path': str(self.path), 'path': str(self.path), 'loaded': self.model is not None,
                    'load_error': self.load_error, 'device': self.device, 'exists': self.path.is_file()}

    def scores(self, result):
        if result.probs is None:
            raise WheatDiagnosisError('分类模型未返回得分')
        scores = {name: float(result.probs.data[index]) for index, name in result.names.items()}
        if set(scores) != self.classes or any(not math.isfinite(v) or not 0 <= v <= 1 for v in scores.values()):
            raise WheatDiagnosisError('分类得分无效')
        return scores
