#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo after installing the release at /opt/agric/current"; exit 1; }
root="$(cd "$(dirname "$0")/../.." && pwd)"
[[ "$root" == /opt/agric/current || "$root" == /opt/agric/releases/* ]] || { echo "Expected /opt/agric/current release"; exit 1; }
[[ -f "$root/deploy/jetson/.env" && -f "$root/application.jar" ]] || { echo "Initialize .env and application.jar first"; exit 1; }
getent passwd agric >/dev/null || useradd --system --home-dir /var/lib/agric --shell /usr/sbin/nologin agric
for group in video render; do
  if getent group "$group" >/dev/null; then usermod -aG "$group" agric; fi
done
install -d -o agric -g agric /var/lib/agric/{vision,models,logs,harness}
install -d -m 0750 -o root -g agric /etc/agric
install -m 0640 -o root -g agric "$root/deploy/jetson/.env" /etc/agric/edge.env
mkdir -p "$root/target"
if [[ ! -e "$root/target/harness-sessions" ]]; then ln -s /var/lib/agric/harness "$root/target/harness-sessions"; fi
chown agric:agric "$root/target"
install -m 0644 "$root/deploy/jetson/agric.service" "$root/deploy/jetson/agric-llama.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable agric-llama agric
echo "Installed services. Start database, build engine, download model, then start agric."
