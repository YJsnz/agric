"""Freeze the evaluated v13 checkpoint by byte-for-byte copy only."""
import hashlib
import json
import shutil
from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[1]
REPORTS=ROOT/'reports'
OUT=ROOT/'models/jujube'
SOURCE=ROOT/'runs/jujube_leaf_yolo11n_cls_v13/weights/best.pt'
NAME='jujube_leaf_yolo11n_cls_v1'
SEMANTICS={'healthy':'健康叶片视觉状态','anthracnose':'炭疽病类视觉表现',
           'powdery_mildew':'白粉病类视觉表现','insect_damage':'虫害损伤视觉表现','yellow_leaf':'黄化视觉表现'}

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def main():
    metrics_path=REPORTS/'model_a_test_metrics.json'
    metrics=json.loads(metrics_path.read_text(encoding='utf-8'))
    args=yaml.safe_load((SOURCE.parents[1]/'args.yaml').read_text(encoding='utf-8'))
    protected=[p for p in REPORTS.rglob('*') if p.is_file() and '.ultralytics' not in p.parts and '.matplotlib' not in p.parts]
    protected += [p for p in (ROOT/'runs/jujube_leaf_yolo11n_cls_v13').rglob('*') if p.is_file()]
    protected += [p for p in (ROOT/'data/jujube_leaf_classifier_v3_final').rglob('*') if p.is_file()]
    print('Snapshotting evaluation, run and final dataset',flush=True)
    before={p:sha(p) for p in protected}
    source_hash=sha(SOURCE)
    assert source_hash==metrics['model_sha256'],'Source does not match evaluated model'
    assert Path(metrics['model_path']).resolve()==SOURCE.resolve()
    assert metrics['ultralytics_version']=='8.3.40'
    OUT.mkdir(parents=True,exist_ok=True)
    weight=OUT/(NAME+'.pt'); config_path=OUT/(NAME+'.json'); card_path=OUT/'JUJUBE_LEAF_MODEL_A_V1_CARD.md'
    sums=OUT/'SHA256SUMS.txt'; report_path=REPORTS/'JUJUBE_MODEL_A_V1_FREEZE_REPORT.md'
    for p in (weight,config_path,card_path,sums,report_path):
        if p.exists(): raise RuntimeError('Refusing to overwrite frozen artifact: '+str(p))
    shutil.copyfile(SOURCE,weight)
    frozen_hash=sha(weight)
    if source_hash!=frozen_hash: raise RuntimeError('freeze_success=false: SHA256 mismatch')
    overall=metrics['overall']; train=metrics['training']
    config=dict(model_name=NAME,model_role='jujube_leaf_visual_symptom_classifier',version='v1',status='frozen',
        freeze_date='2026-10-08',framework='Ultralytics',ultralytics_version='8.3.40',architecture='YOLO11n-cls',task='classification',
        imgsz=224,classes=list(SEMANTICS),class_semantics_zh=SEMANTICS,
        class_index_policy='Read integer-to-class mapping from checkpoint.names; classes is a semantic list, not a logit index mapping.',
        train_size=2288,val_size=456,test_size=452,max_epochs=train['max_epochs'],actual_epochs=train['epochs_completed'],
        best_epoch=train['best_epoch'],early_stopping=train['early_stopping_inferred'],early_stopping_provenance=train['early_stopping_provenance'],
        patience=train['patience'],best_val_top1=train['best_val_top1'],
        model_sha256=source_hash,source_model_path=str(SOURCE.relative_to(ROOT)),model_path=str(weight.relative_to(ROOT)),
        dataset_version='jujube_leaf_classifier_v3_final',parameter_count=metrics['parameter_count'],
        inference=metrics['inference'],diagnostic_use=False,output_type='visual observation / visual candidate',
        score_semantics='model classification score, not disease diagnosis probability',
        prohibited_yellow_leaf_interpretations=['缺氮','缺铁','盐害','某具体病害'],
        required_risk_context=['环境','生育阶段','管理信息','KG','GraphRAG'],
        per_class_metrics=overall['per_class'],source_wise_metrics=metrics['source_wise'],
        evaluation_metrics_path=str(metrics_path.relative_to(ROOT)),evaluation_metrics_sha256=sha(metrics_path))
    for key in ('accuracy','macro_precision','macro_recall','macro_f1','balanced_accuracy','weighted_f1'):
        config['test_'+key]=overall[key]
    config_path.write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
    lines=['# 金丝小枣视觉 Model A v1 — Model Card','',
      '冻结日期：2026-10-08。正式 baseline，仅用于叶片视觉症状分类，不是沧州本地田间确诊模型。',
      '## 来源与可追溯性',f'- 正式训练 run：`{SOURCE.parents[1].relative_to(ROOT)}`。未使用 v1/v12 run。',
      f'- 正式副本：`{weight.relative_to(ROOT)}`；仅文件复制，不重新保存 checkpoint。',f'- SHA256：`{source_hash}`。',
      '- 公开数据来源：Mendeley `yxmf3cd865`、`58py9f3nsy`。两个来源可能共享采集机构/贡献者，不等于独立本地田间样本。',
      '- 正式评估数据版本：`jujube_leaf_classifier_v3_final`；Train 2288 / Val 456 / Test 452。',
      '- 数据按清单保留既有划分；冲突已排除、已确认近重复按组绑定。仍有 14614 对未确认近重复候选风险，不宣称全部同源风险已消除。',
      '- 本地正式评估时历史 JPEG 规范化清单缺失；实际测试输入哈希记录于 model_a_test_input_integrity.csv。该限制随版本保留。',
      '## 训练与固定推理',
      f'- YOLO11n-cls，参数量 {metrics["parameter_count"]:,}，Ultralytics 8.3.40，imgsz=224。',
      f'- optimizer={args["optimizer"]}，batch={args["batch"]}，lr0={args["lr0"]}，seed={args["seed"]}。',
      '- max epochs=80，actual epochs=49，best epoch=29，patience=20，best Val Top-1=82.675%。',
      '- early stopping=true：依据 results.csv 与 args.yaml 推断，未读取服务器终止日志。完整训练配置保留在原 run。',
      '- 固定 argmax 分类，不调阈值。评估采用 OpenCV cv2.imread 与官方 ClassificationDataset 相同读取方式，224 Resize + CenterCrop、crop_fraction=1.0、无推理增强。',
      '- 后端必须读取 checkpoint.names 获取输出索引，不得把配置 classes 列表次序当模型 logit 索引。',
      '## 正式 Test','| 指标 | 值 |','|---|---:|']
    for key in ('accuracy','macro_precision','macro_recall','macro_f1','balanced_accuracy','weighted_f1'):
        lines.append(f'| {key} | {overall[key]:.6f} |')
    lines+=['','| 类别 | support | P | R | F1 |','|---|---:|---:|---:|---:|']
    for c,m in overall['per_class'].items(): lines.append(f'| {c} | {m["support"]} | {m["precision"]:.4f} | {m["recall"]:.4f} | {m["f1"]:.4f} |')
    lines+=['','Top-5=1.0，因总类别数为5，无实际区分意义。',
      '## 已知限制',
      '- powdery_mildew 是主要弱类：Test support=28，Recall=53.57%，F1=0.5556。',
      '- 最大混淆：yellow_leaf → anthracnose=17张，不能将黄化直接解释为炭疽病。',
      '- 来源间性能差异/domain gap：yxmf3cd865 Accuracy=86.75%（151张），58py9f3nsy=78.41%（301张）。该差异不构成因果解释。',
      '- 高置信度错误≥0.8：25张；≥0.9：9张。模型得分不是确诊概率。',
      '- 当前模型不是沧州本地田间确诊模型；尚不能证明跨品种、光照、拍摄背景和生育期泛化能力。',
      '## 固定类别语义']
    lines += [f'- `{c}`：{s}。' for c,s in SEMANTICS.items()]
    lines+=['','yellow_leaf 禁止直接翻译为缺氮、缺铁、盐害或具体病害。healthy 也不证明没有潜在病害。',
      '## 后续 KG / GraphRAG 接入原则',
      '仅传递 visual observation / visual candidate、分类得分及模型版本；结合环境、生育阶段、管理信息和 KG/GraphRAG 检索证据生成风险研判。缺失上下文保持未知，不从作物名推断地区，不把视觉标签作为病害事实写入 KG。',
      '保留证据来源及适用范围；候选与确诊分离。不得凭视觉类别直接给出缺素、盐害或具体病害确诊，亦不得把模型分数转换成诊断概率。',
      '本阶段未接入后端、未启动 v2 实验、未训练、未调参。完整逐图结果、置信度错误和混淆矩阵保留在 reports。','']
    card_path.write_text('\n'.join(lines),encoding='utf-8')
    sums.write_text('\n'.join(f'{sha(p)}  {p.relative_to(ROOT).as_posix()}' for p in (SOURCE,weight,config_path,card_path))+'\n',encoding='utf-8')
    assert all(sha(p)==h for p,h in before.items()),'Protected content changed'
    assert sha(SOURCE)==sha(weight)==source_hash
    report=['# Model A v1 冻结报告','',f'source best.pt = {SOURCE}',f'frozen model = {weight}',
        f'source SHA256 = {source_hash}',f'frozen SHA256 = {sha(weight)}','SHA256 match = true',
        'dataset version = jujube_leaf_classifier_v3_final',f'Accuracy = {overall["accuracy"]:.8f}',
        f'Macro-F1 = {overall["macro_f1"]:.8f}',f'Balanced Accuracy = {overall["balanced_accuracy"]:.8f}',
        'model card generated = true','config generated = true','freeze_success = true','',
        '源权重、正式数据和已有评估报告/预测/混淆矩阵均已在冻结前后进行全文件 SHA256 核对，内容未改变。',
        '未删除历史 run；未重新保存权重、训练或调参。配置保留完整精度指标，不手工覆盖评估结果。',
        'SHA256SUMS.txt 的路径以项目根目录为基准，包含源权重、副本、JSON 和 Model Card。冻结为可追溯发布约定及哈希核验，不声称操作系统层面禁止写入。','']
    report_path.write_text('\n\n'.join(report),encoding='utf-8')
    print('\n'.join(report[:13]),flush=True)

if __name__=='__main__':main()
