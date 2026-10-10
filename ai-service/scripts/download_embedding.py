"""Download FastEmbed's published Chinese BGE archive; --direct ignores OS proxies."""
import argparse
import hashlib
import json
import tarfile
import urllib.request
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
    with opener.open(URL, timeout=60) as response, partial.open('wb') as output:
        while block := response.read(1024 * 1024):
            output.write(block)
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
