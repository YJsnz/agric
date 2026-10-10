import os
from pathlib import Path

AGRIC_ROOT = Path(__file__).resolve().parents[2]
TRAINING_ROOTS = [AGRIC_ROOT / 'ai-training/wheat-vision', AGRIC_ROOT / 'ai-training/wheat-vision/wheat-vision']
MODEL_B_THRESHOLD = 0.37
MODEL_C_CONF_THRESHOLD = 0.25
IMAGE_SIZE_A = IMAGE_SIZE_B = 224
IMAGE_SIZE_C = 640


def model_path(letter, filename, fallback=None):
    override = os.environ.get(f'WHEAT_MODEL_{letter}_PATH')
    if override:
        return Path(override).expanduser().resolve()
    paths = [root / 'models/wheat' / filename for root in TRAINING_ROOTS]
    if fallback:
        paths += [root / fallback for root in TRAINING_ROOTS]
    return next((p.resolve() for p in paths if p.is_file()), paths[0].resolve())


MODEL_A_PATH = model_path('A', 'wheat_leaf_yolo11n_cls_v1.pt', 'runs/wheat_leaf_yolo11n_cls_v1/weights/best.pt')
MODEL_B_PATH = model_path('B', 'wheat_water_stress_yolo11n_cls_v1.pt')
MODEL_C_PATH = model_path('C', 'wheat_head_yolo11n_v1.pt', 'runs/wheat_head_yolo11n_v12/weights/best.pt')
