#!/usr/bin/env bash
set -euo pipefail
[[ "$(uname -m)" == aarch64 ]] || { echo "Requires Jetson ARM64"; exit 1; }
[[ -r /etc/nv_tegra_release ]] || { echo "Jetson Linux release marker missing"; exit 1; }
grep -q 'R36.*REVISION: 4.4' /etc/nv_tegra_release || {
  echo "Baseline is JetPack 6.2.1 / L4T 36.4.4. Validate another release before deployment."; exit 1;
}
for command in java node npm python3 docker cmake nvcc; do
  command -v "$command" >/dev/null || { echo "Missing $command"; exit 1; }
done
[[ "$(node -p 'parseInt(process.versions.node)')" -ge 24 ]] || { echo "Node 24+ required"; exit 1; }
java -version 2>&1 | head -n 1
nvcc --version | tail -n 1
python3 -c 'import tensorrt; print("TensorRT",tensorrt.__version__); assert tensorrt.__version__.startswith("10.3.")'
docker compose version
free -h
df -h .
echo "Preflight passed. Inspect memory and SSD free space before building."
