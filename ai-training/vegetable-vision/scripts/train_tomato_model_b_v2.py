"""Opt-in, single-device V2 training. Default invocation performs no training."""
import argparse
import json
import math
import os
import csv
import hashlib
from collections import Counter
from copy import copy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('YOLO_CONFIG_DIR', str(ROOT/'reports/.evaluation_ultralytics'))
EXPECTED = dict(green=7949, breakers=119, turning=432, pink=322, light_red=1120, red=105)
DATA_ROOT = ROOT/'data/tomato_ripeness_classifier_v2'
EXCLUDED = 'train__20260416_123459_000909__inst_7450__cls_0.png'


def check_data(base):
    """Verify exact Train/Val membership and bytes, allowing only the known V1 extra."""
    for split in ('train','val'):
        if not (base/split).is_dir(): raise FileNotFoundError(f'Missing existing data directory: {base/split}')
    with (ROOT/'configs/tomato_model_b_v2_train_val.csv').open(encoding='utf-8-sig') as f:
        rows=list(csv.DictReader(f))
    expected={r['relative_path']:r['sha256'] for r in rows}
    actual={p.relative_to(base).as_posix() for s in ('train','val') for p in (base/s).rglob('*') if p.is_file()}
    extra='train/green/'+EXCLUDED
    if actual-expected.keys() not in (set(),{extra}) or expected.keys()-actual:
        raise ValueError('Train/Val membership mismatch; only the reviewed pair_017 Train extra is permitted')
    for rel,digest in expected.items():
        if hashlib.sha256((base/rel).read_bytes()).hexdigest()!=digest:
            raise ValueError(f'Image hash mismatch: {rel}')
    counts=Counter(r['relative_path'].split('/')[0] for r in rows)
    assert counts=={'train':10047,'val':1936}
    return dict(effective_counts=dict(counts),excluded_at_load=extra in actual,hashes_verified=True)


def sampling_plan(counts):
    # Per-image weight, not class probability: P(class)=n_c*w_c/sum(n*w).
    z = sum(math.sqrt(n) for n in counts.values())
    n = sum(counts.values())
    return {c: dict(count=v, sample_weight=1/math.sqrt(v),
                   normalized_per_image_probability=1/math.sqrt(v)/z,
                   effective_class_probability=math.sqrt(v)/z,
                   expected_draws_per_epoch=n*math.sqrt(v)/z)
            for c,v in counts.items()}


import torch
from PIL import Image
from torch.utils.data import DataLoader, WeightedRandomSampler
from ultralytics.data.dataset import ClassificationDataset
from ultralytics.data.build import seed_worker
from ultralytics.models.yolo.classify.train import ClassificationTrainer
from ultralytics.models.yolo.classify.val import ClassificationValidator

class FiniteLoader(DataLoader):
    def reset(self):
        # Each __iter__ starts a fresh finite epoch; compatible with trainer reset hook.
        pass


class AuditedSampler(WeightedRandomSampler):
    def __iter__(self):
        indices = list(super().__iter__())
        self.last_draw_count = len(indices)
        self.last_unique_count = len(set(indices))
        assert len(indices) == 10047
        return iter(indices)


class ReadOnlyDataset(ClassificationDataset):
    def verify_images(self):
        # Unlike stock verify_image, never repair JPEGs or write .cache files.
        if Path(self.root).name=='train':
            self.samples=[s for s in self.samples if Path(s[0]).name!=EXCLUDED]
        for path, _ in self.samples:
            with Image.open(path) as im:
                im.verify()
        return self.samples

class MacroValidator(ClassificationValidator):
    def get_stats(self):
        from sklearn.metrics import precision_recall_fscore_support
        stats = super().get_stats()
        true = torch.cat(self.targets).numpy().reshape(-1)
        pred = torch.cat(self.pred)[:,0].numpy()
        p,r,f,n = precision_recall_fscore_support(true,pred,labels=range(self.nc),zero_division=0)
        stats['metrics/macro_f1'] = float(f.mean())
        stats['metrics/balanced_accuracy'] = float(r.mean())
        for i,name in self.names.items():
            stats[f'metrics/{name}_recall'] = float(r[i])
            stats[f'metrics/{name}_f1'] = float(f[i])
        stats['fitness'] = float(f.mean())
        return stats

    def get_dataloader(self, dataset_path, batch_size):
        assert Path(dataset_path).resolve() == (DATA_ROOT/'val').resolve()
        ds = ReadOnlyDataset(dataset_path,self.args,augment=False,prefix='val')
        return FiniteLoader(ds,batch_size=batch_size,shuffle=False,num_workers=self.args.workers)

class WeightedTrainer(ClassificationTrainer):
    def get_dataloader(self, dataset_path, batch_size=16, rank=-1, mode='train'):
        if rank != -1: raise ValueError('V2 supports single-device training only; DDP requires a separate sampler design')
        assert mode in ('train','val')
        assert Path(dataset_path).resolve() == (DATA_ROOT/mode).resolve()
        assert self.args.cache is False and self.args.fraction == 1
        ds = ReadOnlyDataset(dataset_path,self.args,augment=mode=='train',prefix=mode)
        generator = torch.Generator().manual_seed(self.args.seed)
        sampler = None
        if mode=='train':
            counts = Counter(int(s[1]) for s in ds.samples)
            named = {ds.base.classes[i]:v for i,v in counts.items()}
            assert named == EXPECTED
            weights = [1/math.sqrt(counts[int(s[1])]) for s in ds.samples]
            sampler = AuditedSampler(weights,len(ds),replacement=True,generator=generator)
            (self.save_dir/'sampling_plan.json').write_text(json.dumps(sampling_plan(named),indent=2),encoding='utf-8')
        else:
            self.model.transforms = ds.torch_transforms
        # Finite loader gives precisely N draws each epoch; no infinite-loader prefetch rollover.
        return FiniteLoader(ds,batch_size=min(batch_size,len(ds)),sampler=sampler,shuffle=False,
                          num_workers=self.args.workers,pin_memory=True,drop_last=False,
                          worker_init_fn=seed_worker,
                          generator=torch.Generator().manual_seed(self.args.seed+1))

    def get_validator(self):
        self.loss_names=['loss']
        return MacroValidator(self.test_loader,self.save_dir,args=copy(self.args),_callbacks=self.callbacks)

def components():
    return WeightedTrainer, MacroValidator

def main():
    global DATA_ROOT
    parser=argparse.ArgumentParser()
    parser.add_argument('--train',action='store_true',help='Explicitly start training (otherwise plan only)')
    parser.add_argument('--pretrained',type=Path,help='Local original yolo11n-cls.pt, not V1 best.pt')
    parser.add_argument('--device',default='0')
    parser.add_argument('--data',type=Path,default=DATA_ROOT,help='Existing V1 or V2 image root; no image copying')
    parser.add_argument('--check',action='store_true',help='Environment and Train/Val integrity check only')
    parser.add_argument('--smoke',action='store_true',help='One full epoch in a separate unique run directory')
    opt=parser.parse_args()
    DATA_ROOT=opt.data.resolve()
    if sum([opt.train,opt.smoke,opt.check])>1: parser.error('Choose only one mode')
    if not opt.train and not opt.smoke and not opt.check:
        print(json.dumps(sampling_plan(EXPECTED),indent=2)); return
    import ultralytics
    import yaml
    from ultralytics import YOLO
    if ultralytics.__version__!='8.3.40': raise RuntimeError('Pinned integration requires Ultralytics 8.3.40')
    if ',' in opt.device or int(os.environ.get('WORLD_SIZE','1'))>1: raise ValueError('Single device only')
    if not opt.pretrained or not opt.pretrained.is_file(): raise FileNotFoundError('Provide local original pretrained checkpoint; no automatic download')
    if opt.pretrained.name != 'yolo11n-cls.pt': raise ValueError('Use original yolo11n-cls.pt initialization, not V1 best.pt')
    if opt.device!='cpu' and not torch.cuda.is_available(): raise RuntimeError('CUDA unavailable; use CUDA-enabled existing environment or --device cpu')
    import torchvision, sklearn
    checked=check_data(DATA_ROOT)
    print(json.dumps(dict(**checked,torch=torch.__version__,torchvision=torchvision.__version__,
                         ultralytics=ultralytics.__version__,sklearn=sklearn.__version__,cuda=torch.cuda.is_available(),
                         data=str(DATA_ROOT),pretrained=str(opt.pretrained.resolve())),indent=2))
    if opt.check: return
    from datetime import datetime
    run=ROOT/'runs'/('tomato_ripeness_yolo11n_cls_v2_smoke_'+datetime.now().strftime('%Y%m%d_%H%M%S') if opt.smoke else 'tomato_ripeness_yolo11n_cls_v2')
    if run.exists(): raise FileExistsError('V2 run already exists; refusing overwrite/resume')
    v1=yaml.safe_load((ROOT/'configs/tomato_model_b_v2_base.yaml').read_text(encoding='utf-8'))
    for k in ['save_dir','model','mode','task','cfg']: v1.pop(k,None)
    v1.update(data=str(DATA_ROOT),project=str(ROOT/'runs'),
              name=run.name,device=opt.device,resume=False,exist_ok=False,cache=False,split='val',amp=False,plots=False)
    # Offline GPU FP32: stock AMP check may fetch a detection checkpoint;
    # plots disabled to avoid optional font downloads. Augmentation remains V1.
    # Retain V1 augmentation exactly, including RandAugment and its color operations.
    if opt.smoke:
        v1.update(epochs=1,workers=0,plots=False)
    if opt.device=='cpu': torch.set_num_threads(4)
    # Enforce offline execution, including optional framework checks/download helpers.
    import socket
    def no_network(*args,**kwargs):
        raise RuntimeError('Network disabled: local-only training entry point')
    socket.create_connection=no_network
    socket.socket.connect=no_network
    trainer,_=components()
    model=YOLO(str(opt.pretrained.resolve()))
    audited_epochs=set()
    def epoch_audit(t):
        # final_eval also emits on_fit_epoch_end; its fresh validation metrics are
        # not the fitness used for training checkpoint selection or stopping.
        if t.epoch in audited_epochs:
            return
        sampler=t.train_loader.sampler
        assert isinstance(sampler,WeightedRandomSampler) and sampler.replacement
        assert sampler.num_samples==10047 and sampler.last_draw_count==10047
        metric=t.metrics.get('metrics/macro_f1')
        if metric is not None and t.fitness is not None:
            assert abs(metric-t.fitness)<1e-6
        with (t.save_dir/'integration_audit.jsonl').open('a',encoding='utf-8') as f:
            f.write(json.dumps(dict(epoch=t.epoch+1,draws=sampler.last_draw_count,unique_draws=sampler.last_unique_count,
                                   sampler=type(sampler).__name__,fitness=t.fitness,macro_f1=metric,
                                   patience=t.stopper.patience,best_path=str(t.best)))+'\n')
        audited_epochs.add(t.epoch)
    model.add_callback('on_fit_epoch_end',epoch_audit)
    model.train(trainer=trainer,**v1)
    if opt.smoke:
        (run/'smoke_complete.json').write_text(json.dumps(dict(completed=True,epochs=1,
            best_exists=(run/'weights/best.pt').is_file(),formal_training_started=False),indent=2),encoding='utf-8')


if __name__=='__main__': main()
