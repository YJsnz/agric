import csv, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_11.csv')

with open(CSV, encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))

for r in rows:
    assert r['class_a'] == r['class_b'], r['review_id']
    r['decision'] = 'confirmed_same_source'
    r['group_type'] = 'same_leaf'
    r['review_note'] = '全局同类别近重复: 配准corr均高于各类别不同叶零分布上界(P009依pHash4/cos0.98); 判同叶并组'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('written', len(rows))
