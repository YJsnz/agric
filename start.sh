#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# 本机私密配置只需填写一次。
if [[ -f "$ROOT_DIR/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env.local"
  set +a
fi

MYSQL_CONTAINER="${MYSQL_CONTAINER:-mysql}"
SKIP_BUILD=false

usage() {
  cat <<'EOF'
用法：./start.sh [选项]

启动时会自动读取根目录的 .env.local（该文件已被 Git 忽略）。

选项：
  --skip-build   跳过两套前端构建，直接启动 Spring Boot
  -h, --help     显示帮助

可选环境变量：
  MYSQL_CONTAINER  MySQL 容器名，默认 mysql
  SERVER_PORT       服务端口，默认 8081
  DB_URL            JDBC 地址
  DB_USERNAME       数据库用户名，默认 root
  DB_PASSWORD       数据库密码，默认 Root_123456
  JWT_SECRET        JWT 密钥；部署环境必须设置至少 32 字节的随机值
  DEEPSEEK_API_KEY  AI 助手 API Key
  BAIDU_FACE_AK     百度人脸 API Key
  BAIDU_FACE_SK     百度人脸 Secret Key
EOF
}

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数：$arg" >&2; usage >&2; exit 2 ;;
  esac
done

command -v docker >/dev/null 2>&1 || { echo "错误：未找到 docker。" >&2; exit 1; }
test -x "$ROOT_DIR/mvnw" || { echo "错误：mvnw 不可执行。" >&2; exit 1; }

if [[ "$SKIP_BUILD" == false ]]; then
  command -v npm >/dev/null 2>&1 || { echo "错误：未找到 npm。" >&2; exit 1; }
fi

if ! docker inspect "$MYSQL_CONTAINER" >/dev/null 2>&1; then
  echo "错误：找不到 Docker 容器 '$MYSQL_CONTAINER'。" >&2
  echo "首次部署请执行：chmod +x setup-mysql.sh && ./setup-mysql.sh" >&2
  echo "已有其他容器时，可在 .env.local 中通过 MYSQL_CONTAINER 指定容器名。" >&2
  exit 1
fi

if [[ "$(docker inspect -f '{{.State.Running}}' "$MYSQL_CONTAINER")" != "true" ]]; then
  echo "==> 启动 Docker MySQL：$MYSQL_CONTAINER"
  docker start "$MYSQL_CONTAINER" >/dev/null
fi

echo "==> 等待 MySQL 就绪"
for attempt in {1..30}; do
  if docker exec "$MYSQL_CONTAINER" mysqladmin ping -uroot "-p${DB_PASSWORD:-Root_123456}" --silent >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo "错误：MySQL 在 30 秒内未就绪，请检查容器日志。" >&2
    exit 1
  fi
  sleep 1
done

if [[ "$SKIP_BUILD" == false ]]; then
  for app in landing frontend; do
    echo "==> 构建 $app"
    if [[ ! -d "$ROOT_DIR/$app/node_modules" ]]; then
      echo "    首次运行，安装依赖"
      (cd "$ROOT_DIR/$app" && npm install)
    fi
    (cd "$ROOT_DIR/$app" && npm run build)
  done
else
  echo "==> 已跳过前端构建"
fi

export JWT_SECRET="${JWT_SECRET:-ty-local-demo-jwt-secret-not-for-production-2026}"

echo
echo "==> 启动完成后访问：http://localhost:${SERVER_PORT:-8081}/"
echo "==> 按 Ctrl+C 停止服务"
echo
cd "$ROOT_DIR"
exec ./mvnw spring-boot:run
