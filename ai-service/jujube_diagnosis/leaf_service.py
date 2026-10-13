from .config import DISCLAIMER, MODEL_NAMES

def analyze(registry, image, task='leaf'):
    scores = registry.predict(task, image)
    return dict(success=True, crop='jujube', task=task, model_name=MODEL_NAMES[task],
                model_version=registry.metadata[task]['version'],
                prediction={**scores[0], 'topk': scores},
                risk_semantics={'type': 'leaf visual symptom evidence' if task == 'leaf' else 'postharvest visual risk evidence',
                                'is_diagnosis': False}, disclaimer=DISCLAIMER)
