"""Run one real test image through the deployed pear classifier on CPU."""
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('image', type=Path, help='待识别图片的真实路径')
    parser.add_argument('--json', action='store_true', help='结果另以 JSON 输出')
    args = parser.parse_args()
    from app.services.pear_vision_service import PearVisionService

    print('正在加载泊头鸭梨视觉模型...')
    service = PearVisionService()
    print('模型加载成功')
    print(f'正在识别：{args.image.resolve()}')
    result = service.predict(args.image)
    print('\n========== 识别结果 ==========')
    print(f"作物：{result['crop']}")
    print(f"类别：{result['symptom']}")
    print(f"症状：{result['symptom_cn']}")
    print(f"置信度：{result['confidence_percent']:.2f}%")
    print(f"模型：{result['model']}")
    print('==============================')
    print('说明：结果为视觉症状分类，不是病害确诊。')
    if args.json:
        print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
