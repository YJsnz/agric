"""Stage 9: source-scoped labels, original-only eligibility and duplicate groups.
Reads and decodes raw again; writes manifests only, never training/split folders.
"""
import collections,hashlib,itertools,json,zipfile
from pathlib import Path
from audit_raw_datasets import BASE,CLASSES,scan,write_csv,BKTree,pair,norm

def source_variant(row):
    path=row['image_path'];parts=path.split('::')[-1].split('/')
    if row['source_dataset']=='wheat_disease_original':
        # Explicit directory segment only, never substring matching Original in ZIP title.
        if any(norm(p) in ('augmenteddataset','splitdataset','splitteddataset') for p in parts[:-1]):return 'augmented_or_split'
        if 'originaldataset' in {norm(p) for p in parts[:-1]}:return 'original'
        return 'unknown'
    if row['source_dataset']=='winter_wheat_nitrogen':return 'auxiliary_unlabeled'
    if row['source_dataset'] in ('nitrogen_rust','wheat_leaf'):
        # Existing train/val/test directories here are partitions, not another augmented copy.
        return 'original_source_partition'
    return 'unknown'

class Groups:
    def __init__(self,n):self.parent=list(range(n))
    def find(self,x):
        while self.parent[x]!=x:self.parent[x]=self.parent[self.parent[x]];x=self.parent[x]
        return x
    def union(self,a,b):
        a,b=self.find(a),self.find(b)
        if a!=b:self.parent[max(a,b)]=min(a,b)

def main():
    root=BASE;reports=root/'reports';raw=root/'raw'
    config=json.loads((root/'configs/label_mapping.json').read_text(encoding='utf-8'))
    # Full re-decode, fresh SHA256 and pHash. Stage 8 reports remain historical.
    rows,archives,metadata=scan(raw,reports,config)
    for source,filename in [('nitrogen_rust','nitrogen_rust_structure.txt'),('wheat_disease_original','wheat_disease_structure.txt')]:
        lines=[]
        for path in sorted((raw/source).rglob('*')):
            lines.append(path.relative_to(raw).as_posix()+('/' if path.is_dir() else ''))
            if path.suffix.lower()=='.zip':
                with zipfile.ZipFile(path) as z:lines.extend('  '+n for n in z.namelist())
        (reports/filename).write_text('\n'.join(lines),encoding='utf-8')
    nitrogen=[]
    for r in rows:
        if r['source_dataset']=='nitrogen_rust':
            archive=r['image_path'].split('::')[0]
            sub=next((x['subdataset'] for x in config['dataset_specific'] if Path(archive).name==x['archive']),'unknown')
            nitrogen.append(dict(archive=archive,subdataset=sub,original_path=r['image_path'],original_label=r['original_label'],mapped_label=r['mapped_label'],reason='official_source_semantics_and_exact_archive_parent_scope' if r['mapped_label'] in CLASSES else 'unknown_scope_or_label'))
    write_csv(reports/'nitrogen_rust_mapping.csv',['archive','subdataset','original_path','original_label','mapped_label','reason'],nitrogen)
    winter_files=list((raw/'winter_wheat_nitrogen').rglob('*'))
    winter_metadata=[p.relative_to(raw).as_posix() for p in winter_files if p.is_file() and (p.suffix.lower() in {'.csv','.xlsx','.xls','.json','.txt','.xml'} or any(t in p.name.lower() for t in ('metadata','labels','annotation','readme')))]
    (reports/'winter_wheat_label_search.json').write_text(json.dumps({'metadata_candidates':winter_metadata,'usage':'auxiliary_unlabeled','automatic_label_assignment':False},ensure_ascii=False,indent=2),encoding='utf-8')
    uf=Groups(len(rows));sha=collections.defaultdict(list);ph=collections.defaultdict(list)
    for i,r in enumerate(rows):
        sha[r['file_hash']].append(i)
        if r['image_status']=='valid':ph[int(r['perceptual_hash'],16)].append(i)
    conflicts=[];conflict_sha=set();counts=collections.Counter()
    def connect(a,b,kind,d):
        uf.union(a,b);counts[kind+'_pairs']+=1
        p=pair(rows[a],rows[b],kind,d)
        if p['label_conflict']:
            conflicts.append(p);conflict_sha.update((rows[a]['file_hash'],rows[b]['file_hash']))
    for ids in sha.values():
        for a,b in itertools.combinations(ids,2):connect(a,b,'exact',0)
    tree=BKTree()
    for key,ids in ph.items():
        for other,d in tree.find(key,6):
            for a in ids:
                for b in ph[other]:
                    if rows[a]['file_hash']!=rows[b]['file_hash']:connect(a,b,'near',d)
        for a,b in itertools.combinations(ids,2):
            if rows[a]['file_hash']!=rows[b]['file_hash']:connect(a,b,'near',0)
        tree.add(key)
    write_csv(reports/'label_conflicts_verified.csv',list(pair(rows[0],rows[0],'exact',0)),conflicts)
    members=collections.defaultdict(list)
    for i in range(len(rows)):members[uf.find(i)].append(i)
    group_ids={k:'WG_'+hashlib.sha256('\n'.join(sorted(rows[i]['image_path'] for i in ids)).encode()).hexdigest()[:16] for k,ids in members.items()}
    manifest=[];kept={};variant_inventory=[]
    for i,r in enumerate(rows):
        variant=source_variant(r);reason=''
        if r['image_status']!='valid':reason='corrupt'
        elif variant=='auxiliary_unlabeled':reason='auxiliary_unlabeled'
        elif variant=='augmented_or_split':reason='augmented_or_split'
        elif variant=='unknown':reason='unknown_source_variant'
        elif r['mapped_label'] not in CLASSES:reason='excluded_class' if r['mapped_label']=='exclude' else 'unknown_label'
        elif r['file_hash'] in conflict_sha:reason='unusable_conflict'
        elif r['file_hash'] in kept:reason='unusable_duplicate'
        if not reason:kept[r['file_hash']]=r['image_path']
        m=dict(source_dataset=r['source_dataset'],source_variant=variant,original_path=r['image_path'],original_label=r['original_label'],mapped_label=r['mapped_label'],sha256=r['file_hash'],phash=r['perceptual_hash'],group_id=group_ids[uf.find(i)],usable=not bool(reason),exclude_reason=reason,original_split=r['split'],exact_representative=kept.get(r['file_hash'],''),conflict_flag=r['file_hash'] in conflict_sha)
        manifest.append(m)
        if r['source_dataset']=='wheat_disease_original':variant_inventory.append(dict(path=r['image_path'],source_variant=variant,original_label=r['original_label'],mapped_label=r['mapped_label'],usable_for_model_a=m['usable'],reason=reason))
    write_csv(reports/'model_a_verified_manifest.csv',list(manifest[0]),manifest)
    write_csv(reports/'wheat_disease_variant_inventory.csv',['path','source_variant','original_label','mapped_label','usable_for_model_a','reason'],variant_inventory)
    stats=[]
    for label in CLASSES:
        eligible=[m for m in manifest if m['mapped_label']==label and m['usable']]
        stats.append(dict(mapped_label=label,verified_unique_count=len(eligible),group_count=len({m['group_id'] for m in eligible}),source_dataset_count=len({m['source_dataset'] for m in eligible})))
    write_csv(reports/'class_statistics_verified.csv',list(stats[0]),stats)
    active=collections.defaultdict(list)
    for m in manifest:
        if m['usable']:active[m['group_id']].append(m)
    groups=[dict(group_id=g,usable_count=len(ms),labels=';'.join(sorted({m['mapped_label'] for m in ms})),datasets=';'.join(sorted({m['source_dataset'] for m in ms}))) for g,ms in sorted(active.items())]
    write_csv(reports/'near_duplicate_groups_verified.csv',['group_id','usable_count','labels','datasets'],groups)
    summary={'classes':stats,'source_variant_counts':dict(collections.Counter(m['source_variant'] for m in manifest)),'excluded_reasons':dict(collections.Counter(m['exclude_reason'] for m in manifest if not m['usable'])),'nitrogen_rust_counts':dict(collections.Counter(x['subdataset']+'/'+x['original_label'] for x in nitrogen)),'conflict_pairs':len(conflicts),'conflict_sha256_count':len(conflict_sha),'pair_counts':dict(counts),'usable_groups':len(active),'largest_usable_group':max(map(len,active.values()),default=0),'mixed_label_usable_groups':sum(len({m['mapped_label'] for m in ms})>1 for ms in active.values()),'winter_metadata_candidates':winter_metadata}
    (reports/'verified_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    source={'url':'https://data.mendeley.com/datasets/th422bg4yd/1','doi':'10.17632/th422bg4yd.1','verification':'Official description supports healthy controls and nitrogen deficiency / leaf rust subdatasets. Archive member folders and labels.txt checked. Actual Ndeficient archive has 300 control plus 300 deficiency; source wording about 300 is ambiguous. No claim of independent plants or no pre-processing.','local_metadata':metadata}
    (reports/'source_semantics_verified.json').write_text(json.dumps(source,ensure_ascii=False,indent=2),encoding='utf-8')
    text=['# 第9步：数据源语义核验与原图隔离','', '仅更新映射及manifest，没有修改raw、复制训练图片、划分、增强、平衡或训练。重新逐张解码并计算哈希；第8步报告保留历史口径。','', '## 来源核验','', '[官方Mendeley记录](https://data.mendeley.com/datasets/th422bg4yd/1)确认健康对照、缺氮及叶锈子数据集。限定archive及成员根目录映射control/deficiency/diseased，禁止全局映射。实际Ndeficient.zip为300 control + 300 deficiency，共600；与页面中300的文字歧义明确区分。原图指原发布分区图片，已做背景分割，并非未经处理的相机原片。','', '## 实测汇总','', '```json',json.dumps(summary,ensure_ascii=False,indent=2),'```','', '## 隔离策略','', '- wheat_disease_original仅精确匹配Original Dataset目录为原图；其余Augmented及Split副本全部禁用。真正原图1603，增强与划分副本10000。范围内原图仅HealthyLeaf 250、LeafBlight 400，之后继续扣除重复及冲突。','- winter_wheat_nitrogen目录无逐图标签时保持auxiliary_unlabeled，不能依据研究用途标缺氮。若未来找到元数据须人工核验逐图对应，本脚本不猜。','- 先排除版本、范围、坏图和冲突，再在合格原图中按SHA256保留一个稳定代表。不能让先遇到的增强图挤掉原图。conflict_flag独立记录，避免排除原因优先级遮蔽冲突。','- 已知类别之间的exact/near冲突重新按新映射检查，同SHA的副本一起隔离。近似冲突是待复核嫌疑，不是已证实错标。未知类无法自动判定冲突。','- 所有exact/near边的连通分量建立稳定group_id，包括被排除增强图的同源连接；同组未来必须同split。非冲突的近似组不删除。传递相似可能形成大组，需人工复核，group不等于已证明同一植株或plot。','', '## 是否可以划分','', '四类非零后具备编制分组划分方案的基础，但不批准直接随机划分或照搬原split。先检查near_duplicate_groups_verified.csv的大组、混合标签组及冲突；需要保留采集来源、同拍序列和plot分组信息。pHash不能证明所有增强均已检出。当前仍不训练、不自动划分。','', '## 运行','', '`ai-service/.venv/Scripts/python.exe ai-training/wheat-vision/scripts/verify_dataset_sources.py`（agric目录）。', '主要文件：model_a_verified_manifest.csv、class_statistics_verified.csv、nitrogen_rust_mapping.csv、wheat_disease_variant_inventory.csv、label_conflicts_verified.csv。']
    (reports/'DATASET_AUDIT_VERIFIED.md').write_text('\n'.join(text),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
