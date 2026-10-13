"""Read-only raw audit and reproducible source-stratified, similarity-group split.

No training, augmentation, relabelling, or edits to raw files. pHash candidates
are co-located conservatively, not treated as confirmed identical leaves.
"""
import argparse
import csv
import hashlib
import json
import random
import re
import shutil
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from scipy.fft import dctn

CLASSES = ['healthy', 'anthracnose', 'powdery_mildew', 'insect_damage', 'yellow_leaf']
SOURCES = ['yxmf3cd865', '58py9f3nsy']
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff', '.webp'}
ALIASES = {re.sub(r'[^a-z]', '', c): c for c in CLASSES} | {'healthyleaf': 'healthy'}
AUGMENT = re.compile(r'(^|[^a-z])(augmented|augmentation|augment|aug|rotate\d*|rotated|flip\d*|flipped|processed|split|generated)([^a-z]|$)', re.I)


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def write_csv(path, rows, fields=None):
    with path.open('w', newline='', encoding='utf-8-sig') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields or list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def audit(item):
    source, base, path = item
    rel = path.relative_to(base)
    mapped, original = 'unknown', ''
    for parent in reversed(rel.parts[:-1]):
        key = re.sub(r'[^a-z]', '', parent.lower())
        if key in ALIASES:
            mapped, original = ALIASES[key], parent
            break
    row = dict(image_id=hashlib.sha256((source + '/' + rel.as_posix()).encode()).hexdigest()[:20],
               source_dataset=source, original_path=str(path), relative_path=rel.as_posix(),
               filename=path.name, original_class=original, mapped_class=mapped,
               width='', height='', sha256=digest(path), phash='', pixel_sha256='',
               usable=False, exclude_reason='', corrupt=False, augmented=False)
    reasons = []
    if mapped == 'unknown':
        reasons.append('unknown_class')
    if AUGMENT.search(rel.as_posix()):
        reasons.append('augmented'); row['augmented'] = True
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            image.load()
            rgb = ImageOps.exif_transpose(image).convert('RGB')
            row['width'], row['height'] = rgb.size
            row['pixel_sha256'] = hashlib.sha256(str(rgb.size).encode() + rgb.tobytes()).hexdigest()
            gray = np.asarray(rgb.convert('L').resize((32, 32), Image.Resampling.LANCZOS), dtype=float)
            low = dctn(gray, type=2)[:8, :8]
            bits = low > np.median(low)
            row['phash'] = f'{int("".join("1" if b else "0" for b in bits.flat), 2):016x}'
    except Exception as error:
        row['corrupt'] = True; reasons.append('corrupt')
        row['read_error'] = type(error).__name__
    row['exclude_reason'] = ';'.join(reasons)
    row['usable'] = not reasons
    return row


class Groups:
    def __init__(self, n): self.parents = list(range(n))
    def find(self, i):
        while self.parents[i] != i:
            self.parents[i] = self.parents[self.parents[i]]; i = self.parents[i]
        return i
    def union(self, a, b): self.parents[self.find(b)] = self.find(a)


def split_groups(groups, rows):
    """Optimize class/source strata without splitting any similarity component."""
    strata = [(s, c) for s in SOURCES for c in CLASSES]
    index = {key: i for i, key in enumerate(strata)}
    vectors = {g: np.bincount([index[(rows[i]['source_dataset'], rows[i]['mapped_class'])] for i in members], minlength=10) for g, members in groups.items()}
    total = sum(vectors.values())
    target = np.array([.7, .15, .15])[:, None] * total
    best = None
    for attempt in range(150):
        rng = random.Random(42 + attempt)
        order = list(groups); rng.shuffle(order)
        order.sort(key=lambda g: -len(groups[g]) * (1 + rng.random() * .3))
        counts = np.zeros((3, 10)); assignment = {}
        for g in order:
            scores = []
            for split in range(3):
                after = counts.copy(); after[split] += vectors[g]
                scores.append(np.sum((after-target)**2 / np.maximum(target, 1)))
            chosen = int(np.argmin(scores)); counts[chosen] += vectors[g]; assignment[g] = chosen
        # Class/source coverage has precedence over proportionality.
        class_counts = counts[:, :5] + counts[:, 5:]
        source_counts = np.stack([counts[:, :5].sum(axis=1), counts[:, 5:].sum(axis=1)], axis=1)
        cost = np.sum((counts-target)**2/np.maximum(target, 1)) + 1e7 * ((class_counts == 0).sum() + (source_counts == 0).sum())
        if best is None or cost < best[0]: best = cost, assignment
    return best[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--phash-distance', type=int, default=6)
    args = parser.parse_args(); root = args.root.resolve(); raw = root/'raw'; reports = root/'reports'
    target = root/'data/jujube_leaf_classifier'
    if target.exists() and any(target.iterdir()):
        raise RuntimeError('Output already exists; refusing to overwrite an existing dataset.')
    reports.mkdir(parents=True, exist_ok=True)
    all_raw = sorted(p for p in raw.rglob('*') if p.is_file())
    before = {str(p): (p.stat().st_size, p.stat().st_mtime_ns, digest(p)) for p in all_raw}
    jobs = []
    for source in SOURCES:
        base = raw/('mendeley_' + source)
        if not base.is_dir(): raise FileNotFoundError(base)
        jobs.extend((source, base, p) for p in sorted(base.rglob('*')) if p.suffix.lower() in EXTENSIONS and p.is_file())
    print(f'Auditing {len(jobs)} images', flush=True)
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        rows = []
        for row in pool.map(audit, jobs):
            rows.append(row)
            if len(rows) % 200 == 0: print(f'Audited {len(rows)}', flush=True)
    by_hash = defaultdict(list)
    for i, row in enumerate(rows): by_hash[row['sha256']].append(i)
    exact = []
    for sha, ids in by_hash.items():
        known_labels = {rows[i]['mapped_class'] for i in ids if rows[i]['mapped_class'] != 'unknown'}
        conflict = len(known_labels) > 1
        valid = [i for i in ids if rows[i]['usable']]
        representative = min(valid, key=lambda i: rows[i]['image_id']) if valid else None
        for i in ids:
            reason = 'label_conflict' if conflict else 'duplicate_same_label' if rows[i]['usable'] and i != representative else ''
            if reason:
                rows[i]['exclude_reason'] = ';'.join(filter(None, [rows[i]['exclude_reason'], reason])); rows[i]['usable'] = False
            if len(ids) > 1: exact.append({'sha256': sha, 'image_id': rows[i]['image_id'], 'source': rows[i]['source_dataset'], 'class': rows[i]['mapped_class'], 'conflict': conflict, 'representative': i == representative and not conflict})
    groups = Groups(len(rows)); pairs = []; pixel_groups = defaultdict(list)
    valid = [i for i, row in enumerate(rows) if row['phash']]
    hashes = {i: int(rows[i]['phash'], 16) for i in valid}
    for pos, a in enumerate(valid):
        pixel_groups[rows[a]['pixel_sha256']].append(a)
        for b in valid[pos+1:]:
            distance = (hashes[a] ^ hashes[b]).bit_count()
            if distance <= args.phash_distance:
                groups.union(a, b)
                ra, rb = rows[a], rows[b]
                pairs.append(dict(image_a=ra['image_id'], image_b=rb['image_id'], source_a=ra['source_dataset'], source_b=rb['source_dataset'], class_a=ra['mapped_class'], class_b=rb['mapped_class'], phash_distance=distance, pixel_equal=ra['pixel_sha256']==rb['pixel_sha256'], rule='conservative_colocation_not_confirmed_same_leaf'))
    for ids in list(by_hash.values()) + list(pixel_groups.values()):
        for i in ids[1:]: groups.union(ids[0], i)
    components = defaultdict(list)
    for i, row in enumerate(rows): components[groups.find(i)].append(i)
    for members in components.values():
        gid = 'similarity_' + min(rows[i]['image_id'] for i in members)
        for i in members:
            rows[i]['leakage_group'] = gid
            rows[i]['group_identity'] = 'group identity unavailable'
    clean_groups = defaultdict(list)
    for i, row in enumerate(rows):
        if row['usable']: clean_groups[row['leakage_group']].append(i)
    assignment = split_groups(clean_groups, rows)
    for row in rows:
        row['split'] = ['train','val','test'][assignment[row['leakage_group']]] if row['usable'] else ''
        row['target_path'] = ''
        row.setdefault('read_error', '')
    clean = [row for row in rows if row['usable']]
    print(f'Clean {len(clean)}, near pairs {len(pairs)}, leakage groups {len(clean_groups)}', flush=True)
    # Full SHA256 plus stable path identity keeps filenames short and globally unique.
    for split in ('train','val','test'):
        for cls in CLASSES: (target/split/cls).mkdir(parents=True, exist_ok=True)
    for row in clean:
        name = f"{row['source_dataset']}__{row['mapped_class']}__{row['sha256'][:16]}__{row['image_id']}{Path(row['filename']).suffix.lower()}"
        destination = target/row['split']/row['mapped_class']/name
        shutil.copyfile(row['original_path'], destination)
        if digest(destination) != row['sha256']: raise RuntimeError('Copy hash mismatch')
        row['target_path'] = str(destination.relative_to(root))
    cross_sha = sum(len({r['split'] for r in clean if r['sha256']==sha})>1 for sha in {r['sha256'] for r in clean})
    cross_group = sum(len({rows[i]['split'] for i in members})>1 for members in clean_groups.values())
    after = {str(p): (p.stat().st_size, p.stat().st_mtime_ns, digest(p)) for p in raw.rglob('*') if p.is_file()}
    raw_changes = sum(before.get(key) != after.get(key) for key in before.keys() | after.keys())
    checks = dict(cross_split_sha256=cross_sha, cross_split_duplicate_group=cross_group, raw_changes=raw_changes,
                  target_filename_duplicate=len(clean)-len({Path(r['target_path']).name for r in clean}),
                  actual_output_images=len(list(target.rglob('*.*'))), expected_output_images=len(clean))
    for reason in ['label_conflict','augmented','corrupt','unknown_class','duplicate_same_label']:
        checks[reason+'_entered'] = sum(reason in row['exclude_reason'] for row in clean)
    assert not any(v for k,v in checks.items() if k not in {'actual_output_images','expected_output_images'}), checks
    assert checks['actual_output_images'] == len(clean)
    fields = list(rows[0])
    write_csv(reports/'model_a_raw_manifest.csv', rows, fields)
    write_csv(reports/'model_a_clean_manifest.csv', clean, fields)
    pairs.sort(key=lambda p: (p['source_a']==p['source_b'], p['class_a']==p['class_b'], p['phash_distance'], p['image_a']))
    write_csv(reports/'model_a_near_duplicate_candidates.csv', pairs, ['image_a','image_b','source_a','source_b','class_a','class_b','phash_distance','pixel_equal','rule'])
    write_csv(reports/'model_a_exact_duplicates.csv', exact, ['sha256','image_id','source','class','conflict','representative'])
    stats = []
    for stage, members in [('raw',rows),('clean',clean)]+[(s,[r for r in clean if r['split']==s]) for s in ('train','val','test')]:
        stats.append(dict(stage=stage, source='all', class_name='all', count=len(members)))
        for source in ['all']+SOURCES:
            for cls in ['all']+CLASSES:
                if source==cls=='all': continue
                stats.append(dict(stage=stage, source=source, class_name=cls, count=sum((source=='all' or r['source_dataset']==source) and (cls=='all' or r['mapped_class']==cls) for r in members)))
    write_csv(reports/'model_a_split_statistics.csv', stats)
    summary = dict(raw_total=len(rows), sources=dict(Counter(r['source_dataset'] for r in rows)),
                   excluded={reason:sum(reason in r['exclude_reason'] for r in rows) for reason in ['augmented','duplicate_same_label','label_conflict','corrupt','unknown_class']},
                   clean_total=len(clean), classes=dict(Counter(r['mapped_class'] for r in clean)),
                   splits={s:dict(total=sum(r['split']==s for r in clean), classes=dict(Counter(r['mapped_class'] for r in clean if r['split']==s)), sources=dict(Counter(r['source_dataset'] for r in clean if r['split']==s))) for s in ('train','val','test')},
                   near_duplicate_pairs=len(pairs), cross_source_near_pairs=sum(p['source_a']!=p['source_b'] for p in pairs),
                   cross_class_near_pairs=sum(p['class_a']!=p['class_b'] for p in pairs), leakage_groups=len(clean_groups),
                   largest_group=max(map(len, clean_groups.values())), checks=checks,
                   training_readiness=('not_ready_for_final_training: cross-class near candidates and conservative large components require review'
                       if any(p['class_a'] != p['class_b'] for p in pairs)
                       else 'conditional: engineering checks passed; real leaf identity and local cultivar transfer unverified'))
    (reports/'model_a_audit_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2), encoding='utf-8')
    metadata = dict(classes=CLASSES, chinese_labels=['健康叶片','炭疽病类视觉症状','白粉病类视觉症状','虫害损伤视觉表现','黄化视觉表现'], semantics='Visual symptom labels, not confirmed diagnoses or nutrient deficiency.',
                    seed=42, phash_bits=64, phash_distance=args.phash_distance, raw_snapshot=before)
    (reports/'model_a_preparation_metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2), encoding='utf-8')
    report = '''# Jujube Model A dataset audit

## Sources and scope
- https://data.mendeley.com/datasets/yxmf3cd865/4 (DOI series yxmf3cd865). Local version unverified: 1,009 images; current v4 description says 1,260, not evidence that local files are missing. Do not substitute official stated counts for measured counts.
- https://data.mendeley.com/datasets/58py9f3nsy/1 : 2,210 class-folder images plus one certificate JPEG, excluded as unknown_class. Both source pages describe original/unaugmented images, CC BY 4.0.
- These sources do not establish a Cangzhou Jinsi cultivar-specific dataset or local diagnostic validity. Attribution required. Yellowing is not a confirmed nutrient deficiency.

## Cleaning and splitting
Decode/verify every image; EXIF-corrected RGB used only in memory for pHash and pixel hashes. Raw files copied byte-for-byte, not edited. Known directory aliases only. Suspicious augmentation/path markers excluded. SHA256 label conflicts exclude every member; same-label exact copies retain one valid stable representative. No oversampling, augmentation, training, or new labels.

pHash is 64-bit DCT, Hamming distance <= 6 by default. ALL candidate edges, exact hashes and decoded-pixel equalities are unioned into conservative leakage components, including links through excluded images. Similarity alone causes no deletion. Components are not claimed to be verified same-leaf groups. Transitive grouping may over-group; pHash can miss rotations, crops and consecutive views. No reliable plant/leaf/burst metadata: **group identity unavailable**. Potential same-leaf leakage remains possible despite zero measured cross-split groups. Cross-label near pairs require review, not automatic relabelling.

Seed 42; deterministic group allocation optimizes source/class strata near 70/15/15. Components cannot cross splits. This is a source-aware internal split, NOT a held-out-source evaluation or official split. The sources share contributors/institution; two source IDs do not establish independent collection domains.

## Measured counts, split distributions and verification
```json
''' + json.dumps(summary,ensure_ascii=False,indent=2) + '''
```

## Readiness
Folders are usable for an exploratory five-class baseline only if all classes are represented. Not an unqualified final scientific evaluation: review cross-class similarity candidates, investigate source-version/count discrepancy, and validate on independent local leaves before asserting generalization. Class imbalance (especially powdery_mildew) is preserved. This task did not start training.

Exclusion counters are independent flags and may overlap (e.g. corrupt bytes with conflicting directory labels); do not subtract their sum from raw total. Exact duplicate excluded counts same-label redundant images separately from conflicting-label images.
'''
    (reports/'JUJUBE_MODEL_A_DATASET_REPORT.md').write_text(report, encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=True, indent=2), flush=True)


if __name__ == '__main__': main()
