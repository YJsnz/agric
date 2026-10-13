"""Fixed test evaluation only: no training, threshold search or dataset writes."""
import os
import csv
import hashlib
import json
from pathlib import Path
from collections import Counter
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
REPORTS=ROOT/'reports'
os.environ['YOLO_CONFIG_DIR']=str(REPORTS/'.ultralytics')
os.environ['MPLCONFIGDIR']=str(REPORTS/'.matplotlib')
import numpy as np
import cv2
import torch
import yaml
import ultralytics
from ultralytics import YOLO
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score,precision_recall_fscore_support,confusion_matrix,balanced_accuracy_score

CLASSES=['healthy','anthracnose','powdery_mildew','insect_damage','yellow_leaf']
MODEL=ROOT/'runs/jujube_leaf_yolo11n_cls_v13/weights/best.pt'
DATA=ROOT/'data/jujube_leaf_classifier_v3_final'

def read(p):
    with p.open(encoding='utf-8-sig',newline='') as f: return list(csv.DictReader(f))
def write(p,rows,fields=None):
    with p.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0])); w.writeheader(); w.writerows(rows)
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def snapshot():
    return {str(p):(p.stat().st_size,p.stat().st_mtime_ns) for p in DATA.rglob('*') if p.is_file()}
def metrics(rows):
    truth=[r['true_class'] for r in rows]; pred=[r['predicted_class'] for r in rows]
    present=[c for c in CLASSES if c in truth]
    p,r,f,s=precision_recall_fscore_support(truth,pred,labels=present,zero_division=0)
    return dict(n=len(rows),accuracy=accuracy_score(truth,pred),macro_precision=float(p.mean()),
        macro_recall=float(r.mean()),macro_f1=float(f.mean()),balanced_accuracy=balanced_accuracy_score(truth,pred),
        weighted_f1=float(np.average(f,weights=s)),present_classes=present,missing_classes=[c for c in CLASSES if c not in present],
        macro_definition='unweighted mean over true classes present in this subset; zero division=0',
        per_class={c:dict(support=int(n),precision=float(a),recall=float(b),f1=float(d)) for c,a,b,d,n in zip(present,p,r,f,s)})
def plot_matrix(matrix,name,normalized=False):
    values=matrix.astype(float)
    if normalized: values=np.divide(values,values.sum(axis=1,keepdims=True),out=np.zeros_like(values),where=values.sum(axis=1,keepdims=True)!=0)
    fig,ax=plt.subplots(figsize=(9,8)); im=ax.imshow(values,cmap='Blues'); fig.colorbar(im,ax=ax)
    ax.set(xticks=range(5),yticks=range(5),xticklabels=CLASSES,yticklabels=CLASSES,xlabel='Predicted class',ylabel='True class',title='Model A test confusion matrix'+(' (row normalized)' if normalized else ''))
    plt.setp(ax.get_xticklabels(),rotation=35,ha='right')
    for i in range(5):
        for j in range(5): ax.text(j,i,f'{values[i,j]:.3f}' if normalized else str(int(values[i,j])),ha='center',va='center',color='white' if values[i,j]>values.max()/2 else 'black')
    fig.tight_layout(); fig.savefig(REPORTS/name,dpi=180); plt.close(fig)

def main():
    assert ultralytics.__version__=='8.3.40',ultralytics.__version__
    torch.set_num_threads(4)
    model_hash=sha(MODEL); before=snapshot()
    manifest=read(REPORTS/'model_a_clean_manifest_v3.csv')
    normalization_path=REPORTS/'model_a_normalized_images.csv'
    normalized={r['image_id']:r for r in read(normalization_path)} if normalization_path.exists() else {}
    test=[r for r in manifest if r['usable'].lower()=='true' and r['split']=='test']
    assert len(test)==452
    paths=[]; integrity=[]
    for r in test:
        path=DATA/'test'/r['mapped_class']/Path(r['target_path']).name
        current_sha=sha(path)
        if normalized: assert current_sha==normalized[r['image_id']]['final_sha256']
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            image.load()
            if image.format=='JPEG':
                with path.open('rb') as f:
                    f.seek(-2,2); assert f.read()==b'\xff\xd9',f'JPEG needs repair before evaluation: {path}'
        integrity.append(dict(image_id=r['image_id'],image_path=str(path),manifest_original_sha256=r['sha256'],
            evaluated_sha256=current_sha,differs_from_raw_sha=current_sha!=r['sha256']))
        paths.append(path)
    assert {p.resolve() for p in (DATA/'test').rglob('*') if p.is_file()}=={p.resolve() for p in paths}
    args=yaml.safe_load((MODEL.parents[1]/'args.yaml').read_text())
    training=read(MODEL.parents[1]/'results.csv')
    best=max(training,key=lambda r:float(r['metrics/accuracy_top1']))
    training_summary=dict(max_epochs=args['epochs'],epochs_completed=len(training),best_epoch=int(best['epoch']),
        best_val_top1=float(best['metrics/accuracy_top1']),patience=args['patience'],
        early_stopping_inferred=len(training)<args['epochs'] and int(training[-1]['epoch'])-int(best['epoch'])==args['patience'],
        early_stopping_provenance='inferred from results.csv and args.yaml; no server stop log inspected')
    model=YOLO(str(MODEL))
    assert set(model.names.values())==set(CLASSES),model.names
    predictions=[]
    for start in range(0,len(test),8):
        # Match ClassificationDataset.__getitem__ in Ultralytics 8.3.40.
        # Lists of paths otherwise use PIL autocast_list, with different EXIF handling.
        images=[cv2.imread(str(p)) for p in paths[start:start+8]]
        assert all(im is not None for im in images)
        batch=model.predict(source=images,imgsz=224,device='cpu',half=False,augment=False,save=False,verbose=False,crop_fraction=1.0)
        for r,path,result in zip(test[start:start+8],paths[start:start+8],batch):
            scores=result.probs.data.cpu().numpy()
            assert np.isfinite(scores).all() and abs(float(scores.sum())-1)<1e-5
            predicted=model.names[int(np.argmax(scores))]
            row=dict(image_path=str(path),filename=path.name,true_class=r['mapped_class'],predicted_class=predicted,
                confidence=float(scores.max()),correct=predicted==r['mapped_class'],source_dataset=r['source_dataset'])
            row.update({'prob_'+model.names[i]:float(value) for i,value in enumerate(scores)})
            predictions.append(row)
        if len(predictions)%80==0 or len(predictions)==len(test): print('Evaluated',len(predictions),'/',len(test),flush=True)
    write(REPORTS/'model_a_test_predictions.csv',predictions)
    write(REPORTS/'model_a_test_input_integrity.csv',integrity)
    overall=metrics(predictions)
    sources={s:metrics([r for r in predictions if r['source_dataset']==s]) for s in sorted({r['source_dataset'] for r in predictions})}
    matrix=confusion_matrix([r['true_class'] for r in predictions],[r['predicted_class'] for r in predictions],labels=CLASSES)
    plot_matrix(matrix,'model_a_test_confusion_matrix.png')
    plot_matrix(matrix,'model_a_test_confusion_matrix_normalized.png',True)
    errors=sorted([r for r in predictions if not r['correct'] and r['confidence']>=.8],key=lambda r:-r['confidence'])
    write(REPORTS/'model_a_high_confidence_errors.csv',errors,list(predictions[0]))
    confusion=sorted([dict(true_class=a,predicted_class=b,count=int(matrix[i,j])) for i,a in enumerate(CLASSES) for j,b in enumerate(CLASSES) if i!=j and matrix[i,j]],key=lambda r:-r['count'])
    confidence={}
    for c in CLASSES:
        groups={k:[r['confidence'] for r in predictions if r['true_class']==c and r['correct']==value] for k,value in [('correct',True),('incorrect',False)]}
        confidence[c]={k:dict(n=len(v),mean=float(np.mean(v)) if v else None) for k,v in groups.items()}
    assert before==snapshot(),'Dataset changed'
    assert sha(MODEL)==model_hash,'Weights changed'
    assert all(sha(Path(r['image_path']))==r['evaluated_sha256'] for r in integrity),'Test bytes changed'
    summary=dict(model_path=str(MODEL),model_sha256=model_hash,ultralytics_version=ultralytics.__version__,
        parameter_count=sum(p.numel() for p in model.model.parameters()),inference=dict(imgsz=224,device='cpu',half=False,augment=False,crop_fraction=1.0,decision='argmax',decoder='cv2.imread matching Ultralytics ClassificationDataset'),
        training=training_summary,overall=overall,source_wise=sources,class_order=CLASSES,confusion_matrix=matrix.tolist(),
        top_confusion_pairs=confusion,high_confidence_errors_ge_08=len(errors),high_confidence_errors_ge_09=sum(r['confidence']>=.9 for r in errors),
        confidence_by_true_class=confidence,reported_test_top1=.812,top1_difference_from_reported=overall['accuracy']-.812,
        normalization_manifest_available=bool(normalized),test_files_differing_from_raw_sha=sum(r['differs_from_raw_sha'] for r in integrity),
        top5=1.0,top5_note='All five classes are included in top-5, so this has no discriminatory value',dataset_unchanged=True,weights_unchanged=True)
    (REPORTS/'model_a_test_metrics.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    lines=['# 金丝小枣视觉 Model A v1 正式评估','',
      '模型：YOLO11n-cls；“金丝小枣叶片病害/胁迫视觉分类模型”。输出是视觉症状类别，不是临床/农学确诊。',
      '正式数据：Train 2288 / Val 456 / Test 452。固定 CPU FP32、224×224、crop_fraction=1.0、argmax；未训练、未调整阈值、未根据 Test 选择参数。模型类别索引由 checkpoint names 读取。',
      '训练 early stopping 根据 49 轮、最优 29 轮及 patience=20 推断；未读取服务器终止日志。实际记录如下。',
      '评估读取方式与 8.3.40 官方 ClassificationDataset 一致：cv2.imread → BGR/RGB转换 → 分类 transforms。初次路径列表预测触发 PIL autocast_list，得到 0.7942478；检查源码后纠正读取一致性，而非按 Test 分数选择预处理。正式结果使用官方验证读取流程。',
      '## 全部评估指标与训练记录','```json',json.dumps(summary,ensure_ascii=False,indent=2),'```',
      '## 混淆矩阵','![Counts](model_a_test_confusion_matrix.png)','![Row normalized](model_a_test_confusion_matrix_normalized.png)',
      '## 解释边界',
      '- healthy：健康叶片视觉状态。',
      '- anthracnose：炭疽病类视觉表现。',
      '- powdery_mildew：白粉病类视觉表现。',
      '- insect_damage：虫害损伤视觉表现。',
      '- yellow_leaf：黄化视觉表现，不能直接解释为缺氮、缺铁、盐害或某一种疾病。',
      'confidence 与 prob_* 是模型分类得分，不是疾病确诊概率。后续必须结合环境、生育阶段、管理信息、KG、GraphRAG 研判。',
      'Top-5=1.0 在仅五类的任务中无实际区分意义。来源分层 macro 只平均该来源实际存在的真值类别；缺失类别明确列出，未虚构完整五类支持。置信度分析按真实类别分组，无错误样本时错误均值为 null。',
      '公开数据来源不保证沧州金丝小枣本地适用性；两个来源可能共享机构与拍摄条件。14614 对未确认近重复候选仍属于数据局限。',
      '原始训练/测试划分未变。final 中 JPEG 规范化是已完成的数据处理，不属于此次 Test 调参。高置信度错误及逐图五类得分分别见对应 CSV。','']
    if not normalized:
        lines.append('本地缺少上一轮 model_a_normalized_images.csv，无法凭该清单复核历史规范化来源；本次按 v3 manifest 核对文件/标签/来源，逐图严格解码并检查 JPEG EOI，保存实际输入 SHA256 及与 raw 签名差异。此次结果只对应本次记录的测试字节。')
    (REPORTS/'JUJUBE_MODEL_A_V1_EVALUATION.md').write_text('\n'.join(lines),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
