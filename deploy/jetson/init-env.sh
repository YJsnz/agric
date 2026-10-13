#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ -e .env ]]; then echo ".env exists; preserved."; exit 0; fi
umask 077
cp .env.example .env
python3 - <<'PY'
from pathlib import Path
import secrets
p=Path('.env')
s=p.read_text()
for placeholder in ('replace-with-random-secret','replace-with-another-random-secret',
                    'replace-with-at-least-32-random-bytes'):
    # Replace one occurrence at a time so DB and model API keys are distinct.
    while placeholder in s:
        s=s.replace(placeholder,secrets.token_hex(32),1)
p.write_text(s)
PY
echo "Created protected .env. Do not commit it."
