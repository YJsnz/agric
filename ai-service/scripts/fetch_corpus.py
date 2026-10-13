"""Download explicit public source URLs; log failures, validate PDF magic bytes."""
import argparse, hashlib, json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
def fetch(item):
    dest=ROOT/item['path']; dest.parent.mkdir(parents=True,exist_ok=True)
    result=dict(item,attempted_at=datetime.now(timezone.utc).isoformat())
    try:
        headers={'User-Agent':'Mozilla/5.0'}
        if item.get('referer'): headers['Referer']=item['referer']
        with urlopen(Request(item['url'],headers=headers),timeout=30) as response:
            data=response.read(); result['resolved_url']=response.url
        if dest.suffix=='.pdf' and not data.startswith(b'%PDF-'): raise ValueError('response is not PDF')
        dest.write_bytes(data)
        result.update(status='downloaded_pending_review',bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
    except Exception as error: result.update(status='failed',error=str(error))
    return result
if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('plan'); args=parser.parse_args()
    plan=Path(args.plan); items=json.loads(plan.read_text(encoding='utf-8'))
    with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(fetch,items))
    plan.with_suffix('.results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps([{k:v for k,v in r.items() if k in {'source_id','status','bytes','error'}} for r in results]))
