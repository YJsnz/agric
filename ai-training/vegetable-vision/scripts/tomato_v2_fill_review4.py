import csv, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_4.csv')

same_leaf_ids = {'Y035', 'Y050', 'Y052', 'Y079', 'Y085', 'Y101', 'Y102', 'Y103'}

with open(CSV, encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))

for r in rows:
    rid = r['review_id']
    if r['same_class'] != 'True':
        r['decision'] = 'confirmed_cross_label_source_conflict'
        r['group_type'] = 'same_source_transform'
        r['review_note'] = '看图确认同源/同图，跨标签冲突；双方隔离，不猜测正确标签'
    else:
        r['decision'] = 'confirmed_same_source'
        r['group_type'] = 'same_leaf' if rid in same_leaf_ids else 'same_source_transform'
        r['review_note'] = '看图确认同叶片/同源变换，同标签；并入约束同一 split'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

from collections import Counter
print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('group_types:', dict(Counter(r['group_type'] for r in rows)))
print('written', len(rows))