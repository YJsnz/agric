"""Archive sources and official PDFs; never import summary seeds into Neo4j."""
import hashlib,json,re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
from wheat.audit_sources import TextParser

ROOT=Path(__file__).resolve().parents[1]/'data/qingxian_facility_vegetables'

def download(source):
    sid=source['id'];folder=ROOT/'evidence/raw'/('standards' if source['type']=='local_standard' else 'government')
    folder.mkdir(parents=True,exist_ok=True)
    row={**source,'fulltext_available':False,'review_status':'fulltext_required'}
    try:
        r=requests.get(source['url'],timeout=30);r.raise_for_status();r.encoding='utf-8'
        page=folder/(sid+'.html');page.write_bytes(r.content)
        parser=TextParser();parser.feed(r.text);page.with_suffix('.txt').write_text('\n'.join(parser.parts),encoding='utf-8')
        row['landing_path']=str(page.relative_to(ROOT))
        ids=re.findall(r'https://dbba.sacinfo.org.cn/portal/(?:online|download)/([a-f0-9]+)',r.text)
        if not ids:ids=re.findall(r'(?:online|download)/([a-f0-9]{32,})',r.text)
        if ids:
            url='https://dbba.sacinfo.org.cn/portal/download/'+ids[0]
            pdf=requests.get(url,timeout=45);pdf.raise_for_status()
            if not pdf.content.startswith(b'%PDF'):raise ValueError('Official download did not return a PDF')
            p=folder/(sid+'.pdf');p.write_bytes(pdf.content)
            import pymupdf
            with pymupdf.open(p) as doc:pages=[{'page':i+1,'text':x.get_text()} for i,x in enumerate(doc)]
            processed=ROOT/'evidence/processed';processed.mkdir(parents=True,exist_ok=True)
            (processed/(sid+'.pages.json')).write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
            row.update(fulltext_available=True,local_path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(pdf.content).hexdigest(),pages=len(pages),download_url=url,review_status='fulltext_requires_review')
        elif source['type']!='local_standard':
            row.update(local_path=str(page.relative_to(ROOT)),sha256=hashlib.sha256(r.content).hexdigest(),review_status='web_content_requires_review')
    except Exception as exc:row['error']=str(exc)
    return row

def main():
    sources=[json.loads(x) for x in (ROOT/'graphrag_kg_corpus_v1/01_sources/source_manifest.jsonl').read_text(encoding='utf-8').splitlines()]
    with ThreadPoolExecutor(5) as pool:rows=list(pool.map(download,sources))
    (ROOT/'evidence/download_audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in rows:print(r['id'],r.get('pages'),r.get('error',''),flush=True)

if __name__=='__main__':main()
