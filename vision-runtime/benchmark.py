"""Warm latency and stage timing; run each backend separately on the target board."""
import argparse
import json
import platform
import statistics
import time
from pipeline import PearPipeline


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("images", nargs="+")
    parser.add_argument("--iterations", type=int, default=30)
    parser.add_argument("--warmup", type=int, default=3)
    parser.add_argument("--output")
    args = parser.parse_args()
    if not 5 <= args.iterations <= 10000 or not 0 <= args.warmup <= 1000:
        parser.error("iterations must be 5..10000; warmup must be 0..1000")
    started = time.perf_counter()
    with PearPipeline() as pipeline:
        load_ms = (time.perf_counter() - started) * 1000
        for _ in range(args.warmup):
            for image in args.images:
                pipeline.infer(image)
        results = [pipeline.infer(image) for _ in range(args.iterations) for image in args.images]
        if any("inferenceMs" not in row["timings"] for row in results):
            raise ValueError("Quality gate skipped inference; use a valid leaf image")
        def summary(values):
            values = sorted(values)
            return {"medianMs": round(statistics.median(values), 3),
                    "p95Ms": round(values[min(len(values)-1, int(len(values)*.95))], 3)}

        stage_names = ("imageDecodeMs", "preprocessMs", "inferenceMs", "postprocessMs")
        stage_timings = {name: summary([row["timings"][name] for row in results])
                         for name in stage_names if all(name in row["timings"] for row in results)}
        total = summary([row["durationMs"] for row in results])
        report = {"architecture": platform.machine(), "runtime": pipeline.runtime, "iterations": args.iterations,
                  "warmup": args.warmup, "images": args.images, "samples": len(results),
                  "loadMs": round(load_ms, 3), "medianMs": total["medianMs"], "p95Ms": total["p95Ms"],
                  "fpsAtMedian": round(1000/total["medianMs"], 2) if total["medianMs"] else None,
                  "stageTimings": stage_timings,
                  "lastResult": results[-1]}
        value = json.dumps(report, ensure_ascii=False, indent=2)
        if args.output:
            from pathlib import Path
            Path(args.output).write_text(value, encoding="utf-8")
        print(value)


if __name__ == "__main__":
    main()
