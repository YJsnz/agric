"""Prepare folder-labelled pear classification data; audit existing YOLO boxes.

Run from any directory: python prepare_dataset.py [--check-only]
Requires Pillow. Source images and annotations are never modified.
YOLO class IDs are independent of classification IDs and are NOT rewritten.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
import math
from pathlib import Path
import random
import shutil
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    raise SystemExit('Pillow is required: python -m pip install Pillow')

PROJECT = Path(__file__).resolve().parents[1]
# Alphabetical order matches folder-based classification training loaders.
CLASSES = ('curl', 'healthy', 'slug', 'spot')
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}
SPLITS = ('train', 'val', 'test')


def image_fingerprint(path):
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        image.load()  # verify() alone does not decode JPEG pixels.
        rgb = ImageOps.exif_transpose(image).convert('RGB')
        digest = hashlib.sha256(str(rgb.size).encode() + rgb.tobytes()).hexdigest()
        return digest, list(image.size)


def check_yolo(path, nc):
    errors, ids = [], []
    try:
        rows = path.read_text(encoding='utf-8-sig').splitlines()
    except (OSError, UnicodeError) as error:
        return [], [str(error)]
    for number, row in enumerate(rows, 1):
        if not row.strip():
            continue
        try:
            fields = row.split()
            if len(fields) != 5:
                raise ValueError('expected class_id x_center y_center width height')
            category = int(fields[0])
            if not 0 <= category < nc:
                raise ValueError(f'class_id outside [0, {nc - 1}]')
            x, y, w, h = map(float, fields[1:])
            if not all(math.isfinite(v) for v in (x, y, w, h)):
                raise ValueError('non-finite coordinate')
            if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1):
                raise ValueError('coordinates must be normalized and box size positive')
            if min(x-w/2, y-h/2) < -1e-5 or max(x+w/2, y+h/2) > 1+1e-5:
                raise ValueError('box extends outside image')
            ids.append(category)
        except ValueError as error:
            errors.append(f'line {number}: {error}')
    return ids, errors


def split_counts(n, ratios):
    counts = [int(n*r) for r in ratios]
    for i in sorted(range(3), key=lambda i: (-(n*ratios[i]-counts[i]), i))[:n-sum(counts)]:
        counts[i] += 1
    active = [i for i, r in enumerate(ratios) if r > 0]
    if n >= len(active):
        for i in active:
            if counts[i] == 0:
                donor = max(active, key=lambda j: counts[j])
                counts[donor] -= 1
                counts[i] = 1
    if n and counts[0] == 0:
        donor = max(range(3), key=lambda i: counts[i])
        counts[donor] -= 1
        counts[0] = 1
    return counts


def prepare(args):
    source, labels, output = (p.resolve() for p in (args.source, args.labels, args.output))
    for root in (source, labels):
        if root == output or root in output.parents or output in root.parents:
            raise ValueError('Output and source/label directories must not contain each other')
    if not source.is_dir():
        raise ValueError(f'Image directory not found: {source}')
    if output.exists() and any(output.iterdir()):
        raise ValueError(f'Refusing to overwrite non-empty output: {output}')
    issues, records = [], []
    def issue(kind, path, **details):
        issues.append({'kind': kind, 'path': str(path), **details})
    label_files = sorted(labels.rglob('*.txt')) if labels.is_dir() else []
    label_index = defaultdict(list)
    for path in label_files:
        if path.name.lower() != 'classes.txt':
            label_index[path.stem.casefold()].append(path)
    if not labels.is_dir():
        issue('missing_labels_directory', labels)
    matched_labels, label_cache = set(), {}
    raw_counts = Counter()
    for name in CLASSES:
        directory = source / name
        if not directory.is_dir():
            issue('missing_class_directory', directory)
            continue
        print(f'Scanning {directory}', flush=True)
        for path in sorted(directory.rglob('*')):
            if not path.is_file():
                continue
            if path.name.startswith('._') or path.name == '.DS_Store':
                issue('macos_metadata_file', path)
                continue
            if path.suffix.lower() not in EXTENSIONS:
                issue('ignored_file', path)
                continue
            raw_counts[name] += 1
            if raw_counts[name] % 250 == 0:
                print(f'  {name}: {raw_counts[name]} image files checked', flush=True)
            relative = path.relative_to(source)
            record = {'source': str(path), 'class_name': name, 'class_id': CLASSES.index(name),
                      'relative': relative.as_posix(), 'yolo_status': 'missing', 'label': None}
            candidates = label_index.get(path.stem.casefold(), [])
            exact = labels / relative.with_suffix('.txt')
            if exact in candidates:
                candidates = [exact]
            if len(candidates) > 1:
                record['yolo_status'] = 'ambiguous'
                issue('ambiguous_label', path, candidates=list(map(str, candidates)))
            elif candidates:
                label = candidates[0]
                matched_labels.add(label)
                record['label'] = str(label)
                if label not in label_cache:
                    label_cache[label] = check_yolo(label, args.yolo_nc)
                ids, errors = label_cache[label]
                record['yolo_status'] = 'invalid' if errors else ('valid' if ids else 'empty')
                record['yolo_class_ids'] = ids
                if errors:
                    issue('invalid_label', label, image=str(path), errors=errors)
                if not errors and not ids:
                    issue('empty_label', label, image=str(path))
            else:
                issue('missing_label', path)
            try:
                record['hash'], record['size'] = image_fingerprint(path)
            except (OSError, ValueError, Image.DecompressionBombError, SyntaxError) as error:
                issue('corrupt_image', path, error=str(error))
                continue
            records.append(record)
    for label in label_files:
        if label.name.lower() != 'classes.txt' and label not in matched_labels:
            issue('orphan_label', label)
            _, errors = check_yolo(label, args.yolo_nc)
            if errors:
                issue('invalid_orphan_label', label, errors=errors)
    # Duplicate label stems may otherwise assign one box file to different images.
    label_users = defaultdict(list)
    for r in records:
        if r['label']:
            label_users[r['label']].append(r)
    for label, users in label_users.items():
        if len({r['hash'] for r in users}) > 1:
            issue('label_reused_for_distinct_images', label, images=[r['source'] for r in users])
            for r in users:
                r['yolo_status'] = 'ambiguous'
    by_hash = defaultdict(list)
    for record in records:
        by_hash[record['hash']].append(record)
    unique = defaultdict(list)
    for digest, copies in by_hash.items():
        if len({r['class_name'] for r in copies}) > 1:
            issue('conflicting_class_duplicate', copies[0]['source'], images=[r['source'] for r in copies])
            continue
        copies.sort(key=lambda r: (r['yolo_status'] != 'valid', r['relative']))
        unique[copies[0]['class_name']].append(copies[0])
        for duplicate in copies[1:]:
            issue('duplicate_image', duplicate['source'], kept=copies[0]['source'])
    manifest, counts = [], {}
    for name in CLASSES:
        rows = sorted(unique[name], key=lambda r: r['relative'])
        random.Random(f'{args.seed}:{name}').shuffle(rows)
        sizes = split_counts(len(rows), args.ratios)
        counts[name] = dict(zip(SPLITS, sizes))
        if not rows:
            issue('empty_usable_class', source / name)
        elif any(r > 0 and n == 0 for r, n in zip(args.ratios, sizes)):
            issue('too_few_images_for_splits', source / name, unique_images=len(rows))
        cursor = 0
        for split, size in zip(SPLITS, sizes):
            for r in rows[cursor:cursor+size]:
                filename = r['hash'] + Path(r['source']).suffix.lower()
                manifest.append({**r, 'split': split, 'destination': f'classification/{split}/{name}/{filename}'})
            cursor += size
    report = {'source': str(source), 'labels': str(labels), 'seed': args.seed,
              'ratios': dict(zip(SPLITS, args.ratios)), 'raw_image_counts': dict(raw_counts),
              'split_counts': counts, 'usable_images': len(manifest),
              'yolo_status_counts': dict(Counter(r['yolo_status'] for r in records)),
              'yolo_class_counts': dict(Counter(i for ids, _ in label_cache.values() for i in ids)),
              'yolo_nc': args.yolo_nc, 'issue_counts': dict(Counter(i['kind'] for i in issues)),
              'issues': issues, 'check_only': args.check_only,
              'note': 'Classification labels come from directories. Existing YOLO IDs are unchanged; '
                      'they do not share the classification mapping. Missing boxes are never synthesized. '
                      'Exact decoded-pixel duplicates are removed; near duplicates are not detected.'}
    output.mkdir(parents=True, exist_ok=True)
    for name, value in [('report.json', report), ('manifest.json', manifest),
                        ('class_mapping.json', {'class_to_id': {n: i for i, n in enumerate(CLASSES)},
                                                'id_to_class': dict(enumerate(CLASSES))})]:
        (output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    if not args.check_only:
        for split in SPLITS:
            for name in CLASSES:
                (output / 'classification' / split / name).mkdir(parents=True, exist_ok=True)
        for r in manifest:
            shutil.copy2(r['source'], output / r['destination'])
            if r['yolo_status'] in ('valid', 'empty'):
                target = output / 'matched_yolo_labels' / r['split'] / r['class_name'] / (r['hash']+'.txt')
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(r['label'], target)
    print(json.dumps({'output': str(output), 'split_counts': counts, 'usable_images': len(manifest),
                      'issues': report['issue_counts']}, ensure_ascii=False, indent=2))
    fatal = any(i['kind'] in ('missing_class_directory', 'empty_usable_class') for i in issues)
    return 2 if fatal or (args.strict and issues) else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=PROJECT.parent/'Pear/leaves')
    parser.add_argument('--labels', type=Path, default=PROJECT.parent/'Pear/annotation/YOLO/leaves')
    parser.add_argument('--output', type=Path, default=PROJECT/'data/prepared')
    parser.add_argument('--ratios', nargs=3, type=float, default=(.8, .1, .1), metavar=('TRAIN', 'VAL', 'TEST'))
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--yolo-nc', type=int, default=1, help='Existing YOLO ontology size, not folder class count')
    parser.add_argument('--check-only', action='store_true', help='Write reports/manifests without copying data')
    parser.add_argument('--strict', action='store_true', help='Return exit code 2 for any reported issue')
    args = parser.parse_args()
    if args.yolo_nc < 1 or any(not math.isfinite(r) or r < 0 for r in args.ratios) or not math.isclose(sum(args.ratios), 1, abs_tol=1e-9) or args.ratios[0] <= 0:
        parser.error('ratios must be finite, nonnegative, sum to 1 and include training; yolo-nc must be positive')
    try:
        return prepare(args)
    except (ValueError, OSError) as error:
        print(f'Preparation failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
