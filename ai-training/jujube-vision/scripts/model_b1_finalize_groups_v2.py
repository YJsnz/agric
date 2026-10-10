"""Persist assistant visual review; all-pairs groups; minimal-change Level A split.

No training, raw edits or inferred true fruit counts. Run after v2 review cards.
"""
import hashlib, itertools, json, random, shutil
from collections import Counter, defaultdict
from PIL import Image, ImageDraw
from model_b1_groups_v2 import ROOT, R, OUT, read, write, key
from model_b1_audit import raw_state, sha

NOTES={
5:'黄色果面散点、上部斜纹和下部边缘逐一对应，缩放变化；健康类采用纹理而非单纯颜色确认。',
13:'果面右侧小黑点排列、下部斜纹及左上轮廓一致。',
17:'右侧散点排列和下部斜纹对应；与V013、V029完成三对独立核对。',
29:'果面细点和下部斜纹对应，三图闭合复核通过。',
49:'扁果大块裂纹交点、左侧尖角与右侧破口一致。',
50:'三簇疤痕的形状和相对位置一致，尺度变化；另查V092闭合。',
51:'左端黑斑、中央锯齿形剥皮伤痕及上方小凹痕一致。',
52:'横向长裂缝、中央竖裂和扁平轮廓对应。',
53:'上缘波浪状伤痕、左下白色斑点及细散点位置对应。',
54:'椭圆伤痕内部纹理、左下黑点和散斑对应，尺度变化。',
55:'上部弧形长裂、下部三角裂纹及左端深色区一致。',
56:'旋转后中央凹陷、凹陷右侧褐点和不对称轮廓对应。',
58:'横向裂口端点、下方深色斑块及上方散点对应，尺度变化。',
59:'弧形浅色裂痕、中央小点及上缘褶皱对应。',
61:'上部红褐区树枝状裂纹、左端小柄与右侧凹凸对应。',
62:'倒弧状锯齿褐斑、顶缘细点与左侧果柄对应。',
63:'中央分叉褶皱、左下瘢痕及顶部果柄对应。',
64:'旋转后斜向裂痕、绿色边缘的缺口和局部果皮纹理对应。',
65:'右端折角状缺口、左侧放射细点和上部果皮纹理对应。',
66:'旋转后大片浅色伤痕中的细碎裂纹和端部深凹口对应；另查V093闭合。',
67:'中央凹陷分叉裂纹、左端缺口及右端细点对应。',
68:'右上浅伤痕纹理、下端缺口及中央散点对应，尺度变化。',
69:'中央凹陷、褐点和上下不对称轮廓对应；另查V094闭合。',
70:'右下绿色柄痕、左上细长裂痕和果面散点对应；另查V095闭合。',
92:'不同视角下三簇不规则疤痕的相对布局和细分支对应；与180/192、191/192逐对一致。ORB弱，未以其单独确认。',
93:'旋转后浅伤区网状细纹及端部凹口对应，与145的两条边闭合核验。',
94:'旋转后中央凹痕、褐点及偏心轮廓对应，与601的两条边闭合核验。',
95:'绿色柄痕、左上细裂及周边细点对应，与463的两条边闭合核验。',
}

def validated_components(edges, classes):
    adj=defaultdict(set)
    for a,b in edges:
        if classes[a]!=classes[b]: raise ValueError('Cross-class identity edge')
        adj[a].add(b);adj[b].add(a)
    seen=set();groups=[]
    for start in sorted(adj):
        if start in seen:continue
        todo=[start];members=set()
        while todo:
            a=todo.pop()
            if a in members:continue
            members.add(a);todo.extend(adj[a]-members)
        if any(key(a,b) not in edges for a,b in itertools.combinations(sorted(members),2)):
            raise ValueError('Incomplete pairwise evidence: chained grouping refused')
        seen.update(members);groups.append(sorted(members))
    return groups

def self_test():
    try:validated_components({('a','b'),('b','c')},{i:'healthy' for i in 'abc'})
    except ValueError:pass
    else:raise AssertionError('Chain was accepted')
    try:validated_components({('a','b')},{'a':'healthy','b':'bruised'})
    except ValueError:pass
    else:raise AssertionError('Cross-class edge accepted')
    assert validated_components({('a','b'),('a','c'),('b','c')},{i:'healthy' for i in 'abc'})==[['a','b','c']]

def main():
    self_test()
    target=ROOT/'data/jujube_fruit_bruise_classifier_v2_level_a'
    rows=read(R/'model_b1_manifest_v1.csv');by={r['image_id']:r for r in rows}
    expected_hashes={r['filename']:r['sha256'] for r in rows}
    if target.exists():
        for p in target.rglob('*'):
            if p.is_file():
                assert p.name in expected_hashes and sha(p)==expected_hashes[p.name], 'Existing output differs; refusing overwrite'
    before=json.loads((R/'model_b1_before_state.json').read_text(encoding='utf-8'))
    assert raw_state()==before['raw'], 'Raw changed since original audit'
    protected={p:[(ROOT/p).stat().st_size,(ROOT/p).stat().st_mtime_ns] for p in before['model_a']}
    assert protected==before['model_a'], 'Protected Model A files changed'
    old_review=read(R/'model_b1_same_fruit_review/review.csv')
    old={key(r['image_a'],r['image_b']):r for r in old_review if r['review_decision']=='same_fruit'}
    sample=read(OUT/'review.csv');assert len(sample)==95
    for r in sample:
        n=int(r['review_id'][1:]);prior=old.get(key(r['image_a'],r['image_b']))
        r['review_status']='confirmed_same_fruit' if n in NOTES or prior else 'uncertain'
        r['review_note']=NOTES.get(n,prior['review_note'] if prior else '已查看联系图；外观相似不足以确认个体身份，未发现足以可靠排除同果的证据，保留uncertain。')
        r['reviewer']='assistant_visual_review_not_human_or_expert_signoff'
    edges={key(r['image_a'],r['image_b']) for r in sample if r['review_status']=='confirmed_same_fruit'}
    assert set(old)<=edges
    groups=validated_components(edges,{i:r['class'] for i,r in by.items()})
    reviewed={key(r['image_a'],r['image_b']):r for r in sample}
    group_rows=[];consistency=[];changes=[];rng=random.Random(42)
    for members in groups:
        gid='fruit_'+hashlib.sha256('|'.join(members).encode()).hexdigest()[:16]
        votes=Counter(by[i]['split'] for i in members)
        tied=sorted(s for s,n in votes.items() if n==max(votes.values()))
        split=rng.choice(tied)
        for i in members:
            r=by[i]
            if r['split']!=split:changes.append(dict(image_id=i,filename=r['filename'],old_split=r['split'],new_split=split,group_id=gid))
            r['fruit_group_id']=gid;r['fruit_group_uncertain']='False';r['split']=split
        for a,b in itertools.combinations(members,2):
            review=reviewed[key(a,b)]
            consistency.append(dict(group_id=gid,image_a=a,image_b=b,review_id=review['review_id'],status=review['review_status'],note=review['review_note']))
        group_rows.append(dict(group_id=gid,group_size=len(members),**{'class':by[members[0]]['class']},
            members=';'.join(by[i]['filename'] for i in members),image_ids=';'.join(members),
            group_confidence='high_visual_multi_evidence_not_calibrated_probability',all_pairs_verified=True,split=split))
    for r in rows:
        r['fruit_identity_unverified']=not bool(r['fruit_group_id'])
        r['split_group_id']=r['fruit_group_id'] or 'singleton_'+r['image_id']
        r['split_status']='level_a_confirmed_group_safe_image_split'
        dest=target/r['split']/r['class']/r['filename'];dest.parent.mkdir(parents=True,exist_ok=True)
        if not dest.exists():shutil.copy2(r['source_path'],dest)
        assert sha(dest)==r['sha256']
        with Image.open(dest) as im:
            im.load();rgb=im.convert('RGB');pixel=hashlib.sha256(str(rgb.size).encode()+rgb.tobytes()).hexdigest()
        assert pixel==r['pixel_hash'], 'Pixel checksum mismatch'
        r['target_path']=str(dest.relative_to(ROOT))
    checks={}
    for field in ('fruit_group_id','sha256','pixel_hash'):
        seen=defaultdict(set)
        for r in rows:
            if r[field]:seen[r[field]].add(r['split'])
        checks['cross_split_'+field]=sum(len(v)>1 for v in seen.values())
    assert not any(checks.values())
    assert len(list(target.rglob('*.jpg')))==1464
    assert raw_state()==before['raw']
    assert {p:[(ROOT/p).stat().st_size,(ROOT/p).stat().st_mtime_ns] for p in protected}==protected
    candidates=read(R/'model_b1_same_fruit_candidates_v2.csv')
    for r in candidates:
        review=reviewed.get(key(r['image_a'],r['image_b']))
        if review:
            for f in ('review_status','review_note','reviewer'):r[f]=review[f]
        else:r['review_note']='Candidate retrieval only; not visually reviewed.'
    write(OUT/'review.csv',sample);write(R/'model_b1_same_fruit_candidates_v2.csv',candidates)
    # Update the displayed judgement without touching source images.
    for r in sample:
        p=OUT/(r['review_id']+'.jpg')
        with Image.open(p) as im:
            im=im.convert('RGB');d=ImageDraw.Draw(im)
            d.rectangle((0,20,1100,42),fill='white')
            d.text((8,23),f"ORB ratio={float(r['orb_match_ratio']):.3f} matches={r['orb_good_matches']} inliers={r['orb_affine_inliers']} judgement={r['review_status']}",fill='black')
            d.rectangle((0,590,1100,610),fill='white')
            d.text((8,592),'FINAL REVIEW: '+r['review_status']+' (assistant visual review)',fill='black');im.save(p)
    for start in range(0,len(sample),12):
        canvas=Image.new('RGB',(1650,1280),'white')
        for n,r in enumerate(sample[start:start+12]):
            with Image.open(OUT/(r['review_id']+'.jpg')) as im:canvas.paste(im.resize((550,305)),((n%3)*550,(n//3)*320))
        canvas.save(OUT/f'gallery_{start//12+1:02d}.jpg')
    write(R/'model_b1_manifest_v2.csv',rows)
    write(R/'model_b1_fruit_groups_v2.csv',group_rows)
    write(R/'model_b1_group_consistency_v2.csv',consistency)
    write(R/'model_b1_split_adjustments_v2.csv',changes)
    stats=[dict(split=s,**{'class':c},images=sum(r['split']==s and r['class']==c for r in rows)) for s in ('train','val','test') for c in ('healthy','bruised')]
    write(R/'model_b1_split_statistics_v2.csv',stats)
    summary=dict(raw_total=len(rows),healthy=732,bruised=732,candidate_pairs=len(candidates),review_pairs=len(sample),
        review_decisions=dict(Counter(r['review_status'] for r in sample)),confirmed_fruit_groups=len(groups),
        confirmed_grouped_images=sum(map(len,groups)),singleton_unverified_images=sum(r['fruit_identity_unverified'] for r in rows),
        confirmed_healthy_fruit_groups=sum(g['class']=='healthy' for g in group_rows),
        confirmed_bruised_fruit_groups=sum(g['class']=='bruised' for g in group_rows),
        split_counts=dict(Counter(r['split'] for r in rows)),split_reassigned_images=len(changes),seed=42,
        **checks,raw_unchanged=True,model_a_unchanged=True,training_ready_image_level=True,
        training_ready_fruit_independent=False,fruit_independent_test_proven=False,dataset=str(target))
    (R/'model_b1_group_audit_v2.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    method=json.loads((OUT/'method.json').read_text(encoding='utf-8'))
    method.update(review_pairs=len(sample),closure_pairs_added=4,reviewer='assistant_visual_review_not_human_or_expert_signoff')
    (OUT/'method.json').write_text(json.dumps(method,indent=2),encoding='utf-8')
    caveat='当前划分仅保证已确认同果实组不跨split，但由于公开数据未提供完整fruit identity映射，不能证明全部Train/Val/Test在果实个体层面独立。'
    report=f'''# Jujube Model B1 同果实分组复核 V2

## 结论与统计

```json
{json.dumps(summary,ensure_ascii=False,indent=2)}
```

{caveat}

本次确认指助手逐对视觉复核支持的分组，并非作者提供的fruit_id，也不是人工专家签字认证。
可以开展 Level A: confirmed-group-safe image split 的后续图像级实验；不能称为 fruit-independent test。
本阶段没有训练。未修改raw、既有v1数据集、Model A模型或其数据。

## 方法与限制

- 同类别Top-5邻居、相邻编号、现有组边界与组内配对，共{len(candidates)}候选；实际视觉复核{len(sample)}对。未复核候选不自动确认。
- 复用固定ImageNet预训练YOLO11n-cls的1280维embedding，不训练新模型；权重SHA及预处理见review目录method.json和v1方法文件。
- pHash、果实区域ORB双向ratio匹配、仿射RANSAC、轮廓面积/长宽比辅助核验。背景抑制是颜色启发式，不能保证完整分割果实。
- 全部1464张原图没有可用EXIF时间。编号相邻仅用于提名，许多明确同果图编号跨度很大，未推断拍摄顺序。
- 伤痕拓扑、细纹和散点相对布局是确认依据；健康果尤其不能只看颜色和轮廓。姿态不同不直接判为different_fruit。
- 每个组所有两两配对均已确认；额外补查4对以闭合三图组。A≈B、B≈C但缺A≈C时程序拒绝成组。
- 复核表提供confirmed_same_fruit/different_fruit/uncertain。本轮没有足够把握的different_fruit判定，未强填。
- 论文610果（healthy327、bruised283）只作sanity check，既未硬凑组数，也未把singleton数解释为真实果实数。
- 仅{sum(map(len,groups))}/{len(rows)}张进入确认组，身份覆盖仍低；未确认多视角跨split风险仍存在，测试指标可能偏乐观。

## 划分与校验

保留seed42的原有约70/15/15划分，只把新确认组内跨split成员移至该组原split多数；平票用seed42选择。
只改变{len(changes)}张的split，未做全量重新随机划分。所有singleton保持原split；fruit_group_id留空，另设singleton split_group_id并标记fruit_identity_unverified=true。
新复制数据：`data/jujube_fruit_bruise_classifier_v2_level_a/`。全部复制件通过SHA256、RGB像素哈希和解码检查。
确认组、SHA256、pixel-identical跨split均为0；这不是对未恢复fruit identity的无泄漏保证。
raw全部文件名称、大小、mtime与SHA256对照原审计快照不变；Model A保护清单不变。
程序自检包括跨类别拒绝、链式误合拒绝、全配对组三项。

## 可追溯文件

- model_b1_manifest_v2.csv：全量图像、分组、split和身份未知标记。
- model_b1_fruit_groups_v2.csv：成员、类别、定性置信描述。
- model_b1_group_consistency_v2.csv：每个组全部配对的复核编号及证据。
- model_b1_split_adjustments_v2.csv：仅必要的split变化。
- model_b1_split_statistics_v2.csv：每split每类统计。
- model_b1_same_fruit_review_v2/review.csv、V001–V095.jpg及8张联系图。

数据与论文来源（沿用前轮核验）：https://data.mendeley.com/datasets/3mtdhrwgfr/5 ，https://pmc.ncbi.nlm.nih.gov/articles/PMC12545820/ 。
数据来自孟加拉Ziziphus mauritiana，不能据此宣称为沧州金丝小枣本地独立验证。
'''
    (R/'JUJUBE_MODEL_B1_FRUIT_GROUP_AUDIT_V2.md').write_text(report,encoding='utf-8')
    print(json.dumps(summary,indent=2))

if __name__=='__main__':main()
