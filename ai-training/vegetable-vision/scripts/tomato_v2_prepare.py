"""V2 read-only feature audit. No training, relabeling or raw mutation."""
from pathlib import Path
from collections import defaultdict,Counter
import csv,json,hashlib,itertools,re
import os
os.environ.setdefault('YOLO_CONFIG_DIR',str(Path(__file__).resolve().parents[1]/'reports/tomato_model_a_review_v2/ultralytics_config'))
import numpy as np
import cv2
import torch
from PIL import Image,ImageOps,ImageDraw
from ultralytics import YOLO

ROOT=Path(__file__).resolve().parents[1];R=ROOT/'reports';OUT=R/'tomato_model_a_review_v2'
def read(name):
    with (R/name).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def write(path,rows,fields=None):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0]),extrasaction='ignore');w.writeheader();w.writerows(rows)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
class DSU:
    def __init__(self,n):self.p=list(range(n))
    def find(self,a):
        while self.p[a]!=a:self.p[a]=self.p[self.p[a]];a=self.p[a]
        return a
    def union(self,a,b):self.p[self.find(b)]=self.find(a)

def exact(rows):
    d=DSU(len(rows));groups=defaultdict(list)
    for field in ('sha256','pixel_sha256'):
        index={}
        for i,r in enumerate(rows):
            if r[field] in index:d.union(i,index[r[field]])
            else:index[r[field]]=i
    for i in range(len(rows)):groups[d.find(i)].append(i)
    stats=Counter();conflicts=[]
    for members in groups.values():
        members.sort(key=lambda i:rows[i]['source_path'].replace('\\','/').casefold());rep=members[0]
        mixed=len({rows[i]['normalized_class'] for i in members})>1;gid=f'exact_{rep:05d}'
        if len(members)>1:
            stats['duplicate_groups']+=1;stats['duplicate_images']+=len(members)
            stats['cross_label_groups' if mixed else 'same_label_groups']+=1
        for i in members:
            r=rows[i];r['image_id']=f'T{i:05d}';r['duplicate_group_id']=gid if len(members)>1 else ''
            r['excluded_reason']='cross_label_exact_duplicate_conflict' if mixed else 'same_label_exact_duplicate' if i!=rep else ''
            r['excluded']=bool(r['excluded_reason']);r['pixel_hash']=r['pixel_sha256']
            r['label_conflict']=mixed
            if mixed:conflicts.append(dict(group_id=gid,**{k:r[k] for k in ['filename','source_path','original_class','normalized_class','sha256','pixel_hash','excluded']}))
            if r['excluded']:stats[r['excluded_reason']]+=1
    write(R/'tomato_model_a_label_conflicts_v2.csv',conflicts)
    write(R/'tomato_model_a_exact_cleaning_v2.csv',rows)
    (R/'tomato_model_a_exact_summary_v2.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
    print('EXACT',dict(stats),flush=True)

def features(rows):
    cache=OUT/'features.npz';weights=ROOT.parent/'wheat-vision/yolo11n-cls.pt';wh=sha(weights)
    signature=hashlib.sha256(''.join(r['sha256'] for r in rows).encode()).hexdigest()
    if cache.exists():
        c=np.load(cache);assert str(c['signature'])==signature and str(c['weights_sha256'])==wh
        return c['vectors'],c['background']
    torch.set_num_threads(4);model=YOLO(str(weights)).model.cpu().eval();captured=[];vectors=[];batch=[];bg=[]
    hook=model.model[-1].pool.register_forward_hook(lambda m,args,y:captured.append(y.detach().flatten(1).cpu().numpy()))
    for i,r in enumerate(rows):
        with Image.open(r['source_path']) as im:
            im=im.convert('RGB');a=np.asarray(im.resize((224,224),Image.Resampling.BILINEAR))
            batch.append(a.astype(np.float32).transpose(2,0,1)/255)
            # Border color histogram is only a background proxy, never identity proof.
            hsv=cv2.cvtColor(a,cv2.COLOR_RGB2HSV);mask=np.zeros((224,224),np.uint8);mask[:24]=255;mask[-24:]=255;mask[:,:24]=255;mask[:,-24:]=255
            hist=cv2.calcHist([hsv],[0,1],mask,[12,8],[0,180,0,256]).flatten();hist/=max(np.linalg.norm(hist),1e-12);bg.append(hist)
        if len(batch)==32 or i==len(rows)-1:
            with torch.inference_mode():model(torch.from_numpy(np.stack(batch)))
            vectors.append(captured.pop());batch=[]
        if (i+1)%1024==0:print('EMBED',i+1,flush=True)
    hook.remove();v=np.concatenate(vectors);v/=np.maximum(np.linalg.norm(v,axis=1,keepdims=True),1e-12)
    np.savez_compressed(cache,vectors=v,background=np.array(bg),signature=signature,weights_sha256=wh)
    (OUT/'embedding_method.json').write_text(json.dumps(dict(model='Fixed ImageNet-pretrained YOLO11n-cls pooled backbone',weights=str(weights),sha256=wh,dimensions=int(v.shape[1]),input='RGB resize 224x224 bilinear /255; no random transforms',training=False),indent=2),encoding='utf-8')
    return v,np.array(bg)

SIFT=cv2.SIFT_create(nfeatures=500);LOCAL={}
def local(i,rows):
    if i not in LOCAL:
        gray=cv2.imread(rows[i]['source_path'],cv2.IMREAD_GRAYSCALE);gray=cv2.resize(gray,(256,256))
        kp,des=SIFT.detectAndCompute(gray,None);LOCAL[i]=(np.array([k.pt for k in kp],np.float32),des,gray)
    return LOCAL[i]
def geometry(a,b,rows):
    pa,da,ga=local(a,rows);pb,db,gb=local(b,rows)
    result=dict(sift_matches=0,sift_inliers=0,sift_inlier_ratio=0.,spatial_coverage=0.,aligned_correlation=0.)
    if da is None or db is None or len(db)<2:return result
    mm=cv2.BFMatcher().knnMatch(da,db,k=2);good=[m for pair in mm if len(pair)==2 for m,n in [pair] if m.distance<.7*n.distance]
    result['sift_matches']=len(good)
    if len(good)<6:return result
    x=np.array([pa[m.queryIdx] for m in good]);y=np.array([pb[m.trainIdx] for m in good])
    cv2.setRNGSeed(42);matrix,mask=cv2.estimateAffinePartial2D(x,y,method=cv2.RANSAC,ransacReprojThreshold=3)
    if matrix is None:return result
    sel=mask.ravel().astype(bool);inliers=int(sel.sum());coverage=float(cv2.contourArea(cv2.convexHull(x[sel]))/(256*256)) if inliers>=3 else 0
    aligned=cv2.warpAffine(ga,matrix,(256,256));valid=cv2.warpAffine(np.ones_like(ga),matrix,(256,256))>0
    corr=float(np.corrcoef(aligned[valid],gb[valid])[0,1]) if valid.sum()>100 and np.std(aligned[valid])>0 and np.std(gb[valid])>0 else 0.
    result.update(sift_inliers=inliers,sift_inlier_ratio=inliers/len(good),spatial_coverage=coverage,aligned_correlation=corr)
    return result

def panel(p,rows):
    canvas=Image.new('RGB',(700,340),'white');draw=ImageDraw.Draw(canvas)
    for col,key in enumerate(['a','b']):
        r=rows[int(p[key])]
        with Image.open(r['source_path']) as im:
            thumb=ImageOps.contain(im.convert('RGB'),(330,260));canvas.paste(thumb,(col*350+(330-thumb.width)//2,65))
        draw.text((col*350+4,40),r['filename'],fill='black')
    draw.text((4,3),f"{p['review_id']} {p['class_a']} / {p['class_b']} Tier {p['tier']}",fill='black')
    draw.text((4,19),f"cos={p['cosine']:.4f} pH={p['phash_distance']} dH={p['dhash_distance']} gap={p['filename_gap']} SIFT={p['sift_inliers']} corr={p['aligned_correlation']:.3f}",fill='black')
    return canvas

def main():
    OUT.mkdir(parents=True,exist_ok=True);rows=read('tomato_model_a_raw_inventory.csv');exact(rows)
    v,bg=features(rows);idx={r['source_path']:i for i,r in enumerate(rows)};pairs=set()
    for p in read('tomato_model_a_near_duplicate_candidates.csv'):pairs.add(tuple(sorted((idx[p['image_a']],idx[p['image_b']]))))
    # Top10 within each class for every image, including excluded images for auditing.
    nn=[]
    for cls in sorted({r['normalized_class'] for r in rows}):
        ids=np.array([i for i,r in enumerate(rows) if r['normalized_class']==cls]);sim=v[ids]@v[ids].T;np.fill_diagonal(sim,-2)
        top=np.argsort(-sim,axis=1,kind='stable')[:,:10]
        for j,a in enumerate(ids):
            for rank,k in enumerate(top[j],1):
                b=int(ids[k]);a=int(a);pairs.add(tuple(sorted((a,b))));nn.append(dict(image_id=rows[a]['image_id'],neighbor_id=rows[b]['image_id'],rank=rank,cosine=float(sim[j,k])))
    write(R/'tomato_model_a_embedding_neighbors_v2.csv',nn)
    for p in read('tomato_model_a_sequence_candidates.csv'):pairs.add(tuple(sorted((idx[p['image_a']],idx[p['image_b']]))))
    scored=[]
    for a,b in sorted(pairs):
        ra,rb=rows[a],rows[b];ph=(int(ra['phash'],16)^int(rb['phash'],16)).bit_count();dh=(int(ra['dhash'],16)^int(rb['dhash'],16)).bit_count()
        gap=abs(int(re.findall(r'\d+',ra['filename'])[0])-int(re.findall(r'\d+',rb['filename'])[0]))
        cosine=float(v[a]@v[b]);same=ra['normalized_class']==rb['normalized_class']
        scored.append(dict(a=a,b=b,class_a=ra['normalized_class'],class_b=rb['normalized_class'],image_a=ra['source_path'],image_b=rb['source_path'],cosine=cosine,phash_distance=ph,dhash_distance=dh,filename_gap=gap,background_cosine=float(bg[a]@bg[b]),same_class=same,excluded_endpoint=ra['excluded'] or rb['excluded'],tier='C',sift_matches=0,sift_inliers=0,sift_inlier_ratio=0.,spatial_coverage=0.,aligned_correlation=0.,local_features_checked=False))
    eligible=[p for p in scored if not p['excluded_endpoint']]
    same=sorted([p for p in eligible if p['same_class']],key=lambda p:(-p['cosine'],p['phash_distance'],p['filename_gap']))
    cross=sorted([p for p in eligible if not p['same_class']],key=lambda p:(-p['cosine'],p['phash_distance']))
    high={ (p['a'],p['b']) for p in same[:1000]+cross[:200] }
    high.update((p['a'],p['b']) for p in same if p['cosine']>=.98 and p['phash_distance']<=10)
    for n,p in enumerate(scored):
        if (p['a'],p['b']) in high:
            p.update(geometry(p['a'],p['b'],rows));p['local_features_checked']=True
        if p['cosine']>=.985 and p['sift_inliers']>=15 and p['sift_inlier_ratio']>=.7 and p['spatial_coverage']>=.1 and p['aligned_correlation']>=.9:p['tier']='A'
        elif p['cosine']>=.94 and (p['phash_distance']<=10 or p['sift_inliers']>=8):p['tier']='B'
    write(R/'tomato_model_a_scored_pairs_v2.csv',scored)
    # Bounded review workload. Reserve cross-label risk review, never auto-merge it.
    rank=lambda p:('ABC'.index(p['tier']),-p['sift_inliers'],-p['cosine'],p['phash_distance'])
    selected=sorted([p for p in eligible if p['tier']=='A'],key=rank)
    selected+=sorted([p for p in same if p['tier']=='B' and p['local_features_checked']],key=rank)[:80]
    selected+=sorted([p for p in cross if p['tier']=='B' and p['local_features_checked']],key=rank)[:20]
    for i,p in enumerate(selected):
        p.update(review_id=f'R{i+1:03d}',decision='pending',group_type='uncertain',review_note='',reviewer='')
        panel(p,rows).save(OUT/(p['review_id']+'.jpg'),quality=90)
    write(OUT/'pair_review.csv',selected)
    for start in range(0,len(selected),24):
        sheet=Image.new('RGB',(1400,8*230),'white')
        for j,p in enumerate(selected[start:start+24]):
            im=panel(p,rows).resize((466,226));sheet.paste(im,((j%3)*466,(j//3)*230))
        sheet.save(OUT/f'contact_{start//24+1:02d}.jpg',quality=92)
    anomalies=[r for r in rows if r['nonstandard_size']=='True' or r['extension_format_mismatch']=='True']
    for start in range(0,len(anomalies),12):
        sheet=Image.new('RGB',(1200,4*290),'white');d=ImageDraw.Draw(sheet)
        for j,r in enumerate(anomalies[start:start+12]):
            x=(j%3)*400;y=(j//3)*290
            with Image.open(r['source_path']) as im:sheet.paste(ImageOps.contain(im.convert('RGB'),(380,250)),(x,y+36))
            d.text((x+3,y+2),f"{r['image_id']} {r['filename']} {r['width']}x{r['height']} {r['format']}",fill='black')
        sheet.save(OUT/f'anomalies_{start//12+1}.jpg',quality=92)
    write(OUT/'anomaly_review.csv',[dict(image_id=r['image_id'],filename=r['filename'],source_path=r['source_path'],class_name=r['normalized_class'],width=r['width'],height=r['height'],format=r['format'],decision='pending',note='') for r in anomalies])
    (OUT/'method.json').write_text(json.dumps(dict(scored_pairs=len(scored),local_feature_pairs=len(high),tier_counts=dict(Counter(p['tier'] for p in eligible)),review_pairs=len(selected),review_tier_counts=dict(Counter(p['tier'] for p in selected)),candidate_only=True),indent=2),encoding='utf-8')
    print((OUT/'method.json').read_text(),flush=True)
if __name__=='__main__':main()
