# Nivana routing benchmark, 2026-11-03

46/48 held-out prompts from prompts-v2.json answered (local (production router code, in-process)). Judges: gpt-6.1-sol, gemini-4-argon, kimi-k3.1-pro, each in both orders. Calls behind these results cost $3.25.

Score = how often the judges preferred Nivana's answer (50% = as good as the baseline). Cost = what the caller pays Nivana (model cost plus Nivana's margin) against the baseline's list price. "Model only" is the routed model's own cost before Nivana's margin: the effect of routing alone.

| Against | Score (95% CI) | Same-lab judges excluded | Nivana wins / ties / losses | Nivana cost | Baseline cost | Nivana ÷ baseline | Model only ÷ baseline | Median latency, Nivana / baseline |
|---|---|---|---|---|---|---|---|---|
| claude-opus-5.5 | 38% (29%–46%) | 36% (28%–45%) | 11 / 10 / 25 | $0.6590 | $0.6698 | 98% | 63% | 4.0 s / 5.3 s |
| claude-sonnet-5.5 | 47% (38%–56%) | 45% (36%–55%) | 17 / 10 / 19 | $0.6590 | $0.2820 | 234% | 150% | 4.0 s / 3.5 s |

## Against claude-opus-5.5

| Task | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 26% | $0.0270 | $0.0419 |
| writing | 6 | 31% | $0.0650 | $0.0842 |
| code | 4 | 13% | $0.1070 | $0.1188 |
| reasoning | 6 | 58% | $0.3330 | $0.1980 |
| math | 6 | 51% | $0.0650 | $0.0588 |
| data | 6 | 54% | $0.0170 | $0.0352 |
| long_context | 6 | 32% | $0.0330 | $0.0801 |
| translation | 6 | 26% | $0.0120 | $0.0527 |

| Prompt level | n | Score | Nivana cost | claude-opus-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 31% | $0.0190 | $0.0787 |
| medium | 15 | 47% | $0.2300 | $0.2127 |
| hard | 15 | 36% | $0.4100 | $0.3784 |

By judge: gpt-6.1-sol 40%, gemini-4-argon 36%, kimi-k3.1-pro 36%.

## Against claude-sonnet-5.5

| Task | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| quick | 6 | 50% | $0.0270 | $0.0200 |
| writing | 6 | 39% | $0.0650 | $0.0369 |
| code | 4 | 40% | $0.1070 | $0.0466 |
| reasoning | 6 | 69% | $0.3330 | $0.0877 |
| math | 6 | 60% | $0.0650 | $0.0190 |
| data | 6 | 53% | $0.0170 | $0.0202 |
| long_context | 6 | 31% | $0.0330 | $0.0348 |
| translation | 6 | 29% | $0.0120 | $0.0167 |

| Prompt level | n | Score | Nivana cost | claude-sonnet-5.5 cost |
|---|---|---|---|---|
| easy | 16 | 33% | $0.0190 | $0.0340 |
| medium | 15 | 58% | $0.2300 | $0.1007 |
| hard | 15 | 49% | $0.4100 | $0.1473 |

By judge: gpt-6.1-sol 45%, gemini-4-argon 42%, kimi-k3.1-pro 53%.

## Where Nivana sent the prompts

| Model | Prompts |
|---|---|
| anthropic/claude-haiku-5.5 | 20 |
| anthropic/claude-sonnet-5.5 | 8 |
| deepseek/deepseek-v4.1-flash-1017 | 7 |
| anthropic/claude-opus-5.5 | 7 |
| openai/gpt-6-luna | 3 |
| mistral/mistral-large-4 | 1 |

## Errors

- code-m1: Delay was aborted
- code-h1: Delay was aborted

Every prompt, answer, verdict and reason: rows.jsonl and answers/, verdicts/ in this folder.
