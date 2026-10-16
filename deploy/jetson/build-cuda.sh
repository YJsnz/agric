#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
# Build on the target board. Do not copy a Windows/x86 shared library to Jetson.
command -v nvcc >/dev/null || export PATH="/usr/local/cuda/bin:$PATH"
cmake -S "$root/vision-runtime/cuda" -B "$root/vision-runtime/cuda/build" \
  -DCMAKE_BUILD_TYPE=Release -DCMAKE_CUDA_ARCHITECTURES="${AGRIC_CUDA_ARCH:-87}"
cmake --build "$root/vision-runtime/cuda/build" -j2
echo "Built operators. Run AGRIC_TEST_CUDA=1 python -m unittest discover -s vision-runtime -p test_cuda_preprocess.py -v"
