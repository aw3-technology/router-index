# The Router Index

**Which AI model is best for each kind of task, measured.** The Router Index is what [Nivana](https://nivana.one)'s model router picks for 8 kinds of request at 3 difficulties. The picks come from measured quality, live prices and speed, and the data is refreshed monthly.

- Live page: https://nivana.one/router-index
- Data: [`data/router-index.csv`](data/router-index.csv) · [`data/router-index.json`](data/router-index.json) (also at https://nivana.one/router-index.csv and https://nivana.one/router-index.json)
- Updated: **2026-10-25**
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Free to reuse, including commercially, with a link to https://nivana.one/router-index.

## What the router picks

| Task | Difficulty | Picked | Runner-up |
|---|---|---|---|
| quick answers | easy | GPT-6 Luna | Claude Haiku |
| quick answers | medium | GPT-6 Luna | DeepSeek Flash |
| quick answers | hard | GPT-6 Luna | Gemini Flash |
| writing | easy | GPT-6 Luna | DeepSeek Flash |
| writing | medium | GPT-6 Luna | DeepSeek Flash |
| writing | hard | Claude Sonnet | Claude Opus |
| coding | easy | GPT-6 Luna | DeepSeek Flash |
| coding | medium | Claude Sonnet | GPT-6.1 Sol |
| coding | hard | Claude Sonnet | Claude Opus |
| reasoning | easy | GPT-6 Luna | DeepSeek Flash |
| reasoning | medium | Claude Sonnet | Claude Opus |
| reasoning | hard | Claude Opus | Claude Sonnet |
| maths | easy | GPT-6 Luna | DeepSeek Flash |
| maths | medium | DeepSeek V4 Pro | Gemini 4 Argon |
| maths | hard | DeepSeek V4 Pro | Claude Opus |
| structured data | easy | GPT-6 Luna | DeepSeek Flash |
| structured data | medium | GPT-6 Luna | DeepSeek Flash |
| structured data | hard | Gemini 4 Argon | GPT-5.5 |
| long documents | easy | GPT-6 Luna | DeepSeek Flash |
| long documents | medium | Gemini Flash | DeepSeek Flash |
| long documents | hard | Gemini Flash | Gemini 4 Argon |
| translation | easy | GPT-6 Luna | DeepSeek Flash |
| translation | medium | GPT-6 Luna | DeepSeek Flash |
| translation | hard | Mistral Large | Claude Opus |

## Measured quality by task (0–100)

| Model | Lab | Quick answers | Writing | Coding | Reasoning | Maths | Structured data | Long documents | Translation | Price in / out per 1M tokens |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Opus | Anthropic | 83 | 95 | 97 | 98 | 93 | 88 | 91 | 91 | $4 / $20 |
| Claude Sonnet | Anthropic | 85 | 93 | 94 | 90 | 84 | 88 | 90 | 86 | $2 / $10 |
| Claude Haiku | Anthropic | 81 | 84 | 78 | 73 | 71 | 83 | 83 | 78 | $0.1 / $0.5 |
| GPT-6.1 Sol | OpenAI | 84 | 89 | 88 | 82 | 77 | 86 | 86 | 83 | $2 / $10 |
| GPT-6 Luna | OpenAI | 88 | 85 | 81 | 74 | 70 | 90 | 83 | 84 | $0.1 / $0.5 |
| GPT-5.5 | OpenAI | 87 | 92 | 90 | 84 | 87 | 93 | 90 | 88 | $5 / $30 |
| Gemini 4 Argon | Google | 84 | 85 | 85 | 85 | 87 | 91 | 95 | 89 | $2 / $10 |
| Gemini Flash | Google | 87 | 81 | 79 | 74 | 80 | 88 | 93 | 87 | $0.75 / $3.75 |
| DeepSeek V4 Pro | DeepSeek | 81 | 83 | 85 | 80 | 92 | 87 | 82 | 81 | $0.66 / $1.98 |
| DeepSeek Flash | DeepSeek | 84 | 86 | 85 | 81 | 77 | 86 | 86 | 84 | $0.075 / $0.3 |
| Mistral Large | Mistral AI | 80 | 85 | 79 | 78 | 81 | 87 | 84 | 93 | $1.36 / $4.18 |
| Muse Spark | Meta | 82 | 84 | 84 | 82 | 77 | 84 | 86 | 82 | $1.25 / $4.25 |
| Kimi K3.1 Pro | Moonshot | 84 | 89 | 87 | 83 | 80 | 86 | 86 | 84 | $2 / $10 |
| Grok 4.7 | xAI | 83 | 89 | 83 | 80 | 75 | 82 | 82 | 82 | $2 / $6 |

## Method

Quality from weekly pairwise evals per task judged by models from several labs (0–100); cost from live AI Gateway list prices for a typical request of that kind; speed from live traffic.

The best pick depends on the request, not just the top score. A few points of quality rarely show on an easy request, while a 10–100× price difference always does. The router therefore weighs cost and speed heavily for easy requests and almost ignores them for hard ones. Full write-up: https://nivana.one/router-index#method.

## Columns (CSV)

`task, difficulty, rank, model, lab, quality_0_100, expected_cost_usd, expected_seconds, thinking_effort, updated`. Each row is one candidate in the router's ranking for a task and difficulty. Rank 1 is the model the router sends that request to. `expected_cost_usd` is the cost of a typical request of that kind at live list prices.

## Cite

> The Router Index, Nivana (AW3 Technology), 2026-10-25. https://nivana.one/router-index. CC BY 4.0.

---

Made by [Nivana](https://nivana.one), the AI that sends every request to the best model for it: one chat app and one API, with no model picker. Built by [AW3 Technology](https://aw3.tech).
