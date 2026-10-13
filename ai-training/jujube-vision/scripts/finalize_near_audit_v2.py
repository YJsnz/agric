"""Persist the assistant's visual audit; never edit raw or prepared images.

Unreviewed pairs remain uncertain. Scores alone never confirm leaf identity.
"""
import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / 'reports'
REVIEW = REPORTS / 'jujube_near_duplicate_review'
ALLOWED = {'confirmed_duplicate', 'confirmed_near_duplicate', 'background_similarity', 'uncertain', 'label_conflict'}
# Visually distinct outlines, missing tissue or venation in the reviewed galleries.
# Similar colour alone was never used to reject identity.
BACKGROUND = set(map(int, '''7 9 10 11 14 16 17 21 22 23 24 26 27 29 30 31 35 36 38 39 44 45 46
53 56 58 60 66 67 70 72 79 83 89 94 95 97 99 101
116 118 122 123 126 128 131 132 134 135 136 140 147 163 168 172 173 174 176 180 186 188 191 192
196 197 198 199 200 203 208 211 212 213 215 217 220 221 222 224
227 229 230 234 235 236 240 241 242 244 247 248 250 251 252 253 254 255 256
258 259 260 262 265 267 268 269 270 271 272 273 274 276 277 279 280 284 285 286 287'''.split()))
NEAR_NOTES = {
    288: '同一不规则叶片，叶脉和轮廓对应；跨来源缩放/压缩版本。',
    289: '大孔洞、斑点及叶片轮廓对应；跨来源裁剪/缩放版本。',
    290: '取食缺口及残留叶脉结构对应；跨来源裁剪/缩放版本。',
    291: '骨架状孔洞及阴影对应；跨来源裁剪/缩放版本。',
    292: '孔洞、红色斑块及轮廓对应；跨来源裁剪/缩放版本。',
    293: '多个特征孔洞及阴影对应；跨来源裁剪/缩放版本。',
}


def read(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def write(path, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)


def key(row):
    return row['image_a'], row['image_b']


def main():
    pairs = read(REPORTS / 'model_a_near_duplicate_candidates_v2.csv')
    sample = read(REVIEW / 'sample_review.csv')
    raw = read(REPORTS / 'model_a_raw_manifest.csv')
    clean = read(REPORTS / 'model_a_clean_manifest.csv')
    by = {r['image_id']: r for r in raw}
    clean_by = {r['image_id']: r for r in clean}
    for row in sample:
        n = int(row['review_id'][1:])
        row['reviewer'] = 'assistant_visual_review_not_expert_signoff'
        if row['confirmation'] == 'sha256_or_decoded_pixel_equality':
            row['review_note'] = 'SHA256或解码像素完全相同；标签差异按冲突处理，不选择标签。'
        elif n in NEAR_NOTES:
            row.update(review_status='confirmed_near_duplicate', confirmation='visual_outline_venation_holes_correspondence', review_note=NEAR_NOTES[n])
        elif n in BACKGROUND:
            row.update(review_status='background_similarity', confirmation='visual_distinct_leaf_structure', review_note='联系图中叶片轮廓/缺损形态不同；相似背景和构图不是同源证据。')
        else:
            row.update(review_status='uncertain', confirmation='', review_note='已查看联系图；仅凭轮廓、颜色与相似分数不能可靠确认同叶片或不同叶片，保留待复核。')
    reviewed = {key(r): r for r in sample}
    for row in pairs:
        if key(row) in reviewed:
            for name in ('review_status', 'confirmation', 'reviewer', 'review_note'):
                row[name] = reviewed[key(row)][name]
        elif not row['confirmation']:
            row.update(review_status='uncertain', reviewer='', review_note='未逐对目视确认；不根据分数阈值自动判为重复或背景误报。')
        assert row['review_status'] in ALLOWED
    write(REVIEW / 'sample_review.csv', sample)
    write(REPORTS / 'model_a_near_duplicate_candidates_v2.csv', pairs)

    parent = {i: i for i in by}
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    def union(a, b):
        parent[find(a)] = find(b)
    # Include exact duplicates without a computable pHash (e.g. corrupt files).
    for field in ('sha256', 'pixel_sha256'):
        seen = {}
        for r in raw:
            value = r.get(field)
            if value:
                if value in seen:
                    union(r['image_id'], seen[value])
                seen[value] = r['image_id']
    for r in pairs:
        if r['review_status'] in {'confirmed_duplicate', 'confirmed_near_duplicate', 'label_conflict'}:
            union(r['image_a'], r['image_b'])
    components = defaultdict(list)
    for i in by:
        components[find(i)].append(i)
    groups, ids, conflicts = [], {}, set()
    for members in components.values():
        if len(members) < 2:
            continue
        gid = 'duplicate_' + hashlib.sha256('|'.join(sorted(members)).encode()).hexdigest()[:16]
        labels = sorted({by[i]['mapped_class'] for i in members})
        conflict = len(labels) > 1
        if conflict:
            conflicts.update(members)
        splits = sorted({clean_by[i]['split'] for i in members if i in clean_by})
        groups.append(dict(duplicate_group_id=gid, size=len(members), image_ids=';'.join(sorted(members)), labels=';'.join(labels), splits=';'.join(splits), needs_expert_review=conflict, cross_split=len(splits)>1))
        ids.update({i: gid for i in members})
    assert not any(g['cross_split'] for g in groups), 'Confirmed cross-split group requires remediation'
    write(REPORTS / 'model_a_duplicate_groups_v2.csv', groups)
    manifest = []
    for r in raw:
        i = r['image_id']
        out = {**r, 'duplicate_group_id': ids.get(i, ''), 'candidate_group_id_legacy': r.get('leakage_group', ''),
               'audit_review_status': 'needs_expert_review' if i in conflicts else 'unchanged',
               'training_eligible_v2': i in clean_by and i not in conflicts,
               'existing_split': clean_by.get(i, {}).get('split', '')}
        # Do not expose the old pHash connected component as a confirmed split group.
        out.pop('leakage_group', None)
        manifest.append(out)
    write(REPORTS / 'model_a_manifest_v2.csv', manifest)
    write(REPORTS / 'model_a_label_conflicts_v2.csv', [r for r in manifest if r['image_id'] in conflicts])

    method = json.loads((REVIEW / 'method.json').read_text(encoding='utf-8'))
    largest_id = method['largest_candidate_group']
    members = [r for r in clean if r['leakage_group'] == largest_id]
    member_ids = {r['image_id'] for r in members}
    gpairs = [r for r in pairs if r['image_a'] in member_ids and r['image_b'] in member_ids]
    def distribution(rows, field):
        values = sorted(float(r[field]) for r in rows)
        return {str(p): values[round((len(values)-1)*p)] for p in (0, .25, .5, .75, 1)}
    largest = dict(group_id=largest_id, size=len(members), classification='pHash collision / background-similarity group; not a true duplicate group',
                   classes=dict(Counter(r['mapped_class'] for r in members)), sources=dict(Counter(r['source_dataset'] for r in members)),
                   image_sizes=dict(Counter(r['width']+'x'+r['height'] for r in members)), pair_count=len(gpairs),
                   pair_statuses=dict(Counter(r['review_status'] for r in gpairs)),
                   distributions={f: distribution(gpairs, f) for f in ('phash_distance','ssim','embedding_cosine')})
    (REPORTS / 'model_a_largest_phash_group_v2.json').write_text(json.dumps(largest,ensure_ascii=False,indent=2),encoding='utf-8')
    before = json.loads((REVIEW / 'before_state.json').read_text())
    checks = {}
    for name, value in before.items():
        if name in ('raw_tree','training_tree'):
            folder = ROOT / ('raw' if name=='raw_tree' else 'data/jujube_leaf_classifier')
            actual = sorted([[str(p.relative_to(ROOT)), p.stat().st_size, p.stat().st_mtime_ns] for p in folder.rglob('*') if p.is_file()])
            checks[name+'_unchanged'] = actual == sorted(value)
        else:
            checks[name+'_unchanged'] = hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == value
    assert all(checks.values()), checks
    counts = Counter(r['review_status'] for r in pairs)
    new_conflicts = sorted(conflicts & clean_by.keys())
    summary = dict(candidate_pairs=len(pairs), statuses=dict(counts), exact_pairs_including_label_conflict=counts['confirmed_duplicate']+counts['label_conflict'],
                   reviewed_pairs=len(sample), cross_class_candidates=sum(r['class_a']!=r['class_b'] for r in pairs),
                   cross_source_confirmed_near_duplicate=sum(r['review_status']=='confirmed_near_duplicate' and r['source_a']!=r['source_b'] for r in pairs),
                   cross_class_confirmed_near_duplicate=sum(r['review_status']=='confirmed_near_duplicate' and r['class_a']!=r['class_b'] for r in pairs),
                   all_raw_conflict_images=len(conflicts), newly_flagged_clean_conflict_images=new_conflicts,
                   cross_split_confirmed_duplicate=0,cross_split_confirmed_near_duplicate=0,
                   split=dict(Counter(r['split'] for r in clean)),resplit_required=False,ready_for_training=False,integrity=checks)
    (REPORTS / 'model_a_near_duplicate_summary_v2.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    lines = ['# Jujube Model A near-duplicate audit v2', '',
        '本轮是 AI 辅助目视抽查和确定性哈希审计，不冒称植物病理专家或人工审核签字。未训练、未删除图片、未重新划分。',
        '## 方法与抽样',
        'pHash 仅召回候选。所有 14749 对计算 SSIM、中心裁剪 SSIM、预训练 ImageNet CNN cosine 和尺寸比。模型权重、预处理、SSIM 定义见 review/method.json（实际位于 ju jube review 目录，链接见下）。',
        'A 最近 pHash 100 对；B 跨类别且跨源仅 1 对（不足 100，全部检查）；C 跨类别 CNN 最高 100 对；D 最大组随机 100 对（seed=42）。额外复核全部 6 对同类别跨源候选。去重后 293 对，19 张总览与 293 张单对联系图。',
        '所有联系图均已查看，跨源 7 对另查大图。不确定身份保留 uncertain；颜色差异不等于不同叶片。',
        '阈值校准结论：没有足够依据选择自动确认阈值。真实跨源裁剪对 SSIM 可低至约 0.645；不同叶片也可能获得较高 SSIM/CNN 得分。故不把未复核高分对自动确认为重复。6 对近重复由孔洞、叶脉、轮廓位置对应确认。',
        '## 全候选结果（单位：对）', '```json', json.dumps(summary,ensure_ascii=False,indent=2), '```',
        'confirmed_duplicate 不含 label_conflict；exact_pairs_including_label_conflict 才是候选集合内全部确定相同图像对数。未逐对目视的候选保持 uncertain，不由抽样外推为 background_similarity。',
        '## 最大 pHash 候选组', '```json', json.dumps(largest,ensure_ascii=False,indent=2), '```',
        '以上真实/背景数量均为已确认的候选对计数，不能相加当作独立图片数。抽样发现大量不同轮廓/缺损的叶片，足以否定 1434 张均属同源；尚不能断言全体 8634 跨类别对绝大多数均为误报。',
        '## 标签冲突与划分',
        '新增两对 SHA 不同但解码像素相同的跨标签文件：Anthracnose 与 Healthy 的 IMG_20250318_115729.jpg；Healthy 与 Insect Damage 的 IMG_20250318_115750.jpg。当前 clean 中共 4 张，均进入 needs_expert_review，training_eligible_v2=false。不擅自选择标签。',
        '其余冲突包含之前已排除的同 SHA 图及无 pHash 的损坏重复文件，所以原始冲突图片总数不等于候选冲突对数乘二。具体路径见 model_a_label_conflicts_v2.csv。',
        '仅 SHA/解码像素相同及已目视确认的近重复建立 duplicate_group_id。普通 pHash 候选不进入真实重复组。新 v2 manifest 把旧 leakage_group 改名 candidate_group_id_legacy，禁止继续把它当同源证明。',
        '已确认重复组没有跨 split；保留 train=2289、val=458、test=454。同类近重复保留原文件且绑定同一个 duplicate_group_id。',
        '**当前不具备正式训练条件。** 原训练目录仍含新增冲突 4 张；本轮按允许的 needs_expert_review 方案登记，不改原目录。后续须解决/排除冲突并由准备程序消费 v2 eligibility，不能直接对旧目录开训。未确认候选也不宣称已全部排除泄漏。',
        '## 可追溯产物',
        '- `jujube_near_duplicate_review/sample_review.csv`：293 对逐条审计及 AI reviewer 标识。',
        '- `jujube_near_duplicate_review/method.json`：固定 CNN 与 SSIM 参数。',
        '- `model_a_manifest_v2.csv`：原始元数据、真实重复组、资格与原划分。',
        '- `model_a_duplicate_groups_v2.csv`：真实重复组及跨 split 检查。',
        '- `model_a_label_conflicts_v2.csv`：全部确定冲突与路径。',
        '- `model_a_largest_phash_group_v2.json`：1434 张组的完整分布。',
        'raw 与训练图片清单、大小、修改时间以及原 manifest/统计 SHA256 均与审计前一致。没有执行训练或数据划分。', '']
    (REPORTS / 'JUJUBE_MODEL_A_NEAR_DUPLICATE_AUDIT.md').write_text('\n'.join(lines).replace('review/method.json（实际位于 ju jube review 目录，链接见下）','jujube_near_duplicate_review/method.json'),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    main()
