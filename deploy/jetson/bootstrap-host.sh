#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 && "$(uname -m)" == aarch64 ]] || { echo "Run with sudo on Jetson ARM64"; exit 1; }
apt-get update
apt-get install -y openjdk-17-jre-headless python3-venv python3-pip build-essential cmake \
  git curl ca-certificates nginx unzip
# JetPack and Docker Compose are installed using their official host instructions.
if command -v node >/dev/null && [[ "$(node -p 'parseInt(process.versions.node)')" -ge 24 ]]; then
  echo "Existing Node 24+ preserved."
else
  version=24.14.1
  stage="$(mktemp -d)"
  file="node-v$version-linux-arm64.tar.xz"
  curl --fail --location --retry 3 "https://nodejs.org/dist/v$version/$file" -o "$stage/$file"
  curl --fail --location --retry 3 "https://nodejs.org/dist/v$version/SHASUMS256.txt" -o "$stage/SHASUMS256.txt"
  (cd "$stage"; grep "  $file$" SHASUMS256.txt | sha256sum -c -)
  mkdir -p "/opt/agric-node-$version"
  tar -xJf "$stage/$file" --strip-components=1 -C "/opt/agric-node-$version"
  for executable in node npm npx; do
    [[ ! -e "/usr/local/bin/$executable" ]] || { echo "Existing /usr/local/bin/$executable requires manual review"; exit 1; }
    ln -s "/opt/agric-node-$version/bin/$executable" "/usr/local/bin/$executable"
  done
fi
