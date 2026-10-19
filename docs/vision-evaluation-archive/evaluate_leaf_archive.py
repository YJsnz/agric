"""New offline evaluation; no training, downloads, augmentation or dataset writes."""
import argparse, csv, hashlib, json, datetime
from pathlib import Path
import numpy as np
import torch, ultralytics
from ultralytics import YOLO
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, balanced_accuracy_score, roc_auc_score, confusion_matrix
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--model',type=Path,required=True);ap.add_argument('--test',type=Path,required=True);ap.add_argument('--out',type=Path,required=True);a=ap.parse_args()
    assert a.model.is_file() and a.test.is_dir()
    assert not a.out.exists(), 'Use a new output directory'
    classes=['bacterial_spot','bacterial_spot_and_leaf_miner','healthy','leaf_miner','powdery_mildew','powdery_mildew_and_leaf_miner','whitefly']
    files=sorted(p for p in a.test.rglob('*') if p.is_file())
    assert len(files)==2101 and {p.parent.name for p in files}==set(classes)
    before={p.relative_to(a.test).as_posix():sha(p) for p in files};weight_sha=sha(a.model)
    model=YOLO(str(a.model));assert model.task=='classify' and set(model.names.values())==set(classes)
    torch.set_num_threads(4)
    rows=[];truth=[];probs=[]
    for i,p in enumerate(files):
        result=model.predict(source=str(p),imgsz=224,device='cpu',augment=False,save=False,verbose=False)[0]
        probability=result.probs.data.cpu().numpy()
        ordered=[float(probability[next(k for k,v in model.names.items() if v==c)]) for c in classes]
        t=classes.index(p.parent.name);pred=int(np.argmax(ordered));truth.append(t);probs.append(ordered)
        rows.append(dict(filename=p.name,image_path=str(p),true_class=classes[t],predicted_class=classes[pred],confidence=ordered[pred],correct=t==pred,**{f'prob_{c}':ordered[j] for j,c in enumerate(classes)}))
        if (i+1)%100==0:print(f'{i+1}/2101',flush=True)
    after={p.relative_to(a.test).as_posix():sha(p) for p in sorted(a.test.rglob('*')) if p.is_file()}
    assert before==after and sha(a.model)==weight_sha
    y=np.array(truth);prob=np.array(probs);pred=prob.argmax(axis=1)
    metrics={'accuracy':float(accuracy_score(y,pred)),'balanced_accuracy':float(balanced_accuracy_score(y,pred))}
    for avg in ['macro','weighted']:
        pr,re,f1,_=precision_recall_fscore_support(y,pred,average=avg,zero_division=0)
        metrics.update({avg+'_precision':float(pr),avg+'_recall':float(re),avg+'_f1':float(f1)})
    metrics['macro_roc_auc_ovr']=float(roc_auc_score(y,prob/prob.sum(axis=1,keepdims=True),multi_class='ovr',average='macro'))
    pr,re,f1,support=precision_recall_fscore_support(y,pred,labels=range(7),zero_division=0)
    metrics['per_class']={c:dict(precision=float(pr[j]),recall=float(re[j]),f1=float(f1[j]),support=int(support[j])) for j,c in enumerate(classes)}
    cm=confusion_matrix(y,pred,labels=range(7))
    payload=dict(evaluation_date=datetime.datetime.now().astimezone().isoformat(),model_name='tomato_leaf_yolo11n_cls_v1',model_path=str(a.model),model_sha256=weight_sha,test_source=str(a.test),test_images=len(files),classes=classes,metrics=metrics,source_dataset='TLID DOI 10.17632/kt64b2kh89.2',method='Ultralytics native predict preprocessing, imgsz=224, CPU, argmax, no augmentation; one image per call',torch_version=torch.__version__,ultralytics_version=ultralytics.__version__,test_unchanged=True,model_unchanged=True,training_ready_image_level=True,training_ready_leaf_independent=False,local_qingxian_validated=False,high_confidence_errors={str(t):sum(not r['correct'] and r['confidence']>=t for r in rows) for t in [.8,.9]},confusion_matrix=cm.tolist())
    a.out.mkdir(parents=True)
    (a.out/'metrics.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    (a.out/'input_sha256.json').write_text(json.dumps(before,indent=2),encoding='utf-8')
    for name,data in [('predictions.csv',rows),('high_confidence_errors.csv',[r for r in rows if not r['correct'] and r['confidence']>=.8])]:
        with (a.out/name).open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(data)
    for normalized in [False,True]:
        matrix=cm/cm.sum(axis=1,keepdims=True) if normalized else cm
        fig,ax=plt.subplots(figsize=(11,9));ax.imshow(matrix,cmap='Blues');ax.set_xticks(range(7),classes,rotation=45,ha='right');ax.set_yticks(range(7),classes);ax.set_xlabel('Predicted');ax.set_ylabel('True')
        for i in range(7):
            for j in range(7):ax.text(j,i,f'{matrix[i,j]:.2f}' if normalized else str(matrix[i,j]),ha='center',color='white' if matrix[i,j]>matrix.max()/2 else 'black')
        fig.tight_layout();fig.savefig(a.out/('confusion_normalized.png' if normalized else 'confusion.png'),dpi=160);plt.close(fig)
    (a.out/'model.sha256').write_text(weight_sha+'  '+a.model.name+'\n',encoding='utf-8')
    report='# Tomato leaf V1 — new archival evaluation\n\nThis is a new run, not reconstruction of the missing historical run. Public greenhouse internal image-level test; not Qingxian field accuracy or final disease diagnosis.\n\n'+json.dumps(metrics,ensure_ascii=False,indent=2)+'\n\nInput and weight SHA256 were verified unchanged. See metrics.json for method, versions and limitations.\n'
    (a.out/'EVALUATION.md').write_text(report,encoding='utf-8')
    (a.out/'MODEL_CARD.md').write_text('# Tomato leaf YOLO11n-cls V1\n\nNew archival metadata; not the original freeze record.\n\n'+report,encoding='utf-8')
    print(json.dumps(metrics),flush=True)
if __name__=='__main__':main()
