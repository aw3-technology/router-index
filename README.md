# The Router Index

**Which AI model is best for each kind of task, measured.** The Router Index is what [Nivana](https://nivana.one)'s model router picks for 8 kinds of request at 3 difficulties. The picks come from measured quality, live prices and speed, and the data is refreshed monthly.

- Live page: https://nivana.one/router-index
- Data: [`data/router-index.csv`](data/router-index.csv) · [`data/router-index.json`](data/router-index.json) (also at https://nivana.one/router-index.csv and https://nivana.one/router-index.json)
- On Hugging Face: [willschulz/router-index](https://huggingface.co/datasets/willschulz/router-index)
- Updated: **2026-11-23**
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Free to reuse, including commercially, with a link to https://nivana.one/router-index.

## What the router picks

| Task | Difficulty | Picked | Runner-up |
|---|---|---|---|
| quick answers | easy | GPT-6 Luna | Claude Haiku |
| quick answers | medium | GPT-6 Luna | Claude Haiku |
| quick answers | hard | GPT-6 Luna | Gemini Flash |
| writing | easy | GPT-6 Luna | Claude Haiku |
| writing | medium | GPT-6 Luna | Claude Haiku |
| writing | hard | Claude Sonnet | Claude Opus |
| coding | easy | GPT-6 Luna | Claude Haiku |
| coding | medium | Grok 4.7 | GPT-6.1 Sol |
| coding | hard | Claude Opus | GPT-6.1 Sol |
| reasoning | easy | GPT-6 Luna | Claude Haiku |
| reasoning | medium | Claude Sonnet | Claude Opus |
| reasoning | hard | Claude Opus | Claude Sonnet |
| maths | easy | Claude Haiku | GPT-6 Luna |
| maths | medium | Mistral Large | Claude Opus |
| maths | hard | Claude Opus | Mistral Large |
| structured data | easy | GPT-6 Luna | Claude Haiku |
| structured data | medium | GPT-6 Luna | Gemini Flash |
| structured data | hard | GPT-6 Luna | Gemini Flash |
| long documents | easy | GPT-6 Luna | Gemini Flash |
| long documents | medium | GPT-6 Luna | Gemini Flash |
| long documents | hard | Gemini Flash | DeepSeek Flash |
| translation | easy | GPT-6 Luna | Claude Haiku |
| translation | medium | GPT-6 Luna | Claude Haiku |
| translation | hard | GPT-6 Luna | Gemini Flash |

## Measured quality by task (0–100)

| Model | Lab | Quick answers | Writing | Coding | Reasoning | Maths | Structured data | Long documents | Translation | Price in / out per 1M tokens |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Opus | Anthropic | 82 | 96 | 98 | 98 | 97 | 88 | 87 | 94 | $4 / $20 |
| Claude Sonnet | Anthropic | 85 | 93 | 94 | 90 | 84 | 88 | 90 | 86 | $2 / $10 |
| Claude Haiku | Anthropic | 89 | 89 | 86 | 73 | 83 | 84 | 90 | 87 | $0.1 / $0.5 |
| GPT-6.1 Sol | OpenAI | 93 | 92 | 95 | 81 | 75 | 90 | 93 | 91 | $2 / $10 |
| GPT-6 Luna | OpenAI | 95 | 90 | 87 | 77 | 69 | 91 | 91 | 92 | $0.1 / $0.5 |
| GPT-5.5 | OpenAI | 94 | 93 | 92 | 77 | 78 | 93 | 95 | 94 | $5 / $30 |
| Gemini 4 Argon | Google | 92 | 80 | 81 | 80 | 85 | 92 | 89 | 91 | $2 / $10 |
| Gemini Flash | Google | 93 | 80 | 80 | 73 | 83 | 92 | 96 | 93 | $0.75 / $3.75 |
| DeepSeek V4 Pro | DeepSeek | 91 | 88 | 83 | 75 | 83 | 91 | 91 | 91 | $1.32 / $3.96 |
| DeepSeek Flash | DeepSeek | 93 | 85 | 88 | 77 | 75 | 90 | 93 | 92 | $0.3 / $1.2 |
| Mistral Large | Mistral AI | 85 | 83 | 78 | 74 | 88 | 88 | 92 | 92 | $0.7 / $2.1 |
| Muse Spark | Meta | 92 | 87 | 82 | 82 | 82 | 87 | 93 | 92 | $1.25 / $4.25 |
| Kimi K3.1 Pro | Moonshot | 93 | 91 | 93 | 85 | 78 | 91 | 93 | 92 | $2 / $10 |
| Grok 4.7 | xAI | 92 | 88 | 89 | 81 | 81 | 87 | 90 | 90 | $2 / $6 |

## Does routing beat one strong model?

The [routing benchmark](benchmark/) compares Nivana's automatic routing with always calling Claude Opus 5.5 or Sonnet 5.5, on 96 held-out prompts in two sets. Three judges from other labs compared each pair in both orders. On 2026-11-03, the judges preferred Opus over Nivana: Nivana scored 44% (95% CI 38–49%), and a caller paid 111% of the Opus price. Against Sonnet, Nivana was level (51%) at 2.6 times the price. Routing paid off on easy requests, which were level with Opus at a quarter of the cost. It did worst on hard requests and on writing. Prompts, answers, verdicts and the harness are all in [`benchmark/`](benchmark/), so anyone can run it again.

## Method

Quality from weekly pairwise evals per task judged by models from several labs (0–100); cost from live AI Gateway list prices for a typical request of that kind; speed from live traffic.

The best pick depends on the request, not just the top score. A few points of quality rarely show on an easy request, while a 10–100× price difference always does. The router therefore weighs cost and speed heavily for easy requests and almost ignores them for hard ones. Full write-up: https://nivana.one/router-index#method.

## Columns (CSV)

`task, difficulty, rank, model, lab, quality_0_100, expected_cost_usd, expected_seconds, thinking_effort, updated`. Each row is one candidate in the router's ranking for a task and difficulty. Rank 1 is the model the router sends that request to. `expected_cost_usd` is the cost of a typical request of that kind at live list prices.

## Cite

> The Router Index, Nivana (AW3 Technology), 2026-11-23. https://nivana.one/router-index. CC BY 4.0.

---

Made by [Nivana](https://nivana.one), the AI that sends every request to the best model for it: one chat app and one API, with no model picker. Built by [AW3 Technology](https://aw3.tech).
