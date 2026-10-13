"""Official v12 detection evaluation plus fixed-threshold counting; never train."""
import csv
import hashlib
import json
import os
import shutil
import tempfile
from collections import defaultdict
from pathlib import Path

os.environ.setdefault('YOLO_CONFIG_DIR', str(Path(tempfile.gettempdir()) / 'wheat_model_c_eval'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
# NumPy 2.4 removed the deprecated alias used by Ultralytics 8.3.40.
# Same trapezoidal integration, scoped to this evaluation process only.
if not hasattr(np, 'trapz'):
    np.trapz = np.trapezoid
from PIL import Image, ImageDraw
from scipy.stats import pearsonr
from sklearn.metrics import r2_score
import torch
import ultralytics
from ultralytics import YOLO
from ultralytics.models.yolo.detect.val import DetectionValidator

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/wheat_head_detection'
REPORTS = ROOT / 'reports'
MODEL = ROOT / 'runs/wheat_head_yolo11n_v12/weights/best.pt'
COUNT_CONF = .25  # Fixed before test; not selected using test scores.


def sha(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def write_csv(name, rows):
    with (REPORTS / name).open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


class CapturingValidator(DetectionValidator):
    """Observe official NMS outputs; delegate every detection metric unchanged."""
    captured = {}

    def update_metrics(self, preds, batch):
        for i, pred in enumerate(preds):
            prepared = self._prepare_batch(i, batch)
            native = self._prepare_pred(pred, prepared)
            self.captured[Path(batch['im_file'][i]).name] = {
                'predictions': native.detach().cpu().numpy(),
                'gt': prepared['bbox'].detach().cpu().numpy(),
            }
        super().update_metrics(preds, batch)


def count_metrics(rows):
    gt = np.array([r['ground_truth_count'] for r in rows], dtype=float)
    pred = np.array([r['predicted_count'] for r in rows], dtype=float)
    error = pred - gt
    return {'count_mae': float(np.mean(np.abs(error))),
            'count_rmse': float(np.sqrt(np.mean(error ** 2))),
            'count_bias': float(error.mean()),
            'count_pearson_r': float(pearsonr(gt, pred).statistic) if gt.std() and pred.std() else None,
            'count_r2': float(r2_score(gt, pred)) if len(gt)>1 and gt.std() else None}


def main():
    if ultralytics.__version__ != '8.3.40':
        raise RuntimeError('Use the verified Ultralytics 8.3.40 environment')
    manifest_path = REPORTS / 'model_c_split_manifest.csv'
    entries = [r for r in read_csv(manifest_path) if r['split'] == 'test']
    images = sorted((DATA / 'images/test').glob('*.png'))
    if len(images) != 432 or len(entries) != 432:
        raise ValueError('Fixed test must contain 432 images')
    by_hash = {r['sha256']: r for r in entries}
    if len(by_hash) != len(entries):
        raise ValueError('Duplicate test images in manifest')
    before = {str(p): (p.stat().st_size, p.stat().st_mtime_ns) for p in DATA.rglob('*') if p.is_file()}
    protected = {str(p): sha(p) for p in [MODEL, manifest_path, *DATA.glob('labels/**/*.txt')]}
    meta, ground_truth = {}, {}
    for image in images:
        checksum = sha(image)
        protected[str(image)] = checksum
        if checksum not in by_hash:
            raise ValueError(f'Image SHA not found in test manifest: {image}')
        meta[image.name] = by_hash[checksum]
        label = DATA / 'labels/test' / (image.stem+'.txt')
        lines = [line.split() for line in label.read_text().splitlines() if line.strip()]
        if any(len(line)!=5 or line[0]!='0' for line in lines):
            raise ValueError(f'Invalid label: {label}')
        ground_truth[image.name] = len(lines)
        if len(lines) != int(meta[image.name]['valid_unique_bbox_count']):
            raise ValueError('Label count does not match audited manifest')
    if sum(ground_truth.values()) != 19210:
        raise ValueError('Fixed test must contain 19210 ground truth boxes')
    history = read_csv(MODEL.parents[1] / 'results.csv')
    best = max(history, key=lambda r: .1*float(r['metrics/mAP50(B)'])+.9*float(r['metrics/mAP50-95(B)']))
    REPORTS.mkdir(exist_ok=True)
    device = 0 if torch.cuda.is_available() else 'cpu'
    print(f'Verified 432 images / 19210 boxes; device={device}; fixed count conf={COUNT_CONF}', flush=True)
    with tempfile.TemporaryDirectory(prefix='model_c_eval_') as directory:
        tmp = Path(directory)
        (tmp / 'images/test').mkdir(parents=True)
        (tmp / 'labels/test').mkdir(parents=True)
        for image in images:
            shutil.copy2(image, tmp/'images/test'/image.name)
            shutil.copy2(DATA/'labels/test'/(image.stem+'.txt'), tmp/'labels/test'/(image.stem+'.txt'))
        config = tmp / 'dataset.yaml'
        config.write_text(f'path: {json.dumps(tmp.as_posix())}\ntrain: images/test\nval: images/test\ntest: images/test\nnames:\n  0: wheat_head\n', encoding='utf-8')
        # All three aliases resolve only within the disposable evaluation copy;
        # only split=test is executed, never training or validation selection.
        model = YOLO(str(MODEL))
        if model.names != {0:'wheat_head'}:
            raise ValueError(f'Wrong model class mapping: {model.names}')
        CapturingValidator.captured = {}
        result = model.val(validator=CapturingValidator, data=str(config), split='test',
                           imgsz=640, batch=16, workers=0, device=device, half=False,
                           conf=.001, iou=.7, max_det=300, augment=False,
                           plots=False, save_json=False, save_txt=False,
                           project=str(REPORTS/'model_c_official_val'), name='test', exist_ok=True)
    official = {'precision':float(result.box.mp), 'recall':float(result.box.mr),
                'map50':float(result.box.map50), 'map50_95':float(result.box.map)}
    reference = dict(zip(official, [.937,.871,.942,.587]))
    differences = {k: abs(official[k]-reference[k]) for k in official}
    (REPORTS/'model_c_official_val_result.json').write_text(json.dumps({'actual':official,'user_rounded_reference':reference,'absolute_differences':differences},indent=2),encoding='utf-8')
    if any(v>.005 for v in differences.values()):
        raise RuntimeError(f'STOP: official test metrics differ materially from supplied reference: {differences}')
    captured = CapturingValidator.captured
    if len(captured)!=432:
        raise RuntimeError('Missing per-image official predictions')
    rows = []
    for image in images:
        item = captured[image.name]
        if len(item['gt']) != ground_truth[image.name]:
            raise RuntimeError('Official loader ground truth count differs')
        predictions = item['predictions']
        selected = predictions[predictions[:,4]>=COUNT_CONF]
        item['selected'] = selected
        n = len(selected); gt=ground_truth[image.name]
        rows.append({'image_path':str(image),'filename':image.name,'ground_truth_count':gt,
                     'predicted_count':n,'count_error':n-gt,'absolute_count_error':abs(n-gt),
                     'source_domain':meta[image.name].get('domain','')})
    write_csv('model_c_test_predictions.csv',rows)
    worst = sorted(rows,key=lambda r:(-r['absolute_count_error'],r['filename']))[:20]
    write_csv('model_c_worst_count_errors.csv',worst)
    domains=defaultdict(list)
    for row in rows:domains[row['source_domain']].append(row)
    domain_rows=[]
    for domain, group in domains.items():
        domain_rows.append({'source_domain':domain,'image_count':len(group),
                            'gt_boxes':sum(r['ground_truth_count'] for r in group),
                            'pred_boxes':sum(r['predicted_count'] for r in group),
                            **count_metrics(group), **(official if len(domains)==1 and domain else
                            {k:None for k in official})})
    write_csv('model_c_domain_metrics.csv',domain_rows)
    counts=count_metrics(rows)
    mean_gt=np.mean([r['ground_truth_count'] for r in rows])
    # Descriptive prototype criterion, not a field-accuracy certification.
    recommend=official['map50']>=.9 and official['map50_95']>=.5 and counts['count_mae']/mean_gt<=.15
    output={'model_path':str(MODEL),'model_sha256':protected[str(MODEL)],
            'best_epoch':int(best['epoch']),'best_epoch_user_reported':54,
            'best_epoch_note':'CSV epoch is authoritative; user supplied 54 is retained separately.',
            'val_metrics_from_training_csv':{k:float(best[v]) for k,v in
                {'precision':'metrics/precision(B)','recall':'metrics/recall(B)','map50':'metrics/mAP50(B)','map50_95':'metrics/mAP50-95(B)'}.items()},
            'test_images':len(rows),'test_instances':sum(ground_truth.values()),**official,**counts,
            'count_confidence_threshold':COUNT_CONF,'nms_iou':.7,'max_det':300,'image_size':640,
            'ap_min_confidence':.001,'ultralytics_version':ultralytics.__version__,
            'reference_absolute_differences':differences,'domain_metrics':domain_rows,
            'worst_over_count':max(r['count_error'] for r in rows),
            'worst_under_count':min(r['count_error'] for r in rows),
            'count_mae_divided_by_mean_gt':counts['count_mae']/float(mean_gt),
            'recommend_freeze_v1':bool(recommend),'source_domain_comparison':'Not assessable: test contains rres_1 only.',
            'evaluation_scope':'internal source-domain-separated test; not official GWHD test'}
    gt=np.array([r['ground_truth_count'] for r in rows]);pred=np.array([r['predicted_count'] for r in rows])
    fig,ax=plt.subplots(figsize=(6,6));ax.scatter(gt,pred,s=12,alpha=.5)
    limit=max(gt.max(),pred.max());ax.plot([0,limit],[0,limit],'k--')
    ax.set(xlabel='ground_truth_count',ylabel='predicted_count',title='Model C: conf >= 0.25')
    fig.tight_layout();fig.savefig(REPORTS/'model_c_gt_vs_pred_count.png',dpi=180);plt.close(fig)
    fig,ax=plt.subplots();ax.hist(pred-gt,bins=30);ax.axvline(0,color='black',linestyle='--')
    ax.set(xlabel='predicted_count - ground_truth_count',ylabel='Images',title='Model C count errors')
    fig.tight_layout();fig.savefig(REPORTS/'model_c_count_error_hist.png',dpi=180);plt.close(fig)
    examples=REPORTS/'model_c_examples';examples.mkdir(exist_ok=True)
    categories={'good_detection':sorted(rows,key=lambda r:r['absolute_count_error'])[:3],
                'under_count':sorted([r for r in rows if r['count_error']<0],key=lambda r:r['count_error'])[:3],
                'over_count':sorted([r for r in rows if r['count_error']>0],key=lambda r:-r['count_error'])[:3]}
    for category, selection in categories.items():
        folder=examples/category;folder.mkdir(exist_ok=True)
        for row in selection:
            with Image.open(row['image_path']) as image: canvas=image.convert('RGB')
            draw=ImageDraw.Draw(canvas)
            for box in captured[row['filename']]['gt']:draw.rectangle(tuple(map(float,box)),outline='lime',width=2)
            for box in captured[row['filename']]['selected']:draw.rectangle(tuple(map(float,box[:4])),outline='red',width=2)
            draw.rectangle((0,0,650,28),fill='black')
            draw.text((5,5),f"GT(green)={row['ground_truth_count']} Pred(red)={row['predicted_count']} error={row['count_error']} conf>=0.25",fill='white')
            canvas.save(folder/(Path(row['filename']).stem+'.jpg'),quality=92)
    for p, checksum in protected.items():
        if sha(Path(p))!=checksum:raise RuntimeError(f'Protected input changed: {p}')
    after={str(p):(p.stat().st_size,p.stat().st_mtime_ns) for p in DATA.rglob('*') if p.is_file()}
    if before!=after:raise RuntimeError('Original dataset inventory changed')
    output['input_integrity_verified']=True
    (REPORTS/'model_c_test_metrics.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
    report=['# Model C Evaluation',
            'Global Wheat Head Dataset 2020：raw4698、usable3422、总框145411；train2382 / val608 / test432。',
            'source-domain-separated internal split，官方无标签test1276张未参与。指定模型v12，未替换v13。',
            f"最佳epoch：训练CSV为{best['epoch']}；用户提供54。给定Val四项指标与CSV第53个epoch一致，不能将epoch54写成已验证事实。",
            '## Formal metrics', '```json\n'+json.dumps(output,ensure_ascii=False,indent=2)+'\n```',
            '检测指标直接来自Ultralytics官方model.val(split=test)。Precision/Recall是官方PR曲线选择的操作点，'
            '不等于固定0.25计数操作点的检测P/R。AP使用conf0.001保留PR曲线，计数仅取同次NMS后score>=0.25的框；未按Test调参。',
            '## Counting and errors',
            'MAE=mean(abs(pred-gt))，RMSE=sqrt(mean((pred-gt)^2))，Bias=mean(pred-gt)。Pearson r为线性相关；'
            'R²采用sklearn r2_score(gt,pred)，不是Pearson r平方。计数误差不能区分漏检、误检与重复检测的抵消。',
            'Top20详情：model_c_worst_count_errors.csv。\n\n'+ '\n'.join(f"- {r['filename']}: GT={r['ground_truth_count']}, pred={r['predicted_count']}, error={r['count_error']}" for r in worst),
            '## Source domains',
            '来源从图像SHA与既有manifest可靠匹配。Test只有rres_1，所以该域检测指标与整体相同；不能比较不同来源域性能，也不能宣称不存在域差异。',
            '## Limitations and freeze recommendation',
            '仅内部rres_1测试，未验证官方盲测、黄骅本地或跨设备泛化。count MAE依赖conf0.25/NMS0.7/640输入；'
            'mAP高不代表计数必然准确。good_detection按计数误差小选取，不保证定位无误；示例绿框GT、红框预测。'
            '真实面积密度需要面积/尺度元数据。',
            f"建议冻结Model C v1：{'是，作为内部原型候选' if recommend else '暂不建议'}。采用描述性判据：mAP50>=0.9、mAP50-95>=0.5且MAE/平均GT<=15%。"
            '这不是田间性能认证；实际冻结不在本阶段执行。',
            '原数据YAML含服务器路径，评估使用临时副本和专用YAML；缓存仅写临时副本。原始split/labels/权重哈希及数据清单未变，raw未触碰。未训练。']
    (REPORTS/'MODEL_C_EVALUATION.md').write_text('\n\n'.join(report)+'\n',encoding='utf-8')
    print(json.dumps(output,ensure_ascii=False,indent=2),flush=True)


if __name__=='__main__':
    main()
