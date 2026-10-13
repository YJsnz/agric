#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[[ -r .env ]] || { echo "Initialize .env first"; exit 1; }
set -a
# The generated file is local administrator configuration; never source an untrusted download.
source .env
set +a
[[ "$DB_NAME" =~ ^[a-zA-Z0-9_]+$ ]] || { echo "Invalid DB_NAME"; exit 1; }
destination="${1:-/var/lib/agric/backups}"
umask 077
mkdir -p "$destination"
stage="$(mktemp -d "$destination/staging-XXXXXXXX")"
# Stop writes before invoking. No --all-databases and no destructive cleanup.
docker compose exec -T -e MYSQL_PWD="$DB_PASSWORD" mysql mysqldump -u "$DB_USERNAME" \
  --single-transaction --no-tablespaces --set-gtid-purged=OFF "$DB_NAME" > "$stage/database.sql"
if [[ -d /var/lib/agric/vision ]]; then cp -a /var/lib/agric/vision "$stage/vision"; fi
(
  cd "$stage"
  find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS
)
archive="$destination/agric-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$archive" -C "$stage" .
echo "Backup: $archive; staging retained at $stage. Store keys separately."
