"""Read-only candidate retrieval for B1 group recovery. No automatic identity labels."""
import csv,json,hashlib,itertools
from pathlib import Path
from collections import defaultdict
import numpy as np
import cv2
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1];R=ROOT/'reports';OUT=R/'model_b1_same_fruit_review_v2'

def read(p):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def write(p,rows):
    with p.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def key(a,b):return tuple(sorted((a,b)))
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=read(R/'model_b1_manifest_v1.csv');by={r['image_id']:r for r in rows}
    feat=np.load(R/'model_b1_same_fruit_review/features.npz');idx={i:n for n,i in enumerate(feat['image_ids'])};v=feat['vectors'];sim=v@v.T
    kp={};desc={};shape={}
    orb=cv2.ORB_create(nfeatures=1200,edgeThreshold=10,fastThreshold=8)
    for r in rows:
        im=cv2.imread(r['source_path']);hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
        # Background suppression only: not a learned fruit segmentation/identity model.
        mask=(hsv[:,:,1]>55).astype('uint8')*255
        contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            contour=max(contours,key=cv2.contourArea); mask[:]=0;cv2.drawContours(mask,[contour],-1,255,-1)
            x,y,w,h=cv2.boundingRect(contour);area=cv2.contourArea(contour)
            shape[r['image_id']]=(w,h,area/(im.shape[0]*im.shape[1]))
        else: shape[r['image_id']]=(0,0,0.)
        pts,d=orb.detectAndCompute(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY),mask)
        kp[r['image_id']]=np.array([p.pt for p in pts],dtype=np.float32);desc[r['image_id']]=d
    candidates=defaultdict(set)
    for cls in ('healthy','bruised'):
        members=[r for r in rows if r['class']==cls];ids=[r['image_id'] for r in members];indices=[idx[i] for i in ids]
        for a in members:
            aid=a['image_id'];ordered=sorted((float(sim[idx[aid],idx[b]]),b) for b in ids if b!=aid)[-5:]
            for _,b in ordered:candidates[key(aid,b)].add('same_class_embedding_top5')
        seq=sorted(members,key=lambda r:(int(r['filename_number']),r['image_id']))
        for a,b in zip(seq,seq[1:]):
            if abs(int(a['filename_number'])-int(b['filename_number']))==1:candidates[key(a['image_id'],b['image_id'])].add('adjacent_number')
    groups=read(R/'model_b1_fruit_groups.csv')
    for g in groups:
        ids=g['image_ids'].split(';')
        for a,b in itertools.combinations(ids,2):candidates[key(a,b)].add('existing_group_internal_pair')
        for a in ids:
            external=sorted((float(sim[idx[a],idx[b]]),b) for b in by if by[b]['class']==by[a]['class'] and b not in ids)[-2:]
            for _,b in external:candidates[key(a,b)].add('existing_group_boundary')
    matcher=cv2.BFMatcher(cv2.NORM_HAMMING)
    output=[]
    cv2.setRNGSeed(42)
    for n,((a,b),reasons) in enumerate(sorted(candidates.items()),1):
        da,db=desc[a],desc[b];good=[]
        if da is not None and db is not None and min(len(da),len(db))>=2:
            forward=matcher.knnMatch(da,db,k=2); reverse=matcher.knnMatch(db,da,k=2)
            back={m.queryIdx:m.trainIdx for pair in reverse if len(pair)==2 for m,t in [pair] if m.distance<.75*t.distance}
            good=[m for pair in forward if len(pair)==2 for m,t in [pair] if m.distance<.75*t.distance and back.get(m.trainIdx)==m.queryIdx]
        inliers=0
        if len(good)>=3:
            _,mask=cv2.estimateAffinePartial2D(np.float32([kp[a][m.queryIdx] for m in good]),np.float32([kp[b][m.trainIdx] for m in good]),method=cv2.RANSAC,ransacReprojThreshold=3,maxIters=2000)
            if mask is not None:inliers=int(mask.sum())
        aw,ah,area=shape[a];bw,bh,barea=shape[b]
        ratio=lambda x,y:min(x,y)/max(x,y) if max(x,y)>0 else 0.
        output.append(dict(image_a=a,image_b=b,filename_a=by[a]['filename'],filename_b=by[b]['filename'],**{'class':by[a]['class']},
            embedding_cosine=float(np.clip(sim[idx[a],idx[b]],-1,1)),phash_distance=(int(by[a]['phash'],16)^int(by[b]['phash'],16)).bit_count(),
            orb_match_ratio=len(good)/max(1,min(len(kp[a]),len(kp[b]))),orb_good_matches=len(good),orb_affine_inliers=inliers,
            orb_inlier_ratio=inliers/max(1,len(good)),filename_distance=abs(int(by[a]['filename_number'])-int(by[b]['filename_number'])),
            silhouette_aspect_similarity=ratio(aw/max(ah,1),bw/max(bh,1)),silhouette_area_similarity=ratio(area,barea),
            current_group_a=by[a]['fruit_group_id'],current_group_b=by[b]['fruit_group_id'],retrieval_reasons=';'.join(sorted(reasons)),
            review_status='uncertain',review_note='',reviewer=''))
        if n%1000==0:print('ORB candidate comparisons',n,'/',len(candidates),flush=True)
    output.sort(key=lambda r:(-r['orb_affine_inliers'],-r['embedding_cosine'],r['image_a']))
    write(R/'model_b1_same_fruit_candidates_v2.csv',output)
    selected={}
    pools=[('A_embedding',sorted(output,key=lambda r:-r['embedding_cosine'])[:30]),
           ('B_adjacent',sorted([r for r in output if r['filename_distance']==1],key=lambda r:(-r['orb_affine_inliers'],-r['embedding_cosine']))[:18]),
           ('C_bruised_local_matches',[r for r in output if r['class']=='bruised'][:24]),
           ('D_existing_boundary',[r for r in output if 'existing_group_boundary' in r['retrieval_reasons']][:20]),
           ('E_internal_consistency',[r for r in output if 'existing_group_internal_pair' in r['retrieval_reasons']])]
    for reason,subset in pools:
        for r in subset:
            k=key(r['image_a'],r['image_b'])
            if k not in selected:selected[k]={**r,'review_id':f'V{len(selected)+1:03d}','review_stratum':reason}
            else:selected[k]['review_stratum']+=';'+reason
    sample=list(selected.values());write(OUT/'review.csv',sample)
    for r in sample:
        canvas=Image.new('RGB',(1100,610),'white');d=ImageDraw.Draw(canvas)
        d.text((8,5),f"{r['review_id']} {r['class']} CNN={r['embedding_cosine']:.4f} pHash={r['phash_distance']} number_gap={r['filename_distance']}",fill='black')
        d.text((8,23),f"ORB ratio={r['orb_match_ratio']:.3f} matches={r['orb_good_matches']} affine_inliers={r['orb_affine_inliers']} judgement=uncertain",fill='black')
        for col,k in enumerate(('image_a','image_b')):
            row=by[r[k]];d.text((col*550+8,43),row['filename']+' '+(row['fruit_group_id'] or 'identity unknown'),fill='black')
            with Image.open(row['source_path']) as im:
                im=ImageOps.contain(im.convert('RGB'),(530,530));canvas.paste(im,(col*550+(550-im.width)//2,70))
        canvas.save(OUT/(r['review_id']+'.jpg'))
    for start in range(0,len(sample),12):
        canvas=Image.new('RGB',(1650,1280),'white')
        for n,r in enumerate(sample[start:start+12]):
            with Image.open(OUT/(r['review_id']+'.jpg')) as im:canvas.paste(im.resize((550,305)),((n%3)*550,(n//3)*320))
        canvas.save(OUT/f'gallery_{start//12+1:02d}.jpg')
    method=dict(candidate_pairs=len(output),review_pairs=len(sample),top_k=5,
        embedding='Reuse fixed ImageNet-pretrained YOLO11n-cls 1280D features from B1 audit; not Model A trained weights',
        embedding_weights_sha256=json.loads((R/'model_b1_same_fruit_review/method.json').read_text())['weights_sha256'],
        local_features='ORB 1200 features, saturation>55 largest component mask to suppress background; mutual Lowe ratio<0.75, affine RANSAC 3px; retrieval/support only',
        mask_limitations='Color heuristic may miss scars/fruit boundary. Shape similarity is not identity proof.',
        exif='No EXIF in 1464 original images',confirmation='Requires visual scar/texture correspondence and all-pairs group consistency, no automated score threshold')
    (OUT/'method.json').write_text(json.dumps(method,indent=2),encoding='utf-8')
    print(json.dumps(method,indent=2),flush=True)

if __name__=='__main__':main()
