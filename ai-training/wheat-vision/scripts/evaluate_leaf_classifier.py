"""黄骅旱碱麦 视觉模型A：测试集评估（只评估，不训练、不改数据/标签）。

用法：
    python scripts/evaluate_leaf_classifier.py

说明：
- 递归读取 data/leaf_classifier/test/<class>/*，父目录名即真实标签。
- 使用 runs/wheat_leaf_yolo11n_cls_v1/weights/best.pt，imgsz=224，device=0。
- 本地无 CUDA 时自动回退 CPU（AutoDL GPU 环境会使用 device=0）。
- 模型输出为“视觉类别置信度”，不是病害概率；nitrogen_deficiency 表示“缺氮类视觉表现”，非确诊。
"""
import json
import os
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
from sklearn.metrics import (accuracy_score, balanced_accuracy_score,
                             classification_report, confusion_matrix,
                             precision_recall_fscore_support)
from ultralytics import YOLO

# ----------------------------- 配置 ----------------------------- #
CLASSES = ['healthy', 'rust', 'leaf_spot_blight', 'nitrogen_deficiency']
ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / 'data' / 'leaf_classifier' / 'test'
WEIGHTS = ROOT / 'runs' / 'wheat_leaf_yolo11n_cls_v1' / 'weights' / 'best.pt'
REPORTS = ROOT / 'reports'
IMGSZ = 224
IMG_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}


def resolve_device():
    """优先 device=0；无 CUDA 时回退 CPU（并打印原因）。"""
    want = os.environ.get('YOLO_DEVICE', '0')
    if want != 'cpu' and torch.cuda.is_available():
        return int(want) if want.isdigit() else want
    if want != 'cpu':
        print('[warn] CUDA 不可用，device=0 回退为 cpu（AutoDL GPU 环境将使用 device=0）')
    return 'cpu'


def collect_images():
    if not TEST_DIR.is_dir():
        raise FileNotFoundError('测试集目录不存在: %s' % TEST_DIR)
    items = []
    for c in CLASSES:
        d = TEST_DIR / c
        if not d.is_dir():
            raise FileNotFoundError('缺少类别目录: %s' % d)
        for p in sorted(d.rglob('*')):
            if p.is_file() and p.suffix.lower() in IMG_EXTS:
                items.append((p, c))
    if not items:
        raise RuntimeError('测试集为空')
    return items


def main():
    if not WEIGHTS.is_file():
        raise FileNotFoundError('权重不存在: %s' % WEIGHTS)

    device = resolve_device()
    items = collect_images()
    print('[info] test images: %d  device: %s  imgsz: %d' % (len(items), device, IMGSZ))

    model = YOLO(str(WEIGHTS))
    names = model.names  # {idx: name}
    idx2name = {int(k): v for k, v in (names.items() if isinstance(names, dict) else enumerate(names))}
    print('[info] model.names = %s' % idx2name)

    rows = []
    for i, (p, true_label) in enumerate(items, 1):
        res = model.predict(source=str(p), imgsz=IMGSZ, device=device, verbose=False)[0]
        probs = res.probs
        pred_idx = int(probs.top1)
        conf = float(probs.top1conf)
        pred_label = idx2name.get(pred_idx, str(pred_idx))
        rows.append(dict(image_path=p.relative_to(ROOT).as_posix(),
                         true_label=true_label,
                         predicted_label=pred_label,
                         confidence=round(conf, 6),
                         correct=(pred_label == true_label)))
        if i % 25 == 0 or i == len(items):
            print('[info] predicted %d/%d' % (i, len(items)))

    df = pd.DataFrame(rows, columns=['image_path', 'true_label', 'predicted_label', 'confidence', 'correct'])
    y_true = df['true_label'].tolist()
    y_pred = df['predicted_label'].tolist()

    # --------------------------- 指标 --------------------------- #
    acc = accuracy_score(y_true, y_pred)
    bal_acc = balanced_accuracy_score(y_true, y_pred)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, labels=CLASSES, average='macro', zero_division=0)
    per_p, per_r, per_f1, per_support = precision_recall_fscore_support(
        y_true, y_pred, labels=CLASSES, average=None, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=CLASSES)

    per_class = {c: dict(precision=float(per_p[i]), recall=float(per_r[i]),
                         f1=float(per_f1[i]), support=int(per_support[i]))
                 for i, c in enumerate(CLASSES)}

    correct_n = int(df['correct'].sum())
    wrong_n = int((~df['correct']).sum())

    # 最容易混淆的两个类别（双向合计最大的类别对）
    n_cls = len(CLASSES)
    best = dict(pair=None, total=-1, ab=0, ba=0)
    for i in range(n_cls):
        for j in range(i + 1, n_cls):
            total = int(cm[i, j] + cm[j, i])
            if total > best['total']:
                best = dict(pair=(CLASSES[i], CLASSES[j]), total=total,
                            ab=int(cm[i, j]), ba=int(cm[j, i]))
    conf_pair = dict(class_a=best['pair'][0], class_b=best['pair'][1],
                     total=best['total'],
                     a_as_b=best['ab'], b_as_a=best['ba'])

    # --------------------------- 保存产物 --------------------------- #
    REPORTS.mkdir(parents=True, exist_ok=True)

    metrics = dict(
        model=str(WEIGHTS.relative_to(ROOT).as_posix()),
        test_dir=str(TEST_DIR.relative_to(ROOT).as_posix()),
        imgsz=IMGSZ,
        device=str(device),
        class_order=CLASSES,
        n_total=len(df),
        correct=correct_n,
        incorrect=wrong_n,
        accuracy=float(acc),
        macro_precision=float(macro_p),
        macro_recall=float(macro_r),
        macro_f1=float(macro_f1),
        balanced_accuracy=float(bal_acc),
        per_class=per_class,
        confusion_matrix=cm.tolist(),
        most_confused_pair=conf_pair,
        nitrogen_deficiency_correct=int(cm[CLASSES.index('nitrogen_deficiency'),
                                          CLASSES.index('nitrogen_deficiency')]),
        nitrogen_deficiency_recall=float(per_r[CLASSES.index('nitrogen_deficiency')]),
        notes=('confidence 为视觉类别置信度，不是病害概率；'
               'nitrogen_deficiency 表示“缺氮类视觉表现”，非确诊缺氮。'),
    )
    (REPORTS / 'model_a_test_metrics.json').write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2), encoding='utf-8')

    df.to_csv(REPORTS / 'model_a_predictions.csv', index=False, encoding='utf-8-sig')
    df[~df['correct']].drop(columns=['correct']).to_csv(
        REPORTS / 'model_a_misclassified.csv', index=False, encoding='utf-8-sig')

    rep = classification_report(y_true, y_pred, labels=CLASSES, target_names=CLASSES,
                                digits=4, zero_division=0, output_dict=True)
    pd.DataFrame(rep).transpose().to_csv(
        REPORTS / 'model_a_classification_report.csv', encoding='utf-8-sig',
        index_label='label')

    # 混淆矩阵图
    fig, ax = plt.subplots(figsize=(7.2, 6.0))
    im = ax.imshow(cm, cmap='Blues')
    ax.set_xticks(range(len(CLASSES)))
    ax.set_yticks(range(len(CLASSES)))
    ax.set_xticklabels(CLASSES, rotation=30, ha='right')
    ax.set_yticklabels(CLASSES)
    ax.set_xlabel('Predicted label (visual class)')
    ax.set_ylabel('True label')
    ax.set_title('Model A test confusion matrix (n=%d)' % len(df))
    thr = cm.max() / 2.0 if cm.max() else 0.5
    for i in range(len(CLASSES)):
        for j in range(len(CLASSES)):
            ax.text(j, i, str(cm[i, j]), ha='center', va='center',
                    color='white' if cm[i, j] > thr else 'black', fontsize=11)
    fig.colorbar(im, ax=ax)
    fig.tight_layout()
    fig.savefig(REPORTS / 'model_a_confusion_matrix.png', dpi=150)
    plt.close(fig)

    # --------------------------- 报告 --------------------------- #
    def pct(x):
        return '%.2f%%' % (x * 100)

    lines = []
    lines.append('# 黄骅旱碱麦 视觉模型A 测试集评估报告\n')
    lines.append('评估对象：`%s`；测试集：`%s` 共 %d 张；imgsz=%d，device=%s。\n'
                 % (metrics['model'], metrics['test_dir'], len(df), IMGSZ, device))
    lines.append('> 说明：YOLO 输出的 confidence 是**视觉类别置信度**，不是“病害概率”。'
                 '`nitrogen_deficiency` 仅表示“**缺氮类视觉表现**”，不等于确诊缺氮。\n')
    lines.append('## 1. Test Accuracy\n\n**%.4f（%s）** — 正确 %d / 共 %d\n'
                 % (acc, pct(acc), correct_n, len(df)))
    lines.append('## 2. Macro-F1\n\n**%.4f**\n' % macro_f1)
    lines.append('## 3. Balanced Accuracy\n\n**%.4f**\n' % bal_acc)
    lines.append('## 4. 每类 Precision / Recall / F1 / Support\n')
    lines.append('| 类别 | Precision | Recall | F1-score | Support |')
    lines.append('| --- | ---: | ---: | ---: | ---: |')
    for c in CLASSES:
        m = per_class[c]
        lines.append('| %s | %.4f | %.4f | %.4f | %d |' % (c, m['precision'], m['recall'], m['f1'], m['support']))
    lines.append('| **macro avg** | %.4f | %.4f | %.4f | %d |' % (macro_p, macro_r, macro_f1, len(df)))
    lines.append('\n## 5. Confusion Matrix\n')
    lines.append('![confusion matrix](model_a_confusion_matrix.png)\n')
    lines.append('| 真实\\预测 | %s |' % ' | '.join(CLASSES))
    lines.append('| --- | %s |' % ' | '.join(['---:'] * len(CLASSES)))
    for i, c in enumerate(CLASSES):
        lines.append('| **%s** | %s |' % (c, ' | '.join(str(int(v)) for v in cm[i])))
    lines.append('\n## 6. 错误图片数量\n')
    lines.append('- 总正确：**%d**；总错误：**%d**（错误清单见 `model_a_misclassified.csv`）\n' % (correct_n, wrong_n))
    lines.append('## 7. nitrogen_deficiency 14 张中正确张数\n')
    nd_correct = metrics['nitrogen_deficiency_correct']
    lines.append('- 正确 **%d / 14**，错误 %d 张。\n' % (nd_correct, 14 - nd_correct))
    lines.append('## 8. nitrogen_deficiency Recall\n')
    lines.append('- Recall = **%.4f**（缺氮类视觉表现的检出率）\n' % metrics['nitrogen_deficiency_recall'])
    lines.append('## 9. 最容易混淆的两个类别\n')
    lines.append('- 类别对：**%s ↔ %s**，双向合计 **%d** 次（%s→%s %d 次；%s→%s %d 次）。\n'
                 % (conf_pair['class_a'], conf_pair['class_b'], conf_pair['total'],
                    conf_pair['class_a'], conf_pair['class_b'], conf_pair['a_as_b'],
                    conf_pair['class_b'], conf_pair['class_a'], conf_pair['b_as_a']))
    lines.append('## 10. 是否建议进入部署阶段\n')
    deploy = (bal_acc >= 0.8 and macro_f1 >= 0.8 and metrics['nitrogen_deficiency_recall'] >= 0.5)
    if deploy:
        lines.append('- **可谨慎进入部署（试运行）**：整体与各类指标达到基本可用水平，'
                     '但 nitrogen_deficiency 样本仅 14 张，须持续监控并明确“视觉类别/缺氮类视觉表现”的表述边界。\n')
    else:
        lines.append('- **暂不建议直接进入部署**：存在指标短板（尤其少数类 nitrogen_deficiency '
                     '样本仅 14 张且召回不足），建议先补充数据、优化类别不均衡与置信度阈值，再复评。\n')
    lines.append('- 依据：Balanced Accuracy=%.4f，Macro-F1=%.4f，nitrogen_deficiency Recall=%.4f。\n'
                 % (bal_acc, macro_f1, metrics['nitrogen_deficiency_recall']))
    lines.append('- 风险提示：模型只输出视觉类别；`nitrogen_deficiency` 不可表述为“确诊缺氮”，'
                 '实际诊断需结合土壤/植株理化检测。\n')

    (REPORTS / 'MODEL_A_EVALUATION.md').write_text('\n'.join(lines), encoding='utf-8')

    print(json.dumps(metrics, ensure_ascii=False, indent=2))
    print('[done] reports written to %s' % REPORTS)


if __name__ == '__main__':
    main()