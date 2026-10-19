"""Read-only near-duplicate deep dive for the pear leaf classification set.

Builds a dHash/size/EXIF cache for every prepared image, reports the cross-split
Hamming-distance histogram, lists candidates at several thresholds, and links every
prepared file back to its original source path via prepared/manifest.json.
Writes nothing except its own JSON output.
"""
from __future__ import annotations

import collections
import json
import time
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path('ai-training/pear-vision/data/prepared')
CLASS_ROOT = ROOT / 'classification'
CLASSES = ('curl', 'healthy', 'slug', 'spot')
SPLITS = ('train', 'val', 'test')
EXIF_DATE = 36867
EXIF_MAKE = 271
EXIF_MODEL = 272
OUT = Path('deep_near_dup.json')


def dhash64(path):
    with Image.open(path) as image:
        try:
            image.draft('L', (64, 64))
        except Exception:
            pass
        grey = ImageOps.exif_transpose(image).convert('L').resize((9, 8), Image.LANCZOS)
        px = list(grey.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
    return bits


def read_meta(path):
    with Image.open(path) as im:
        size = list(im.size)
        fmt = im.format
        exif = {}
        try:
            raw = im.getexif()
            for tag, key in ((EXIF_DATE, 'datetime_original'), (EXIF_MAKE, 'make'), (EXIF_MODEL, 'model')):
                v = raw.get(tag)
                if v:
                    exif[key] = str(v)
        except Exception:
            pass
    return size, fmt, exif


def main():
    t0 = time.time()
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    hash2origin = {}
    for r in manifest:
        hash2origin.setdefault(r['hash'], {'source': r['source'], 'relative': r['relative']})
    print('manifest entries:', len(manifest), 'unique hashes:', len(hash2origin), flush=True)

    items = []
    seen = 0
    for split in SPLITS:
        for name in CLASSES:
            d = CLASS_ROOT / split / name
            if not d.is_dir():
                continue
            for p in sorted(d.iterdir()):
                if not p.is_file():
                    continue
                seen += 1
                size, fmt, exif = read_meta(p)
                items.append({
                    'split': split, 'class': name, 'name': p.name, 'stem': p.stem,
                    'rel': p.relative_to(ROOT).as_posix(),
                    'dhash': dhash64(p), 'size': size, 'format': fmt, 'exif': exif,
                    'origin': (hash2origin.get(p.stem) or {}).get('source'),
                    'origin_rel': (hash2origin.get(p.stem) or {}).get('relative'),
                })
                if seen % 300 == 0:
                    print('  ', seen, f'{time.time()-t0:.0f}s', flush=True)

    by_split = collections.defaultdict(list)
    for it in items:
        by_split[it['split']].append(it)

    pairs = (('train', 'val'), ('train', 'test'), ('val', 'test'))
    hist = collections.Counter()
    candidates = []
    for a, b in pairs:
        for ra in by_split[a]:
            for rb in by_split[b]:
                dist = (ra['dhash'] ^ rb['dhash']).bit_count()
                hist[dist] += 1
                if dist <= 12:
                    candidates.append({
                        'distance': dist, 'split_a': a, 'split_b': b,
                        'class_a': ra['class'], 'class_b': rb['class'],
                        'same_class': ra['class'] == rb['class'],
                        'image_a': ra['rel'], 'image_b': rb['rel'],
                        'size_a': ra['size'], 'size_b': rb['size'],
                        'exif_a': ra['exif'], 'exif_b': rb['exif'],
                        'origin_a': ra['origin'], 'origin_b': rb['origin'],
                        'origin_rel_a': ra['origin_rel'], 'origin_rel_b': rb['origin_rel'],
                    })
    candidates.sort(key=lambda c: c['distance'])

    thresholds = {}
    for th in (0, 2, 4, 6, 8, 10, 12):
        sel = [c for c in candidates if c['distance'] <= th]
        thresholds[str(th)] = {
            'total': len(sel),
            'same_class': sum(1 for c in sel if c['same_class']),
            'cross_class': sum(1 for c in sel if not c['same_class']),
            'pairs': collections.Counter(f"{c['split_a']}-{c['split_b']}" for c in sel),
        }

    exif_present = sum(1 for it in items if it['exif'])
    result = {
        'images': len(items),
        'exif_images': exif_present,
        'origin_linked': sum(1 for it in items if it['origin']),
        'hamming_histogram': {str(k): hist[k] for k in sorted(hist)},
        'threshold_summary': thresholds,
        'candidates_le_12': candidates,
        'distinct_origins': len({it['origin'] for it in items if it['origin']}),
        'class_size_stats': {},
    }
    for name in CLASSES:
        for split in SPLITS:
            sizes = [tuple(it['size']) for it in items if it['class'] == name and it['split'] == split]
            uniq = collections.Counter(sizes)
            result['class_size_stats'][f'{split}/{name}'] = {
                'n': len(sizes), 'distinct_sizes': len(uniq),
                'top': {f'{w}x{h}': c for (w, h), c in uniq.most_common(5)},
            }
    result['elapsed_s'] = round(time.time() - t0, 1)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'images': result['images'], 'exif_images': exif_present,
                      'origin_linked': result['origin_linked'],
                      'distinct_origins': result['distinct_origins'],
                      'thresholds': {k: v['total'] for k, v in thresholds.items()},
                      'elapsed_s': result['elapsed_s']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
