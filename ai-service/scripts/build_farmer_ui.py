"""Bundle farmer UI into the existing approved static endpoints (no server restart)."""
from pathlib import Path
import base64
import json
import shutil

STATIC = Path(__file__).resolve().parents[1] / 'graph_web/static'
for suffix in ['js', 'css']:
    target = STATIC / f'dashboard.{suffix}'
    source = STATIC / ('crop-workspace.js' if suffix == 'js' else 'graph-fix.css')
    start = '/* BEGIN FARMER EXPLORER */'
    code = target.read_text(encoding='utf-8').split(start)[0].rstrip()
    assets = ''
    if suffix == 'js':
        images = {}
        workspace = STATIC.parents[3]
        dest = STATIC.parents[1] / 'data/botou_yali/evidence/images/crops'
        dest.mkdir(parents=True, exist_ok=True)
        for key, filename in [('pear','梨.png'),('wheat','小麦 .png'),('jujube','枣.png'),('vegetable','蔬菜.png')]:
            original = workspace / filename
            shutil.copyfile(original, dest / (key+'.png'))
            images[key] = 'data:image/png;base64,'+base64.b64encode(original.read_bytes()).decode()
        assets = 'window.CROP_IMAGES='+json.dumps(images)+';\n'
    theme = '\n' + (STATIC / 'liquid-glass.css').read_text(encoding='utf-8') if suffix == 'css' else ''
    target.write_text(code + '\n' + start + '\n' + assets + source.read_text(encoding='utf-8') + theme + '\n', encoding='utf-8')
html = STATIC / 'dashboard.html'
html.write_text(html.read_text(encoding='utf-8').replace('photo-9', 'farmer-1'), encoding='utf-8')
print('Built farmer explorer JavaScript and CSS.')
