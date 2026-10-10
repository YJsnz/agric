"""Prepare treatment-derived weak labels; never train or confirm water deficit.

Keeps prior strict-label audit/manifests intact and copies images only.
"""
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import random
import re
import shutil
import uuid

from prepare_model_b_dataset import (
    ROOT, EXTENSIONS, FIELDS, read_readme, inspect_image, clean_rows, sha256, write_csv,
)

PRE_DATES = {'2015-03-05', '2015-04-25', '2015-12-22', '2016-02-06', '2016-04-27'}
POST_DATES = {'2015-05-15', '2015-05-29', '2015-06-01', '2015-06-06', '2015-06-14',
              '2016-05-11', '2016-05-14', '2016-05-17', '2016-05-20', '2016-05-23',
              '2016-05-31', '2016-06-03', '2016-06-06', '2016-06-20'}
WEAK_FIELDS = FIELDS + ['phase', 'label_source', 'label_strength', 'confirmed_stress', 'pair_group']
DISCLAIMER = '''This dataset uses treatment-derived weak labels.
The water_stress class represents canopy images from plots assigned to
post-anthesis deficit irrigation treatment.
Because the exact first post-anthesis deficit-irrigation date is unavailable,
the class must not be interpreted as image-level confirmation of actual
soil-water deficit.'''


def weak_label(row):
    """Dates authorize candidate inclusion, not a confirmed stress onset."""
    row = dict(row)
    row.update(phase='unknown', label_source='treatment_assignment', label_strength='weak',
               confirmed_stress='unknown', stress_active='unknown', pair_group='', usable='false')
    if row['date'] in PRE_DATES:
        row.update(phase='pre_stress', mapped_label='excluded', exclude_reason='confirmed_pre_stress')
    elif row['date'] in POST_DATES:
        row['phase'] = 'post_anthesis_candidate'
        if row['exclude_reason'] in {'missing_stress_start', 'pre_stress'}:
            row['exclude_reason'] = ''
        if not row['plot_id']:
            row['exclude_reason'] = 'missing_plot_id'
        elif row['treatment'] not in {'control', 'water_stress'}:
            row['exclude_reason'] = 'unknown_treatment'
        row['mapped_label'] = {'control': 'normal', 'water_stress': 'water_stress'}.get(row['treatment'], 'unknown')
    else:
        row.update(mapped_label='unknown', exclude_reason='unknown_phase')
    if row['plot_id']:
        match = re.fullmatch(r'(\d+)r([123])', row['plot_id'])
        number, replicate = map(int, match.groups())
        row['pair_group'] = f'mixture{(number-1)%15+1:02d}_r{replicate}'
    return row


def paired_split(clean):
    """Assign 31/7/7 matched pairs: 62/14/14 plots, seed=42.

    Control/deficit counterparts share cultivar and replicate. Pairing is an
    additional balance constraint, not a claim that they are one physical plot.
    Same numbered replicate stays bound across both seasons conservatively.
    """
    pairs = defaultdict(list)
    for row in clean:
        pairs[row['pair_group']].append(row)
    if len(pairs) != 45 or len({r['plot_id'] for r in clean}) != 90:
        raise ValueError('Expected all 90 plot IDs / 45 matched pairs; review incomplete layout before splitting')
    mixtures = defaultdict(list)
    for pair, group in pairs.items():
        if {r['mapped_label'] for r in group} != {'normal', 'water_stress'}:
            raise ValueError(f'Incomplete treatment pair: {pair}')
        mixtures[pair.split('_r')[0]].append(pair)
    if len(mixtures) != 15 or any(len(v) != 3 for v in mixtures.values()):
        raise ValueError('Unexpected cultivar/replicate coverage')
    rng, best, best_score = random.Random(42), None, float('inf')
    totals = Counter(r['mapped_label'] for r in clean)
    dates = {(r['season'], r['date']) for r in clean}
    for _ in range(2000):
        mix_ids = sorted(mixtures); rng.shuffle(mix_ids)
        assignment = dict.fromkeys(pairs, 'train')
        # At least two replicates per mixture remain in training; validation
        # and test each cover seven distinct mixtures, with both treatments.
        for subset, split in [(mix_ids[:7], 'val'), (mix_ids[7:14], 'test')]:
            for mix in subset:
                assignment[rng.choice(sorted(mixtures[mix]))] = split
        counts = Counter((assignment[r['pair_group']], r['mapped_label']) for r in clean)
        score = sum(abs(counts[s, label]/totals[label]-ratio)
                    for s, ratio in [('train', .7), ('val', .15), ('test', .15)]
                    for label in ['normal', 'water_stress'])
        for s in ['train', 'val', 'test']:
            subset = [r for r in clean if assignment[r['pair_group']] == s]
            score += 100 * (2 - len({r['season'] for r in subset}))
            score += 10 * len(dates - {(r['season'], r['date']) for r in subset})
        if score < best_score:
            best, best_score = assignment, score
    return [dict(row, split=best[row['pair_group']]) for row in clean]


def leakage_check(split, raw_changes=0):
    plots, hashes = defaultdict(set), defaultdict(set)
    for row in split:
        plots[row['plot_id']].add(row['split']); hashes[row['sha256']].add(row['split'])
    return dict(cross_split_plot=sum(len(v)>1 for v in plots.values()),
                cross_split_sha256=sum(len(v)>1 for v in hashes.values()),
                cross_split_exact_duplicate=sum(len(v)>1 for v in hashes.values()),
                confirmed_pre_stress_entered=sum(r['date'] in PRE_DATES for r in split),
                label_conflict_entered=sum(r['exclude_reason']=='label_conflict' for r in split),
                corrupt_entered=sum(bool(r['error']) or r['exclude_reason']=='corrupt' for r in split),
                confirmed_stress_true_entered=sum(r['confirmed_stress']=='true' for r in split),
                missing_plot_id_entered=sum(not r['plot_id'] for r in split),
                target_filename_duplicate=len(split)-len({Path(r['target_path']).name for r in split}),
                raw_modified_deleted_added=raw_changes)


def main():
    raw, reports, target = ROOT/'raw/canopy_water_stress', ROOT/'reports', ROOT/'data/canopy_water_stress'
    if target.exists():
        raise FileExistsError(f'Refusing to overwrite existing dataset: {target}')
    prior_manifests = sorted(reports.glob('model_b*manifest.csv'))
    protected = {str(p):sha256(p) for p in prior_manifests}
    _, _, overview = read_readme(raw)
    all_files = sorted(p for p in raw.rglob('*') if p.is_file())
    before = {p.relative_to(raw).as_posix():sha256(p) for p in all_files}
    paths = [p for p in all_files if p.suffix.lower() in EXTENSIONS]
    print(f'Inspecting {len(paths)} images; treatment-derived WEAK labels only', flush=True)
    tasks = [(p, raw, next((parent for parent in p.parents if parent.parent==raw), None), overview, {}) for p in paths]
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = [weak_label(r) for r in pool.map(inspect_image, tasks)]
    clean, duplicates = clean_rows(rows)
    split = paired_split(clean)
    staging = target.parent / ('.canopy_water_stress_weak_staging_' + uuid.uuid4().hex)
    staging.mkdir(parents=True)
    for s in ['train', 'val', 'test']:
        for label in ['normal', 'water_stress']:
            (staging/s/label).mkdir(parents=True)
    for row in split:
        filename = f"{row['season']}__{row['das']}DAS__{row['date']}__plot{row['plot_id']}__{row['sha256'][:10]}__{row['filename']}"
        relative = Path(row['split'])/row['mapped_label']/filename
        dest = staging/relative
        if dest.exists():
            raise ValueError(f'Filename collision: {dest}')
        shutil.copy2(row['image_path'], dest)
        if sha256(dest) != row['sha256']:
            raise ValueError(f'Copy content mismatch: {dest}')
        row.update(original_path=row['image_path'], target_path=str(target/relative))
    after = {p.relative_to(raw).as_posix():sha256(p) for p in sorted(raw.rglob('*')) if p.is_file()}
    changes = sum(before.get(p)!=after.get(p) for p in before.keys()|after.keys())
    checks = leakage_check(split, changes)
    if protected != {str(p):sha256(p) for p in prior_manifests}:
        raise ValueError('An existing strict-label manifest was changed')
    if any(checks.values()):
        raise ValueError(f'Integrity failure: {checks}')
    stats = dict(seed=42, raw_total=len(rows),
        candidate_post_anthesis_images=sum(r['phase']=='post_anthesis_candidate' for r in rows),
        confirmed_pre_stress_excluded=sum(r['exclude_reason']=='confirmed_pre_stress' for r in rows),
        clean_total=len(clean), normal=sum(r['mapped_label']=='normal' for r in clean),
        water_stress=sum(r['mapped_label']=='water_stress' for r in clean),
        control_plots_used=len({r['plot_id'] for r in clean if r['treatment']=='control'}),
        water_stress_plots_used=len({r['plot_id'] for r in clean if r['treatment']=='water_stress'}),
        exclusions=dict(Counter(r['exclude_reason'] for r in rows if r['exclude_reason'])),
        duplicates=duplicates, leakage=checks,
        stress_start={'season1':'unknown','season2':'unknown'},
        cross_season_physical_identity='unknown; identical numbered replicates are conservatively bound',
        label_strength='weak', disclaimer=DISCLAIMER, splits={})
    for s in ['train', 'val', 'test']:
        group = [r for r in split if r['split']==s]
        stats['splits'][s] = dict(total=len(group),
            normal=sum(r['mapped_label']=='normal' for r in group),
            water_stress=sum(r['mapped_label']=='water_stress' for r in group),
            plots=len({r['plot_id'] for r in group}),
            control_plots=len({r['plot_id'] for r in group if r['treatment']=='control'}),
            water_stress_plots=len({r['plot_id'] for r in group if r['treatment']=='water_stress'}),
            mixtures=sorted({r['cultivar_or_mixture'] for r in group}),
            season1=sum(r['season']==1 for r in group), season2=sum(r['season']==2 for r in group),
            dates=sorted({r['date'] for r in group}))
        if not all(stats['splits'][s][k]>0 for k in ['normal','water_stress','season1','season2']):
            raise ValueError(f'Incomplete class/season coverage: {s}')
    stats['training_ready_weak_baseline'] = True
    (staging/'README.md').write_text('# Model B weak-supervision baseline\n\n'+DISCLAIMER+
        '\n\nwater_stress 是实验处理组弱标签，不是逐图真实缺水状态确诊。\n'
        '模型只可解释为冠层视觉表现更接近花后亏缺灌溉处理组，或疑似水分胁迫视觉表现。\n'
        '不得解释为土壤已经缺水或小麦已经发生干旱。训练前请阅读 reports/MODEL_B_WEAK_SUPERVISION_DATASET_REPORT.md。\n',encoding='utf-8')
    (staging/'label_semantics.json').write_text(json.dumps(dict(
        label_source='treatment_assignment', label_strength='weak', confirmed_stress='unknown',
        normal='normal-irrigation/control treatment plot canopy appearance',
        water_stress='post-anthesis deficit-irrigation treatment plot canopy appearance',
        allowed_display='冠层视觉表现更接近花后亏缺灌溉处理组 / 疑似水分胁迫视觉表现',
        disclaimer=DISCLAIMER),ensure_ascii=False,indent=2),encoding='utf-8')
    staging.rename(target)
    write_csv(reports/'model_b_weak_raw_manifest.csv', rows, WEAK_FIELDS)
    write_csv(reports/'model_b_weak_clean_manifest.csv', clean, WEAK_FIELDS)
    write_csv(reports/'model_b_weak_split_manifest.csv', split, ['original_path','target_path']+WEAK_FIELDS+['split'])
    dates = []
    for (season, day) in sorted({(r['season'],r['date']) for r in clean}):
        group = [r for r in clean if r['season']==season and r['date']==day]
        dates.append(dict(season=season, date=day, das=group[0]['das'],
            normal=sum(r['mapped_label']=='normal' for r in group),
            water_stress=sum(r['mapped_label']=='water_stress' for r in group)))
    write_csv(reports/'model_b_weak_date_statistics.csv', dates, list(dates[0]))
    write_csv(reports/'model_b_weak_split_statistics.csv',
              [dict(metric=k,value=json.dumps(v,ensure_ascii=False)) for k,v in stats.items()],['metric','value'])
    (reports/'model_b_weak_integrity.json').write_text(json.dumps(dict(
        raw_before=before, raw_after=after, existing_manifests=protected, leakage=checks),indent=2),encoding='utf-8')
    (reports/'model_b_weak_audit.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
    report = '''# Model B 弱监督数据集准备报告

{disclaimer}

water_stress 为实验处理组弱标签，不是逐图真实缺水状态确诊。normal 同样仅表示 control 处理组，不保证每张图健康或没有其他胁迫。

## 规则及范围

依用户本次批准的新任务定义，全部5个明确花前日期的450张图片同时排除，包含control和亏缺组。14个后期候选日期 phase=post_anthesis_candidate。标签仅依据README p2/p4小区分配；p5阶段说明只作候选范围依据，不将花后等同真实缺水。
两季开始日期仍unknown；confirmed_stress与stress_active均unknown，没有生成confirmed_stress=true。既有严格标签清单和时间证据报告全部保留，新弱标签仅写入model_b_weak_*文件。

## 小区分组与平衡

真实编号包含r1/r2/r3，合计90个编号+重复身份。跨季物理身份未明确，保守绑定同编号+重复的全部日期。再把同品种、同重复的control/deficit两个不同小区配成平衡对，配对并不声称二者是同一小区。
seed=42，45对按31/7/7分配，得到train62、val14、test14个小区。候选中所有日期在三个split都有覆盖；两类与两季均有覆盖。
训练集覆盖全部15种品种/混合组合；val/test各覆盖7种组合，且两种处理内组合完全一致。每个验证/测试集只有7个配对组，无法各覆盖15种组合；没有为增加覆盖而拆小区。验证与测试选择不同组合，保留训练覆盖，同时减少类别与品种的混杂。
第一季189 DAS缺34张的官方相机故障导致少量类数量差异；不重采样，不扩增，不复制少数类。SHA256冲突排除，完全重复只保留一个有效代表；不凭pHash或图像颜色改标签。

## 科学限制

这是伊朗试验处理组的视觉弱监督baseline，不是黄骅田间逐图含水量标注。成熟、品种、年份、光照、冷胁迫及标尺可能混杂；README记载第二季174 DAS冷胁迫日期已在排除范围内，末期标尺日期仍按用户范围纳入，需在后续模型分析中核验这些影响。
原目录date/DAS保留，包括第一季已记录的1天差异。不能用此模型输出干旱确诊、土壤含水量或实际胁迫概率；后续本地应用需要本地实测验证。本阶段没有训练或修改推理/前端。

## 统计与完整性

```json
{stats}
```

## 同季同日类别分布

|season|date|DAS|normal|water_stress|
|---|---|---|---|---|
{dates}

所有原图采用copy2复制，逐张校验目标SHA256；raw全部文件前后哈希相同。原严格raw/clean/split manifest哈希相同。正式目录包含六个类别子目录，以及README.md、label_semantics.json。完成后停止，无训练。
'''.format(disclaimer=DISCLAIMER,stats=json.dumps(stats,ensure_ascii=False,indent=2),
           dates='\n'.join('|'+ '|'.join(str(r[k]) for k in ['season','date','das','normal','water_stress'])+'|' for r in dates))
    (reports/'MODEL_B_WEAK_SUPERVISION_DATASET_REPORT.md').write_text(report,encoding='utf-8')
    print(json.dumps(stats,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    main()
