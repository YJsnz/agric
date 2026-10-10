"""Read-only raw audit and evidence-gated Model B preparation (never trains).

Run with ai-service/.venv Python. Optional --metadata must contain source-backed
stress onset dates/DAS; the README does NOT supply those values. No visual labels.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
import csv
from datetime import date
import hashlib
import json
from pathlib import Path
import random
import re
import shutil

from PIL import Image
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
DATE_PATTERN = re.compile(r'([12])(?:st|nd)S_(\d+)DAS_(\d{8})')
PLOT_PATTERN = re.compile(r'([1-9]|[12]\d|30)r([123])', re.I)
# README p4, verified against the rendered original table, not inferred order.
MIXTURES = ['Chamran', 'Sirvan', 'Pishtaz', 'Shiraz', 'Chamran+Sirvan',
            'Chamran+Pishtaz', 'Chamran+Shiraz', 'Sirvan+Pishtaz',
            'Sirvan+Shiraz', 'Pishtaz+Shiraz', 'Chamran+Sirvan+Pishtaz',
            'Chamran+Sirvan+Shiraz', 'Chamran+Pishtaz+Shiraz',
            'Sirvan+Pishtaz+Shiraz', 'Chamran+Sirvan+Pishtaz+Shiraz']
FIELDS = ['image_id', 'image_path', 'relative_path', 'filename', 'season', 'das',
          'date', 'plot_id', 'cultivar_or_mixture', 'treatment', 'stress_active',
          'mapped_label', 'usable', 'exclude_reason', 'sha256', 'width', 'height',
          'growth_stage', 'metadata_source', 'source_group', 'error']


def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def parse_directory(name):
    m = DATE_PATTERN.fullmatch(name)
    if not m:
        return None
    season, das, stamp = m.groups()
    day = date.fromisoformat(f'{stamp[:4]}-{stamp[4:6]}-{stamp[6:]}')
    # Preserve the publisher's DAS; first-season README sowing date differs by
    # one day from ALL folder DAS. Report that discrepancy, do not rewrite it.
    return int(season), int(das), day.isoformat()


def parse_plot(filename):
    m = PLOT_PATTERN.fullmatch(Path(filename).stem)
    if not m:
        return None, 'unknown', 'unknown'
    number, replicate = map(int, m.groups())
    return f'{number}r{replicate}', ('control' if number <= 15 else 'water_stress'), MIXTURES[(number - 1) % 15]


def read_readme(raw):
    files = sorted(p for p in raw.rglob('*') if p.is_file() and 'readme' in p.name.lower())
    pdfs = [p for p in files if p.suffix.lower() == '.pdf']
    if len(pdfs) != 1:
        raise ValueError('Expected one official README PDF; refusing ambiguous mapping')
    with pymupdf.open(pdfs[0]) as document:
        pages = [page.get_text() for page in document]
    joined = ' '.join(' '.join(pages).split())
    for text in ['Plots 16 to 30 mirror', 'labeled from 1 to 30',
                 'consistent across both growing seasons', '50%']:
        if text not in joined:
            raise ValueError(f'README changed: mapping requires review: {text}')
    # Parse official table by directory anchors, preserving stage and special notes.
    table = pages[4]
    anchors = list(DATE_PATTERN.finditer(table))
    overview = {}
    for i, anchor in enumerate(anchors):
        part = table[anchor.end(): anchors[i + 1].start() if i + 1 < len(anchors) else len(table)]
        lines = [line.strip() for line in part.splitlines() if line.strip()]
        overview[anchor.group()] = {'expected_count': int(lines[0]),
                                   'growth_stage': lines[1], 'table_text': part.strip()}
    if len(overview) != 19:
        raise ValueError('Could not parse all 19 official overview entries')
    return pdfs[0], pages, overview


def load_metadata(path):
    if path is None:
        return {}
    data = json.loads(path.read_text(encoding='utf-8'))
    for season, start in data.get('stress_start', {}).items():
        if season not in {'1', '2'} or not start.get('source') or not start.get('locator'):
            raise ValueError('Each onset needs season, source and page/section locator')
        date.fromisoformat(start['date'])
        if not isinstance(start['das'], int) or start['das'] < 0:
            raise ValueError('Onset DAS must be a nonnegative source-backed integer')
    return data


def label_row(row, metadata):
    if not row['plot_id']:
        return 'unknown', 'unknown', 'missing_plot_id'
    start = metadata.get('stress_start', {}).get(str(row['season']))
    # Early stages in README table are explicitly before post-anthesis treatment.
    before_anthesis = any(s in row['growth_stage'].lower() for s in ['tillering', 'booting'])
    if row['treatment'] == 'water_stress' and before_anthesis:
        if start and row['das'] >= start['das']:
            raise ValueError('Onset metadata contradicts README pre-anthesis stage')
        return 'false', 'exclude_pre_stress', 'pre_stress'
    if not start:
        return ('false' if row['treatment'] == 'control' else 'unknown'), 'unknown', 'missing_stress_start'
    das_before = row['das'] < start['das']
    date_before = row['date'] < start['date']
    if das_before != date_before:
        return 'unknown', 'unknown', 'inconsistent_onset_date_das'
    if das_before:
        return 'false', 'exclude_pre_stress', ('pre_stress' if row['treatment'] == 'water_stress' else 'unmatched_control_date')
    if row['treatment'] == 'control':
        return 'false', 'normal', ''
    return 'true', 'water_stress', ''


def inspect_image(task):
    path, raw, directory, overview, metadata = task
    parsed = parse_directory(directory.name) if directory else None
    season, das, day = parsed or (None, None, None)
    plot, treatment, mixture = parse_plot(path.name)
    relative = path.relative_to(raw).as_posix()
    row = dict.fromkeys(FIELDS, '')
    row.update(image_id='MB_' + hashlib.sha256(relative.encode()).hexdigest()[:16],
               image_path=str(path.resolve()), relative_path=relative, filename=path.name,
               season=season, das=das, date=day, plot_id=plot,
               cultivar_or_mixture=mixture, treatment=treatment,
               growth_stage=overview.get(directory.name if directory else '', {}).get('growth_stage', 'unknown'),
               metadata_source='README.pdf p2/p4 (plot/treatment); p5 (stage)',
               source_group=plot, usable='false', sha256=sha256(path))
    if not parsed:
        row.update(stress_active='unknown', mapped_label='unknown', exclude_reason='missing_date_metadata')
    else:
        row['stress_active'], row['mapped_label'], row['exclude_reason'] = label_row(row, metadata)
    try:
        with Image.open(path) as im:
            row['width'], row['height'] = im.size
            im.verify()
        with Image.open(path) as im:
            im.load()  # Decode all pixels; header-only verify is insufficient.
        if min(row['width'], row['height']) < 32:
            row['exclude_reason'] = 'abnormal_dimensions'
    except Exception as e:
        row.update(exclude_reason='corrupt', error=f'{type(e).__name__}: {e}')
    return row


def clean_rows(rows):
    groups = defaultdict(list)
    for row in rows:
        groups[row['sha256']].append(row)
    conflicts = redundant = 0
    for group in groups.values():
        labels = {r['mapped_label'] for r in group} & {'normal', 'water_stress'}
        if len(labels) > 1:
            conflicts += 1
            for row in group:
                row['exclude_reason'] = 'label_conflict'
        else:
            eligible = [r for r in group if not r['exclude_reason']]
            for row in eligible[1:]:
                row['exclude_reason'] = 'exact_duplicate_redundant'
                redundant += 1
    # Time matching AFTER corruption/conflict/duplicate exclusions.
    matched = defaultdict(set)
    for row in rows:
        if not row['exclude_reason']:
            matched[(row['season'], row['date'])].add(row['mapped_label'])
    for row in rows:
        if not row['exclude_reason'] and matched[(row['season'], row['date'])] != {'normal', 'water_stress'}:
            row['exclude_reason'] = 'unmatched_date'
        row['usable'] = str(not bool(row['exclude_reason'])).lower()
    return [r for r in rows if r['usable'] == 'true'], {
        'exact_duplicate_groups': sum(len(g) > 1 for g in groups.values()),
        'exact_duplicate_redundant': redundant, 'cross_label_exact_duplicate_groups': conflicts}


def split_rows(clean):
    """Keep same numbered replicate together across seasons, even if identity unknown.

    This conservative grouping does not assert that the physical plots are the
    same; it avoids assuming independence not established by the README.
    """
    plots = defaultdict(list)
    for row in clean:
        plots[row['plot_id']].append(row)
    by_label = defaultdict(list)
    for plot, group in plots.items():
        labels = {r['mapped_label'] for r in group}
        if len(labels) != 1:
            raise ValueError('Plot contains mixed treatment labels')
        by_label[next(iter(labels))].append(plot)
    if any(len(by_label[label]) < 3 for label in ['normal', 'water_stress']):
        raise ValueError('Not enough independent plot groups for 3 splits')
    rng, best, best_score = random.Random(42), None, float('inf')
    for _ in range(1000):
        assignment = {}
        for label in ['normal', 'water_stress']:
            ids = sorted(by_label[label]); rng.shuffle(ids)
            n = len(ids); v = max(1, round(n * .15)); t = max(1, round(n * .15))
            for i, plot in enumerate(ids):
                assignment[plot] = 'val' if i < v else ('test' if i < v + t else 'train')
        counts = Counter((assignment[r['plot_id']], r['mapped_label']) for r in clean)
        coverage = {(assignment[r['plot_id']], r['season']) for r in clean}
        score = sum(abs(counts[s, label] / sum(r['mapped_label'] == label for r in clean) - fraction)
                    for s, fraction in [('train', .7), ('val', .15), ('test', .15)]
                    for label in ['normal', 'water_stress'])
        score += 10 * (6 - len(coverage))
        if score < best_score:
            best_score, best = score, assignment
    return [dict(r, split=best[r['plot_id']]) for r in clean]


def write_csv(path, rows, fields):
    with path.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader(); writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--metadata', type=Path, help='Reviewed official onset metadata JSON with source/locator')
    args = parser.parse_args()
    raw, reports, target = ROOT / 'raw/canopy_water_stress', ROOT / 'reports', ROOT / 'data/canopy_water_stress'
    reports.mkdir(exist_ok=True)
    if target.exists():
        raise FileExistsError(f'Refusing to overwrite existing dataset: {target}')
    readme, pages, overview = read_readme(raw)
    (reports / 'model_b_readme_text.txt').write_text('\n'.join(f'PAGE {i+1}\n{p}' for i, p in enumerate(pages)), encoding='utf-8')
    metadata = load_metadata(args.metadata)
    all_files = sorted(p for p in raw.rglob('*') if p.is_file())
    before = {p.relative_to(raw).as_posix(): sha256(p) for p in all_files}
    image_files = [p for p in all_files if p.suffix.lower() in EXTENSIONS]
    directories = sorted(p for p in raw.iterdir() if p.is_dir() and DATE_PATTERN.fullmatch(p.name))
    tasks = []
    for p in image_files:
        directory = next((parent for parent in p.parents if parent.parent == raw), None)
        tasks.append((p, raw, directory, overview, metadata))
    print(f'Scanning {len(image_files)} images / {len(directories)} date directories', flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(inspect_image, tasks))
    clean, duplicates = clean_rows(rows)
    write_csv(reports / 'model_b_raw_manifest.csv', rows, FIELDS)
    write_csv(reports / 'model_b_clean_manifest.csv', clean, FIELDS)
    onset_missing = [s for s in ['1', '2'] if s not in metadata.get('stress_start', {})]
    split = []
    blocked = [f'season{s}_stress_start_unknown' for s in onset_missing]
    if not blocked and clean:
        split = split_rows(clean)
        for r in split:
            filename = f"{r['season']}__{r['das']}DAS__{r['date']}__plot{r['plot_id']}__{r['sha256'][:10]}__{r['filename']}"
            dest = target / r['split'] / r['mapped_label'] / filename
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(r['image_path'], dest)
            if sha256(dest) != r['sha256']:
                raise ValueError(f'Copy hash mismatch: {dest}')
            r.update(original_path=r['image_path'], target_path=str(dest))
    elif not clean:
        blocked.append('no_eligible_time_matched_images')
    write_csv(reports / 'model_b_split_manifest.csv', split,
              ['original_path', 'target_path'] + FIELDS + ['split'])
    after = {p.relative_to(raw).as_posix(): sha256(p) for p in sorted(raw.rglob('*')) if p.is_file()}
    raw_changes = sum(before.get(p) != after.get(p) for p in before.keys() | after.keys())
    (reports / 'model_b_raw_integrity.json').write_text(json.dumps({
        'before_sha256': before, 'after_sha256': after,
        'changed_deleted_added_count': raw_changes}, indent=2), encoding='utf-8')
    plot_splits, hash_splits = defaultdict(set), defaultdict(set)
    for r in split:
        plot_splits[r['plot_id']].add(r['split']); hash_splits[r['sha256']].add(r['split'])
    leakage = {'cross_split_plot': sum(len(s) > 1 for s in plot_splits.values()),
               'cross_split_exact_duplicate': sum(len(s) > 1 for s in hash_splits.values()),
               'label_conflict_entered': sum(r['exclude_reason'] == 'label_conflict' for r in split),
               'pre_stress_entered': sum(r['stress_active'] != 'true' for r in split if r['mapped_label'] == 'water_stress'),
               'corrupt_entered': sum(r['exclude_reason'] == 'corrupt' for r in split),
               'missing_plot_id_entered': sum(not r['plot_id'] for r in split),
               'duplicate_target_filename': len(split) - len({Path(r['target_path']).name for r in split}),
               'raw_modified_deleted_added': raw_changes}
    if any(leakage.values()):
        raise ValueError(f'Integrity failure: {leakage}')
    dates = []
    for d in directories:
        season, das, day = parse_directory(d.name)
        group = [r for r in rows if r['season'] == season and r['date'] == day]
        dates.append(dict(season=season, das=das, date=day, raw_count=len(group),
                          expected_count=overview.get(d.name, {}).get('expected_count', 'unknown'),
                          elapsed_from_readme_sowing=(date.fromisoformat(day) - (date(2014,11,20) if season == 1 else date(2015,11,5))).days,
                          normal_count=sum(r['usable'] == 'true' and r['mapped_label'] == 'normal' for r in group),
                          water_stress_count=sum(r['usable'] == 'true' and r['mapped_label'] == 'water_stress' for r in group)))
    write_csv(reports / 'model_b_date_statistics.csv', dates, list(dates[0]))
    stats = dict(raw_total=len(rows), season1=sum(r['season'] == 1 for r in rows),
                 season2=sum(r['season'] == 2 for r in rows), date_directory_count=len(directories),
                 numbered_replicate_identities=len({r['plot_id'] for r in rows if r['plot_id']}),
                 physical_identity_across_seasons='unknown',
                 sowing_date_das_discrepancies=[d for d in dates if d['das'] != d['elapsed_from_readme_sowing']],
                 grouping_policy='same numbered replicate kept together across seasons conservatively',
                 plot_id_parsed=sum(bool(r['plot_id']) for r in rows), missing_plot_id=sum(not r['plot_id'] for r in rows),
                 control_plots=len({r['plot_id'] for r in rows if r['treatment'] == 'control'}),
                 water_stress_plots=len({r['plot_id'] for r in rows if r['treatment'] == 'water_stress'}),
                 control_raw=sum(r['treatment'] == 'control' for r in rows),
                 water_stress_raw=sum(r['treatment'] == 'water_stress' for r in rows),
                 stress_start={s: metadata.get('stress_start', {}).get(s, 'unknown') for s in ['1', '2']},
                 exclusion_counts=dict(Counter(r['exclude_reason'] for r in rows if r['exclude_reason'])),
                 dimensions=dict(Counter(f"{r['width']}x{r['height']}" for r in rows)),
                 clean_total=len(clean), normal=sum(r['mapped_label'] == 'normal' for r in clean),
                 corrupt_total=sum(r['exclude_reason'] == 'corrupt' for r in rows),
                 abnormal_dimensions_total=sum(r['exclude_reason'] == 'abnormal_dimensions' for r in rows),
                 water_stress=sum(r['mapped_label'] == 'water_stress' for r in clean),
                 duplicates=duplicates, leakage=leakage, training_ready=bool(split) and not blocked,
                 blocked_reasons=blocked, splits={})
    for s in ['train', 'val', 'test']:
        group = [r for r in split if r['split'] == s]
        stats['splits'][s] = dict(total=len(group), normal=sum(r['mapped_label'] == 'normal' for r in group),
                                 water_stress=sum(r['mapped_label'] == 'water_stress' for r in group),
                                 plots=len({r['plot_id'] for r in group}),
                                 season1=sum(r['season'] == 1 for r in group), season2=sum(r['season'] == 2 for r in group),
                                 dates=sorted({r['date'] for r in group}))
    (reports / 'model_b_final_audit.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')
    flat = [{'metric': key, 'value': json.dumps(value, ensure_ascii=False)} for key, value in stats.items()]
    write_csv(reports / 'model_b_split_statistics.csv', flat, ['metric', 'value'])
    missing = {d.name: sorted({f'{p}r{rep}' for p in range(1,31) for rep in range(1,4)} -
                             {r['plot_id'] for r in rows if r['date'] == parse_directory(d.name)[2]}) for d in directories}
    report = '''# Model B 全量数据准备审计\n\n状态：{status}\n\n## 原文核验\n\nREADME.pdf p1：伊朗 Shiraz University，2014–15/2015–16 两季，RCBD，15 种品种组合 × 2 灌溉处理 × 3 重复；小区 2×2 m。四品种为 Chamran、Sirvan、Pishtaz、Shiraz，混播等比例。\n\np2/p4：文件名 1–30 + r1/r2/r3；1–15 为足量灌溉，16–30 为对应的花后亏缺灌溉（50% FC）。处理和布局跨季一致；具体物理小区是否复用未明说。不能使用忽略 r 重复编号的 30 组划分。\n\np1/p5：第一季 189 DAS 因相机存储故障只有 56 张。逐日期阶段、拍摄时间和特殊说明保存在 model_b_readme_text.txt。第二季 174 DAS 有冷胁迫，末期有标尺/泡沫框，成熟与照明均可能成为混杂因素。\n\n## 未解决的信息与阻断原因\n\n两季具体处理开始日期/DAS：unknown。花后处理描述及拍摄时的灌浆/成熟阶段，不等于已证明首次亏缺灌溉的日期。严禁将后期图像自动标签为 water_stress。前期分蘖/孕穗可确定属于花前；其 water-stress treatment 图像按 pre_stress 排除。control 图像没有可确认已开始胁迫的同日对照，暂不成为 normal 训练标签。\n\n没有伪造正式训练集；空 clean/split CSV 只表示科学条件未满足，泄漏为零不等于准备成功。原始物理小区跨季身份 unknown；未来采用同编号+重复跨季保守绑定，不假定独立。\n\n可补充经审核原文的 --metadata JSON：stress_start 中每季需 date、das、source、locator。脚本会核验日期/DAS、与花前阶段是否冲突，再进行同季同日双类匹配、去重、seed=42 小区划分和复制完整性检查。\n\n## 官方资料核查\n\n数据集：https://zenodo.org/records/10694706 （页面确认总量与花后处理，但无具体开始日期）。README 引用 https://doi.org/10.1016/j.eja.2020.126188；公开可访问摘要未提供所需精确日期，本次未取得可核验的方法全文。\n\n## 全量统计与泄漏检查\n\n```json\n{stats}\n```\n\n## 日期覆盖\n\n|season|DAS|date|raw|expected|normal|water_stress|\n|---|---|---|---|---|---|---|\n{dates}\n\n## 缺失图像身份\n\n```json\n{missing}\n```\n\n仅以 SHA256 判定完全重复；没有使用 pHash 删除、聚类或推断来源。本次没有训练、增强、重采样、移动或修改原图。\n'''.format(status='具备数据准备条件' if stats['training_ready'] else 'BLOCKED：缺少可靠的胁迫开始时间',
           stats=json.dumps(stats, ensure_ascii=False, indent=2),
           dates='\n'.join('|'+ '|'.join(str(d[k]) for k in ['season','das','date','raw_count','expected_count','normal_count','water_stress_count'])+'|' for d in dates),
           missing=json.dumps({k:v for k,v in missing.items() if v}, indent=2))
    (reports / 'MODEL_B_FINAL_DATASET_REPORT.md').write_text(report, encoding='utf-8')
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
