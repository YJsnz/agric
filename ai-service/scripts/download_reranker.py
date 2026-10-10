"""Fetch BAAI's ModelScope ONNX release; keep download provenance."""
import hashlib
import json
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/'models/reranker'
BASE='https://modelscope.cn/models/BAAI/bge-reranker-base/resolve/master/'
if __name__=='__main__':
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
    ROOT.mkdir(parents=True,exist_ok=True)
    records=[]
    for name in ['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','sentencepiece.bpe.model','onnx/model.onnx']:
        target=ROOT/name;target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists():
            temp=target.with_suffix('.part')
            with opener.open(BASE+name,timeout=60) as r,temp.open('wb') as f:
                while block:=r.read(1024*1024):f.write(block)
            temp.replace(target)
        digest=hashlib.file_digest(target.open('rb'),'sha256').hexdigest()
        records.append({'file':name,'url':BASE+name,'bytes':target.stat().st_size,'sha256':digest})
        print(name,target.stat().st_size,flush=True)
    (ROOT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
