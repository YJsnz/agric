"""Stage 11: persist human review, fix the mis-grouped 98-image pHash group,
build a clean manifest, then produce a group-aware train/val/test split.

Rules honoured:
- raw/ is read-only (fingerprinted before/after).
- No training, no augmentation, no balancing, no SMOTE, no raw changes.
- The 98-image group WG_f1b3d33d81b28e8b is a cross-class pHash mis-cluster;
  human review confirmed no real duplicates, so each kept image gets an
  independent manual group id and the 5 needs_expert_review images are excluded.
- Real near-duplicate groups outside the 98 keep their group constraint.
- Split is group-aware (no group crosses splits), seed=42, target 70/15/15.
"""
import collections, csv, hashlib, io, json, random, shutil, subprocess, tempfile, zipfile
from pathlib import Path, PurePosixPath

BASE = Path(__file__).resolve().parents[1]
REPORTS = BASE / 'reports'
RAW = BASE / 'raw'
CLASSES = ('healthy', 'rust', 'leaf_spot_blight', 'nitrogen_deficiency')
DECISIONS = ('keep', 'exclude_conflict', 'same_source_group', 'needs_expert_review')
SELECTED_VARIANTS = ('original', 'original_source_partition')
MIXED_GROUP = 'WG_f1b3d33d81b28e8b'


def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def write_csv(path, fields, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)


def fingerprint(root):
    out = {}
    for p in sorted(root.rglob('*')):
        if p.is_file():
            st = p.stat()
            out[p.relative_to(root).as_posix()] = (st.st_size, st.st_mtime_ns)
    return out


class Reader:
    """Reads raw bytes from plain files, zip members and rar members (via tar)."""
    def __init__(self, raw, cache):
        self.raw = raw
        self.cache = cache
        self.zips = {}
        self.rar = {}

    def read(self, path):
        outer, sep, member = path.partition('::')
        archive = (self.raw / outer).resolve()
        if not archive.is_relative_to(self.raw.resolve()):
            raise ValueError('Source outside raw: ' + path)
        if archive.suffix.lower() == '.zip':
            if archive not in self.zips:
                self.zips[archive] = zipfile.ZipFile(archive)
            return self.zips[archive].read(member)
        if archive.suffix.lower() == '.rar':
            if archive not in self.rar:
                dest = self.cache / ('rar_' + hashlib.sha256(str(archive).encode()).hexdigest()[:12])
                dest.mkdir()
                names = subprocess.run(['tar', '-tf', str(archive)], check=True, capture_output=True, text=True).stdout.splitlines()
                if any(Path(n).is_absolute() or '..' in Path(n).parts or ':' in n for n in names):
                    raise ValueError('Unsafe archive path')
                subprocess.run(['tar', '-xf', str(archive), '-C', str(dest)], check=True, capture_output=True)
                self.rar[archive] = dest
            p = (self.rar[archive] / member).resolve()
            if not p.is_relative_to(self.rar[archive]) or p.is_symlink():
                raise ValueError('Unsafe member')
            return p.read_bytes()
        raise ValueError('Unsupported archive: ' + path)

    def close(self):
        for z in self.zips.values():
            z.close()


def checked_bytes(reader, row):
    data = reader.read(row['original_path'])
    if hashlib.sha256(data).hexdigest() != row['sha256']:
        raise ValueError('Raw hash mismatch: ' + row['original_path'])
    return data


# --------------------------------------------------------------------------- #
# 1. clean manifest
# --------------------------------------------------------------------------- #
def build_clean(verified, review):
    rev_by_path = {}
    for r in review:
        p = r['original_path']
        if p in rev_by_path:
            raise ValueError('Duplicate review row: ' + p)
        decisions = r['review_decision'].strip()
        if decisions not in DECISIONS:
            raise ValueError('Bad review decision: ' + r['image_id'])
        if not r['review_note'].strip():
            raise ValueError('Empty review note: ' + r['image_id'])
        rev_by_path[p] = r
    if len(rev_by_path) != 98:
        raise ValueError('Expected 98 review rows, got %d' % len(rev_by_path))

    # apply human review onto the verified usable rows
    usable_all = [r for r in verified if r['usable'] == 'True']
    overrides = {}
    for p, rv in rev_by_path.items():
        dec = rv['review_decision'].strip()
        overrides[p] = dict(
            image_id=rv['image_id'],
            manual_review=dec,
            group_id='manual_unique_' + rv['image_id'],
            usable='False' if dec in ('exclude_conflict', 'needs_expert_review') else 'True',
            exclude_reason=('confirmed_label_conflict' if dec == 'exclude_conflict'
                            else 'needs_expert_review' if dec == 'needs_expert_review' else ''),
        )

    pool = []  # clean pool = usable rows after review
    row_map = {}
    for r in verified:
        p = r['original_path']
        ov = overrides.get(p)
        if ov:
            r = dict(r)
            r['group_id'] = ov['group_id']
            r['usable'] = ov['usable']
            r['exclude_reason'] = ov['exclude_reason']
            r['manual_review'] = ov['manual_review']
        else:
            r = dict(r)
            r['manual_review'] = 'not_in_mixed_group'
        row_map[p] = r
        if r['usable'] == 'True':
            pool.append(r)

    # group metadata for source attribution
    pool_groups = collections.defaultdict(list)
    for r in pool:
        pool_groups[r['group_id']].append(r)
    sha_count = collections.Counter(r['sha256'] for r in verified)

    selected = [row_map[r['original_path']] for r in verified
                if r['source_variant'] in SELECTED_VARIANTS]

    clean = []
    for r in selected:
        p = r['original_path']
        ov = overrides.get(p)
        gid = r['group_id']
        if ov:
            group_source = 'manual_unique'
        else:
            members = pool_groups.get(gid, [])
            if len({m['sha256'] for m in members}) >= 2:
                group_source = 'verified_near_duplicate'
            elif sha_count[r['sha256']] >= 2:
                group_source = 'exact_duplicate'
            else:
                group_source = 'none'
        r['group_source'] = group_source  # keep pool rows in sync
        clean.append(dict(
            source_dataset=r['source_dataset'],
            source_variant=r['source_variant'],
            original_path=p,
            original_label=r['original_label'],
            mapped_label=r['mapped_label'],
            sha256=r['sha256'],
            phash=r['phash'],
            group_id=gid,
            group_source=group_source,
            manual_review=r['manual_review'],
            usable=r['usable'],
            exclude_reason=r['exclude_reason'],
            original_split=r['original_split'],
            conflict_flag=r['conflict_flag'],
            exact_representative=r['exact_representative'],
            image_id=(ov['image_id'] if ov else ''),
        ))
    return clean, pool


# --------------------------------------------------------------------------- #
# 2. group-aware split
# --------------------------------------------------------------------------- #
def assign_groups(pool, seed=42):
    groups = collections.defaultdict(list)
    for r in pool:
        groups[r['group_id']].append(r)
    totals = collections.Counter(r['mapped_label'] for r in pool)
    splits = ('train', 'val', 'test')
    ratios = (0.70, 0.15, 0.15)
    rng = random.Random(seed)
    items = list(groups.items())
    rng.shuffle(items)
    items.sort(key=lambda it: -len({r['sha256'] for r in it[1]}))

    counts = {s: collections.Counter() for s in splits}
    assignment = {}
    for gid, images in items:
        vec = collections.Counter(r['mapped_label'] for r in images)

        def score(split):
            return sum(((counts[s][c] + (vec[c] if s == split else 0) - totals[c] * ratio) ** 2)
                       / max(totals[c], 1)
                       for s, ratio in zip(splits, ratios) for c in CLASSES)
        chosen = min(splits, key=score)
        assignment[gid] = chosen
        counts[chosen].update(vec)

    # guarantee every class in every split
    for c in CLASSES:
        for s in splits:
            if counts[s][c] == 0:
                donors = sorted((x for x in splits if x != s and counts[x][c] >= 1),
                                key=lambda x: -counts[x][c])
                if not donors:
                    raise ValueError('Cannot cover class %s in split %s' % (c, s))
                donor = donors[0]
                cand = [g for g, sp in assignment.items() if sp == donor
                        and all(r['mapped_label'] == c for r in groups[g])]
                if not cand:
                    raise ValueError('No pure group to move for class ' + c)
                cand.sort(key=lambda g: len(groups[g]))
                g = cand[0]
                assignment[g] = s
                counts[donor].update(-collections.Counter(r['mapped_label'] for r in groups[g]))
                counts[s].update(collections.Counter(r['mapped_label'] for r in groups[g]))
    return assignment, groups


# --------------------------------------------------------------------------- #
# 3. materialise the dataset
# --------------------------------------------------------------------------- #
def build(root):
    verified = read_csv(REPORTS / 'model_a_verified_manifest.csv')
    review = read_csv(REPORTS / 'mixed_group_98_review.csv')
    clean, pool = build_clean(verified, review)

    # --- write clean manifest ---
    fields = ['source_dataset', 'source_variant', 'original_path', 'original_label', 'mapped_label',
              'sha256', 'phash', 'group_id', 'group_source', 'manual_review', 'usable',
              'exclude_reason', 'original_split', 'conflict_flag', 'exact_representative']
    write_csv(REPORTS / 'model_a_clean_manifest.csv', fields, clean)

    if len({r['sha256'] for r in pool}) != len(pool):
        raise ValueError('Duplicate SHA in clean pool')

    # --- class statistics (dynamic) ---
    stats = []
    for c in CLASSES:
        rs = [r for r in pool if r['mapped_label'] == c]
        stats.append(dict(mapped_label=c, clean_count=len(rs),
                          group_count=len({r['group_id'] for r in rs}),
                          source_dataset_count=len({r['source_dataset'] for r in rs})))
    write_csv(REPORTS / 'class_statistics_clean.csv',
              ['mapped_label', 'clean_count', 'group_count', 'source_dataset_count'], stats)

    # --- split ---
    assignment, groups = assign_groups(pool, seed=42)

    destination = root / 'data' / 'leaf_classifier'
    if destination.resolve().name != 'leaf_classifier':
        raise ValueError('Unsafe destination')
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        shutil.rmtree(destination)

    before = fingerprint(RAW)
    split_rows = []
    seen_names = set()
    with tempfile.TemporaryDirectory(prefix='split_cache_', dir=REPORTS) as cache:
        stage = Path(cache) / 'leaf_classifier'
        for s in ('train', 'val', 'test'):
            for c in CLASSES:
                (stage / s / c).mkdir(parents=True)
        reader = Reader(RAW, Path(cache))
        try:
            for r in sorted(pool, key=lambda x: x['sha256']):
                split = assignment[r['group_id']]
                base = PurePosixPath(r['original_path'].split('::')[-1]).name
                fname = '%s__%s__%s' % (r['source_dataset'], r['sha256'][:12], base)
                if fname in seen_names:
                    raise ValueError('Duplicate target filename: ' + fname)
                seen_names.add(fname)
                rel = Path(split) / r['mapped_label'] / fname
                (stage / rel).write_bytes(checked_bytes(reader, r))
                split_rows.append(dict(
                    original_path=r['original_path'],
                    target_path=(destination / rel).relative_to(root).as_posix(),
                    source_dataset=r['source_dataset'],
                    source_variant=r['source_variant'],
                    mapped_label=r['mapped_label'],
                    group_id=r['group_id'],
                    group_source=r['group_source'],
                    split=split,
                    sha256=r['sha256'],
                    phash=r['phash'],
                ))
            # verify copied hashes
            for m in split_rows:
                p = stage / Path(m['target_path']).relative_to('data/leaf_classifier')
                if hashlib.sha256(p.read_bytes()).hexdigest() != m['sha256']:
                    raise ValueError('Copied hash mismatch: ' + m['target_path'])
            after = fingerprint(RAW)
            if before != after:
                raise ValueError('Raw changed during build; aborting')
            shutil.move(str(stage), str(destination))
        finally:
            reader.close()

    write_csv(REPORTS / 'split_manifest.csv',
              ['original_path', 'target_path', 'source_dataset', 'source_variant', 'mapped_label',
               'group_id', 'group_source', 'split', 'sha256', 'phash'], split_rows)

    # --- split statistics ---
    split_stats = []
    totals = {}
    for s in ('train', 'val', 'test'):
        rs = [m for m in split_rows if m['split'] == s]
        totals[s] = len(rs)
        for c in CLASSES:
            n = sum(1 for m in rs if m['mapped_label'] == c)
            pct = (n / len(rs) * 100) if rs else 0.0
            split_stats.append(dict(split=s, mapped_label=c, count=n, percentage='%.2f' % pct))
    write_csv(REPORTS / 'split_statistics.csv', ['split', 'mapped_label', 'count', 'percentage'], split_stats)

    # --- leakage checks ---
    def cross(field):
        buckets = collections.defaultdict(set)
        for m in split_rows:
            buckets[m[field]].add(m['split'])
        return sum(1 for v in buckets.values() if len(v) > 1)

    names = collections.Counter(PurePosixPath(m['target_path']).name for m in split_rows)
    checks = dict(
        exact_sha_cross_split=cross('sha256'),
        real_group_cross_split=cross('group_id'),
        label_conflict_in_pool=sum(1 for r in pool if r['conflict_flag'] == 'True'),
        needs_expert_review_in_pool=sum(1 for r in pool if r['manual_review'] == 'needs_expert_review'),
        augmented_copy_in_pool=sum(1 for r in pool if r['source_variant'] == 'augmented_or_split'),
        split_copy_in_pool=sum(1 for r in pool if 'split' in r['source_variant'] and r['source_variant'] != 'original_source_partition'),
        corrupt_in_pool=sum(1 for r in pool if r['exclude_reason'] == 'corrupt'),
        duplicate_target_filename=sum(1 for v in names.values() if v > 1),
        raw_changed=0 if before == after else 1,
    )
    coverage = {s: {c: sum(1 for m in split_rows if m['split'] == s and m['mapped_label'] == c)
                    for c in CLASSES} for s in ('train', 'val', 'test')}

    review_counts = collections.Counter(r['manual_review'] for r in clean
                                        if r['manual_review'] != 'not_in_mixed_group')
    pool_groups_build = collections.defaultdict(list)
    for r in pool:
        pool_groups_build[r['group_id']].append(r)
    mixed_after = sum(1 for mem in pool_groups_build.values()
                      if len({r['mapped_label'] for r in mem}) > 1)

    result = dict(
        clean_pool=len(pool),
        class_clean={c: sum(1 for r in pool if r['mapped_label'] == c) for c in CLASSES},
        review_decisions=dict(review_counts),
        mis_group_fixed=MIXED_GROUP,
        remaining_mixed_label_groups=mixed_after,
        split_totals=totals,
        split_by_class={s: coverage[s] for s in ('train', 'val', 'test')},
        checks=checks,
        seed=42,
        ratios='0.70/0.15/0.15',
    )
    (REPORTS / 'split_validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    write_report(clean, pool, split_rows, totals, coverage, checks, review_counts, result)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def write_report(clean, pool, split_rows, totals, coverage, checks, review_counts, result):
    def cc(c):
        return result['class_clean'][c]
    lines = []
    lines.append('# 黄骅旱碱麦 视觉模型A 数据集划分报告（第11步）\n')
    lines.append('本阶段仅做人工复核落库、修正错误近似分组、构建 clean manifest 与 group-aware 划分；'
                 '未训练、未增强、未过采样、未修改 raw。\n')
    lines.append('## 1. clean pool 总数\n')
    lines.append('- clean pool = **%d**（usable=True 且非 needs_expert_review）\n' % len(pool))
    lines.append('- clean manifest 行数 = %d（含被排除项，供审计）\n' % len(clean))
    lines.append('## 2. clean 四类数量\n')
    lines.append('| 类别 | clean 数量 | 组数 | 来源数据集数 |')
    lines.append('| --- | ---: | ---: | ---: |')
    for c in CLASSES:
        rs = [r for r in pool if r['mapped_label'] == c]
        lines.append('| %s | %d | %d | %d |' % (c, len(rs), len({r['group_id'] for r in rs}),
                                                len({r['source_dataset'] for r in rs})))
    lines.append('\n## 3-5. 各 split 四类数量\n')
    for s in ('train', 'val', 'test'):
        lines.append('**%s**（共 %d）\n' % (s, totals[s]))
        lines.append('| 类别 | 数量 |')
        lines.append('| --- | ---: |')
        for c in CLASSES:
            lines.append('| %s | %d |' % (c, coverage[s][c]))
        lines.append('')
    lines.append('## 6. train/val/test 总量与比例\n')
    lines.append('| split | 总量 | 占比 | 目标 |')
    lines.append('| --- | ---: | ---: | ---: |')
    grand = sum(totals.values())
    for s, tgt in (('train', '70%'), ('val', '15%'), ('test', '15%')):
        lines.append('| %s | %d | %.1f%% | %s |' % (s, totals[s], totals[s] / grand * 100, tgt))
    lines.append('\n## 7-12. 数据泄漏与污染检查\n')
    lines.append('| 检查项 | 期望 | 实测 | 结果 |')
    lines.append('| --- | ---: | ---: | --- |')
    items = [
        ('exact duplicate（SHA256）跨 split', checks['exact_sha_cross_split']),
        ('真实 group 跨 split', checks['real_group_cross_split']),
        ('confirmed label conflict 进入 clean pool', checks['label_conflict_in_pool']),
        ('needs_expert_review 进入 clean pool', checks['needs_expert_review_in_pool']),
        ('augmented_copy 进入 clean pool', checks['augmented_copy_in_pool']),
        ('split_copy 进入 clean pool', checks['split_copy_in_pool']),
        ('corrupt 进入 clean pool', checks['corrupt_in_pool']),
        ('同一 target 文件名重复', checks['duplicate_target_filename']),
        ('raw 被修改或删除', checks['raw_changed']),
    ]
    for name, val in items:
        lines.append('| %s | 0 | %d | %s |' % (name, val, 'PASS' if val == 0 else 'FAIL'))
    lines.append('\n## 13. 98 张误聚 group 处理\n')
    lines.append('- 原 group `%s` 为 pHash 跨类误聚（healthy 84 / nitrogen_deficiency 6 / rust 8），'
                 '人工复核确认无同一原图、无同一叶片、无增强裁剪副本。' % MIXED_GROUP)
    lines.append('- 处理：keep 的 93 张解除原 group，各自赋独立 `manual_unique_<image_id>`；'
                 'needs_expert_review 的 5 张（%s）标记 usable=False 并禁止进入数据集。'
                 % '、'.join(sorted(r['image_id'] for r in clean if r['manual_review'] == 'needs_expert_review')))
    lines.append('- 解除后剩余 mixed-label group = %d。' % result['remaining_mixed_label_groups'])
    lines.append('\n## 14. 每个 split 的类别覆盖\n')
    ok = all(coverage[s][c] > 0 for s in ('train', 'val', 'test') for c in CLASSES)
    lines.append('- train/val/test 是否均覆盖 4 类：**%s**' % ('是' if ok else '否'))
    lines.append('- nitrogen_deficiency：train=%d, val=%d, test=%d' %
                 (coverage['train']['nitrogen_deficiency'], coverage['val']['nitrogen_deficiency'],
                  coverage['test']['nitrogen_deficiency']))
    lines.append('\n## 15. 是否满足正式训练 YOLO11n-cls 条件\n')
    lines.append('- 划分满足类别覆盖与泄漏检查，可用于 YOLO11n-cls 分类训练：**%s**'
                 % ('是' if ok and all(v == 0 for v in checks.values()) else '否'))
    lines.append('- 说明：num_classes=4；已知泄漏检查为 0 不证明来源/地块完全独立；'
                 'nitrogen_deficiency 样本偏少，训练时需关注，但本阶段不做任何平衡或增强。\n')
    (REPORTS / 'DATASET_SPLIT_REPORT.md').write_text('\n'.join(lines), encoding='utf-8')


if __name__ == '__main__':
    build(BASE)