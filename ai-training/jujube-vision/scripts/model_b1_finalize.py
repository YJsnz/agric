"""Persist reviewed same-fruit evidence and construct an explicitly provisional split."""
import json,random,shutil,hashlib
from collections import Counter,defaultdict
from model_b1_audit import ROOT,RAW,REPORTS,OUT,read,write,sha,raw_state,protected_state

CONFIRMED={
 1:'红褐色椭圆果左侧缺口、表面散斑和中央反光布局对应；同一视角近重复。',
 2:'果实左下缺损、右下褐色边缘及顶部细纹对应；同一视角近重复。',
 3:'绿色长椭圆果顶部黑点群、底部斑纹及右侧轮廓对应。',
 4:'左下星状深色斑纹、右上淡褐区域及散点对应。',
 6:'果实上下色带、右端尖角及左侧深色区域对应。',
 7:'中央不规则浅色剥皮伤痕、左下凹点和轮廓对应。',
 8:'左下缺损和右下褐色边缘对应，与B002连接的第三张同果近重复。',
 11:'红褐色果左缺口及散斑布局对应，与B001连接的第三张同果近重复。',
 12:'与B001、B011同果三张图的闭合核对；散斑与边缘一致。',
 28:'右上放射状斑纹、中央细小斑点和左缘轮廓对应。',
 32:'上方细长纹痕、下方红色色带和右端斑块对应。',
 35:'与B002、B008同果三张图的闭合核对；缺损和边缘一致。',
 36:'右侧绿色蒂点、左上细长划痕及散点纹理对应。',
 89:'多个不规则疤痕的相对排列、边缘褐变对应；果实转动后另一视角，非仅凭文件连续认定。',
}

def main():
    target=ROOT/'data/jujube_fruit_bruise_classifier_v1'
    if target.exists():raise RuntimeError('Refusing to overwrite existing B1 split')
    before=json.loads((REPORTS/'model_b1_before_state.json').read_text())
    rows=read(REPORTS/'model_b1_raw_audit.csv');by={r['image_id']:r for r in rows}
    sample=read(OUT/'review.csv');pairs=read(REPORTS/'model_b1_same_fruit_candidates.csv')
    for r in sample:
        n=int(r['review_id'][1:]);r['reviewer']='assistant_visual_review_not_expert_signoff'
        r['review_decision']='same_fruit' if n in CONFIRMED else 'uncertain'
        r['review_note']=CONFIRMED.get(n,'已查看联系图；相似背景、颜色与形状不足以确认果实身份，多视角也可能改变表面表现，保留uncertain。')
    write(OUT/'review.csv',sample)
    reviewed={(r['image_a'],r['image_b']):r for r in sample}
    for p in pairs:
        if (p['image_a'],p['image_b']) in reviewed:
            r=reviewed[(p['image_a'],p['image_b'])]
            for f in ('review_decision','review_note','reviewer'):p[f]=r[f]
    write(REPORTS/'model_b1_same_fruit_candidates.csv',pairs)
    parent={i:i for i in by}
    def find(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    def union(a,b):parent[find(a)]=find(b)
    duplicate_records=[];conflicts=set()
    for field in ('sha256','pixel_hash'):
        groups=defaultdict(list)
        for r in rows:
            if r[field]:groups[r[field]].append(r)
        for signature,group in groups.items():
            if len(group)<2:continue
            conflict=len({r['class'] for r in group})>1
            for r in group:
                union(group[0]['image_id'],r['image_id'])
                if conflict:conflicts.add(r['image_id'])
                duplicate_records.append(dict(method=field,signature=signature,image_id=r['image_id'],cross_label=conflict))
    for r in sample:
        if r['review_decision']=='same_fruit':union(r['image_a'],r['image_b'])
    components=defaultdict(list)
    for i in by:components[find(i)].append(i)
    fruit_groups=[]
    for members in components.values():
        if len(members)<2:continue
        gid='fruit_'+hashlib.sha256('|'.join(sorted(members)).encode()).hexdigest()[:16]
        labels={by[i]['class'] for i in members}
        if len(labels)>1:conflicts.update(members)
        for i in members:by[i]['fruit_group_id']=gid;by[i]['fruit_group_uncertain']='False'
        fruit_groups.append(dict(fruit_group_id=gid,image_ids=';'.join(sorted(members)),size=len(members),labels=';'.join(sorted(labels)),evidence='decoded equality or assistant reviewed texture/scar correspondence'))
    for r in rows:
        if r['image_id'] in conflicts:r.update(usable='False',exclude_reason='needs_expert_review_cross_label_identical_or_same_fruit')
    usable=[r for r in rows if r['usable']=='True']
    rng=random.Random(42)
    for cls in ('healthy','bruised'):
        groups=defaultdict(list)
        for r in usable:
            if r['class']==cls:groups[r['fruit_group_id'] or 'unresolved_'+r['image_id']].append(r)
        ordered=list(groups.values());rng.shuffle(ordered);ordered.sort(key=len,reverse=True)
        n=sum(map(len,ordered));targets={'train':round(n*.7),'val':round(n*.15)};targets['test']=n-sum(targets.values());count=Counter()
        for group in ordered:
            split=max(targets,key=lambda s:targets[s]-count[s])
            for r in group:r['split']=split
            count[split]+=len(group)
    for r in rows:
        r['target_path']=str((target/r['split']/r['class']/r['filename']).relative_to(ROOT)) if r['usable']=='True' else ''
        r['split_status']='provisional_partial_fruit_identity' if r['usable']=='True' else 'excluded'
    write(REPORTS/'model_b1_manifest_v1.csv',rows)
    for split in ('train','val','test'):
        for cls in ('healthy','bruised'):(target/split/cls).mkdir(parents=True,exist_ok=True)
    for r in usable:
        dest=ROOT/r['target_path'];shutil.copyfile(r['source_path'],dest)
        assert sha(dest)==r['sha256']
    def cross(field):
        groups=defaultdict(set)
        for r in usable:
            if r[field]:groups[r[field]].add(r['split'])
        return sum(len(v)>1 for v in groups.values())
    near=[r for r in sample if r['review_decision']=='same_fruit' and r['review_id']!='B089']
    near_cross=sum(by[r['image_a']]['split']!=by[r['image_b']]['split'] for r in near)
    after=raw_state();rawchanges=sum(before['raw'].get(k)!=after.get(k) for k in before['raw'].keys()|after.keys())
    assert before['model_a']==protected_state(),'Model A metadata changed'
    stats={s:dict(Counter(r['class'] for r in usable if r['split']==s)) for s in ('train','val','test')}
    assert all(set(v)=={'healthy','bruised'} for v in stats.values())
    summary=dict(raw_total=len(rows),usable_total=len(usable),classes=dict(Counter(r['class'] for r in usable)),
        confirmed_fruit_groups=len(fruit_groups),fruit_group_uncertain_images=sum(r['fruit_group_uncertain']=='True' for r in usable),
        split_totals={s:sum(c.values()) for s,c in stats.items()},split_classes=stats,seed=42,
        cross_split_sha256=cross('sha256'),cross_split_pixel_identical=cross('pixel_hash'),
        cross_split_confirmed_near_duplicate=near_cross,cross_split_confirmed_fruit_group=cross('fruit_group_id'),
        corrupt=sum(r['corrupt']=='True' for r in rows),label_conflict_images=len(conflicts),
        same_label_exact_duplicate_images=len({r['image_id'] for r in duplicate_records if not r['cross_label']}),
        jpeg_issues=sum(bool(r['jpeg_issue']) for r in rows),non_rgb=sum(r['non_rgb']=='True' for r in rows),
        dimensions=dict(Counter(r['width']+'x'+r['height'] for r in rows)),exif_available=sum(r['exif_json']!='{}' for r in rows),
        candidate_pairs=len(pairs),reviewed_pairs=len(sample),confirmed_same_fruit_pairs=len(CONFIRMED),
        cross_split_unconfirmed_candidate_pairs=sum(by[r['image_a']]['split']!=by[r['image_b']]['split'] for r in pairs if r['review_decision']=='uncertain'),
        raw_modification=rawchanges,model_a_unchanged=True,split_files_ready=True,training_ready=False,
        training_readiness_reason='Only partial fruit identities verified; dataset paper explicitly contains multiple views per fruit, so current provisional split cannot certify unseen-fruit evaluation')
    assert summary['cross_split_sha256']==summary['cross_split_pixel_identical']==near_cross==summary['cross_split_confirmed_fruit_group']==rawchanges==0
    write(REPORTS/'model_b1_fruit_groups.csv',fruit_groups)
    write(REPORTS/'model_b1_split_statistics.csv',[dict(split=s,**counts,total=sum(counts.values())) for s,counts in stats.items()])
    (REPORTS/'model_b1_audit_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    # Replace stale B1 input-blocker records; never touch Model A artifacts.
    (REPORTS/'model_b1_input_check.json').write_text(json.dumps(dict(input_directory=str(RAW.resolve()),verified_jujube_bruisenet_original_images=len(rows),input_status='correct_original_dataset_now_present',previous_wrong_dataset_finding='superseded_after_user_replaced_directory'),indent=2),encoding='utf-8')
    write(REPORTS/'model_b1_input_inventory.csv',[dict(path=r['source_path'],file_size=r['file_size'],input_status='original_filename_and_structure_verified') for r in rows])
    report=['# Jujube Model B1 数据集审计','',
      '当前路径已经更换为正确的 healthy/bruised 原图。旧的 Model A 副本来源阻塞已解除。本阶段未训练。',
      '## 来源与采样单位',
      '[Mendeley v5](https://data.mendeley.com/datasets/3mtdhrwgfr/5)，DOI 10.17632/3mtdhrwgfr.5。',
      '[原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12545820/) Table 4 确认 healthy 327颗、bruised 283颗，分别732张照片。物种为 Ziziphus mauritiana，来源孟加拉国 Savar；存在同果多视角。论文并未提供本地文件到610颗果实的身份映射。',
      '## 审计与候选复核',
      '原图目录匹配论文 healthy/healthy_N.jpg 与 bruised/bruise_N.jpg；三个(1)后缀和一个尾部空格记录为本地命名差异，不单凭名称删除。未发现 augmented/preprocessed/rotation/flip/brightness/contrast/zoom 文件或目录。仅根据分发结构确认原图身份，不声称能从像素证明完整编辑历史。',
      '逐图严格解码、verify、检查EOI、捕获PIL warning、记录尺寸/模式/EXIF与SHA、EXIF校正RGB像素哈希。不改写raw。所有图为512×512 RGB，EXIF为空，缺少时间、设备和果实编号证据。',
      '全图pHash≤8、ImageNet预训练CNN top6及同类文件编号相邻≤2仅用于召回；阈值不是身份确认条件。CNN为YOLO11n-cls 1000类预训练池化特征，不使用Model A病害权重、不训练。详见model_b1_same_fruit_review/method.json。',
      '93对联系图均进行了AI辅助目视查看，14对在大图中确认纹理/伤痕对应；其余保持uncertain。不冒称人工专家签字，不根据相似分数凑610组。B089是同果转动视角，其余确认对为强近重复视角。',
      '确认组编号由成员稳定哈希生成；无法确认的 fruit_group_id 在CSV留空，语义为null，fruit_group_uncertain=true。未给单张未知身份强造fruit编号。',
      '## 统计与泄漏检查','```json',json.dumps(summary,ensure_ascii=False,indent=2),'```',
      '## 划分解释与训练准入',
      '按seed=42、类别分层、已确认fruit组绑定生成70/15/15左右的副本。未知身份样本作为临时分配单元，不等于已证实独立果实；跨split未确认候选数量不是已确认泄漏数量，但提示剩余风险。',
      '**training_ready=false**：结构和已知重复检查通过，但大量果实身份尚未确认。当前目录是可追溯的暂定划分，不能宣称严格果实独立的正式评估集。需要进一步身份映射/复核才能解除；没有因为达到预期数量强行宣布通过。',
      '原图仍全部保留，复制目标逐文件SHA一致，原图前后SHA/大小/mtime一致；Model A模型、数据、报告、run元数据核对无变化。',
      '## 语义边界',
      '建议称“枣属果实碰伤视觉感知模型”或“金丝小枣采后碰伤迁移视觉辅助模型”。存在物种、产地和拍摄环境迁移，不得称为“沧州金丝小枣碰伤确诊模型”。',
      '## 产物',
      '- model_b1_manifest_v1.csv：原图元数据、标签、身份不确定性与暂定split。',
      '- model_b1_same_fruit_candidates.csv：14352对候选及审计决定。',
      '- model_b1_same_fruit_review/：93张双图、8张联系表、review.csv。',
      '- model_b1_fruit_groups.csv：已确认组的成员和依据。',
      '- model_b1_split_statistics.csv / model_b1_audit_summary.json：统计与检查结果。','']
    (REPORTS/'JUJUBE_MODEL_B1_DATASET_AUDIT.md').write_text('\n'.join(report),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
