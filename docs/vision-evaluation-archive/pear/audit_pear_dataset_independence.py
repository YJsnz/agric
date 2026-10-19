"""Read-only independence audit for the Botou pear (泊头鸭梨) leaf-symptom classification set.

Scans <prepared>/classification/{train,val,test}/{curl,healthy,slug,spot} and produces:
  1. per-split / per-class image counts;
  2. file-level SHA-256 for every image (authoritative exact-duplicate test);
  3. filename-based duplicate test. prepare_dataset.py writes each prepared file as
     "<pixel_sha256><ext>", so an identical file name across splits is a decoded-pixel
     duplicate; this is verified on a per-class sample against a real decode;
  4. unreadable / corrupt file detection;
  5. 64-bit dHash for every image (JPEG draft-accelerated) and the list of CROSS-SPLIT
     near-duplicate candidates at a configurable Hamming distance.

STRICTLY READ-ONLY: the dataset, labels and weights are never written or modified.
Near-duplicate hits are CANDIDATES for manual review, not final judgements.

Usage:
  python audit_pear_dataset_independence.py --prepared <dir> --out-json <f> --out-csv <f> \
      [--phash-distance 6] [--pixel-sample 15] [--no-dhash] [--progress-every 200]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    raise SystemExit('Pillow is required: python -m pip install Pillow')

CLASSES = ('curl', 'healthy', 'slug', 'spot')
SPLITS = ('train', 'val', 'test')
EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}


def sha256_file(path, chunk=1 << 20):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for block in iter(lambda: fh.read(chunk), b''):
            h.update(block)
    return h.hexdigest()


def pixel_hash(path):
    """Reproduce scripts/prepare_dataset.py image_fingerprint()."""
    with Image.open(path) as image:
        image.load()
        rgb = ImageOps.exif_transpose(image).convert('RGB')
        return hashlib.sha256(str(rgb.size).encode() + rgb.tobytes()).hexdigest()


def dhash64(path):
    with Image.open(path) as image:
        try:
            image.draft('L', (64, 64))
        except Exception:  # noqa: BLE001 - draft is best-effort
            pass
        grey = ImageOps.exif_transpose(image).convert('L').resize((9, 8), Image.LANCZOS)
        px = list(grey.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
    return bits


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--prepared', type=Path, required=True)
    ap.add_argument('--out-json', type=Path, required=True)
    ap.add_argument('--out-csv', type=Path, required=True)
    ap.add_argument('--phash-distance', type=int, default=6)
    ap.add_argument('--pixel-sample', type=int, default=15, help='per class/split files to re-decode and verify name==pixel hash; 0 disables')
    ap.add_argument('--no-dhash', action='store_true')
    ap.add_argument('--progress-every', type=int, default=200)
    args = ap.parse_args()

    root = args.prepared.resolve()
    class_root = root / 'classification'
    if not class_root.is_dir():
        raise SystemExit(f'classification dir not found: {class_root}')

    records, corrupt = [], []
    counts = defaultdict(lambda: defaultdict(int))
    verify = {s: {'checked': 0, 'matched': 0, 'mismatched': 0, 'details': []} for s in SPLITS}
    t0, seen = time.time(), 0

    for split in SPLITS:
        for name in CLASSES:
            d = class_root / split / name
            if not d.is_dir():
                continue
            files = sorted(p for p in d.iterdir() if p.is_file() and p.suffix.lower() in EXTS)
            for idx, path in enumerate(files):
                seen += 1
                rec = {'split': split, 'class': name, 'name': path.name,
                       'rel': path.relative_to(root).as_posix(), 'bytes': path.stat().st_size}
                try:
                    rec['sha256_file'] = sha256_file(path)
                except OSError as e:
                    rec['sha256_file'] = None
                    corrupt.append({'path': rec['rel'], 'error': f'read: {e}'})
                rec['name_stem'] = path.stem.lower()
                rec['dhash'] = None
                if not args.no_dhash:
                    try:
                        rec['dhash'] = dhash64(path)
                    except Exception as e:  # noqa: BLE001
                        corrupt.append({'path': rec['rel'], 'error': f'decode: {type(e).__name__}: {e}'})
                if args.pixel_sample and idx < args.pixel_sample:
                    try:
                        ph = pixel_hash(path)
                        verify[split]['checked'] += 1
                        if ph == rec['name_stem']:
                            verify[split]['matched'] += 1
                        else:
                            verify[split]['mismatched'] += 1
                            verify[split]['details'].append({'file': rec['rel'], 'name': rec['name_stem'], 'actual': ph})
                    except Exception as e:  # noqa: BLE001
                        corrupt.append({'path': rec['rel'], 'error': f'pixel_hash: {type(e).__name__}: {e}'})
                counts[split][name] += 1
                counts[split]['total'] += 1
                records.append(rec)
                if args.progress_every and seen % args.progress_every == 0:
                    print(f'  scanned {seen} ({time.time()-t0:.0f}s)', file=sys.stderr, flush=True)

    def group_dups(key):
        by = defaultdict(list)
        for r in records:
            v = r.get(key)
            if v:
                by[v].append(r)
        within, cross = [], {'train_val': [], 'train_test': [], 'val_test': []}
        for v, g in by.items():
            if len(g) < 2:
                continue
            splits = {x['split'] for x in g}
            if len(splits) == 1:
                within.append({'hash': v, 'split': g[0]['split'], 'files': [x['rel'] for x in g]})
            else:
                entry = {'hash': v, 'files': [x['rel'] for x in g], 'splits': sorted(splits)}
                for a, b in (('train', 'val'), ('train', 'test'), ('val', 'test')):
                    if {a, b} <= splits:
                        cross[f'{a}_{b}'].append(entry)
        return within, cross

    byte_within, byte_cross = group_dups('sha256_file')
    name_within, name_cross = group_dups('name_stem')

    near = []
    if not args.no_dhash:
        by_split = defaultdict(list)
        for r in records:
            if r['dhash'] is not None:
                by_split[r['split']].append(r)
        for a, b in (('train', 'val'), ('train', 'test'), ('val', 'test')):
            for ra in by_split[a]:
                for rb in by_split[b]:
                    dist = (ra['dhash'] ^ rb['dhash']).bit_count()
                    if dist <= args.phash_distance:
                        near.append({'split_a': a, 'image_a': ra['rel'], 'class_a': ra['class'],
                                     'split_b': b, 'image_b': rb['rel'], 'class_b': rb['class'],
                                     'dhash_distance': dist, 'same_class': ra['class'] == rb['class']})

    summary = {
        'tool': 'audit_pear_dataset_independence.py',
        'prepared_dir': str(root),
        'generated_at_epoch': int(time.time()),
        'classes': list(CLASSES),
        'splits': list(SPLITS),
        'counts': {s: dict(counts[s]) for s in SPLITS},
        'grand_total': len(records),
        'corrupt_count': len(corrupt),
        'corrupt_or_unreadable': corrupt,
        'filename_pixel_hash_rule': 'prepared file stem == sha256(str(rgb.size)+rgb.tobytes()) after exif_transpose+RGB',
        'filename_pixel_hash_verification': verify,
        'exact_duplicates_file_sha256': {'within_split': byte_within, 'cross_split': byte_cross,
                                         'cross_split_count': sum(len(v) for v in byte_cross.values())},
        'exact_duplicates_filename_pixel_hash': {'within_split': name_within, 'cross_split': name_cross,
                                                 'cross_split_count': sum(len(v) for v in name_cross.values())},
        'near_duplicate': {'method': 'dHash 64-bit (9x8 grayscale, adjacent comparison, JPEG draft)',
                           'cross_split_only': True, 'hamming_threshold': args.phash_distance,
                           'candidate_count': len(near),
                           'same_class_candidates': sum(1 for n in near if n['same_class']),
                           'cross_class_candidates': sum(1 for n in near if not n['same_class']),
                           'candidates': near},
        'manifest_present': (root / 'manifest.json').is_file(),
        'notes': [
            'Exact duplicate = identical file SHA-256, or identical decoded-pixel hash (file name).',
            'Near-duplicate hits are CANDIDATES only and require manual review; visually similar '
            'but distinct leaves of the same class are expected in field imagery.',
            'No source_group / plant-id / capture-batch metadata exists in the prepared set; '
            'the split is a per-class random 8:1:1 with seed=42, so sample-level independence is '
            'not the same as plant-level independence.',
        ],
    }
    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_json.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

    with open(args.out_csv, 'w', encoding='utf-8-sig', newline='') as fh:
        fh.write('kind,split_a,path_a,class_a,split_b,path_b,class_b,metric,value,status\n')
        for key, within, cross in (('exact_file_sha256', byte_within, byte_cross),
                                   ('exact_pixel_hash_name', name_within, name_cross)):
            for w in within:
                for f in w['files'][1:]:
                    fh.write(f'{key},{w["split"]},{w["files"][0]},,{w["split"]},{f},,hash,{w["hash"]},same_split_exact\n')
            for pair, items in cross.items():
                a, b = pair.split('_')
                for it in items:
                    fh.write(f'{key},{a},{it["files"][0]},,{b},{it["files"][1]},,hash,{it["hash"]},cross_split_exact\n')
        for n in near:
            fh.write(f'near_dhash,{n["split_a"]},{n["image_a"]},{n["class_a"]},{n["split_b"]},'
                     f'{n["image_b"]},{n["class_b"]},hamming,{n["dhash_distance"]},needs_manual_review\n')

    print(json.dumps({'counts': summary['counts'], 'grand_total': summary['grand_total'],
                      'corrupt': summary['corrupt_count'],
                      'exact_cross_split_file': summary['exact_duplicates_file_sha256']['cross_split_count'],
                      'exact_cross_split_name': summary['exact_duplicates_filename_pixel_hash']['cross_split_count'],
                      'near_candidates': summary['near_duplicate']['candidate_count'],
                      'pixel_hash_verify': {s: f'{verify[s]["matched"]}/{verify[s]["checked"]}' for s in SPLITS},
                      'elapsed_s': round(time.time() - t0, 1)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
