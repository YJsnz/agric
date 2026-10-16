import hashlib
import logging
import os
import threading
import numpy as np
from . import config

class ModelUnavailable(RuntimeError):
    pass

class ModelRegistry:
    def __init__(self):
        self.models = {}
        self.load_lock = threading.Lock()
        self.loaded = False
        self.errors = {}
        self.locks = {task: threading.Lock() for task in config.MODELS}

    def ensure_loaded(self):
        with self.load_lock:
            if not self.loaded:
                self.load_all()
                self.loaded = True

    def load_all(self):
        (config.MODULE / '.runtime').mkdir(parents=True, exist_ok=True)
        os.environ.setdefault('YOLO_CONFIG_DIR', str(config.MODULE / '.runtime'))
        from ultralytics import YOLO
        for task, (_, expected_hash) in config.MODELS.items():
            try:
                path = config.model_path(task)
                if not path.is_file():
                    raise FileNotFoundError('Frozen model missing: ' + str(path))
                if hashlib.sha256(path.read_bytes()).hexdigest() != expected_hash:
                    raise ValueError('Frozen model SHA256 mismatch')
                model = YOLO(str(path), task='classify')
                if model.task != 'classify' or set(model.names.values()) != config.CLASSES[task]:
                    raise ValueError('Unexpected model task or class mapping')
                model.to(config.DEVICE)
                self.models[task] = model
                self.errors.pop(task, None)
            except Exception as exc:
                self.models.pop(task, None)
                self.errors[task] = str(exc)
                logging.exception('Tomato model loading failed: %s', task)
        self.loaded = True

    def health(self):
        self.ensure_loaded()
        return {'leaf_model': 'leaf' in self.models, 'ripeness_model': 'fruit_ripeness' in self.models,
                'status': 'ok' if len(self.models) == 2 else 'degraded', 'device': config.DEVICE,
                'model_versions': {t: name for t, (name, _) in config.MODELS.items()}, 'errors': self.errors}

    def predict(self, task, image):
        self.ensure_loaded()
        if task not in self.models:
            raise ModelUnavailable('Requested tomato model is not loaded; check health endpoint')
        with self.locks[task]:
            model = self.models[task]
            result = model.predict(source=image, imgsz=224, crop_fraction=1.0, device=config.DEVICE,
                                   augment=False, half=False, save=False, verbose=False)[0]
            scores = result.probs.data.cpu().numpy().astype(float)
            if not np.isfinite(scores).all() or (scores < 0).any() or not np.isclose(scores.sum(), 1, atol=1e-4):
                raise ValueError('Invalid probability output')
            probabilities = {model.names[i]: float(p) for i, p in enumerate(scores)}
            winner = model.names[int(scores.argmax())]
        return {'task': task, 'class': winner, 'confidence': probabilities[winner],
                'probabilities': probabilities, 'model_version': config.MODELS[task][0],
                'is_diagnosis': False, 'evidence_type': 'visual_classification',
                'limitations': '视觉表现分类，不代表疾病最终确诊、食品安全或实际采收决策；尚未经青县现场验证。'}
