"""Evidence-only audit. Does not call preparation, relabel, split, or train."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import csv
from datetime import date, timedelta
import hashlib
import json
from pathlib import Path
import re

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / 'reports'
RAW = ROOT / 'raw/canopy_water_stress'
PAPER_URL = 'https://link.springer.com/article/10.1186/s13007-022-00891-1'
PAPER_TITLE = 'Wheat grain width: a clue for re-exploring visual indicators of grain weight'
KEYWORDS = ['anthesis', 'flowering', 'irrigation', 'deficit', 'well-irrigated',
            'field capacity', 'FC', '50%', 'post-anthesis', 'watering', 'water',
            'treatment', 'season', 'date', 'DAS', 'heading', 'Zadoks', 'GS60', 'GS65']
DIRECTORY = re.compile(r'([12])(?:st|nd)S_(\d+)DAS_(\d{8})')


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for part in iter(lambda: stream.read(1024*1024), b''):
            h.update(part)
    return h.hexdigest()


def csv_write(path, rows, fields):
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        w = csv.DictWriter(stream, fieldnames=fields)
        w.writeheader(); w.writerows(rows)


def main():
    # Only new evidence reports are written; snapshot all existing manifests.
    protected = sorted(REPORTS.glob('model_b*manifest.csv'))
    before = {str(p): digest(p) for p in protected}
    with (REPORTS / 'model_b_raw_manifest.csv').open(encoding='utf-8-sig', newline='') as f:
        manifest = list(csv.DictReader(f))
    with pymupdf.open(RAW / 'README.pdf') as document:
        pages = [page.get_text() for page in document]
    keyword_contexts = []
    for page_no, text in enumerate(pages, 1):
        lines = text.splitlines()
        selected, hits = set(), {}
        for word in KEYWORDS:
            pattern = re.compile(r'\b' + re.escape(word) + (r'\b' if word[-1].isalnum() else ''), re.I)
            indices = [i for i, line in enumerate(lines) if pattern.search(line)]
            hits[word] = indices
            for i in indices:
                selected.update(range(max(0, i-3), min(len(lines), i+4)))
        if selected:
            excerpt = '\n'.join(f'L{i+1}: {lines[i]}' for i in sorted(selected))
            keyword_contexts.append(f'README.pdf page {page_no}\nKeywords: '+ ', '.join(k for k,v in hits.items() if v) + '\n' + excerpt)
    # Append the COMPLETE README as context so table columns and paragraphs
    # remain recoverable even when isolated keyword windows are insufficient.
    (REPORTS / 'model_b_stress_readme_contexts.txt').write_text(
        '\n\n'.join(keyword_contexts) + '\n\nFULL README\n' +
        '\n\n'.join(f'PAGE {i+1}\n{p}' for i,p in enumerate(pages)), encoding='utf-8')
    table = pages[4]
    matches = list(DIRECTORY.finditer(table))
    stages = {}
    for i, m in enumerate(matches):
        block = table[m.end():matches[i+1].start() if i+1 < len(matches) else len(table)]
        nonempty = [s.strip() for s in block.splitlines() if s.strip()]
        stages[m.group()] = nonempty[1]
    # These dates use independently checked EXTERNAL PAPER evidence, not an
    # attribution to README. The same month/day also appears in README p1.
    sowing = {1: date(2014,11,20), 2: date(2015,11,5)}
    timeline, boundaries = [], []
    for directory in sorted(RAW.iterdir()):
        m = DIRECTORY.fullmatch(directory.name)
        if not m or not directory.is_dir():
            continue
        season, das, stamp = m.groups(); season, das = int(season), int(das)
        folder_date = date(int(stamp[:4]), int(stamp[4:6]), int(stamp[6:]))
        calculated = sowing[season] + timedelta(days=das)
        stage = stages[directory.name]
        pre = any(t in stage.lower() for t in ['tillering', 'booting'])
        post = any(t in stage.lower() for t in ['grain filling', 'ripen', 'anthesis just finished'])
        # Flowering/post-anthesis is NOT proof that first deficit irrigation
        # has taken place. Never produce confirmed_post_stress from phenology.
        timeline.append(dict(season=season, das=das, folder_date=folder_date.isoformat(),
            calculated_date_from_sowing=calculated.isoformat(),
            difference_days=(folder_date-calculated).days,
            image_count=sum(r['relative_path'].split('/')[0] == directory.name for r in manifest),
            sowing_date=sowing[season].isoformat(), sowing_evidence_type='external paper evidence',
            sowing_source=PAPER_URL, sowing_locator='Methods > Field experiment, planting-date paragraph',
            sowing_evidence_level='B', canopy_stage=stage,
            anthesis_status='confirmed_pre_anthesis' if pre else ('clearly_post_anthesis' if post else 'uncertain'),
            date_status='confirmed_pre_stress' if pre else 'uncertain',
            source='raw/canopy_water_stress/README.pdf', locator=f'p5 Dataset overview: {directory.name}',
            evidence_level='A', scope='canopy-level stage description; not individual-plot anthesis date',
            usable_for_formal_labels='false'))
        boundaries.append(dict(season=season, evidence_type='official_stage_observation',
            source='raw/canopy_water_stress/README.pdf', locator=f'p5 Dataset overview: {directory.name}',
            quote_or_summary=stage, observation_date=folder_date.isoformat(), observation_das=das,
            anthesis_date='unknown', anthesis_das='unknown', stress_start_date='unknown', stress_start_das='unknown',
            confidence='high for published canopy stage; unknown for exact onset', evidence_level='A',
            date_status='confirmed_pre_stress' if pre else 'uncertain',
            usable_for_formal_labels='false', limitation='Stage observation does not date the first post-anthesis irrigation event.'))
    for season in [1,2]:
        boundaries.append(dict(season=season, evidence_type='external paper evidence',
            source=PAPER_URL, locator='Methods > Field experiment, planting-date paragraph',
            quote_or_summary=f'{PAPER_TITLE}: corresponding growing seasons 2014-15 and 2015-16; season {season} planting date {sowing[season]}.',
            observation_date='unknown', observation_das='unknown', anthesis_date='unknown', anthesis_das='unknown',
            stress_start_date='unknown', stress_start_das='unknown', confidence='high for planting date only',
            evidence_level='B', date_status='uncertain', usable_for_formal_labels='false',
            limitation='Sowing date is not an anthesis date or a stress-onset date.'))
        boundaries.append(dict(season=season, evidence_type='same_experiment_irrigation_rule',
            source=PAPER_URL, locator='Methods > Field experiment, irrigation paragraph',
            quote_or_summary='"from the first irrigation after anthesis"; summary: deficit irrigation reduces irrigation to 50% of evapotranspirational demand; regular interval 10 days.',
            observation_date='unknown', observation_das='unknown', anthesis_date='unknown', anthesis_das='unknown',
            stress_start_date='unknown', stress_start_das='unknown', confidence='high for relative timing; unknown for calendar date/DAS',
            evidence_level='B', date_status='uncertain', usable_for_formal_labels='false',
            limitation='No first irrigation date, irrigation phase anchor, or plot-level anthesis event given. Do not equate anthesis with stress onset; README uses 50% FC, paper uses evapotranspirational demand.'))
    timeline.sort(key=lambda row: (row['season'], row['folder_date']))
    csv_write(REPORTS / 'model_b_date_timeline.csv', timeline, list(timeline[0]))
    csv_write(REPORTS / 'model_b_stress_start_evidence.csv', boundaries, list(boundaries[0]))
    prior = json.loads((REPORTS / 'model_b_raw_integrity.json').read_text(encoding='utf-8'))['after_sha256']
    paths = sorted(p for p in RAW.rglob('*') if p.is_file())
    with ThreadPoolExecutor(max_workers=4) as pool:
        hashes = list(pool.map(digest, paths))
    current = {p.relative_to(RAW).as_posix(): h for p,h in zip(paths, hashes)}
    raw_changes = sum(current.get(k) != prior.get(k) for k in prior.keys() | current.keys())
    after = {str(p): digest(p) for p in protected}
    if before != after or raw_changes:
        raise RuntimeError('Protected data changed during evidence audit')
    pre = [r for r in timeline if r['date_status'] == 'confirmed_pre_stress']
    unknown = [r for r in timeline if r['date_status'] == 'uncertain']
    report = '''# Model B：胁迫开始时间证据核验

## 结论

两季精确 anthesis date/DAS 均 unknown；两季首次花后亏缺灌溉 date/DAS 均 unknown。
找到 B 级同一实验的**相对时间规则**：处理从开花后的第一次灌溉开始，不能等同开花当天。仍没有 A/B 级证据支持精确开始日期。

cannot safely construct normal/water_stress image classifier from this dataset with the current metadata

## 本地检索范围

完整读取本地 README.pdf 全部 5 页，关键词包含 anthesis、flowering、irrigation、deficit、well-irrigated、field capacity、FC、50%、post-anthesis、watering、water、treatment、season、date、DAS、heading、Zadoks、GS60、GS65。所有命中上下文与完整原文见 model_b_stress_readme_contexts.txt。
对 agric 下 43 份 PDF 提取文字并检索目标 DOI/作者，只有此 README 匹配，未找到三篇目标实验论文的本地全文。相关本地文字/metadata 检索也未找到新增开始时间证据。此结果仅适用于已扫描项目，不声称检查了电脑其他磁盘。

## 证据来源与等级

- A：README p1、p2/p4 确定处理为花后亏缺灌溉、50% FC，1–15 为 control、16–30 为 deficit treatment，各有 r1/r2/r3。
- A：README p5 给出拍摄当天冠层阶段，不能直接证明首次亏缺灌溉已实施。
- B：[Wheat grain width: a clue for re-exploring visual indicators of grain weight](https://link.springer.com/article/10.1186/s13007-022-00891-1)，Methods > Field experiment。论文描述同一地点、两季、90小区、15混合处理，并引用主实验 DOI 10.1016/j.eja.2020.126188，因此可作为同一实验的公开方法证据。
- B：该论文说明两季播种月日为 11月20日、11月5日；结合明确的2014–15和2015–16季节记录，时间线以2014-11-20、2015-11-05计算，来源标为 external paper evidence。README p1 **也确实写出这两个月日**，不能说 README 未包含；这里以独立外部论文作主引用，而非伪造来源。
- B：该论文明确“from the first irrigation after anthesis”，但没有给首次灌溉的具体日期。10天灌溉间隔没有时间锚点，不能倒推事件。
- 差异：README使用50% field capacity，论文灌溉段使用50%蒸散需求；保留原说法，不擅自认定二者的量化定义完全相同。
- C：根据冠层阶段可以提出大致开花阶段窗口，但混合品种物候并不一致，不能给每个小区赋同一开花日期，也不能将窗口变成正式标签。
- D：凭照片外观、灌浆期、成熟期或10天间隔猜测开始日，禁止用于标签。

## 目标实验论文的获取核查

|资料|可核验内容|限制|
|---|---|---|
|10.1016/j.eja.2020.126188|出版者索引/摘要确认2014–15、2015–16及花后研究|ScienceDirect正文访问失败，未取得可核验方法全文或灌溉事件表|
|10.1016/j.compag.2020.105740|出版者索引摘要确认同一两季、90小区试验|ScienceDirect正文403；未取得开始日期|
|10.1016/j.compag.2018.11.020|出版者索引/摘要及README对应引用|ScienceDirect正文403；2017预印本10.1101/239798的PDF也403；不把摘要当作方法全文|
|10.1186/s13007-022-00891-1|开放出版者HTML的完整Methods已核验|相对开始规则明确，精确事件日期仍缺失|

上述访问状态为本次核查结果，不表示文献不存在，也不表示论文全文一定未记载日期。没有将搜索摘要当作精确时间证据。

## 两季时间结论

|season|anthesis date|anthesis DAS|stress start date|stress start DAS|精确日期证据|相对开始规则|
|---|---|---|---|---|---|---|
|1|unknown|unknown|unknown|unknown|无可用A/B|B：开花后的第一次灌溉|
|2|unknown|unknown|unknown|unknown|无可用A/B|B：开花后的第一次灌溉|

辅助开花阶段窗口：第一季在2015-04-25（155 DAS，孕穗）至2015-05-15（175 DAS，灌浆）之间；第二季在2016-04-27（174 DAS，孕穗至出穗）至2016-05-11（188 DAS，开花刚结束）之间。窗口推导为 C，仅表述冠层阶段转换，**不是每小区50%开花日或处理开始日**。第二季5月11日“anthesis just finished”只确认当天冠层描述，不表示开花刚结束后已经完成第一次亏缺灌溉。

## 播种日期与目录DAS核对

difference_days = folder_date − (外部论文播种日期 + 原目录DAS)。第一季7个日期全部 +1 天；第二季12个日期全部0。原目录DAS和日期均保留，不改1天差异。

|season|DAS|folder_date|calculated_date|difference_days|images|anthesis_status|stress date_status|
|---|---|---|---|---|---|---|---|
{timeline}

## 可安全报告的日期边界

confirmed_pre_stress：{pre}

confirmed_post_stress：无。不能把 clearly_post_anthesis 代换为 confirmed_post_stress。

uncertain：{unknown}

5个花前日期共有450张图；其中225张属于亏缺处理小区。其余14个日期共有1226张图，冠层描述进入花后，但精确水分处理状态仍不确定。本次所有 date_status 只用于证据审核，不回写 raw/clean manifest，不产生训练标签。

## 完整性与停止条件

已有 raw/clean/split manifest SHA256 前后相同；raw 下全部1677个文件（1676图像+README）相对上一完整性审计，修改/删除/新增数为 {raw_changes}。
没有训练，没有划分，没有创建训练目录，没有修改既有标签或准备脚本。下一步需要原实验两季**首次花后亏缺灌溉事件日期**和其对应DAS/计日定义，以及必要的品种/小区差异说明；在获得之前保持 blocked。
'''.format(timeline='\n'.join('|'+ '|'.join(str(r[k]) for k in ['season','das','folder_date','calculated_date_from_sowing','difference_days','image_count','anthesis_status','date_status'])+'|' for r in timeline),
           pre=', '.join(f"season{r['season']} {r['folder_date']} ({r['das']} DAS)" for r in pre),
           unknown=', '.join(f"season{r['season']} {r['folder_date']} ({r['das']} DAS)" for r in unknown), raw_changes=raw_changes)
    (REPORTS / 'MODEL_B_STRESS_START_EVIDENCE.md').write_text(report, encoding='utf-8')
    print(json.dumps(dict(timeline_rows=len(timeline), evidence_rows=len(boundaries),
        confirmed_pre_stress=len(pre), confirmed_post_stress=0, uncertain=len(unknown),
        manifests_unchanged=before == after, raw_changes=raw_changes,
        stress_start={'season1':'unknown','season2':'unknown'},
        result='cannot safely construct normal/water_stress image classifier from this dataset with the current metadata'), indent=2))


if __name__ == '__main__':
    main()
