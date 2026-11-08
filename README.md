# The Router Index

**Which AI model is best for each kind of task, measured.** The Router Index is what [Nivana](https://nivana.one)'s model router picks for 8 kinds of request at 3 difficulties. The picks come from measured quality, live prices and speed, and the data is refreshed monthly.

- Live page: https://nivana.one/router-index
- Data: [`data/router-index.csv`](data/router-index.csv) · [`data/router-index.json`](data/router-index.json) (also at https://nivana.one/router-index.csv and https://nivana.one/router-index.json)
- On Hugging Face: [willschulz/router-index](https://huggingface.co/datasets/willschulz/router-index)
- Updated: **2026-11-01**
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Free to reuse, including commercially, with a link to https://nivana.one/router-index.

## What the router picks

| Task | Difficulty | Picked | Runner-up |
|---|---|---|---|
| quick answers | easy | GPT-6 Luna | Claude Haiku |
| quick answers | medium | GPT-6 Luna | Claude Haiku |
| quick answers | hard | GPT-6 Luna | Gemini Flash |
| writing | easy | GPT-6 Luna | Claude Haiku |
| writing | medium | GPT-6 Luna | Claude Haiku |
| writing | hard | Claude Sonnet | GPT-6.1 Sol |
| coding | easy | GPT-6 Luna | Claude Haiku |
| coding | medium | Claude Sonnet | GPT-6.1 Sol |
| coding | hard | Claude Opus | Claude Sonnet |
| reasoning | easy | GPT-6 Luna | Claude Haiku |
| reasoning | medium | Claude Sonnet | Claude Opus |
| reasoning | hard | Claude Opus | Claude Sonnet |
| maths | easy | GPT-6 Luna | Claude Haiku |
| maths | medium | Mistral Large | DeepSeek V4 Pro |
| maths | hard | Claude Opus | Mistral Large |
| structured data | easy | GPT-6 Luna | Claude Haiku |
| structured data | medium | GPT-6 Luna | Claude Haiku |
| structured data | hard | GPT-6 Luna | Gemini Flash |
| long documents | easy | GPT-6 Luna | Gemini Flash |
| long documents | medium | GPT-6 Luna | Gemini Flash |
| long documents | hard | Gemini Flash | Gemini 4 Argon |
| translation | easy | GPT-6 Luna | Claude Haiku |
| translation | medium | GPT-6 Luna | Gemini Flash |
| translation | hard | GPT-6 Luna | Gemini Flash |

## Measured quality by task (0–100)

| Model | Lab | Quick answers | Writing | Coding | Reasoning | Maths | Structured data | Long documents | Translation | Price in / out per 1M tokens |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Opus | Anthropic | 82 | 94 | 98 | 99 | 96 | 87 | 87 | 92 | $4 / $20 |
| Claude Sonnet | Anthropic | 85 | 93 | 94 | 90 | 84 | 88 | 90 | 86 | $2 / $10 |
| Claude Haiku | Anthropic | 85 | 89 | 82 | 74 | 79 | 86 | 87 | 83 | $0.1 / $0.5 |
| GPT-6.1 Sol | OpenAI | 91 | 93 | 93 | 82 | 79 | 91 | 91 | 89 | $2 / $10 |
| GPT-6 Luna | OpenAI | 93 | 90 | 84 | 77 | 70 | 93 | 88 | 90 | $0.1 / $0.5 |
| GPT-5.5 | OpenAI | 93 | 94 | 91 | 79 | 82 | 96 | 93 | 92 | $5 / $30 |
| Gemini 4 Argon | Google | 88 | 82 | 82 | 82 | 86 | 93 | 92 | 88 | $2 / $10 |
| Gemini Flash | Google | 91 | 81 | 80 | 74 | 85 | 93 | 94 | 92 | $0.75 / $3.75 |
| DeepSeek V4 Pro | DeepSeek | 89 | 88 | 83 | 76 | 87 | 93 | 88 | 89 | $0.66 / $1.98 |
| DeepSeek Flash | DeepSeek | 91 | 87 | 85 | 80 | 78 | 92 | 91 | 90 | $0.3 / $1.2 |
| Mistral Large | Mistral AI | 82 | 84 | 78 | 76 | 87 | 90 | 89 | 91 | $0.7 / $2.1 |
| Muse Spark | Meta | 89 | 86 | 84 | 83 | 80 | 88 | 90 | 89 | $1.25 / $4.25 |
| Kimi K3.1 Pro | Moonshot | 91 | 92 | 89 | 85 | 81 | 92 | 90 | 91 | $2 / $10 |
| Grok 4.7 | xAI | 90 | 90 | 85 | 80 | 79 | 85 | 85 | 86 | $2 / $6 |

## Does routing beat one strong model?

The [routing benchmark](benchmark/) compares Nivana's automatic routing with always calling Claude Opus 5.5 or Sonnet 5.5, on 96 held-out prompts in two sets. Three judges from other labs compared each pair in both orders. On 2026-11-03, the judges preferred Opus over Nivana: Nivana scored 44% (95% CI 38–49%), and a caller paid 111% of the Opus price. Against Sonnet, Nivana was level (51%) at 2.6 times the price. Routing paid off on easy requests, which were level with Opus at a quarter of the cost. It did worst on hard requests and on writing. Prompts, answers, verdicts and the harness are all in [`benchmark/`](benchmark/), so anyone can run it again.

## Method

Quality from weekly pairwise evals per task judged by models from several labs (0–100); cost from live AI Gateway list prices for a typical request of that kind; speed from live traffic.

The best pick depends on the request, not just the top score. A few points of quality rarely show on an easy request, while a 10–100× price difference always does. The router therefore weighs cost and speed heavily for easy requests and almost ignores them for hard ones. Full write-up: https://nivana.one/router-index#method.

## Columns (CSV)

`task, difficulty, rank, model, lab, quality_0_100, expected_cost_usd, expected_seconds, thinking_effort, updated`. Each row is one candidate in the router's ranking for a task and difficulty. Rank 1 is the model the router sends that request to. `expected_cost_usd` is the cost of a typical request of that kind at live list prices.

## Cite

> The Router Index, Nivana (AW3 Technology), 2026-11-01. https://nivana.one/router-index. CC BY 4.0.

---

Made by [Nivana](https://nivana.one), the AI that sends every request to the best model for it: one chat app and one API, with no model picker. Built by [AW3 Technology](https://aw3.tech).
