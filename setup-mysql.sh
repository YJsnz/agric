#!/usr/bin/env bash
set -Eeuo pipefail

CONTAINER_NAME="${MYSQL_CONTAINER:-mysql}"
IMAGE="${MYSQL_IMAGE:-mysql:8.4}"
ROOT_PASSWORD="${DB_PASSWORD:-Root_123456}"
DATABASE="${DB_NAME:-tianyan}"
VOLUME="${MYSQL_VOLUME:-tianyan-mysql-data}"

command -v docker >/dev/null 2>&1 || {
  echo "错误：没有找到 Docker。请先安装并启动 Docker Desktop。" >&2
  exit 1
}

docker info >/dev/null 2>&1 || {
  echo "错误：Docker Engine 尚未运行。请先打开 Docker Desktop，等待启动完成后重试。" >&2
  exit 1
}

if docker inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  echo "==> 已找到 MySQL 容器：$CONTAINER_NAME"
  if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME")" != "true" ]]; then
    docker start "$CONTAINER_NAME" >/dev/null
    echo "==> 容器已启动"
  fi
else
  echo "==> 首次部署：拉取 $IMAGE"
  docker pull "$IMAGE"
  echo "==> 创建 MySQL 容器：$CONTAINER_NAME"
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p 3306:3306 \
    -e "MYSQL_ROOT_PASSWORD=$ROOT_PASSWORD" \
    -e "MYSQL_DATABASE=$DATABASE" \
    -v "$VOLUME:/var/lib/mysql" \
    "$IMAGE" >/dev/null
fi

echo "==> 等待 MySQL 就绪"
for attempt in {1..60}; do
  if docker exec "$CONTAINER_NAME" mysqladmin ping -uroot "-p$ROOT_PASSWORD" --silent >/dev/null 2>&1; then
    echo "==> MySQL 已准备完成"
    echo "    容器：$CONTAINER_NAME"
    echo "    数据库：$DATABASE"
    echo "    地址：localhost:3306"
    echo "    数据卷：$VOLUME"
    echo
    echo "下一步执行：./start.sh"
    exit 0
  fi
  sleep 1
done

echo "错误：MySQL 在 60 秒内没有就绪，请执行 docker logs $CONTAINER_NAME --tail 50 查看原因。" >&2
exit 1
