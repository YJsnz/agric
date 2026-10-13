"""Archive official pages unchanged; extracted text is separate from HTML."""
import hashlib,json,subprocess
from html.parser import HTMLParser
from pathlib import Path
import requests
from .build import ROOT
SOURCES=[
 ('JV001','果树花叶病与黄叶病','湖南省林业局','湖南','2013-06-04','https://lyj.hunan.gov.cn/lyj/tslm_71206/lykp/syjs/201512/t20151227_2590115.html'),
 ('JV002','情牵群众 技术为民 治疗枣疯病采用放疗化疗加换头 900余株枣树开治枣疯病','北京市园林绿化局','北京','2022-06-30','https://yllhj.beijing.gov.cn/ztxx/lhysh/st/202206/t20220628_2754185.shtml'),
 ('JV003','枣病虫害防治','北京市园林绿化局','北京','2015-10-13','https://yllhj.beijing.gov.cn/ztxx/bjssylcpzlaqjdgl/jsyd/lg/201510/t20151013_120293.shtml'),
 ('JV004','Powdery Mildew on Ornamentals','University of California IPM','美国加利福尼亚',None,'https://ipm.ucanr.edu/home-and-landscape/powdery-mildew-on-ornamentals/')]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip():self.parts.append(d.strip())
def main():
 records=[]
 for sid,title,publisher,region,date,url in SOURCES:
  p=ROOT/'evidence/raw'/f'{sid}.html'
  if not p.exists():
   try:
    r=requests.get(url,timeout=60);r.raise_for_status();p.write_bytes(r.content)
   except (requests.exceptions.SSLError,requests.exceptions.HTTPError):
    subprocess.run(['curl.exe','--fail','--location','--user-agent','Mozilla/5.0','--max-time','60','--output',str(p),url],check=True)
  raw=p.read_bytes().decode('utf-8');parser=Text();parser.feed(raw);text='\n'.join(parser.parts)
  assert title in text,(sid,'title not found')
  dest=p.with_suffix('.txt');dest.write_text(text,encoding='utf-8')
  records.append(dict(id=sid,title=title,publisher=publisher,region=region,date=date,year=int(date[:4]) if date else None,url=url,
   source_type='university_extension' if sid=='JV004' else 'government_extension',local_path=str(dest.relative_to(ROOT)).replace('\\','/'),sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),
   original_html_sha256=hashlib.sha256(p.read_bytes()).hexdigest(),evidence_level='transfer_pending',evidence_levels_compat=['L4'],review_scope='candidate explanation only; not local advice'))
 (ROOT/'evidence/visual_sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 print('Archived',len(records),'official sources')
if __name__=='__main__':main()
