"""TensorRT 10 explicit IO, reusable CUDA buffers and one stream, without PyTorch."""
import ctypes as ct
import ctypes.util
import hashlib
import json
import os
import pathlib
import platform
import numpy as np


class CudaRuntime:
    def __init__(self):
        self.lib = ct.CDLL(os.getenv("CUDART_LIBRARY") or ctypes.util.find_library("cudart") or "libcudart.so")
        signatures = {
            "cudaMalloc": [ct.POINTER(ct.c_void_p), ct.c_size_t], "cudaFree": [ct.c_void_p],
            "cudaStreamCreate": [ct.POINTER(ct.c_void_p)], "cudaStreamDestroy": [ct.c_void_p],
            "cudaStreamSynchronize": [ct.c_void_p],
            "cudaMemcpyAsync": [ct.c_void_p, ct.c_void_p, ct.c_size_t, ct.c_int, ct.c_void_p],
        }
        for name, arguments in signatures.items():
            function = getattr(self.lib, name)
            function.argtypes, function.restype = arguments, ct.c_int

    def call(self, name, *args):
        code = getattr(self.lib, name)(*args)
        if code:
            raise RuntimeError(f"{name} failed with CUDA status {code}")


class TensorRtBackend:
    def __init__(self, manifest):
        import tensorrt as trt
        path = pathlib.Path(os.environ["VISION_ENGINE"])
        metadata = json.loads(path.with_suffix(path.suffix + ".json").read_text(encoding="utf-8"))
        if metadata["onnxSha256"] != manifest["sha256"]:
            raise ValueError("Engine belongs to another ONNX model; rebuild locally")
        if metadata["tensorrtVersion"] != trt.__version__ or metadata["architecture"] != platform.machine():
            raise ValueError("TensorRT/platform changed; rebuild engine on this Jetson")
        if hashlib.sha256(path.read_bytes()).hexdigest() != metadata["engineSha256"]:
            raise ValueError("TensorRT engine checksum mismatch")
        self.logger = trt.Logger(trt.Logger.WARNING)
        self.runtime = trt.Runtime(self.logger)
        self.engine = self.runtime.deserialize_cuda_engine(path.read_bytes())
        if self.engine is None:
            raise ValueError("Cannot deserialize engine on this device; rebuild locally")
        self.context = self.engine.create_execution_context()
        if self.context is None:
            raise RuntimeError("Cannot create execution context")
        self.cuda, self.stream, self.buffers = CudaRuntime(), ct.c_void_p(), {}
        self.inputs, self.outputs = [], []
        try:
            self.cuda.call("cudaStreamCreate", ct.byref(self.stream))
            for index in range(self.engine.num_io_tensors):
                name = self.engine.get_tensor_name(index)
                shape = tuple(self.engine.get_tensor_shape(name))
                if any(value <= 0 for value in shape):
                    raise ValueError("Only fixed-shape engines are supported")
                if self.engine.get_tensor_location(name) != trt.TensorLocation.DEVICE:
                    raise ValueError("Only device IO tensors are supported")
                if self.engine.get_tensor_format(name) != trt.TensorFormat.LINEAR:
                    raise ValueError("Only linear IO tensors are supported")
                host, device = np.empty(shape, dtype=trt.nptype(self.engine.get_tensor_dtype(name))), ct.c_void_p()
                self.cuda.call("cudaMalloc", ct.byref(device), host.nbytes)
                self.buffers[name] = (host, device)
                if not self.context.set_tensor_address(name, device.value):
                    raise RuntimeError("TensorRT rejected buffer address")
                (self.inputs if self.engine.get_tensor_mode(name) == trt.TensorIOMode.INPUT else self.outputs).append(name)
            if len(self.inputs) != 1 or len(self.outputs) != 1:
                raise ValueError("Pear detector requires one input and one output")
            if self.buffers[self.inputs[0]][0].shape != (1, 3, manifest["inputSize"], manifest["inputSize"]):
                raise ValueError("Unexpected TensorRT input shape")
            self.info = {"backend": "tensorrt", "version": trt.__version__, "precision": metadata["precision"],
                         "engineSha256": metadata["engineSha256"]}
        except Exception:
            self.close()
            raise

    def run(self, tensor):
        host, device = self.buffers[self.inputs[0]]
        if tensor.shape != host.shape:
            raise ValueError("Input shape mismatch")
        np.copyto(host, tensor, casting="same_kind")
        self.cuda.call("cudaMemcpyAsync", device, ct.c_void_p(host.ctypes.data), host.nbytes, 1, self.stream)
        if not self.context.execute_async_v3(self.stream.value):
            raise RuntimeError("TensorRT enqueue failed")
        result, output_device = self.buffers[self.outputs[0]]
        self.cuda.call("cudaMemcpyAsync", ct.c_void_p(result.ctypes.data), output_device, result.nbytes, 2, self.stream)
        self.cuda.call("cudaStreamSynchronize", self.stream)
        return result

    def close(self):
        if getattr(self, "stream", None) and self.stream.value:
            self.cuda.call("cudaStreamSynchronize", self.stream)
        for _, pointer in getattr(self, "buffers", {}).values():
            self.cuda.call("cudaFree", pointer)
        self.buffers = {}
        if getattr(self, "stream", None) and self.stream.value:
            self.cuda.call("cudaStreamDestroy", self.stream)
            self.stream = ct.c_void_p()
        self.context = self.engine = self.runtime = None
