"""Baseline YOLO classification transfer learning. Run --dry-run before server training.

Single GPU or CPU only. Each experiment starts from the same pretrained .pt.
Validation macro-F1 selects best.pt; test data never enters checkpoint selection.
"""
from __future__ import annotations

import argparse
from copy import copy
import csv
import hashlib
import json
import os
from pathlib import Path
import platform
import statistics
import sys

ROOT = Path(__file__).resolve().parents[1]
CLASSES = ['curl', 'healthy', 'slug', 'spot']
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tif', '.tiff'}
ULTRALYTICS_VERSION = '8.3.40'


def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def classification_metrics(targets, predictions, names=CLASSES):
    if not targets or len(targets) != len(predictions):
        raise ValueError('Metrics require nonempty, equally sized targets and predictions')
    matrix = [[0] * len(names) for _ in names]
    for target, prediction in zip(targets, predictions):
        if not (0 <= target < len(names) and 0 <= prediction < len(names)):
            raise ValueError('Class index out of range')
        matrix[target][prediction] += 1
    per_class = {}
    for i, name in enumerate(names):
        tp = matrix[i][i]
        support = sum(matrix[i])
        predicted = sum(row[i] for row in matrix)
        precision = tp / predicted if predicted else 0.
        recall = tp / support if support else 0.
        f1 = 2*precision*recall/(precision+recall) if precision+recall else 0.
        per_class[name] = dict(precision=precision, recall=recall, f1=f1, support=support)
    return {'accuracy': sum(matrix[i][i] for i in range(len(names))) / len(targets),
            'macro_f1': statistics.mean(v['f1'] for v in per_class.values()),
            'balanced_accuracy': statistics.mean(v['recall'] for v in per_class.values()),
            'per_class': per_class, 'class_names': names, 'confusion_matrix': matrix,
            'confusion_matrix_axes': 'rows=true, columns=predicted'}


def inspect_dataset(data):
    mapping = data.parent/'class_mapping.json'
    if not mapping.is_file() or json.loads(mapping.read_text(encoding='utf-8'))['class_to_id'] != dict(zip(CLASSES, range(4))):
        raise ValueError('Missing/inconsistent class_mapping.json; run prepare_dataset.py first')
    manifest_file = data.parent/'manifest.json'
    records = json.loads(manifest_file.read_text(encoding='utf-8'))
    expected = {Path(r['destination']).as_posix(): r for r in records}
    seen, found, counts, fingerprint = {}, set(), {}, hashlib.sha256()
    for split in ('train', 'val', 'test'):
        directory = data/split
        if not directory.is_dir() or sorted(p.name for p in directory.iterdir() if p.is_dir()) != CLASSES:
            raise ValueError(f'{directory} must contain exactly {CLASSES}')
        counts[split] = {}
        for name in CLASSES:
            paths = sorted(p for p in (directory/name).rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS)
            if not paths:
                raise ValueError(f'Empty split/class: {split}/{name}')
            counts[split][name] = len(paths)
            for path in paths:
                rel = path.relative_to(data.parent).as_posix()
                record = expected.get(rel)
                if not record or record['split'] != split or record['class_name'] != name:
                    raise ValueError(f'Image does not match preparation manifest: {path}')
                identity = record['hash']
                if identity in seen:
                    raise ValueError(f'Duplicate prepared image: {path} and {seen[identity]}')
                seen[identity] = str(path)
                found.add(rel)
                # Record actual file bytes, not platform-specific timestamps or absolute paths.
                checksum = hashlib.sha256()
                with path.open('rb') as handle:
                    for block in iter(lambda: handle.read(1024*1024), b''):
                        checksum.update(block)
                fingerprint.update(rel.encode() + checksum.digest())
    if found != set(expected):
        raise ValueError('Prepared files and manifest differ; missing or unexpected images')
    return {'counts': counts, 'sha256': fingerprint.hexdigest(), 'class_to_id': dict(zip(CLASSES, range(4)))}


def runtime_classes():
    import torch
    from torchvision import transforms as T
    from ultralytics.models.yolo.classify import ClassificationTrainer, ClassificationValidator

    class MacroValidator(ClassificationValidator):
        def build_dataset(self, img_path):
            dataset = super().build_dataset(img_path)
            size = self.args.imgsz
            dataset.torch_transforms = T.Compose([T.Resize(round(size/.875)), T.CenterCrop(size), T.ToTensor()])
            return dataset

        def get_stats(self):
            stats = super().get_stats()
            targets = torch.cat(self.targets).view(-1).cpu().tolist()
            predictions = torch.cat(self.pred)[:, 0].cpu().tolist()
            report = classification_metrics(targets, predictions)
            write_json(self.save_dir/'classification_metrics.json', report)
            with (self.save_dir/'confusion_matrix.csv').open('w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['true/predicted', *CLASSES])
                writer.writerows([name, *row] for name, row in zip(CLASSES, report['confusion_matrix']))
            return {**stats, 'metrics/macro_f1': report['macro_f1'],
                    'metrics/balanced_accuracy': report['balanced_accuracy'], 'fitness': report['macro_f1']}

    class BaselineTrainer(ClassificationTrainer):
        def build_dataset(self, img_path, mode='train', batch=None):
            dataset = super().build_dataset(img_path, mode, batch)
            size = self.args.imgsz
            dataset.torch_transforms = T.Compose([
                T.Resize(round(size/.875)), T.CenterCrop(size), T.ToTensor()])
            return dataset

        def get_validator(self):
            self.loss_names = ['loss']
            return MacroValidator(self.test_loader, self.save_dir, args=copy(self.args), _callbacks=self.callbacks)

    return BaselineTrainer, MacroValidator


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, default=ROOT/'data/prepared/classification')
    parser.add_argument('--output', type=Path, default=ROOT/'runs/classifier')
    parser.add_argument('--model', default='yolo11n-cls.pt')
    parser.add_argument('--epochs', type=int, default=80)
    parser.add_argument('--batch', type=int, default=32)
    parser.add_argument('--imgsz', type=int, default=224)
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--device', default='0', help='One CUDA device, cpu or mps; no DDP')
    parser.add_argument('--seeds', type=int, nargs='+', default=[42])
    parser.add_argument('--lr', type=float, default=.001)
    parser.add_argument('--patience', type=int, default=20)
    parser.add_argument('--dry-run', action='store_true', help='Validate data and print plan without ML dependencies')
    args = parser.parse_args()
    if min(args.epochs, args.batch, args.imgsz) < 1 or args.workers < 0 or args.lr <= 0 or args.patience < 0:
        parser.error('Invalid training parameters')
    if ',' in args.device or int(os.environ.get('WORLD_SIZE', '1')) > 1:
        parser.error('Use a single GPU/CPU process so sampling stays reproducible')
    if len(set(args.seeds)) != len(args.seeds) or any(seed < 0 for seed in args.seeds):
        parser.error('Seeds must be distinct nonnegative integers')
    if not args.model.endswith('.pt'):
        parser.error('Transfer learning requires pretrained .pt weights, not a model YAML')
    data, output = args.data.resolve(), args.output.resolve()
    audit = inspect_dataset(data)
    experiments = ['baseline']
    plan = {**vars(args), 'data': str(data), 'output': str(output), 'dataset': audit,
            'selection_metric': 'validation macro_f1', 'ultralytics_required': ULTRALYTICS_VERSION,
            'experiments': experiments}
    print(json.dumps(plan, ensure_ascii=False, indent=2))
    if args.dry_run:
        return 0
    if output.exists() and any(output.iterdir()):
        raise ValueError(f'Refusing to overwrite prior experiment results: {output}')
    try:
        import torch
        import torchvision
        import ultralytics
        from ultralytics import YOLO
    except ImportError as error:
        raise RuntimeError('Install scripts/requirements-classifier.txt and the appropriate PyTorch build first') from error
    if ultralytics.__version__ != ULTRALYTICS_VERSION:
        raise RuntimeError(f'This trainer targets ultralytics=={ULTRALYTICS_VERSION}; found {ultralytics.__version__}')
    baseline, validator = runtime_classes()
    output.mkdir(parents=True, exist_ok=True)
    write_json(output/'experiment_plan.json', plan)
    write_json(output/'environment.json', {'python': sys.version, 'platform': platform.platform(),
               'torch': torch.__version__, 'torchvision': torchvision.__version__,
               'ultralytics': ultralytics.__version__, 'cuda': torch.version.cuda})
    rows = []
    for seed in args.seeds:
        for experiment in experiments:
            name = f'{experiment}_seed{seed}'
            model = YOLO(args.model, task='classify')
            model.train(trainer=baseline,
                        data=str(data), project=str(output), name=name, exist_ok=False,
                        epochs=args.epochs, batch=args.batch, imgsz=args.imgsz, workers=args.workers,
                        device=args.device, seed=seed, deterministic=True, pretrained=True,
                        optimizer='AdamW', lr0=args.lr, patience=args.patience,
                        auto_augment=None, erasing=0., cache=False, amp=False,
                        save=True, plots=True, val=True, split='val')
            best = Path(model.trainer.best)
            if not best.is_file():
                raise RuntimeError(f'No best checkpoint produced: {best}')
            checkpoint = YOLO(str(best), task='classify')
            if [checkpoint.names[i] for i in range(4)] != CLASSES:
                raise RuntimeError('Checkpoint class mapping differs from prepared data')
            for split in ('val', 'test'):
                metrics_dir = output/name/f'evaluation_{split}'
                checkpoint.val(validator=validator, data=str(data), split=split, imgsz=args.imgsz,
                               batch=args.batch, device=args.device, workers=args.workers,
                               project=str(output/name), name=f'evaluation_{split}', exist_ok=True, plots=True)
                report = json.loads((metrics_dir/'classification_metrics.json').read_text(encoding='utf-8'))
                rows.append({'experiment': experiment, 'seed': seed, 'split': split,
                             'best_pt': str(best), **{k: report[k] for k in ['accuracy', 'macro_f1', 'balanced_accuracy']}})
            write_json(output/'metrics.json', rows)
            del model, checkpoint
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
    with (output/'metrics.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    summary = {}
    for experiment in experiments:
        for split in ('val', 'test'):
            subset = [r for r in rows if r['experiment'] == experiment and r['split'] == split]
            summary[f'{experiment}/{split}'] = {key: {
                'mean': statistics.mean(r[key] for r in subset),
                'sample_std': statistics.stdev(r[key] for r in subset) if len(subset) > 1 else None,
                'n': len(subset)} for key in ['accuracy', 'macro_f1', 'balanced_accuracy']}
    write_json(output/'summary.json', summary)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, RuntimeError) as error:
        raise SystemExit(f'Training failed: {error}')
