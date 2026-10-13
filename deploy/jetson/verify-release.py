"""Check every bundled file before installation. Does not execute downloaded content."""
import hashlib
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'release-manifest.json').read_text(encoding='utf-8-sig'))
if manifest.get('version')!=1:
    raise SystemExit('Unsupported release manifest')
for row in manifest['files']:
    file=(root/row['path']).resolve()
    if not file.is_relative_to(root) or not file.is_file():
        raise SystemExit('Invalid or missing bundle path')
    if hashlib.sha256(file.read_bytes()).hexdigest()!=row['sha256']:
        raise SystemExit('Release checksum mismatch: '+row['path'])
print('Release files verified:',len(manifest['files']))
