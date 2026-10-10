"""Create missing pairwise review cards, without assigning identity."""
from model_b1_groups_v2 import *

def main():
    rows=read(R/'model_b1_manifest_v1.csv'); by={r['image_id']:r for r in rows}
    names={r['filename']:r['image_id'] for r in rows}
    pairs={key(r['image_a'],r['image_b']):r for r in read(R/'model_b1_same_fruit_candidates_v2.csv')}
    sample=read(OUT/'review.csv')
    for n,(a,b) in enumerate([(191,180),(58,640),(77,7),(409,321)],92):
        ids=key(names[f'bruise_{a}.jpg'],names[f'bruise_{b}.jpg'])
        if ids not in pairs: raise RuntimeError(f'Missing candidate metrics {a}/{b}')
        r={**pairs[ids],'review_id':f'V{n:03d}','review_stratum':'F_complete_pairwise_closure'}
        sample.append(r)
        canvas=Image.new('RGB',(1100,610),'white');d=ImageDraw.Draw(canvas)
        d.text((8,5),f"{r['review_id']} bruised CNN={r['embedding_cosine']} pHash={r['phash_distance']} gap={r['filename_distance']}",fill='black')
        d.text((8,25),f"ORB ratio={r['orb_match_ratio']} inliers={r['orb_affine_inliers']} judgement=uncertain",fill='black')
        for col,i in enumerate(ids):
            d.text((col*550+8,45),by[i]['filename'],fill='black')
            with Image.open(by[i]['source_path']) as im:canvas.paste(im.convert('RGB'),(col*550+10,80))
        canvas.save(OUT/(r['review_id']+'.jpg'))
    write(OUT/'review.csv',sample)

if __name__=='__main__':main()
