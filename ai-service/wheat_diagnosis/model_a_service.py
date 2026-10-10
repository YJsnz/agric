from . import config
from .model_base import ModelService
from .schemas import WheatLeafObservation

LABELS = {'healthy':'健康叶片','rust':'锈病类视觉症状','leaf_spot_blight':'叶斑/叶枯类视觉症状',
          'nitrogen_deficiency':'缺氮类黄化视觉表现'}


class ModelAService(ModelService):
    def __init__(self, path=None):
        super().__init__(path or config.MODEL_A_PATH, 'MODEL_A', 'classify', LABELS, config.IMAGE_SIZE_A)

    def predict_leaf(self, image):
        scores = self.scores(self.run(image))
        label = max(scores, key=scores.get)
        return WheatLeafObservation(model='wheat_leaf_yolo11n_cls_v1', visual_class=label,
            label_zh=LABELS[label], score=scores[label], raw_scores=scores).model_dump(by_alias=True)
