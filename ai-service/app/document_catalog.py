"""Metadata filtering; document topics never imply universal agronomic applicability."""
import json
from pathlib import Path
CATALOG=Path(__file__).resolve().parents[1]/'data/botou_yali/graphrag_corpus_v1/fulltext/metadata/sources.jsonl'

def find_documents(*, crop=None, region=None, stage=None, evidence_level=None, fulltext_only=False):
    records=[json.loads(line) for line in CATALOG.read_text(encoding='utf-8').splitlines() if line.strip()]
    return [r for r in records if
        (not crop or crop in r['crop']) and
        (not region or region in r['region']) and
        (not stage or stage in r['applicable_stages']) and
        (not evidence_level or evidence_level==r['evidence_level']) and
        (not fulltext_only or r['fulltext_path'])]
