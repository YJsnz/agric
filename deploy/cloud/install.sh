#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
[[ "$(. /etc/os-release && echo "$ID")" == ubuntu ]] || { echo "Requires Ubuntu 22.04 or 24.04." >&2; exit 1; }
[[ "$(uname -m)" == x86_64 ]] || { echo "This demo installer targets x86_64 CPU instances." >&2; exit 1; }
[[ $EUID -eq 0 ]] || { echo "Run with sudo from the repository root." >&2; exit 1; }

if [[ "$root" != /opt/agric/current ]]; then
  echo "Install the project at /opt/agric/current first (see deploy/cloud/README.md)." >&2
  exit 1
fi
[[ -r "$root/vision-runtime/models/pear-leaf.onnx" ]] || {
  echo "Missing vision-runtime/models/pear-leaf.onnx. Upload the checked ONNX model before installation." >&2
  exit 1
}

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  openjdk-17-jdk-headless python3 python3-venv python3-pip build-essential \
  git curl ca-certificates libgl1 libglib2.0-0 libgomp1 \
  nginx certbot python3-certbot-nginx docker.io docker-compose-v2
systemctl enable --now docker nginx

if ! command -v node >/dev/null || [[ "$(node -p 'parseInt(process.versions.node)')" -lt 24 ]]; then
  version=24.14.1
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' EXIT
  archive="node-v$version-linux-x64.tar.xz"
  curl --fail --location --retry 3 "https://nodejs.org/dist/v$version/$archive" -o "$stage/$archive"
  curl --fail --location --retry 3 "https://nodejs.org/dist/v$version/SHASUMS256.txt" -o "$stage/SHASUMS256.txt"
  (cd "$stage" && grep "  $archive$" SHASUMS256.txt | sha256sum -c -)
  install_root="/opt/agric-node-$version"
  install -d "$install_root"
  tar -xJf "$stage/$archive" --strip-components=1 -C "$install_root"
  ln -sfn "$install_root/bin/node" /usr/local/bin/node
  ln -sfn "$install_root/bin/npm" /usr/local/bin/npm
  ln -sfn "$install_root/bin/npx" /usr/local/bin/npx
fi

getent group agric >/dev/null || groupadd --system agric
id agric >/dev/null 2>&1 || useradd --system --home-dir /var/lib/agric --shell /usr/sbin/nologin -g agric agric
install -d -o agric -g agric /var/lib/agric/vision /var/lib/agric/logs "$root/vision-runtime/.venv"
install -d -m 0750 -o root -g agric /etc/agric
if [[ ! -r /etc/agric/cloud.env ]]; then
  bash "$root/deploy/cloud/init-env.sh"
fi

python3 -m venv "$root/vision-runtime/.venv"
"$root/vision-runtime/.venv/bin/python" -m pip install --upgrade pip
"$root/vision-runtime/.venv/bin/python" -m pip install \
  -r "$root/vision-runtime/requirements.txt" \
  -r "$root/ai-service/integration-requirements.txt"
embedding_model="$root/ai-service/models/embedding/hf-bge-small-zh-v1.5/model_optimized.onnx"
if [[ ! -r "$embedding_model" ]]; then
  "$root/vision-runtime/.venv/bin/python" "$root/ai-service/scripts/download_embedding.py"
fi
npm ci --prefix "$root/agent-runtime" --no-audit --no-fund

for app in landing frontend vision-frontend; do
  npm ci --prefix "$root/$app" --no-audit --no-fund
  npm run build --prefix "$root/$app"
done
cd "$root"
bash "$root/mvnw" -DskipTests package
install -m 0644 target/ty-0.0.1-SNAPSHOT.jar "$root/application.jar"

install -m 0644 "$root/deploy/cloud/agric.service" /etc/systemd/system/agric.service
install -m 0644 "$root/deploy/cloud/agric-cloud-stack.service" /etc/systemd/system/agric-cloud-stack.service
install -m 0644 "$root/deploy/cloud/nginx.conf" /etc/nginx/sites-available/agric
ln -sfn /etc/nginx/sites-available/agric /etc/nginx/sites-enabled/agric
rm -f /etc/nginx/sites-enabled/default
install -d -o agric -g agric "$root/target/harness-sessions" "$root/var/logs"
chown -R agric:agric "$root/agent-runtime" "$root/vision-runtime/.venv" "$root/target/harness-sessions" "$root/var/logs"
chown -R agric:agric /var/lib/agric
systemctl daemon-reload
systemctl enable --now agric-cloud-stack.service

if [[ ! -e /var/lib/agric/.multicrop-initialized ]]; then
  neo4j_password="$(sed -n 's/^NEO4J_PASSWORD=//p' /etc/agric/cloud.env | tail -n 1)"
  NEO4J_PASSWORD="$neo4j_password" NEO4J_HTTP_URL=http://127.0.0.1:7474 "$root/vision-runtime/.venv/bin/python" \
    "$root/ai-service/initialize_integration.py"
  unset neo4j_password
  install -o agric -g agric -m 0640 /dev/null /var/lib/agric/.multicrop-initialized
fi

systemctl restart nginx
agent_key="$(sed -n 's/^AGENT_API_KEY=//p' /etc/agric/cloud.env | tail -n 1)"
if [[ -n "$agent_key" && "$agent_key" != replace-with-your-model-api-key ]]; then
  systemctl enable agric.service
  if systemctl is-active --quiet agric.service; then systemctl restart agric.service; else systemctl start agric.service; fi
  echo "Cloud runtime installed and application started. Check: curl -fsS http://127.0.0.1:8081/api/health"
else
  systemctl disable --now agric.service >/dev/null 2>&1 || true
  echo "Runtime installed. Add a model API key to /etc/agric/cloud.env, then run: systemctl enable --now agric"
fi
