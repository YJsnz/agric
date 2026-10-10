"""Local BGE cross-encoder for both graph paths and document chunks."""
from functools import lru_cache
from pathlib import Path
import math
import threading
from fastembed.rerank.cross_encoder import TextCrossEncoder
from tokenizers import Tokenizer
from .fusion import FusionConfig, fuse

MODEL='BAAI/bge-reranker-base'
ROOT=Path(__file__).resolve().parents[1]/'models/reranker'

def candidate_text(candidate):
    if candidate['kind']=='document_chunk':
        c=candidate['chunk']
        return c['title']+'\n'+c['section']+'\n'+c['text']
    if candidate['kind']=='graph_path':
        names=candidate['node_names']
        return '\n'.join(f"{names[i]} —{e['relation']}→ {names[i+1]}。{e.get('claim','')}。适用条件：{'；'.join(e.get('conditions',[]))}" for i,e in enumerate(candidate['edges']))
    raise ValueError('不支持的候选类型')

class BGEReranker:
    def __init__(self):
        if not (ROOT/'manifest.json').exists():
            raise FileNotFoundError('请先运行 scripts/download_reranker.py 下载完整模型')
        self.model=TextCrossEncoder(MODEL,specific_model_path=str(ROOT),threads=4,providers=['CPUExecutionProvider'])
        self.tokenizer=Tokenizer.from_file(str(ROOT/'tokenizer.json'))
        self.tokenizer.no_truncation();self.tokenizer.no_padding()
        self.lock=threading.Lock()

    def windows(self,query,text):
        if len(self.tokenizer.encode(query).ids)>240:
            raise ValueError('问题超过重排器 240 token 限额，请缩短问题')
        start=0
        while start<len(text):
            end=min(len(text),start+350)
            while len(self.tokenizer.encode(query,text[start:end]).ids)>512:
                end=start+(end-start)//2
                if end<=start:raise ValueError('重排输入超过模型限制')
            yield start,end,text[start:end]
            if end==len(text):break
            start=max(start+1,end-50)

    def rerank(self,query,candidates,top_k=5,return_all=False):
        if not query.strip() or not 5<=top_k<=10:
            raise ValueError('问题不能为空，top_k 必须为 5～10')
        unique={c['candidate_id']:c for c in candidates}
        if len(unique)>120:raise ValueError('最多允许 120 个候选')
        windows=[]
        for cid,candidate in unique.items():
            for start,end,text in self.windows(query,candidate_text(candidate)):
                windows.append((cid,start,end,text))
        if not windows:return {'results':[],'model':MODEL,'candidate_count':0}
        with self.lock:
            scores=list(self.model.rerank(query,[w[3] for w in windows],batch_size=4))
        if len(scores)!=len(windows) or any(not math.isfinite(float(s)) for s in scores):
            raise RuntimeError('重排器未返回有效评分')
        best={}
        for (cid,start,end,text),score in zip(windows,scores):
            if cid not in best or score>best[cid]['reranker_score']:
                best[cid]={**unique[cid], 'reranker_score':float(score),
                           'matched_window':{'start':start,'end':end,'text':text}}
        ordered=sorted(best.values(),key=lambda c:(-c['reranker_score'],c['candidate_id']))
        return {'results':[dict(c,rank=i+1) for i,c in enumerate(ordered if return_all else ordered[:top_k])],
                'model':MODEL,'candidate_count':len(unique),'window_count':len(windows),
                'aggregation':'maximum window score',
                'notice':'重排分为相关性分，不是事实正确率或风险概率；完整证据和范围仍须校验。'}

@lru_cache(maxsize=1)
def get_reranker():return BGEReranker()
