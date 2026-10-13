import csv, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_7.csv')

CROSS = ['V005', 'V006', 'V007', 'V008', 'V009', 'V010', 'V011', 'V012', 'V013',
         'V014', 'V015', 'V016', 'V017', 'V018']
SAME = ['V001', 'V002', 'V003', 'V004']

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
        r['review_note'] = 'pHash<=2/对齐corr>=0.974确认同源却跨标签；双方隔离，不猜正确标签'
    else:
        r['decision'] = 'confirmed_same_source'
        r['group_type'] = 'same_leaf'
        r['review_note'] = '配准叠加+零分布(不同叶corr上界0.841)确认同叶不同拍摄；并组同一split'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('written', len(rows))
