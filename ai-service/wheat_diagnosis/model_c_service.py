from . import config
from .model_base import ModelService
from .schemas import WheatHeadObservation
from .exceptions import WheatDiagnosisError


class ModelCService(ModelService):
    threshold = config.MODEL_C_CONF_THRESHOLD

    def __init__(self, path=None):
        super().__init__(path or config.MODEL_C_PATH, 'MODEL_C', 'detect', ['wheat_head'], config.IMAGE_SIZE_C)

    def detect_heads(self, image):
        result = self.run(image, conf=self.threshold, iou=.7, max_det=300)
        height, width = result.orig_shape
        boxes = []
        for coords, confidence, category in zip(result.boxes.xyxy.tolist(), result.boxes.conf.tolist(), result.boxes.cls.tolist()):
            if category != 0 or confidence < self.threshold:
                continue
            x1,y1,x2,y2 = coords
            if not (0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height):
                raise WheatDiagnosisError('模型返回无效麦穗坐标')
            boxes.append(dict(x1=x1,y1=y1,x2=x2,y2=y2,confidence=confidence))
        return WheatHeadObservation(model='wheat_head_yolo11n_v1', boxes=boxes, wheat_head_count=len(boxes),
            mean_confidence=sum(b['confidence'] for b in boxes)/len(boxes) if boxes else None,
            image_width=width,image_height=height).model_dump(by_alias=True)

    def status(self):
        return {**super().status(), 'confidence_threshold':self.threshold}
