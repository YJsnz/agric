import csv, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'reports', 'tomato_model_a_review_v2')
CSV = os.path.join(OUT, 'cross_split_review_5.csv')

# Reviewed verdicts from enlarged single-pair images (contact sheets too small):
#   cross-label & same source -> confirm conflict (quarantine both)
#   same-class & same leaf/source -> confirmed_same_source (union)
#   Z002 confirmed different leaves -> keep split, no constraint
VERDICT = {
    # --- cross-label same source (quarantine) ---
    'Z004': 'conflict', 'Z011': 'conflict', 'Z012': 'conflict', 'Z013': 'conflict',
    'Z014': 'conflict', 'Z015': 'conflict', 'Z016': 'conflict', 'Z017': 'conflict',
    'Z018': 'conflict', 'Z019': 'conflict', 'Z020': 'conflict', 'Z021': 'conflict',
    'Z022': 'conflict', 'Z023': 'conflict', 'Z024': 'conflict', 'Z025': 'conflict',
    'Z026': 'conflict', 'Z027': 'conflict', 'Z028': 'conflict', 'Z029': 'conflict',
    'Z030': 'conflict', 'Z031': 'conflict', 'Z032': 'conflict', 'Z033': 'conflict',
    'Z034': 'conflict', 'Z035': 'conflict', 'Z036': 'conflict', 'Z037': 'conflict',
    'Z038': 'conflict', 'Z039': 'conflict', 'Z040': 'conflict', 'Z041': 'conflict',
    'Z042': 'conflict', 'Z043': 'conflict', 'Z044': 'conflict', 'Z045': 'conflict',
    'Z047': 'conflict', 'Z048': 'conflict', 'Z049': 'conflict', 'Z050': 'conflict',
    'Z051': 'conflict', 'Z052': 'conflict', 'Z053': 'conflict', 'Z054': 'conflict',
    'Z055': 'conflict', 'Z056': 'conflict', 'Z057': 'conflict', 'Z058': 'conflict',
    # --- same-class same leaf / source (union) ---
    'Z001': 'same_source', 'Z003': 'same_source', 'Z005': 'same_source',
    'Z006': 'same_source', 'Z007': 'same_source', 'Z008': 'same_source',
    'Z009': 'same_source', 'Z010': 'same_source', 'Z046': 'same_source',
    # --- different leaves (evaluated, no constraint) ---
    'Z002': 'different',
}

with open(CSV, encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))

missing = [r['review_id'] for r in rows if r['review_id'] not in VERDICT]
assert not missing, f'missing verdicts: {missing}'

for r in rows:
    v = VERDICT[r['review_id']]
    if v == 'conflict':
        r['decision'] = 'confirmed_cross_label_source_conflict'
        r['group_type'] = 'same_source_transform'
        r['review_note'] = '放大目视确认同图/同源且跨标签；双方隔离，不猜正确标签'
    elif v == 'same_source':
        r['decision'] = 'confirmed_same_source'
        r['group_type'] = 'same_leaf' if r['review_id'] in ('Z001','Z003','Z005','Z007','Z008','Z009','Z010','Z046') else 'same_source_transform'
        r['review_note'] = '放大目视确认同叶/同源同标签；并入约束同一 split'
    else:
        r['decision'] = 'confirmed_different_leaves'
        r['group_type'] = 'not_claimed_identity'
        r['review_note'] = '放大目视为不同叶片（仅症状/背景相似）；不建组不隔离'
    r['reviewer'] = 'assistant_visual_review_not_human_expert'

fields = list(rows[0])
with open(CSV, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

print('decisions:', dict(Counter(r['decision'] for r in rows)))
print('group_types:', dict(Counter(r['group_type'] for r in rows)))
print('written', len(rows))