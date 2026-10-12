"""Local AerialYield-T2M audit only. Never writes raw or classification crops."""
import csv
import hashlib
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'raw/AerialYield-T2M'
OUT = ROOT / 'reports'


def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1048576), b''):
            h.update(b)
    return h.hexdigest()


def read(p):
    with p.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(p for p in RAW.rglob('*') if p.is_file())
    print('Hashing raw files...', flush=True)
    before = {str(p.relative_to(RAW)): (p.stat().st_size, p.stat().st_mtime_ns, sha(p)) for p in files}
    digest = lambda p: before[str(p.relative_to(RAW))][2]
    yroot = RAW / 'dataset_detection_yolo/yolo'
    config = yaml.safe_load((yroot / 'tomato.yaml').read_text())
    names = config['names']
    images = read(RAW / 'metadata/image_manifest.csv')
    instances = read(RAW / 'metadata/instances.csv')
    crops = read(RAW / 'metadata/classification_crops.csv')
    im = {r['stem']: r for r in images}
    ix = {r['instance_id']: r for r in instances}
    all_csv = {p.relative_to(RAW).as_posix(): read(p) for p in sorted(RAW.glob('metadata/*.csv')) + sorted(RAW.glob('splits/*.csv'))}
    mapping_errors = [r['instance_id'] for r in instances if names.get(int(r['class_index'])) != r['class_name'] or int(r['det_label']) != int(r['class_index']) + 1]
    mapping_errors += [r['instance_id'] for r in crops if names.get(int(r['label'])) != r['class_name']]
    canonical = {p.stem: p for p in (RAW / 'dataset_images/images').glob('*') if p.is_file()}
    dimensions, extensions, hashes = Counter(), Counter(), defaultdict(list)
    corrupt, dimension_mismatch = [], []
    for i, (stem, p) in enumerate(canonical.items(), 1):
        extensions[p.suffix.lower()] += 1
        hashes[digest(p)].append(stem)
        try:
            with Image.open(p) as image:
                image.load()
                dimensions[f'{image.width}x{image.height}'] += 1
                if stem not in im or image.size != (int(im[stem]['aligned_width']), int(im[stem]['aligned_height'])):
                    dimension_mismatch.append(stem)
        except Exception as e:
            corrupt.append(dict(file=str(p.relative_to(RAW)), error=str(e)))
        if i % 100 == 0:
            print(f'Decoded {i}/{len(canonical)} originals', flush=True)
    sets, split_counts, consistency = {}, {}, []
    for s in ['train', 'val', 'test']:
        rows = all_csv[f'splits/images_{s}.csv']
        sets[s] = {r['stem'] for r in rows}
        if len(sets[s]) != len(rows): consistency.append(f'{s}: duplicate image membership')
        for r in rows:
            if r != im.get(r['stem']) or r['split'] != s: consistency.append(f'image split mismatch:{r["stem"]}')
        for kind, base, key in [('instances', ix, 'instance_id'), ('crops', {r['instance_id']: r for r in crops}, 'instance_id')]:
            rs = all_csv[f'splits/{kind}_{s}.csv']
            if {r[key] for r in rs} != {r[key] for r in base.values() if r['split'] == s}:
                consistency.append(f'{kind} membership mismatch:{s}')
            if any(r != base.get(r[key]) or r['split'] != s or r['stem'] not in sets[s] for r in rs):
                consistency.append(f'{kind} row mismatch:{s}')
        split_counts[s] = dict(images=len(rows), instances=sum(r['split'] == s for r in instances),
                              visible_fruit_count=sum(int(r['Total']) for r in rows),
                              classes=dict(Counter(r['class_name'] for r in instances if r['split'] == s)))
    pairs = [('train', 'val'), ('train', 'test'), ('val', 'test')]
    overlaps = {a+'_'+b: sorted(sets[a] & sets[b]) for a, b in pairs}
    groups, sessions = defaultdict(list), defaultdict(list)
    for row in images:
        session, frame = row['stem'].rsplit('_', 1)
        groups[session + ':' + str(int(frame)//300)].append(row)
        sessions[session].append(row)
    cross_blocks = {k: sorted({r['split'] for r in v}) for k, v in groups.items() if len({r['split'] for r in v}) > 1}
    adjacent = []
    for session, rows in sessions.items():
        ordered = sorted(rows, key=lambda r: int(r['stem'].rsplit('_', 1)[1]))
        for a, b in zip(ordered, ordered[1:]):
            if a['split'] != b['split']:
                adjacent.append(dict(a=a['stem'], b=b['stem'], frame_gap=int(b['stem'].rsplit('_',1)[1])-int(a['stem'].rsplit('_',1)[1])))
    geometry_errors, crop_errors = [], []
    expected = defaultdict(list)
    for r in instances:
        w, h = int(im[r['stem']]['aligned_width']), int(im[r['stem']]['aligned_height'])
        x1,y1,x2,y2 = [float(r[k]) for k in ['x1','y1','x2','y2']]
        if not (0 <= x1 < x2 <= w and 0 <= y1 < y2 <= h): geometry_errors.append(r['instance_id'])
        cx1,cy1,cx2,cy2 = [float(r[k]) for k in ['crop_x1','crop_y1','crop_x2','crop_y2']]
        if not (0 <= cx1 < cx2 <= w and 0 <= cy1 < cy2 <= h): crop_errors.append(r['instance_id'])
        expected[r['stem']].append([int(r['class_index']), (x1+x2)/2/w, (y1+y2)/2/h, (x2-x1)/w, (y2-y1)/h])
    actual_sets, actual_stats, label_errors, missing, orphan = {}, {}, [], [], []
    copy_mismatch, box_mismatch, boundary_rounding = [], [], []
    derivative_dimensions, derivative_corrupt = Counter(), []
    derivative_hashes = defaultdict(set)
    for s in ['train', 'val', 'test']:
        imgs = {p.stem:p for p in (yroot/'images'/s).glob('*') if p.is_file()}
        labels = {p.stem:p for p in (yroot/'labels'/s).glob('*.txt')}
        actual_sets[s] = set(imgs)
        counts = Counter(); blank = 0
        missing.extend(f'{s}/{k}' for k in imgs.keys()-labels.keys())
        orphan.extend(f'{s}/{k}' for k in labels.keys()-imgs.keys())
        for stem,p in imgs.items():
            if stem not in canonical or digest(p) != digest(canonical[stem]): copy_mismatch.append(f'{s}/{stem}')
            derivative_hashes[digest(p)].add(s)
            try:
                with Image.open(p) as image:
                    image.load()
                    derivative_dimensions[f'{image.width}x{image.height}'] += 1
            except Exception as exc:
                derivative_corrupt.append(dict(file=f'{s}/{stem}', error=str(exc)))
        for stem,p in labels.items():
            parsed=[]
            lines=p.read_text(encoding='utf-8-sig').splitlines()
            if not any(l.strip() for l in lines): blank+=1
            for lineno,l in enumerate(lines,1):
                if not l.strip():continue
                try:
                    fields=l.split()
                    if len(fields)!=5: raise ValueError('expected five fields')
                    cid=int(fields[0]); vals=list(map(float,fields[1:])); x,y,w,h=vals
                    if cid not in names or not all(math.isfinite(v) for v in vals):raise ValueError('class or finite check')
                    if not (0<=x<=1 and 0<=y<=1 and 0<w<=1 and 0<h<=1):raise ValueError('normalization/area')
                    excess=max(0,w/2-x,h/2-y,x+w/2-1,y+h/2-1)
                    if excess>0:
                        boundary_rounding.append(dict(file=f'{s}/{stem}',line=lineno,excess=excess))
                    if excess>1e-7:raise ValueError('bbox out of bounds beyond 8-decimal rounding')
                    counts[names[cid]]+=1;parsed.append([cid]+vals)
                except Exception as e:label_errors.append(dict(file=f'{s}/{stem}',line=lineno,error=str(e)))
            target=expected.get(stem,[])
            if len(parsed)!=len(target) or (parsed and not np.allclose(sorted(parsed),sorted(target),atol=1e-7,rtol=0)):
                box_mismatch.append(f'{s}/{stem}')
        actual_stats[s]=dict(images=len(imgs),labels=len(labels),instances=sum(counts.values()),classes=dict(counts),empty_labels=blank,
                             additional_vs_csv=sorted(set(imgs)-sets[s]),missing_vs_csv=sorted(sets[s]-set(imgs)))
    actual_overlaps={a+'_'+b:sorted(actual_sets[a]&actual_sets[b]) for a,b in pairs}
    checksum_matched, checksum_failed, absent = 0, [], []
    for line in (RAW/'checksums.sha256').read_text().splitlines():
        checksum,rel=line.split(maxsplit=1);rel=rel.lstrip('*')
        if rel.startswith('dataset/images/'):
            p=RAW/'dataset_images/images'/rel.removeprefix('dataset/images/')
        elif rel.startswith('dataset/detection/yolo/'):
            p=yroot/rel.removeprefix('dataset/detection/yolo/')
        else:absent.append(rel);continue
        if not p.exists():absent.append(rel)
        elif digest(p)!=checksum:checksum_failed.append(rel)
        else:checksum_matched+=1
    distribution={name:dict(total=sum(r['class_name']==name for r in instances),**{s:split_counts[s]['classes'].get(name,0) for s in sets}) for name in names.values()}
    duplicates=[v for v in hashes.values() if len(v)>1]
    blocking=[]
    for condition,message in [(bool(corrupt),'Corrupt originals'),(bool(consistency),'Split/metadata inconsistency'),
        (bool(mapping_errors),'Class mapping conflicts'),(bool(geometry_errors or crop_errors),'Invalid metadata geometry'),
        (bool(label_errors),'Invalid YOLO lines'),(bool(box_mismatch),'YOLO boxes differ from metadata'),
        (bool(derivative_corrupt),'Corrupt YOLO derivative images'),
        (any(actual_overlaps.values()),'YOLO physical split folders overlap; do not inherit their folder membership'),
        (bool(checksum_failed),'Local files fail supplied checksums')]:
        if condition:blocking.append(message)
    metadata_safe=not (corrupt or consistency or mapping_errors or geometry_errors or crop_errors or dimension_mismatch or cross_blocks or any(overlaps.values()))
    result=dict(dataset_name='AerialYield-T2M',dataset_source='Local release README; https://github.com/afeefaaazam03/Tomato_dataset; accompanying Data Descriptor not supplied/verified',license='CC-BY 4.0',
        image_count=len(canonical),annotation_count=len(instances),raw_visible_fruit_count=sum(int(r['Total']) for r in images),
        class_mapping=names,metadata_detection_mapping={str(i+1):v for i,v in names.items()},
        class_mapping_note='YOLO yaml and txt/class_index use 0-5; metadata det_label and README semantic/detection identifiers use 1-6. Do not pass det_label directly to YOLO.',
        class_distribution=distribution,imbalance_ratio=max(v['total'] for v in distribution.values())/min(v['total'] for v in distribution.values()),
        official_split=dict(source='splits/images_*.csv (consistent with metadata)',unit='300-frame-number blocks within session; not session-held-out',overlaps=overlaps),
        split_distribution=split_counts,yolo_physical_split=actual_stats,yolo_physical_overlap=actual_overlaps,
        image_extensions=dict(extensions),image_dimensions=dict(dimensions),corrupt_count=len(corrupt),corrupt_files=corrupt,
        duplicate_count=sum(len(v)-1 for v in duplicates),duplicate_groups=duplicates,duplicate_group_count=len(duplicates),
        duplicate_pairs=sum(len(v)*(len(v)-1)//2 for v in duplicates),dimension_mismatch=dimension_mismatch,
        label_audit=dict(format='class_id x_center y_center width height',txt_count=sum(v['labels'] for v in actual_stats.values()),missing_labels=missing,orphan_labels=orphan,invalid_lines=label_errors,boundary_rounding_cases=boundary_rounding,metadata_box_mismatches=box_mismatch,image_copy_mismatches=copy_mismatch),
        yolo_derivative_images=dict(dimensions=dict(derivative_dimensions),corrupt=derivative_corrupt,
                                   note='YOLO images are processed derivatives, not byte-identical canonical originals. Use canonical image geometry for metadata crop coordinates.',
                                   cross_split_sha256_groups={a+'_'+b:sum(a in v and b in v for v in derivative_hashes.values()) for a,b in pairs}),
        metadata_schema={k:list(v[0]) for k,v in all_csv.items()},metadata_consistency_errors=consistency,mapping_errors=mapping_errors,
        invalid_metadata_boxes=geometry_errors,invalid_metadata_crops=crop_errors,
        group_information=dict(group_count=len(groups),cross_split_blocks=cross_blocks,derivation='session=stem without last underscore-number; frame=last number; group=session+floor(frame/300), verified against CSV',
                               sessions={k:dict(images=len(v),splits=sorted({r['split'] for r in v})) for k,v in sessions.items()},
                               fruit_identity_available=False,instance_id_semantics='per-frame annotation identifier, not persistent tracked fruit ID',plant_row_camera_scene_id_available=False,adjacent_cross_split_frames=adjacent),
        leakage_risk='Continuous frames and repeated fruit remain possible across different blocks of the same session. Physical YOLO folders also contain cross-split repeated frames. CSV splits are block-disjoint, not fruit/session-independent.',
        classification_crop_feasibility=dict(technically_feasible=metadata_safe,requires='Use canonical originals + instances geometry/class_index + split CSV membership only; original absolute E: paths must be resolved by validated stem. Do not random-split crops. Validate derived crop quality and duplicate leakage before training.'),
        training_ready=False,blocking_issues=blocking,recommended_next_step='Resolve/record split provenance discrepancy without touching raw; construct only from official CSV membership after audit review, preserve frame/block groups, then inspect crops and cross-split near duplicates. No training yet.',
        checksums=dict(matched=checksum_matched,failed=checksum_failed,unavailable_count=len(absent),note='Only supplied image/YOLO components resolved; masks/COCO are outside this local subset. README claims 8075 entries; actual count recorded.',entry_count=len((RAW/'checksums.sha256').read_text().splitlines())),
        local_qingxian_validated=False)
    print('Checking raw hashes after audit...',flush=True)
    after={str(p.relative_to(RAW)):(p.stat().st_size,p.stat().st_mtime_ns,sha(p)) for p in sorted(RAW.rglob('*')) if p.is_file()}
    assert before==after,'raw changed during audit'
    result['raw_modification']=0
    (OUT/'tomato_model_b_dataset_audit_v1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    report=['# TOMATO MODEL B 数据集审计 V1','',
        '只读本地 AerialYield-T2M；未训练、未修改raw、未随机划分、未生成分类裁图。',
        '来源：本地README指定的公开温室双模态番茄数据集；代码来源 https://github.com/afeefaaazam03/Tomato_dataset 。未联网，未将未提供的论文当作已核验资料。License：CC-BY 4.0。',
        '**local_qingxian_validated = false；不是青县本地采集数据。**','',
        '## 实际类别映射','',result['class_mapping_note'],'',
        '| YOLO/class_index | 名称 | det_label/semantic ID | 总实例 | Train | Val | Test |','|---:|---|---:|---:|---:|---:|---:|']
    for i,name in names.items():
        d=distribution[name];report.append(f'| {i} | {name} | {i+1} | {d["total"]} | {d["train"]} | {d["val"]} | {d["test"]} |')
    report += ['',f'最大/最小类比例={result["imbalance_ratio"]:.2f}，严重不平衡；本次未做重采样或权重调整。',
        f'原始图片={len(canonical)}；原始visible-fruit Total={result["raw_visible_fruit_count"]}；几何过滤后实例={len(instances)}。两种计数不能混用。',
        f'图片尺寸：{dict(dimensions)}；扩展名：{dict(extensions)}；损坏={len(corrupt)}；SHA完全重复组={len(duplicates)}，多余副本={result["duplicate_count"]}。','',
        '## 官方split与实际YOLO目录不一致','',
        '官方CSV划分：'+json.dumps(split_counts,ensure_ascii=False),
        '实际路径为dataset_images/images及dataset_detection_yolo/yolo/{images,labels}/{train,val,test}。',
        '实际YOLO目录：'+json.dumps({s:{k:v for k,v in d.items() if k in ['images','labels','instances','empty_labels']} for s,d in actual_stats.items()}),
        'CSV图片交集：'+json.dumps({k:len(v) for k,v in overlaps.items()}),
        '实际YOLO目录图片交集：'+json.dumps({k:len(v) for k,v in actual_overlaps.items()}),
        'YOLO派生图尺寸：'+json.dumps(dict(derivative_dimensions))+'；损坏='+str(len(derivative_corrupt))+'。不能对派生图直接使用原图像素坐标。',
        'YOLO跨split相同SHA256组：'+json.dumps(result['yolo_derivative_images']['cross_split_sha256_groups']),
        f'非法行={len(label_errors)}；无标注图片={len(missing)}；孤立label={len(orphan)}；与metadata框不一致文件={len(box_mismatch)}。',
        '标注五列格式已解析；微小边界浮点舍入也记录在JSON中，未修正raw。',
        '重复物理split里的实例不能累计作为独立实例。原YOLO yaml包含作者机器绝对路径，不适合直接启动训练。','',
        '## group与泄漏风险','',
        f'按README规则恢复{len(groups)}个session内300帧编号块，跨CSV split块={len(cross_blocks)}。',
        'session从stem最后一个数字前缀恢复；块内多帧全部继承同一split。各session跨split分布见JSON，不能声称session-held-out。',
        f'发现{len(adjacent)}对按编号相邻且跨split的帧边界；最小间隔={min((x["frame_gap"] for x in adjacent),default=None)}。',
        'metadata有stem/image_path/filename、instance_id、annotation_id、source、modality、split及几何字段；没有可靠持久fruit_id、plant_id、row_id、scene_id或相机标定字段。文件名时间/帧号是来源线索，不等于每张真实采集时间。',
        '同果实可能在连续帧重复出现，instance_id不是跨帧果实身份。本次未用视觉近似度证明果实独立。','',
        '## Crop分类可行性','',
        f'几何和metadata路径方案可行={metadata_safe}；training_ready=false。',
        '建议用原始frame与instances.csv中的class_index及bbox/crop_bbox、官方CSV split生成单果实候选，保留frame/session/block/instance_id。所有同frame裁图留在同split，禁止crop随机划分。',
        '几何有效不能保证裁图只含单果、无背景或无邻果。未来生成后需检查质量、小目标及跨块近重复；当前不生成。',
        '## 阻塞项','']+['- '+x for x in blocking]
    report += ['', '## 校验与下一步','',json.dumps(result['checksums'],ensure_ascii=False),
        '不能仅凭现象断言是本地解压残留；供应checksum是否包含这些文件见上述校验，目录划分与CSV不一致必须明确记录。',
        result['recommended_next_step'],'raw_modification=0；前后全文件SHA256、大小和mtime一致。']
    (OUT/'TOMATO_MODEL_B_DATASET_AUDIT_V1.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print(json.dumps({k:result[k] for k in ['image_count','annotation_count','class_distribution','duplicate_count','corrupt_count','blocking_issues','checksums']},ensure_ascii=False),flush=True)


if __name__=='__main__':
    main()
