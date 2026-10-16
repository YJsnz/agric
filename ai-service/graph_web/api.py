"""FastAPI routes backed by live Neo4j queries, with no JSON fallback."""
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from urllib.error import HTTPError, URLError
from server import ROOT, load_graph
from query_v2 import ask, paths
import sys
sys.path.insert(0, str(ROOT.parent))
from pydantic import BaseModel, Field
from graphrag.pipeline import analyze_question, retrieve_agricultural
from graphrag.entity_extractor import ExtractionError
from graphrag.entity_extractor import Entities
from graphrag.entity_aligner import align_entities
from graphrag.graph_retriever import retrieve_subgraph
from graphrag.dual_retriever import retrieve_dual
from graphrag.ranking import rank_evidence
from graphrag.evidence_fusion import fuse_evidence
from graphrag.query_policy import route_question
from graphrag.answer_service import ask_graphrag
from typing import Literal

class GraphRetrievalRequest(BaseModel):
    entity_ids: list[str] = Field(min_length=1, max_length=20)
    max_hops: int = Field(default=2, ge=1, le=3)
    direction: Literal['outgoing', 'incoming', 'both'] = 'both'
    include_context: bool = False
    max_edges: int = Field(default=100, ge=1, le=300)
    filters: dict[str, str] = Field(default_factory=dict)

class ExtractionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)

class FusionRequest(BaseModel):
    entity_ids: list[str] = Field(default_factory=list, max_length=20)
    filters: dict[str, str] = Field(default_factory=dict)
    question: str = Field(min_length=1, max_length=500)
    mode: Literal['research', 'strict'] = 'research'
    top_k: int = Field(default=5, ge=1, le=20)

class DualRequest(ExtractionRequest):
    entities: Entities | None = None
    mode: Literal['research', 'strict'] = 'research'

class RerankRequest(DualRequest):
    top_k: int = Field(default=5,ge=5,le=10)

app = FastAPI(title='沧州农业知识图谱接口', version='2.2.0')
from wheat.router import router as wheat_router
from jujube.router import router as jujube_router
app.include_router(wheat_router)
from wheat_diagnosis.router import router as wheat_diagnosis_router
app.include_router(wheat_diagnosis_router)
app.include_router(jujube_router)
from qingxian_diagnosis.router import router as qingxian_router
app.include_router(qingxian_router)
# Reuse the unified service process; load frozen tomato models lazily per worker.
from tomato_diagnosis.app import app as tomato_app
app.include_router(tomato_app.router)

@app.post('/api/graphrag/ask')
def answer_question(body: ExtractionRequest):
    try:
        return ask_graphrag(body.question,load_graph())
    except ExtractionError as error:
        return JSONResponse({'error':str(error)},status_code=502)
    except ValueError as error:
        return JSONResponse({'error':str(error)},status_code=400)
    except (OSError,RuntimeError,KeyError):
        return JSONResponse({'error':'问答依赖不可用，请检查数据库、模型及索引。'},status_code=503)

@app.post('/api/graphrag/rerank')
def rerank_search(body: RerankRequest):
    try:
        policy=route_question(body.question)
        if body.mode=='strict':policy={**policy,'mode':'strict'}
        dual=retrieve_dual(body.question,load_graph(),body.entities.model_dump() if body.entities else None,body.mode,policy=policy)
        candidates,rejected=fuse_evidence(dual)
        if dual.get('missing_scope'):candidates=[]
        result=rank_evidence(body.question,candidates,body.top_k)
        return {**result,'channels':dual['channels'],'graph_sources':dual['graph_sources'],
                'alignments':dual['alignments'],'corpus_sha256':dual['corpus_sha256'],
                'policy':policy,'evidence_rejections':rejected,'missing_scope':dual.get('missing_scope',[])}
    except ValueError as error:
        return JSONResponse({'error':str(error)},status_code=400)
    except ExtractionError as error:
        return JSONResponse({'error':str(error)},status_code=502)
    except (OSError,RuntimeError):
        return JSONResponse({'error':'重排服务不可用，请检查图谱、索引与模型文件。'},status_code=503)

@app.post('/api/graphrag/dual')
def dual_search(body: DualRequest):
    try:
        return retrieve_dual(body.question, load_graph(), body.entities.model_dump() if body.entities else None, body.mode)
    except ExtractionError as error:
        return JSONResponse({'error': str(error)}, status_code=502)
    except ValueError as error:
        return JSONResponse({'error': str(error)}, status_code=400)
    except (OSError, KeyError, IndexError):
        return JSONResponse({'error': '双路检索依赖不可用，请检查 Neo4j、FAISS 索引与模型。'}, status_code=503)

@app.post('/api/graphrag/extract')
def extract_question(body: ExtractionRequest):
    try:
        return analyze_question(body.question, load_graph())
    except ValueError as error:
        return JSONResponse({'error': str(error)}, status_code=400)
    except ExtractionError as error:
        return JSONResponse({'error': str(error)}, status_code=502)
    except (HTTPError, URLError, OSError, KeyError, IndexError):
        return JSONResponse({'error': '图谱暂时不可用，未执行实体对齐。'}, status_code=503)

@app.post('/api/graphrag/align')
def align_question(body: Entities):
    return execute(lambda graph: align_entities(body.model_dump(), graph))

@app.post('/api/graphrag/retrieve')
def graph_retrieval(body: GraphRetrievalRequest):
    return execute(lambda graph: retrieve_subgraph(graph, **body.model_dump()))

@app.post('/api/graphrag/search')
def agricultural_search(body: FusionRequest):
    return execute(lambda graph: retrieve_agricultural(body.question, graph, body.entity_ids,
                   body.filters, body.mode, body.top_k))

@app.middleware('http')
async def headers(request, call_next):
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

def execute(operation):
    try:
        return operation(load_graph())
    except ValueError as error:
        return JSONResponse({'error': str(error)}, status_code=400)
    except (HTTPError, URLError, OSError, KeyError, IndexError):
        return JSONResponse({'error': 'Neo4j 暂时不可用，请检查数据库及连接配置。'}, status_code=503)

@app.get('/api/graph')
def graph(crop: str = 'pear'):
    if crop in ('vegetable','qingxian_facility_vegetables'):
        from qingxian_diagnosis.knowledge_service import store
        try:
            return store.load_graph()
        except (OSError,RuntimeError,ValueError):
            return JSONResponse({'error':'设施蔬菜图谱暂不可用，请检查数据库及独立图谱导入。'},status_code=503)
    if crop in ('jujube','cangzhou_jinsixiaozao'):
        from jujube.runtime import load_graph as load_jujube_graph
        try:
            return load_jujube_graph()
        except (OSError,RuntimeError,ValueError):
            return JSONResponse({'error':'金丝小枣实时图谱暂不可用，请检查独立图谱导入及数据库。'},status_code=503)
    if crop in ('wheat','huanghua_hanjianmai'):
        from wheat.repository import load_graph as load_wheat_graph
        try:
            return load_wheat_graph()
        except (OSError,RuntimeError,ValueError):
            return JSONResponse({'error':'旱碱麦实时图谱暂不可用，请检查独立图谱导入及数据库。'},status_code=503)
    if crop not in ('pear','botou_yali'):
        return JSONResponse({'error':'该作物暂未收录知识图谱'},status_code=404)
    return execute(lambda g: g)

@app.get('/api/paths')
def graph_paths(request: Request, start: str = '', end: str = ''):
    return execute(lambda g: {'paths': paths(g, start, end, dict(request.query_params))})

@app.get('/api/ask')
def graph_ask(request: Request, question: str = ''):
    return execute(lambda g: ask(g, question, dict(request.query_params)))

@app.get('/')
@app.get('/index.html')
def home():
    return FileResponse(ROOT / 'static/dashboard.html')

@app.get('/images/{image_name}')
def serve_image(image_name: str):
    if image_name not in {'wheat.png','jujube.png','pear.png','vegetables.png','sidebar-crops.png','crop-interface.png','workspace.png','sidebar-overview.png'}:
        return JSONResponse({'error':'图片不存在'}, status_code=404)
    return FileResponse(ROOT / 'static' / 'images' / image_name, media_type='image/png')

@app.get('/graph-fix.js')
def serve_graph_fix():
    return FileResponse(ROOT / 'static' / 'graph-fix.js', media_type='application/javascript')

@app.get('/{asset}')
def static_asset(asset: str):
    if asset not in {'dashboard.js','dashboard.css','app.js','style.css','farm-aerial.png'}:
        return JSONResponse({'error':'页面不存在'}, status_code=404)
    return FileResponse(ROOT / 'static' / asset)
