# Sentry Onboarding Lab

A Next.js 16 sandbox for learning Sentry hands-on. You'll wire the SDK into a
working app, configure Sentry from its UI, and use Sentry the way our
customers do — triaging issues, walking traces, watching replays, running
Seer.

> **Start in [`docs/lab-handout.md`](docs/lab-handout.md).** Every step,
> command, and term used in this README is explained there with no
> background assumed. If the rest of this README looks like jargon, that's
> expected — go to the handout.

## Quick reference for engineers who've done this before

If you've installed Node, run `git clone`, and used a terminal in the past
week, this is the install path:

```bash
git clone <this-repo-url>
cd saad-app
npm install
npm run dev                          # http://localhost:3000
npx @sentry/wizard@latest -i nextjs  # when you're ready to instrument
```

If any of those commands look unfamiliar, **don't run them yet** — go to
the handout. It walks each one through with screenshots and a Terminal 101
section.

## Who this lab is for

- **Solutions Engineers** learning the SDK end-to-end before customer calls.
- **Customer Success Managers** and **Account Executives** who want to use
  Sentry the way their customers do.
- Anyone new to Sentry — the handout assumes no terminal experience and
  defines every term inline the first time it appears.

## What you'll do

Three pillars, one app:

1. **Instrument** — install `@sentry/nextjs`, run the wizard, fill in the
   `TODO` markers so each lab page emits the right kind of event.
2. **Configure** — set up your project in Sentry, connect GitHub for Seer,
   write an alert rule, configure sampling.
3. **Use** — open issues, walk traces, watch replays, run Seer on a real bug,
   submit user feedback.

## What's in the box

- **Demo flow** at `/`, `/products`, `/products/[id]`, `/cart`, `/signin`,
  `/dashboard` — a polished e-commerce experience that, once instrumented,
  generates realistic traces, replays, and Server Action mutations.
- **Six labs** at `/labs/{errors,tracing,logs,seer,feedback,metrics}` —
  deliberate failure surfaces, one per Sentry feature. Each page is a list
  of specimen tiles with `TRIGGER` buttons that fire a targeted error,
  span, log, or metric.
- **A SDK seam** — every place the Sentry SDK plugs in is marked with a
  `// TODO` comment. The handout's §7 walks through how to find and fill
  these in.

The Sentry SDK itself is **intentionally not installed** in `package.json`
— running the wizard is your first install step. The handout's §5 covers
this.

> The sections below are reference for engineers who already know what
> things like "App Router," "Route Handler," and "ESLint flat config"
> mean. If those terms aren't familiar, skip them — you don't need them
> to do the lab.

## Surfaces

| Route | Sentry feature it exercises (once wired) |
|---|---|
| `/`, `/products`, `/products/[id]`, `/cart`, `/signin`, `/dashboard` | Replays, request traces, Server Action mutations |
| `/labs/errors` | Error capture (handler / render / effect / Server Action / route handler / TypeError / `AppError`) |
| `/labs/tracing` | Auto + distributed traces, custom `Sentry.startSpan` |
| `/labs/logs` | Client + server structured `Sentry.logger.*` |
| `/labs/seer` | Deep, semantically-named call chain for Seer + GitHub analysis |
| `/labs/feedback` | `Sentry.feedbackIntegration()` widget |
| `/labs/metrics` | `Sentry.metrics.{count,gauge,distribution}` |

## API endpoints

- `GET /api/products` — product list (`?fail=1` forces a 500).
- `POST /api/checkout` — chains to `/api/payment`, returns `orderId`.
- `POST /api/payment` — 70% success / 15% declined / 15% gateway timeout.
- `POST /api/echo` — recursive 1–8 hop fan-out for distributed-trace demos.
- `POST /api/log` — emits structured info / warn / error logs.
- `GET /api/slow?ms=N` — sleeps `N` ms (0–5000) for performance demos.

## Stack

Next.js 16 (App Router only), React 19, Tailwind 4, TypeScript strict, npm.
ESLint flat config (`next/core-web-vitals` + `next/typescript`). No test
runner; no separate `typecheck` script — TypeScript is checked during
`next build`.

Run `npm run build` before pushing — it surfaces async-API misuse and
Server Component boundary violations the dev server forgives.

## Where to start

1. **Read [`docs/lab-handout.md`](docs/lab-handout.md)** — the trainee
   guide, end-to-end. Written for any role.
2. **Skim `CLAUDE.md` / `AGENTS.md`** — agent-facing rules and Next.js 16
   traps that have already bit this repo (engineers only).
