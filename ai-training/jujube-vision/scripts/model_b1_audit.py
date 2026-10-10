"""B1 original-image audit and same-fruit candidate retrieval; no training."""
import csv, hashlib, json, os, re, warnings
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'raw/model_b1_bruise/jujube_bruisenet'
REPORTS=ROOT/'reports'
OUT=REPORTS/'model_b1_same_fruit_review'
os.environ['YOLO_CONFIG_DIR']=str(REPORTS/'model_b1_ultralytics')
import numpy as np
import torch
from PIL import Image, ImageOps, ImageDraw, ExifTags, ImageFile
from scipy.fft import dctn
from ultralytics import YOLO
ImageFile.LOAD_TRUNCATED_IMAGES=False

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()
def write(p,rows):
    with p.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def read(p):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def raw_state():
    return {str(p.relative_to(RAW)):[p.stat().st_size,p.stat().st_mtime_ns,sha(p)] for p in RAW.rglob('*') if p.is_file()}
def protected_state():
    files=[]
    for folder in ('models','runs','data'):
        files += [p for p in (ROOT/folder).rglob('*') if p.is_file() and 'jujube_fruit_bruise_classifier_v1' not in p.parts]
    files += [p for p in REPORTS.rglob('*') if p.is_file() and ('model_a' in p.name.lower() or 'jujube_model_a' in p.name.lower())]
    return {str(p.relative_to(ROOT)):[p.stat().st_size,p.stat().st_mtime_ns] for p in files}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    before=raw_state(); protected=protected_state()
    (REPORTS/'model_b1_before_state.json').write_text(json.dumps({'raw':before,'model_a':protected},indent=2),encoding='utf-8')
    paths=sorted(p for p in RAW.rglob('*') if p.suffix.lower() in {'.jpg','.jpeg','.png','.bmp','.tif','.tiff','.webp'})
    rows=[]; inputs=[]
    for path in paths:
        rel=path.relative_to(RAW); label=rel.parts[0].lower(); reasons=[]
        # Four local names carry copy suffix/space; this alone is not augmentation.
        official=bool(re.fullmatch(r'(healthy/healthy_|bruised/bruise_)\d+(?:\(1\))?\s*\.jpg',rel.as_posix(),re.I))
        if not official:reasons.append('not_official_original_path_pattern')
        row=dict(image_id=hashlib.sha256(rel.as_posix().encode()).hexdigest()[:20],source_dataset='JujubeBruiseNet_3mtdhrwgfr_v5',
            source_path=str(path.resolve()),filename=path.name,**{'class':label},width='',height='',format='',mode='',file_size=path.stat().st_size,
            sha256=sha(path),pixel_hash='',phash='',exif_json='',filename_number=int(re.search(r'_(\d+)',path.name).group(1)) if re.search(r'_(\d+)',path.name) else '',
            jpeg_issue='',decode_warning='',corrupt=False,dimension_anomaly=False,non_rgb=False,
            fruit_group_id='',fruit_group_uncertain=True,usable=False,exclude_reason='',split='')
        try:
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter('always')
                with Image.open(path) as im:im.verify()
                with Image.open(path) as im:
                    im.load();row.update(width=im.width,height=im.height,format=im.format,mode=im.mode,non_rgb=im.mode!='RGB')
                    row['exif_json']=json.dumps({ExifTags.TAGS.get(k,str(k)):str(v) for k,v in im.getexif().items()},ensure_ascii=False)
                    rgb=ImageOps.exif_transpose(im).convert('RGB')
                    row['pixel_hash']=hashlib.sha256(str(rgb.size).encode()+rgb.tobytes()).hexdigest()
                    low=dctn(np.asarray(rgb.convert('L').resize((32,32)),dtype=float),type=2)[:8,:8]
                    bits=low>np.median(low.ravel()[1:]);row['phash']=f'{int("".join("1" if x else "0" for x in bits.ravel()),2):016x}'
                    row['dimension_anomaly']=min(rgb.size)<32
                    if row['dimension_anomaly']:reasons.append('dimension_too_small')
                    if official and not reasons:inputs.append(np.asarray(rgb.resize((224,224)),dtype=np.float32).transpose(2,0,1)/255)
                row['decode_warning']=';'.join(str(w.message) for w in caught)
            if row['format']=='JPEG':
                with path.open('rb') as f:f.seek(-2,2);row['jpeg_issue']='missing_terminal_eoi' if f.read()!=b'\xff\xd9' else ''
        except (OSError,ValueError) as exc:
            row['corrupt']=True;reasons.append('decode_error:'+str(exc))
        row['usable']=not reasons;row['exclude_reason']=';'.join(reasons);rows.append(row)
    write(REPORTS/'model_b1_raw_audit.csv',rows)
    usable=[r for r in rows if r['usable']]
    assert len(inputs)==len(usable)
    print('Raw audit',len(rows),'readable originals',len(usable),'classes',dict(Counter(r['class'] for r in usable)),flush=True)
    weights=ROOT/'yolo11n-cls.pt'
    model=YOLO(str(weights)).model.cpu().eval();torch.set_num_threads(4)
    assert len(model.names)==1000,'Must use ImageNet pretrained, not leaf-trained weights'
    collected=[];vectors=[]
    hook=model.model[-1].pool.register_forward_hook(lambda m,a,o:collected.append(o.detach().flatten(1).numpy()))
    for start in range(0,len(inputs),32):
        with torch.inference_mode():model(torch.from_numpy(np.stack(inputs[start:start+32])))
        vectors.append(collected.pop())
        if start%256==0:print('Embeddings',start,'/',len(inputs),flush=True)
    hook.remove();vec=np.concatenate(vectors);vec/=np.maximum(np.linalg.norm(vec,axis=1,keepdims=True),1e-12)
    np.savez_compressed(OUT/'features.npz',image_ids=np.array([r['image_id'] for r in usable]),vectors=vec)
    cosine=vec@vec.T; pairs={}
    neighbors=[set(np.argsort(-cosine[i])[1:7].tolist()) for i in range(len(usable))]
    for i,a in enumerate(usable):
        top=neighbors[i]
        for j in range(i+1,len(usable)):
            b=usable[j];dist=(int(a['phash'],16)^int(b['phash'],16)).bit_count()
            adjacent=a['class']==b['class'] and abs(a['filename_number']-b['filename_number'])<=2
            # Symmetric top-six CNN neighbors, close pHash and filename adjacency are retrieval only.
            cnn=j in top or i in neighbors[j]
            if dist<=8 or adjacent or cnn:
                pairs[(i,j)]=dict(image_a=a['image_id'],image_b=b['image_id'],filename_a=a['filename'],filename_b=b['filename'],class_a=a['class'],class_b=b['class'],
                    phash_distance=dist,embedding_cosine=float(np.clip(cosine[i,j],-1,1)),width_a=a['width'],height_a=a['height'],width_b=b['width'],height_b=b['height'],
                    filename_gap=abs(a['filename_number']-b['filename_number']) if a['class']==b['class'] else '',
                    candidate_group=f'candidate_pair_{i:04d}_{j:04d}',retrieval_reasons=';'.join(x for x,yes in [('phash_le_8',dist<=8),('cnn_top6',cnn),('adjacent_filename',adjacent)] if yes),
                    review_decision='uncertain',review_note='Candidate only; no fruit identity inferred',reviewer='')
    candidates=list(pairs.values());candidates.sort(key=lambda r:(-r['embedding_cosine'],r['phash_distance']))
    write(REPORTS/'model_b1_same_fruit_candidates.csv',candidates)
    # Inspect strongest CNN candidates, strongest pHash, plus adjacency examples in both classes.
    chosen={}
    for subset in (candidates[:48],sorted(candidates,key=lambda r:(r['phash_distance'],-r['embedding_cosine']))[:24],
                   [r for r in candidates if r['class_a']!=r['class_b']][:12],
                   [r for r in candidates if r['filename_gap']==1][:12]):
        for r in subset: chosen[(r['image_a'],r['image_b'])]=r
    lookup={r['image_id']:r for r in rows}
    sample=[]
    for n,r in enumerate(chosen.values(),1):
        row={**r,'review_id':f'B{n:03d}'};sample.append(row)
        canvas=Image.new('RGB',(1100,610),'white');draw=ImageDraw.Draw(canvas)
        draw.text((10,10),f"{row['review_id']} {row['candidate_group']} pHash={row['phash_distance']} CNN={row['embedding_cosine']:.5f}",fill='black')
        for col,key in enumerate(('image_a','image_b')):
            d=lookup[row[key]]
            draw.text((col*550+10,35),f"{d['class']} {d['filename']} {d['width']}x{d['height']}",fill='black')
            with Image.open(d['source_path']) as im:
                im=ImageOps.contain(ImageOps.exif_transpose(im).convert('RGB'),(530,530));canvas.paste(im,(col*550+(550-im.width)//2,65+(530-im.height)//2))
        canvas.save(OUT/f'{row["review_id"]}.jpg')
    write(OUT/'review.csv',sample)
    for start in range(0,len(sample),12):
        canvas=Image.new('RGB',(1650,4*330),'white')
        for n,r in enumerate(sample[start:start+12]):
            with Image.open(OUT/f'{r["review_id"]}.jpg') as im:canvas.paste(im.resize((550,305)),((n%3)*550,(n//3)*330))
        canvas.save(OUT/f'gallery_{start//12+1:02d}.jpg')
    method=dict(raw_images=len(rows),usable_originals=len(usable),candidate_pairs=len(candidates),review_pairs=len(sample),
        model='ImageNet pretrained YOLO11n-cls global average pool 1280-D',weights_sha256=sha(weights),
        preprocessing='EXIF corrected RGB, resize 224 square, /255, L2 pooled feature',
        thresholds='pHash <=8 and CNN top6 are retrieval only; no automatic fruit identity threshold',
        source='https://data.mendeley.com/datasets/3mtdhrwgfr/5',paper='https://pmc.ncbi.nlm.nih.gov/articles/PMC12545820/')
    (OUT/'method.json').write_text(json.dumps(method,indent=2),encoding='utf-8')
    assert before==raw_state();assert protected==protected_state()
    print(json.dumps(method,indent=2),flush=True)

if __name__=='__main__':main()
