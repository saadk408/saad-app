# Sentry Onboarding Lab — Trainee Handout

Welcome to Sentry. This sandbox is your hands-on lab for installing the
Sentry SDK in a real Next.js 16 application. The app already runs — you
will instrument it.

When you finish, every lab page emits the matching Sentry feature, the
demo e-commerce flow generates realistic traces and replays, and your
production build uploads source maps to your Sentry org.

---

## 1. Goal

Light up every Sentry feature against an existing Next.js 16 + React 19 +
Tailwind 4 app. The repo gives you the failure surfaces (deliberate
throws, deep call chains, slow fetches, structured logs) and the
e-commerce flow (products, cart, checkout, sign-in, dashboard). Your job
is to install the SDK, wire each feature, and verify events land in
Sentry.

By the end you will have used:

- **Error monitoring** (client + server)
- **Performance / tracing** (auto + custom spans + distributed)
- **Session Replay**
- **Logs**
- **Custom metrics**
- **User Feedback widget**
- **Seer** (AI debugging) against a connected GitHub repo
- **Source-map upload** during production build

---

## 2. Setup

```bash
npm install
npm run dev     # http://localhost:3000
```

Verify the app runs end-to-end before touching Sentry: browse `/products`,
add an item, check out at `/cart`, sign in at `/signin`, click around
`/dashboard` and `/labs/*`.

When everything works, run the wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

The wizard will:

1. Install `@sentry/nextjs`.
2. Generate `sentry.client.config.ts`, `sentry.server.config.ts`,
   `sentry.edge.config.ts`. (In Next 16 the client config is renamed to
   `instrumentation-client.ts` — accept whichever the wizard creates.)
3. Wrap `next.config.ts` with `withSentryConfig`.
4. Populate `instrumentation.ts` so the runtime configs load on each
   runtime.
5. Generate `app/global-error.tsx` (overwriting the trainee stub at
   `app/global-error.tsx` — review the diff carefully).
6. Drop a `.env.sentry-build-plugin` with `SENTRY_AUTH_TOKEN` for
   source-map upload.

After the wizard, restart `npm run dev` and confirm `npm run build`
still succeeds. You should see source-map upload log lines in the build
output — that means your auth token works.

---

## 3. Surfaces and what each one teaches

| Route | Sentry feature you'll wire |
|---|---|
| `/`, `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard` | Auto-tracing, replays, server-action mutations |
| `/labs/errors` | Error capture (handler / render / effect / Server Action / route handler / TypeError / `AppError`) |
| `/labs/tracing` | Auto + distributed traces, custom `Sentry.startSpan` |
| `/labs/logs` | Client + server structured `Sentry.logger.*` |
| `/labs/seer` | Deep, named call chain for Seer + GitHub analysis |
| `/labs/feedback` | `Sentry.feedbackIntegration()` widget |
| `/labs/metrics` | `Sentry.metrics.{count,gauge,distribution}` |

Every lab page already renders specimen tiles whose buttons trigger the
underlying behavior (a throw, a fetch chain, a console call, etc.). Your
work is to add the matching Sentry SDK call so the event reaches your
project.

---

## 4. Per-lab walkthrough

### `/labs/errors`

What it does today: each of the seven specimens already throws in the
right place (event handler, render, `useEffect`, Server Action, route
handler, TypeError, custom `AppError` with cause). Specimen 02
(render-phase) is caught by `app/error.tsx`; the rest surface via global
handlers.

What to do:

1. The wizard already covers `Sentry.init()` for client + server + edge,
   so most events should auto-capture once the SDK is installed.
2. Open `app/global-error.tsx`. It currently has a TODO showing where
   `Sentry.captureException(error)` belongs — restore the `useEffect`
   from the comment so root-layout failures still report.
3. Verify each specimen produces a distinct issue in the Sentry UI. If
   plain `Error` events collide, look at Issue Grouping / Fingerprint
   Rules — the SDK's defaults are usually fine here, but custom rules
   are the right next step if you see bleed-through.

Verification: click each TRIGGER, confirm an event lands in Sentry.
Specimens 06 (TypeError) and 07 (`AppError` with `TypeError` cause)
should be **different** issues; if they merge, that's a fingerprint
problem to solve.

### `/labs/tracing`

What it does today: four specimens — sequential 3-hop `/api/echo`,
parallel 5x `/api/slow`, slow Server Action (`actions.ts:slowWork`), and
a multi-step async chain marked `// TODO: wrap in Sentry.startSpan`.

What to do:

1. Auto-tracing should light up specimens 01–03 once `Sentry.init()` is
   running with `tracesSampleRate: 1.0`.
2. For specimen 04 (`SPC-TRC-04`), find the TODO in
   `app/labs/tracing/page.tsx` and wrap the three `await fetch(...)`
   calls in `Sentry.startSpan({ name: "checkoutFlow" }, async () => { ... })`.
   The result tile already says "ready for `Sentry.startSpan`."
3. Confirm `/api/checkout` → `/api/payment` is one continuous trace
   when you check out at `/cart`.

Verification: open the Performance tab in Sentry. The 3-hop chain shows
three nested `/api/echo` spans; the parallel run shows five concurrent
fetches under one transaction; the custom span has the name you chose.

### `/labs/logs`

What it does today: three client-side `console.{info,warn,error}` and a
Server Action that emits the same three levels with structured payloads.

What to do:

1. Set `enableLogs: true` in your Sentry init (all three runtimes — the
   wizard may already do this).
2. Replace the client `console.*` calls and the server Server Action's
   `console.*` calls with `Sentry.logger.{info,warn,error}({ ...fields })`.
   The TODO in `app/labs/logs/actions.ts` marks the spot.

Verification: Logs explorer in Sentry shows your messages with the
structured fields (`route`, `reason`, `orderId`, `userId`, `total`).

### `/labs/seer`

What it does today: a Server Action calls a deep, semantically-named
chain — `parseOrder → validateLineItem → priceOf → applyDiscount` — that
throws `TypeError: Cannot read properties of undefined (reading
'toFixed')`. The page renders the captured stack frames inline with the
function names highlighted.

What to do:

1. Inside the `catch` block in `app/labs/seer/actions.ts` there's a
   TODO for `Sentry.captureException(e)`. Add the call. Without it, the
   Server Action returns its structured payload but no event reaches
   Sentry.
2. Connect your GitHub repo in Sentry → Settings → Integrations →
   GitHub. Seer needs source access to analyze the call chain.

Verification: in the Sentry issue, click "Analyze with Seer." It should
walk the named functions and identify `applyDiscount`'s missing
`undefined` guard.

### `/labs/feedback`

What it does today: a static page with an explanation, an empty
`<div id="feedback-anchor" />`, and a code snippet showing the
`feedbackIntegration` setup.

What to do: in your client init, add `Sentry.feedbackIntegration()` to
the `integrations` array. The widget mounts globally — the
`#feedback-anchor` div is a place to point users, not a mount target.

Verification: a floating feedback button appears in the corner of every
page. Submit a feedback form and confirm it lands in Sentry → User
Feedback.

### `/labs/metrics`

What it does today: five specimens. Each specimen's `onClickAction`
already includes a `// TODO: Sentry.metrics.{count|gauge|distribution}(...)`
line where the call belongs. Specimen 04 also exercises the
`withLabMetric` Server Action wrapper in `lib/metrics.ts`.

What to do:

1. In `app/labs/metrics/page.tsx`, replace each TODO comment with the
   matching `Sentry.metrics.*` call.
2. In `app/labs/metrics/actions.ts`, restore the inner
   `Sentry.metrics.count("metrics_demo_count", 1, { attributes: { runtime: "server" } })`.
3. In `lib/metrics.ts`, restore both TODOs in `withLabMetric` — the
   `Sentry.metrics.count("lab_trigger", ...)` at the start and the
   `await Sentry.flush(2000)` in the `finally` block. The flush is
   critical: serverless Server Actions can terminate before the metric
   buffer auto-flushes.
4. In `app/components/lab-trigger.tsx`, restore the per-click client
   metric inside `handleClick` (the TODO is already there).

Verification: Metrics explorer in Sentry shows `lab_trigger` (with
`lab`, `specimen`, `runtime` attributes) plus the three
`metrics_demo_*` metrics from `/labs/metrics`. Click a few labs and
confirm runtime values stay bounded (`client`, `server`).

---

## 5. Cross-cutting work

These don't live on a single lab page but are part of full coverage:

- **`instrumentation.ts`** — populated by the wizard, but read it. The
  `register()` body conditionally imports the right runtime config; the
  `onRequestError = Sentry.captureRequestError` re-export reports
  Server Component / Route Handler errors.
- **`app/global-error.tsx`** — the wizard regenerates this. If you keep
  your existing styled UI, restore the `useEffect` from the TODO so
  errors capture before the boundary renders.
- **`next.config.ts`** — already has a TODO showing the
  `withSentryConfig(...)` wrapper. The wizard rewrites this; review the
  diff to understand each option (`org`, `project`, `tunnelRoute`,
  `widenClientFileUpload`, `release.setCommits`).
- **Source-map upload** — the build plugin reads `SENTRY_AUTH_TOKEN`
  from `.env.sentry-build-plugin`. The wizard generates that file; do
  not commit it (the `.env*` rule in `.gitignore` already ignores it).
- **`tunnelRoute: "/monitoring"`** — routes Sentry traffic through your
  own domain to bypass ad-blockers. Worth knowing about even if you
  don't enable it locally.
- **Sampling** — all three runtimes use `tracesSampleRate: 1.0` for
  this lab so every transaction is captured. In production you would
  sample lower or use `tracesSampler` for finer control.

---

## 6. Verification checklist

Run through this before declaring done.

1. `npm run lint` passes.
2. `npm run build` passes; build output includes Sentry source-map
   upload log lines.
3. `npm run dev` runs without console errors.
4. Demo flow: products → cart → checkout → success page; sign-in 50/50
   success/fail; dashboard counters move.
5. Sentry → Issues: at least one event per `/labs/errors` specimen;
   `/labs/seer` produces an issue with the deep call chain.
6. Sentry → Performance: `/labs/tracing` specimens 01–03 produce
   visible spans; specimen 04 has a custom span named what you chose.
7. Sentry → Logs: `/labs/logs` emits client + server structured logs
   with the right level.
8. Sentry → Replays: a session replay exists for the demo flow you
   just walked through; password input on `/signin` is masked.
9. Sentry → User Feedback: at least one submission through the floating
   widget.
10. Sentry → Metrics: `lab_trigger` plus the three `metrics_demo_*`
    metrics with the expected attributes.
11. Sentry → Issues → an event from `/labs/seer` → "Analyze with Seer"
    walks the `parseOrder → validateLineItem → priceOf → applyDiscount`
    chain.

---

## 7. App architecture (read this before changing files)

Two surfaces share one Sentry seam (which you build).

**Demo flow** — `/products`, `/products/[id]`, `/cart`, `/signin`,
`/dashboard`. Polished e-commerce pages. Server Components by default;
client components only where interactivity demands it (`buy-button.tsx`,
`cart-form.tsx`, `signin/page.tsx`).

**Labs** — `/labs/{errors,tracing,logs,seer,feedback,metrics}`.
Deliberate failure surfaces, one per Sentry feature. Each page renders
`<LabSpecimen>` tiles whose trigger buttons fire a targeted error /
fetch / log. `/labs/seer` uses a deep, semantically-named Server Action
chain so Seer has signal to chew on — preserve those names.

**State** lives in `lib/store.ts`, which starts with
`import "server-only"`. Products, cart, and counters are module-level
mutable state — fine for a sandbox, but it resets on dev reload and is
not shared across processes. Never import this from a client component;
mutate through Server Actions and `revalidatePath`.

**Cross-process tracing** uses helpers in `lib/origin.ts`.
Server-to-server `fetch`es (`cart/actions.ts → /api/checkout →
/api/payment`, recursive `/api/echo`) build their URL via
`originFromRequest(request)` or `originFromHeaders()` so the call
remains a single distributed trace.

**Custom metrics seam** lives in `lib/metrics.ts` (server) and
`app/components/lab-trigger.tsx` (client). Both have `withLabMetric` /
`handleClick` shells with TODOs marking exactly where the
`Sentry.metrics.count(...)` calls belong.

### Next.js 16 traps that already bit this repo

- `error.tsx` / `global-error.tsx` props are `{ error, unstable_retry }`
  — **not** `reset`. Don't regress this.
- Middleware lives at `proxy.ts` (root) with `export function proxy(...)`.
  Node runtime only — no `runtime: 'edge'`.
- Dynamic routes are async: `params: Promise<{ id: string }>`, then
  `await params`. Same for `searchParams`, `cookies()`, `headers()`.
- `cart/actions.ts:checkout` calls `redirect()` after the work, and
  `redirect()` throws by design — never wrap it in a `try/catch` that
  swallows the redirect.

---

## 8. Where to look when you're stuck

- The TODOs in code are the single source of truth for "what to add and
  where." `rg -n "TODO" .` lists them.
- `CLAUDE.md` and `AGENTS.md` document Next.js 16 conventions and the
  general code-intelligence rules we use in this repo.
- Sentry docs: <https://docs.sentry.io/platforms/javascript/guides/nextjs/>
- Wizard docs: <https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/>
- Seer setup: <https://docs.sentry.io/product/issues/issue-details/ai-suggested-solution/>

---

## Appendix — Implementation plan that produced this lab

The original repo had every Sentry feature wired in. To turn it into a
trainee-ready blank slate the following changes were made (preserved
here so future maintainers know what's intentionally absent):

- **Deleted:** `sentry.server.config.ts`, `sentry.edge.config.ts`,
  `instrumentation-client.ts`, `.env.sentry-build-plugin`,
  `docs/sentry-test-lab.md`, `docs/sentry-metrics.md`,
  `docs/sentry-fingerprint-rules.md`.
- **Stubbed (kept as TODO scaffolding):** `instrumentation.ts`,
  `app/global-error.tsx`, `next.config.ts`, `lib/metrics.ts`,
  `app/components/lab-trigger.tsx`, `app/labs/metrics/page.tsx`,
  `app/labs/metrics/actions.ts`, `app/labs/seer/actions.ts`.
- **Dependency removed:** `@sentry/nextjs` from `package.json` /
  `package-lock.json`.
- **Untouched (Sentry-agnostic):** the e-commerce flow
  (`/products`, `/cart`, `/signin`, `/dashboard`), all `/api/*` routes,
  the design system (`globals.css`, fonts, tokens), `proxy.ts`, the
  in-memory state in `lib/store.ts`, the deep buggy chain in
  `app/labs/seer/actions.ts` (intentional fixture for Seer), and the
  `LabSpecimen` / `PageHeader` / `SpecimenCard` / `SpecimenGlyph`
  components.

Decisions made during the conversion:

1. **Mixed entry-point handling** — the three pure-Sentry config files
   were deleted (the wizard regenerates them). `instrumentation.ts`
   and `app/global-error.tsx` were left as stubs with TODOs because
   they are Next.js 16 conventions trainees would otherwise have to
   discover from scratch.
2. **Metrics seam preserved** — `lib/metrics.ts` (`withLabMetric`) and
   `app/components/lab-trigger.tsx` keep their props, wrapper shape,
   and call sites; only the SDK calls inside became TODOs. This gives
   trainees an obvious place to add metrics without forcing them to
   re-architect.
3. **Docs rewritten as handout** — `docs/sentry-test-lab.md` (original
   build plan) was replaced by this file. The metrics and fingerprint
   docs were deleted because they describe specific implementation
   details that don't survive a fresh wizard run.
