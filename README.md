# Sentry test lab

A Next.js 16 sandbox built to exercise every Sentry feature — errors, tracing, logs, replays, Seer, feedback.

## What this is

A lab-notebook-styled e-commerce demo with two surfaces sharing one Sentry instrumentation seam. The **demo flow** (`/products`, `/cart`, `/signin`, `/dashboard`) is a polished shopping experience that produces realistic traces, replays, and Server Action mutations. The **labs** (`/labs/*`) are deliberate failure surfaces — one page per Sentry feature, each with trigger buttons that fire a targeted error, span, or log.

State lives in `lib/store.ts` as in-memory module-level globals. It resets on dev reload and is not shared across processes — fine for a sandbox, not production.

## Run it locally

```bash
bun install
bun dev          # http://localhost:3000
```

Run `bun run build` before pushing. The production build surfaces async-API misuse and Server Component boundary violations that the dev server forgives.

## Surfaces

| Route | What it exercises |
|---|---|
| `/`, `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard` | Replays, request traces, Server Action mutations |
| `/labs/errors` | Error capture (chained validation/discount throws) |
| `/labs/tracing` | Custom spans + distributed tracing via recursive `/api/echo` |
| `/labs/logs` | Structured logs |
| `/labs/seer` | Deep, semantically-named error chains for Seer analysis |
| `/labs/feedback` | User feedback widget |

## API endpoints

- `GET /api/products` — product list (`?fail=1` forces a 500)
- `POST /api/checkout` — chains to `/api/payment`, returns `orderId`
- `POST /api/payment` — 70% success / 15% declined / 15% gateway timeout
- `POST /api/echo` — recursive 1–8 hop fan-out for distributed-trace demos
- `POST /api/log` — emits structured info/warn/error logs
- `GET /api/slow?ms=N` — sleeps `N` ms (0–5000) for performance demos

## Sentry setup

DSN is wired directly into `sentry.server.config.ts`, `sentry.edge.config.ts`, and `instrumentation-client.ts`. The build plugin in `next.config.ts` points at org `saad-test-org`, project `saad-app-nextjs`, with browser requests tunnelled through `/monitoring` to bypass ad-blockers.

- All three runtimes (server, edge, client) sample 100% of traces by design — don't lower it.
- `enableLogs: true` and `sendDefaultPii: true` everywhere.
- Replay session and error sample rates are both 100%.
- Source-map upload reads `SENTRY_AUTH_TOKEN` from `.env.sentry-build-plugin`.

## Stack

Next.js 16 (App Router only), React 19, Tailwind 4, TypeScript strict, Bun. ESLint flat config (`next/core-web-vitals` + `next/typescript`). No test runner; no separate `typecheck` script — TypeScript is checked during `next build`.

## Where to look next

- `CLAUDE.md` / `AGENTS.md` — agent-facing rules and Next.js 16 traps that have already bit this repo.
- `docs/sentry-test-lab.md` — canonical design spec, Sentry-feature-to-surface mapping, verification checklist.
- `lib/store.ts` — server-only in-memory state.
- `lib/origin.ts` — cross-process URL helpers used by the distributed-trace demos.
- `proxy.ts` — root middleware (Node runtime).
