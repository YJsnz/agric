"""Evaluate the frozen pear symptom classifier against the official prepared test split.

Reads the model at ai-service/models/pear/pear_symptom_yolo11n_cls_v1.pt and the test
images under data/prepared/classification/test (seed-42 official split). No training,
no test-time tuning. Class order matches the prepared class_mapping (curl/healthy/slug/spot).
"""
import hashlib
import json
from pathlib import Path

import cv2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

AGRIC = Path(r'F:/AIC2026/AIC-SmartAgriculture/agric')
ROOT = Path(r'F:/AIC2026/AIC-SmartAgriculture_PART/agric/ai-training/pear-vision')
MODEL_PATH = AGRIC / 'ai-service/models/pear/pear_symptom_yolo11n_cls_v1.pt'
TEST_DIR = ROOT / 'data/prepared/classification/test'
OUT_DIR = ROOT / 'reports'
CLASSES = ['curl', 'healthy', 'slug', 'spot']

from ultralytics import YOLO

def sha256_of(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def compute_metrics(targets, predictions, names=CLASSES):
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
        per_class=per_class, confusion_matrix=matrix,
        confusion_matrix_axes='rows=true, columns=predicted')


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    model_sha = sha256_of(MODEL_PATH)
    samples = []
    for cls_name in CLASSES:
        folder = TEST_DIR / cls_name
        if not folder.is_dir():
            raise SystemExit(f'missing test class dir: {folder}')
        for img in sorted(folder.iterdir()):
            ext = img.suffix.lower()
            if ext in {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}:
                samples.append((img, CLASSES.index(cls_name)))
    if not samples:
        raise SystemExit('no test images found')
    model = YOLO(str(MODEL_PATH))
    if set(model.names.values()) != set(CLASSES):
        raise SystemExit(f'unexpected model names: {model.names}')
    names_map = list(model.names.values())

    paths = [str(p) for p, _ in samples]
    results = []
    for index, p in enumerate(paths):
        im = cv2.imread(p)
        if im is None:
            raise SystemExit(f'could not decode: {p}')
        im = cv2.resize(im, (224, 224), interpolation=cv2.INTER_LINEAR)
        part_res = model.predict(source=[im], imgsz=224, device='cpu', workers=0,
                                 verbose=False, save=False)
        results.extend(part_res)
        if (index + 1) % 50 == 0:
            print(f'inferred {index + 1}/{len(paths)}', flush=True)
    if len(results) != len(samples):
        raise SystemExit(f'expected {len(samples)} results, got {len(results)}')

    targets, predictions, rows = [], [], []
    for (img, target), res in zip(samples, results):
        idx = int(res.probs.top1)
        pred_name = res.names[idx]
        if pred_name not in CLASSES:
            raise SystemExit(f'invalid prediction class {pred_name}')
        conf = float(res.probs.top1conf.item())
        targets.append(target)
        predictions.append(CLASSES.index(pred_name))
        rows.append(dict(image=img.name, true_class=CLASSES[target],
                         predicted_class=pred_name, confidence=round(conf, 6)))

    metrics = compute_metrics(targets, predictions)
    with open(OUT_DIR / 'pear_model_metrics.json', 'w', encoding='utf-8') as fh:
        json.dump(dict(model_path=str(MODEL_PATH), model_sha256=model_sha,
                       model_task='image classification', classes=CLASSES,
                       test_source=str(TEST_DIR), metrics=metrics,
                       decision='argmax, imgsz=224, CPU, no augment',
                       official_split='seed=42 80/10/10 from prepare_dataset.py'),
                  fh, ensure_ascii=False, indent=2)

    with open(OUT_DIR / 'pear_predictions.csv', 'w', encoding='utf-8-sig', newline='') as fh:
        fh.write('image,true_class,predicted_class,confidence\n')
        for r in rows:
            fh.write(f'{r["image"]},{r["true_class"]},{r["predicted_class"]},{r["confidence"]}\n')

    with open(OUT_DIR / 'pear_classification_report.csv', 'w', encoding='utf-8-sig', newline='') as fh:
        fh.write('class,precision,recall,f1,support\n')
        for name in CLASSES:
            pc = metrics['per_class'][name]
            fh.write(f'{name},{pc["precision"]},{pc["recall"]},{pc["f1"]},{pc["support"]}\n')

    fig, ax = plt.subplots(figsize=(7, 6), dpi=150)
    matrix = np.array(metrics['confusion_matrix'])
    im = ax.imshow(matrix, cmap='Greens')
    ax.set_xticks(range(len(CLASSES))); ax.set_xticklabels(CLASSES)
    ax.set_yticks(range(len(CLASSES))); ax.set_yticklabels(CLASSES)
    ax.set_xlabel('Predicted'); ax.set_ylabel('True')
    ax.set_title('Pear Symptom Classifier Confusion Matrix (official Test)')
    for i in range(len(CLASSES)):
        for j in range(len(CLASSES)):
            ax.text(j, i, str(matrix[i][j]), ha='center', va='center',
                    color='white' if matrix[i][j] > matrix.max() / 2 else '#0d3b26')
    fig.colorbar(im, ax=ax)
    fig.tight_layout()
    fig.savefig(OUT_DIR / 'pear_confusion_matrix.png')
    plt.close(fig)

    print(json.dumps(dict(test_images=metrics['test_images'],
                          accuracy=round(metrics['accuracy'], 6),
                          macro_f1=round(metrics['macro_f1'], 6),
                          balanced_accuracy=round(metrics['balanced_accuracy'], 6),
                          per_class={c: metrics['per_class'][c] for c in CLASSES},
                          model_sha256=model_sha[:16]), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()