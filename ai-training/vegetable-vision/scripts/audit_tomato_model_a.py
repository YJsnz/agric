"""Read-only TLID audit and byte-for-byte candidate copies. No split or training."""
from pathlib import Path
import csv
import hashlib
import io
import itertools
import json
import re
import shutil
import warnings
from collections import Counter, defaultdict
import numpy as np
from PIL import Image, ImageFile
from scipy.fft import dctn

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'raw/tomato_model_a_tlid'
REPORT=ROOT/'reports'
DEST=ROOT/'data/tomato_leaf_classifier_candidates_v1'
MAPPING={'0-Healthy':'healthy','1-Miner':'leaf_miner','2-BacterialSpot':'bacterial_spot',
 '3-PowderyMildew':'powdery_mildew','4-PowderyMildew_Miner':'powdery_mildew_and_leaf_miner',
 '5-BacterialSpot_Miner':'bacterial_spot_and_leaf_miner','6-WhiteFly':'whitefly'}
ImageFile.LOAD_TRUNCATED_IMAGES=False

def digest(b):return hashlib.sha256(b).hexdigest()
def write_csv(name,rows,fields):
    with (REPORT/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)
def packed(bits):return np.packbits(bits.reshape(-1)).tobytes().hex()

def main():
    REPORT.mkdir(parents=True,exist_ok=True)
    files=sorted(p for p in RAW.rglob('*') if p.is_file())
    assert files,'Raw data missing'
    dirs=[RAW]+sorted(p for p in RAW.rglob('*') if p.is_dir())
    tree=[dict(directory=str(p.relative_to(RAW)),direct_files=sum(x.is_file() for x in p.iterdir())) for p in dirs]
    write_csv('tomato_model_a_directory_inventory.csv',tree,['directory','direct_files'])
    (REPORT/'tomato_model_a_directory_tree.txt').write_text('\n'.join(f"{r['directory']} : {r['direct_files']} files" for r in tree),encoding='utf-8')
    print(json.dumps(tree,ensure_ascii=False),flush=True)
    # Confirm actual downloaded layout, rather than guessing from the publication.
    assert {p.name for p in RAW.iterdir() if p.is_dir()}==set(MAPPING),'Unexpected class directories; review first'
    assert all(p.parent.name==p.parent.parent.name and p.parent.name in MAPPING for p in files),'Unexpected nested files'
    rows=[];before={};patterns=[]
    for i,p in enumerate(files):
        s=p.stat();b=p.read_bytes();sha=digest(b);rel=p.relative_to(RAW).as_posix()
        before[rel]=(s.st_size,s.st_mtime_ns,sha)
        r=dict(source_path=str(p),filename=p.name,original_class=p.parent.name,normalized_class=MAPPING[p.parent.name],
               width=None,height=None,channels=None,mode='',format='',file_size=len(b),sha256=sha,readable=False,
               zero_byte=not b,invalid_extension=p.suffix.lower() not in ('.jpg','.jpeg','.png','.bmp','.tif','.tiff','.webp'),
               corrupt=False,truncated_jpeg=False,jpeg_eoi_missing=False,decode_failed=False,dimension_invalid=False,
               extension_format_mismatch=False,error='',warnings='',pixel_sha256='',phash='',dhash='',label_conflict=False)
        try:
            with warnings.catch_warnings(record=True) as ww:
                warnings.simplefilter('always')
                with Image.open(io.BytesIO(b)) as im:
                    r.update(width=im.width,height=im.height,channels=len(im.getbands()),mode=im.mode,format=im.format)
                    r['jpeg_eoi_missing']=im.format=='JPEG' and b.rfind(b'\xff\xd9')<0
                    r['extension_format_mismatch']=p.suffix.lower() in ('.jpg','.jpeg') and im.format!='JPEG'
                    im.verify()
                with Image.open(io.BytesIO(b)) as im:
                    im.load();rgb=im.convert('RGB')
                    r['pixel_sha256']=digest(f'RGB:{rgb.width}:{rgb.height}:'.encode()+rgb.tobytes())
                    gray=rgb.convert('L')
                    a=np.asarray(gray.resize((32,32),Image.Resampling.LANCZOS),dtype=float)
                    low=dctn(a,type=2,norm='ortho')[:8,:8];r['phash']=packed(low>np.median(low))
                    a=np.asarray(gray.resize((9,8),Image.Resampling.LANCZOS));r['dhash']=packed(a[:,1:]>a[:,:-1])
                    r['dimension_invalid']=im.width<=0 or im.height<=0
                    r['readable']=True
                r['warnings']=' | '.join(str(w.message) for w in ww)
        except Exception as exc:
            r.update(corrupt=True,decode_failed=True,error=f'{type(exc).__name__}: {exc}')
            r['truncated_jpeg']='truncat' in str(exc).lower() or ('JPEG'==r['format'] and r['jpeg_eoi_missing'])
        r['nonstandard_size']=(r['width'],r['height'])!=(256,256)
        r['patch_size_suspected']=(r['width'],r['height'])==(32,32)
        # Candidate pool is not a clean/final dataset: preserve decodable anomalies
        # for review, rather than silently excluding originals by expected dimensions.
        r['usable_for_candidate']=bool(r['readable'] and not any(r[k] for k in ['zero_byte','dimension_invalid','patch_size_suspected']))
        rows.append(r)
        nums=re.findall(r'\d+',p.stem)
        patterns.append(dict(filename=p.name,source_path=str(p),original_class=r['original_class'],prefix=re.sub(r'\d+','{n}',p.stem),numeric_tokens='|'.join(nums),sequence=int(nums[0]) if nums else '',candidate_only=True,same_leaf_confirmed=False))
        if (i+1)%2000==0:print('Audited',i+1,flush=True)
    write_csv('tomato_model_a_filename_patterns.csv',patterns,list(patterns[0]))
    sequence=[]
    for cls in MAPPING:
        ps=sorted((x for x in patterns if x['original_class']==cls and x['sequence']!=''),key=lambda x:(x['sequence'],x['filename']))
        sequence.extend(dict(image_a=a['source_path'],image_b=b['source_path'],class_name=cls,number_gap=b['sequence']-a['sequence'],status='sequence_candidate_only_not_same_leaf') for a,b in zip(ps,ps[1:]) if b['sequence']-a['sequence']<=1)
    write_csv('tomato_model_a_sequence_candidates.csv',sequence,['image_a','image_b','class_name','number_gap','status'])
    counts={};conflicts=set();unique_conflict_pairs=set()
    for field,kind in [('sha256','exact'),('pixel_sha256','pixel_identical')]:
        groups=defaultdict(list)
        for i,r in enumerate(rows):
            if r[field]:groups[r[field]].append(i)
        total=cross=0
        with (REPORT/f'tomato_model_a_{kind}_duplicate_pairs.csv').open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.writer(f);w.writerow(['image_a','image_b','class_a','class_b','label_conflict'])
            for ids in groups.values():
                for a,b in itertools.combinations(ids,2):
                    ra,rb=rows[a],rows[b];different=ra['normalized_class']!=rb['normalized_class']
                    total+=1;cross+=int(different)
                    if different:conflicts.update((a,b));unique_conflict_pairs.add((a,b))
                    w.writerow([ra['source_path'],rb['source_path'],ra['normalized_class'],rb['normalized_class'],different])
        counts[kind]={'pairs':total,'same_label_pairs':total-cross,'cross_label_pairs':cross,'groups':sum(len(v)>1 for v in groups.values())}
    for i in conflicts:rows[i]['label_conflict']=True
    for r in rows:
        r['review_reasons']=';'.join(k for k in ['label_conflict','nonstandard_size','extension_format_mismatch','jpeg_eoi_missing','corrupt','invalid_extension'] if r[k])
        r['needs_review']=bool(r['review_reasons'])
    write_csv('tomato_model_a_integrity_review.csv',[r for r in rows if r['needs_review']],list(rows[0]))
    # Complete all-pairs hash candidate recall, with no automatic grouping or deletion.
    valid=[i for i,r in enumerate(rows) if r['phash']]
    ph=np.array([list(bytes.fromhex(rows[i]['phash'])) for i in valid],dtype=np.uint8)
    dh=np.array([list(bytes.fromhex(rows[i]['dhash'])) for i in valid],dtype=np.uint8)
    lut=np.array([i.bit_count() for i in range(256)],dtype=np.uint8);near=near_cross=0
    with (REPORT/'tomato_model_a_near_duplicate_candidates.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f);w.writerow(['image_a','image_b','class_a','class_b','phash_distance','dhash_distance','sha256_equal','pixel_identical','cross_label','review_status'])
        for j,a in enumerate(valid):
            pd=lut[np.bitwise_xor(ph[j+1:],ph[j])].sum(axis=1)
            dd=lut[np.bitwise_xor(dh[j+1:],dh[j])].sum(axis=1)
            for k in np.flatnonzero((pd<=6)|(dd<=4)):
                b=valid[j+1+int(k)];ra,rb=rows[a],rows[b];cross=ra['normalized_class']!=rb['normalized_class']
                near+=1;near_cross+=int(cross)
                w.writerow([ra['source_path'],rb['source_path'],ra['normalized_class'],rb['normalized_class'],int(pd[k]),int(dd[k]),ra['sha256']==rb['sha256'],ra['pixel_sha256']==rb['pixel_sha256'],cross,'candidate_needs_review'])
            if j%3000==0:print('Near-duplicate scan',j,'/',len(valid),flush=True)
    inventory=[]
    for cls,norm in MAPPING.items():
        rr=[r for r in rows if r['original_class']==cls];dims=[r for r in rr if r['width']]
        inventory.append(dict(original_class_name=cls,normalized_class_name=norm,image_count=len(rr),format=json.dumps(dict(Counter(r['format'] for r in rr))),width_min=min(r['width'] for r in dims),width_max=max(r['width'] for r in dims),height_min=min(r['height'] for r in dims),height_max=max(r['height'] for r in dims)))
    write_csv('tomato_model_a_class_inventory.csv',inventory,list(inventory[0]))
    candidates=[];names=set()
    for r in rows:
        r['candidate_path']=''
        if not r['usable_for_candidate']:continue
        # Path suffix additionally prevents collisions for identical bytes with the same basename.
        name=f"{r['normalized_class']}__{r['sha256'][:12]}__{digest(str(Path(r['source_path']).relative_to(RAW)).encode())[:8]}__{r['filename']}"
        dst=DEST/r['normalized_class']/name
        assert str(dst) not in names,'Filename collision';names.add(str(dst));dst.parent.mkdir(parents=True,exist_ok=True)
        if dst.exists():assert digest(dst.read_bytes())==r['sha256'],'Existing candidate differs; refuse overwrite'
        else:shutil.copyfile(r['source_path'],dst)
        assert digest(dst.read_bytes())==r['sha256'],'Copy mismatch'
        r['candidate_path']=str(dst);candidates.append(r)
    write_csv('tomato_model_a_raw_inventory.csv',rows,list(rows[0]))
    after_files=sorted(p for p in RAW.rglob('*') if p.is_file())
    after={p.relative_to(RAW).as_posix():(p.stat().st_size,p.stat().st_mtime_ns,digest(p.read_bytes())) for p in after_files}
    assert before==after,'Raw integrity changed'
    assert set(str(p) for p in DEST.rglob('*') if p.is_file())==names,'Unexpected candidate files'
    summary=dict(raw_total=len(rows),classes=len(inventory),class_counts={r['normalized_class_name']:r['image_count'] for r in inventory},candidate_total=len(candidates),candidate_counts=dict(Counter(r['normalized_class'] for r in candidates)),
        integrity={k:sum(bool(r[k]) for r in rows) for k in ['corrupt','truncated_jpeg','zero_byte','invalid_extension','decode_failed','jpeg_eoi_missing','dimension_invalid','extension_format_mismatch','nonstandard_size','patch_size_suspected']},
        duplicates=counts,cross_label_conflict_pairs=len(unique_conflict_pairs),conflict_images=len(conflicts),near_duplicate_candidates=near,near_cross_label_candidates=near_cross,
        size_counts=dict(Counter(f"{r['width']}x{r['height']}" for r in rows)),ptlid_found=False,ptlid_excluded=True,raw_modification=0,raw_before_after_sha256_verified=True,filename_collision=0,
        official_total=15260,local_count_difference=len(rows)-15260,split_created=False,training_started=False)
    (REPORT/'tomato_model_a_audit_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    (REPORT/'tomato_model_a_raw_integrity_snapshot.json').write_text(json.dumps(before,ensure_ascii=False,indent=2),encoding='utf-8')
    text=f'''# Vegetable Model A 第一阶段原始数据审计

## 来源与实际结构
Tomato Leaf Image Dataset (TLID/PTLID), Mendeley Version 2，DOI 10.17632/kt64b2kh89.2。
来源：https://data.mendeley.com/datasets/kt64b2kh89/2 （2026-10-10 核验）。发布页区分 256×256 TLID 和由它切出的 32×32 PTLID；本地真实类别结构及绝大多数尺寸符合 TLID，但存在非标准尺寸及格式差异，详见统计与 integrity_review.csv。
TLID path: `{RAW}`。该下载目录直接包含七个类别，每类有同名子目录，并无额外 TLID 包装目录。
PTLID path: 未在指定 raw 扫描范围内发现；PTLID excluded = true。未发现 train/val/test、patch 或增强子目录；仅凭目录与图像不能证明源数据从未经过任何生成加工。
发布页标称 15260 张；本地为 {len(rows)} 张，少 {15260-len(rows)} 张。没有官方逐文件清单，不能定位具体缺失文件或宣称下载完整。未下载补图或伪造样本。

## 统计
```json
{json.dumps(summary,ensure_ascii=False,indent=2)}
```
详细类名、每类尺寸与格式见 tomato_model_a_class_inventory.csv；完整目录见 tomato_model_a_directory_tree.txt。

## 检查方法与解释
逐文件读取原始字节，SHA256，Pillow verify 后重新打开严格 load（不启用截断容忍），记录通道、尺寸、格式、异常及 JPEG EOI 标记。异常只记录，不修复或重编码。JPEG EOI 缺失与实际解码失败独立统计；此基础检查不替代所有编解码器的损坏检测。
像素完全重复使用未缩放、未旋转的解码 RGB 尺寸及字节 SHA256。两个重复指标分别计无序图像对，不能相加当独立重复数；跨标签冲突按两个指标的并集统计，原数据不删除。
近重复候选使用全量两两比较，64-bit pHash 汉明距离 <=6 或 64-bit dHash <=4。候选包含完全重复；跨类只标记风险，不能仅凭哈希判定标签冲突或同叶身份。背景相似可能产生误报，拍摄视角变化可能漏报。没有自动 same-leaf 分组。
文件名数字与前缀见 filename_patterns.csv，编号相邻候选见 sequence_candidates.csv（完整文件名均以 tomato_model_a_ 开头）。编号可能只是批量导出序号，不能证明同一叶片或植株；不据此建立来源组。

## 候选训练池
`{DEST}`。仅复制可正常解码、非32×32疑似patch的 TLID 文件；非标准尺寸、格式与扩展名不符、跨标签重复均原样保留并标记 needs_review，不把候选池冒充清洗完成数据。全部副本逐字节 SHA256 验证。文件名包含标准类别、内容哈希、相对路径哈希和原名，collision = 0。
候选集不是最终训练数据。近重复需后续审核；跨标签完全重复在 manifest 中 label_conflict=true，不得直接用于正式训练。数据量与发布页差异也需在下一阶段处理。

## 科学边界和停止条件
本数据为温室番茄资料，不是青县本地采集或本地验证。未来输出仅代表叶片病害/虫害视觉表现，不能直接解释为疾病确诊、虫害最终诊断或施药建议。
raw modification = 0：运行前后所有原文件路径、大小、mtime_ns、SHA256 一致。未重命名、移动、删除、缩放或重新编码 raw。未修改标签、未生成增强、未做 Train/Val/Test 划分、未训练。第一阶段完成后停止。
'''
    (REPORT/'TOMATO_MODEL_A_EXTRACTION_AUDIT_V1.md').write_text(text,encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
