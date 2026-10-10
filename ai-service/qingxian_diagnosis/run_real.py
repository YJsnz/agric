"""Manual real Neo4j/BGE/DeepSeek integration, with complete saved responses."""
from .graphrag_adapter import run_qingxian_graphrag
from .context import QingxianContext
from .build import ROOT,save
import json

QUESTIONS=[
 '黄瓜叶片出现多角形水浸状斑，叶背有灰黑色霉层，可能是什么风险？',
 '黄瓜叶背有白色菌脓，病斑穿孔，怎样与霜霉病区分？',
 '早春茬黄瓜缓苗后棚内湿度90%，需要核验哪些温湿度条件？',
 '番茄叶尖有褐色水浸状斑，潮湿时边缘白色霉层，是什么候选风险？',
 '秋冬茬番茄滴灌施肥前后为什么要用清水，阴雪天灌水注意什么？',
]

if __name__=='__main__':
    results=[]
    for i,question in enumerate(QUESTIONS,1):
        print(f'[{i}/5] {question}',flush=True)
        result=run_qingxian_graphrag(question=question,environment_context=QingxianContext(region='青县'))
        results.append(result);save(ROOT/'evaluation/real_qa.json',results)
        print(json.dumps({k:result.get(k) for k in ['status','generation_called','retrieval','answer','grounding']},ensure_ascii=False),flush=True)
