# Sentry onboarding lab

A Next.js 16 sandbox you instrument with Sentry from scratch as part of
your onboarding. The app already runs end-to-end — your job is to add
`@sentry/nextjs`, wire each lab page, and verify events reach your
Sentry project.

## What this is

A lab-notebook-styled e-commerce demo with two surfaces sharing **one
Sentry seam that you will build**. The **demo flow**
(`/products`, `/cart`, `/signin`, `/dashboard`) is a polished shopping
experience that, once instrumented, produces realistic traces, replays,
and Server Action mutations. The **labs** (`/labs/*`) are deliberate
failure surfaces — one page per Sentry feature, each with trigger
buttons that fire a targeted error, span, or log.

State lives in `lib/store.ts` as in-memory module-level globals. It
resets on dev reload and is not shared across processes — fine for a
sandbox, not production.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Run `npm run build` before pushing. The production build surfaces
async-API misuse and Server Component boundary violations that the dev
server forgives.

## Surfaces

| Route | What it exercises (once you've wired Sentry) |
|---|---|
| `/`, `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard` | Replays, request traces, Server Action mutations |
| `/labs/errors` | Error capture (chained validation/discount throws) |
| `/labs/tracing` | Custom spans + distributed tracing via recursive `/api/echo` |
| `/labs/logs` | Structured logs |
| `/labs/seer` | Deep, semantically-named error chains for Seer analysis |
| `/labs/feedback` | User feedback widget |
| `/labs/metrics` | Counters, gauges, distributions |

## API endpoints

- `GET /api/products` — product list (`?fail=1` forces a 500)
- `POST /api/checkout` — chains to `/api/payment`, returns `orderId`
- `POST /api/payment` — 70% success / 15% declined / 15% gateway timeout
- `POST /api/echo` — recursive 1–8 hop fan-out for distributed-trace demos
- `POST /api/log` — emits structured info/warn/error logs
- `GET /api/slow?ms=N` — sleeps `N` ms (0–5000) for performance demos

## Where to start

1. Read **`docs/lab-handout.md`** — your trainee handout, end-to-end.
2. Skim **`CLAUDE.md`** / **`AGENTS.md`** — agent-facing rules and
   Next.js 16 traps that have already bit this repo.
3. Run `rg -n "TODO" .` — every place the SDK plugs in is marked.
4. Run `npx @sentry/wizard@latest -i nextjs` once you're ready.

## Stack

Next.js 16 (App Router only), React 19, Tailwind 4, TypeScript strict,
npm. ESLint flat config (`next/core-web-vitals` + `next/typescript`).
No test runner; no separate `typecheck` script — TypeScript is checked
during `next build`.
