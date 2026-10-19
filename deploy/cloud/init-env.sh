#!/usr/bin/env bash
set -euo pipefail

env_file=/etc/agric/cloud.env
if [[ -e "$env_file" ]]; then
  echo "$env_file exists; preserved. Edit it directly if settings need changes."
  exit 0
fi
install -d -m 0750 -o root -g agric /etc/agric
umask 077
db_password="$(openssl rand -hex 24)"
mysql_root_password="$(openssl rand -hex 24)"
neo4j_password="$(openssl rand -hex 24)"
jwt_secret="$(openssl rand -hex 48)"
cat > "$env_file" <<EOF
DB_NAME=agric
DB_USERNAME=agric
DB_PASSWORD=$db_password
MYSQL_ROOT_PASSWORD=$mysql_root_password
DB_URL=jdbc:mysql://127.0.0.1:3307/agric?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
NEO4J_PASSWORD=$neo4j_password
NEO4J_HTTP_URL=http://127.0.0.1:7474
JWT_SECRET=$jwt_secret
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8081
AUTH_REGISTRATION_ENABLED=true
AGENT_ENGINE=harness
AGENT_BASE_URL=https://api.deepseek.com/v1
AGENT_API_KEY=replace-with-your-model-api-key
AGENT_MODEL=deepseek-chat
AGENT_NODE=/usr/local/bin/node
AGENT_WORKERS=1
AGENT_CAPACITY=2
AGENT_CONTEXT_TOKENS=16384
AGENT_MAX_TOKENS=1024
AGENT_TIMEOUT_SECONDS=600
VISION_PYTHON=/opt/agric/current/vision-runtime/.venv/bin/python
VISION_BACKEND=onnx-cpu
VISION_STORAGE=/var/lib/agric/vision
VISION_TIMEOUT_SECONDS=120
VISION_CPU_THREADS=2
MULTICROP_BASE_URL=http://127.0.0.1:8090
MULTICROP_AUTO_START=true
MULTICROP_PYTHON=/opt/agric/current/vision-runtime/.venv/bin/python
EOF
chown root:agric "$env_file"
chmod 0640 "$env_file"
echo "Created $env_file with random database and JWT secrets. Replace AGENT_API_KEY before exposing the app."
