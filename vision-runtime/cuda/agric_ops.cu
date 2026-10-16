// Fused RGB letterbox -> normalized planar FP32, plus block image statistics.
// The caller owns allocations and a CUDA stream; no allocation per frame.
#include <cuda_runtime.h>
#include <cmath>
#include <cstdint>
#ifdef _WIN32
#define API extern "C" __declspec(dllexport)
#else
#define API extern "C" __attribute__((visibility("default")))
#endif

__global__ void letterbox_rgb(const uint8_t* src, int w, int h, float* dst,
                              int size, int rw, int rh, int left, int top) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x >= size || y >= size) return;
    float rgb[3] = {114.f, 114.f, 114.f};
    if (x >= left && x < left + rw && y >= top && y < top + rh) {
        // Half-pixel bilinear sampling with edge replication. CPU reference
        // implements this exact contract (not Pillow's downsample antialias).
        float fx = fmaxf(0.f, fminf(w - 1.f, (x - left + .5f) * w / rw - .5f));
        float fy = fmaxf(0.f, fminf(h - 1.f, (y - top + .5f) * h / rh - .5f));
        int x0 = (int)floorf(fx), y0 = (int)floorf(fy);
        int x1 = min(x0 + 1, w - 1), y1 = min(y0 + 1, h - 1);
        float ax = fx - x0, ay = fy - y0;
        #pragma unroll
        for (int c = 0; c < 3; ++c) {
            float a = src[(y0 * w + x0) * 3 + c] * (1.f - ax) + src[(y0 * w + x1) * 3 + c] * ax;
            float b = src[(y1 * w + x0) * 3 + c] * (1.f - ax) + src[(y1 * w + x1) * 3 + c] * ax;
            rgb[c] = a * (1.f - ay) + b * ay;
        }
    }
    #pragma unroll
    for (int c = 0; c < 3; ++c) dst[c * size * size + y * size + x] = rgb[c] / 255.f;
}

__global__ void image_moments(const uint8_t* src, int pixels, float* partial) {
    __shared__ float sum[256], square[256];
    int t = threadIdx.x, i = blockIdx.x * blockDim.x + t;
    float v = i < pixels ? (float(src[i*3]) + src[i*3+1] + src[i*3+2]) / 3.f : 0.f;
    sum[t] = v; square[t] = v*v;
    __syncthreads();
    for (int stride = 128; stride; stride >>= 1) {
        if (t < stride) { sum[t] += sum[t+stride]; square[t] += square[t+stride]; }
        __syncthreads();
    }
    if (!t) { partial[blockIdx.x*2] = sum[0]; partial[blockIdx.x*2+1] = square[0]; }
}

API int agric_cuda_abi() { return 1; }
API int agric_prepare(const uint8_t* src, int w, int h, float* dst, int size,
                      int rw, int rh, int left, int top, float* moments, void* stream) {
    if (!src || !dst || !moments || w < 1 || h < 1 ||
        int64_t(w)*h > 20000000 || size < 1 || size > 4096 || rw < 1 || rh < 1 ||
        left < 0 || top < 0 || rw > size-left || rh > size-top) return int(cudaErrorInvalidValue);
    cudaStream_t s = reinterpret_cast<cudaStream_t>(stream);
    letterbox_rgb<<<dim3((size+15)/16, (size+15)/16), dim3(16,16), 0, s>>>(src,w,h,dst,size,rw,rh,left,top);
    auto error = cudaGetLastError();
    if (error != cudaSuccess) return int(error);
    image_moments<<<(w*h+255)/256,256,0,s>>>(src,w*h,moments);
    return int(cudaGetLastError());
}
