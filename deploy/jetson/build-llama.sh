#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/usr/local/cuda/bin:$PATH"
ref=4762ad7316dcdec20016ab5985fb46a27902204d # upstream b6000; intentional reproducible baseline
if [[ ! -d llama.cpp/.git ]]; then git clone https://github.com/ggml-org/llama.cpp.git; fi
git -C llama.cpp fetch origin "$ref"
git -C llama.cpp checkout --detach "$ref"
# Orin compute capability 8.7; two compiler jobs avoid exhausting shared memory.
cmake -S llama.cpp -B llama.cpp/build -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=ON \
  -DCMAKE_CUDA_ARCHITECTURES=87 -DLLAMA_CURL=OFF
cmake --build llama.cpp/build --target llama-server llama-bench -j 2
echo "Built CUDA llama-server at pinned commit $ref"
