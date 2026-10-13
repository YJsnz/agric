"""Download FastEmbed's published Chinese BGE archive; --direct ignores OS proxies."""
import argparse
import hashlib
import json
import tarfile
import urllib.request
import urllib.error
from pathlib import Path

URL = 'https://storage.googleapis.com/qdrant-fastembed/fast-bge-small-zh-v1.5.tar.gz'
ROOT = Path(__file__).resolve().parents[1] / 'models/embedding'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--direct', action='store_true')
    args = parser.parse_args()
    ROOT.mkdir(parents=True, exist_ok=True)
    target = ROOT / 'bge-small-zh-v1.5.tar.gz'
    partial = target.with_suffix('.part')
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({})) if args.direct else urllib.request.build_opener()
    try:
        with opener.open(URL, timeout=60) as response, partial.open('wb') as output:
            while block := response.read(1024 * 1024):
                output.write(block)
    except (urllib.error.URLError,TimeoutError):
        # Same model source registered by FastEmbed; use a fixed HF revision if the archive host is blocked.
        revision='46fbe35fd4374a00fee7de77dfddaeb6dd6a2c59'
        directory=ROOT/'hf-bge-small-zh-v1.5'
        directory.mkdir(parents=True,exist_ok=True)
        checks=[]
        for name in ['model_optimized.onnx','config.json','ort_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','vocab.txt']:
            url=f'https://huggingface.co/Qdrant/bge-small-zh-v1.5/resolve/{revision}/{name}'
            destination=directory/name
            with opener.open(url,timeout=120) as response,destination.with_suffix(destination.suffix+'.part').open('wb') as output:
                while block:=response.read(1024*1024):output.write(block)
            destination.with_suffix(destination.suffix+'.part').replace(destination)
            checks.append({'path':name,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()})
        (ROOT/'download.json').write_text(json.dumps({'model':'BAAI/bge-small-zh-v1.5','repository':'Qdrant/bge-small-zh-v1.5','revision':revision,'files':checks},indent=2),encoding='utf-8')
        print('BGE downloaded from fixed registered Hugging Face source.')
        return
    partial.replace(target)
    with tarfile.open(target) as archive:
        archive.extractall(ROOT, filter='data')
    (ROOT / 'download.json').write_text(json.dumps({
        'model': 'BAAI/bge-small-zh-v1.5', 'url': URL,
        'archive_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'provenance': 'Archive URL registered by FastEmbed 0.8.0'
    }, indent=2), encoding='utf-8')
    print('BGE model downloaded and extracted.')

if __name__ == '__main__':
    main()
