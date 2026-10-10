import concurrent.futures
import json
import re
from html.parser import HTMLParser
from acquire_sources import ROOT, fetch

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.hidden=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.hidden+=1
        if tag in ('p','h1','h2','h3','h4','li','tr','br'): self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.hidden=max(0,self.hidden-1)
    def handle_data(self,data):
        if not self.hidden: self.parts.append(data)

PAGES = {
 'moa_storage': ('government', 'https://scs.moa.gov.cn/ccll/jszn/202302/t20230203_6419771.htm'),
 'moa_botou': ('government', 'https://nmfsj.moa.gov.cn/dfzt/heibei/zxzx_25728/202109/t20210923_6377404.htm'),
 'vic_scab': ('government', 'https://agriculture.vic.gov.au/biosecurity/plant-diseases/fruit-and-nut-diseases/pome-fruits/pear-scab'),
 'paper_lac': ('papers/pear', 'https://www.chinaagrisci.com/CN/10.3864/j.issn.0578-1752.2020.24.010'),
 'paper_aroma': ('papers/pear', 'https://www.chinaagrisci.com/CN/abstract/abstract21870.shtml'),
 'paper_mcp': ('papers/pear', 'https://www.spgykj.com/article/doi/10.13386/j.issn1002-0306.2014.02.057'),
 'paper_cooling': ('papers/pear', 'https://www.spkx.net.cn/CN/abstract/abstract30419.shtml'),
}
SLUGS = ['pear-scab','fire-blight','blossom-blast','pear-decline','armillaria-root-and-crown-rot-oak-root-fungus',
 'pear-psylla','codling-moth','pear-rust-mite','pearleaf-blister-mite','san-jose-scale','aphids','mealybugs',
 'webspinning-spider-mites','european-red-mite','thrips','harvest-fruit-sample','postharvest-survey',
 'sampling-at-bloom','sampling-during-fruit-development','dormant-to-delayed-dormant-sampling']
PAGES.update({'uc_'+s.replace('-','_'):('government', 'https://ipm.ucanr.edu/agriculture/pear/'+s+'/') for s in SLUGS})

def download(item):
    identifier,(folder,url)=item
    file=ROOT/folder/(identifier+'.html')
    record=dict(id=identifier,**fetch(url,file))
    if record['status']=='downloaded_not_reviewed':
        parser=Text();parser.feed(file.read_text(encoding='utf-8',errors='replace'))
        lines=[' '.join(l.split()) for l in ''.join(parser.parts).splitlines()]
        text='\n'.join(l for l in lines if l)
        file.with_suffix('.txt').write_text(text,encoding='utf-8')
    print(json.dumps({'id':identifier,'status':record['status'],'bytes':record.get('bytes')},ensure_ascii=False),flush=True)
    return record

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        records=list(pool.map(download,PAGES.items()))
    (ROOT/'metadata/page_downloads.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
