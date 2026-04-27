# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `bun dev` — Next.js dev server (Turbopack is the default; no `--turbopack` flag needed).
- `bun run build` — production build. Run this before pushing — it surfaces async-API misuse and Server Component boundary violations that the dev server is more forgiving about.
- `bun run start` — serve a built app.
- `bun run lint` — ESLint flat config (`next/core-web-vitals` + `next/typescript`). `next lint` was removed in v16.
- `bun install` — install/restore the lockfile.

No test runner is configured and there is no `typecheck` script — TypeScript is checked during `next build`. While editing, rely on LSP diagnostics rather than re-running the build.

## Architecture

Two surfaces share one Sentry instrumentation seam.

**Demo flow** — `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard`. Polished e-commerce pages that produce realistic traces, replays, and Server Action mutations. Server Components by default; client components only where interactivity demands it (`buy-button.tsx`, `cart-form.tsx`, `signin/page.tsx`).

**Labs** — `/labs/{errors,tracing,logs,seer,feedback}`. Deliberate failure surfaces, one per Sentry feature. Each page is a list of `LabSpecimen` tiles whose trigger buttons fire a targeted error / span / log. `/labs/seer` intentionally uses a deep, semantically named Server Action chain (`parseOrder → validateLineItem → priceOf → applyDiscount`) so Seer's analysis has signal to chew on — preserve those names.

**State** lives in `lib/store.ts`, which starts with `import "server-only"`. Products, cart, and counters are module-level mutable state — fine for a sandbox, but it resets on dev reload and is not shared across processes. Never import this from a client component; mutate through Server Actions and `revalidatePath`.

**Cross-process tracing** uses the helpers in `lib/origin.ts`. Server-to-server `fetch`es (`cart/actions.ts → /api/checkout → /api/payment`, recursive `/api/echo`) must build their URL via `originFromRequest(request)` or `originFromHeaders()` so the call remains a single distributed trace.

### Sentry seam

| File | Role |
|---|---|
| `instrumentation.ts` | Loads `sentry.server.config` or `sentry.edge.config` based on `NEXT_RUNTIME`; re-exports `Sentry.captureRequestError` as `onRequestError`. |
| `instrumentation-client.ts` | Browser SDK init: replay integration + `captureRouterTransitionStart`. |
| `sentry.server.config.ts` / `sentry.edge.config.ts` | Server / edge DSN + init. The test lab samples 100% of traces by design — don't lower it. |
| `next.config.ts` | Wraps the Next config in `withSentryConfig` (org `saad-test-org`, project `saad-app-nextjs`, tunnel route `/monitoring`). |
| `app/global-error.tsx` | Calls `Sentry.captureException` for root-layout failures. |

When adding a new Sentry feature, wire it through one of these files rather than spinning up a new init path.

### Next.js 16 traps that already bit this repo

- `error.tsx` / `global-error.tsx` props are `{ error, unstable_retry }` — **not** `reset`. The existing boundaries already use the new shape; don't regress them.
- Middleware lives at `proxy.ts` (root) with `export function proxy(...)`. Node runtime only — no `runtime: 'edge'`.
- Dynamic routes are async: `params: Promise<{ id: string }>`, then `await params`. Same for `searchParams`, `cookies()`, `headers()`.
- `cart/actions.ts:checkout` calls `redirect()` after the work, and `redirect()` throws by design — never wrap it in a `try/catch` that swallows the redirect.

### Implementation plan

`docs/sentry-test-lab.md` is the canonical spec — design tokens, Sentry-feature-to-surface mapping, page-by-page design notes, and a verification checklist. Read the relevant section before redesigning a page or adding a new lab.
