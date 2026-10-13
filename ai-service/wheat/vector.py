"""Actual BGE/FAISS index, independent of the pear vector store."""
import json,hashlib
from functools import lru_cache
import faiss
from app.vector_rag import Encoder,QUERY_PREFIX
from .build import ROOT,save
CORPUS=ROOT/'graphrag_corpus_v1/reviewed_chunks.json'
STORE=ROOT/'vector'

@lru_cache(maxsize=1)
def encoder():return Encoder()

def build_index():
    chunks=json.loads(CORPUS.read_text(encoding='utf-8'))
    texts=[c['metadata']['topic']+' '+c['text'] for c in chunks]
    vectors=encoder().encode(texts)
    idx=faiss.IndexFlatIP(vectors.shape[1]);idx.add(vectors)
    faiss.write_index(idx,str(STORE/'reviewed.faiss'))
    save(STORE/'reviewed_metadata.json',{'model':'BAAI/bge-small-zh-v1.5','corpus_sha256':hashlib.sha256(CORPUS.read_bytes()).hexdigest(),'chunks':chunks,'dimension':idx.d,'count':idx.ntotal})
    return {'vectors':idx.ntotal,'dimension':idx.d}

def search(question,eligible,top_k=6):
    meta=json.loads((STORE/'reviewed_metadata.json').read_text(encoding='utf-8'))
    if meta['corpus_sha256']!=hashlib.sha256(CORPUS.read_bytes()).hexdigest():raise ValueError('Wheat corpus/index mismatch')
    idx=faiss.read_index(str(STORE/'reviewed.faiss'))
    if idx.ntotal!=len(meta['chunks']):raise ValueError('Wheat index count mismatch')
    scores,ids=idx.search(encoder().encode([QUERY_PREFIX+question]),idx.ntotal)
    rows=[]
    for score,i in zip(scores[0],ids[0]):
        c=meta['chunks'][int(i)]
        if eligible(c):rows.append({**c,'score':float(score)})
    return rows[:top_k]

if __name__=='__main__':print(build_index())
