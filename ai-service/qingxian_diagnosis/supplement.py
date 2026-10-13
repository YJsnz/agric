"""Supplement symptom evidence from the CAAS information portal."""
import json
from .audit import ROOT,download
SOURCES=[
 {'id':'CAAS_CUCUMBER','title':'黄瓜细菌性角斑病与霜霉病辨别','type':'extension','authority':'中国农业科技信息网（中国农业科学院）','year':None,'url':'https://cast.caas.cn/kj/syjs/zwbhjs/317422.html','scope':['黄瓜','症状鉴别']},
 {'id':'CAAS_TOMATO','title':'大棚番茄典型病害症状与防治','type':'extension','authority':'中国农业科技信息网（中国农业科学院）','year':None,'url':'https://cast.caas.cn/kj/syjs/zwbhjs/229746.html','scope':['番茄','病害']},
 {'id':'CAAS_ENV','title':'棚室蔬菜管理','type':'extension','authority':'中国农业科技信息网（中国农业科学院）','year':None,'url':'https://cast.caas.cn/kj/syjs/zzyjs/257044.html','scope':['设施蔬菜','环境管理']}]
if __name__=='__main__':
    rows=[download(s) for s in SOURCES]
    (ROOT/'evidence/supplement_audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    for r in rows:print(r['id'],r.get('error'),r.get('local_path'))
