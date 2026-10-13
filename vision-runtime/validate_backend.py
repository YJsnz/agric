"""Numerical comparison gate for board-local FP16; not a clinical accuracy benchmark."""
import argparse
import json
import os
from pathlib import Path
import numpy as np
from pipeline import PearPipeline, iou


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("images",nargs="+")
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    results={}
    for backend in ("onnx-cpu","tensorrt"):
        os.environ["VISION_BACKEND"]=backend
        with PearPipeline() as pipeline:
            results[backend]=[pipeline.infer(path) for path in args.images]
    report=[]
    for path,cpu,gpu in zip(args.images,results["onnx-cpu"],results["tensorrt"]):
        unmatched=list(gpu["detections"])
        accepted=cpu["status"]==gpu["status"]
        for detection in cpu["detections"]:
            candidates=[(i,row) for i,row in enumerate(unmatched) if row["classId"]==detection["classId"]]
            matches=[(i,float(iou(np.array(detection["box"]),np.array([row["box"]]))[0]),row)
                     for i,row in candidates]
            best=max(matches,key=lambda item:item[1],default=None)
            if best is None or best[1]<.9 or abs(best[2]["confidence"]-detection["confidence"])>.03:
                accepted=False
            else: unmatched.pop(best[0])
        if unmatched: accepted=False
        report.append({"image":Path(path).name,"passed":accepted,
                       "cpuDetections":len(cpu["detections"]),"gpuDetections":len(gpu["detections"])})
    value={"passed":all(row["passed"] for row in report),"iouMinimum":.9,"confidenceTolerance":.03,"images":report}
    Path(args.output).write_text(json.dumps(value,indent=2),encoding="utf-8")
    print(json.dumps(value))
    if not value["passed"]: raise SystemExit(1)


if __name__=="__main__":
    main()
