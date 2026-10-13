"""CLI and line-delimited JSON worker entry point."""
import argparse
import json
import sys
from pipeline import PearPipeline


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("image", nargs="?")
    parser.add_argument("--worker", action="store_true")
    args = parser.parse_args()
    with PearPipeline() as pipeline:
        if args.worker:
            print(json.dumps({"type": "ready", "runtime": pipeline.runtime}), flush=True)
            for line in sys.stdin:
                request = {}
                try:
                    request = json.loads(line)
                    response = {"id": request["id"], "result": pipeline.infer(request["path"])}
                except Exception as error:
                    print(str(error), file=sys.stderr, flush=True)
                    response = {"id": request.get("id"), "error": "视觉推理失败，请检查图像或运行时日志"}
                print(json.dumps(response, ensure_ascii=False), flush=True)
        else:
            if not args.image:
                parser.error("image is required without --worker")
            print(json.dumps(pipeline.infer(args.image), ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
