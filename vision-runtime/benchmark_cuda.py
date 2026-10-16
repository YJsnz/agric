"""Standalone operator correctness and warm latency. No TensorRT/model required."""
import argparse
import ctypes as ct
import json
import platform
import time
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
from cuda_preprocess import cpu_reference, CudaPreprocessor
from tensorrt_backend import CudaRuntime


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('image')
    parser.add_argument('--size',type=int,default=640)
    parser.add_argument('--iterations',type=int,default=30)
    parser.add_argument('--output')
    args = parser.parse_args()
    if not 5 <= args.iterations <= 1000 or not 1 <= args.size <= 4096:
        parser.error('iterations 5..1000; size 1..4096')
    with Image.open(args.image) as image:
        if image.width*image.height > 20_000_000: raise ValueError('Image too large')
        rgb = np.asarray(ImageOps.exif_transpose(image).convert('RGB'))
    cuda, stream, output = CudaRuntime(), ct.c_void_p(), ct.c_void_p()
    cuda.call('cudaStreamCreate',ct.byref(stream))
    preprocessor = None
    try:
        cuda.call('cudaMalloc',ct.byref(output),3*args.size*args.size*4)
        preprocessor = CudaPreprocessor(cuda,stream,args.size)
        expected,_ = cpu_reference(rgb,args.size)
        for _ in range(5): preprocessor.prepare(rgb,output)
        actual = np.empty_like(expected)
        cuda.call('cudaMemcpyAsync',ct.c_void_p(actual.ctypes.data),output,actual.nbytes,2,stream)
        cuda.call('cudaStreamSynchronize',stream)
        np.testing.assert_allclose(actual,expected,atol=2e-5,rtol=0)
        timings = {}
        def pillow_pipeline():
            # Original production path, including the same image-quality gate.
            gray = rgb.mean(axis=2)
            quality = (gray.mean(),gray.std())
            image = Image.fromarray(rgb)
            ratio = min(args.size/image.width,args.size/image.height)
            resized = image.resize((max(1,round(image.width*ratio)),max(1,round(image.height*ratio))),Image.Resampling.BILINEAR)
            padded = Image.new('RGB',(args.size,args.size),(114,114,114))
            padded.paste(resized,((args.size-resized.width)//2,(args.size-resized.height)//2))
            return np.ascontiguousarray(np.asarray(padded,dtype=np.float32).transpose(2,0,1)[None]/255),quality
        for _ in range(5): pillow_pipeline();cpu_reference(rgb,args.size)
        for name,run in [('cpu_reference_host_output',lambda:cpu_reference(rgb,args.size)),
                         ('pillow_production_host_output',pillow_pipeline),
                         ('cuda_pinned_upload_device_output',lambda:preprocessor.prepare(rgb,output))]:
            samples = []
            for _ in range(args.iterations):
                start = time.perf_counter();run();samples.append((time.perf_counter()-start)*1000)
            timings[name] = {'medianMs':float(np.median(samples)),'p95Ms':float(np.percentile(samples,95))}
        report = {'architecture':platform.machine(),'platform':platform.platform(),'inputShape':list(rgb.shape),
                  'size':args.size,'iterations':args.iterations,'maxAbsError':float(np.abs(actual-expected).max()),
                  'timings':timings,'scope':'preprocessing only; CUDA includes upload, quality reduction and synchronization; excludes TensorRT, camera, image decode and serial; CPU reference is not the original Pillow implementation'}
        value = json.dumps(report,ensure_ascii=False,indent=2)
        if args.output: Path(args.output).write_text(value,encoding='utf-8')
        print(value)
    finally:
        if preprocessor is not None: preprocessor.close()
        if output.value: cuda.call('cudaFree',output)
        cuda.call('cudaStreamDestroy',stream)


if __name__ == '__main__': main()
