"""Shared image preparation and class-aware NMS for CPU and TensorRT."""
import hashlib
import json
import os
import pathlib
import time
import numpy as np
from PIL import Image, ImageOps
from backends import create_backend

ROOT = pathlib.Path(__file__).resolve().parent
LABELS = {"healthy": "外观健康叶片", "healthy_leaf": "外观健康叶片", "health": "外观健康叶片",
          "pear_slug": "梨叶害虫症状", "slug": "叶片虫害症状", "spot": "叶斑症状",
          "leaf_spot": "叶斑症状", "curl": "卷叶症状"}


def iou(box, others):
    corner = np.maximum(box[:2], others[:, :2])
    end = np.minimum(box[2:], others[:, 2:])
    inter = np.maximum(0, end - corner).prod(axis=1)
    return inter / np.maximum(1e-8, (box[2:] - box[:2]).prod()
                             + (others[:, 2:] - others[:, :2]).prod(axis=1) - inter)


def decode(output, manifest, width, height, ratio, left, top, threshold):
    # Pinned YOLOv8: [batch, 4 + classes, candidates], no objectness.
    if output.ndim != 3 or output.shape[0] != 1 or output.shape[1] != 4 + len(manifest["classes"]):
        raise ValueError("Unsupported model output layout")
    if not np.isfinite(output).all():
        raise ValueError("Non-finite inference output")
    raw = output[0].T
    classes, scores = raw[:, 4:].argmax(axis=1), raw[:, 4:].max(axis=1)
    keep = scores >= threshold
    coords, scores, classes = raw[keep, :4], scores[keep], classes[keep]
    boxes = np.concatenate((coords[:, :2] - coords[:, 2:] / 2, coords[:, :2] + coords[:, 2:] / 2), axis=1)
    detections, order = [], np.argsort(-scores, kind="stable")
    while len(order) and len(detections) < 50:
        index = order[0]
        box = boxes[index].copy()
        box[[0, 2]] = np.clip((box[[0, 2]] - left) / ratio, 0, width)
        box[[1, 3]] = np.clip((box[[1, 3]] - top) / ratio, 0, height)
        name = manifest["classes"][str(int(classes[index]))]
        if box[2] > box[0] and box[3] > box[1]:
            detections.append({"classId": int(classes[index]), "className": name,
                               "label": LABELS.get(name.lower().replace(" ", "_"), name),
                               "confidence": round(float(scores[index]), 4),
                               "box": [round(float(v), 2) for v in box]})
        rest = order[1:]
        order = rest[(classes[rest] != classes[index]) | (iou(boxes[index], boxes[rest]) < .45)]
    return detections


class PearPipeline:
    def __init__(self):
        self.manifest = json.loads((ROOT / "models/manifest.json").read_text(encoding="utf-8"))
        model = ROOT / "models/pear-leaf.onnx"
        # Once per resident worker, rather than once per camera frame.
        if hashlib.sha256(model.read_bytes()).hexdigest() != self.manifest["sha256"]:
            raise ValueError("模型校验失败，请重新安装视觉模型")
        self.threshold = float(os.getenv("VISION_CONFIDENCE", ".55"))
        if not 0 < self.threshold < 1:
            raise ValueError("VISION_CONFIDENCE must be between 0 and 1")
        self.backend = create_backend(model, self.manifest)
        self.runtime = self.backend.info
        self.runtime['preprocess'] = os.getenv('VISION_PREPROCESS', 'pillow')

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.backend.close()

    def infer(self, path):
        started = time.perf_counter()
        with Image.open(path) as original:
            if original.width * original.height > 20_000_000:
                raise ValueError("Image exceeds 20 megapixels")
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.load()
        width, height = image.size
        gpu = self.runtime['preprocess'] == 'cuda-fused'
        prep_start = time.perf_counter()
        if gpu:
            tensor, (ratio,left,top), quality, std = self.backend.prepare_image(np.asarray(image))
        else:
            gray = np.asarray(image).mean(axis=2)
            quality = {"brightness": round(float(gray.mean()), 2), "width": width, "height": height}
            std = float(gray.std())
        prep_ms = (time.perf_counter()-prep_start)*1000
        warnings = []
        if min(width, height) < 128:
            warnings.append("图像分辨率不足，请上传清晰的叶片近照")
        if quality["brightness"] < 15 or quality["brightness"] > 245:
            warnings.append("图像过暗或过曝，请重新采集")
        if std < 5:
            warnings.append("图像缺少可辨认细节，请重新采集")
        base = {"modelId": self.manifest["modelId"], "modelSha256": self.manifest["sha256"],
                "pipelineVersion": "pear-leaf-resident-2.0", "task": self.manifest["task"],
                "imageWidth": width, "imageHeight": height, "quality": quality,
                "limitations": self.manifest["limitations"], "confidenceThreshold": self.threshold,
                "detections": [], "warnings": warnings, "runtime": self.runtime}
        timings = {}
        if not warnings:
            if not gpu:
                resize_start = time.perf_counter()
                size = self.manifest["inputSize"]
                ratio = min(size / width, size / height)
                resized = image.resize((max(1,round(width * ratio)), max(1,round(height * ratio))), Image.Resampling.BILINEAR)
                left, top = (size - resized.width) // 2, (size - resized.height) // 2
                padded = Image.new("RGB", (size, size), (114, 114, 114))
                padded.paste(resized, (left, top))
                tensor = np.ascontiguousarray(np.asarray(padded, dtype=np.float32).transpose(2, 0, 1)[None] / 255)
                prep_ms += (time.perf_counter()-resize_start)*1000
            timings["preprocessMs"] = round(prep_ms, 2)
            infer_start = time.perf_counter()
            output = self.backend.run(tensor)
            timings["inferenceMs"] = round((time.perf_counter() - infer_start) * 1000, 2)
            decode_start = time.perf_counter()
            base["detections"] = decode(output, self.manifest, width, height, ratio, left, top, self.threshold)
            timings["postprocessMs"] = round((time.perf_counter() - decode_start) * 1000, 2)
            if not base["detections"]:
                warnings.append("没有可靠检出；请确认是梨叶近照，未检出不能判定健康")
        return dict(base, status="COMPLETED" if base["detections"] else "NEEDS_REVIEW",
                    timings=timings, durationMs=round((time.perf_counter() - started) * 1000))
