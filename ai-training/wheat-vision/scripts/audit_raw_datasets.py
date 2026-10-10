"""Read-only raw audit (including archive members); never prepares splits or trains.

Requires Pillow, numpy, scipy; Windows tar reads RAR into a temporary audit cache.
Near matches are review candidates, NOT proof of identical underlying specimens.
"""
import argparse,collections,csv,hashlib,io,itertools,json,re,subprocess,tempfile,zipfile
from pathlib import Path,PurePosixPath
import numpy as np
from PIL import Image,ImageOps
from scipy.fft import dctn

CLASSES=('healthy','rust','leaf_spot_blight','nitrogen_deficiency')
EXT={'.jpg','.jpeg','.png','.bmp','.webp'}
BASE=Path(__file__).resolve().parents[1]
def norm(s):return re.sub(r'[\s_\-]+','',s).casefold()
def resolve_label(mapping,path,source,label):
    if 'global_mapping' not in mapping:return mapping.get(norm(label),'unmapped')
    archive,sep,member=path.partition('::')
    for rule in mapping.get('dataset_specific',[]):
        if sep and source==rule['source_dataset'] and PurePosixPath(archive).name==rule['archive'] and PurePosixPath(member).parts[0]==rule['member_root']:
            return {norm(k):v for k,v in rule['mapping'].items()}.get(norm(label),'unmapped')
    if norm(label) in {norm(x) for x in mapping['exclude']}:return 'exclude'
    return {norm(k):v for k,v in mapping['global_mapping'].items()}.get(norm(label),'unmapped')
def phash(im):
    pixels=np.asarray(im.convert('L').resize((32,32),Image.Resampling.LANCZOS),dtype=float)
    coef=dctn(pixels,type=2,norm='ortho')[:8,:8].flatten()
    return sum(int(b)<<i for i,b in enumerate(coef>np.median(coef[1:])))

class BKTree:
    def __init__(self):self.root=None
    def add(self,key):
        if self.root is None:self.root=(key,{});return
        node=self.root
        while True:
            distance=(node[0]^key).bit_count()
            if distance==0:return
            if distance not in node[1]:node[1][distance]=(key,{});return
            node=node[1][distance]
    def find(self,key,radius):
        todo=[self.root] if self.root else []
        while todo:
            node=todo.pop();d=(node[0]^key).bit_count()
            if d<=radius:yield node[0],d
            todo.extend(child for edge,child in node[1].items() if d-radius<=edge<=d+radius)

def write_csv(path,fields,rows):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(rows)

def inspect_image(data,path,source,mapping):
    inner=path.split('::')[-1];parts=PurePosixPath(inner).parts
    original=parts[-2] if len(parts)>1 else ''
    mapped=resolve_label(mapping,path,source,original)
    split=next(({'validation':'val','valid':'val','training':'train','testing':'test'}.get(p.casefold(),p.casefold()) for p in reversed(parts[:-1]) if p.casefold() in ('train','training','test','testing','val','valid','validation')),'')
    r=dict(source_dataset=source,image_path=path,original_label=original,mapped_label=mapped,width='',height='',file_size=len(data),file_hash=hashlib.sha256(data).hexdigest(),perceptual_hash='',image_status='valid',split=split,variant='augmented' if 'augment' in inner.casefold() or 'augmented_' in inner.casefold() else 'split_copy' if 'split dataset' in inner.casefold() else 'unspecified',error='',exclusion_reason='')
    try:
        with Image.open(io.BytesIO(data)) as im:im.verify()
        with Image.open(io.BytesIO(data)) as im:
            im.load();im=ImageOps.exif_transpose(im);r.update(width=im.width,height=im.height,perceptual_hash=f'{phash(im):016x}')
    except Exception as e:r.update(image_status='corrupt',error=f'{type(e).__name__}: {e}')
    if mapped=='unmapped':r['exclusion_reason']='unknown_label_requires_review'
    elif mapped=='exclude':r['exclusion_reason']='not_in_current_4_class_scope'
    return r

def scan(raw,reports,mapping):
    rows=[];archives=[];metadata=[]
    def add(data,path,source):
        rows.append(inspect_image(data,path,source,mapping))
        if len(rows)%500==0:print(f'Decoded {len(rows)} images',flush=True)
    for p in sorted(raw.rglob('*')):
        if not p.is_file():continue
        relative=p.relative_to(raw).as_posix();source=relative.split('/')[0]
        if p.suffix.lower() in EXT:add(p.read_bytes(),relative,source)
        elif p.suffix.lower()=='.zip':
            with zipfile.ZipFile(p) as z:
                members=z.infolist();count=0
                for entry in members:
                    if entry.is_dir():continue
                    name=entry.filename.replace('\\','/')
                    if Path(name).suffix.lower() in EXT:
                        add(z.read(entry),relative+'::'+name,source);count+=1
                    elif name.lower().endswith(('.txt','.csv','.json','.md')) and entry.file_size<100000:
                        metadata.append({'path':relative+'::'+name,'text':z.read(entry).decode('utf-8',errors='replace')})
                archives.append({'path':relative,'images':count,'status':'scanned'})
        elif p.suffix.lower()=='.rar':
            listing=subprocess.run(['tar','-tf',str(p)],check=True,capture_output=True,text=True).stdout.splitlines()
            # Validate all names before extraction; extraction stays in our disposable cache.
            for name in listing:
                q=PurePosixPath(name.replace('\\','/'))
                if q.is_absolute() or '..' in q.parts or ':' in name:raise ValueError('Unsafe archive member '+name)
            with tempfile.TemporaryDirectory(prefix='audit_cache_',dir=reports) as cache:
                dest=Path(cache).resolve()
                if not dest.is_relative_to(reports.resolve()):raise ValueError('Invalid cache path')
                subprocess.run(['tar','-xf',str(p.resolve()),'-C',str(dest)],check=True,capture_output=True)
                count=0
                for image in sorted(dest.rglob('*')):
                    if image.is_symlink():raise ValueError('Archive symlink rejected')
                    if image.is_file() and image.suffix.lower() in EXT:
                        add(image.read_bytes(),relative+'::'+image.relative_to(dest).as_posix(),source);count+=1
                archives.append({'path':relative,'images':count,'status':'scanned'})
    return rows,archives,metadata

PAIR_FIELDS=['duplicate_type','path_a','path_b','phash_distance','source_dataset_a','source_dataset_b','original_label_a','original_label_b','mapped_label_a','mapped_label_b','split_a','split_b','cross_split','cross_dataset','label_conflict']
def pair(a,b,kind,distance):
    row={'duplicate_type':kind,'phash_distance':distance}
    for side,r in [('a',a),('b',b)]:
        row['path_'+side]=r['image_path']
        for k in ('source_dataset','original_label','mapped_label','split'):row[k+'_'+side]=r[k]
    row['cross_split']=bool(a['split'] and b['split'] and a['split']!=b['split'])
    row['cross_dataset']=a['source_dataset']!=b['source_dataset']
    def identity(r):
        if r['mapped_label'] in CLASSES:return r['mapped_label']
        if r['mapped_label']=='exclude':return 'excluded:'+norm(r['original_label'])
        return None
    aa,bb=identity(a),identity(b)
    row['label_conflict']=aa is not None and bb is not None and aa!=bb
    return row

def audit(root=BASE,radius=6):
    raw=root/'raw';reports=root/'reports';reports.mkdir(parents=True,exist_ok=True)
    mapping=json.loads((root/'configs/label_mapping.json').read_text(encoding='utf-8'))
    if 'global_mapping' not in mapping:mapping={norm(k):v for k,v in mapping.items()}
    rows,archives,metadata=scan(raw,reports,mapping)
    return write_reports(rows,archives,metadata,reports,radius)

def write_reports(rows,archives,metadata,reports,radius):
    hashes=collections.defaultdict(list);perceptual=collections.defaultdict(list)
    for r in rows:
        hashes[r['file_hash']].append(r)
        if r['image_status']=='valid':perceptual[int(r['perceptual_hash'],16)].append(r)
    counts=collections.Counter();conflict_paths=set();leak_sources=set()
    with (reports/'duplicate_report.csv').open('w',encoding='utf-8-sig',newline='') as df,(reports/'label_conflicts.csv').open('w',encoding='utf-8-sig',newline='') as cf:
        dw=csv.DictWriter(df,fieldnames=PAIR_FIELDS);cw=csv.DictWriter(cf,fieldnames=PAIR_FIELDS);dw.writeheader();cw.writeheader()
        def emit(a,b,kind,d):
            p=pair(a,b,kind,d);dw.writerow(p);counts[kind+'_pairs']+=1
            if p['cross_split']:counts[kind+'_cross_split_pairs']+=1
            if p['cross_dataset']:counts[kind+'_cross_dataset_pairs']+=1;leak_sources.update((a['source_dataset'],b['source_dataset']))
            if p['label_conflict']:
                cw.writerow(p);counts[kind+'_conflict_pairs']+=1;conflict_paths.update((a['image_path'],b['image_path']))
        for group in hashes.values():
            for a,b in itertools.combinations(group,2):emit(a,b,'exact',0 if a['perceptual_hash'] else '')
        tree=BKTree()
        for key,group in perceptual.items():
            for other,d in tree.find(key,radius):
                for a in group:
                    for b in perceptual[other]:
                        if a['file_hash']!=b['file_hash']:emit(a,b,'near',d)
            for a,b in itertools.combinations(group,2):
                if a['file_hash']!=b['file_hash']:emit(a,b,'near',0)
            tree.add(key)
    inventory=[];excluded=[]
    grouped=collections.defaultdict(list)
    for r in rows:
        if r['image_path'] in conflict_paths:r['exclusion_reason']='label_conflict_pending_review'
        if r['image_status']=='corrupt':r['exclusion_reason']='corrupt'
        grouped[(r['source_dataset'],r['original_label'],r['mapped_label'])].append(r)
    for (source,label,mapped),group in sorted(grouped.items()):
        inventory.append(dict(source_dataset=source,original_label=label,mapped_label=mapped,image_count=len(group),valid_count=sum(r['image_status']=='valid' for r in group),corrupt_count=sum(r['image_status']=='corrupt' for r in group),excluded_count=sum(bool(r['exclusion_reason']) for r in group)))
        for reason,n in collections.Counter(r['exclusion_reason'] for r in group if r['exclusion_reason']).items():excluded.append(dict(source_dataset=source,original_label=label,count=n,reason=reason))
    stats=[]
    for label in CLASSES:
        group=[r for r in rows if r['mapped_label']==label];valid=[r for r in group if r['image_status']=='valid']
        eligible=[r for r in valid if not r['exclusion_reason']]
        originals=[r for r in eligible if r['variant']=='unspecified']
        stats.append(dict(mapped_label=label,total_count=len(group),unique_count=len({r['file_hash'] for r in valid}),source_dataset_count=len({r['source_dataset'] for r in valid}),conflict_free_exact_unique_count=len({r['file_hash'] for r in eligible}),non_augmented_candidate_unique_count=len({r['file_hash'] for r in originals})))
    write_csv(reports/'image_manifest.csv',list(rows[0]) if rows else ['image_path'],rows)
    write_csv(reports/'corrupt_images.csv',list(rows[0]) if rows else ['image_path'],[r for r in rows if r['image_status']=='corrupt'])
    write_csv(reports/'dataset_inventory.csv',['source_dataset','original_label','mapped_label','image_count','valid_count','corrupt_count','excluded_count'],inventory)
    write_csv(reports/'class_statistics.csv',['mapped_label','total_count','unique_count','source_dataset_count','conflict_free_exact_unique_count','non_augmented_candidate_unique_count'],stats)
    write_csv(reports/'excluded_classes.csv',['source_dataset','original_label','count','reason'],excluded)
    summary={'images':len(rows),'datasets':dict(collections.Counter(r['source_dataset'] for r in rows)),'classes':stats,'exact_duplicate_excess':sum(len(v)-1 for v in hashes.values()),'exact_groups':sum(len(v)>1 for v in hashes.values()),'corrupt':sum(r['image_status']=='corrupt' for r in rows),'conflict_image_count':len(conflict_paths),'counts':dict(counts),'archives':archives,'phash_threshold':radius,'cross_dataset_sources':sorted(leak_sources)}
    (reports/'audit_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    (reports/'source_metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    lines=['# 模型A数据集审计','', '本阶段仅审计，未训练、划分、平衡、增强或修改raw。压缩包内部使用 archive::member 定位；RAR临时展开用于解码，随后清理审计缓存。','', '## 口径','', 'SHA256唯一仅表示文件字节不同，不代表独立原图。unique_count为可解码的SHA256唯一数（含待审核冲突）；conflict_free_exact_unique_count进一步排除所有冲突涉及路径。增强图仍可能计入唯一数，不能直接作为训练样本量。','近似重复为64位pHash距离不大于'+str(radius)+'的候选对，不自动删除；不保证检出所有裁剪、旋转或增强，也可能误报。近似冲突默认隔离待人工复核，不自动选标签。','标签仅忽略大小写、空格、连字符和下划线；control/deficiency/diseased仅在配置的明确数据集、压缩包及根目录范围内映射；范围外保持unmapped。第9步语义核验依据见source_semantics_verified.json。','', '## 实际统计','', '```json',json.dumps(summary,ensure_ascii=False,indent=2),'```','', '## 标签清单','']
    lines.extend(f"- {x['source_dataset']} / {x['original_label']} → {x['mapped_label']}：{x['image_count']}" for x in inventory)
    lines+=['', '## 数据泄漏与下一步','', '- Wheat Disease包README明确：先增强到每类1000张，再切分Train/Validation/Test。因此现有切分存在同源增强泄漏风险，不可当作独立评估。Original/Augmented/Split副本不能混成新样本。','- exact/near跨split、跨数据集对见duplicate_report.csv；组内样本未来必须整体划分。跨数据集近似对只能作为污染警示，需人工核验。','- winter_wheat_nitrogen为平铺IMG时间戳文件，缺少逐图标签及plot/处理元数据；时间戳可能来自连续拍摄，不能据目录名全部标成缺氮，也不能证明同一实验plot独立。','- 当前没有数据集可直接确认为External Test。应先核对采集地、地块、实验处理、拍摄序列和跨库重复；独立来源的未增强原图且覆盖目标类别才可候选。winter_wheat_nitrogen须补齐标签与地块资料后再评估，不直接推荐为现成外测集。','- 四类是否足够须按独立原图及隔离冲突后判断，不能用增强副本填充数量。nitrogen_deficiency若为0，必须先核验Ndeficient目录标签映射及冬小麦逐图实验记录。','- 暂不建议正式划分train/val/test；先审核未知标签、冲突与近似组，恢复增强来源分组，再按原图/序列/plot/source分组划分。','- 视觉缺氮类只表示缺氮类黄化视觉表现，不是缺氮确诊。','- 不存在的源目录自动跳过；未做数据授权/许可及来源真实性核验。']
    (reports/'DATASET_AUDIT.md').write_text('\n'.join(lines),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=BASE);parser.add_argument('--phash-threshold',type=int,default=6)
    args=parser.parse_args()
    if not 0<=args.phash_threshold<=16:parser.error('phash threshold must be 0..16')
    audit(args.root.resolve(),args.phash_threshold)
