import csv, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_8.csv')

with open(CSV, encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))

for r in rows:
    assert r['class_a'] != r['class_b'], r['review_id']
    r['decision'] = 'confirmed_cross_label_source_conflict'
    r['group_type'] = 'same_source_transform'
    r['review_note'] = 'pHash0/dHash0/对齐corr>=0.999确认同源却跨标签；双方隔离，不猜正确标签'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])

with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('written', len(rows))
