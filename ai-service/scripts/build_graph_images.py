"""Import exact named pictures and build the static dashboard image registry.

No image editing or diagnosis is performed. User pictures remain unverified.
Run: .venv/Scripts/python.exe scripts/build_graph_images.py --input-dir PATH
"""
import argparse
import base64
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'data/botou_yali/evidence/images'
JS = ROOT / 'graph_web/static/dashboard.js'
TOPICS = {'果子有问题': 'pear', '叶子有斑': 'spots', '叶子卷了': 'leaf',
          '看见虫子': 'bug', '树长得不好': 'tree', '果子不好存': 'crate'}
EXTRAS = {
    '黑色小斑点': {'names': ['叶片黑色斑点'], 'illustration': '黑色小斑点'},
    '大片褐色斑': {'illustration': '大片褐色斑'},
    '叶片卷曲': {'names': ['叶片卷曲'], 'illustration': '叶片卷曲'},
    '看不出来_健康叶': {'illustration': '健康叶参考'},
    '黑星病详情主图': {'names': ['黑星病', '梨黑星病']},
    '典型症状_黑色小斑点': {'gallery': '黑星病', 'caption': '黑色小斑点'},
    '典型症状_病斑扩大': {'gallery': '黑星病', 'caption': '病斑扩大'},
    '典型症状_严重叶片枯黄': {'gallery': '黑星病', 'caption': '叶片枯黄'},
}
DISEASES = ['青绿霉病', '褐腐病', '轮纹病', '梨黑星病', '梨衰退病',
            '梨细菌性花枯病', '梨火疫病', '蜜环菌根颈腐烂病',
            '冷害', '二氧化碳伤害', '鸭梨果心褐变进程']
MIME = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
START, END = '// BEGIN GENERATED GRAPH IMAGES', '// END GENERATED GRAPH IMAGES'


def build(input_dir=None):
    manifest_path = LIBRARY / 'image-manifest.json'
    records = json.loads(manifest_path.read_text(encoding='utf-8'))
    unmatched = []
    if input_dir:
        incoming = Path(input_dir).resolve(strict=True)
        from PIL import Image
        candidates = {}
        for path in sorted(incoming.iterdir()):
            if path.suffix.lower() not in MIME or not path.is_file():
                continue
            name = re.sub(r'^\d+[_\-\s]+', '', path.stem)
            if name not in TOPICS and name not in DISEASES and name not in EXTRAS and name != '黑星病':
                unmatched.append(path.name)
                continue
            if name in candidates:
                raise ValueError(f'Duplicate image name: {name}')
            with Image.open(path) as image:
                image.verify()
            candidates[name] = path
        for name, path in candidates.items():
            destination = LIBRARY / ('user-' + name + path.suffix.lower())
            if path != destination.resolve():
                shutil.copyfile(path, destination)
            record = {'filename': destination.name, 'subject': name + '（用户提供示意图）',
                      'original_filename': path.name,
                      'author': '用户提供', 'source': '', 'license': '待用户确认',
                      'license_url': '', 'review_status': '图片病种与拍摄地点未经核验，仅供参考',
                      'status': 'local', 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}
            if name in TOPICS:
                record['topic'] = TOPICS[name]
                records = [r for r in records if r.get('topic') != TOPICS[name]]
            elif name in EXTRAS:
                record.update(EXTRAS[name])
                records = [r for r in records if r['filename'] != record['filename'] and not set(r.get('names', [])) & set(record.get('names', []))]
            else:
                record['names'] = ['黑星病', '梨黑星病'] if name in ['黑星病', '梨黑星病'] else [name]
                records = [r for r in records if not set(r.get('names', [])) & set(record['names'])]
            records.append(record)
        manifest_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        (LIBRARY / 'unmatched-files.json').write_text(json.dumps(unmatched, ensure_ascii=False, indent=2), encoding='utf-8')
    nodes, topics, illustrations, galleries = {}, {}, {}, {}
    for record in records:
        path = LIBRARY / record['filename']
        if record['status'] != 'local' or not path.is_file():
            continue
        entry = dict(record, src='data:' + MIME[path.suffix.lower()] + ';base64,' + base64.b64encode(path.read_bytes()).decode())
        for name in record.get('names', []):
            nodes[name] = entry
        if record.get('topic'):
            topics[record['topic']] = entry
        if record.get('illustration'):
            illustrations[record['illustration']] = entry
        if record.get('gallery'):
            galleries.setdefault(record['gallery'], []).append(entry)
    code = JS.read_text(encoding='utf-8')
    if START in code:
        begin, rest = code.split(START, 1)
        _, end = rest.split(END, 1)
        code = begin + end.lstrip('\n')
    code = '\n'.join(line for line in code.splitlines() if not line.startswith('window.PEAR_SCAB_PHOTO=')) + '\n'
    registry = START + '\nwindow.GRAPH_NODE_IMAGES=' + json.dumps(nodes, ensure_ascii=False) + ';\n'
    registry += 'window.GRAPH_TOPIC_IMAGES=' + json.dumps(topics, ensure_ascii=False) + ';\n'
    registry += 'window.GRAPH_ILLUSTRATIONS=' + json.dumps(illustrations, ensure_ascii=False) + ';\n'
    registry += 'window.GRAPH_IMAGE_GALLERIES=' + json.dumps(galleries, ensure_ascii=False) + ';\n'
    registry += "window.PEAR_SCAB_PHOTO=window.GRAPH_NODE_IMAGES['梨黑星病']?.src;\n" + END + '\n'
    code = code.replace("'use strict';\n", "'use strict';\n" + registry, 1)
    JS.write_text(code, encoding='utf-8')
    print(f'Built {len(nodes)} node-name mappings, {len(topics)} topic images; unmatched files: {len(unmatched)}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path)
    build(parser.parse_args().input_dir)
