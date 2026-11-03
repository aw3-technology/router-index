#!/usr/bin/env python3
"""Regenerate README.md from data/router-index.json (run after the data is updated)."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
d = json.loads((root / "data/router-index.json").read_text())
tasks = list(d["models"][0]["quality"].keys()) if d["models"] else []


def price(m):
    p = m.get("price_per_million_tokens")
    return f"${p['input']} / ${p['output']}" if p else "—"


picks = "\n".join(
    f"| {x['task']} | {x['difficulty']} | {x.get('picked') or '—'} | {x['candidates'][1]['model'] if len(x['candidates']) > 1 else '—'} |"
    for x in d["decisions"]
)
scores = "\n".join(
    f"| {m['name']} | {m['lab']} | " + " | ".join(str(m["quality"].get(t, "—")) for t in tasks) + f" | {price(m)} |"
    for m in d["models"]
)
readme = f"""# The Router Index

**Which AI model is best for each kind of task, measured.** The Router Index is what [Nivana](https://nivana.one)'s model router picks for 8 kinds of request at 3 difficulties. The picks come from measured quality, live prices and speed, and the data is refreshed monthly.

- Live page: https://nivana.one/router-index
- Data: [`data/router-index.csv`](data/router-index.csv) · [`data/router-index.json`](data/router-index.json) (also at https://nivana.one/router-index.csv and https://nivana.one/router-index.json)
- Updated: **{d['updated']}**
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Free to reuse, including commercially, with a link to https://nivana.one/router-index.

## What the router picks

| Task | Difficulty | Picked | Runner-up |
|---|---|---|---|
{picks}

## Measured quality by task (0–100)

| Model | Lab | {' | '.join(t.capitalize() for t in tasks)} | Price in / out per 1M tokens |
|---|---|{'---|' * len(tasks)}---|
{scores}

## Does routing beat one strong model?

The [routing benchmark](benchmark/) compares Nivana's automatic routing with always calling Claude Opus 5.5 or Sonnet 5.5, on 96 held-out prompts in two sets. Three judges from other labs compared each pair in both orders. On 2026-11-03, the judges preferred Opus over Nivana: Nivana scored 44% (95% CI 38–49%), and a caller paid 111% of the Opus price. Against Sonnet, Nivana was level (51%) at 2.6 times the price. Routing paid off on easy requests, which were level with Opus at a quarter of the cost. It did worst on hard requests and on writing. Prompts, answers, verdicts and the harness are all in [`benchmark/`](benchmark/), so anyone can run it again.

## Method

{d['method']}

The best pick depends on the request, not just the top score. A few points of quality rarely show on an easy request, while a 10–100× price difference always does. The router therefore weighs cost and speed heavily for easy requests and almost ignores them for hard ones. Full write-up: https://nivana.one/router-index#method.

## Columns (CSV)

`task, difficulty, rank, model, lab, quality_0_100, expected_cost_usd, expected_seconds, thinking_effort, updated`. Each row is one candidate in the router's ranking for a task and difficulty. Rank 1 is the model the router sends that request to. `expected_cost_usd` is the cost of a typical request of that kind at live list prices.

## Cite

> The Router Index, Nivana (AW3 Technology), {d['updated']}. https://nivana.one/router-index. CC BY 4.0.

---

Made by [Nivana](https://nivana.one), the AI that sends every request to the best model for it: one chat app and one API, with no model picker. Built by [AW3 Technology](https://aw3.tech).
"""
(root / "README.md").write_text(readme)
