"""Explicit opt-in CUDA preprocessing; no silent fallback when CUDA is requested."""
import ctypes as ct
import os
from pathlib import Path
from dataclasses import dataclass
import numpy as np


def geometry(width, height, size):
    if min(width, height, size) < 1 or size > 4096 or width * height > 20_000_000:
        raise ValueError('Invalid image dimensions')
    ratio = min(size / width, size / height)
    rw, rh = max(1, round(width * ratio)), max(1, round(height * ratio))
    return ratio, (size-rw)//2, (size-rh)//2, rw, rh


def cpu_reference(rgb, size):
    """Reference for the CUDA sampling contract, for accuracy/latency validation."""
    h, w, _ = rgb.shape
    ratio, left, top, rw, rh = geometry(w, h, size)
    x = np.clip((np.arange(rw, dtype=np.float32)+.5)*np.float32(w)/rw-.5, 0, w-1)
    y = np.clip((np.arange(rh, dtype=np.float32)+.5)*np.float32(h)/rh-.5, 0, h-1)
    x0, y0 = x.astype(int), y.astype(int)
    ax, ay = (x-x0).astype(np.float32)[None,:,None], (y-y0).astype(np.float32)[:,None,None]
    x1, y1 = np.minimum(x0+1,w-1), np.minimum(y0+1,h-1)
    a = rgb[y0[:,None],x0]*(1-ax) + rgb[y0[:,None],x1]*ax
    b = rgb[y1[:,None],x0]*(1-ax) + rgb[y1[:,None],x1]*ax
    out = np.full((size,size,3),114, dtype=np.float32)
    out[top:top+rh,left:left+rw] = a*(1-ay)+b*ay
    return np.ascontiguousarray(out.transpose(2,0,1)[None]/255), (ratio,left,top)


@dataclass(frozen=True)
class DeviceTensor:
    pointer: int
    shape: tuple
    stream: int


class CudaPreprocessor:
    """One context per resident inference worker. Caller serializes access."""
    def __init__(self, cuda, stream, size):
        self.cuda, self.stream, self.size = cuda, stream, size
        self.source = self.staging = self.partial = self.host_partial = ct.c_void_p()
        self.capacity = 0
        path = os.getenv('VISION_CUDA_LIBRARY') or str(Path(__file__).parent/'cuda/build/libagric_cuda.so')
        self.lib = ct.CDLL(path)
        self.lib.agric_cuda_abi.restype = ct.c_int
        if self.lib.agric_cuda_abi() != 2:
            raise RuntimeError('CUDA operator ABI mismatch; rebuild the CUDA library')
        self.lib.agric_prepare.argtypes = [ct.c_void_p,ct.c_int,ct.c_int,ct.c_void_p,ct.c_int,
                                          ct.c_int,ct.c_int,ct.c_int,ct.c_int,ct.c_void_p,ct.c_void_p]
        self.lib.agric_prepare.restype = ct.c_int

    def reserve(self, pixels, upload=True):
        if pixels <= self.capacity and (not upload or self.source.value):
            return
        self.close()
        self.source, self.staging, self.partial, self.host_partial = [ct.c_void_p() for _ in range(4)]
        blocks = (pixels+255)//256
        try:
            allocations = [('cudaMalloc',self.partial,blocks*8), ('cudaMallocHost',self.host_partial,blocks*8)]
            if upload:
                allocations[:0] = [('cudaMalloc',self.source,pixels*3), ('cudaMallocHost',self.staging,pixels*3)]
            for name, pointer, count in allocations:
                self.cuda.call(name,ct.byref(pointer),count)
            self.capacity = pixels
        except Exception:
            self.close()
            raise

    def prepare(self, rgb, output):
        if rgb.dtype != np.uint8 or rgb.ndim != 3 or rgb.shape[2] != 3:
            raise ValueError('Expected uint8 HWC RGB')
        h,w,_ = rgb.shape
        ratio,left,top,rw,rh = geometry(w,h,self.size)
        rgb = np.ascontiguousarray(rgb)
        self.reserve(w*h, upload=True)
        ct.memmove(self.staging,rgb.ctypes.data,rgb.nbytes)
        self.cuda.call('cudaMemcpyAsync',self.source,self.staging,rgb.nbytes,1,self.stream)
        return self._prepare(self.source,w,h,output,ratio,left,top,rw,rh)

    def prepare_device_image(self, image, output):
        """Consume a contiguous HWC uint8 CUDA Array Interface image in place."""
        interface = image.__cuda_array_interface__
        shape = interface.get('shape')
        if len(shape) != 3 or shape[2] != 3 or interface.get('typestr') != '|u1':
            raise ValueError('Expected a device uint8 HWC RGB image')
        h,w,_ = shape
        strides = interface.get('strides')
        if strides not in (None,(w*3,3,1)):
            raise ValueError('CUDA JPEG decoder must provide contiguous RGB output')
        pointer = int(interface['data'][0])
        if not pointer:
            raise ValueError('CUDA image has a null device pointer')
        ratio,left,top,rw,rh = geometry(w,h,self.size)
        self.reserve(w*h, upload=False)
        if interface.get('stream') not in (None, 0):
            raise ValueError('Device image producer must synchronize before preprocessing')
        return self._prepare(ct.c_void_p(pointer),w,h,output,ratio,left,top,rw,rh)

    def _prepare(self, source, w, h, output, ratio, left, top, rw, rh):
        status = self.lib.agric_prepare(source,w,h,output,self.size,rw,rh,left,top,self.partial,self.stream)
        if status:
            raise RuntimeError(f'agric_prepare failed with CUDA status {status}')
        blocks = (w*h+255)//256
        self.cuda.call('cudaMemcpyAsync',self.host_partial,self.partial,blocks*8,2,self.stream)
        # Synchronize before inspecting small host statistics; normalized image
        # remains in the TensorRT input allocation, with no image D2H/H2D roundtrip.
        self.cuda.call('cudaStreamSynchronize',self.stream)
        partial = np.ctypeslib.as_array(ct.cast(self.host_partial,ct.POINTER(ct.c_float)),shape=(blocks*2,)).reshape(-1,2)
        total,square = partial.sum(axis=0,dtype=np.float64)
        mean = total/(w*h)
        quality = {'brightness':round(float(mean),2), 'width':w, 'height':h}
        std = float(np.sqrt(max(0,square/(w*h)-mean*mean)))
        tensor = DeviceTensor(output.value,(1,3,self.size,self.size),self.stream.value)
        return tensor,(ratio,left,top),quality,std

    def close(self):
        if any(p.value for p in (self.source,self.staging,self.partial,self.host_partial)):
            self.cuda.call('cudaStreamSynchronize',self.stream)
        for name in ('source','partial','staging','host_partial'):
            pointer = getattr(self,name)
            if pointer.value:
                self.cuda.call('cudaFreeHost' if name in ('staging','host_partial') else 'cudaFree',pointer)
                setattr(self,name,ct.c_void_p())
        self.capacity = 0
