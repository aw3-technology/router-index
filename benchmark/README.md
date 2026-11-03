# Routing benchmark

**Is Nivana's automatic routing as good as always calling one strong model, and what does it cost?** This folder has the harness, the 48 held-out prompts and every answer, verdict and cost from each published run, so anyone can check the numbers or run it again.

Nivana runs this benchmark on its own product, so read the results as the operator's measurement, not an independent one. Independent re-runs are welcome; see [Reproduce it](#reproduce-it).

## Latest run: 2026-11-03

48 prompts, 48 answered. Each Nivana answer was compared with Claude Opus 5.5 and Claude Sonnet 5.5 called directly. Three judges (GPT-6.1 Sol, Gemini 4 Argon, Kimi K3.1 Pro) judged each pair in both orders. The calls behind the results cost $3.25.

| Against | Judges preferred Nivana (95% CI) | Same-lab judges excluded | Wins / ties / losses | Caller's cost, Nivana ÷ baseline | Model cost only ÷ baseline | Median latency, Nivana / baseline |
|---|---|---|---|---|---|---|
| Claude Opus 5.5 | 49% (41–57%) | 49% (41–57%) | 16 / 15 / 17 | 88% | 56% | 4.1 s / 5.2 s |
| Claude Sonnet 5.5 | 55% (47–63%) | 54% (46–62%) | 20 / 13 / 15 | 208% | 132% | 4.1 s / 2.9 s |

50% means the judges rated the two as equally good. "Caller's cost" is what an API caller pays Nivana: the routed model's cost plus Nivana's 50% service fee, rounded up to whole credits. "Model cost only" leaves out the fee and rounding, so it shows the effect of routing alone.

What it shows:

- **Against always-Opus, quality was statistically level.** The judges preferred Nivana 49% of the time, and the interval includes 50%. The routed models cost 56% of what Opus did. After Nivana's fee, the caller paid 88% of the Opus price, so the saving to a caller was small.
- **Against always-Sonnet, Nivana was not cheaper.** Its answers were preferred slightly more often (55%), but the interval includes 50%. It cost 1.3× Sonnet in model cost and 2.1× after the fee.
- **Easy and medium requests were where routing paid off.** Across the 32 prompts the authors labelled easy or medium, Nivana cost $0.15 against $0.27 for Opus, at 51% preference.
- **Hard requests cost about the same as Opus.** Nivana sends hard reasoning and code to Opus with a high reasoning effort. In this run that cost more than the plain Opus baseline: $0.47 against $0.43 across the 16 hard prompts, at 44% preference.
- **Writing was the weak spot (25% against both baselines).** The classifier rated most writing prompts easy, so Claude Haiku answered them, and the judges preferred the bigger models' prose. Translation (46–49%) and Opus-level maths (39%) were also below par. Reasoning, structured data, long documents and quick answers were at or above par.
- **Where requests went:** Claude Haiku 28, Claude Opus 7, DeepSeek Flash 5, Mistral Large 3, GPT-6 Luna 3, Claude Sonnet 2. Nivana picks models automatically, and its pool spans 14 models from 8 labs.

Full tables by task, prompt level and judge: [`results/2026-11-03/report.md`](results/2026-11-03/report.md). Per-prompt rows: [`rows.jsonl`](results/2026-11-03/rows.jsonl). Every answer is in `answers/`, and every verdict with the judge's reason is in `verdicts/`.

## Method

1. **Prompts.** [`prompts.json`](prompts.json) has 48 prompts across 8 tasks (quick answers, writing, code, reasoning, maths, structured data, long documents and translation), with 2 easy, 2 medium and 2 hard per task. Those levels are the authors' labels; Nivana's router decides difficulty for itself. None of these prompts appears in the suite that sets the router's quality scores (`server/evals.js` in Nivana), so the router was not tuned on them.
2. **Nivana answers.** Nobody tells it which model to use. Through the public API this is `POST /v1/chat` with the prompt as a single user message. Nivana's published run used `--local`, which imports the production router (`server/router.js` at the deployed commit) and runs the same classify → rank → answer path as `/v1/chat`, with the live catalogue, prices, health and quality priors.
3. **Baselines answer.** Each baseline model gets the same prompt through the Vercel AI Gateway, with no system prompt, no reasoning setting and up to 8,000 output tokens. The gateway reports the exact cost of each call.
4. **Judges compare.** Each judge sees the request, a task rubric and the two answers, and picks A, B or a tie. Each pair is judged in both orders, so position bias cancels: 3 judges × 2 orders gives 6 verdicts per comparison. A win scores 1, a tie 0.5 and a loss 0. A prompt counts as a win, tie or loss when its mean verdict is above, at or below 0.5.
5. **Judge bias.** Judges favour their own lab's models. The second score therefore drops every verdict from a judge whose lab made either answer. In this run that changed nothing by more than a point. The baselines are both Anthropic models, so no judge is from Anthropic.
6. **Uncertainty.** Each 95% interval is a seeded bootstrap over prompts, so re-running the summary on the same answers reproduces it exactly.

**Limits.** 48 prompts is a small sample: per-task numbers rest on 6 prompts each, and differences of a few points are noise. Model judges are not human raters. Nivana's answers carry its own system prompt and the baselines' don't, because a caller who calls a model directly doesn't get one. Prices and the router change over time, so every run is dated.

## Reproduce it

Node 22 or later. You need a Nivana API key for the routed answers and a Vercel AI Gateway key for the baselines and judges.

```bash
git clone https://github.com/aw3-technology/router-index && cd router-index/benchmark
npm install
export NIVANA_API_KEY=nvn_sk_…        # nivana.one/chat → Settings → API keys
export AI_GATEWAY_API_KEY=…           # vercel.com → AI Gateway → API keys
node run.mjs --dry                    # the plan, no calls
node run.mjs --out results/mine       # about 720 calls, a few dollars; resumable
```

Options: `--baseline <gateway id>` and `--judge <gateway id>` (both repeatable), `--limit N` (first N prompts), `--budget USD` (default 25), `--concurrency N` and `--nivana-url`. Answers and verdicts are cached in the output folder, so an interrupted run resumes where it stopped.

The run writes `report.md`, `summary.json` and `rows.jsonl`. To submit an independent result, open an issue on this repo with your `summary.json`, or post it wherever you review gateways.

Licence: the harness is MIT and the prompts and results are [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), like the rest of the repo.
