import logging
from functools import lru_cache
from .model_a_service import ModelAService
from .model_b_service import ModelBService
from .model_c_service import ModelCService
from .exceptions import WheatDiagnosisError
from .schemas import WheatDiagnosisResponse
from .fusion import fuse
from .decision_support import build_decision_support
from .graphrag_adapter import disabled_knowledge, run_wheat_graphrag

logger = logging.getLogger(__name__)


class WheatDiagnosisService:
    def __init__(self, model_a=None, model_b=None, model_c=None):
        self.models = {'leaf':model_a or ModelAService(), 'canopy':model_b or ModelBService(), 'head':model_c or ModelCService()}

    def diagnose(self, images, context, knowledge_enabled=True):
        logger.info('[WHEAT] diagnosis request received')
        observations = dict.fromkeys(self.models)
        warnings = []
        for name, method, component in [('leaf','predict_leaf','model_a'),('canopy','predict_canopy','model_b'),('head','detect_heads','model_c')]:
            image = images.get(name)
            if image is None:
                continue
            try:
                if isinstance(image, WheatDiagnosisError):
                    raise image
                observations[name] = getattr(self.models[name],method)(image)
            except Exception as error:
                message = str(error) if isinstance(error, WheatDiagnosisError) else '模型推理失败'
                warnings.append({'component':component,'message':message})
                logger.error('[WHEAT][%s][ERROR] %s',component.upper(),message)
        if all(v is None for v in observations.values()) and not any(v is not None for v in context.model_dump().values()):
            raise WheatDiagnosisError('所有视觉输入均处理失败', 'all_failed')
        logger.info('[WHEAT] visual inference completed')
        fused = fuse(observations, context)
        enriched = run_wheat_graphrag(fused) if knowledge_enabled else {'knowledge':disabled_knowledge()}
        warnings.extend(enriched.pop('warnings', []))
        response = WheatDiagnosisResponse(**fused, **enriched, warnings=warnings,
            decision_support=build_decision_support(observations, context.model_dump(), enriched),
            limitations=['视觉模型输出不能替代实地诊断，分类score不是疾病概率。',
                         '水分胁迫模型使用实验处理组弱标签，visual_score不是实际缺水概率。',
                         '麦穗计数为视觉估计值；没有面积尺度时不能计算真实田间密度。',
                         '知识研判受资料覆盖范围限制，不是当地确定性结论；土壤数值的测量单位尚需补充。'])
        logger.info('[WHEAT] diagnosis response generated')
        return response

    def status(self):
        return {key:self.models[name].status() for key,name in [('model_a','leaf'),('model_b','canopy'),('model_c','head')]}


@lru_cache(maxsize=1)
def get_service():
    return WheatDiagnosisService()
