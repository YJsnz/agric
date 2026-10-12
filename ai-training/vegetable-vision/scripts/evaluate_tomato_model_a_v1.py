"""Read-only, fixed-checkpoint Test evaluation. No training or threshold selection."""
import csv
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / 'reports'
os.environ['YOLO_CONFIG_DIR'] = str(REPORTS / '.evaluation_ultralytics')
os.environ['MPLCONFIGDIR'] = str(REPORTS / '.evaluation_matplotlib')
MODEL = ROOT / 'runs/tomato_leaf_yolo11n_cls_v1/weights/best.pt'
DATA = ROOT / 'data/tomato_leaf_classifier_v1'
CLASSES = ['bacterial_spot', 'bacterial_spot_and_leaf_miner', 'healthy',
           'leaf_miner', 'powdery_mildew', 'powdery_mildew_and_leaf_miner', 'whitefly']


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def snapshot():
    return {p.relative_to(DATA).as_posix(): (p.stat().st_size, p.stat().st_mtime_ns, sha(p))
            for p in sorted(DATA.rglob('*')) if p.is_file()}


def write_csv(name, rows, fields):
    with (REPORTS / name).open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main():
    # Fail before any model construction if local inputs are absent; no downloads.
    for p in [MODEL, DATA / 'test', MODEL.parents[1] / 'results.csv']:
        if not p.exists():
            raise FileNotFoundError(f'Required local input missing: {p}')
    REPORTS.mkdir(exist_ok=True)
    import cv2
    import numpy as np
    import torch
    import yaml
    import ultralytics
    from ultralytics import YOLO
    from sklearn.metrics import (accuracy_score, precision_recall_fscore_support,
                                 balanced_accuracy_score, confusion_matrix, roc_auc_score)
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    torch.set_num_threads(4)
    args_file = MODEL.parents[1] / 'args.yaml'
    args = yaml.safe_load(args_file.read_text(encoding='utf-8')) if args_file.exists() else {}
    image_size = int(args.get('imgsz', 224))
    crop_fraction = float(args.get('crop_fraction', 1.0))
    with (MODEL.parents[1] / 'results.csv').open(encoding='utf-8-sig', newline='') as f:
        training = [{k.strip(): v.strip() for k, v in r.items()} for r in csv.DictReader(f)]
    if not training:
        raise ValueError('Training results.csv is empty')
    best = max(training, key=lambda r: float(r['metrics/accuracy_top1']))
    train_summary = dict(actual_epochs=len(training), best_epoch=int(float(best['epoch'])),
                         best_val_top1=float(best['metrics/accuracy_top1']),
                         final_epoch_val_top1=float(training[-1]['metrics/accuracy_top1']),
                         best_epoch_definition='First epoch attaining maximum recorded validation Top-1',
                         args=args)
    extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}
    split_counts = {}
    test_paths = []
    for split, expected in [('train', 9816), ('val', 2105), ('test', 2101)]:
        base = DATA / split
        if {p.name for p in base.iterdir() if p.is_dir()} != set(CLASSES):
            raise ValueError(f'Unexpected class directories in {split}')
        counts = {c: len([p for p in (base / c).rglob('*') if p.suffix.lower() in extensions]) for c in CLASSES}
        if sum(counts.values()) != expected:
            raise ValueError(f'{split} count mismatch: {counts}; expected {expected}')
        split_counts[split] = counts
        if split == 'test':
            test_paths = [(c, p) for c in CLASSES for p in sorted((base / c).rglob('*'))
                          if p.is_file() and p.suffix.lower() in extensions]
    if [split_counts[s]['whitefly'] for s in ['train', 'val', 'test']] != [230, 49, 49]:
        raise ValueError('Whitefly split support differs from formal dataset')
    print('Hashing dataset before inference...', flush=True)
    before = snapshot()
    weight_hash = sha(MODEL)
    model = YOLO(str(MODEL))
    if model.task != 'classify' or set(model.names.values()) != set(CLASSES):
        raise ValueError(f'Wrong model task/classes: {model.task}, {model.names}')
    indexes = {c: next(i for i, name in model.names.items() if name == c) for c in CLASSES}
    rows, scores = [], []
    for i, (true_class, path) in enumerate(test_paths, 1):
        # Match Ultralytics classification validation decoding (OpenCV BGR),
        # not list-of-filenames PIL decoding. One image per prediction call.
        image = cv2.imread(str(path))
        if image is None:
            raise ValueError(f'Cannot decode Test image; nothing repaired or skipped: {path}')
        result = model.predict(image, imgsz=image_size, crop_fraction=crop_fraction,
                               device='cpu', half=False, augment=False, save=False,
                               verbose=False)[0]
        raw = result.probs.data.detach().cpu().numpy()
        prob = np.asarray([raw[indexes[c]] for c in CLASSES], dtype=float)
        if not np.isfinite(prob).all() or (prob < 0).any() or not np.isclose(prob.sum(), 1, atol=1e-4):
            raise ValueError(f'Invalid probability vector: {path}')
        pred = CLASSES[int(prob.argmax())]
        row = dict(filename=path.name, image_path=str(path), true_class=true_class,
                   predicted_class=pred, confidence=float(prob.max()), correct=pred == true_class)
        row.update({f'prob_{c}': float(v) for c, v in zip(CLASSES, prob)})
        rows.append(row)
        scores.append(prob)
        if i % 100 == 0 or i == len(test_paths):
            print(f'Inferred {i}/{len(test_paths)}', flush=True)
    print('Verifying dataset and model hashes...', flush=True)
    if before != snapshot() or sha(MODEL) != weight_hash:
        raise RuntimeError('Dataset/model integrity mismatch; evaluation not finalized')

    truth = [CLASSES.index(r['true_class']) for r in rows]
    pred = [CLASSES.index(r['predicted_class']) for r in rows]
    p, r, f1, support = precision_recall_fscore_support(truth, pred, labels=range(7), zero_division=0)
    cm = confusion_matrix(truth, pred, labels=range(7))
    metrics = dict(accuracy=float(accuracy_score(truth, pred)), macro_precision=float(p.mean()),
                   macro_recall=float(r.mean()), macro_f1=float(f1.mean()),
                   balanced_accuracy=float(balanced_accuracy_score(truth, pred)),
                   weighted_precision=float(np.average(p, weights=support)),
                   weighted_recall=float(np.average(r, weights=support)),
                   weighted_f1=float(np.average(f1, weights=support)))
    try:
        metrics['macro_roc_auc_ovr'] = float(roc_auc_score(truth, np.asarray(scores),
                                                       labels=list(range(7)), multi_class='ovr', average='macro'))
    except ValueError as exc:
        metrics['macro_roc_auc_ovr'] = None
        metrics['roc_auc_unavailable_reason'] = str(exc)
    per_class = {c: dict(support=int(n), precision=float(a), recall=float(b), f1=float(v))
                 for c, n, a, b, v in zip(CLASSES, support, p, r, f1)}
    pairs = [dict(true_class=CLASSES[i], predicted_class=CLASSES[j], count=int(cm[i, j]))
             for i in range(7) for j in range(7) if i != j and cm[i, j]]
    pairs.sort(key=lambda x: (-x['count'], x['true_class'], x['predicted_class']))
    focus = [('bacterial_spot', 'bacterial_spot_and_leaf_miner'),
             ('powdery_mildew', 'powdery_mildew_and_leaf_miner'),
             ('leaf_miner', 'bacterial_spot_and_leaf_miner'),
             ('leaf_miner', 'powdery_mildew_and_leaf_miner')]
    focus += [('whitefly', c) for c in CLASSES if c != 'whitefly']
    focus_rows = [dict(class_a=a, class_b=b, a_to_b=int(cm[CLASSES.index(a), CLASSES.index(b)]),
                       b_to_a=int(cm[CLASSES.index(b), CLASSES.index(a)])) for a, b in focus]
    errors = [r for r in rows if not r['correct'] and r['confidence'] >= .8]
    errors.sort(key=lambda r: -r['confidence'])
    output = dict(model_path=str(MODEL), model_sha256=weight_hash, classes=CLASSES,
                  model_class_mapping=model.names, test_images=len(rows), split_counts=split_counts,
                  metrics=metrics, per_class=per_class, whitefly=per_class['whitefly'],
                  confusion_matrix=cm.tolist(), top_confusion_pairs=pairs[:20],
                  focused_confusions=focus_rows, high_confidence_errors_ge_08=len(errors),
                  high_confidence_errors_ge_09=sum(r['confidence'] >= .9 for r in errors),
                  training=train_summary, training_ready_image_level=True,
                  training_ready_leaf_independent=False, local_qingxian_validated=False,
                  evaluation_level='public greenhouse tomato internal test evaluation',
                  source='TLID; DOI 10.17632/kt64b2kh89.2',
                  inference=dict(device='cpu', imgsz=image_size, crop_fraction=crop_fraction,
                                 augment=False, half=False, batch=1, decision='argmax, no tuning',
                                 ultralytics=ultralytics.__version__, torch=torch.__version__),
                  dataset_sha256_verified_unchanged=True, model_sha256_verified_unchanged=True,
                  corrupt=0)
    write_csv('tomato_model_a_test_predictions.csv', rows, list(rows[0]))
    fields = ['filename', 'true_class', 'predicted_class', 'confidence']
    write_csv('tomato_model_a_high_confidence_errors.csv',
              [{k: row[k] for k in fields} for row in errors], fields)
    for normalized in [False, True]:
        values = cm / cm.sum(axis=1, keepdims=True) if normalized else cm
        fig, ax = plt.subplots(figsize=(13, 11))
        im = ax.imshow(values, cmap='Blues'); fig.colorbar(im, ax=ax)
        ax.set(xticks=range(7), yticks=range(7), xticklabels=CLASSES, yticklabels=CLASSES,
               xlabel='Predicted class', ylabel='True class',
               title='Tomato Model A V1 Test' + (' (row normalized)' if normalized else ''))
        plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
        for i in range(7):
            for j in range(7):
                ax.text(j, i, f'{values[i,j]:.3f}' if normalized else str(values[i,j]),
                        ha='center', va='center', color='white' if values[i,j] > values.max()/2 else 'black')
        fig.tight_layout()
        fig.savefig(REPORTS / ('tomato_model_a_test_confusion_matrix' + ('_normalized' if normalized else '') + '.png'), dpi=180)
        plt.close(fig)
    (REPORTS / 'tomato_model_a_v1_metrics.json').write_text(json.dumps(output, ensure_ascii=False, indent=2, allow_nan=False), encoding='utf-8')
    report = ['# Vegetable Model A V1 正式评估', '',
              '数据来源：TLID公开温室番茄数据集，DOI 10.17632/kt64b2kh89.2。',
              '本结果为“公开温室番茄内部测试集上的评估结果”，不是青县现场准确率。',
              '模型用于视觉表现分类，不是植物病害最终诊断。', '',
              'training_ready_image_level = true  ', 'training_ready_leaf_independent = false  ',
              'local_qingxian_validated = false',
              '已确认同源组隔离不代表所有叶片身份独立；不能声称严格 leaf-independent 测试。', '',
              f'模型：`{MODEL}`；SHA256：`{weight_hash}`。',
              'Train=9816，Val=2105，Test=2101；全部Test逐张读取、逐张推理，未跳过样本。',
              f'环境与固定推理设置：`{json.dumps(output["inference"], ensure_ascii=False)}`',
              '使用训练记录中的图像尺寸和裁剪参数，CPU FP32、argmax；未用Test调参。', '',
              '## 总体指标', '', '| 指标 | 数值 |', '|---|---:|']
    report += [f'| {k} | {v:.6f} |' if isinstance(v, float) else f'| {k} | {v} |' for k, v in metrics.items()]
    report += ['', '## 逐类指标', '', '| 类别 | Support | Precision | Recall | F1 |', '|---|---:|---:|---:|---:|']
    report += [f'| {c} | {d["support"]} | {d["precision"]:.6f} | {d["recall"]:.6f} | {d["f1"]:.6f} |' for c, d in per_class.items()]
    report += ['', 'whitefly 样本少：Train=230、Val=49、Test=49；其测试 Recall 每错1张约变化2.04个百分点，应谨慎解读。',
               f'whitefly Precision={p[6]:.6f}，Recall={r[6]:.6f}，F1={f1[6]:.6f}。', '',
               '## 混淆矩阵与错误方向', '', '矩阵行是真实类别，列是预测类别；顺序：'+', '.join(CLASSES),
               '```json', json.dumps(cm.tolist()), '```',
               '![混淆矩阵](tomato_model_a_test_confusion_matrix.png)',
               '![按真实类别归一化](tomato_model_a_test_confusion_matrix_normalized.png)', '',
               '### Top confusion pairs', '']
    report += [f'- {x["true_class"]} → {x["predicted_class"]}：{x["count"]}' for x in pairs[:20]]
    report += ['', '### 重点双向混淆（包括零值）', '']
    report += [f'- {x["class_a"]} → {x["class_b"]}：{x["a_to_b"]}；反向：{x["b_to_a"]}。' for x in focus_rows]
    report += ['', '## 高置信错误', '', f'错误且confidence≥0.8：{len(errors)}；≥0.9：{output["high_confidence_errors_ge_09"]}。',
               '错误清单保存全部≥0.8记录；分类分数不代表疾病确诊概率。', '', '## 训练记录', '',
               f'actual epochs={len(training)}；best epoch={train_summary["best_epoch"]}（首次最高Val Top-1）；',
               f'best val top1={train_summary["best_val_top1"]}；final epoch val top1={train_summary["final_epoch_val_top1"]}。',
               'best epoch 依据results.csv的Val Top-1，未据Test选择权重。',
               '训练参数：', '```json', json.dumps(args, ensure_ascii=False, indent=2), '```', '',
               '## 完整性与限制', '',
               '评估前后全数据文件SHA256、大小、mtime及模型SHA256一致；未训练、未重划分、未调参、未冻结。',
               '未将之前约0.871/0.999的日志数值作为本次结果。所有指标来自本地best.pt对2101张Test图片的新推理。',
               '混合类别、类别不平衡、未完全核验的叶片身份及公开温室到青县场景迁移限制均应保留。']
    (REPORTS / 'TOMATO_MODEL_A_V1_EVALUATION.md').write_text('\n'.join(report)+'\n', encoding='utf-8')
    print(json.dumps(dict(metrics=metrics, whitefly=per_class['whitefly'], high_confidence_errors=len(errors)), ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
