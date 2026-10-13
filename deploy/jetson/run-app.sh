#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ "${#JWT_SECRET}" -ge 32 && "$JWT_SECRET" != *replace* ]] || { echo "Set a strong JWT_SECRET"; exit 1; }
[[ "${#DB_PASSWORD}" -ge 16 ]] || { echo "Set a random DB_PASSWORD"; exit 1; }
exec java -Xms128m -Xmx768m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -jar application.jar
