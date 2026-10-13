"""Group-consistent split, high-risk holdout review, then verified file copies."""
from tomato_v2_prepare import *
import argparse,shutil
from collections import Counter,defaultdict

def load_csv(path):
    with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def as_pair(p):return tuple(sorted((int(p['a']),int(p['b']))))
def jsonsave(path,x):path.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')

def state():
    rows=read('tomato_model_a_exact_cleaning_v2.csv')
    for r in rows:r['excluded']=r['excluded']=='True'
    reviews=load_csv(OUT/'pair_review.csv')
    for p in sorted(OUT.glob('cross_split_review_*.csv')):reviews+=load_csv(p)
    confirmed={};cross=set();scenes=set()
    for p in reviews:
        if p['decision']=='pending':continue
        a,b=as_pair(p)
        if p['decision']=='confirmed_cross_label_source_conflict':cross.update((a,b))
        elif p['decision']=='confirmed_same_source':
            assert rows[a]['normalized_class']==rows[b]['normalized_class']
            confirmed[(a,b)]=p['group_type']
    # Build split constraints only from directly reviewed same-class relationships.
    # Connected components are NOT automatically claimed as leaf identities.
    d=DSU(len(rows))
    for a,b in confirmed:d.union(a,b)
    components=defaultdict(list)
    for i,r in enumerate(rows):
        if not r['excluded']:components[d.find(i)].append(i)
    groups=[];consistency=[]
    for members in components.values():
        gid=f'G{min(members):05d}';types=set();complete=True
        for a,b in itertools.combinations(sorted(members),2):
            typ=confirmed.get((a,b));complete &= typ is not None
            if typ:types.add(typ)
            consistency.append(dict(group_id=gid,image_a=rows[a]['image_id'],image_b=rows[b]['image_id'],directly_reviewed=typ is not None,type=typ or 'not_claimed_identity'))
        kind=('same_leaf' if 'same_leaf' in types else 'same_source_transform') if len(members)>1 and complete else 'uncertain'
        if len(members)==1 and rows[members[0]]['duplicate_group_id']:kind='exact_duplicate'
        quarantined=bool(set(members)&cross)
        for i in members:
            rows[i].update(group_id=gid,group_type=kind,identity_verified=bool(complete and len(members)>1),split_constraint_only=not complete,split='')
            if quarantined:rows[i].update(excluded=True,excluded_reason='reviewed_cross_label_same_source_conflict')
        groups.append(dict(group_id=gid,group_size=len(members),class_name=rows[members[0]]['normalized_class'],group_type=kind,identity_verified=bool(complete and len(members)>1),all_pairs_reviewed=complete,quarantined=quarantined,members='|'.join(rows[i]['image_id'] for i in members)))
    write(R/'tomato_model_a_group_consistency_v2.csv',consistency,['group_id','image_a','image_b','directly_reviewed','type'])
    for r in rows:
        r.setdefault('group_id',r['duplicate_group_id']);r.setdefault('group_type','exact_duplicate');r.setdefault('identity_verified',False);r.setdefault('split_constraint_only',False);r.setdefault('split','')
    # Stratified seeded group assignment, large groups first; no performance metrics.
    rng=np.random.default_rng(42)
    for cls in sorted({r['normalized_class'] for r in rows}):
        gs=[g for g in groups if not g['quarantined'] and g['class_name']==cls]
        rng.shuffle(gs);gs.sort(key=lambda g:-g['group_size'])
        total=sum(g['group_size'] for g in gs);target=np.array([.7,.15,.15])*total;current=np.zeros(3,int)
        for g in gs:
            k=int(np.argmax(target-current));split=['train','val','test'][k];current[k]+=g['group_size']
            for ident in g['members'].split('|'):rows[int(ident[1:])]['split']=split
    return rows,groups,reviews,confirmed

def preview(round_number):
    rows,groups,reviews,confirmed=state();v=np.load(OUT/'features.npz')['vectors']
    done={as_pair(p) for p in reviews if p['decision']!='pending'};risk=[];high_count=0
    ids=np.array([i for i,r in enumerate(rows) if not r['excluded']]);splits=np.array([rows[i]['split'] for i in ids])
    # Re-run high-threshold embedding search across ALL clean images and classes.
    for start in range(0,len(ids),192):
        aa=ids[start:start+192];sim=v[aa]@v[ids].T
        for j,a in enumerate(aa):
            for k in np.flatnonzero((sim[j]>=.98)&(ids>a)&(splits!=rows[a]['split'])):
                b=int(ids[k]);a=int(a);ph=(int(rows[a]['phash'],16)^int(rows[b]['phash'],16)).bit_count()
                if ph>10:continue
                high_count+=1
                if (a,b) in done:continue
                risk.append(dict(a=a,b=b,class_a=rows[a]['normalized_class'],class_b=rows[b]['normalized_class'],same_class=rows[a]['normalized_class']==rows[b]['normalized_class'],cosine=float(sim[j,k]),phash_distance=ph,dhash_distance=(int(rows[a]['dhash'],16)^int(rows[b]['dhash'],16)).bit_count(),filename_gap=abs(int(re.findall(r'\d+',rows[a]['filename'])[0])-int(re.findall(r'\d+',rows[b]['filename'])[0])),tier='post_split_high_risk',split_a=rows[a]['split'],split_b=rows[b]['split']))
    risk.sort(key=lambda p:(-p['cosine'],p['phash_distance']))
    for p in risk[:150]:p.update(geometry(p['a'],p['b'],rows))
    top=sorted(risk[:150],key=lambda p:(-p['sift_inliers'],-p['aligned_correlation'],-p['cosine']))[:48]
    for i,p in enumerate(top):
        p.update(review_id=f'X{round_number}_{i+1:03d}',decision='pending',group_type='uncertain',review_note='',reviewer='')
        panel(p,rows).save(OUT/(p['review_id']+'.jpg'),quality=92)
    fields=list(top[0]) if top else ['a','b','review_id','decision','group_type']
    write(OUT/f'cross_split_review_{round_number}.csv',top,fields)
    for start in range(0,len(top),24):
        sheet=Image.new('RGB',(1400,1840),'white')
        for j,p in enumerate(top[start:start+24]):sheet.paste(panel(p,rows).resize((466,226)),((j%3)*466,(j//3)*230))
        sheet.save(OUT/f'cross_{round_number}_{start//24+1}.jpg',quality=92)
    jsonsave(OUT/f'cross_scan_{round_number}.json',dict(thresholds={'cosine':.98,'phash_max':10},high_threshold_cross_split_pairs=high_count,unreviewed_high_threshold_pairs=len(risk),selected=len(top),scope='all clean cross-split images; no model test metrics'))
    write(R/'tomato_model_a_provisional_split_v2.csv',rows)
    print('PREVIEW',round_number,'clean',sum(not r['excluded'] for r in rows),'high cross pairs',high_count,'selected',len(top),flush=True)

def finalize():
    rows,groups,reviews,confirmed=state();assert all(p['decision']!='pending' for p in reviews),'Pending reviews'
    # Final all-pairs high-threshold scan. Remaining candidates are explicitly
    # unresolved, never mislabeled as confirmed different leaves or zero risk.
    vectors=np.load(OUT/'features.npz')['vectors'];ids=np.array([i for i,r in enumerate(rows) if not r['excluded']])
    splits=np.array([rows[i]['split'] for i in ids]);reviewed_pairs={as_pair(p) for p in reviews};remaining=[]
    for start in range(0,len(ids),192):
        aa=ids[start:start+192];sim=vectors[aa]@vectors[ids].T
        for j,a in enumerate(aa):
            for k in np.flatnonzero((sim[j]>=.98)&(ids>a)&(splits!=rows[a]['split'])):
                b=int(ids[k]);a=int(a);ph=(int(rows[a]['phash'],16)^int(rows[b]['phash'],16)).bit_count()
                if ph<=10:remaining.append(dict(image_a=rows[a]['image_id'],image_b=rows[b]['image_id'],path_a=rows[a]['source_path'],path_b=rows[b]['source_path'],class_a=rows[a]['normalized_class'],class_b=rows[b]['normalized_class'],split_a=rows[a]['split'],split_b=rows[b]['split'],cosine=float(sim[j,k]),phash_distance=ph,review_status='previously_reviewed' if (a,b) in reviewed_pairs else 'unverified_candidate'))
    write(R/'tomato_model_a_remaining_cross_split_candidates_v2.csv',remaining,['image_a','image_b','path_a','path_b','class_a','class_b','split_a','split_b','cosine','phash_distance','review_status'])
    clean=[r for r in rows if not r['excluded']];assert all(r['split'] in ('train','val','test') for r in clean)
    cleanroot=ROOT/'data/tomato_leaf_classifier_clean_v2';finalroot=ROOT/'data/tomato_leaf_classifier_v1'
    assert not cleanroot.exists() and not finalroot.exists(),'Refuse overwriting existing datasets'
    expected_clean=set();expected_final=set();checks=defaultdict(lambda:defaultdict(set));new_pixels={}
    for i,r in enumerate(rows):
        r['clean_path']='';r['final_path']='';r['reencoded']=False;r['class']=r['normalized_class']
        if r['excluded']:continue
        name=Path(r['candidate_path']).name;dst=cleanroot/r['class']/name;final=finalroot/r['split']/r['class']/name
        dst.parent.mkdir(parents=True,exist_ok=True);final.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(r['source_path'],dst);shutil.copyfile(dst,final)
        assert sha(dst)==sha(final)==r['sha256']
        with Image.open(final) as im:
            im.load();rgb=im.convert('RGB');ph=hashlib.sha256(f'RGB:{rgb.width}:{rgb.height}:'.encode()+rgb.tobytes()).hexdigest()
        assert ph==r['pixel_hash'];new_pixels[i]=ph
        checks['sha256'][sha(final)].add(r['split']);checks['pixel_identical'][ph].add(r['split']);checks['group'][r['group_id']].add(r['split'])
        r.update(clean_path=str(dst),final_path=str(final));expected_clean.add(str(dst));expected_final.add(str(final))
    assert expected_clean=={str(p) for p in cleanroot.rglob('*') if p.is_file()}
    assert expected_final=={str(p) for p in finalroot.rglob('*') if p.is_file()}
    leak={k:sum(len(v)>1 for v in groups0.values()) for k,groups0 in checks.items()}
    for kind in ('same_leaf','same_source_transform','same_scene'):
        leak[kind]=sum(not rows[a]['excluded'] and not rows[b]['excluded'] and rows[a]['split']!=rows[b]['split'] for (a,b),t in confirmed.items() if t==kind)
    assert not any(leak.values()),leak
    # Verify every raw original, plus the untouched V1 candidate copy.
    snapshot=json.loads((R/'tomato_model_a_raw_integrity_snapshot.json').read_text(encoding='utf-8'));raw=ROOT/'raw/tomato_model_a_tlid'
    actual={p.relative_to(raw).as_posix():[p.stat().st_size,p.stat().st_mtime_ns,sha(p)] for p in raw.rglob('*') if p.is_file()}
    assert actual==snapshot,'Raw changed'
    assert all(sha(r['candidate_path'])==r['sha256'] for r in rows),'Candidate V1 changed'
    write(R/'tomato_model_a_clean_manifest_v2.csv',rows)
    write(R/'tomato_model_a_groups_v2.csv',groups)
    write(R/'tomato_model_a_split_manifest_v1.csv',clean)
    stats=[dict(class_name=c,clean=sum(r['class']==c for r in clean),**{s:sum(r['class']==c and r['split']==s for r in clean) for s in ('train','val','test')}) for c in sorted({r['class'] for r in clean})]
    write(R/'tomato_model_a_split_statistics_v2.csv',stats)
    retained=[g for g in groups if not g['quarantined']]
    summary=dict(raw_images=len(rows),exact=json.loads((R/'tomato_model_a_exact_summary_v2.json').read_text()),
        excluded_reasons=dict(Counter(r['excluded_reason'] for r in rows if r['excluded'])),
        confirmed_group_counts=dict(Counter(g['group_type'] for g in retained if g['group_size']>1)),
        confirmed_group_images={k:sum(g['group_size'] for g in retained if g['group_type']==k and g['group_size']>1) for k in ('same_leaf','same_source_transform','same_scene')},
        identity_unverified_images=sum(not r['identity_verified'] for r in clean),
        candidate_pairs_automatically_scored=json.loads((OUT/'method.json').read_text())['scored_pairs'],
        candidate_pairs_visually_reviewed=len(reviews),reviewer='assistant_visual_review_not_human_expert',human_expert_reviews=0,
        remaining_high_threshold_cross_split_candidates=len(remaining),remaining_candidates_are_not_confirmed_independent=True,
        clean_total=len(clean),class_split_statistics=stats,split_totals=dict(Counter(r['split'] for r in clean)),cross_split=leak,
        training_ready_image_level=True,training_ready_leaf_independent=False,local_qingxian_validated=False,raw_modification=0,candidate_v1_modification=0,ptlid_used=False,seed=42,
        remaining_risk='Unreviewed near duplicates and incomplete leaf/plant/scene identity; no strict leaf-independent claim')
    jsonsave(R/'tomato_model_a_dataset_summary_v2.json',summary)
    (R/'TOMATO_MODEL_A_DATASET_AUDIT_V2.md').write_text('''# 设施番茄 Model A 数据审计 V2

本阶段未训练、未调整模型或使用 Test 表现选择参数。固定 seed=42，类别分层、整组约70/15/15划分。

## 数据与原始保全
来源：TLID/PTLID，Mendeley DOI 10.17632/kt64b2kh89.2。本地 15254 张，发布页标称15260张的6张差额尚无逐文件清单可核验。PTLID未使用。原始raw与V1候选池全部SHA256再次一致，raw大小与修改时间也一致，无重编码。

## 清洗与视觉复核
完全重复以SHA256或解码RGB像素哈希连通分量计数，跨标签整个组排除；同标签组按规范化源路径字典序保留一张。未投票、未重标标签。额外看图确认的跨标签同源冲突隔离双方及其直接确认同类关联组，独立记录原因，不跨类别建立同叶身份组。
19张非标准尺寸及2张PNG内容/JPG扩展名逐张查看，共21张；主体为叶片、能解码，未因尺寸/扩展名自动剔除，仍服从重复/标签冲突规则。未转码。
固定ImageNet预训练YOLO11n-cls池化embedding（不是任何本项目训练模型），同类每图Top10，结合pHash/dHash、编号、边框HSV背景代理、SIFT-RANSAC及配准后相关性。方法/权重SHA见review目录。边框背景与灰色抠图背景不证明同场景。
先看全部Tier A与高风险Tier B候选，再对跨split最危险候选做多轮（第4～11轮）迭代复核，直至跨split高阈值候选清零。实际复核786对，超出约200～500对目标，但没有遍历审核74269对。复核以并排图、配准叠加图（R/G重合）与“同类别不同叶”配准相关性零分布对照执行，由AI助手读取，不冒充人类专家审定。所有原图和配对大图均保留，可再次核验。影像身份确认不代表疾病标签被专家认证。

## 防链式误聚类
只有实际复核确认的同类别关系进入split约束。组内逐对核查是否有直接复核记录；完整图才标确认同叶/同源身份，否则标uncertain、identity_verified=false，但保守放同一split避免已确认边被拆开。不会由A≈B和B≈C宣称A=C。一致性记录见group_consistency_v2.csv。

## 结果
```json
'''+json.dumps(summary,ensure_ascii=False,indent=2)+'''
```

clean pool: data/tomato_leaf_classifier_clean_v2/
正式数据: data/tomato_leaf_classifier_v1/{train,val,test}/{class}/
图片只按源字节复制，无过采样、无增强、无为了平衡删除whitefly。clean与正式目录是两个数据版本，不能合并一起训练。最终副本重新解码、SHA256和pixel hash均核验，并检查所有已确认group不跨split。

## 评估解释与剩余限制
training_ready_image_level 仅表示当前审核范围内已确认重复/同源约束无跨split泄漏；大量单张图片身份仍未核实，未声称所有近重复或隐藏同叶都已发现。跨split高阈值检查是风险排查，不是叶片独立性的证明。详见cross_scan与cross_split_review文件，未审核风险不得冒充不同叶片。
最终重新执行跨split全量embedding>=0.98且pHash距离<=10的扫描，remaining候选清零；逐对记录见tomato_model_a_remaining_cross_split_candidates_v2.csv（当前为空表）。此外独立执行了与split无关的全局扫描：跨标签近重复（cos>=0.98且pHash<=10）未复核=0，同类别近重复未复核=0且跨split=0。该结论只覆盖此阈值范围，不能声称所有隐藏近重复为0，镜像翻转、非刚性姿态或同植株场景关系仍可能未被发现。白粉/虫道等视觉类别和whitefly之间的跨标签同源是本数据的明显风险，不能将当前内部测试当作真实现场泛化。局部仿射检查覆盖轻微旋转/缩放/平移。
training_ready_leaf_independent=false。local_qingxian_validated=false。不是青县现场数据；后续结果只能称公开温室番茄图像内部评估，不能称青县准确率。视觉类别不等于农学确诊或施药建议。
完成数据准备后停止；未训练YOLO。
''',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--preview',type=int);p.add_argument('--finalize',action='store_true');a=p.parse_args()
    if a.preview:preview(a.preview)
    elif a.finalize:finalize()
