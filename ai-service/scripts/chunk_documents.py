"""Evidence-preserving section/sentence chunking. Offsets refer to parsed sections."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree

ROOT=Path(__file__).resolve().parents[1]
HEADING=re.compile(r'^(?:\d{1,2}(?:\.\d{1,2})*\s+(?=[^。；]{0,45}[\u4e00-\u9fff])[^。；]{2,45}|[一二三四五六七八九十]+[、．].{2,45}|[（(][一二三四五六七八九十]+[）)].{2,40}|前\s*言|参考文献(?:\s*References)?|References|摘要|Abstract)$')
FOOTER=re.compile(r'^(?:DB\s*13\s*/\s*T\s*\d+\s*[—–-]\s*\d{4}|\d{1,4}|[IVX]{1,5})$')

def docx_pages(path):
    """DOCX has no stable page numbers without a layout engine."""
    with ZipFile(path) as archive:
        tree=ElementTree.fromstring(archive.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paragraphs=[];section='正文（未识别章节）'
    for p in tree.find('w:body',ns):
        if p.tag.endswith('}p'):
            text=''.join(t.text or '' for t in p.findall('.//w:t',ns))
            style=p.find('w:pPr/w:pStyle',ns)
            if style is not None and re.search(r'Heading|标题',style.get('{'+ns['w']+'}val',''),re.I):section=text;continue
            paragraphs.append({'page':None,'text':text,'section':section,'page_basis':'unavailable_without_word_layout'})
        elif p.tag.endswith('}tbl'):
            rows=['\t'.join(''.join(t.text or '' for t in cell.findall('.//w:t',ns)) for cell in row.findall('w:tc',ns)) for row in p.findall('w:tr',ns)]
            paragraphs.append({'page':None,'text':'\n'.join(rows),'section':'表格（需布局复核）','page_basis':'unavailable_without_word_layout'})
    return paragraphs

def pdf_pages(path):
    import pymupdf
    pages=[]
    with pymupdf.open(path) as document:
        for number,page in enumerate(document,1):
            blocks=[]
            for b in page.get_text('blocks',sort=False):
                if b[6]!=0:continue
                header=b[3]<page.rect.height*.065 or b[1]>page.rect.height*.95
                blocks.append({'bbox':list(b[:4]),'text':b[4],'excluded_header_footer':header})
            pages.append({'page':number,'text':'\n'.join(b['text'] for b in blocks if not b['excluded_header_footer']),
                          'blocks':blocks,'extraction_method':'PDF native block order; layout review required'})
    return pages

def parse_sections(pages):
    sections=[]; name='正文（未识别章节）'; chars=[]; page_map=[]
    def flush():
        nonlocal chars,page_map
        if chars:
            sections.append({'section':name,'text':''.join(chars),'page_map':page_map[:]})
        chars=[];page_map=[]
    for page in pages:
        if page.get('section') and page['section']!=name:
            flush();name=page['section']
        for raw in page['text'].splitlines():
            line=raw.strip()
            if not line or FOOTER.fullmatch(line):continue
            if HEADING.fullmatch(line):
                flush();name=line;continue
            # Keep every sentence's text; unwrap PDF visual line breaks.
            separator=' ' if chars and chars[-1][-1:].isascii() and line[:1].isascii() else ''
            chars.append(separator+line);page_map.extend([page.get('page')]*len(separator+line))
    flush()
    return sections

def sentence_spans(text):
    # Do not split decimal quantities, abbreviations, or rules at semicolons.
    start=0
    for match in re.finditer(r'[。！？!?](?:[”’」』）)]*)|(?<=[a-zA-Z0-9])\.(?=\s+[A-Z])',text):
        yield start,match.end();start=match.end()
    if start<len(text):yield start,len(text)

def chunk_section(section,target=800,maximum=1000,overlap=100):
    spans=list(sentence_spans(section['text']));i=0
    while i<len(spans):
        j=i;start=spans[i][0]
        while j<len(spans):
            size=spans[j][1]-start
            if j>i and size>maximum:break
            j+=1
            if size>=target:break
        end=spans[j-1][1]
        yield start,end
        if j==len(spans):break
        # Overlap whole sentences only; always introduce a new sentence.
        back=j
        while back>i+1 and end-spans[back-1][0]<=overlap:back-=1
        i=back

def build(output=None):
    output=output or ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks'
    output.mkdir(parents=True,exist_ok=True)
    sources=[json.loads(line) for line in (ROOT/'data/botou_yali/graphrag_corpus_v1/fulltext/metadata/sources.jsonl').read_text(encoding='utf-8').splitlines()]
    chunks=[];parsed=[];skipped=[]
    for source in sources:
        if not source['ready_for_chunking']:
            skipped.append({'source_id':source['source_id'],'reason':source['extraction_status']});continue
        original=ROOT/source['fulltext_path']
        pages=pdf_pages(original) if original.suffix.lower()=='.pdf' else docx_pages(original) if original.suffix.lower()=='.docx' else json.loads((ROOT/source['pages_path']).read_text(encoding='utf-8'))
        (output/(source['source_id']+'.pages.json')).write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
        sections=parse_sections(pages);ordinal=0
        for index,section in enumerate(sections,1):
            section_id=f"{source['source_id']}_S{index:03d}"
            parsed.append(dict(source_id=source['source_id'],title=source['title'],section_id=section_id,**section))
            if re.search(r'参考文献|References',section['section']):continue
            previous_end=0
            for start,end in chunk_section(section):
                ordinal+=1;text=section['text'][start:end]
                page_numbers=sorted({p for p in section['page_map'][start:end] if p is not None})
                chunks.append({
                    'chunk_id':f"{source['source_id']}_C{ordinal:04d}",'source_id':source['source_id'],
                    'title':source['title'],'section':section['section'],'section_id':section_id,
                    'page':page_numbers[0] if page_numbers else None,'page_end':page_numbers[-1] if page_numbers else None,
                    'pages':page_numbers,'page_basis':'PDF physical page, 1-based' if page_numbers else 'web article; no page number',
                    'crop':source['crop'],'region':source['region'],'applicable_stages':source['applicable_stages'],
                    'evidence_level':source['evidence_level'],'source_type':source['source_type'],
                    'year':source['year'],'source_file_sha256':hashlib.sha256(original.read_bytes()).hexdigest(),
                    'source_url':source['url'],'original_path':source['fulltext_path'],
                    'text':text,'char_count':len(text),'start_offset':start,'end_offset':end,
                    'overlap_chars':max(0,previous_end-start),'text_sha256':hashlib.sha256(text.encode()).hexdigest(),
                    'size_exception':'long_unsplit_sentence' if len(text)>1000 else 'short_section_or_tail' if len(text)<500 else None,
                    'review_status':'layout_tables_and_agronomic_context_review_pending',
                    'needs_layout_review':len(text)>1000 or '表格' in section['section'],
                    'production_retrieval_approved':False})
                previous_end=end
    def write(name,rows):
        (output/name).write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
    write('sections.jsonl',parsed);write('chunks.jsonl',chunks)
    write('layout_review.jsonl',[c for c in chunks if c['needs_layout_review']])
    for source in sources:
        write(source['source_id']+'.chunks.jsonl',[c for c in chunks if c['source_id']==source['source_id']])
    report={'sources_processed':len(sources)-len(skipped),'chunks':len(chunks),'sections':len(parsed),
            'in_500_1000':sum(500<=c['char_count']<=1000 for c in chunks),
            'short':sum(c['char_count']<500 for c in chunks),'long_unsplit':sum(c['char_count']>1000 for c in chunks),
            'skipped':skipped,'target_chars':800,'max_chars_except_unsplit_sentence':1000,'overlap_budget':100}
    (output/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);parser.add_argument('--parse-file',type=Path)
    args=parser.parse_args()
    if args.parse_file:
        if args.parse_file.suffix.lower() not in {'.pdf','.docx'}:parser.error('支持 PDF/DOCX；旧版 DOC 须先转换为 DOCX，不能伪造分页。')
        if not args.output:parser.error('--parse-file 需要 --output 输出目录')
        args.output.mkdir(parents=True,exist_ok=True)
        pages=pdf_pages(args.parse_file) if args.parse_file.suffix.lower()=='.pdf' else docx_pages(args.parse_file)
        (args.output/'pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
        (args.output/'sections.json').write_text(json.dumps(parse_sections(pages),ensure_ascii=False,indent=2),encoding='utf-8')
    else:print(json.dumps(build(args.output)))
