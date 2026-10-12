import os
from pathlib import Path

MODULE = Path(__file__).resolve().parent
AGRIC = MODULE.parents[1]
MODEL_DIR = Path(os.getenv('TOMATO_MODEL_DIR', str(AGRIC / 'ai-training/vegetable-vision/models/tomato')))
DEVICE = os.getenv('TOMATO_DEVICE', 'cpu')
MAX_BYTES = 20 * 1024 * 1024
MODELS = {
    'leaf': ('tomato_leaf_yolo11n_cls_v1', '564ff6bff3fb69f7165816682a1e24e2241f66642f5e0d083a725f28dbf886c6'),
    'fruit_ripeness': ('tomato_ripeness_yolo11n_cls_v1', '09d0c0d8d75e9c1c25a8ba59e015594000cc1169dc234bf1098cbf02f78b8b75'),
}
CLASSES = {
    'leaf': {'bacterial_spot', 'bacterial_spot_and_leaf_miner', 'healthy', 'leaf_miner', 'powdery_mildew', 'powdery_mildew_and_leaf_miner', 'whitefly'},
    'fruit_ripeness': {'green', 'breakers', 'turning', 'pink', 'light_red', 'red'},
}

def model_path(task):
    return Path(os.getenv('TOMATO_' + task.upper() + '_MODEL_PATH', str(MODEL_DIR / (MODELS[task][0] + '.pt'))))
