"""Pear leaf visual-symptom classification; not a disease diagnosis."""
from pathlib import Path
import math

from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / 'models' / 'pear' / 'pear_symptom_yolo11n_cls_v1.pt'
CLASS_CN = {
    'curl': '卷叶症状',
    'healthy': '健康叶片',
    'slug': '虫害损伤',
    'spot': '叶斑症状',
}


class PearVisionService:
    def __init__(self, model_path: str | Path = MODEL_PATH):
        self.model_path = Path(model_path).resolve()
        if not self.model_path.is_file():
            raise FileNotFoundError(f'找不到鸭梨视觉模型：{self.model_path}')
        self.model = YOLO(str(self.model_path))
        if self.model.task != 'classify':
            raise ValueError(f'需要分类模型，实际模型任务为：{self.model.task}')
        names = self.model.names
        actual = list(names.values()) if isinstance(names, dict) else list(names)
        if len(actual) != 4 or set(actual) != set(CLASS_CN):
            raise ValueError(f'模型类别与梨叶症状不匹配：{actual}')

    def predict(self, image_path: str | Path) -> dict:
        path = Path(image_path).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f'找不到待识别图片：{path}')
        results = self.model.predict(source=str(path), device='cpu', verbose=False, save=False)
        if len(results) != 1 or results[0].probs is None:
            raise RuntimeError('模型未返回单张图片的分类概率')
        result = results[0]
        index = int(result.probs.top1)
        symptom = result.names[index]
        confidence = float(result.probs.top1conf.item())
        if not math.isfinite(confidence) or not 0 <= confidence <= 1:
            raise RuntimeError('模型返回了无效置信度')
        return {
            'crop': '泊头鸭梨',
            'symptom': symptom,
            'symptom_cn': CLASS_CN[symptom],
            'confidence': confidence,
            'confidence_percent': round(confidence * 100, 2),
            'model': self.model_path.stem,
        }
