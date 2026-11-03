#!/usr/bin/env node
/*
 * Routing benchmark: is Nivana's automatic routing as good as always calling one strong model,
 * and what does it cost by comparison?
 *
 * For every held-out prompt in prompts.json:
 *   1. Nivana answers it (it picks the model; nobody tells it which).
 *   2. Each baseline model answers it directly through the Vercel AI Gateway.
 *   3. Three judges from labs other than the baselines' compare Nivana's answer with each baseline's,
 *      each in both orders (A/B then B/A), so position bias cancels. Nivana scores 1 for a win, 0.5
 *      for a tie, 0 for a loss, averaged over the verdicts. Judges favour their own lab's models, so
 *      a second score drops every verdict from a judge whose lab made either answer.
 *   4. Cost: what the caller paid Nivana (credits × $0.001) against the gateway's exact cost of the
 *      baseline call at list price.
 *
 * Usage (Node 22+):
 *   npm install
 *   NIVANA_API_KEY=nvn_sk_… AI_GATEWAY_API_KEY=… node run.mjs                 # the public API, as any caller sees it
 *   node run.mjs --prompts prompts-v2.json                                    # the second held-out set
 *   node run.mjs --limit 4 --dry                                              # plan only
 *   node run.mjs --baseline anthropic/claude-opus-5.5 --judge openai/gpt-6.1-sol --judge google/gemini-4-argon
 *   node --env-file=…/.env node run.mjs --local ../../nivana-ai               # Nivana's own run: the production router in-process
 *
 * Answers and verdicts are cached under the output directory, so an interrupted run resumes and a
 * re-run only pays for what is missing. Writes rows.jsonl (one line per prompt), summary.json and
 * report.md.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { generateText, jsonSchema, Output } from 'ai'

globalThis.AI_SDK_LOG_WARNINGS = false

const here = path.dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const all = (flag) => argv.flatMap((a, i) => (a === flag ? [argv[i + 1]] : []))
const one = (flag, d) => all(flag)[0] ?? d
const has = (flag) => argv.includes(flag)

const BASELINES = all('--baseline').length ? all('--baseline') : ['anthropic/claude-opus-5.5', 'anthropic/claude-sonnet-5.5']
const JUDGES = all('--judge').length ? all('--judge') : ['openai/gpt-6.1-sol', 'google/gemini-4-argon', 'moonshotai/kimi-k3.1-pro']
const NIVANA_URL = one('--nivana-url', 'https://nivana.one')
const LOCAL = one('--local', null)
const BUDGET = Number(one('--budget', 25))
const CONCURRENCY = Number(one('--concurrency', 4))
const LIMIT = Number(one('--limit', Infinity))
const OUT = path.resolve(one('--out', path.join(here, 'results', new Date().toISOString().slice(0, 10))))
const ANSWER_MAX_TOKENS = 8000
const CREDIT_USD = 0.001

/* ─── prompts ─── */

const PROMPTS = path.resolve(here, one('--prompts', 'prompts.json'))
const suite = JSON.parse(fs.readFileSync(PROMPTS, 'utf8'))
const expand = (s) => s.replace(/\{\{repeat (\d+)\}\}([\s\S]*?)\{\{\/repeat\}\}/g, (_, n, body) => Array.from({ length: Number(n) }, (_, i) => body.replaceAll('{i}', String(i + 1))).join(''))
const prompts = suite.prompts.slice(0, LIMIT).map((p) => ({ ...p, text: expand(p.prompt) }))

const sum = (xs) => xs.reduce((s, x) => s + x, 0)

/* ─── cache ─── */

const file = (...parts) => path.join(OUT, ...parts)
const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null)
const write = (f, v) => {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, JSON.stringify(v, null, 1))
}
async function cached(f, work) {
  const hit = read(f)
  if (hit) return { ...hit, fresh: false }
  const v = await work()
  write(f, v)
  return { ...v, fresh: true }
}

/* ─── spend ─── */

/** Spent in this run (what the budget caps) and the cost of every call behind the results, cached or not */
let spent = 0
let total = 0
const gatewayCost = (r) => {
  const c = Number(r?.providerMetadata?.gateway?.cost)
  return Number.isFinite(c) ? c : 0
}

/* ─── Nivana's answer ─── */

/** Through the public API: exactly what a paying caller gets and pays */
async function viaApi(p) {
  const key = process.env.NIVANA_API_KEY
  if (!key) throw new Error('Set NIVANA_API_KEY (create one at https://nivana.one/chat → Settings → API keys), or pass --local.')
  const started = Date.now()
  const res = await fetch(`${NIVANA_URL}/v1/chat`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: p.text }] }),
    signal: AbortSignal.timeout(300_000),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`Nivana ${res.status}: ${body?.error?.message ?? 'no body'}`)
  const priceUsd = (body.credits ?? 0) * CREDIT_USD
  return { text: body.message?.content ?? '', model: body.routed_to, route: body.route ?? null, priceUsd, modelCostUsd: null, ms: Date.now() - started }
}

/** In-process, with the production router's own code (Nivana's run; same classify → rank → answer path as /v1/chat) */
let localRouter
async function viaLocal(p) {
  localRouter ??= await (async () => {
    const src = path.resolve(LOCAL)
    const router = await import(pathToFileURL(path.join(src, 'server/router.js')).href)
    const billing = await import(pathToFileURL(path.join(src, 'server/billing.js')).href)
    return { ...router, creditsFor: billing.creditsFor }
  })()
  const { classify, textProfile, routeAndAnswer, creditsFor } = localRouter
  const messages = [{ role: 'user', content: p.text }]
  const started = Date.now()
  const profile = await textProfile(messages, await classify(messages))
  const r = await routeAndAnswer(messages, { profile })
  return {
    text: r.text ?? '',
    model: r.model,
    route: { task: profile.task, difficulty: profile.difficulty, effort: r.ranked?.[0]?.effort ?? null },
    priceUsd: creditsFor(r.cost) * CREDIT_USD,
    modelCostUsd: r.cost,
    ms: Date.now() - started,
  }
}

const nivana = (p) => cached(file('answers', 'nivana', `${p.id}.json`), () => (LOCAL ? viaLocal(p) : viaApi(p)))

/* ─── baseline answers ─── */

const baseline = (model, p) =>
  cached(file('answers', model.replace('/', '__'), `${p.id}.json`), async () => {
    const started = Date.now()
    const r = await generateText({ model, prompt: p.text, maxOutputTokens: ANSWER_MAX_TOKENS, maxRetries: 2, abortSignal: AbortSignal.timeout(300_000) })
    return { text: r.text ?? '', model, priceUsd: gatewayCost(r), ms: Date.now() - started }
  })

/* ─── judging ─── */

const verdictSchema = jsonSchema({
  type: 'object',
  additionalProperties: false,
  properties: { winner: { type: 'string', enum: ['A', 'B', 'tie'] }, reason: { type: 'string' } },
  required: ['winner', 'reason'],
})

const judgeOnce = (judge, p, a, b, tag) =>
  cached(file('verdicts', judge.replace('/', '__'), `${p.id}--${tag}.json`), async () => {
    const r = await generateText({
      model: judge,
      reasoning: 'low',
      instructions: `You compare two AI answers to the same request and pick the better one. Rubric for this kind of task: ${suite.rubrics[p.task]}
Judge only on quality for the user. Ignore length unless the request set one. Ignore which answer came first. Say "tie" only when they are genuinely equivalent.`,
      prompt: `REQUEST:\n${p.text.slice(0, 8000)}\n\n=== ANSWER A ===\n${a.slice(0, 8000)}\n\n=== ANSWER B ===\n${b.slice(0, 8000)}`,
      output: Output.object({ schema: verdictSchema }),
      maxOutputTokens: 2000,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(180_000),
    })
    return { winner: r.output?.winner ?? 'tie', reason: r.output?.reason ?? '', priceUsd: gatewayCost(r) }
  })

/** Nivana against one baseline on one prompt: every judge, both orders */
async function versus(p, mine, theirs, base) {
  if (!mine.text.trim()) return { score: 0, verdicts: [], note: 'Nivana returned an empty answer' }
  if (!theirs.text.trim()) return { score: 1, verdicts: [], note: 'baseline returned an empty answer' }
  const tag = base.replace('/', '__')
  const verdicts = await Promise.all(
    JUDGES.flatMap((judge) => [
      judgeOnce(judge, p, mine.text, theirs.text, `${tag}--nivana-first`).then((v) => ({ judge, ...v, nivanaIs: 'A' })),
      judgeOnce(judge, p, theirs.text, mine.text, `${tag}--baseline-first`).then((v) => ({ judge, ...v, nivanaIs: 'B' })),
    ]),
  )
  for (const v of verdicts) {
    total += v.priceUsd
    if (v.fresh) spent += v.priceUsd
  }
  const points = verdicts.map((v) => (v.winner === 'tie' ? 0.5 : v.winner === v.nivanaIs ? 1 : 0))
  return { score: points.reduce((s, x) => s + x, 0) / points.length, verdicts: verdicts.map(({ judge, winner, nivanaIs, reason }) => ({ judge, nivana_is: nivanaIs, winner, reason })) }
}

/* ─── run ─── */

const calls = prompts.length * (1 + BASELINES.length + BASELINES.length * JUDGES.length * 2)
console.log(`${prompts.length} prompts × (Nivana + ${BASELINES.length} baselines + ${BASELINES.length} × ${JUDGES.length} judges × 2 orders) = ${calls} calls, minus cached. Budget $${BUDGET}.`)
console.log(`Prompts: ${path.relative(here, PROMPTS)}`)
console.log(`Nivana: ${LOCAL ? `in-process router from ${path.resolve(LOCAL)}` : `${NIVANA_URL}/v1/chat`}\nBaselines: ${BASELINES.join(', ')}\nJudges: ${JUDGES.join(', ')}\nOutput: ${OUT}`)
if (has('--dry')) process.exit(0)

const rows = []
const queue = [...prompts]
let stopped = false
async function worker() {
  while (queue.length) {
    if (spent >= BUDGET) {
      stopped = true
      return
    }
    const p = queue.shift()
    try {
      const [mine, ...theirs] = await Promise.all([nivana(p), ...BASELINES.map((b) => baseline(b, p))])
      const mineUsd = LOCAL ? (mine.modelCostUsd ?? 0) : mine.priceUsd
      total += mineUsd + sum(theirs.map((t) => t.priceUsd))
      if (mine.fresh) spent += mineUsd
      for (const t of theirs) if (t.fresh) spent += t.priceUsd
      const against = {}
      for (const [i, base] of BASELINES.entries()) {
        const v = await versus(p, mine, theirs[i], base)
        against[base] = { score: v.score, price_usd: theirs[i].priceUsd, ms: theirs[i].ms, verdicts: v.verdicts, ...(v.note ? { note: v.note } : {}) }
      }
      const row = { id: p.id, task: p.task, level: p.level, routed_to: mine.model, route: mine.route, nivana_price_usd: mine.priceUsd, nivana_model_cost_usd: mine.modelCostUsd, nivana_ms: mine.ms, against }
      rows.push(row)
      console.log(`${p.id.padEnd(18)} → ${String(mine.model).padEnd(34)} ${BASELINES.map((b) => `${b.split('/')[1]} ${against[b].score.toFixed(2)}`).join('  ')}  $${spent.toFixed(2)}`)
    } catch (err) {
      console.log(`${p.id.padEnd(18)} ERROR ${String(err?.message ?? err).slice(0, 200)}`)
      rows.push({ id: p.id, task: p.task, level: p.level, error: String(err?.message ?? err).slice(0, 500) })
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

/* ─── summary ─── */

const order = new Map(prompts.map((p, i) => [p.id, i]))
rows.sort((a, b) => order.get(a.id) - order.get(b.id))
const ok = rows.filter((r) => !r.error)
const mean = (xs) => (xs.length ? sum(xs) / xs.length : null)
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null
}
/** 95% bootstrap interval of the mean, seeded so the published numbers reproduce */
function bootstrap(xs, n = 5000) {
  if (!xs.length) return [null, null]
  let seed = 42
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)
  const means = Array.from({ length: n }, () => mean(Array.from(xs, () => xs[Math.floor(rand() * xs.length)]))).sort((a, b) => a - b)
  return [means[Math.floor(n * 0.025)], means[Math.floor(n * 0.975)]]
}
const lab = (id) => String(id).split('/')[0]
const point = (v) => (v.winner === 'tie' ? 0.5 : v.winner === v.nivana_is ? 1 : 0)
/** The prompt's score from judges with no stake: neither answer came from the judge's own lab */
const neutral = (r, b) => mean(r.against[b].verdicts.filter((v) => lab(v.judge) !== lab(r.routed_to) && lab(v.judge) !== lab(b)).map(point))
const outcome = (s) => (s > 0.5 ? 'win' : s < 0.5 ? 'loss' : 'tie')

const groupBy = (xs, key) => Object.groupBy(xs, key)
const vs = Object.fromEntries(
  BASELINES.map((b) => {
    const scores = ok.map((r) => r.against[b].score)
    const counts = { win: 0, tie: 0, loss: 0 }
    for (const s of scores) counts[outcome(s)]++
    const nivanaUsd = sum(ok.map((r) => r.nivana_price_usd))
    const baseUsd = sum(ok.map((r) => r.against[b].price_usd))
    const by = (key) => Object.fromEntries(Object.entries(groupBy(ok, (r) => r[key])).map(([k, rs]) => [k, { n: rs.length, score: mean(rs.map((r) => r.against[b].score)), nivana_usd: sum(rs.map((r) => r.nivana_price_usd)), baseline_usd: sum(rs.map((r) => r.against[b].price_usd)) }]))
    const perJudge = Object.fromEntries(JUDGES.map((j) => [j, mean(ok.flatMap((r) => r.against[b].verdicts.filter((v) => v.judge === j).map(point)))]))
    const neutralScores = ok.map((r) => neutral(r, b)).filter((x) => x != null)
    return [
      b,
      {
        prompts: ok.length,
        score: mean(scores),
        score_ci95: bootstrap(scores),
        neutral_score: mean(neutralScores),
        neutral_score_ci95: bootstrap(neutralScores),
        outcomes: counts,
        nivana_usd: nivanaUsd,
        baseline_usd: baseUsd,
        cost_ratio: baseUsd ? nivanaUsd / baseUsd : null,
        // Local runs only: the routed model's own cost, before Nivana's margin and rounding
        nivana_model_cost_usd: LOCAL ? sum(ok.map((r) => r.nivana_model_cost_usd ?? 0)) : null,
        model_cost_ratio: LOCAL && baseUsd ? sum(ok.map((r) => r.nivana_model_cost_usd ?? 0)) / baseUsd : null,
        nivana_median_ms: median(ok.map((r) => r.nivana_ms)),
        baseline_median_ms: median(ok.map((r) => r.against[b].ms)),
        by_task: by('task'),
        by_level: by('level'),
        by_judge: perJudge,
      },
    ]
  }),
)
const routedTo = Object.fromEntries(Object.entries(groupBy(ok, (r) => r.routed_to)).map(([m, rs]) => [m, rs.length]).sort((a, b) => b[1] - a[1]))
const summary = {
  run_at: new Date().toISOString(),
  prompt_set: path.relative(here, PROMPTS),
  mode: LOCAL ? 'local (production router code, in-process)' : `api (${NIVANA_URL}/v1/chat)`,
  baselines: BASELINES,
  judges: JUDGES,
  prompts: prompts.length,
  answered: ok.length,
  errors: rows.filter((r) => r.error).map((r) => ({ id: r.id, error: r.error })),
  stopped_at_budget: stopped,
  benchmark_cost_usd: total,
  spent_this_run_usd: spent,
  routed_to: routedTo,
  versus: vs,
}

const pct = (x) => (x == null ? '–' : `${(x * 100).toFixed(0)}%`)
const usd = (x) => `$${x.toFixed(x < 1 ? 4 : 2)}`
const name = (id) => id.split('/')[1]
let md = `# Nivana routing benchmark, ${summary.run_at.slice(0, 10)}\n\n`
md += `${summary.answered}/${summary.prompts} held-out prompts from ${summary.prompt_set} answered (${summary.mode}). Judges: ${JUDGES.map(name).join(', ')}, each in both orders. Calls behind these results cost ${usd(total)}.\n\n`
md += `Score = how often the judges preferred Nivana's answer (50% = as good as the baseline). Cost = what the caller pays Nivana (model cost plus Nivana's margin) against the baseline's list price.${LOCAL ? ` "Model only" is the routed model's own cost before Nivana's margin: the effect of routing alone.` : ''}\n\n`
md += `| Against | Score (95% CI) | Same-lab judges excluded | Nivana wins / ties / losses | Nivana cost | Baseline cost | Nivana ÷ baseline |${LOCAL ? ' Model only ÷ baseline |' : ''} Median latency, Nivana / baseline |\n|---|---|---|---|---|---|---|---|${LOCAL ? '---|' : ''}\n`
for (const [b, v] of Object.entries(vs)) md += `| ${name(b)} | ${pct(v.score)} (${pct(v.score_ci95[0])}–${pct(v.score_ci95[1])}) | ${pct(v.neutral_score)} (${pct(v.neutral_score_ci95[0])}–${pct(v.neutral_score_ci95[1])}) | ${v.outcomes.win} / ${v.outcomes.tie} / ${v.outcomes.loss} | ${usd(v.nivana_usd)} | ${usd(v.baseline_usd)} | ${pct(v.cost_ratio)} |${LOCAL ? ` ${pct(v.model_cost_ratio)} |` : ''} ${(v.nivana_median_ms / 1000).toFixed(1)} s / ${(v.baseline_median_ms / 1000).toFixed(1)} s |\n`
for (const [b, v] of Object.entries(vs)) {
  md += `\n## Against ${name(b)}\n\n| Task | n | Score | Nivana cost | ${name(b)} cost |\n|---|---|---|---|---|\n`
  for (const [k, g] of Object.entries(v.by_task)) md += `| ${k} | ${g.n} | ${pct(g.score)} | ${usd(g.nivana_usd)} | ${usd(g.baseline_usd)} |\n`
  md += `\n| Prompt level | n | Score | Nivana cost | ${name(b)} cost |\n|---|---|---|---|---|\n`
  for (const [k, g] of Object.entries(v.by_level)) md += `| ${k} | ${g.n} | ${pct(g.score)} | ${usd(g.nivana_usd)} | ${usd(g.baseline_usd)} |\n`
  md += `\nBy judge: ${Object.entries(v.by_judge).map(([j, s]) => `${name(j)} ${pct(s)}`).join(', ')}.\n`
}
md += `\n## Where Nivana sent the prompts\n\n| Model | Prompts |\n|---|---|\n${Object.entries(routedTo).map(([m, n]) => `| ${m} | ${n} |`).join('\n')}\n`
if (summary.errors.length) md += `\n## Errors\n\n${summary.errors.map((e) => `- ${e.id}: ${e.error}`).join('\n')}\n`
md += `\nEvery prompt, answer, verdict and reason: rows.jsonl and answers/, verdicts/ in this folder.\n`

write(file('summary.json'), summary)
fs.writeFileSync(file('rows.jsonl'), rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
fs.writeFileSync(file('report.md'), md)
console.log(`\n${md}\nWrote ${OUT}`)
