"""A requested accelerator must succeed; never silently fall back to CPU."""
import os


class OnnxCpu:
    def __init__(self, model):
        import onnxruntime as ort
        options = ort.SessionOptions()
        options.intra_op_num_threads = max(1, min(8, int(os.getenv("VISION_CPU_THREADS", "2"))))
        options.inter_op_num_threads = 1
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self.session = ort.InferenceSession(str(model), sess_options=options, providers=["CPUExecutionProvider"])
        self.name = self.session.get_inputs()[0].name
        self.info = {"backend": "onnx-cpu", "version": ort.__version__, "precision": "fp32"}

    def run(self, tensor):
        return self.session.run(None, {self.name: tensor})[0]

    def close(self):
        self.session = None


def create_backend(model, manifest):
    backend = os.getenv("VISION_BACKEND", "onnx-cpu").lower()
    preprocess = os.getenv('VISION_PREPROCESS', 'pillow')
    if preprocess not in ('pillow', 'cuda-fused'):
        raise ValueError('VISION_PREPROCESS must be pillow or cuda-fused')
    if preprocess == 'cuda-fused' and backend != 'tensorrt':
        raise ValueError('cuda-fused requires the TensorRT backend; use pillow for CPU')
    if backend == "onnx-cpu":
        return OnnxCpu(model)
    if backend == "tensorrt":
        from tensorrt_backend import TensorRtBackend
        return TensorRtBackend(manifest)
    raise ValueError(f"Unsupported VISION_BACKEND: {backend}")
