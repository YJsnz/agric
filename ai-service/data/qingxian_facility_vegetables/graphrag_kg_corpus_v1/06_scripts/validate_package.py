import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
for rel in ["01_sources/source_manifest.jsonl","02_rag/documents/documents.jsonl","02_rag/chunks/chunks.jsonl","03_kg/entities.jsonl","03_kg/relations.jsonl"]:
    p=ROOT/rel
    n=0
    with p.open(encoding="utf-8") as f:
        for line in f:
            json.loads(line); n+=1
    print(rel, "OK", n)
