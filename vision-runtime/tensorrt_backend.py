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
            "cudaMallocHost": [ct.POINTER(ct.c_void_p), ct.c_size_t], "cudaFreeHost": [ct.c_void_p],
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
        self.postprocessor = None
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
                         "engineSha256": metadata["engineSha256"],
                         "postprocess": os.getenv('VISION_POSTPROCESS', 'cpu').lower()}
            if self.info['postprocess'] == 'cuda-nms':
                output_host = self.buffers[self.outputs[0]][0]
                expected_channels = 4 + len(manifest['classes'])
                if output_host.dtype != np.float32 or len(output_host.shape) != 3 or \
                        output_host.shape[0] != 1 or output_host.shape[1] != expected_channels:
                    raise ValueError('CUDA NMS requires FP32 YOLO output with shape [1, 4+classes, candidates]')
                from cuda_postprocess import CudaPostprocessor
                self.postprocessor = CudaPostprocessor(self.cuda, self.stream, len(manifest['classes']),
                                                       output_host.shape[2])
            self.preprocessor = None
            if os.getenv('VISION_PREPROCESS', 'pillow') == 'cuda-fused':
                from cuda_preprocess import CudaPreprocessor
                if self.buffers[self.inputs[0]][0].dtype != np.float32:
                    raise ValueError('CUDA preprocessing requires FP32 input IO (internal TensorRT FP16 is supported)')
                self.preprocessor = CudaPreprocessor(self.cuda, self.stream, manifest['inputSize'])
        except Exception:
            self.close()
            raise

    def run(self, tensor):
        from cuda_preprocess import DeviceTensor
        host, device = self.buffers[self.inputs[0]]
        if tensor.shape != host.shape:
            raise ValueError("Input shape mismatch")
        if isinstance(tensor, DeviceTensor):
            if tensor.pointer != device.value or tensor.stream != self.stream.value:
                raise ValueError('Device tensor must belong to this backend and stream')
        else:
            np.copyto(host, tensor, casting="same_kind")
            self.cuda.call("cudaMemcpyAsync", device, ct.c_void_p(host.ctypes.data), host.nbytes, 1, self.stream)
        if not self.context.execute_async_v3(self.stream.value):
            raise RuntimeError("TensorRT enqueue failed")
        result, output_device = self.buffers[self.outputs[0]]
        if self.postprocessor is not None:
            # Keep stage timings meaningful: inferenceMs includes completion
            # of TensorRT, while postprocessMs measures CUDA NMS and compact D2H.
            self.cuda.call("cudaStreamSynchronize", self.stream)
            from cuda_preprocess import DeviceTensor
            return DeviceTensor(output_device.value, result.shape, self.stream.value)
        self.cuda.call("cudaMemcpyAsync", ct.c_void_p(result.ctypes.data), output_device, result.nbytes, 2, self.stream)
        self.cuda.call("cudaStreamSynchronize", self.stream)
        return result

    def postprocess(self, output, width, height, ratio, left, top, threshold):
        if self.postprocessor is None:
            raise RuntimeError('CUDA NMS is not enabled')
        expected = self.buffers[self.outputs[0]][1].value
        if output.pointer != expected:
            raise ValueError('TensorRT output buffer does not belong to this backend')
        return self.postprocessor.process(output, width, height, ratio, left, top, threshold)

    def prepare_image(self, rgb):
        if self.preprocessor is None:
            raise RuntimeError('CUDA preprocessor not enabled')
        return self.preprocessor.prepare(rgb, self.buffers[self.inputs[0]][1])

    def prepare_device_image(self, image):
        if self.preprocessor is None:
            raise RuntimeError('CUDA preprocessor not enabled')
        return self.preprocessor.prepare_device_image(image, self.buffers[self.inputs[0]][1])

    def close(self):
        if getattr(self, 'preprocessor', None) is not None:
            self.preprocessor.close()
            self.preprocessor = None
        if getattr(self, 'postprocessor', None) is not None:
            self.postprocessor.close()
            self.postprocessor = None
        if getattr(self, "stream", None) and self.stream.value:
            self.cuda.call("cudaStreamSynchronize", self.stream)
        for _, pointer in getattr(self, "buffers", {}).values():
            self.cuda.call("cudaFree", pointer)
        self.buffers = {}
        if getattr(self, "stream", None) and self.stream.value:
            self.cuda.call("cudaStreamDestroy", self.stream)
            self.stream = ct.c_void_p()
        self.context = self.engine = self.runtime = None
