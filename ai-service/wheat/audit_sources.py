"""Archive publicly accessible source responses; never update the KG."""
import hashlib
import json
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
from html.parser import HTMLParser

class TextParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.links=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
        if tag=='a': self.links.append(dict(attrs).get('href',''))
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
    def handle_data(self,data):
        if not self.skip and data.strip(): self.parts.append(data.strip())

ROOT = Path(__file__).resolve().parents[1] / 'data/huanghua_hanjianmai'
RAW = ROOT / 'evidence/raw'

def archive(item):
    sid, url = item
    result = {'source_id': sid, 'url': url, 'status': 'fulltext_required'}
    try:
        r = requests.get(url, timeout=35)
        r.raise_for_status()
        suffix = '.pdf' if r.content.startswith(b'%PDF') else '.html'
        path = RAW / (sid + suffix)
        path.write_bytes(r.content)
        result.update(file=str(path.relative_to(ROOT)), sha256=hashlib.sha256(r.content).hexdigest())
        if suffix == '.pdf':
            import fitz
            doc = fitz.open(path)
            pages = [{'page': i+1, 'text': p.get_text()} for i,p in enumerate(doc)]
            path.with_suffix('.pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
            result.update(status='fulltext_downloaded_requires_content_review', pages=len(pages))
        else:
            r.encoding = 'utf-8'
            parser=TextParser(); parser.feed(r.text)
            path.with_suffix('.txt').write_text('\n'.join(parser.parts),encoding='utf-8')
            result['links'] = [u for u in parser.links if re.search('pdf|download',u,re.I)][:20]
    except Exception as e:
        result['error'] = str(e)
    return result

def main():
    registry = json.loads((ROOT/'graphrag_kg_corpus_v1/01_source_registry/source_registry.json').read_text(encoding='utf-8'))
    if isinstance(registry,dict): registry=registry.get('sources',[])
    urls = [(s.get('source_id',s.get('id')),s.get('url',s.get('source_url'))) for s in registry]
    urls = [(sid,u) for sid,u in urls if u]
    urls += [('W008_fulltext','https://www.casb.org.cn/CN/article/downloadArticleFile.do?attachType=PDF&id=31429'),
             ('W011_fulltext','https://www.ecoagri.ac.cn/cn/article/pdf/preview/10.12357/cjea.20250732.pdf')]
    RAW.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(6) as pool: rows=list(pool.map(archive,urls))
    downloads=[]
    for sid in ('W001','W002','W003','W004','W005','W006','W015','W016'):
        path=RAW/(sid+'.html')
        if not path.exists(): continue
        text=path.read_text(encoding='utf-8')
        ids=re.findall(r'https://dbba.sacinfo.org.cn/portal/online/([a-f0-9]+)',text)
        if not ids:
            term={'W003':'DB13/T 6107-2025','W005':'DB1309/T 320-2025','W006':'DB1309/T 330-2025'}.get(sid)
            if term:
                row=next((x for x in re.findall(r'<tr[\s\S]*?</tr>',text) if term in x),'')
                ids=re.findall(r'/stdDetail/([a-f0-9]+)',row)
        if ids: downloads.append((sid+'_fulltext','https://dbba.sacinfo.org.cn/portal/download/'+ids[0]))
    with ThreadPoolExecutor(6) as pool: rows.extend(pool.map(archive,downloads))
    (ROOT/'evidence/source_audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in rows: print(r['source_id'],r['status'],r.get('pages',''),r.get('error','')[:100])

if __name__=='__main__': main()
