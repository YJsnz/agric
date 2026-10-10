"""Build v3 from audited evidence, preserving raw, v1 and existing splits."""
import hashlib
import json
import shutil
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps
from finalize_near_audit_v2 import ROOT, REPORTS, read, write

CLASSES = {'healthy','anthracnose','powdery_mildew','insect_damage','yellow_leaf'}
TARGET = ROOT/'data/jujube_leaf_classifier_v3'

def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def snapshot(folder):
    return {str(p.relative_to(ROOT)):(p.stat().st_size,p.stat().st_mtime_ns) for p in folder.rglob('*') if p.is_file()}

def components(rows, fields, edges=()):
    parent={r['image_id']:r['image_id'] for r in rows}
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]]; x=parent[x]
        return x
    def union(a,b): parent[find(a)]=find(b)
    for field in fields:
        seen={}
        for r in rows:
            val=r.get(field)
            if val:
                if val in seen: union(r['image_id'],seen[val])
                seen[val]=r['image_id']
    for a,b in edges: union(a,b)
    out=defaultdict(list)
    for r in rows: out[find(r['image_id'])].append(r)
    return [v for v in out.values() if len(v)>1]

def group_id(prefix, group):
    return prefix+hashlib.sha256('|'.join(sorted(r['image_id'] for r in group)).encode()).hexdigest()[:16]

def main():
    if TARGET.exists(): raise RuntimeError('v3 target exists; refusing to overwrite')
    raw=read(REPORTS/'model_a_raw_manifest.csv')
    old=read(REPORTS/'model_a_clean_manifest.csv'); old_by={r['image_id']:r for r in old}
    pairs=read(REPORTS/'model_a_near_duplicate_candidates_v2.csv')
    raw_before=snapshot(ROOT/'raw'); old_before=snapshot(ROOT/'data/jujube_leaf_classifier')
    original_reports={n:digest(REPORTS/n) for n in ['model_a_raw_manifest.csv','model_a_clean_manifest.csv','model_a_near_duplicate_candidates_v2.csv']}
    rows=[]
    for r in raw:
        prior=old_by.get(r['image_id'],{})
        rows.append({**r,'pixel_hash':r['pixel_sha256'],'duplicate_group_id':'','near_duplicate_group_id':'',
                     'usable':r['image_id'] in old_by,'split':prior.get('split',''),'target_path':'',
                     'exclude_reason':'' if prior else r['exclude_reason']})
    exact=components(rows,['sha256','pixel_hash'])
    for group in exact:
        gid=group_id('exact_',group)
        conflict=len({r['mapped_class'] for r in group})>1
        representative=min(group,key=lambda r:(not r['usable'],r['image_id']))
        for r in group:
            r['duplicate_group_id']=gid
            if conflict:
                r.update(usable=False,exclude_reason='pixel_identical_label_conflict' if len({x['sha256'] for x in group})>1 else 'exact_duplicate_label_conflict')
            elif r is not representative:
                r.update(usable=False,exclude_reason='exact_duplicate')
    near=components(rows,[],[(r['image_a'],r['image_b']) for r in pairs if r['review_status']=='confirmed_near_duplicate'])
    for group in near:
        gid=group_id('near_',group)
        conflict=len({r['mapped_class'] for r in group})>1
        for r in group:
            r['near_duplicate_group_id']=gid
            if conflict: r.update(usable=False,exclude_reason='needs_expert_review')
        assert len({r['split'] for r in group if r['usable']})<=1
    # Re-read every original; no reliance on cached readability or signatures.
    def verify(r):
        path=Path(r['original_path'])
        if digest(path)!=r['sha256']: raise RuntimeError('Raw hash changed: '+str(path))
        try:
            with Image.open(path) as im:
                rgb=ImageOps.exif_transpose(im).convert('RGB'); rgb.load()
                pixel=hashlib.sha256(str(rgb.size).encode()+rgb.tobytes()).hexdigest()
            if pixel!=r['pixel_hash']: raise RuntimeError('Pixel signature changed: '+str(path))
        except (OSError,ValueError):
            if r['usable']: raise
            return
        if r['usable']:
            assert r['mapped_class'] in CLASSES and r['split'] in {'train','val','test'}
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i,_ in enumerate(pool.map(verify,rows),1):
            if i%400==0: print('Verified raw images',i,flush=True)
    for r in rows:
        if r['usable']:
            r['target_path']=str((TARGET/r['split']/r['mapped_class']/Path(old_by[r['image_id']]['target_path']).name).relative_to(ROOT))
    write(REPORTS/'model_a_clean_manifest_v3.csv',rows)
    conflicts=[{**r,'conflict_group_id':r['duplicate_group_id']} for r in rows if r['image_id'] in old_by and 'label_conflict' in r['exclude_reason']]
    write(REPORTS/'model_a_pixel_conflicts_excluded_v3.csv',conflicts)
    # Materialize exclusively from the persisted v3 manifest.
    persisted=read(REPORTS/'model_a_clean_manifest_v3.csv')
    clean=[r for r in persisted if r['usable']=='True']
    for split in ('train','val','test'):
        for cls in sorted(CLASSES): (TARGET/split/cls).mkdir(parents=True,exist_ok=True)
    def copy(r):
        dest=ROOT/r['target_path']
        shutil.copyfile(r['original_path'],dest)
        assert digest(dest)==r['sha256'],str(dest)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i,_ in enumerate(pool.map(copy,clean),1):
            if i%400==0: print('Copied and hash-verified v3 images',i,flush=True)
    def cross(field):
        groups=defaultdict(set)
        for r in clean:
            if r[field]: groups[r[field]].add(r['split'])
        return sum(len(s)>1 for s in groups.values())
    checks={
      'cross_split_sha256':cross('sha256'),'cross_split_pixel_identical':cross('pixel_hash'),
      'cross_split_confirmed_near_duplicate':cross('near_duplicate_group_id'),
      'pixel_identical_conflict_entered':sum(r['exclude_reason']=='pixel_identical_label_conflict' for r in clean),
      'exact_duplicate_conflict_entered':sum(r['exclude_reason']=='exact_duplicate_label_conflict' for r in clean),
      'corrupt_entered':sum(r['corrupt']=='True' for r in clean),
      'unknown_class_entered':sum(r['mapped_class'] not in CLASSES for r in clean),
      'target_filename_duplicate':len(clean)-len({Path(r['target_path']).name for r in clean}),
      'raw_modification':0,
    }
    after=snapshot(ROOT/'raw')
    checks['raw_modification']=sum(raw_before.get(k)!=after.get(k) for k in raw_before.keys()|after.keys())
    assert snapshot(ROOT/'data/jujube_leaf_classifier')==old_before
    assert all(digest(REPORTS/n)==h for n,h in original_reports.items())
    assert len(list(TARGET.rglob('*.*')))==len(clean)
    # Confirm all byte-identical and pixel-identical same-label extras were removed.
    assert len({r['sha256'] for r in clean})==len(clean)
    assert len({r['pixel_hash'] for r in clean})==len(clean)
    stats=[]
    for split in ('all','train','val','test'):
        subset=[r for r in clean if split=='all' or r['split']==split]
        stats.append({'split':split,'category':'total','name':'all','count':len(subset)})
        for kind,field in [('class','mapped_class'),('source','source_dataset')]:
            for name,count in sorted(Counter(r[field] for r in subset).items()):
                stats.append({'split':split,'category':kind,'name':name,'count':count})
    write(REPORTS/'model_a_split_statistics_v3.csv',stats)
    five=all({r['mapped_class'] for r in clean if r['split']==s}==CLASSES for s in ('train','val','test'))
    sources=all(len({r['source_dataset'] for r in clean if r['split']==s})==2 for s in ('train','val','test'))
    summary=dict(raw_total=len(raw),clean_v1=len(old),pixel_identical_conflict_images_excluded=len(conflicts),
                 exact_duplicate_images_excluded=sum(r['exclude_reason']=='exact_duplicate' for r in rows),
                 exact_duplicate_new_exclusions=sum(r['exclude_reason']=='exact_duplicate' and r['image_id'] in old_by for r in rows),
                 exact_duplicate_conflict_images_excluded=sum(r['exclude_reason']=='exact_duplicate_label_conflict' for r in rows),
                 confirmed_near_duplicate_groups=len(near),clean_v3_total=len(clean),
                 classes=dict(Counter(r['mapped_class'] for r in clean)),splits=dict(Counter(r['split'] for r in clean)),
                 all_splits_five_classes=five,all_splits_two_sources=sources,
                 residual_uncertain_pairs=sum(r['review_status']=='uncertain' for r in pairs),checks=checks,
                 training_ready=all(v==0 for v in checks.values()) and five)
    assert summary['training_ready'],summary
    (REPORTS/'model_a_final_summary_v3.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    report=['# Jujube Model A 最终数据定版 v3','',
      '所有原图重新读取并验证 SHA256、EXIF 校正 RGB 解码像素签名；v3 副本逐一验证 SHA256。未训练、未改 raw、未覆盖 v1、未重新随机划分。',
      '## 定版统计','```json',json.dumps(summary,ensure_ascii=False,indent=2),'```',
      '## 排除与同源处理',
      '4 张新增冲突图片属于两组解码像素相同但文件 SHA 不同的跨标签图像。组内全部排除，没有选择某个标签。详细原路径、原类别、签名和 conflict_group_id 见 model_a_pixel_conflicts_excluded_v3.csv。',
      '同标签完全重复（包括像素相同）只留原 clean 内 image_id 排序最前的代表。exact_duplicate_images_excluded 是相对全部 raw 的冗余数量，新增剔除量见 exact_duplicate_new_exclusions。不同标签的完全重复全部排除。',
      '6 对确认跨源近重复保留全部可用成员，以 near_duplicate_group_id 绑定；核对均在同一 split。未根据一般 pHash 候选建立真实同源组。',
      'v3 manifest 包含所有 raw 行（含 usable=false），训练目录严格只复制 usable=true 的行。split 保留旧分配，不补齐被剔除数量。',
      '## 审计局限',
      'v2 共 14749 候选对，10 对完全重复（含 5 对标签冲突）、6 对近重复、119 对背景误报，仍有 14614 对 uncertain。',
      '存在未完全人工审核的 near-duplicate 候选风险（residual near-duplicate uncertainty）。相似绿叶、背景、构图可造成 pHash/SSIM/CNN 高分；1434 张候选大组不是一个真实同源组。uncertain 不等于重复，不单独作为排除或训练阻塞条件。',
      '零跨 split 检查限于 SHA、解码像素及已确认近重复，不能证明未知近重复完全不存在。该数据为内部划分，两个来源共享机构/贡献者；来源覆盖不等于独立域泛化验证。',
      '## 准入',
      '全部指定硬性检查通过，training_ready=true。此结论为当前公开叶片数据准备准入，不代表模型已训练，也不证明对沧州金丝小枣本地场景的诊断性能。正式输入使用 data/jujube_leaf_classifier_v3，旧目录不再作为本次正式输入。','']
    (REPORTS/'JUJUBE_MODEL_A_FINAL_DATASET_REPORT.md').write_text('\n'.join(report),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__': main()
