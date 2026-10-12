"""Deterministic lossless crops and leakage audit; no training or raw writes."""
import csv
import hashlib
import itertools
import json
import math
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'raw/AerialYield-T2M'
DEST = ROOT / 'data/tomato_ripeness_classifier_v1'
REPORTS = ROOT / 'reports'
PADDING_RATIO = 0.05  # V1 fixed; no Test-based search
CLASSES = ['green', 'breakers', 'turning', 'pink', 'light_red', 'red']
DISPLAY = ['Green', 'Breakers', 'Turning', 'Pink', 'Light Red', 'Red']
SPLITS = ['train', 'val', 'test']
NEAR_DISTANCE = 4  # 64-bit dHash; fixed audit criterion, not identity confirmation


def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1048576), b''):
            h.update(b)
    return h.hexdigest()


def snapshot():
    return {p.relative_to(RAW).as_posix(): [p.stat().st_size, p.stat().st_mtime_ns, sha(p)]
            for p in sorted(RAW.rglob('*')) if p.is_file()}


def read(p):
    with p.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def write(p, rows, fields):
    with p.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def dhash(im):
    # Resizing is used ONLY for hash calculation, never for saved crop pixels.
    a = np.asarray(im.convert('L').resize((9, 8), Image.Resampling.LANCZOS))
    bits = (a[:, 1:] > a[:, :-1]).ravel()
    return int.from_bytes(np.packbits(bits).tobytes(), 'big')


def main():
    assert PADDING_RATIO == .05
    print('Snapshot raw hashes before build...', flush=True)
    before = snapshot()
    instances = read(RAW / 'metadata/instances.csv')
    image_meta = {r['stem']: r for r in read(RAW / 'metadata/image_manifest.csv')}
    membership = {}
    for split in SPLITS:
        for row in read(RAW / f'splits/images_{split}.csv'):
            if row['stem'] in membership:
                raise ValueError('Official split overlaps')
            membership[row['stem']] = split
    assert len(membership) == 677 and len(instances) == 14190
    assert len({r['instance_id'] for r in instances}) == len(instances)
    sources = {p.stem: p for p in (RAW / 'dataset_images/images').glob('*.jpg')}
    config = dict(source='AerialYield-T2M', padding_ratio=PADDING_RATIO,
                  minimum_crop_side=8, very_small_side=16, encoding='PNG lossless',
                  bbox='metadata x1,y1,x2,y2; exclusive upper bound',
                  rounding='floor lower / ceil upper padded bounds, clipped to image',
                  class_mapping={str(i): c for i, c in enumerate(CLASSES)},
                  raw_snapshot_sha256=hashlib.sha256(json.dumps(before, sort_keys=True).encode()).hexdigest())
    marker = DEST / 'manifests/build_config.json'
    if DEST.exists():
        if not marker.exists() or json.loads(marker.read_text(encoding='utf-8')) != config:
            raise RuntimeError('Existing destination is not this exact build; refusing to mix or delete files')
    for s in SPLITS:
        for c in CLASSES:
            (DEST / s / c).mkdir(parents=True, exist_ok=True)
    manifests = DEST / 'manifests'
    manifests.mkdir(exist_ok=True)
    marker.write_text(json.dumps(config, indent=2), encoding='utf-8')
    grouped = defaultdict(list)
    for row in instances:
        grouped[row['stem']].append(row)
    rows, rejected = [], []
    reject_fields = ['source_image', 'instance_id', 'class_name', 'split', 'reason', 'bbox', 'details']
    for index, (stem, group) in enumerate(sorted(grouped.items()), 1):
        source = sources.get(stem)
        image = None
        if source is not None:
            image = Image.open(source)
            image.load()
            if image.mode != 'RGB':
                raise ValueError('Unexpected source mode; no automatic color conversion')
            if image.size != (int(image_meta[stem]['aligned_width']), int(image_meta[stem]['aligned_height'])):
                raise ValueError('Source geometry differs from metadata')
        for row in group:
            split = membership.get(stem, '')
            rejection = dict(source_image=stem, instance_id=row['instance_id'], class_name=row['class_name'],
                             split=split, reason='', bbox=json.dumps([row.get(k) for k in ['x1','y1','x2','y2']]), details='')
            try:
                if not split: raise ValueError('missing_official_split')
                if image is None: raise ValueError('missing_source_image')
                try: cid = int(row['det_label']) - 1
                except (ValueError, KeyError): raise ValueError('unknown_class')
                if not 0 <= cid < 6: raise ValueError('unknown_class')
                if DISPLAY[cid] != row['class_name'] or int(row['class_index']) != cid:
                    raise ValueError('metadata_error')
                x1,y1,x2,y2 = [float(row[k]) for k in ['x1','y1','x2','y2']]
                if not all(math.isfinite(v) for v in [x1,y1,x2,y2]) or not (0<=x1<x2<=image.width and 0<=y1<y2<=image.height):
                    raise ValueError('invalid_bbox')
                w,h = x2-x1,y2-y1
                bounds = (max(0, math.floor(x1-w*PADDING_RATIO)), max(0, math.floor(y1-h*PADDING_RATIO)),
                          min(image.width, math.ceil(x2+w*PADDING_RATIO)), min(image.height, math.ceil(y2+h*PADDING_RATIO)))
                cw,ch = bounds[2]-bounds[0],bounds[3]-bounds[1]
                if min(cw,ch)<8:
                    rejection['details']=json.dumps(dict(bbox_width=w,bbox_height=h,bbox_area=w*h,crop_width=cw,crop_height=ch,padding_ratio=PADDING_RATIO))
                    raise ValueError('too_small_for_classification')
                session,frame = stem.rsplit('_',1)
                block = session+':'+str(int(frame)//300)
                filename = f'{split}__{stem}__inst_{row["annotation_id"]}__cls_{cid}.png'
                target = DEST/split/CLASSES[cid]/filename
                crop = image.crop(bounds)
                if target.exists():
                    with Image.open(target) as old:
                        if old.mode != crop.mode or old.size != crop.size or old.tobytes()!=crop.tobytes():
                            raise RuntimeError(f'Existing crop differs, refusing overwrite: {target}')
                else: crop.save(target,format='PNG',compress_level=6)
                with Image.open(target) as check:
                    check.load()
                    assert check.size==crop.size and check.tobytes()==crop.tobytes(), 'Lossless crop verification failed'
                rows.append(dict(crop_path=target.relative_to(ROOT).as_posix(),crop_filename=filename,split=split,
                    class_id=cid,class_name=CLASSES[cid],metadata_det_label=int(row['det_label']),
                    source_image=source.name,source_image_path=source.relative_to(ROOT).as_posix(),session_id=session,
                    frame_id=frame,block_id=block,instance_id=row['instance_id'],annotation_id=row['annotation_id'],
                    bbox_x1=x1,bbox_y1=y1,bbox_x2=x2,bbox_y2=y2,bbox_width=w,bbox_height=h,bbox_area=w*h,
                    crop_x1=bounds[0],crop_y1=bounds[1],crop_x2=bounds[2],crop_y2=bounds[3],crop_width=cw,crop_height=ch,
                    padding_ratio=PADDING_RATIO,quality_flag='very_small' if min(cw,ch)<16 else 'ok',
                    source_sha256=before[source.relative_to(RAW).as_posix()][2],crop_sha256=sha(target),
                    pixel_sha256=hashlib.sha256(f'{cw}x{ch}:RGB:'.encode()+crop.tobytes()).hexdigest(),dhash=f'{dhash(crop):016x}'))
            except (ValueError,KeyError) as exc:
                reason=str(exc)
                rejection['reason']=reason if reason in ['missing_official_split','missing_source_image','unknown_class','invalid_bbox','too_small_for_classification','metadata_error'] else 'metadata_error'
                if not rejection['details']:rejection['details']=str(exc)
                rejected.append(rejection)
        if image is not None: image.close()
        if index%50==0:print(f'Frames {index}/{len(grouped)}; crops {len(rows)}; rejected {len(rejected)}',flush=True)
    assert len(rows)+len(rejected)==len(instances)
    assert len({r['crop_filename'] for r in rows})==len(rows)
    assert {p.resolve() for s in SPLITS for p in (DEST/s).rglob('*') if p.is_file()}=={(ROOT/r['crop_path']).resolve() for r in rows}, 'Unexpected stale output files'
    write(manifests/'tomato_ripeness_crops_manifest.csv',rows,list(rows[0]))
    write(manifests/'tomato_ripeness_rejected.csv',rejected,reject_fields)
    pairs=list(itertools.combinations(SPLITS,2))
    def overlaps(key):
        sets={s:{r[key] for r in rows if r['split']==s} for s in SPLITS}
        return {a+'_'+b:sorted(sets[a]&sets[b]) for a,b in pairs}
    source_overlap=overlaps('source_image');block_overlap=overlaps('block_id')
    exact,within,cross=[],Counter(),Counter()
    byhash=defaultdict(list)
    for r in rows:byhash[r['crop_sha256']].append(r)
    for group in byhash.values():
        for a,b in itertools.combinations(group,2):
            key='_'.join(sorted([a['split'],b['split']],key=SPLITS.index))
            (within if a['split']==b['split'] else cross)[key]+=1
            exact.append(dict(crop_a=a['crop_filename'],crop_b=b['crop_filename'],split_a=a['split'],split_b=b['split'],sha256=a['crop_sha256']))
    write(manifests/'exact_duplicate_pairs.csv',exact,['crop_a','crop_b','split_a','split_b','sha256'])
    print('Cross-split perceptual duplicate audit...',flush=True)
    near_counts=Counter();adjacent_counts=Counter()
    # LUT + bounded blocks exhaustively compare all cross-split crop pairs.
    lut=np.array([i.bit_count() for i in range(256)],dtype=np.uint8)
    fields=['crop_a','crop_b','split_a','split_b','class_a','class_b','dhash_distance','same_session','frame_gap','adjacent_sampled_frames','same_session_close_frame_risk']
    adjacent=set()
    sessions=defaultdict(set)
    for stem in membership:
        s,f=stem.rsplit('_',1);sessions[s].add(int(f))
    for s,frames in sessions.items():
        seq=sorted(frames)
        adjacent.update((s,a,b) for a,b in zip(seq,seq[1:]))
    with (manifests/'near_duplicate_candidates_cross_split.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
        for sa,sb in pairs:
            aa=[r for r in rows if r['split']==sa];bb=[r for r in rows if r['split']==sb]
            bh=np.array([int(r['dhash'],16) for r in bb],dtype=np.uint64)
            for start in range(0,len(aa),64):
                ar=aa[start:start+64];ah=np.array([int(r['dhash'],16) for r in ar],dtype=np.uint64)
                xor=np.bitwise_xor(ah[:,None],bh[None,:])
                distances=lut[xor.view(np.uint8).reshape(len(ar),len(bb),8)].sum(axis=2)
                ii,jj=np.where(distances<=NEAR_DISTANCE)
                for i,j in zip(ii,jj):
                    a,b=ar[i],bb[j];same=a['session_id']==b['session_id'];gap=abs(int(a['frame_id'])-int(b['frame_id'])) if same else ''
                    adj=same and (a['session_id'],min(int(a['frame_id']),int(b['frame_id'])),max(int(a['frame_id']),int(b['frame_id']))) in adjacent
                    risk=same and gap<=300
                    writer.writerow(dict(crop_a=a['crop_filename'],crop_b=b['crop_filename'],split_a=sa,split_b=sb,class_a=a['class_name'],class_b=b['class_name'],dhash_distance=int(distances[i,j]),same_session=same,frame_gap=gap,adjacent_sampled_frames=adj,same_session_close_frame_risk=risk))
                    near_counts[sa+'_'+sb]+=1
                    if risk:adjacent_counts[sa+'_'+sb]+=1
    print('Verifying raw unchanged...',flush=True)
    assert before==snapshot(),'Raw integrity changed'
    stats={s:dict(frames=len({r['source_image'] for r in rows if r['split']==s}),crops=sum(r['split']==s for r in rows),classes=dict(Counter(r['class_name'] for r in rows if r['split']==s))) for s in SPLITS}
    pixel_overlap=overlaps('pixel_sha256')
    ready=not(any(source_overlap.values()) or any(block_overlap.values()) or sum(cross.values()) or any(pixel_overlap.values()))
    result=dict(source_dataset='AerialYield-T2M',source_image_count=len(sources),valid_instance_count=len(instances),generated_crop_count=len(rows),rejected_count=len(rejected),
        **{s+'_count':stats[s]['crops'] for s in SPLITS},split_statistics=stats,
        class_distribution_total=dict(Counter(r['class_name'] for r in rows)),
        **{'class_distribution_'+s:stats[s]['classes'] for s in SPLITS},
        source_frame_overlap=source_overlap,block_overlap=block_overlap,exact_duplicate_within_split=dict(within),exact_duplicate_cross_split=dict(cross),
        pixel_identical_cross_split=pixel_overlap,near_duplicate_candidates_cross_split={a+'_'+b:near_counts[a+'_'+b] for a,b in pairs},near_duplicate_total=sum(near_counts.values()),
        same_session_close_frame_near_candidates=dict(adjacent_counts),near_duplicate_method='64-bit grayscale dHash; Hamming <=4; exhaustive cross-split; candidates are not confirmed same fruit; close-frame risk <=300 frame numbers',
        small_crop_count=sum(r['quality_flag']=='very_small' for r in rows),rejected_reasons=dict(Counter(r['reason'] for r in rejected)),
        rejected_by_split=dict(Counter(r['split'] for r in rejected)),padding_ratio=PADDING_RATIO,official_split_preserved=True,raw_modified=False,raw_file_count=len(before),
        training_ready=ready,training_ready_image_level=ready,official_block_group_aware=True,session_independent=False,fruit_independent=False,local_qingxian_validated=False,
        pixel_preservation='Lossless PNG crops equal decoded source RGB slice; no resize or augmentation',filename_collision_count=0,
        limitations=['Severe class imbalance retained','Perceptual candidates may be false positives; not automatically deleted','Repeated fruit across blocks remains possible; no persistent fruit IDs','Image-level readiness is not fruit-independent evaluation'],
        class_id_note='Manifest IDs follow official 0-5 (det_label minus one). Ultralytics ImageFolder may sort class folder names alphabetically; read model.names rather than assume these IDs at inference.')
    REPORTS.mkdir(exist_ok=True)
    (REPORTS/'tomato_model_b_dataset_build_v1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    report=['# TOMATO MODEL B 分类数据构建 V1','',
        '只使用dataset_images/images原图、metadata原始bbox与det_label、官方splits CSV。未使用YOLO物理目录划分。',
        '固定padding_ratio=0.05：每侧扩展bbox对应宽/高的5%，下界floor上界ceil并限制在原图内。',
        '保存无损PNG，逐张验证解码像素等于源图裁片；没有resize、颜色变换、增强或随机划分。',
        'crop边长<8固定拒绝；边长<16标very_small并保留。',
        f'生成{len(rows)}，拒绝{len(rejected)}，合计{len(instances)}。拒绝原因：{result["rejected_reasons"]}；按split差值：{result["rejected_by_split"]}。','',
        '| 类别 | Train | Val | Test | 总数 |','|---|---:|---:|---:|---:|']
    for c in CLASSES:report.append('| '+c+' | '+' | '.join(str(stats[s]['classes'].get(c,0)) for s in SPLITS)+f' | {result["class_distribution_total"].get(c,0)} |')
    report += ['', '## 完整性与泄漏检查','', '```json',json.dumps(result,ensure_ascii=False,indent=2),'```','',
        '全部正式crop见manifests/tomato_ripeness_crops_manifest.csv；所有拒绝记录见tomato_ripeness_rejected.csv。',
        '完整重复对见exact_duplicate_pairs.csv；跨split近重复候选见near_duplicate_candidates_cross_split.csv。未自动删除近重复。',
        '同session且帧编号差≤300的相似crop特别标记，另记录是否为采样序列中的相邻帧。',
        '数据严重不平衡，原始分布保留；未过采样、欠采样或设置class weight。',
        '**official_block_group_aware=true；session_independent=false；fruit_independent=false；local_qingxian_validated=false。**',
        '可用性仅限有边界说明的image-level实验，不证明果实个体独立。建议下一步优先复核跨split同session近邻候选，设计训练策略前保留审计结论；本阶段不训练。',
        '脚本可重复执行同一配置：已存在crop必须像素一致才能复用，拒绝混入额外文件；不删除raw或旧输出。']
    (REPORTS/'TOMATO_MODEL_B_DATASET_BUILD_V1.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False),flush=True)


if __name__=='__main__':
    main()
