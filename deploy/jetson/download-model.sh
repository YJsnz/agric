#!/usr/bin/env bash
set -euo pipefail
destination="${1:-/var/lib/agric/models}"
mkdir -p "$destination"
model="$destination/Qwen3-4B-Q4_K_M.gguf"
sha=7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5
revision=bc640142c66e1fdd12af0bd68f40445458f3869b
if [[ -f "$model" ]] && echo "$sha  $model" | sha256sum -c - >/dev/null 2>&1; then
  echo "Model verified"
else
  curl --fail --location --retry 3 \
    "https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/$revision/Qwen3-4B-Q4_K_M.gguf" -o "$model.part"
  echo "$sha  $model.part" | sha256sum -c -
  mv "$model.part" "$model"
fi
curl --fail --location --retry 3 \
  "https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/$revision/LICENSE" -o "$destination/QWEN-LICENSE"
