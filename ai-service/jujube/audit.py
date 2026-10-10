"""Download sources for review, without building or importing graph facts."""
import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin
import requests
from wheat.audit_sources import TextParser

ROOT=Path(__file__).resolve().parents[1]/'data/cangzhou_jinsixiaozao'
RAW=ROOT/'evidence/raw'
PRIORITY={'J001','J002','J007','J008','J009','J010','J011','J012','J017','J019'}

def archive(sid,url):
    row={'source_id':sid,'url':url,'fulltext_available':False}
    try:
        r=requests.get(url,timeout=30);r.raise_for_status()
        pdf=r.content.startswith(b'%PDF');p=RAW/(sid+('.pdf' if pdf else '.html'))
        p.write_bytes(r.content)
        row.update(local_path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(r.content).hexdigest())
        if pdf:
            import pymupdf
            with pymupdf.open(p) as doc:pages=[{'page':i+1,'text':page.get_text()} for i,page in enumerate(doc)]
            p.with_suffix('.pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
            row.update(fulltext_available=True,pages=len(pages),review_status='fulltext_requires_review')
        else:
            r.encoding='utf-8';parser=TextParser();parser.feed(r.text)
            p.with_suffix('.txt').write_text('\n'.join(parser.parts),encoding='utf-8')
            row['links']=[urljoin(url,u) for u in parser.links if re.search('pdf|download|Download',u)][:20]
            row['review_status']='landing_page_requires_review'
    except Exception as e:row['error']=str(e)
    return row

def main():
    RAW.mkdir(parents=True,exist_ok=True)
    sources=json.loads((ROOT/'graphrag_kg_corpus_v1/01_source_registry/source_registry.json').read_text(encoding='utf-8'))
    selected=[s for s in sources if s['id'] in PRIORITY or s['id'] in {'J004','J005','J006','J015','J018'}]
    with ThreadPoolExecutor(5) as pool:rows=list(pool.map(lambda s:archive(s['id'],s['url']),selected))
    for sid in ('J001','J002'):
        p=RAW/(sid+'.html')
        if p.exists():
            ids=re.findall(r'https://dbba.sacinfo.org.cn/portal/online/([a-f0-9]+)',p.read_text(encoding='utf-8'))
            if ids:rows.append(archive(sid+'_fulltext','https://dbba.sacinfo.org.cn/portal/download/'+ids[0]))
    (ROOT/'evidence/download_audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    for row in rows:print(row['source_id'],row.get('pages'),row.get('error',''),row.get('links',[])[:3],flush=True)

if __name__=='__main__':main()
