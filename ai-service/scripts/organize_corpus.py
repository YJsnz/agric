"""Build a reproducible document catalogue without changing the live knowledge graph."""
import hashlib, json, re, shutil
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
import pymupdf

class MetadataParser(HTMLParser):
    def __init__(self):super().__init__();self.meta={}
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='meta' and a.get('name') and 'content' in a:self.meta.setdefault(a['name'],[]).append(a['content'])

class BodyParser(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self,data):self.parts.append(data)
    def handle_endtag(self,tag):
        if tag in {'p','div','br'}:self.parts.append('\n')

def dump(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
def copy(source,target):
    target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists() or source.read_bytes()!=target.read_bytes():shutil.copyfile(source,target)
def relative(path):return path.relative_to(ROOT).as_posix()
def main():
    original=ROOT/'data\\botou_yali\\graphrag_corpus_v1'
    records=[json.loads(s) for s in (original/'metadata/source_manifest.jsonl').read_text(encoding='utf-8').splitlines() if s.strip()]
    mapping={'STD_002':'DB13_T_6276_2026','STD_003':'DB13_T_6338_2026','STD_004':'DB13_T_5390_2021'}
    catalogue=[]
    plans=[]
    for path in sorted((ROOT/'data/botou_yali/graphrag_corpus_v1/processed/acquisition').glob('*.results.json')):plans+=json.loads(path.read_text(encoding='utf-8'))
    downloads={r['path']:r for r in plans if r.get('status')=='downloaded_pending_review' and 'path' in r}
    for category in ['standards','papers','government','books','university']:(ROOT/'data/botou_yali/graphrag_corpus_v1/fulltext'/category).mkdir(parents=True,exist_ok=True)
    for item in records:
        if not re.fullmatch(r'[A-Z]+_\d+',item['id']) or item['category'] not in {'standards','papers','government','university'}:raise ValueError('invalid source path')
        sid=item['id']; folder=ROOT/'data/botou_yali/graphrag_corpus_v1/fulltext'/item['category']/sid;folder.mkdir(parents=True,exist_ok=True)
        copy(original/'documents'/item['category']/(sid+'.md'),folder/'summary.md')
        raw_pdf=folder/'original.pdf'
        acquisition=None
        if sid in mapping:
            old=ROOT/'data/botou_yali/evidence/standards/pear'/(mapping[sid]+'.pdf');copy(old,raw_pdf)
            old_records=json.loads((ROOT/'data/botou_yali/evidence/metadata/downloads.json').read_text(encoding='utf-8'))
            acquisition=next(r['document'] for r in old_records if r['id']==mapping[sid])
        status='summary_only';pages=[];text_path=None;fulltext=None
        if raw_pdf.exists():
            with pymupdf.open(raw_pdf) as reader:
                pages=[{'page':i+1,'text':p.get_text(sort=True), 'blank_page':not p.get_text().strip() and not p.get_images() and not p.get_drawings()} for i,p in enumerate(reader)]
            if not pages:raise ValueError('empty PDF: '+sid)
            fulltext=raw_pdf;status='fulltext_pdf_available'
        elif sid=='UNI_001' and (folder/'http-original.html').exists():
            html=(folder/'http-original.html').read_text(encoding='utf-8')
            body=re.search(r'<div class="content">(.*?)</div>',html,re.S)
            if not body:raise ValueError('missing university article body')
            parser=BodyParser();parser.feed(body[1]);text=''.join(parser.parts).strip()
            if '01黑星病' not in text or '09干腐病' not in text:raise ValueError('incomplete university article')
            pages=[{'section':'网页正文','text':text}];fulltext=folder/'http-original.html';status='fulltext_html_available'
        elif sid in {'GOV_001','GOV_002'} and (folder/'browser.txt').exists():
            text=(folder/'browser.txt').read_text(encoding='utf-8')
            start='梨黑星病又叫' if sid=='GOV_001' else '鸭梨是我国'
            end='[农业科技报' if sid=='GOV_001' else '友情链接'
            if start not in text:raise ValueError('missing article body: '+sid)
            body=text[text.index(start):].split(end)[0].strip()
            if sid=='GOV_002':body=body.split('扫一扫在手机')[0].strip()
            pages=[{'section':'网页正文','text':body}];fulltext=folder/'browser.html';status='fulltext_html_available'
        if pages:
            processed=ROOT/'data/botou_yali/graphrag_corpus_v1/processed'/sid;processed.mkdir(parents=True,exist_ok=True)
            dump(processed/'pages.json',pages)
            text_path=processed/'text.txt';text_path.write_text('\n\n'.join(p['text'] for p in pages),encoding='utf-8')
        meta=MetadataParser()
        if (folder/'landing.html').exists():meta.feed((folder/'landing.html').read_text(encoding='utf-8',errors='replace'))
        dates=meta.meta.get('citation_publication_date',meta.meta.get('citation_date',[]))
        year_match=re.search(r'(?:19|20)\d{2}',dates[0] if dates else item['title'] if item['category']=='standards' else '')
        year=int(year_match.group()) if year_match else {'GOV_001':2017,'GOV_002':2004,'PAPER_002':2013,'PAPER_003':2010,'UNI_001':2023}.get(sid)
        region={'STD_001':['河北省','沧州市','泊头市'],'STD_002':['河北省'],'STD_003':['河北省'],'STD_004':['河北省'],'PAPER_001':['河北省','石家庄市']}.get(sid,[])
        stages={'STD_004':['储藏期','出库期','运输期','货架期'],'PAPER_001':['储藏期','货架期'],'PAPER_002':['储藏期'],'PAPER_003':['采收期','储藏期'],'PAPER_004':['采收期','储藏期'],'PAPER_005':['储藏期'],'GOV_002':['采收期','储藏期']}.get(sid,[])
        artifacts=[]
        for f in sorted(folder.iterdir()):
            if f.name=='metadata.json' or not f.is_file():continue
            artifacts.append({'path':relative(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size,'role':'fulltext' if f==fulltext else 'user_summary' if f.name=='summary.md' else 'landing_or_capture'})
        entry={'source_id':sid,'title':item['title'],'source_type':{'standards':'standard','papers':'paper','government':'government','university':'university_material'}[item['category']],
          'crop':[item['crop']],'region':region,'region_note':item['region'],'year':year,'evidence_level':item['level'],
          'evidence_level_basis':'继承用户来源清单的分级，尚不代表因果证据强度',
          'applicable_stages':stages,'stage_basis':'文档主题标签；不是每条农业规则的阶段约束','url':item['url'],
          'authors':meta.meta.get('citation_author',[]),'doi':meta.meta.get('citation_doi',[None])[0],
          'availability':status,'review_status':'fulltext_acquired_content_review_pending' if fulltext else 'original_fulltext_missing',
          'fulltext_path':relative(fulltext) if fulltext else None,'text_path':relative(text_path) if text_path else None,
          'pages_path':relative(text_path.parent/'pages.json') if text_path else None,
          'page_count':len(pages) if raw_pdf.exists() else None,
          'ready_for_chunking':bool(fulltext and all(p['text'].strip() or p.get('blank_page') for p in pages) and len(re.findall(r'[\u4e00-\u9fff]',''.join(p['text'] for p in pages)))>50 and not any(re.search(r'/G[0-9A-F]{2}',p['text']) for p in pages)),
          'production_retrieval_approved':False,'project_focus':'泊头鸭梨','scope_note':item['caveat'],
          'kg_source_ids':{'STD_002':['6276'],'STD_003':['6338'],'STD_004':['5390']}.get(sid,[]),
          'artifacts':artifacts,'acquisition':acquisition or downloads.get(relative(raw_pdf)),
          'acquisition_attempts':[r for r in plans if r.get('source_id')==sid]}
        if sid=='STD_001':entry['url']='https://std.samr.gov.cn/db/search/stdDBDetailed?id=91D99E4D94E62E24E05397BE0A0A3A10';entry['metadata_note']='用户原链接指向备案公告，并非全文。'
        if sid=='GOV_002':entry['metadata_note']='年份据网页显示时间 2004-09-07；URL 路径中的 2015 不作为出版年份。'
        if sid=='UNI_001':entry['metadata_note']='通过公开 HTTP 页面取得全文；HTTPS 证书错误，站点机构归属尚未独立核验，不可仅凭标题认定为大学正式出版物。'
        entry['extraction_status']='text_available_review_pending' if entry['ready_for_chunking'] else 'needs_ocr' if fulltext else 'no_fulltext'
        if sid=='PAPER_002':entry['metadata_note']='已目视核对 PDF 首页标题与 2013 年出版信息；全文 4 页，但内嵌字体无正确文字映射，需 OCR 后才能用于检索。'
        dump(folder/'metadata.json',entry);catalogue.append(entry)
    out=ROOT/'data/botou_yali/graphrag_corpus_v1/fulltext/metadata';out.mkdir(exist_ok=True)
    (out/'sources.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in catalogue),encoding='utf-8')
    dump(out/'kg_source_mapping.json',{r['source_id']:r['kg_source_ids'] for r in catalogue if r['kg_source_ids']})
    for name in ['chunks_v1.jsonl','candidate_triples.jsonl']:copy(original/'metadata'/name,ROOT/'data/botou_yali/graphrag_corpus_v1/processed/imported_candidates'/name)
    report={'sources':len(catalogue),'fulltext':sum(bool(r['fulltext_path']) for r in catalogue),'missing_fulltext':[r['source_id'] for r in catalogue if not r['fulltext_path']], 'chunking_ready':sum(r['ready_for_chunking'] for r in catalogue)}
    dump(ROOT/'data/botou_yali/evaluation/corpus_inventory.json',report);print(json.dumps(report))
if __name__=='__main__':main()
