import hashlib
import json
import logging
import os
import threading
import numpy as np
from . import config

class ModelUnavailable(Exception):
    pass

class ModelRegistry:
    def __init__(self):
        self.models = {}
        self.metadata = {}
        self.errors = {}
        self.locks = {task: threading.Lock() for task in config.MODEL_NAMES}

    def load_all(self):
        # No downloads, fallback checkpoints, training or weight serialization.
        os.environ.setdefault('YOLO_CONFIG_DIR', str(config.MODULE / '.runtime'))
        from ultralytics import YOLO
        for task, name in config.MODEL_NAMES.items():
            try:
                path = config.model_path(task)
                meta = json.loads(path.with_suffix('.json').read_text(encoding='utf-8-sig'))
                if meta.get('status') != 'frozen' or meta.get('model_name') != name:
                    raise ValueError('冻结配置或模型名称不匹配')
                digest = hashlib.sha256(path.read_bytes()).hexdigest()
                if digest != meta.get('model_sha256'):
                    raise ValueError('模型 SHA256 不匹配')
                model = YOLO(str(path))
                if model.task != 'classify' or set(model.names.values()) != set(config.LABELS[task]):
                    raise ValueError('模型任务或类别不匹配')
                model.to(config.DEVICE)
                self.models[task] = model
                self.metadata[task] = meta
            except Exception:
                logging.exception('Jujube model load failed: %s', task)
                self.errors[task] = '模型加载失败，请检查冻结权重、配置、SHA256及device'

    def health(self):
        return {'success': len(self.models) == 3, 'status': 'ok' if len(self.models) == 3 else 'degraded',
                'device': config.DEVICE, 'models': {t: {'loaded': t in self.models,
                'model_name': n, 'model_version': self.metadata.get(t, {}).get('version'),
                'error': self.errors.get(t)} for t, n in config.MODEL_NAMES.items()}}

    def predict(self, task, image):
        if task not in self.models:
            raise ModelUnavailable(self.errors.get(task, '模型尚未加载'))
        with self.locks[task]:
            model = self.models[task]
            result = model.predict(image, imgsz=int(self.metadata[task]['imgsz']), device=config.DEVICE,
                                   crop_fraction=1.0, half=False, augment=False, save=False, verbose=False)[0]
            scores = result.probs.data.cpu().numpy()
            if not np.isfinite(scores).all() or not np.isclose(scores.sum(), 1, atol=1e-5):
                raise ValueError('模型得分无效')
            return [{'class': model.names[int(i)], 'label_zh': config.LABELS[task][model.names[int(i)]],
                     'confidence': float(scores[i])} for i in np.argsort(-scores)]
