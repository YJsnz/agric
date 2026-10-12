"""Local fixed-checkpoint evaluation only; no training, tuning or dataset writes."""
import csv
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / 'reports'
RUN = ROOT / 'runs/tomato_ripeness_yolo11n_cls_v1'
MODEL = RUN / 'weights/best.pt'
DATA = ROOT / 'data/tomato_ripeness_classifier_v2'
CLASSES = ['green', 'breakers', 'turning', 'pink', 'light_red', 'red']
os.environ['YOLO_CONFIG_DIR'] = str(REPORTS / '.evaluation_ultralytics')
os.environ['MPLCONFIGDIR'] = str(REPORTS / '.evaluation_matplotlib')


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda: f.read(1048576), b''): h.update(b)
    return h.hexdigest()


def snapshot():
    return {p.relative_to(DATA).as_posix(): [p.stat().st_size, p.stat().st_mtime_ns, sha(p)]
            for p in sorted(DATA.rglob('*')) if p.is_file()}


def csv_write(name, rows, fields):
    with (REPORTS/name).open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)


def interpretation(output):
    per = output['per_class_metrics']
    zero = [c for c,d in per.items() if d['support'] and d['recall']==0]
    text = ('不建议冻结为可部署的六阶段成熟度正式模型；可保留为研究基线。'
            if zero else '冻结前应结合各类召回率及独立现场验证评估部署适用性。')
    text += f' Accuracy={output["accuracy"]:.4f}，Macro-F1={output["macro_f1"]:.4f}，Balanced Accuracy={output["balanced_accuracy"]:.4f}；类别不平衡使总体指标不能代表少数类能力。'
    if zero: text += ' 本次零召回类别：'+', '.join(zero)+'。'
    text += ' 高 ROC-AUC 衡量排序能力，不代表当前 argmax 决策下所有类别均能识别。阶段 MAE 和 within-1-stage 也按图片加权，需结合逐类指标解读。未据 Test 修改模型或参数，未执行冻结。'
    return text


def main():
    for path in [MODEL, RUN/'results.csv', RUN/'args.yaml', DATA/'test',
                 REPORTS/'tomato_model_b_dataset_audit_v2.json', REPORTS/'TOMATO_MODEL_B_DATASET_AUDIT_V2.md']:
        if not path.exists(): raise FileNotFoundError(path)
    import cv2
    import numpy as np
    import torch
    import yaml
    import ultralytics
    from ultralytics import YOLO
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support, balanced_accuracy_score, confusion_matrix, roc_auc_score
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    torch.set_num_threads(4)
    args = yaml.safe_load((RUN/'args.yaml').read_text(encoding='utf-8'))
    audit = json.loads((REPORTS/'tomato_model_b_dataset_audit_v2.json').read_text(encoding='utf-8'))
    audit_text = (REPORTS/'TOMATO_MODEL_B_DATASET_AUDIT_V2.md').read_text(encoding='utf-8')
    assert audit_text and audit['uncertain_pair_count'] == 4 and audit['confirmed_leak_remaining'] == 0
    with (RUN/'results.csv').open(encoding='utf-8-sig', newline='') as f:
        training = [{k.strip(): v.strip() for k,v in r.items()} for r in csv.DictReader(f)]
    best_value = max(float(r['metrics/accuracy_top1']) for r in training)
    best_epochs = [int(float(r['epoch'])) for r in training if float(r['metrics/accuracy_top1']) == best_value]
    epochs = [int(float(r['epoch'])) for r in training]
    assert epochs == list(range(1,len(training)+1))
    configured = int(args['epochs']); patience = int(args['patience'])
    early = len(training) < configured and len(training)-best_epochs[-1] >= patience and not args.get('time')
    summary = dict(configured_epochs=configured,actual_epochs=len(training),best_epoch=best_epochs[0],
                   best_val_top1=best_value,final_val_top1=float(training[-1]['metrics/accuracy_top1']),
                   early_stopping=early,patience=patience,best_val_tied_epochs=best_epochs,
                   best_epoch_definition='First maximum recorded Val Top-1; rounded CSV can contain ties.',
                   early_stopping_evidence='Inferred from contiguous results.csv ending before configured epochs and at least patience epochs since last maximum Val Top-1; termination event log unavailable.')
    extensions={'.png','.jpg','.jpeg','.bmp','.webp','.tif','.tiff'}
    counts={}; paths=[]
    for split,expected in [('train',10047),('val',1936),('test',2201)]:
        assert {p.name for p in (DATA/split).iterdir() if p.is_dir()} == set(CLASSES)
        counts[split]={}
        for c in CLASSES:
            files=sorted(p for p in (DATA/split/c).rglob('*') if p.is_file() and p.suffix.lower() in extensions)
            counts[split][c]=len(files)
            if split=='test': paths.extend((c,p) for p in files)
        assert sum(counts[split].values())==expected
    assert counts == audit['class_distribution']
    print('Hashing dataset before inference...',flush=True)
    before=snapshot(); model_before=sha(MODEL)
    model=YOLO(str(MODEL))
    assert model.task=='classify' and set(model.names.values())==set(CLASSES)
    indexes={c:next(i for i,n in model.names.items() if n==c) for c in CLASSES}
    settings=dict(imgsz=int(args.get('imgsz',224)),crop_fraction=float(args.get('crop_fraction',1)),
                  device='cpu',half=False,augment=False,save=False,verbose=False)
    rows=[]; scores=[]
    for i,(truth,path) in enumerate(paths,1):
        image=cv2.imread(str(path))
        if image is None: raise ValueError(f'Undecodable test image: {path}')
        result=model.predict(image,**settings)[0]
        raw=result.probs.data.detach().cpu().numpy()
        prob=np.asarray([raw[indexes[c]] for c in CLASSES],dtype=float)
        assert np.isfinite(prob).all() and (prob>=0).all() and np.isclose(prob.sum(),1,atol=1e-4)
        predicted=CLASSES[int(prob.argmax())]
        row=dict(filename=path.name,image_path=str(path),true_class=truth,predicted_class=predicted,
                 confidence=float(prob.max()),correct=truth==predicted,
                 stage_distance=abs(CLASSES.index(truth)-CLASSES.index(predicted)))
        row.update({f'prob_{c}':float(v) for c,v in zip(CLASSES,prob)})
        rows.append(row);scores.append(prob)
        if i%100==0 or i==len(paths): print(f'Inferred {i}/{len(paths)}',flush=True)
    print('Verifying model and dataset unchanged...',flush=True)
    after=snapshot(); model_after=sha(MODEL)
    assert before==after and model_before==model_after
    truth=[CLASSES.index(r['true_class']) for r in rows]; pred=[CLASSES.index(r['predicted_class']) for r in rows]
    p,r,f,support=precision_recall_fscore_support(truth,pred,labels=range(6),zero_division=0)
    cm=confusion_matrix(truth,pred,labels=range(6))
    metrics=dict(accuracy=float(accuracy_score(truth,pred)),macro_precision=float(p.mean()),macro_recall=float(r.mean()),
                 macro_f1=float(f.mean()),balanced_accuracy=float(balanced_accuracy_score(truth,pred)),
                 weighted_precision=float(np.average(p,weights=support)),weighted_recall=float(np.average(r,weights=support)),
                 weighted_f1=float(np.average(f,weights=support)))
    try: metrics['macro_roc_auc_ovr']=float(roc_auc_score(truth,np.asarray(scores),labels=list(range(6)),multi_class='ovr',average='macro'))
    except ValueError as e: metrics.update(macro_roc_auc_ovr=None,roc_auc_unavailable_reason=str(e))
    stage=np.abs(np.asarray(truth)-np.asarray(pred))
    metrics.update(stage_mae=float(stage.mean()),within_1_stage_accuracy=float((stage<=1).mean()))
    per={c:dict(support=int(n),precision=float(a),recall=float(b),f1=float(v)) for c,n,a,b,v in zip(CLASSES,support,p,r,f)}
    pairs=sorted([dict(true_class=CLASSES[i],predicted_class=CLASSES[j],count=int(cm[i,j]))
                  for i in range(6) for j in range(6) if i!=j and cm[i,j]],key=lambda x:-x['count'])
    adjacent=[dict(class_a=CLASSES[i],class_b=CLASSES[i+1],a_to_b=int(cm[i,i+1]),b_to_a=int(cm[i+1,i])) for i in range(5)]
    errors=sorted([r for r in rows if not r['correct'] and r['confidence']>=.8],key=lambda r:-r['confidence'])
    boundary={k:audit[k] for k in ['training_ready_image_level','session_independent','fruit_independent','local_qingxian_validated','residual_uncertain_near_duplicate_risk','confirmed_leak_remaining','uncertain_pair_count']}
    output=dict(**metrics,**summary,**boundary,model_path=str(MODEL),model_sha256=model_before,
                source_dataset='AerialYield-T2M',evaluation_level='public greenhouse tomato ripeness internal image test',
                test_images=len(rows),split_counts=counts,classes=CLASSES,model_class_mapping=model.names,
                per_class_metrics=per,minority_class_metrics={c:per[c] for c in ['breakers','turning','pink','red']},
                confusion_matrix=cm.tolist(),confusion_pairs=pairs,adjacent_confusions=adjacent,
                stage_distance_counts={str(i):int((stage==i).sum()) for i in range(6)},
                high_confidence_error_count_08=len(errors),high_confidence_error_count_09=sum(r['confidence']>=.9 for r in errors),
                training_args=args,inference=settings,ultralytics_version=ultralytics.__version__,torch_version=torch.__version__,
                integrity=dict(model_sha256_before=model_before,model_sha256_after=model_after,model_unchanged=True,
                               dataset_unchanged=True,test_count_before=len(paths),test_count_after=len(paths)),
                freeze_recommendation='Pending interpretation of minority-class and ordinal metrics; no freezing performed.')
    output['freeze_recommendation'] = interpretation(output)
    csv_write('tomato_model_b_test_predictions.csv',rows,list(rows[0]))
    fields=['filename','true_class','predicted_class','confidence','stage_distance']
    csv_write('tomato_model_b_high_confidence_errors.csv',[{k:r[k] for k in fields} for r in errors],fields)
    csv_write('tomato_model_b_test_integrity.csv',[dict(image_path=k,sha256_before=v[2],sha256_after=after[k][2],unchanged=True)
              for k,v in before.items() if k.startswith('test/')],['image_path','sha256_before','sha256_after','unchanged'])
    for norm in [False,True]:
        values=cm/cm.sum(axis=1,keepdims=True) if norm else cm
        fig,ax=plt.subplots(figsize=(10,9)); im=ax.imshow(values,cmap='Blues');fig.colorbar(im,ax=ax)
        ax.set(xticks=range(6),yticks=range(6),xticklabels=CLASSES,yticklabels=CLASSES,xlabel='Predicted',ylabel='True',title='Tomato Model B V1 Test'+(' (row normalized)' if norm else ''))
        plt.setp(ax.get_xticklabels(),rotation=45,ha='right')
        for i in range(6):
            for j in range(6): ax.text(j,i,f'{values[i,j]:.3f}' if norm else str(values[i,j]),ha='center',va='center',color='white' if values[i,j]>values.max()/2 else 'black')
        fig.tight_layout();fig.savefig(REPORTS/('tomato_model_b_test_confusion_matrix'+('_normalized' if norm else '')+'.png'),dpi=180);plt.close(fig)
    (REPORTS/'tomato_model_b_v1_metrics.json').write_text(json.dumps(output,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
    report=['# Tomato Model B V1 正式 Test 评估','',
            'AerialYield-T2M：公开温室番茄成熟度图像内部测试集上的视觉分类结果。不是青县现场准确率或真实生产环境泛化准确率。',
            '任务为果实成熟阶段视觉分类，不是品质最终判定或采收决策最终结论。后续需要结合 KG、GraphRAG 和生产环境信息。','',
            '本地 best.pt 对全部 2201 张 Test 逐图重新推理；CPU FP32、argmax，尺寸与 crop_fraction 继承训练参数。没有训练、Test 参数搜索、数据修改或冻结。',
            '模型类别索引按 checkpoint 的 names 显式映射至成熟顺序，未假设训练分类索引等于成熟阶段序号。','',
            '## 总体指标','',*['- '+k+': '+str(v) for k,v in metrics.items()],
            '', '## 逐类指标','', '| Class | Support | Precision | Recall | F1 |','|---|---:|---:|---:|---:|',
            *[f'| {c} | {d["support"]} | {d["precision"]:.6f} | {d["recall"]:.6f} | {d["f1"]:.6f} |' for c,d in per.items()],
            '', '重点少数类：breakers、turning、pink、red。训练集严重不平衡，不能仅用 Accuracy 判断成熟阶段分类能力。',
            '', '## 混淆与序数误差','', '![Counts](tomato_model_b_test_confusion_matrix.png)',
            '![Normalized](tomato_model_b_test_confusion_matrix_normalized.png)',
            '', 'Top confusion pairs（真实 → 预测）：',
            *[f'- {x["true_class"]} → {x["predicted_class"]}: {x["count"]}' for x in pairs[:20]],
            '', '相邻阶段双向混淆：', *[f'- {x["class_a"]} → {x["class_b"]}: {x["a_to_b"]}; 反向: {x["b_to_a"]}' for x in adjacent],
            '', '阶段距离计数（0 为正确）：'+json.dumps(output['stage_distance_counts']),
            '阶段间距按 0–5 等距编码，仅为视觉类别的序数误差，不代表生理成熟时间差。',
            '', '## 高置信错误','',f'>=0.8: {len(errors)}; >=0.9: {output["high_confidence_error_count_09"]}。CSV 保存所有 >=0.8 的错误。',
            '', '## 训练记录','', '```json',json.dumps(summary,indent=2,ensure_ascii=False),'```',
            'early_stopping 为 CSV/配置支持的推断；没有独立终止事件日志。best epoch 是 CSV 首次最高 Val Top-1，不据 Test 选择。',
            '', '## 数据边界与完整性','', '```json',json.dumps(boundary,indent=2),'```',
            '已处理 pair_017，已复核确认泄漏剩余为0，但仍有4对 uncertain 候选，不能证明 fruit-independent test。',
            '评估前后整个 V2 文件数量、SHA256、大小、mtime 以及模型 SHA256 相同。Test 逐文件哈希见 tomato_model_b_test_integrity.csv。',
            '', '## 冻结建议与结果解读','',output['freeze_recommendation'],
            '', '## 完整配置与结果','', '```json',json.dumps(output,indent=2,ensure_ascii=False),'```']
    (REPORTS/'TOMATO_MODEL_B_V1_EVALUATION.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print(json.dumps({**metrics,**summary,'per_class':per,'confusions':pairs,'high_08':len(errors),'high_09':output['high_confidence_error_count_09']},indent=2),flush=True)


if __name__=='__main__': main()
