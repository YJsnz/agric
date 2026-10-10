"""Archive postharvest sources without modifying previous originals."""
import json,hashlib,subprocess
import requests
from .build import ROOT,save
from .fetch_visual_sources import Text
SOURCES=[
 ('JF001','鲜枣贮藏保鲜操作规程','农业农村部农产品冷链物流标准化技术委员会','全国鲜枣通用（非沧州专项验证）',2023,'https://scs.moa.gov.cn/ccll/jszn/202302/t20230203_6419772.htm'),
 ('JF002','鲜枣家族各有特长','中国农业大学新闻网（转载科普）','全国鲜枣科普（非沧州专项验证）',2019,'https://news.cau.edu.cn/art/2019/10/12/art_8779_641338.html'),
 ('JF003','圆通给你送“小糖豆”了','国家邮政局','沧州冬枣物流案例',2025,'https://www.spb.gov.cn/gjyzj/c100196/202510/3fc167f538174e3094920dcbdd388e13.shtml')]
def main():
 records=[]
 for sid,title,publisher,region,year,url in SOURCES:
  p=ROOT/'evidence/raw'/f'{sid}.html'
  if not p.exists():
   try:
    r=requests.get(url,timeout=40);r.raise_for_status();p.write_bytes(r.content)
   except (requests.exceptions.SSLError,requests.exceptions.HTTPError):
    subprocess.run(['curl.exe','--fail','--location','--user-agent','Mozilla/5.0','--max-time','60','--output',str(p),url],check=True)
  parser=Text();parser.feed(p.read_bytes().decode('utf-8'));text='\n'.join(parser.parts)
  assert title in text,(sid,'title mismatch')
  dest=p.with_suffix('.txt');dest.write_text(text,encoding='utf-8')
  records.append(dict(id=sid,title=title,publisher=publisher,region=region,year=year,url=url,
   local_path=f'evidence/raw/{sid}.txt',sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),
   original_html_sha256=hashlib.sha256(p.read_bytes()).hexdigest(),source_type='official_guidance' if sid=='JF001' else 'university_republished_science' if sid=='JF002' else 'official_logistics_news',
   evidence_level='general_authoritative',evidence_levels_compat=['L3'],usage='conditional_fresh_fruit_guidance' if sid!='JF003' else 'local_logistics_context_only_not_causal_evidence'))
 save(ROOT/'evidence/fruit_sources.json',records);print('archived',len(records))
if __name__=='__main__':main()
