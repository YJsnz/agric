"""Read-only re-derivation of the pear leaf model test metrics from the stored predictions.

Recomputes Accuracy, per-class Precision/Recall/F1, Macro-F1, Balanced Accuracy and the
confusion matrix from reports/pear_predictions.csv, cross-checks them against the stored
pear_model_metrics.json, and verifies the prediction list covers the on-disk test split.
Nothing is written except its own JSON summary.
"""
from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

REPORTS = Path('ai-training/pear-vision/reports')
TEST_DIR = Path('ai-training/pear-vision/data/prepared/classification/test')
CLASSES = ['curl', 'healthy', 'slug', 'spot']
OUT = Path('verify_pear_eval.json')

rows = list(csv.DictReader(open(REPORTS / 'pear_predictions.csv', encoding='utf-8-sig')))
metrics = json.loads((REPORTS / 'pear_model_metrics.json').read_text(encoding='utf-8'))

n = len(rows)
correct = sum(1 for r in rows if r['true_class'] == r['predicted_class'])
acc = correct / n

per_class = {}
f1s, recalls = [], []
cm = {t: Counter() for t in CLASSES}
for c in CLASSES:
    tp = sum(1 for r in rows if r['true_class'] == c and r['predicted_class'] == c)
    fp = sum(1 for r in rows if r['true_class'] != c and r['predicted_class'] == c)
    fn = sum(1 for r in rows if r['true_class'] == c and r['predicted_class'] != c)
    support = sum(1 for r in rows if r['true_class'] == c)
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    per_class[c] = {'precision': round(prec, 6), 'recall': round(rec, 6), 'f1': round(f1, 6), 'support': support}
    f1s.append(f1)
    recalls.append(rec)
    for r in rows:
        if r['true_class'] == c:
            cm[c][r['predicted_class']] += 1

macro_f1 = sum(f1s) / len(f1s)
balanced_acc = sum(recalls) / len(recalls)

disk = {c: len([p for p in (TEST_DIR / c).iterdir() if p.is_file()]) for c in CLASSES}
pred_names = {r['image'] for r in rows}
disk_names = {p.name for c in CLASSES for p in (TEST_DIR / c).iterdir() if p.is_file()}
label_consistent = all(r['true_class'] in CLASSES and r['predicted_class'] in CLASSES for r in rows)
true_by_dir = {p.name: c for c in CLASSES for p in (TEST_DIR / c).iterdir() if p.is_file()}
label_matches_dir = all(true_by_dir.get(r['image']) == r['true_class'] for r in rows)

recomputed = {
    'test_images': n,
    'accuracy': round(acc, 10),
    'macro_f1': round(macro_f1, 10),
    'balanced_accuracy': round(balanced_acc, 10),
    'per_class': per_class,
    'confusion_matrix_rows_true_cols_pred': {c: dict(cm[c]) for c in CLASSES},
}
stored = metrics['metrics']
deltas = {
    'accuracy': abs(recomputed['accuracy'] - stored['accuracy']),
    'macro_f1': abs(recomputed['macro_f1'] - stored['macro_f1']),
    'balanced_accuracy': abs(recomputed['balanced_accuracy'] - stored['balanced_accuracy']),
}
out = {
    'predictions_file': str(REPORTS / 'pear_predictions.csv'),
    'recomputed': recomputed,
    'stored_metrics': {'test_images': stored['test_images'], 'accuracy': stored['accuracy'],
                       'macro_f1': stored['macro_f1'], 'balanced_accuracy': stored['balanced_accuracy']},
    'abs_delta_vs_stored': deltas,
    'matches_stored': all(v < 1e-9 for v in deltas.values()) and n == stored['test_images'],
    'coverage': {
        'predictions_rows': n,
        'disk_test_files': len(disk_names),
        'test_per_class': disk,
        'prediction_per_class': dict(Counter(r['true_class'] for r in rows)),
        'prediction_set_equals_disk_set': pred_names == disk_names,
        'labels_in_known_classes': label_consistent,
        'true_label_matches_directory': label_matches_dir,
        'extra_in_predictions': sorted(pred_names - disk_names)[:10],
        'missing_from_predictions': sorted(disk_names - pred_names)[:10],
    },
    'class_order': CLASSES,
    'class_order_matches_metrics_json': metrics['classes'] == CLASSES,
    'model_path_in_metrics': metrics['model_path'],
    'model_sha256_in_metrics': metrics['model_sha256'],
    'decision': metrics['decision'],
    'official_split': metrics['official_split'],
    'confusion_matrix_axes': metrics['metrics'].get('confusion_matrix_axes'),
}
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: out[k] for k in ('matches_stored', 'abs_delta_vs_stored', 'coverage', 'class_order_matches_metrics_json')},
                 ensure_ascii=False, indent=2))
