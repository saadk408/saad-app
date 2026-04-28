# Sentry Metrics

Companion to `docs/sentry-test-lab.md`. Documents how `Sentry.metrics.*` is wired
across this sandbox so future contributors know where to extend, what attributes
to use, and what *not* to add.

## SDK

`@sentry/nextjs@10.50.0`. Metrics ship in ≥ `10.25.0`; no init changes needed —
they're enabled by default in all three runtime configs (`instrumentation-client.ts`,
`sentry.server.config.ts`, `sentry.edge.config.ts`).

## The two seams

### 1. Per-tile click — `<LabTrigger>` (client)

`app/components/lab-trigger.tsx` is the centralized seam. Pass `lab` and
`specimen` and the component emits `lab_trigger` on every click before invoking
`onClickAction`.

```tsx
<LabTrigger
  lab="errors"
  specimen="SPC-ERR-01"
  onClickAction={() => { throw new Error("…"); }}
>
  TRIGGER
</LabTrigger>
```

> **Why `onClickAction` and not `onClick`?** Next.js 16's `'use client'`
> serialization rule rejects function-typed props on client component boundaries
> unless the name ends in `Action`. The function is *not* a Server Action;
> the suffix is purely to satisfy the linter.

### 2. Server Action wrap — `withLabMetric` (server)

`lib/metrics.ts` exports `withLabMetric(lab, specimen, fn)`. Wrap every Server
Action so the metric fires on the Node runtime even when the action throws or
redirects.

```ts
export const throwInAction = withLabMetric(
  "errors",
  "SPC-ERR-04",
  async (): Promise<void> => { /* … */ },
);
```

The wrapper does three things, in order: emit the metric, run the inner
function in a `try`, and `await Sentry.flush(2000)` in a `finally`. The flush
matters because Server Actions in serverless environments can terminate
before the metric buffer auto-flushes.

`LabTriggerSubmit` is intentionally *not* instrumented — its companion Server
Action emits the (server) metric, so each click yields exactly one
`lab_trigger`.

## Attribute schema

One canonical metric: **`lab_trigger`** (count). Attributes:

| Attribute  | Values                                                                     |
|------------|----------------------------------------------------------------------------|
| `lab`      | `errors`, `tracing`, `logs`, `seer`, `metrics`                             |
| `specimen` | `SPC-ERR-01`…`SPC-ERR-07`, `SPC-TRC-01`…`SPC-TRC-04`, `SPC-LOG-01`…`SPC-LOG-04`, `SPC-SEE-01`, `SPC-MET-01`…`SPC-MET-05` |
| `runtime`  | `client` \| `server`                                                       |

All low-cardinality. ~25 unique `(lab, specimen)` pairs and exactly 2 `runtime`
values.

`/labs/metrics` additionally emits **`metrics_demo_count`**,
**`metrics_demo_gauge`**, and **`metrics_demo_distribution`** so its activity is
separable from the cross-cutting `lab_trigger`.

## Cardinality rules

- **Never** put per-user, per-request, or unbounded IDs in metric attributes.
- Bounded enums and small sets only (region, tier, env, status, route pattern).
- For per-user / per-request detail, use `Sentry.logger.*` instead.
- Each metric envelope is capped at 2 KB; oversized envelopes are dropped.

## Out of scope (intentional)

The following were considered and deferred:

- `proxy.ts` request counter (`requests` count by route + method)
- `/api/*` route latency distributions
- Demo-flow Server Action counts (`cart/actions.ts`, `signin/actions.ts`)

Any of these are good follow-ups; they're not load-bearing for the lab parity
goal.
