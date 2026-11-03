# Nivana routing benchmark, 2026-11-03

48/48 held-out prompts from prompts-v2.json answered (local (production router code, in-process)). Judges: gpt-6.1-sol, gemini-4-argon, kimi-k3.1-pro, each in both orders. Calls behind these results cost $3.98.

Score = how often the judges preferred Nivana's answer (50% = as good as the baseline). Cost = what the caller pays Nivana (model cost plus Nivana's margin) against the baseline's list price. "Model only" is the routed model's own cost before Nivana's margin: the effect of routing alone.

| Against | Score (95% CI) | Same-lab judges excluded | Nivana wins / ties / losses | Nivana cost | Baseline cost | Nivana ÷ baseline | Model only ÷ baseline | Median latency, Nivana / baseline |
|---|---|---|---|---|---|---|---|---|
| claude-opus-5.5 | 38% (31%–46%) | 37% (30%–45%) | 9 / 12 / 27 | $1.12 | $0.8658 | 129% | 84% | 4.4 s / 5.6 s |
| claude-sonnet-5.5 | 48% (39%–56%) | 47% (39%–55%) | 16 / 14 / 18 | $1.12 | $0.3701 | 302% | 196% | 4.4 s / 3.8 s |

## Against claude-opus-5.5

| Task | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 50% | $0.1140 | $0.0419 |
| writing | 6 | 28% | $0.0060 | $0.0842 |
| code | 6 | 36% | $0.5790 | $0.3149 |
| reasoning | 6 | 36% | $0.3140 | $0.1980 |
| math | 6 | 49% | $0.0490 | $0.0588 |
| data | 6 | 40% | $0.0150 | $0.0352 |
| long_context | 6 | 32% | $0.0200 | $0.0801 |
| translation | 6 | 35% | $0.0200 | $0.0527 |

| Prompt level | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 43% | $0.0180 | $0.0787 |
| medium | 16 | 41% | $0.2020 | $0.2484 |
| hard | 16 | 31% | $0.8970 | $0.5387 |

By judge: gpt-6.1-sol 45%, gemini-4-argon 34%, kimi-k3.1-pro 36%.

## Against claude-sonnet-5.5

| Task | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 64% | $0.1140 | $0.0200 |
| writing | 6 | 36% | $0.0060 | $0.0369 |
| code | 6 | 28% | $0.5790 | $0.1347 |
| reasoning | 6 | 65% | $0.3140 | $0.0877 |
| math | 6 | 61% | $0.0490 | $0.0190 |
| data | 6 | 49% | $0.0150 | $0.0202 |
| long_context | 6 | 35% | $0.0200 | $0.0348 |
| translation | 6 | 43% | $0.0200 | $0.0167 |

| Prompt level | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 45% | $0.0180 | $0.0340 |
| medium | 16 | 54% | $0.2020 | $0.1087 |
| hard | 16 | 43% | $0.8970 | $0.2275 |

By judge: gpt-6.1-sol 48%, gemini-4-argon 41%, kimi-k3.1-pro 54%.

## Where Nivana sent the prompts

| Model | Prompts |
|---|---|
| anthropic/claude-haiku-5.5 | 23 |
| anthropic/claude-opus-5.5 | 7 |
| anthropic/claude-sonnet-5.5 | 6 |
| deepseek/deepseek-v4.1-flash-1017 | 6 |
| openai/gpt-6-luna | 5 |
| mistral/mistral-large-4 | 1 |

Every prompt, answer, verdict and reason: rows.jsonl and answers/, verdicts/ in this folder.
