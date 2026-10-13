import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from graphrag.entity_extractor import extract_entities, ExtractionError

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('question')
    args = parser.parse_args()
    try:
        print(json.dumps(extract_entities(args.question).model_dump(), ensure_ascii=False, indent=2))
    except (ExtractionError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
