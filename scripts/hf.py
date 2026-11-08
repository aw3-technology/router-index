"""Mirror README, LICENSE and data/ to the Hugging Face dataset willschulz/router-index.

Run from the repo root after scripts/readme.py; uses the token saved by `hf auth login`
(~/.cache/huggingface/token) or HF_TOKEN. The dataset card's YAML header is added here.
"""
import base64, json, os, pathlib, urllib.request

REPO = 'willschulz/router-index'
CARD = """---
license: cc-by-4.0
pretty_name: The Router Index
language:
- en
tags:
- llm
- model-routing
- llm-evaluation
- benchmark
- pricing
size_categories:
- n<1K
configs:
- config_name: default
  data_files: data/router-index.csv
---

"""

token = os.environ.get('HF_TOKEN') or pathlib.Path.home().joinpath('.cache/huggingface/token').read_text().strip()
files = {'README.md': (CARD + pathlib.Path('README.md').read_text()).encode(), 'LICENSE': pathlib.Path('LICENSE').read_bytes()}
for f in ('router-index.csv', 'router-index.json'):
    files[f'data/{f}'] = pathlib.Path('data', f).read_bytes()
lines = [json.dumps({'key': 'header', 'value': {'summary': 'Monthly refresh', 'description': 'Mirrored from github.com/aw3-technology/router-index'}})]
lines += [json.dumps({'key': 'file', 'value': {'path': p, 'content': base64.b64encode(c).decode(), 'encoding': 'base64'}}) for p, c in files.items()]
req = urllib.request.Request(f'https://huggingface.co/api/datasets/{REPO}/commit/main', data='\n'.join(lines).encode(), method='POST', headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/x-ndjson'})
with urllib.request.urlopen(req, timeout=60) as res:
    print('hugging face:', json.load(res).get('commitUrl'))
