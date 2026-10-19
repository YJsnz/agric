"""Opt-in TensorRT output decoding and class-aware NMS on the CUDA stream."""
import ctypes as ct
import os
from pathlib import Path
import numpy as np

from cuda_preprocess import DeviceTensor


class CudaPostprocessor:
    """Runs candidate decode and greedy NMS with reusable scratch buffers."""
    MAX_DETECTIONS = 50

    def __init__(self, cuda, stream, classes, candidates):
        if classes < 1 or candidates < 1 or candidates > 100000:
            raise ValueError('CUDA NMS supports 1..100000 candidates and at least one class')
        self.cuda, self.stream = cuda, stream
        self.classes, self.candidates = classes, candidates
        path = os.getenv('VISION_CUDA_LIBRARY') or str(Path(__file__).parent/'cuda/build/libagric_cuda.so')
        self.lib = ct.CDLL(path)
        self.lib.agric_cuda_abi.restype = ct.c_int
        if self.lib.agric_cuda_abi() != 2:
            raise RuntimeError('CUDA operator ABI mismatch; rebuild the CUDA library')
        self.lib.agric_nms.argtypes = [ct.c_void_p, ct.c_int, ct.c_int, ct.c_float,
                                       ct.c_int, ct.c_int, ct.c_float, ct.c_int, ct.c_int,
                                       ct.c_void_p, ct.c_void_p, ct.c_void_p, ct.c_void_p,
                                       ct.c_void_p, ct.c_void_p]
        self.lib.agric_nms.restype = ct.c_int
        self.boxes, self.scores = ct.c_void_p(), ct.c_void_p()
        self.class_ids, self.valid = ct.c_void_p(), ct.c_void_p()
        self.result, self.host_result = ct.c_void_p(), ct.c_void_p()
        try:
            for pointer, size in ((self.boxes, candidates*4*4), (self.scores, candidates*4),
                                  (self.class_ids, candidates*4), (self.valid, candidates),
                                  (self.result, 302*4)):
                self.cuda.call('cudaMalloc', ct.byref(pointer), size)
            self.cuda.call('cudaMallocHost', ct.byref(self.host_result), 302*4)
        except Exception:
            self.close()
            raise

    def process(self, output, width, height, ratio, left, top, threshold):
        if not isinstance(output, DeviceTensor) or output.stream != self.stream.value:
            raise ValueError('TensorRT output must belong to this CUDA stream')
        if output.shape != (1, 4+self.classes, self.candidates):
            raise ValueError('Unsupported TensorRT output shape for CUDA NMS')
        status = self.lib.agric_nms(ct.c_void_p(output.pointer), self.classes, self.candidates,
                                    threshold, width, height, ratio, left, top,
                                    self.boxes, self.scores, self.class_ids, self.valid,
                                    self.result, self.stream)
        if status:
            raise RuntimeError(f'agric_nms failed with CUDA status {status}')
        self.cuda.call('cudaMemcpyAsync', self.host_result, self.result, 302*4, 2, self.stream)
        self.cuda.call('cudaStreamSynchronize', self.stream)
        values = np.ctypeslib.as_array(ct.cast(self.host_result, ct.POINTER(ct.c_float)), shape=(302,))
        if int(values[301]) != 0:
            raise ValueError('Non-finite inference output')
        count = int(values[0])
        if not 0 <= count <= self.MAX_DETECTIONS:
            raise RuntimeError('CUDA NMS returned an invalid detection count')
        return values[1:1+count*6].reshape(count, 6).copy()

    def close(self):
        if any(pointer.value for pointer in (self.boxes, self.scores, self.class_ids,
                                              self.valid, self.result, self.host_result)):
            self.cuda.call('cudaStreamSynchronize', self.stream)
        for name in ('boxes', 'scores', 'class_ids', 'valid', 'result', 'host_result'):
            pointer = getattr(self, name, ct.c_void_p())
            if pointer.value:
                self.cuda.call('cudaFreeHost' if name == 'host_result' else 'cudaFree', pointer)
                setattr(self, name, ct.c_void_p())
