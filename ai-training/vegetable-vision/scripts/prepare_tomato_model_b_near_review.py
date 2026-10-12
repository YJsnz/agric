"""Prepare human-review material only; original crops and memberships are read-only."""
import csv
import hashlib
import html
import json
import os
from collections import Counter
from pathlib import Path
from urllib.parse import quote

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
from scipy.fft import dctn

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/tomato_ripeness_classifier_v1'
REPORTS = ROOT / 'reports'
PAIRS = REPORTS / 'tomato_model_b_near_duplicate_review'


def read(p):
    with p.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def phash(image):
    # Standard 64-bit pHash: grayscale32x32, 2D DCT-II, top-left8x8 median.
    a = np.asarray(image.convert('L').resize((32,32), Image.Resampling.LANCZOS), dtype=float)
    low = dctn(a, type=2)[:8,:8]
    return int.from_bytes(np.packbits((low > np.median(low)).ravel()).tobytes(), 'big')


def dhash(image):
    a = np.asarray(image.convert('L').resize((9,8), Image.Resampling.LANCZOS))
    return int.from_bytes(np.packbits((a[:,1:]>a[:,:-1]).ravel()).tobytes(), 'big')


def main():
    candidates_path = DATA / 'manifests/near_duplicate_candidates_cross_split.csv'
    manifest_path = DATA / 'manifests/tomato_ripeness_crops_manifest.csv'
    candidates = read(candidates_path)
    manifest = {r['crop_filename']:r for r in read(manifest_path)}
    assert len(candidates)==27 and len(manifest)==14185
    review_path = REPORTS / 'tomato_model_b_cross_split_near_duplicate_review.csv'
    # Preserve any later human entries on repeat execution; never replace review decisions.
    prior = {(r['crop_a_path'],r['crop_b_path']):r for r in read(review_path)} if review_path.exists() else {}
    protected = [candidates_path,manifest_path]+sorted({ROOT/manifest[c[k]]['crop_path'] for c in candidates for k in ['crop_a','crop_b']})
    before = {str(p):(p.stat().st_size,p.stat().st_mtime_ns,sha(p)) for p in protected}
    PAIRS.mkdir(parents=True,exist_ok=True)
    font_path = Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts/consola.ttf'
    font = ImageFont.truetype(str(font_path),18) if font_path.exists() else ImageFont.load_default()
    title_font = ImageFont.truetype(str(font_path),24) if font_path.exists() else font
    rows=[]
    for i,c in enumerate(candidates,1):
        a,b = manifest[c['crop_a']],manifest[c['crop_b']]
        same = a['session_id']==b['session_id']
        gap = abs(int(a['frame_id'])-int(b['frame_id'])) if same else ''
        with Image.open(ROOT/a['crop_path']) as ia, Image.open(ROOT/b['crop_path']) as ib:
            pd = (phash(ia)^phash(ib)).bit_count()
            dd = (dhash(ia)^dhash(ib)).bit_count()
            assert dd==int(c['dhash_distance']) and dd<=4
            assert a['split']==c['split_a'] and b['split']==c['split_b']
            assert sha(ROOT/a['crop_path'])==a['crop_sha256'] and sha(ROOT/b['crop_path'])==b['crop_sha256']
            risk = 'high' if same and gap<=300 else 'medium' if same else 'low'
            r=dict(pair_id=f'pair_{i:03d}',split_a=a['split'],split_b=b['split'],crop_a_path=a['crop_path'],crop_b_path=b['crop_path'],
                   class_a=a['class_name'],class_b=b['class_name'],source_image_a=a['source_image'],source_image_b=b['source_image'],
                   session_a=a['session_id'],session_b=b['session_id'],frame_a=a['frame_id'],frame_b=b['frame_id'],frame_gap=gap,
                   block_a=a['block_id'],block_b=b['block_id'],instance_id_a=a['instance_id'],instance_id_b=b['instance_id'],
                   phash_distance=pd,dhash_distance=dd,same_session=same,same_class=a['class_name']==b['class_name'],risk_level=risk,
                   manual_review='',manual_note='')
            old=prior.get((r['crop_a_path'],r['crop_b_path']),{})
            for k in ['manual_review','manual_note']:r[k]=old.get(k,'')
            rows.append(r)
            canvas=Image.new('RGB',(1320,860),'#f2f5f3');draw=ImageDraw.Draw(canvas)
            draw.text((20,15),f'{r["pair_id"]} | {risk.upper()} | review priority only',font=title_font,fill='#163c2c')
            for x,im,m in [(20,ia,a),(680,ib,b)]:
                panel=ImageOps.contain(im.convert('RGB'),(620,500),Image.Resampling.LANCZOS)
                canvas.paste(panel,(x+(620-panel.width)//2,70+(500-panel.height)//2))
                text=[f'split: {m["split"]} | class: {m["class_name"]}',f'session: {m["session_id"]}',
                      f'frame: {m["frame_id"]} | block: {m["block_id"].rsplit(":",1)[1]}',f'instance: {m["instance_id"]}',
                      f'original crop: {im.width}x{im.height} | {m["quality_flag"]}']
                for j,t in enumerate(text):draw.text((x,585+j*29),t,font=font,fill='#142a23')
            draw.text((20,755),f'frame_gap: {gap if same else "N/A (different sessions)"} | pHash: {pd}/64 | dHash: {dd}/64 | risk: {risk}',font=font,fill='#142a23')
            draw.text((20,795),'Display resized to fit only. Original crops unchanged. No identity decision made.',font=font,fill='#455b50')
            canvas.save(PAIRS/f'{r["pair_id"]}.png')
    high=[r for r in rows if r['same_session'] and r['frame_gap']<=300]
    assert len(high)==5
    for p,rs in [(review_path,rows),(REPORTS/'tomato_model_b_high_risk_near_duplicate_pairs.csv',high)]:
        with p.open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rs)
    esc=html.escape
    page=['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>Tomato Model B 跨 split 近重复复核</title>',
          '<style>body{font:16px/1.6 sans-serif;background:#f3f6f3;color:#193428;margin:24px}article{background:white;border:1px solid #cadace;border-radius:12px;padding:18px;margin:20px 0}img{max-width:100%;height:auto}table{width:100%;table-layout:fixed;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;overflow-wrap:anywhere}.high{border-left:7px solid #bb5639}.medium{border-left:7px solid #d2a638}.low{border-left:7px solid #4d9474}a{color:#196445}</style>',
          '<h1>Tomato Model B：27 对跨 split 近重复候选</h1><p>仅人工复核准备，不删除数据、不改 split。risk_level 是复核优先级，不是同果实或删除结论。</p>',
          '<p>dHash：64位，候选阈值≤4；pHash：灰度32×32、二维DCT-II、左上8×8系数大于中位数（含DC）。pHash仅补充展示，不重新筛选候选。</p>',
          '<p>high：同session且frame gap≤300（现有dHash≤4）；medium：同session但gap&gt;300；low：不同session。跨session frame gap不具可比性，留空。</p>',
          '<p>全部27对在此页展示，高风险5对排在前面；人工结论请填写CSV的 manual_review / manual_note，本页不自动保存人工判断。</p>',
          '<p><a href="tomato_model_b_cross_split_near_duplicate_review.csv">完整复核CSV</a> · <a href="tomato_model_b_high_risk_near_duplicate_pairs.csv">高风险5对CSV</a></p>']
    for r in sorted(rows,key=lambda r:({'high':0,'medium':1,'low':2}[r['risk_level']],r['pair_id'])):
        page.append(f'<article class="{r["risk_level"]}" id="{r["pair_id"]}"><h2>{r["pair_id"]} · {r["risk_level"]}</h2><img src="tomato_model_b_near_duplicate_review/{r["pair_id"]}.png" alt="{r["pair_id"]}对比图"><table><tr><th>字段</th><th>A</th><th>B</th></tr>')
        for field in ['crop','split','class','source_image','session','frame','block','instance_id']:
            ka,kb=(('crop_a_path','crop_b_path') if field=='crop' else (field+'_a',field+'_b'))
            vals=[]
            for key in [ka,kb]:
                val=esc(str(r[key]))
                if field=='crop':val=f'<a href="{quote("../"+r[key],safe="/")}">{val}</a>'
                vals.append(val)
            page.append(f'<tr><td>{field}</td><td>{vals[0]}</td><td>{vals[1]}</td></tr>')
        page.append(f'</table><p>frame_gap={r["frame_gap"] if r["same_session"] else "N/A"}；pHash={r["phash_distance"]}；dHash={r["dhash_distance"]}；same_class={r["same_class"]}；same_session={r["same_session"]}</p><p>人工结论：{esc(r["manual_review"]) or "待填写"}；备注：{esc(r["manual_note"]) or "待填写"}</p></article>')
    page.append('</html>')
    (REPORTS/'TOMATO_MODEL_B_NEAR_DUPLICATE_REVIEW.html').write_text('\n'.join(page),encoding='utf-8')
    after={str(p):(p.stat().st_size,p.stat().st_mtime_ns,sha(p)) for p in protected}
    assert before==after
    print(json.dumps(dict(pairs=len(rows),images=sum((PAIRS/f'{r["pair_id"]}.png').exists() for r in rows),risk_counts=dict(Counter(r['risk_level'] for r in rows)),high=high,inputs_unchanged=True),ensure_ascii=False,indent=2))


if __name__=='__main__':main()
