"""Six fixed questions, real stored graph/BGE/FAISS and existing DeepSeek validators."""
import json,os
from pathlib import Path
from .service import ask

QUESTIONS=['金丝小枣叶片出现黄化可能有哪些原因？','检测到炭疽病类视觉表现，可以直接确认炭疽病吗？',
           '果实发生碰伤后，采后可能有什么风险？','储藏温度过高会带来哪些采后风险？',
           '果实检测为 rotten 是否代表不能食用？','生产期水分胁迫是否可能影响采后品质？']
def main():
    out=Path(__file__).resolve().parents[1]/'reports';out.mkdir(exist_ok=True)
    results=[]
    for i,q in enumerate(QUESTIONS,1):
        print(f'Q{i}',flush=True)
        result=ask(q)
        results.append(result)
        (out/'jujube_six_question_acceptance.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({'status':result['status'],'generation_called':result['generation_called'],
                          'citations':len(result['citations']),'grounding':result.get('grounding'),
                          'answer':result.get('answer'),'error':result.get('generation_error')},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
