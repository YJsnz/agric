"""Ordinary BGE + FAISS retrieval baseline. No Neo4j, reranker or LLM calls."""
import hashlib,json
from pathlib import Path
import numpy as np
import faiss
from fastembed import TextEmbedding
from tokenizers import Tokenizer

ROOT=Path(__file__).resolve().parents[1]
STORE=ROOT/'data/botou_yali/vector'
MODEL='BAAI/bge-small-zh-v1.5'
QUERY_PREFIX='为这个句子生成表示以用于检索相关文章：'

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

class Encoder:
    def __init__(self):
        cache=ROOT/'models/embedding'
        found=sorted(cache.rglob('model_optimized.onnx'))
        if not found:raise FileNotFoundError('BGE 模型尚未下载；请先运行 scripts/download_embedding.py')
        self.directory=found[0].parent
        self.model=TextEmbedding(MODEL,specific_model_path=str(self.directory),threads=4,providers=['CPUExecutionProvider'])
        self.tokenizer=Tokenizer.from_file(str(self.directory/'tokenizer.json'))
        self.tokenizer.no_truncation();self.tokenizer.no_padding()
    def tokens(self,text):return len(self.tokenizer.encode(text).ids)
    def encode(self,texts):
        if any(self.tokens(t)>512 for t in texts):raise ValueError('输入超过模型 512 token 上限，拒绝静默截断')
        result=np.asarray(list(self.model.embed(texts,batch_size=16)),dtype=np.float32)
        faiss.normalize_L2(result)
        return result

def windows(chunk,encoder):
    prefix=chunk['title']+'\n'+chunk['section']+'\n'
    text=chunk['text'];start=0
    while start<len(text):
        end=min(len(text),start+350)
        while encoder.tokens(prefix+text[start:end])>512:
            end=start+(end-start)//2
            if end<=start:raise ValueError('标题或单字符超出模型限制')
        yield {'start':start,'end':end,'embedding_text':prefix+text[start:end]}
        if end==len(text):break
        start=max(start+1,end-50)

def build_index(store=STORE):
    store.mkdir(parents=True,exist_ok=True)
    corpus=ROOT/'data/botou_yali/graphrag_corpus_v1/processed/chunks/chunks.jsonl'
    rows=[json.loads(s) for s in corpus.read_text(encoding='utf-8').splitlines()]
    accepted=[];excluded=[]
    for c in rows:
        reason='layout_review' if c.get('needs_layout_review') else 'frontmatter' if ('ICS ' in c['text'][:20] or c['section'].replace(' ','')=='前言') else 'empty' if not c['text'].strip() else None
        if reason:excluded.append({'chunk_id':c['chunk_id'],'reason':reason})
        else:accepted.append(c)
    if not accepted:raise ValueError('没有可索引候选块')
    encoder=Encoder();entries=[]
    for c in accepted:
        for w in windows(c,encoder):entries.append(dict(chunk_id=c['chunk_id'],**w))
    vectors=encoder.encode([w['embedding_text'] for w in entries])
    index=faiss.IndexFlatIP(vectors.shape[1]);index.add(vectors)
    faiss.write_index(index,str(store/'index.faiss'))
    metadata={'format_version':1,'model':MODEL,'dimension':vectors.shape[1],'metric':'cosine via L2-normalized inner product',
      'index_type':'IndexFlatIP','query_prefix':QUERY_PREFIX,'parent_score':'maximum window cosine',
      'chunk_count':len(accepted),'vector_count':len(entries),'corpus_sha256':digest(corpus),
      'model_sha256':digest(encoder.directory/'model_optimized.onnx'),'tokenizer_sha256':digest(encoder.directory/'tokenizer.json'),
      'index_sha256':digest(store/'index.faiss'),'top_k_default':5,'graph_used':False,'llm_used':False,
      'review_status':'research_baseline_only_not_agronomic_approval','excluded':excluded,'chunks':accepted,'windows':entries}
    (store/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    return {k:metadata[k] for k in ['model','dimension','chunk_count','vector_count','corpus_sha256']}

class VectorRetriever:
    def __init__(self,store=STORE):
        self.metadata=json.loads((store/'metadata.json').read_text(encoding='utf-8'))
        if digest(store/'index.faiss')!=self.metadata['index_sha256']:raise ValueError('FAISS 与 metadata 校验不一致')
        self.index=faiss.read_index(str(store/'index.faiss'))
        if self.index.ntotal!=len(self.metadata['windows']):raise ValueError('向量数量不一致')
        self.encoder=Encoder()
        if digest(self.encoder.directory/'model_optimized.onnx')!=self.metadata['model_sha256']:raise ValueError('嵌入模型已变化，请重建索引')
        if digest(self.encoder.directory/'tokenizer.json')!=self.metadata['tokenizer_sha256']:raise ValueError('分词器已变化，请重建索引')
        if self.index.d!=self.metadata['dimension']:raise ValueError('索引维度不一致')
        self.chunks={c['chunk_id']:c for c in self.metadata['chunks']}
    def search(self,question,top_k=5):
        if not question.strip():raise ValueError('问题不能为空')
        if not 1<=top_k<=20:raise ValueError('top_k 必须为 1～20')
        query=self.encoder.encode([self.metadata['query_prefix']+question])
        # Exact search over this small baseline; deduplicate windows to original chunks.
        scores,indices=self.index.search(query,self.index.ntotal)
        results=[];seen=set()
        for score,i in zip(scores[0],indices[0]):
            w=self.metadata['windows'][int(i)];cid=w['chunk_id']
            if cid in seen:continue
            seen.add(cid);c=self.chunks[cid]
            results.append(dict(rank=len(results)+1,score=float(score),**c,
                matched_window={'start':w['start'],'end':w['end']}))
            if len(results)==top_k:break
        return results
