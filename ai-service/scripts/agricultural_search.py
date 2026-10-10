import argparse
import json
import sys
import urllib.request
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.pipeline import retrieve_agricultural
from graphrag.fusion import FusionConfig

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    parser=argparse.ArgumentParser()
    parser.add_argument('question')
    parser.add_argument('--entity-id', action='append', default=[])
    parser.add_argument('--region'); parser.add_argument('--crop'); parser.add_argument('--stage')
    parser.add_argument('--mode', choices=['research','strict'], default='research')
    parser.add_argument('--config', type=Path)
    parser.add_argument('--output', type=Path)
    args=parser.parse_args()
    with urllib.request.urlopen('http://127.0.0.1:8090/api/graph', timeout=30) as response:
        graph=json.load(response)
    config=FusionConfig(**json.loads(args.config.read_text(encoding='utf-8'))) if args.config else FusionConfig()
    context={k:getattr(args,k) for k in ('region','crop','stage') if getattr(args,k)}
    result=retrieve_agricultural(args.question, graph, args.entity_id, context, args.mode, config=config)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='graph_retrieval'}, ensure_ascii=False, indent=2))
