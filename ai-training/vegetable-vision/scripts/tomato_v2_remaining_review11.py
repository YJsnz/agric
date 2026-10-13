"""Round 11: global same-class near-duplicate pairs not yet reviewed."""
import csv, glob, re
import numpy as np
from tomato_v2_prepare import R, OUT, read, geometry, panel, local

rows = read('tomato_model_a_exact_cleaning_v2.csv')
for r in rows:
    r['excluded'] = r['excluded'] == 'True'
v = np.load(OUT / 'features.npz')['vectors']
ph = np.array([int(r['phash'], 16) for r in rows], dtype=np.uint64)

reviewed = set()
for path in sorted(glob.glob(str(OUT / 'cross_split_review_*.csv'))) + [str(OUT / 'pair_review.csv')]:
    with open(path, encoding='utf-8-sig', newline='') as f:
        for p in csv.DictReader(f):
            try:
                a, b = int(p['a']), int(p['b'])
            except (KeyError, ValueError):
                continue
            reviewed.add((min(a, b), max(a, b)))

ids = np.array([i for i, r in enumerate(rows) if not r['excluded']])
pairs = []
for start in range(0, len(ids), 192):
    aa = ids[start:start + 192]
    sim = v[aa] @ v[ids].T
    for j, a in enumerate(aa):
        for k in np.flatnonzero(sim[j] >= .98):
            b = int(ids[k])
            if b <= a or rows[a]['normalized_class'] != rows[b]['normalized_class']:
                continue
            d = int((ph[a] ^ ph[b]).bit_count())
            if d <= 10 and (a, b) not in reviewed:
                pairs.append((a, b, d, float(sim[j, k])))
pairs.sort(key=lambda x: -x[3])

out = []
for n, (a, b, d, c) in enumerate(pairs, 1):
    ra, rb = rows[a], rows[b]
    gap = abs(int(re.findall(r'\d+', ra['filename'])[0]) - int(re.findall(r'\d+', rb['filename'])[0]))
    row = dict(a=a, b=b, class_a=ra['normalized_class'], class_b=rb['normalized_class'],
               same_class=True, cosine=c, phash_distance=d,
               dhash_distance=(int(ra['dhash'], 16) ^ int(rb['dhash'], 16)).bit_count(),
               filename_gap=gap, tier='global_same_class_near_duplicate', split_a='', split_b='',
               sift_matches=0, sift_inliers=0, sift_inlier_ratio=0., spatial_coverage=0.,
               aligned_correlation=0., review_id=f'P{n:03d}', decision='pending',
               group_type='uncertain', review_note='', reviewer='')
    row.update(geometry(a, b, rows))
    out.append(row)

fields = list(out[0])
with open(OUT / 'cross_split_review_11.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(out)
for p in out:
    panel(p, rows).save(OUT / (p['review_id'] + '.jpg'), quality=92)
print('generated', len(out), 'same-class unreviewed pairs')
for p in out:
    print(p['review_id'], rows[int(p['a'])]['image_id'], '|', rows[int(p['b'])]['image_id'], rows[int(p['a'])]['normalized_class'],
          'cos=%.4f' % p['cosine'], 'ph=%d' % p['phash_distance'], 'dh=%d' % p['dhash_distance'],
          'corr=%.3f' % p['aligned_correlation'], 'inl=%d' % p['sift_inliers'])
