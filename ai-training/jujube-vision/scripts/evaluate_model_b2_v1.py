"""Fixed B2 test evaluation; no training, tuning or dataset writes."""
import os,csv,json,hashlib
from pathlib import Path
from collections import defaultdict,Counter
ROOT=Path(__file__).resolve().parents[1];R=ROOT/'reports'
os.environ['YOLO_CONFIG_DIR']=str(R/'model_b2_ultralytics')
os.environ['MPLCONFIGDIR']=str(R/'model_b2_matplotlib')
import numpy as np
import cv2,torch,yaml,ultralytics
from PIL import Image,ImageOps
from ultralytics import YOLO
from sklearn.metrics import accuracy_score,precision_recall_fscore_support,balanced_accuracy_score,confusion_matrix,roc_auc_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
MODEL=ROOT/'runs/jujube_fruit_freshness_yolo11n_cls_v1/weights/best.pt'
DATA=ROOT/'data/jujube_fruit_freshness_classifier_v1'
CLASSES=['fresh','rotten']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,rows,fields=None):
    with (R/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)
def snapshot():
    return {str(p):(p.stat().st_size,p.stat().st_mtime_ns) for folder in ('data','raw','models','runs') for p in (ROOT/folder).rglob('*') if p.is_file()}
def main():
    assert ultralytics.__version__=='8.3.40'
    before=snapshot();model_hash=sha(MODEL);torch.set_num_threads(4)
    args=yaml.safe_load((MODEL.parents[1]/'args.yaml').read_text())
    assert args['imgsz']==224
    inventory=[];hashed=defaultdict(list);pixel=defaultdict(list)
    for split,expected in [('train',140),('val',30),('test',30)]:
        for cls in CLASSES:
            files=sorted(p for p in (DATA/split/cls).iterdir() if p.is_file())
            assert len(files)==expected,(split,cls,len(files))
            for p in files:
                with Image.open(p) as im:im.verify()
                with Image.open(p) as im:
                    im.load();rgb=ImageOps.exif_transpose(im).convert('RGB')
                    ph=hashlib.sha256(str(rgb.size).encode()+rgb.tobytes()).hexdigest()
                h=sha(p);hashed[h].append(split);pixel[ph].append(split)
                inventory.append(dict(image_path=str(p),filename=p.name,split=split,true_class=cls,sha256=h,pixel_sha256=ph))
    leakage={k:sum(len(set(v))>1 for v in buckets.values()) for k,buckets in [('cross_split_sha256',hashed),('cross_split_pixel_identical',pixel)]}
    assert not any(leakage.values()),leakage
    write('model_b2_evaluation_input_integrity.csv',inventory)
    model=YOLO(str(MODEL));assert set(model.names.values())==set(CLASSES)
    test=[r for r in inventory if r['split']=='test'];predictions=[]
    for start in range(0,len(test),8):
        batch=test[start:start+8]
        # Match official classification validation OpenCV decoding, including its EXIF behavior.
        images=[cv2.imread(r['image_path']) for r in batch];assert all(x is not None for x in images)
        results=model.predict(images,imgsz=224,crop_fraction=args.get('crop_fraction',1.0),device='cpu',half=False,augment=False,save=False,verbose=False)
        for row,result in zip(batch,results):
            scores=result.probs.data.cpu().numpy();assert np.isfinite(scores).all() and abs(scores.sum()-1)<1e-5
            predicted=model.names[int(scores.argmax())]
            out=dict(filename=row['filename'],image_path=row['image_path'],true_class=row['true_class'],predicted_class=predicted,confidence=float(scores.max()),correct=predicted==row['true_class'])
            out.update({'prob_'+model.names[i]:float(s) for i,s in enumerate(scores)});predictions.append(out)
        print(f'Evaluated {len(predictions)}/60',flush=True)
    write('model_b2_test_predictions.csv',predictions)
    truth=[p['true_class'] for p in predictions];pred=[p['predicted_class'] for p in predictions]
    p,r,f,n=precision_recall_fscore_support(truth,pred,labels=CLASSES,zero_division=0)
    cm=confusion_matrix(truth,pred,labels=CLASSES)
    metrics=dict(test_images=len(test),accuracy=accuracy_score(truth,pred),precision=float(p[1]),recall=float(r[1]),f1=float(f[1]),positive_class='rotten',macro_precision=float(p.mean()),macro_recall=float(r.mean()),macro_f1=float(f.mean()),balanced_accuracy=balanced_accuracy_score(truth,pred),weighted_f1=float(np.average(f,weights=n)),roc_auc=roc_auc_score([x=='rotten' for x in truth],[x['prob_rotten'] for x in predictions]),per_class={c:dict(support=int(nn),precision=float(pp),recall=float(rr),f1=float(ff)) for c,pp,rr,ff,nn in zip(CLASSES,p,r,f,n)},confusion_matrix=cm.tolist(),confusion_matrix_order=CLASSES,rotten_missed_as_fresh=int(cm[1,0]),fresh_predicted_rotten=int(cm[0,1]))
    errors=[x for x in predictions if not x['correct'] and x['confidence']>=.8]
    write('model_b2_high_confidence_errors.csv',errors,fields=list(predictions[0]))
    metrics.update(wrong_confidence_ge_08=len(errors),wrong_confidence_ge_09=sum(x['confidence']>=.9 for x in errors))
    for normalized in (False,True):
        values=cm.astype(float)
        if normalized:values/=values.sum(axis=1,keepdims=True)
        fig,ax=plt.subplots(figsize=(6,5));im=ax.imshow(values,cmap='Blues');fig.colorbar(im,ax=ax)
        ax.set(xticks=[0,1],yticks=[0,1],xticklabels=CLASSES,yticklabels=CLASSES,xlabel='Predicted class',ylabel='True class',title='B2 test confusion matrix'+(' (row normalized)' if normalized else ''))
        for i in range(2):
            for j in range(2):ax.text(j,i,f'{values[i,j]:.3f}' if normalized else str(cm[i,j]),ha='center',va='center',color='white' if values[i,j]>values.max()/2 else 'black')
        fig.tight_layout();fig.savefig(R/('model_b2_test_confusion_matrix'+('_normalized' if normalized else '')+'.png'),dpi=180);plt.close(fig)
    with (MODEL.parents[1]/'results.csv').open(encoding='utf-8-sig') as stream:training=[{k.strip():v.strip() for k,v in row.items()} for row in csv.DictReader(stream)]
    best=max(training,key=lambda x:float(x['metrics/accuracy_top1']))
    tied=[int(x['epoch']) for x in training if float(x['metrics/accuracy_top1'])==float(best['metrics/accuracy_top1'])]
    train=dict(max_epochs=args['epochs'],actual_epochs=len(training),epochs_tied_best_val_top1=tied,best_val_top1=float(best['metrics/accuracy_top1']),patience=args['patience'],stop_reason='Not verified: server stopping log unavailable; 30 epochs completed, best Top-1 tied at 7 and 10')
    assert snapshot()==before,'Input files changed during evaluation'
    assert sha(MODEL)==model_hash
    result=dict(model_path=str(MODEL),model_sha256=model_hash,ultralytics_version=ultralytics.__version__,dataset=str(DATA),image_size=224,decision_rule='argmax; no threshold calibration',training=train,metrics=metrics,integrity=dict(corrupt=0,**leakage,inputs_unchanged=True),training_ready_image_level=True,training_ready_fruit_independent=False,group_isolation_provenance='Prior stage audit/user declaration; local B2 group manifest absent, not reverified in this evaluation')
    (R/'model_b2_test_metrics.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
    report='''# Jujube Model B2 v1 正式评估

模型：YOLO11n-cls；Ultralytics 8.3.40；Train 280 / Val 60 / Test 60。固定使用指定 best.pt、224输入与原训练crop_fraction，CPU FP32、argmax，不重新训练，不用Test选择阈值或超参数。prob_* / confidence 是模型分类得分，不是食品安全概率。

## 真实结果
Precision / Recall / F1 采用 rotten 为正类；Macro为两类等权平均；ROC-AUC使用prob_rotten连续得分，未搜索阈值。混淆矩阵行为真实、列为预测，顺序fresh、rotten。

```json
'''+json.dumps(result,indent=2,ensure_ascii=False)+'''
```

## 腐败漏检与高置信度错误
'''+f'Rotten Recall = {r[1]:.6f}；真实rotten被预测fresh：{cm[1,0]} / {n[1]}。\n\n错误且confidence≥0.8：{len(errors)}；≥0.9：{metrics["wrong_confidence_ge_09"]}。清单见 model_b2_high_confidence_errors.csv，若无错误仅保留表头。\n'+'''
## 数据与评价边界
training_ready_image_level = true

training_ready_fruit_independent = false

本次为 image-level internal evaluation，不是 strict fruit-independent evaluation。上一阶段仅保证已确认同果实组不跨split、已确认同场景组不跨split、SHA256及像素完全重复不跨split。当前本地缺少B2分组manifest，因此组隔离沿用上一阶段审计/用户声明，本次未独立重验；SHA256及解码像素跨split检查已对当前400张实际文件重新执行。完整性清单见 model_b2_evaluation_input_integrity.csv。

由于大量图片fruit identity尚未完全核验，不能证明全部Train/Val/Test在果实个体层面独立。测试仅60张，结果对少量错误敏感，不能外推为沧州金丝小枣真实田间/仓储准确率。训练早停信息若列出，仅由results.csv和args.yaml推断，不冒充服务器停止日志。

## 类别语义
- fresh → 新鲜果实外观。
- rotten → 腐败/变质类视觉表现。

不得解释为食品安全判定、是否可食用判定、微生物检测、腐败原因诊断或储藏寿命预测。

本次未修改数据、权重、Model A或Model B1，未执行训练或Test调参。完成评估后停止。
'''
    (R/'JUJUBE_MODEL_B2_V1_EVALUATION.md').write_text(report,encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
