# Nivana routing benchmark, 2026-11-03

48/48 held-out prompts answered (local (production router code, in-process)). Judges: gpt-6.1-sol, gemini-4-argon, kimi-k3.1-pro, each in both orders. Calls behind these results cost $3.25.

Score = how often the judges preferred Nivana's answer (50% = as good as the baseline). Cost = what the caller pays Nivana (model cost plus Nivana's margin) against the baseline's list price. "Model only" is the routed model's own cost before Nivana's margin: the effect of routing alone.

| Against | Score (95% CI) | Same-lab judges excluded | Nivana wins / ties / losses | Nivana cost | Baseline cost | Nivana ÷ baseline | Model only ÷ baseline | Median latency, Nivana / baseline |
|---|---|---|---|---|---|---|---|---|
| claude-opus-5.5 | 49% (41%–57%) | 49% (41%–57%) | 16 / 15 / 17 | $0.6210 | $0.7033 | 88% | 56% | 4.1 s / 5.2 s |
| claude-sonnet-5.5 | 55% (47%–63%) | 54% (46%–62%) | 20 / 13 / 15 | $0.6210 | $0.2979 | 208% | 132% | 4.1 s / 2.9 s |

## Against claude-opus-5.5

| Task | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 56% | $0.0290 | $0.0459 |
| writing | 6 | 25% | $0.0070 | $0.0887 |
| code | 6 | 43% | $0.2810 | $0.2109 |
| reasoning | 6 | 61% | $0.2120 | $0.1309 |
| math | 6 | 39% | $0.0250 | $0.0667 |
| data | 6 | 61% | $0.0060 | $0.0235 |
| long_context | 6 | 58% | $0.0550 | $0.0845 |
| translation | 6 | 49% | $0.0060 | $0.0523 |

| Prompt level | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 55% | $0.0170 | $0.0628 |
| medium | 16 | 48% | $0.1340 | $0.2077 |
| hard | 16 | 44% | $0.4700 | $0.4328 |

By judge: gpt-6.1-sol 54%, gemini-4-argon 45%, kimi-k3.1-pro 48%.

## Against claude-sonnet-5.5

| Task | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 69% | $0.0290 | $0.0214 |
| writing | 6 | 25% | $0.0070 | $0.0396 |
| code | 6 | 53% | $0.2810 | $0.0949 |
| reasoning | 6 | 63% | $0.2120 | $0.0531 |
| math | 6 | 67% | $0.0250 | $0.0242 |
| data | 6 | 63% | $0.0060 | $0.0077 |
| long_context | 6 | 51% | $0.0550 | $0.0404 |
| translation | 6 | 46% | $0.0060 | $0.0165 |

| Prompt level | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 55% | $0.0170 | $0.0289 |
| medium | 16 | 53% | $0.1340 | $0.0916 |
| hard | 16 | 56% | $0.4700 | $0.1774 |

By judge: gpt-6.1-sol 60%, gemini-4-argon 52%, kimi-k3.1-pro 52%.

## Where Nivana sent the prompts

| Model | Prompts |
|---|---|
| anthropic/claude-haiku-5.5 | 28 |
| anthropic/claude-opus-5.5 | 7 |
| deepseek/deepseek-v4.1-flash-1017 | 5 |
| mistral/mistral-large-4 | 3 |
| openai/gpt-6-luna | 3 |
| anthropic/claude-sonnet-5.5 | 2 |

Every prompt, answer, verdict and reason: rows.jsonl and answers/, verdicts/ in this folder.
