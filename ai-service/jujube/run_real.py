"""Manual real Neo4j + BGE + DeepSeek integration run; no mocks."""
import json
from .service import ask,QUESTIONS
from .build import ROOT,save

def main():
    results=[]
    for i,q in enumerate(QUESTIONS,1):
        print(f'[{i}/5] {q}',flush=True)
        result=ask(q,region='沧州')
        results.append(result);save(ROOT/'evaluation/real_qa.json',results)
        print(json.dumps({k:result.get(k) for k in ['status','generation_called','retrieval','answer','grounding']},ensure_ascii=False),flush=True)
    print('完整结果：data/cangzhou_jinsixiaozao/evaluation/real_qa.json')

if __name__=='__main__':main()
