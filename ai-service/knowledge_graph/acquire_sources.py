"""Download public evidence, retaining original bytes and hashes. No authentication bypass."""
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'data/botou_yali/evidence'
STANDARDS = {
 'DB13_T_1176_2018': '91D99E4D94E62E24E05397BE0A0A3A10',
 'DB13_T_6338_2026': '598B66F9F87DC97DE06397BE0A0A7EC3',
 'DB13_T_6276_2026': '52F0BA672F168C39E06397BE0A0A9584',
 'DB13_T_5390_2021': 'C3B0BB05E84D4F89E05397BE0A0A81E3',
}


def fetch(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(['curl.exe', '-f', '-sSL', '--max-time', '45', '--retry', '1', url, '-o', str(path)], capture_output=True)
    if result.returncode:
        return {'url': url, 'status': 'download_failed', 'error': result.stderr.decode(errors='replace')[:160]}
    raw = path.read_bytes()
    return {'url': url, 'status': 'downloaded_not_reviewed', 'file': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def standard(item):
    name, identifier = item
    page = ROOT / 'standards/pear' / (name + '.catalog.html')
    record = {'id': name, 'catalog': fetch('https://std.samr.gov.cn/db/search/stdDBDetailed?id=' + identifier, page)}
    if record['catalog']['status'] == 'downloaded_not_reviewed':
        links = re.findall(r'https://dbba.sacinfo.org.cn/portal/online/([a-f0-9]+)', page.read_text(encoding='utf-8', errors='replace'))
        if links:
            record['document'] = fetch('https://dbba.sacinfo.org.cn/portal/download/' + links[0], ROOT / 'standards/pear' / (name + '.pdf'))
    print(json.dumps(record, ensure_ascii=False), flush=True)
    return record


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(standard, STANDARDS.items()))
    (ROOT / 'metadata').mkdir(parents=True, exist_ok=True)
    (ROOT / 'metadata/downloads.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
