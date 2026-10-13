"""Prepare human review, then build an immutable group-aware classification split.
No model training. Empty human decisions block the build.
"""
import argparse,collections,csv,hashlib,io,json,random,shutil,subprocess,tempfile,zipfile
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from audit_raw_datasets import BASE,CLASSES,write_csv

DECISIONS={'keep','exclude_conflict','same_source_group','needs_expert_review'}
def read_csv(path):
    with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def mixed_rows(rows):
    groups=collections.defaultdict(list)
    for r in rows:
        if r['usable']=='True':groups[r['group_id']].append(r)
    mixed=[rs for rs in groups.values() if len(rs)==98 and len({r['mapped_label'] for r in rs})>1]
    if len(mixed)!=1:raise ValueError('Expected exactly one 98-image mixed group; inspect verified manifest')
    return sorted(mixed[0],key=lambda r:(r['mapped_label'],r['original_path']))

class Reader:
    def __init__(self,raw,cache):self.raw=raw;self.cache=cache;self.zips={};self.rar={}
    def read(self,path):
        outer,sep,member=path.partition('::');archive=(self.raw/outer).resolve()
        if not archive.is_relative_to(self.raw.resolve()):raise ValueError('Source outside raw')
        if not sep:return archive.read_bytes()
        if archive.suffix.lower()=='.zip':
            if archive not in self.zips:self.zips[archive]=zipfile.ZipFile(archive)
            return self.zips[archive].read(member)
        if archive.suffix.lower()=='.rar':
            if archive not in self.rar:
                dest=self.cache/('rar_'+hashlib.sha256(str(archive).encode()).hexdigest()[:12]);dest.mkdir()
                names=subprocess.run(['tar','-tf',str(archive)],check=True,capture_output=True,text=True).stdout.splitlines()
                if any(Path(n).is_absolute() or '..' in Path(n).parts or ':' in n for n in names):raise ValueError('Unsafe archive path')
                subprocess.run(['tar','-xf',str(archive),'-C',str(dest)],check=True,capture_output=True);self.rar[archive]=dest
            p=(self.rar[archive]/member).resolve()
            if not p.is_relative_to(self.rar[archive]) or p.is_symlink():raise ValueError('Unsafe member')
            return p.read_bytes()
        raise ValueError('Unsupported archive')
    def close(self):
        for z in self.zips.values():z.close()

def checked_bytes(reader,row):
    data=reader.read(row['original_path'])
    if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Raw hash mismatch: '+row['original_path'])
    return data

def prepare(root):
    reports=root/'reports';rows=mixed_rows(read_csv(reports/'model_a_verified_manifest.csv'))
    out=root/'review/mixed_group_98';out.mkdir(parents=True,exist_ok=True)
    review=[];thumbs=[]
    with tempfile.TemporaryDirectory(prefix='review_cache_',dir=reports) as cache:
        reader=Reader(root/'raw',Path(cache))
        try:
            for n,r in enumerate(rows,1):
                image_id=f'M{n:03d}';stem=f'{r["mapped_label"]}__{r["source_dataset"]}__{image_id}'
                data=checked_bytes(reader,r);suffix=Path(r['original_path']).suffix.lower()
                target=out/(stem+suffix)
                if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=r['sha256']:raise ValueError('Review copy changed; refusing overwrite')
                if not target.exists():target.write_bytes(data)
                with Image.open(io.BytesIO(data)) as im:
                    thumb=ImageOps.contain(ImageOps.exif_transpose(im).convert('RGB'),(220,180))
                    tile=Image.new('RGB',(240,220),'white');tile.paste(thumb,((240-thumb.width)//2,0));draw=ImageDraw.Draw(tile)
                    draw.text((5,183),image_id+' '+r['mapped_label'],fill='black');thumbs.append(tile)
                review.append({k:r[k] for k in ['original_path','source_dataset','original_label','mapped_label','sha256','phash','group_id']}|{'image_id':image_id,'review_decision':'','review_note':''})
        finally:reader.close()
    for page,start in enumerate(range(0,len(thumbs),20),1):
        sheet=Image.new('RGB',(1200,880),'#dddddd')
        for j,tile in enumerate(thumbs[start:start+20]):sheet.paste(tile,((j%5)*240,(j//5)*220))
        sheet.save(out/f'contact_sheet_{page:02d}.jpg',quality=90)
    review_csv=reports/'mixed_group_98_review.csv'
    if not review_csv.exists():write_csv(review_csv,['image_id','original_path','source_dataset','original_label','mapped_label','sha256','phash','group_id','review_decision','review_note'],review)
    (out/'README.md').write_text('98张原图复制品与5张联系表。M001等编号对应reports/mixed_group_98_review.csv。\n请逐行填写keep/exclude_conflict/same_source_group/needs_expert_review之一和复核说明。不能仅凭黄化确诊缺氮。keep不会自动拆掉已有近似组，原group仍保守保留。\n',encoding='utf-8')
    print('Review export ready:',out)

def clean_rows(verified,review):
    selected=mixed_rows(verified);expected={r['original_path']:r for r in selected}
    if len(review)!=len(expected) or {r['original_path'] for r in review}!=set(expected):raise ValueError('Review rows missing, duplicated or unexpected')
    decisions={}
    for r in review:
        src=expected[r['original_path']]
        if any(r[k]!=src[k] for k in ('sha256','phash','group_id','mapped_label','original_label','source_dataset')):raise ValueError('Review identity/label changed')
        decision=r['review_decision'].strip()
        if decision not in DECISIONS:raise ValueError('Human review incomplete: '+r['image_id'])
        if not r['review_note'].strip():raise ValueError('Review note required: '+r['image_id'])
        decisions[r['original_path']]=decision
    clean=[]
    for v in verified:
        r=dict(v);decision=decisions.get(r['original_path'],'not_in_mixed_group');r['manual_review']=decision
        if decision in ('exclude_conflict','needs_expert_review'):
            r.update(usable='False',exclude_reason='confirmed_label_conflict' if decision=='exclude_conflict' else decision)
        if not r['group_id']:r['group_id']='single_'+r['sha256']
        clean.append(r)
    return clean

def assign_groups(rows,seed=42):
    groups=collections.defaultdict(list)
    for r in rows:groups[r['group_id']].append(r)
    totals=collections.Counter(r['mapped_label'] for r in rows)
    rng=random.Random(seed);items=list(sorted(groups.items()));rng.shuffle(items)
    items.sort(key=lambda item:-len(item[1]))
    splits=('train','val','test');ratios=(.7,.15,.15);counts={s:collections.Counter() for s in splits};assignment={}
    for group,images in items:
        vec=collections.Counter(r['mapped_label'] for r in images)
        def score(split):
            return sum(((counts[s][c]+(vec[c] if s==split else 0)-totals[c]*ratio)**2)/max(totals[c],1) for s,ratio in zip(splits,ratios) for c in CLASSES)
        chosen=min(splits,key=score);assignment[group]=chosen;counts[chosen].update(vec)
    return assignment

def fingerprint(raw):
    result={}
    for p in raw.rglob('*'):
        if p.is_file():
            with p.open('rb') as f:result[p.relative_to(raw).as_posix()]=hashlib.file_digest(f,'sha256').hexdigest()
    return result

def build(root):
    reports=root/'reports';verified=read_csv(reports/'model_a_verified_manifest.csv')
    clean=clean_rows(verified,read_csv(reports/'mixed_group_98_review.csv'))  # fail before any dataset mutation
    usable=[r for r in clean if r['usable']=='True']
    if not usable or len({r['sha256'] for r in usable})!=len(usable):raise ValueError('Empty pool or duplicate SHA')
    if any(r['conflict_flag']!='False' or r['source_variant'] not in ('original','original_source_partition') for r in usable):raise ValueError('Forbidden sample')
    assignment=assign_groups(usable);destination=root/'data/leaf_classifier'
    if destination.exists():raise ValueError('Dataset already exists; refusing overwrite')
    before=fingerprint(root/'raw');manifest=[]
    with tempfile.TemporaryDirectory(prefix='split_cache_',dir=reports) as cache:
        stage=Path(cache)/'leaf_classifier';stage.mkdir();reader=Reader(root/'raw',Path(cache))
        try:
            for split in ('train','val','test'):
                for label in CLASSES:(stage/split/label).mkdir(parents=True)
            for r in usable:
                split=assignment[r['group_id']];relative=Path(split)/r['mapped_label']/(r['sha256']+Path(r['original_path']).suffix.lower())
                (stage/relative).write_bytes(checked_bytes(reader,r))
                manifest.append({k:r[k] for k in ('original_path','source_dataset','mapped_label','group_id','sha256','phash')}|{'target_path':(destination/relative).relative_to(root).as_posix(),'split':split})
            for m in manifest:
                p=stage/Path(m['target_path']).relative_to('data/leaf_classifier')
                if hashlib.sha256(p.read_bytes()).hexdigest()!=m['sha256']:raise ValueError('Copied data hash mismatch')
            after=fingerprint(root/'raw')
            if before!=after:raise ValueError('Raw content changed; aborting')
            for key in ('sha256','group_id'):
                buckets=collections.defaultdict(set)
                for r in manifest:buckets[r[key]].add(r['split'])
                if any(len(s)>1 for s in buckets.values()):raise ValueError('Cross-split leakage: '+key)
            if not stage.resolve().is_relative_to(reports.resolve()) or not destination.resolve().is_relative_to(root.resolve()):raise ValueError('Unsafe publish paths')
            destination.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(stage),str(destination))
        finally:reader.close()
    write_csv(reports/'model_a_clean_manifest.csv',list(clean[0]),clean)
    write_csv(reports/'split_manifest.csv',['original_path','target_path','source_dataset','mapped_label','group_id','split','sha256','phash'],manifest)
    stats=[dict(split=s,mapped_label=c,image_count=sum(r['split']==s and r['mapped_label']==c for r in manifest)) for s in ('train','val','test') for c in CLASSES]
    write_csv(reports/'split_statistics.csv',['split','mapped_label','image_count'],stats)
    result={'seed':42,'ratios':[.7,.15,.15],'clean_count':len(usable),'review_decisions':dict(collections.Counter(r['manual_review'] for r in clean if r['manual_review']!='not_in_mixed_group')),'statistics':stats,'exact_cross_split':0,'group_cross_split':0,'known_conflicts_in_pool':0,'augmented_copies_in_pool':0,'raw_changed_files':0}
    (reports/'split_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    (reports/'DATASET_SPLIT_REPORT.md').write_text('# Group-aware split\n\n```json\n'+json.dumps(result,ensure_ascii=False,indent=2)+'\n```\n原始group未拆分，keep也保留原相似组约束。未训练或增强；无External Test。已知泄漏检查为0不证明来源/plot完全独立。\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare-review','build']);args=parser.parse_args()
    (prepare if args.action=='prepare-review' else build)(BASE)
