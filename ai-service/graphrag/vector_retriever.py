"""Reuse the unchanged ordinary vector baseline as a recall channel."""
from functools import lru_cache
from app.vector_rag import VectorRetriever

@lru_cache(maxsize=1)
def get_retriever():
    return VectorRetriever()
