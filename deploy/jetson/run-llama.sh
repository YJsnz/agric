#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
exec "$root/deploy/jetson/llama.cpp/build/bin/llama-server" \
  --model "${LLAMA_MODEL:?required}" --alias "${AGENT_MODEL:?required}" \
  --host 127.0.0.1 --port 8083 --api-key "${AGENT_API_KEY:?required}" \
  --ctx-size "${AGENT_CONTEXT_TOKENS:-4096}" --parallel 1 \
  --batch-size "${LLAMA_BATCH:-128}" --ubatch-size "${LLAMA_UBATCH:-64}" \
  --n-gpu-layers "${LLAMA_GPU_LAYERS:-99}" --threads 4 --flash-attn \
  --cache-type-k q8_0 --cache-type-v q8_0 --jinja --reasoning-budget 0
