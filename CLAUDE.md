# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — Next.js dev server (Turbopack is the default; no `--turbopack` flag needed).
- `npm run build` — production build. Run this before pushing — it surfaces async-API misuse and Server Component boundary violations that the dev server is more forgiving about.
- `npm start` — serve a built app.
- `npm run lint` — ESLint flat config (`next/core-web-vitals` + `next/typescript`). `next lint` was removed in v16.
- `npm install` — install/restore the lockfile.

No test runner is configured and there is no `typecheck` script — TypeScript is checked during `next build`. While editing, rely on LSP diagnostics rather than re-running the build.

## Architecture

This repo is a **trainee-ready blank slate** for the Sentry onboarding lab. The Sentry SDK is intentionally **not installed**; trainees run `npx @sentry/wizard@latest -i nextjs` and fill in the TODO markers. Do not re-add `@sentry/nextjs` or any `sentry.*.config.ts` file in maintenance work — those belong to the trainee step.

**Demo flow** — `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard`. Polished e-commerce pages that produce realistic traces, replays, and Server Action mutations once the trainee wires Sentry. Server Components by default; client components only where interactivity demands it (`buy-button.tsx`, `cart-form.tsx`, `signin/page.tsx`).

**Labs** — `/labs/{errors,tracing,logs,seer,feedback,metrics}`. Deliberate failure surfaces, one per Sentry feature. Each page is a list of `LabSpecimen` tiles whose trigger buttons fire a targeted error / span / log. `/labs/seer` intentionally uses a deep, semantically named Server Action chain (`parseOrder → validateLineItem → priceOf → applyDiscount`) so Seer's analysis has signal to chew on — preserve those names.

**State** lives in `lib/store.ts`, which starts with `import "server-only"`. Products, cart, and counters are module-level mutable state — fine for a sandbox, but it resets on dev reload and is not shared across processes. Never import this from a client component; mutate through Server Actions and `revalidatePath`.

**Cross-process tracing** uses the helpers in `lib/origin.ts`. Server-to-server `fetch`es (`cart/actions.ts → /api/checkout → /api/payment`, recursive `/api/echo`) must build their URL via `originFromRequest(request)` or `originFromHeaders()` so the call remains a single distributed trace.

### TODO seam (where the trainee plugs Sentry in)

| File | What the trainee fills in |
|---|---|
| `instrumentation.ts` | `register()` body that imports `sentry.server.config` / `sentry.edge.config` per runtime; `onRequestError = Sentry.captureRequestError` re-export. |
| `app/global-error.tsx` | `useEffect(() => Sentry.captureException(error), [error])` for root-layout failures. |
| `next.config.ts` | Wrap the export in `withSentryConfig(nextConfig, { org, project, tunnelRoute, ... })`. |
| `lib/metrics.ts` (`withLabMetric`) | `Sentry.metrics.count("lab_trigger", ...)` at the top + `await Sentry.flush(2000)` in `finally`. |
| `app/components/lab-trigger.tsx` (`handleClick`) | Per-click client `Sentry.metrics.count("lab_trigger", ..., { runtime: "client" })`. |
| `app/labs/metrics/{page,actions}.ts` | `Sentry.metrics.{count,gauge,distribution}(...)` calls per specimen. |
| `app/labs/seer/actions.ts` | `Sentry.captureException(e)` inside the catch. |
| `app/labs/logs/{page,actions}.ts` | Replace `console.{info,warn,error}` with `Sentry.logger.{info,warn,error}(...)`. |
| `app/labs/tracing/page.tsx` (SPC-TRC-04) | Wrap the multi-step async chain in `Sentry.startSpan(...)`. |

Each row corresponds to a `// TODO: ...` comment already in the source. Run `rg -n "TODO" .` to find them.

### Next.js 16 traps that already bit this repo

- `error.tsx` / `global-error.tsx` props are `{ error, unstable_retry }` — **not** `reset`. The existing boundaries already use the new shape; don't regress them.
- Middleware lives at `proxy.ts` (root) with `export function proxy(...)`. Node runtime only — no `runtime: 'edge'`.
- Dynamic routes are async: `params: Promise<{ id: string }>`, then `await params`. Same for `searchParams`, `cookies()`, `headers()`.
- `cart/actions.ts:checkout` calls `redirect()` after the work, and `redirect()` throws by design — never wrap it in a `try/catch` that swallows the redirect.

### Trainee handout

`docs/lab-handout.md` is the canonical handout — goal, setup, surface-to-feature map, per-lab walkthrough, and verification checklist. Read the relevant section before redesigning a page or adding a new lab.
