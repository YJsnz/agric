#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
export PATH="/usr/local/cuda/bin:$PATH"
bash "$root/deploy/jetson/preflight.sh"
cd "$root"
# Use the JetPack system TensorRT bindings, never a desktop PyPI TensorRT wheel.
python3 -m venv --system-site-packages vision-runtime/jetson-venv
vision-runtime/jetson-venv/bin/python -m pip install -r deploy/jetson/requirements.txt
vision-runtime/jetson-venv/bin/python -c 'import tensorrt; print(tensorrt.__version__)'
npm ci --prefix agent-runtime --no-audit --no-fund
[[ -r vision-runtime/models/pear-leaf.onnx ]] || { echo "Include the checked ONNX from the release bundle."; exit 1; }
echo "Runtime ready. Build the board-local engine before starting agric."
