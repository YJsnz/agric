from . import config
from .model_base import ModelService
from .schemas import WheatCanopyObservation


class ModelBService(ModelService):
    threshold = config.MODEL_B_THRESHOLD

    def __init__(self, path=None):
        super().__init__(path or config.MODEL_B_PATH, 'MODEL_B', 'classify', ['normal','water_stress'], config.IMAGE_SIZE_B)

    def predict_canopy(self, image):
        scores = self.scores(self.run(image))
        stress = scores['water_stress'] >= self.threshold
        return WheatCanopyObservation(model='wheat_water_stress_yolo11n_cls_v1',
            visual_class='water_stress' if stress else 'normal',
            label_zh='疑似水分胁迫视觉表现' if stress else '正常冠层视觉状态',
            visual_score=scores['water_stress'], threshold=self.threshold, raw_scores=scores,
            interpretation='当前冠层视觉表现更接近花后亏缺灌溉处理组。' if stress else
                           '当前冠层视觉表现更接近正常灌溉处理组。').model_dump(by_alias=True)

    def status(self):
        return {**super().status(), 'threshold':self.threshold}
