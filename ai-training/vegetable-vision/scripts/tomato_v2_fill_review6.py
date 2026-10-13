import csv, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_6.csv')

# Verdicts for round 6 (32 remaining post-split candidates).
# Evidence: cross-label pairs have pHash=0 / dHash<=1 / aligned_corr>=0.984 / SIFT>=25
#   -> same source with conflicting labels -> quarantine both sides.
# Same-class pairs had low side-by-side readability but aligned_correlation
#   0.842-0.961, all ABOVE the empirical null max for random different-leaf
#   same-class pairs (healthy max 0.814, leaf_miner max 0.764) and coherent
#   affine RANSAC -> same leaf, different shots -> union.
CROSS = ['W003', 'W004', 'W007', 'W008', 'W009', 'W010', 'W011', 'W012', 'W013',
         'W014', 'W015', 'W016', 'W018', 'W019', 'W020', 'W021', 'W022', 'W023',
         'W024', 'W025', 'W026', 'W027', 'W028', 'W029', 'W030', 'W031', 'W032']
SAME = ['W001', 'W002', 'W005', 'W006', 'W017']

VERDICT = {k: 'conflict' for k in CROSS}
VERDICT.update({k: 'same_source' for k in SAME})

with open(CSV, encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))

missing = [r['review_id'] for r in rows if r['review_id'] not in VERDICT]
assert not missing, f'missing verdicts: {missing}'

for r in rows:
    v = VERDICT[r['review_id']]
    if v == 'conflict':
        r['decision'] = 'confirmed_cross_label_source_conflict'
        r['group_type'] = 'same_source_transform'
        r['review_note'] = 'pHash0/对齐corr>=0.984确认同源却跨标签；双方隔离，不猜正确标签'
    else:
        r['decision'] = 'confirmed_same_source'
        r['group_type'] = 'same_leaf'
        r['review_note'] = '配准叠加+零分布(不同叶corr上界healthy0.814/m0.764)确认同叶不同拍摄；并组同一split'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('group_types:', dict(Counter(r['group_type'] for r in rows)))
print('written', len(rows))
