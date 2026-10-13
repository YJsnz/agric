"""Feature extraction and stratified review, without modifying raw or splits."""
import csv
import hashlib
import json
import os
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT/'reports'
OUT = REPORTS/'jujube_near_duplicate_review'
os.environ.setdefault('YOLO_CONFIG_DIR',str(REPORTS/'.ultralytics'))
import numpy as np
import torch
from PIL import Image, ImageOps, ImageDraw
from scipy.ndimage import gaussian_filter
from ultralytics import YOLO


def read(name):
    with (REPORTS/name).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))


def write(path, rows, fields=None):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)


def ssim(a,b):
    # Standard Wang SSIM: Gaussian sigma 1.5, population covariance, data_range 1.
    ux=gaussian_filter(a,1.5,truncate=3.5);uy=gaussian_filter(b,1.5,truncate=3.5)
    vx=gaussian_filter(a*a,1.5,truncate=3.5)-ux*ux
    vy=gaussian_filter(b*b,1.5,truncate=3.5)-uy*uy
    cov=gaussian_filter(a*b,1.5,truncate=3.5)-ux*uy
    score=((2*ux*uy+.01**2)*(2*cov+.03**2))/((ux*ux+uy*uy+.01**2)*(vx+vy+.03**2))
    return float(score[5:-5,5:-5].mean())


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    raw=read('model_a_raw_manifest.csv'); by={r['image_id']:r for r in raw}
    pairs=read('model_a_near_duplicate_candidates.csv')
    ids=sorted({p[k] for p in pairs for k in ('image_a','image_b')})
    cache=OUT/'cnn_ssim_features.npz'
    weights=ROOT.parent/'wheat-vision/yolo11n-cls.pt'
    weight_hash=hashlib.sha256(weights.read_bytes()).hexdigest()
    torch.set_num_threads(4)
    if not cache.exists():
        model=YOLO(str(weights)).model.cpu().eval()
        embedding=[]
        hook=model.model[-1].pool.register_forward_hook(lambda module,args,out: embedding.append(out.detach().flatten(1).cpu().numpy()))
        gray=[];center=[];rgb_batch=[];vectors=[]
        for i,ident in enumerate(ids):
            with Image.open(by[ident]['original_path']) as im:
                im=ImageOps.exif_transpose(im).convert('RGB')
                gray.append(np.asarray(im.convert('L').resize((128,128)),dtype=np.float32)/255)
                w,h=im.size
                center.append(np.asarray(im.crop((w*.25,h*.25,w*.75,h*.75)).convert('L').resize((128,128)),dtype=np.float32)/255)
                rgb_batch.append(np.asarray(im.resize((224,224)),dtype=np.float32).transpose(2,0,1)/255)
            if len(rgb_batch)==32 or i==len(ids)-1:
                with torch.inference_mode():model(torch.from_numpy(np.stack(rgb_batch)))
                vectors.append(embedding.pop());rgb_batch=[]
            if (i+1)%200==0:print('Features',i+1,'/',len(ids),flush=True)
        hook.remove()
        vectors=np.concatenate(vectors);vectors/=np.maximum(np.linalg.norm(vectors,axis=1,keepdims=True),1e-12)
        np.savez_compressed(cache,ids=np.array(ids),gray=np.stack(gray),center=np.stack(center),vectors=vectors,weight_hash=weight_hash)
    cached=np.load(cache)
    assert list(cached['ids'])==ids and str(cached['weight_hash'])==weight_hash
    gray=cached['gray'];center=cached['center'];vectors=cached['vectors'];idx={v:i for i,v in enumerate(ids)}
    features=[]
    for n,pair in enumerate(pairs):
        a,b=by[pair['image_a']],by[pair['image_b']];ai,bi=idx[a['image_id']],idx[b['image_id']]
        exact=a['sha256']==b['sha256'] or a['pixel_sha256']==b['pixel_sha256']
        r={k:pair[k] for k in ('image_a','image_b','class_a','class_b','source_a','source_b','phash_distance')}
        for suffix,row in [('a',a),('b',b)]:
            for k in ('sha256','width','height'):r[k+'_'+suffix]=row[k]
        r.update(ssim=ssim(gray[ai],gray[bi]),center_ssim=ssim(center[ai],center[bi]),embedding_cosine=float(vectors[ai]@vectors[bi]),
                 width_ratio=int(a['width'])/int(b['width']),height_ratio=int(a['height'])/int(b['height']),
                 aspect_ratio_similarity=min(int(a['width'])/int(a['height']),int(b['width'])/int(b['height']))/max(int(a['width'])/int(a['height']),int(b['width'])/int(b['height'])),
                 review_status=('label_conflict' if a['mapped_class']!=b['mapped_class'] else 'confirmed_duplicate') if exact else 'uncertain',
                 confirmation='sha256_or_decoded_pixel_equality' if exact else '',reviewer='',review_note='')
        features.append(r)
        if (n+1)%2000==0:print('Pair metrics',n+1,'/',len(pairs),flush=True)
    write(REPORTS/'model_a_near_duplicate_candidates_v2.csv',features)
    cross=[r for r in features if r['class_a']!=r['class_b']]
    rank=lambda r:(int(r['phash_distance']),-r['ssim'],r['image_a'],r['image_b'])
    groups=read('model_a_similarity_groups.csv');largest=max(groups,key=lambda g:int(g['size']))['leakage_group']
    strata={
      'A_phash_top100':sorted(cross,key=rank)[:100],
      'B_cross_source_all_available':sorted([r for r in cross if r['source_a']!=r['source_b']],key=rank)[:100],
      'C_cross_class_top100':sorted(cross,key=lambda r:(-r['embedding_cosine'],-r['ssim'],r['image_a']))[:100],
      'D_largest_group_random100':random.Random(42).sample([r for r in cross if by[r['image_a']]['leakage_group']==largest and by[r['image_b']]['leakage_group']==largest],100),
    }
    selected={}
    for name,selection in strata.items():
        for row in selection:
            key=(row['image_a'],row['image_b'])
            if key not in selected:selected[key]={**row,'strata':name,'review_id':f'R{len(selected)+1:03d}'}
            elif name not in selected[key]['strata']:selected[key]['strata']+=';'+name
    # Additional non-cross-class, cross-source pairs to avoid omitting overlap.
    for row in features:
        if row['source_a']!=row['source_b'] and (row['image_a'],row['image_b']) not in selected:
            selected[(row['image_a'],row['image_b'])]={**row,'strata':'B_supplement_same_class','review_id':f'R{len(selected)+1:03d}'}
    sample=list(selected.values());write(OUT/'sample_review.csv',sample)
    for j,row in enumerate(sample):
        canvas=Image.new('RGB',(1000,560),'white');draw=ImageDraw.Draw(canvas)
        for col,k in enumerate(('image_a','image_b')):
            data=by[row[k]]
            with Image.open(data['original_path']) as im:
                thumbnail=ImageOps.contain(ImageOps.exif_transpose(im).convert('RGB'),(480,460));canvas.paste(thumbnail,(col*500+(500-thumbnail.width)//2,80+(460-thumbnail.height)//2))
            draw.text((col*500+10,8),row['review_id']+' '+data['mapped_class']+' / '+data['source_dataset'],fill='black')
            draw.text((col*500+10,26),data['image_id'],fill='black')
        draw.text((10,48),f"pHash={row['phash_distance']} SSIM={row['ssim']:.4f} center={row['center_ssim']:.4f} CNN cosine={row['embedding_cosine']:.4f}",fill='black')
        canvas.save(OUT/(row['review_id']+'.jpg'))
    # Compact galleries supplement the required individual full-size pairs.
    for start in range(0,len(sample),16):
        canvas=Image.new('RGB',(1600,4*300),'white');draw=ImageDraw.Draw(canvas)
        for k,row in enumerate(sample[start:start+16]):
            x=(k%4)*400;y=(k//4)*300
            with Image.open(OUT/(row['review_id']+'.jpg')) as im:canvas.paste(im.resize((400,224)),(x,y+28))
            draw.text((x+5,y+5),row['review_id']+' '+row['class_a']+' / '+row['class_b'],fill='black')
        canvas.save(OUT/f'gallery_{start//16+1:02d}.jpg')
    metadata={'weights':str(weights),'weight_sha256':weight_hash,'cnn':'ImageNet YOLO11n-cls final global average pool; 1280 dimensions; fixed eval, no training',
              'preprocessing':'EXIF corrected RGB resized 224x224 /255; whole-image feature, not leaf identity',
              'ssim':'128x128 gray, Gaussian sigma1.5, population covariance, range1; center SSIM is central 50% crop, not leaf segmentation',
              'sample_strata':{k:len(v) for k,v in strata.items()},'unique_review_pairs':len(sample),'largest_candidate_group':largest,
              'candidate_pairs':len(features),'cross_class_candidate_pairs':len(cross),'thresholds':'not selected before visual review'}
    (OUT/'method.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    print(json.dumps(metadata,indent=2),flush=True)


if __name__=='__main__':main()
