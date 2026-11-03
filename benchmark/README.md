# Routing benchmark

**Is Nivana's automatic routing as good as always calling one strong model, and what does it cost?** This folder has the harness, the 48 held-out prompts and every answer, verdict and cost from each published run, so anyone can check the numbers or run it again.

Nivana runs this benchmark on its own product, so read the results as the operator's measurement, not an independent one. Independent re-runs are welcome; see [Reproduce it](#reproduce-it).

## Results: 2026-11-03

The current router was tested on two held-out sets of 48 prompts each. [`prompts.json`](prompts.json) was written first. [`prompts-v2.json`](prompts-v2.json) was written after the first run, so that router changes made in response to it could be tested on prompts they weren't shaped by. Each Nivana answer was compared with Claude Opus 5.5 and Claude Sonnet 5.5 called directly. Three judges (GPT-6.1 Sol, Gemini 4 Argon, Kimi K3.1 Pro) judged each pair in both orders. Both runs together, 96 prompts:

| Against | Judges preferred Nivana (95% CI) | Wins / ties / losses | Caller's cost, Nivana ÷ baseline | Model cost only ÷ baseline |
|---|---|---|---|---|
| Claude Opus 5.5 | **44% (38–49%)** | 25 / 27 / 44 | 111% | 71% |
| Claude Sonnet 5.5 | **51% (45–57%)** | 36 / 27 / 33 | 260% | 167% |

| Run | Prompts | Against Opus | Caller's cost ÷ Opus | Against Sonnet | Caller's cost ÷ Sonnet |
|---|---|---|---|---|---|
| [Set 1](results/2026-11-03/report.md) | 48 | 49% (41–57%) | 88% | 55% (47–63%) | 208% |
| [Set 2](results/2026-11-03-v2/current-router/report.md) | 48 | 38% (31–46%) | 129% | 48% (39–56%) | 302% |

50% means the judges rated the two as equally good. "Caller's cost" is what an API caller pays Nivana: the routed model's cost plus Nivana's 50% service fee, rounded up to whole credits. "Model cost only" leaves out the fee and rounding, so it shows the effect of routing alone.

What it shows:

- **Nivana's answers were rated below always-Opus, at about the same price.** The judges preferred Opus more often than Nivana, and the interval sits below 50%. The routed models cost 71% of Opus. After the fee, a caller paid 111% of the Opus price. Set 1 on its own looked level (49%), but set 2 didn't confirm it, so the pooled figure is the one to use.
- **Against always-Sonnet, quality was level but the cost was 2.6× higher.** If Sonnet is good enough for your traffic, calling it directly costs less.
- **Easy requests were where routing paid off.** On the 32 easy prompts, Nivana was level with Opus (49%) at 25% of its cost ($0.035 against $0.14).
- **Hard requests did worst.** On the 32 hard prompts the score against Opus was 37%, and Nivana cost 1.4× Opus. When it routes hard reasoning and code to Opus, it sets a high reasoning effort, which costs more than plain Opus. In 20 such pairs across the three runs, those answers scored 52% against plain Opus. The losses come from hard writing, translation and maths that went to smaller models.
- **Writing was the weakest task in both sets (26% against Opus, 31% against Sonnet).** Code (40%), translation (42%) and maths (44%) were also below Opus.
- **The cause is the quality priors.** Nivana's quality scores come from pairwise evals against Sonnet on an easier prompt suite. Those scores put Claude Haiku, GPT-6 Luna and DeepSeek Flash within a few points of the top models, and these benchmarks don't bear that out. Haiku answered 51 of the 96 prompts.
- **Same model, routed or direct:** when Nivana picked Opus or Sonnet, its answer against that same model called directly scored 0.52 for Opus and 0.41 for Sonnet (36 pairs across the three runs). Nivana's system prompt may cost a little on Sonnet, but 36 pairs is too few to tell.

### An experiment that didn't help

After set 1, two router changes were tried: a quality floor on writing at every difficulty (so Haiku and Luna no longer answer writing), and stricter difficulty guidance for the classifier. On set 2 the changed router scored the same against Opus (38%, against 38% for the current router). Writing moved from 28% to 31%, which is inside the noise, and the cost rose. The changes were not shipped. Results: [`results/2026-11-03-v2/writing-floor-experiment`](results/2026-11-03-v2/writing-floor-experiment/report.md). It used the same baseline answers as the current-router run.

### A bug the benchmark found

Non-streamed `/v1/chat` requests gave the model 180 seconds. A hard code request answered by Opus at high effort ran past that and returned an error (one prompt in set 2 and one in set 1, whose retry succeeded). The limit is now 280 seconds, inside the function's 300.

Per-prompt rows are in each run's `rows.jsonl`. Every answer is in `answers/`, and every verdict with the judge's reason is in `verdicts/`. The calls behind all three runs cost about $10.

## Method

1. **Prompts.** [`prompts.json`](prompts.json) and [`prompts-v2.json`](prompts-v2.json) each have 48 prompts across 8 tasks (quick answers, writing, code, reasoning, maths, structured data, long documents and translation), with 2 easy, 2 medium and 2 hard per task. Those levels are the authors' labels; Nivana's router decides difficulty for itself. None of them appears in the suite that sets the router's quality scores (`server/evals.js` in Nivana), so the router was not tuned on them.
2. **Nivana answers.** Nobody tells it which model to use. Through the public API this is `POST /v1/chat` with the prompt as a single user message. Nivana's published run used `--local`, which imports the production router (`server/router.js` at the deployed commit) and runs the same classify → rank → answer path as `/v1/chat`, with the live catalogue, prices, health and quality priors.
3. **Baselines answer.** Each baseline model gets the same prompt through the Vercel AI Gateway, with no system prompt, no reasoning setting and up to 8,000 output tokens. The gateway reports the exact cost of each call.
4. **Judges compare.** Each judge sees the request, a task rubric and the two answers, and picks A, B or a tie. Each pair is judged in both orders, so position bias cancels: 3 judges × 2 orders gives 6 verdicts per comparison. A win scores 1, a tie 0.5 and a loss 0. A prompt counts as a win, tie or loss when its mean verdict is above, at or below 0.5.
5. **Judge bias.** Judges favour their own lab's models. The second score therefore drops every verdict from a judge whose lab made either answer. In these runs that changed nothing by more than about a point. The baselines are both Anthropic models, so no judge is from Anthropic.
6. **Uncertainty.** Each 95% interval is a seeded bootstrap over prompts, so re-running the summary on the same answers reproduces it exactly.

**Limits.** 96 prompts is a modest sample: per-task numbers rest on 12 prompts each, and the two sets differed by 11 points against Opus, so treat per-set and per-task figures as noisy. Model judges are not human raters. Nivana's answers carry its own system prompt and the baselines' don't, because a caller who calls a model directly doesn't get one. Prices and the router change over time, so every run is dated.

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
