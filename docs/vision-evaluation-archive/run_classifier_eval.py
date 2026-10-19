"""Generic formal classifier evaluation on an official directory test split.

Usage:
  python run_classifier_eval.py --model <pt> --test <dir> [--name <prefix>] [--out <dir>]
Classes and their order are read from the checkpoint names; each class folder under
the test dir must match those names. No training, no threshold tuning.
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from ultralytics import YOLO


def sha256_of(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def compute_metrics(targets, predictions, names):
    matrix = [[0] * len(names) for _ in names]
    for t, p in zip(targets, predictions):
        matrix[t][p] += 1
    per_class = {}
    for i, name in enumerate(names):
        tp = matrix[i][i]
        support = sum(matrix[i])
        predicted = sum(row[i] for row in matrix)
        precision = tp / predicted if predicted else 0.0
        recall = tp / support if support else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class[name] = dict(precision=round(precision, 6), recall=round(recall, 6),
                               f1=round(f1, 6), support=support)
    n = len(targets)
    return dict(
        test_images=n,
        accuracy=sum(matrix[i][i] for i in range(len(names))) / n,
        macro_f1=float(np.mean([per_class[c]['f1'] for c in names])),
        balanced_accuracy=float(np.mean([per_class[c]['recall'] for c in names])),
        weighted_f1=float(np.average([per_class[c]['f1'] for c in names],
                                     weights=[per_class[c]['support'] for c in names])),
        per_class=per_class, confusion_matrix=matrix,
        confusion_matrix_axes='rows=true, columns=predicted')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--test', required=True)
    ap.add_argument('--name', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    model_sha = sha256_of(args.model)
    model = YOLO(args.model)
    if model.task != 'classify':
        raise SystemExit(f'expected classifier, got {model.task}')
    names = list(model.names.values())

    samples = []
    for i, cls in enumerate(names):
        folder = Path(args.test) / cls
        if not folder.is_dir():
            raise SystemExit(f'missing class dir {folder} (names={names})')
        for img in sorted(folder.iterdir()):
            if img.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}:
                samples.append((img, i))
    if not samples:
        raise SystemExit('no test images')

    targets, predictions, rows = [], [], []
    chunk_size = 32
    for start in range(0, len(samples), chunk_size):
        chunk = samples[start:start + chunk_size]
        batch = []
        for img, _ in chunk:
            im = cv2.imread(str(img))
            if im is None:
                raise SystemExit(f'decode failed: {img}')
            batch.append(cv2.resize(im, (224, 224), interpolation=cv2.INTER_LINEAR))
        results = model.predict(source=batch, imgsz=224, device='cpu', workers=0,
                                verbose=False, save=False)
        for (img, target), r in zip(chunk, results):
            idx = int(r.probs.top1)
            pred = r.names[idx]
            if pred not in names:
                raise SystemExit(f'invalid class {pred}')
            conf = float(r.probs.top1conf.item())
            targets.append(target)
            predictions.append(names.index(pred))
            rows.append(dict(image=img.name, true_class=names[target],
                             predicted_class=pred, confidence=round(conf, 6)))
        print(f'processed {min(start + chunk_size, len(samples))}/{len(samples)}', flush=True)

    metrics = compute_metrics(targets, predictions, names)
    payload = dict(model_path=args.model, model_sha256=model_sha, classes=names,
                   test_source=args.test, official_split='official directory split',
                   decision='argmax, imgsz=224, CPU, no augment', metrics=metrics)
    (out_dir / f'{args.name}_model_metrics.json').write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')

    with open(out_dir / f'{args.name}_predictions.csv', 'w', encoding='utf-8-sig', newline='') as fh:
        fh.write('image,true_class,predicted_class,confidence\n')
        for r in rows:
            fh.write(f'{r["image"]},{r["true_class"]},{r["predicted_class"]},{r["confidence"]}\n')

    with open(out_dir / f'{args.name}_classification_report.csv', 'w', encoding='utf-8-sig', newline='') as fh:
        fh.write('class,precision,recall,f1,support\n')
        for c in names:
            pc = metrics['per_class'][c]
            fh.write(f'{c},{pc["precision"]},{pc["recall"]},{pc["f1"]},{pc["support"]}\n')

    fig, ax = plt.subplots(figsize=(8, 6), dpi=150)
    matrix = np.array(metrics['confusion_matrix'])
    im = ax.imshow(matrix, cmap='Greens')
    ax.set_xticks(range(len(names))); ax.set_xticklabels(names, rotation=40, ha='right', fontsize=8)
    ax.set_yticks(range(len(names))); ax.set_yticklabels(names, fontsize=8)
    ax.set_xlabel('Predicted'); ax.set_ylabel('True')
    ax.set_title(f'{args.name} Confusion Matrix (official Test)')
    for i in range(len(names)):
        for j in range(len(names)):
            ax.text(j, i, str(matrix[i][j]), ha='center', va='center', fontsize=7,
                    color='white' if matrix[i][j] > matrix.max() / 2 else '#0d3b26')
    fig.colorbar(im, ax=ax)
    fig.tight_layout()
    fig.savefig(out_dir / f'{args.name}_confusion_matrix.png')
    plt.close(fig)

    print(json.dumps(dict(name=args.name, test_images=metrics['test_images'],
                          accuracy=round(metrics['accuracy'], 6),
                          macro_f1=round(metrics['macro_f1'], 6),
                          balanced_accuracy=round(metrics['balanced_accuracy'], 6),
                          weighted_f1=round(metrics['weighted_f1'], 6),
                          per_class={c: metrics['per_class'][c] for c in names},
                          model_sha256=model_sha[:16]), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()