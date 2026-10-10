import os
from pathlib import Path

MODULE = Path(__file__).resolve().parent
AGRIC = MODULE.parents[1]
MODEL_DIR = Path(os.getenv('JUJUBE_MODEL_DIR', str(AGRIC / 'ai-training/jujube-vision/models/jujube')))
DEVICE = os.getenv('JUJUBE_DEVICE', 'cpu')
MAX_BYTES = 20 * 1024 * 1024
MODEL_NAMES = {
    'leaf': 'jujube_leaf_yolo11n_cls_v1',
    'fruit_bruise': 'jujube_fruit_bruise_yolo11n_cls_v1',
    'fruit_freshness': 'jujube_fruit_freshness_yolo11n_cls_v1',
}
LABELS = {
    'leaf': {'healthy': '健康叶片视觉状态', 'anthracnose': '炭疽病类视觉表现',
             'powdery_mildew': '白粉病类视觉表现', 'insect_damage': '虫害损伤视觉表现', 'yellow_leaf': '黄化视觉表现'},
    'fruit_bruise': {'healthy': '正常果实外观', 'bruised': '碰伤/机械损伤类视觉表现'},
    'fruit_freshness': {'fresh': '新鲜果实外观', 'rotten': '腐败/变质类视觉表现'},
}
DISCLAIMER = '仅为视觉证据，不是食品安全、是否可食用、储藏寿命、疾病最终确诊或腐败原因诊断；分类得分不是确诊概率。黄化不能直接解释为缺氮、缺铁或盐害。'

def model_path(task):
    return Path(os.getenv('JUJUBE_' + task.upper() + '_MODEL_PATH', str(MODEL_DIR / (MODEL_NAMES[task] + '.pt'))))
