#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
if (($# < 2)); then
  echo "Usage: $0 OUTPUT_DIR IMAGE [IMAGE ...]" >&2
  exit 2
fi
output="$1"
shift
if [[ "$output" != /* ]]; then output="$root/$output"; fi
iterations="${AGRIC_BENCH_ITERATIONS:-100}"
python="$root/vision-runtime/jetson-venv/bin/python"
mkdir -p "$output"

for precision in fp16 fp32; do
  engine="$output/pear-$precision.engine"
  "$python" "$root/vision-runtime/build_engine.py" --precision "$precision" --output "$engine"
  for config in \
    'pillow|pillow|cpu|cpu' \
    'cuda-pre|pillow|cuda-fused|cpu' \
    'cuda-nms|pillow|pillow|cuda-nms' \
    'cuda-pre-nms|pillow|cuda-fused|cuda-nms' \
    'jpeg-gpu|nvimgcodec|cuda-fused|cuda-nms'; do
    IFS='|' read -r label image_decode preprocess postprocess <<< "$config"
    echo "Validating $precision / $label"
    if VISION_BACKEND=tensorrt VISION_ENGINE="$engine" \
      "$python" "$root/vision-runtime/validate_backend.py" "$@" \
      --gpu-image-decode "$image_decode" --gpu-preprocess "$preprocess" \
      --gpu-postprocess "$postprocess" \
      --output "$output/validate-$precision-$label.json"; then
      VISION_BACKEND=tensorrt VISION_ENGINE="$engine" \
        VISION_IMAGE_DECODE="$image_decode" VISION_PREPROCESS="$preprocess" \
        VISION_POSTPROCESS="$postprocess" \
        "$python" "$root/vision-runtime/benchmark.py" "$@" \
        --iterations "$iterations" --output "$output/bench-$precision-$label.json"
    else
      echo "Skipped benchmark: validation failed for $precision / $label" >&2
    fi
  done
done

echo "Matrix reports written to $output"
