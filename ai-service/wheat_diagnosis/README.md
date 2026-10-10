# Wheat visual diagnosis service (stage 2)

Registered in the existing `main:app` via `graph_web/api.py`:

- `POST /api/wheat/diagnose`: multipart `leaf_image`, `canopy_image`, `head_image`,
  all optional; optional growth_stage, soil_moisture, soil_salinity, temperature,
  humidity, region, and `knowledge_enabled=true` by default. Requires an image or
  nonempty context (zero is valid). Set knowledge_enabled=false for visual only.
- `GET /api/wheat/models/status`: reads lazy model state without loading weights.

Use existing ai-service virtual environment, e.g. `python -m uvicorn main:app --host 127.0.0.1 --port 8090`.
No change to pear's separate dev server or existing wheat ask route.

Missing context stays null. Soil values are preserved without inferring units.
Measurements enter the structured retrieval context with unit=null until explicitly
specified by an input contract; the current form does not provide units. No value or location is
inferred from an image or the crop name. PIL/path inputs are supported; ndarray
inputs use uint8 RGB. Upload limit is 20 MB per image, JPEG/PNG/WEBP, single frame.

Models load lazily once per worker process and each model has a prediction lock.
No weights are copied. WHEAT_MODEL_A_PATH/B_PATH/C_PATH override centralized paths.
Missing/invalid model files do not prevent startup. Status includes path, loaded,
load_error and device. CPU is used when CUDA is unavailable.

B uses the fixed water_stress **visual_score >= 0.37** for both output classes,
not top-1 classification and not a physical water-deficit probability. C uses
conf=0.25, imgsz=640, NMS IoU=0.7, max_det=300; boxes are input-image pixel
coordinates (after EXIF orientation). No detections => mean_confidence=null.
A's score is only a classification score; yellowing does not confirm nitrogen deficiency.

Individual input/model failures produce a warning and null observation, while
other inputs continue. If no input/context can be processed, HTTP500; empty
request HTTP400; invalid form parameters HTTP422. HTTP200 does not mean a disease diagnosis.

Knowledge mode reuses the existing wheat namespace via wheat.repository.load_graph,
wheat.vector.search (existing BGE/FAISS index), and wheat.service.retrieve_evidence.
The latter is the unchanged retrieval/admission/ranking block factored out of ask;
the old text endpoint uses the same function and retains its original semantics.
Exact name/declared alias alignment uses graphrag.entity_aligner (no pear alias rules).
graphrag.query_policy routes the short question; full structured context is separate.
graphrag.dual_retriever.path_candidates preserves actual relationship directions.
Shared graphrag.crop_runtime.grounded_answer calls existing DeepSeek generation,
validate_citations, normalize_citations and audit_answer. No second LLM client.

Implementation audit: the generic retrieve_dual/get_retriever pipeline is currently
pear-bound; query_v2 also has a pear-specific region whitelist and graph evidence
schema. Wheat's reviewed graph uses verbatim_verified and official_standard instead
of the generic A/B/C/source_checked contract. Passing wheat through those entry
points would silently reject valid wheat evidence or query the wrong index. This
adapter therefore reuses the **actual existing wheat pipeline**, not those pear
entry points. No graph data, index, core GraphRAG rules or evidence grades are changed.

Visual hints are candidates only. Head counts never create disease candidates.
Matched entity IDs do not establish current occurrence. Source fields, locators,
review status and evidence level survive retrieval. All evidence is candidate
explanation only; none is promoted to a local conclusion. Missing or failed
grounding suppresses assessment, recommendations and published citations. Status
insufficient_evidence remains valid even with a grounded preliminary answer.

Neo4j has its existing 30-second timeout; generation and audit each have 60-second
timeouts and at most two attempts. Vector retrieval has a 90-second bounded wait
and only one worker per process, including a timed-out worker. Partial failures
preserve visuals and successful channels. During Neo4j outages only source metadata
is read from the existing local catalogue for vector citations, never graph facts.
Generation failure returns assessment=null. `generation_called=true` indicates a
completed shared generation invocation; `generation_attempted` records failed calls.

The pear decoder currently lives inside its endpoint and its model is pear-label
specific. Wheat follows the same upload validation and lazy/locked service style,
without importing an endpoint as a utility or altering pear code.

Tests (run in ai-service):

    .venv\Scripts\python.exe -m unittest discover -s wheat_diagnosis/tests -p "test_*.py"
    .venv\Scripts\python.exe -m unittest discover -s pear_diagnosis/tests -p "test_*.py"
    .venv\Scripts\python.exe -m unittest wheat.test_wheat
    .venv\Scripts\python.exe wheat_diagnosis/tests/run_real_smoke.py
    .venv\Scripts\python.exe wheat_diagnosis/tests/run_real_full_diagnosis.py

The smoke script explicitly disables knowledge. The full script runs four real
requests and writes tests/artifacts/real_full_diagnosis.json; it does not assert
that citations pass or fabricate a successful answer when they fail.
These tests report service operation, not model accuracy. Restart long-running
services after changing credentials; environment variables override .env.local.
