"""Warm latency and stage timing; run each backend separately on the target board."""
import argparse
import json
import platform
import statistics
import time
from pipeline import PearPipeline


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("image")
    parser.add_argument("--iterations", type=int, default=30)
    parser.add_argument("--output")
    args = parser.parse_args()
    if not 5 <= args.iterations <= 10000:
        parser.error("iterations must be 5..10000")
    started = time.perf_counter()
    with PearPipeline() as pipeline:
        load_ms = (time.perf_counter() - started) * 1000
        for _ in range(3):
            pipeline.infer(args.image)
        results = [pipeline.infer(args.image) for _ in range(args.iterations)]
        if any("inferenceMs" not in row["timings"] for row in results):
            raise ValueError("Quality gate skipped inference; use a valid leaf image")
        durations = sorted(row["durationMs"] for row in results)
        report = {"architecture": platform.machine(), "runtime": pipeline.runtime, "iterations": args.iterations,
                  "loadMs": round(load_ms, 2), "medianMs": statistics.median(durations),
                  "p95Ms": durations[min(len(durations)-1, int(len(durations)*.95))],
                  "meanInferenceMs": round(statistics.mean(row["timings"]["inferenceMs"] for row in results), 2),
                  "lastResult": results[-1]}
        value = json.dumps(report, ensure_ascii=False, indent=2)
        if args.output:
            from pathlib import Path
            Path(args.output).write_text(value, encoding="utf-8")
        print(value)


if __name__ == "__main__":
    main()
