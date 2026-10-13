"""Real HTTP acceptance checks, kept separate from the frozen baseline experiment."""
import json
import time
from pathlib import Path
from datetime import datetime
from urllib.request import Request,urlopen
from urllib.error import HTTPError

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/botou_yali/evaluation/graphrag_v2_repair'
QUESTIONS=[
    ('paper','根据《不同O2浓度对鸭梨采后生理代谢及贮藏品质的影响》，试验所用鸭梨采自哪个地区？'),
    ('graph','黑星病有哪些症状？'),
    ('clarification','我家的鸭梨应该怎么处理？'),
    ('local_gap','泊头鸭梨果实膨大期持续高湿有什么风险？')]


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for name,question in QUESTIONS:
        file=OUT/(name+'.json')
        start=time.perf_counter()
        request=Request('http://127.0.0.1:8090/api/graphrag/ask',data=json.dumps({'question':question}).encode(),
                        headers={'Content-Type':'application/json'})
        try:
            with urlopen(request,timeout=420) as response:
                result=json.load(response);http=response.status
        except HTTPError as error:
            result=json.load(error);http=error.code
        checks={'http_200':http==200,'v2':result.get('pipeline_version')=='agricultural-v2'}
        if name=='paper':
            checks.update(paper_policy=result.get('policy',{}).get('purpose')=='literature',
                          answered=result.get('status')=='answered',
                          source=any(s['source_id']=='PAPER_001' for s in result.get('sources',[])),
                          correct_location='石家庄' in result.get('answer',''))
        elif name=='graph':
            checks.update(answered=result.get('status')=='answered',graph_evidence=bool(result.get('reasoning_paths')),
                          grounded=result.get('grounding_audit',{}).get('passed',False))
        elif name=='clarification':
            checks.update(clarify=result.get('status')=='needs_clarification',no_generation=not result.get('generation_called'))
        else:
            checks.update(strict=result.get('policy',{}).get('mode')=='strict',
                          safe=result.get('status') in ('insufficient_evidence','validation_failed','needs_clarification') or result.get('grounding_audit',{}).get('passed',False))
        record={'question':question,'time':datetime.now().isoformat(),'seconds':time.perf_counter()-start,
                'http':http,'checks':checks,'passed':all(checks.values()),'response':result}
        if file.exists():
            history=OUT/'history';history.mkdir(exist_ok=True)
            (history/(datetime.now().strftime('%Y%m%d_%H%M%S')+'_'+name+'.json')).write_bytes(file.read_bytes())
        file.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
        print(name,'PASS' if record['passed'] else 'FAIL',round(record['seconds'],1),result.get('status'),checks,flush=True)


if __name__=='__main__':main()
