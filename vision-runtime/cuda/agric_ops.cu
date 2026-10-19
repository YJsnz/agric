// Fused image preparation/statistics and optional TensorRT output postprocess.
// The caller owns reusable allocations and a CUDA stream; no allocation per frame.
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

__global__ void decode_candidates(const float* raw, int classes, int candidates,
                                 float threshold, float* boxes, float* scores, int* class_ids,
                                 uint8_t* valid, float* result) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i >= candidates) return;
    int best_class = 0;
    float best_score = raw[4 * candidates + i];
    if (!isfinite(best_score)) atomicExch(reinterpret_cast<int*>(result + 301), 0x3f800000);
    for (int c = 1; c < classes; ++c) {
        float score = raw[(4 + c) * candidates + i];
        if (!isfinite(score)) atomicExch(reinterpret_cast<int*>(result + 301), 0x3f800000);
        if (score > best_score) { best_score = score; best_class = c; }
    }
    scores[i] = best_score;
    class_ids[i] = best_class;
    valid[i] = best_score >= threshold && isfinite(best_score);
    float cx = raw[i], cy = raw[candidates + i];
    float w = raw[2 * candidates + i], h = raw[3 * candidates + i];
    if (!isfinite(cx) || !isfinite(cy) || !isfinite(w) || !isfinite(h))
        atomicExch(reinterpret_cast<int*>(result + 301), 0x3f800000);
    boxes[4 * i] = cx - w * .5f;
    boxes[4 * i + 1] = cy - h * .5f;
    boxes[4 * i + 2] = cx + w * .5f;
    boxes[4 * i + 3] = cy + h * .5f;
}

__device__ float box_iou(const float* a, const float* b) {
    float x1 = fmaxf(a[0], b[0]), y1 = fmaxf(a[1], b[1]);
    float x2 = fminf(a[2], b[2]), y2 = fminf(a[3], b[3]);
    float inter = fmaxf(0.f, x2 - x1) * fmaxf(0.f, y2 - y1);
    float area_a = (a[2] - a[0]) * (a[3] - a[1]);
    float area_b = (b[2] - b[0]) * (b[3] - b[1]);
    return inter / fmaxf(1e-8f, area_a + area_b - inter);
}

__global__ void greedy_nms(const float* boxes, const float* scores, const int* class_ids,
                           uint8_t* valid, int candidates, int width, int height,
                           float ratio, int left, int top, float iou_threshold, float* result) {
    if (blockIdx.x || threadIdx.x) return;
    int count = 0;
    while (count < 50) {
        int best = -1;
        float best_score = -CUDART_INF_F;
        // Strict > preserves the CPU path's stable candidate order on ties.
        for (int i = 0; i < candidates; ++i) {
            if (valid[i] && scores[i] > best_score) { best = i; best_score = scores[i]; }
        }
        if (best < 0) break;
        valid[best] = 0;
        const float* selected = boxes + 4 * best;
        float x1 = fminf((selected[0] - left) / ratio, (float)width);
        float y1 = fminf((selected[1] - top) / ratio, (float)height);
        float x2 = fminf((selected[2] - left) / ratio, (float)width);
        float y2 = fminf((selected[3] - top) / ratio, (float)height);
        x1 = fmaxf(0.f, x1); y1 = fmaxf(0.f, y1);
        x2 = fmaxf(0.f, x2); y2 = fmaxf(0.f, y2);
        if (x2 > x1 && y2 > y1) {
            int offset = 1 + count * 6;
            result[offset] = (float)class_ids[best]; result[offset + 1] = best_score;
            result[offset + 2] = x1; result[offset + 3] = y1;
            result[offset + 4] = x2; result[offset + 5] = y2;
            ++count;
        }
        for (int i = 0; i < candidates; ++i) {
            if (valid[i] && class_ids[i] == class_ids[best] &&
                box_iou(selected, boxes + 4 * i) >= iou_threshold) valid[i] = 0;
        }
    }
    result[0] = (float)count;
}

API int agric_cuda_abi() { return 2; }
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

API int agric_nms(const float* raw, int classes, int candidates, float threshold,
                  int width, int height, float ratio, int left, int top,
                  float* boxes, float* scores, int* class_ids, uint8_t* valid,
                  float* result, void* stream) {
    if (!raw || !boxes || !scores || !class_ids || !valid || !result || classes < 1 ||
        candidates < 1 || candidates > 100000 || width < 1 || height < 1 ||
        !(threshold > 0.f && threshold < 1.f) || !(ratio > 0.f) || left < 0 || top < 0)
        return int(cudaErrorInvalidValue);
    cudaStream_t s = reinterpret_cast<cudaStream_t>(stream);
    auto error = cudaMemsetAsync(result,0,302*sizeof(float),s);
    if (error != cudaSuccess) return int(error);
    decode_candidates<<<(candidates+255)/256,256,0,s>>>(raw,classes,candidates,
        threshold,boxes,scores,class_ids,valid,result);
    error = cudaGetLastError();
    if (error != cudaSuccess) return int(error);
    greedy_nms<<<1,1,0,s>>>(boxes,scores,class_ids,valid,candidates,width,height,ratio,left,top,.45f,result);
    return int(cudaGetLastError());
}
