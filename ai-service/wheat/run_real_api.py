"""Manual HTTP smoke test against the running service; no mocks or fallback."""
import json
from urllib.request import Request, urlopen

from .build import ROOT, save
from .service import QUESTIONS


def main():
    request = Request(
        'http://127.0.0.1:8090/api/wheat/ask',
        data=json.dumps({'question': QUESTIONS[4]}, ensure_ascii=False).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urlopen(request, timeout=360) as response:
        status = response.status
        result = json.load(response)
    save(ROOT / 'evaluation/real_api_reviewed.json', {'http_status': status, 'result': result})
    print(json.dumps({'http_status': status, **{k: result[k] for k in
        ('status', 'generation_called', 'retrieval', 'grounding')}}, ensure_ascii=False))
    if status != 200 or not result['generation_called']:
        raise RuntimeError('Real HTTP generation did not complete')
    if not result['grounding'] or not result['grounding']['passed']:
        raise RuntimeError('The generated answer was correctly rejected; inspect the saved result')


if __name__ == '__main__':
    main()
