"""Round 8: review remaining unreviewed cross-split candidates only."""
import csv, os, re
from PIL import Image
from tomato_v2_prepare import R, OUT, read, geometry, panel

rows = read('tomato_model_a_exact_cleaning_v2.csv')
for r in rows:
    r['excluded'] = r['excluded'] == 'True'
id2idx = {r['image_id']: i for i, r in enumerate(rows)}

with open(R / 'tomato_model_a_remaining_cross_split_candidates_v2.csv', encoding='utf-8-sig', newline='') as f:
    remaining = [p for p in csv.DictReader(f) if p['review_status'] == 'unverified_candidate']

out = []
for n, p in enumerate(remaining, 1):
    a = id2idx[p['image_a']]
    b = id2idx[p['image_b']]
    ra, rb = rows[a], rows[b]
    ph = int(p['phash_distance'])
    dh = (int(ra['dhash'], 16) ^ int(rb['dhash'], 16)).bit_count()
    gap = abs(int(re.findall(r'\d+', ra['filename'])[0]) - int(re.findall(r'\d+', rb['filename'])[0]))
    row = dict(a=a, b=b, class_a=ra['normalized_class'], class_b=rb['normalized_class'],
               same_class=ra['normalized_class'] == rb['normalized_class'],
               cosine=float(p['cosine']), phash_distance=ph, dhash_distance=dh, filename_gap=gap,
               tier='post_split_high_risk', split_a=p['split_a'], split_b=p['split_b'],
               sift_matches=0, sift_inliers=0, sift_inlier_ratio=0., spatial_coverage=0.,
               aligned_correlation=0., review_id=f'U{n:03d}', decision='pending',
               group_type='uncertain', review_note='', reviewer='')
    row.update(geometry(a, b, rows))
    out.append(row)

fields = list(out[0])
with open(OUT / 'cross_split_review_8.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(out)
for p in out:
    panel(p, rows).save(OUT / (p['review_id'] + '.jpg'), quality=92)
print('generated', len(out), 'pairs:', [p['review_id'] for p in out])
