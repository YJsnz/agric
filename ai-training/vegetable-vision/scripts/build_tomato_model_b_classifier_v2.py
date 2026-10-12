"""Copy V1 excluding only reviewed pair_017 training crop; audit without training."""
import hashlib
import itertools
import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image
from build_tomato_model_b_classifier_v1 import read, write, sha, dhash, CLASSES, SPLITS

ROOT = Path(__file__).resolve().parents[1]
V1 = ROOT / 'data/tomato_ripeness_classifier_v1'
V2 = ROOT / 'data/tomato_ripeness_classifier_v2'
REPORTS = ROOT / 'reports'


def snapshot(base):
    return {p.relative_to(base).as_posix(): (p.stat().st_size, p.stat().st_mtime_ns, sha(p))
            for p in sorted(base.rglob('*')) if p.is_file()}


def main():
    reviews = read(REPORTS / 'tomato_model_b_cross_split_near_duplicate_review.csv')
    high = read(REPORTS / 'tomato_model_b_high_risk_near_duplicate_pairs.csv')
    pair = next(r for r in reviews if r['pair_id'] == 'pair_017')
    assert pair == next(r for r in high if r['pair_id'] == 'pair_017')
    assert pair['manual_review'] == 'leak_confirmed'
    assert (pair['split_a'], pair['split_b'], pair['class_a'], pair['class_b']) == ('train', 'test', 'green', 'green')
    assert [r['pair_id'] for r in reviews if r['manual_review'] == 'leak_confirmed'] == ['pair_017']
    original = read(V1 / 'manifests/tomato_ripeness_crops_manifest.csv')
    assert len(original) == 14185
    excluded = next(r for r in original if r['crop_path'] == pair['crop_a_path'])
    retained = next(r for r in original if r['crop_path'] == pair['crop_b_path'])
    assert excluded['split'] == 'train' and retained['split'] == 'test'
    print('Hashing raw and V1 before copy...', flush=True)
    protected = [ROOT / 'raw', V1]
    before = [snapshot(p) for p in protected]
    expected = {Path(r['crop_path']).relative_to(V1.relative_to(ROOT)).as_posix()
                for r in original if r is not excluded}
    if V2.exists():
        existing = {p.relative_to(V2).as_posix() for s in SPLITS for p in (V2/s).rglob('*') if p.is_file()}
        assert existing <= expected, 'Unexpected V2 files; refusing overwrite or deletion'
    for s in SPLITS:
        for c in CLASSES:
            (V2/s/c).mkdir(parents=True, exist_ok=True)
    manifests = V2 / 'manifests'
    manifests.mkdir(exist_ok=True)
    rows = []
    print('Copying and decoding retained crops...', flush=True)
    for index, old in enumerate(original):
        if old is excluded:
            continue
        r = dict(old)
        src = ROOT / old['crop_path']
        dst = V2 / src.relative_to(V1)
        assert sha(src) == old['crop_sha256']
        if dst.exists():
            assert sha(dst) == old['crop_sha256'], 'Existing V2 crop differs'
        else:
            shutil.copy2(src, dst)
        r['crop_path'] = dst.relative_to(ROOT).as_posix()
        r['crop_sha256'] = sha(dst)
        assert r['crop_sha256'] == old['crop_sha256']
        with Image.open(dst) as image:
            im = image.convert('RGB'); im.load()
            r['pixel_sha256'] = hashlib.sha256(f'{im.width}x{im.height}:RGB:'.encode()+im.tobytes()).hexdigest()
            r['dhash'] = f'{dhash(im):016x}'
        assert r['pixel_sha256'] == old['pixel_sha256'] and r['dhash'] == old['dhash']
        rows.append(r)
        if index % 2000 == 0:
            print(f'Copied/verified {index}/14185', flush=True)
    actual = {p.relative_to(V2).as_posix() for s in SPLITS for p in (V2/s).rglob('*') if p.is_file()}
    assert actual == expected and len(actual) == 14184
    write(manifests/'tomato_ripeness_crops_manifest.csv', rows, list(rows[0]))
    rejection = V1/'manifests/tomato_ripeness_rejected.csv'
    shutil.copy2(rejection, manifests/rejection.name)
    exclusion = dict(pair_id='pair_017', excluded_crop=excluded['crop_path'], excluded_split='train',
                     retained_crop=next(r['crop_path'] for r in rows if r['crop_filename']==retained['crop_filename']),
                     retained_split='test', class_name='green', session=excluded['session_id'],
                     frame_excluded=excluded['frame_id'], frame_retained=retained['frame_id'],
                     instance_id_excluded=excluded['instance_id'], instance_id_retained=retained['instance_id'],
                     reason='confirmed_cross_split_same_fruit_leakage')
    write(manifests/'tomato_ripeness_v2_exclusions.csv', [exclusion], list(exclusion))
    split_pairs = list(itertools.combinations(SPLITS, 2))
    def overlap(key):
        sets = {s: {r[key] for r in rows if r['split']==s} for s in SPLITS}
        return {a+'_'+b: sorted(sets[a]&sets[b]) for a,b in split_pairs}
    duplicates = []
    for key in ['crop_sha256', 'pixel_sha256']:
        groups = defaultdict(list)
        for r in rows: groups[r[key]].append(r)
        for group in groups.values():
            for a,b in itertools.combinations(group,2):
                if a['split'] != b['split']:
                    duplicates.append(dict(method=key,crop_a=a['crop_path'],crop_b=b['crop_path']))
    write(manifests/'cross_split_duplicate_pairs.csv', duplicates, ['method','crop_a','crop_b'])
    print('Exhaustive cross-split dHash <= 4 audit...', flush=True)
    lookup = {frozenset((Path(r['crop_a_path']).name,Path(r['crop_b_path']).name)):r for r in reviews}
    lut = np.array([i.bit_count() for i in range(256)],dtype=np.uint8)
    near=[]
    for sa,sb in split_pairs:
        aa=[r for r in rows if r['split']==sa]; bb=[r for r in rows if r['split']==sb]
        bh=np.array([int(r['dhash'],16) for r in bb],dtype=np.uint64)
        for start in range(0,len(aa),64):
            ar=aa[start:start+64]
            ah=np.array([int(r['dhash'],16) for r in ar],dtype=np.uint64)
            xor=np.bitwise_xor(ah[:,None],bh[None,:])
            dist=lut[xor.view(np.uint8).reshape(len(ar),len(bb),8)].sum(axis=2)
            for i,j in zip(*np.where(dist<=4)):
                a,b=ar[i],bb[j]
                previous=lookup.get(frozenset((a['crop_filename'],b['crop_filename'])),{})
                same=a['session_id']==b['session_id']
                near.append(dict(pair_id=previous.get('pair_id',''),crop_a=a['crop_path'],crop_b=b['crop_path'],
                                 split_a=sa,split_b=sb,class_a=a['class_name'],class_b=b['class_name'],
                                 dhash_distance=int(dist[i,j]),same_session=same,
                                 frame_gap=abs(int(a['frame_id'])-int(b['frame_id'])) if same else '',
                                 manual_review=previous.get('manual_review',''),manual_note=previous.get('manual_note','')))
    write(manifests/'near_duplicate_candidates_cross_split.csv', near, list(near[0]))
    assert 'pair_017' not in {r['pair_id'] for r in near}
    assert {r['pair_id'] for r in near if r['manual_review']=='uncertain'} == {'pair_012','pair_023','pair_026','pair_027'}
    print('Verifying raw and V1 hashes unchanged...', flush=True)
    after=[snapshot(p) for p in protected]
    assert before==after, 'Protected source changed'
    counts=Counter(r['split'] for r in rows)
    frame=overlap('source_image'); block=overlap('block_id')
    exact=sum(r['method']=='crop_sha256' for r in duplicates)
    pixels=sum(r['method']=='pixel_sha256' for r in duplicates)
    confirmed=sum(r['manual_review']=='leak_confirmed' for r in near)
    ready=not(any(frame.values()) or any(block.values()) or exact or pixels or confirmed)
    metrics=dict(v1_total=len(original),v2_total=len(actual),excluded_count=1,excluded_pair_ids=['pair_017'],
                 exclusion=exclusion,train_count=counts['train'],val_count=counts['val'],test_count=counts['test'],
                 class_distribution={s:{c:sum(r['split']==s and r['class_name']==c for r in rows) for c in CLASSES} for s in SPLITS},
                 source_frame_overlap=frame,block_overlap=block,exact_duplicate_cross_split=exact,
                 pixel_duplicate_cross_split=pixels,near_duplicate_cross_split=len(near),
                 near_duplicate_by_split=dict(Counter(r['split_a']+'_'+r['split_b'] for r in near)),
                 near_duplicate_method='Exhaustive 64-bit dHash Hamming <=4, recomputed from V2 pixels; candidate similarity is not identity proof',
                 confirmed_leak_remaining=confirmed,uncertain_pair_count=sum(r['manual_review']=='uncertain' for r in near),
                 raw_modified=False,v1_modified=False,val_test_byte_identical_to_v1=True,
                 training_ready_image_level=ready,official_frame_block_assignments_preserved=True,
                 session_independent=False,fruit_independent=False,local_qingxian_validated=False,
                 residual_uncertain_near_duplicate_risk=True,
                 scope='Confirmed leak remaining refers to reviewed candidates, not a guarantee that all fruit identities are independent.')
    (REPORTS/'tomato_model_b_dataset_audit_v2.json').write_text(json.dumps(metrics,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (manifests/'build_config.json').write_text(json.dumps(dict(version='v2',source='tomato_ripeness_classifier_v1',padding_ratio=.05,excluded_pair='pair_017',excluded_training_crop=excluded['crop_filename'],copy_only=True),indent=2)+'\n',encoding='utf-8')
    report=['# Tomato Model B dataset audit V2','',
            'V2 copies V1 byte-for-byte except the single confirmed pair_017 training crop. Raw and V1 SHA256 inventories are unchanged. Val and Test membership and bytes are identical to V1. No training or random split was performed.','',
            'The four uncertain pairs remain. Other unreviewed candidates are not assumed safe. Residual fruit-level leakage risk remains; no fruit-independent or Qingxian field validation claim is supported.','',
            'Source official frame/block assignments are inherited unchanged; only the specified Train crop is excluded. No exclusion is based on model Test performance.','',
            '## Audit results','', '```json',json.dumps(metrics,indent=2,ensure_ascii=False),'```','',
            'Complete V2 crop, exclusion, cross-split duplicate, and near-duplicate manifests are in data/tomato_ripeness_classifier_v2/manifests/. The five original small-crop rejections are retained as historical source-generation records.']
    (REPORTS/'TOMATO_MODEL_B_DATASET_AUDIT_V2.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print(json.dumps(metrics,indent=2),flush=True)


if __name__ == '__main__':
    main()
