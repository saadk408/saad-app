# Sentry Fingerprint Rules

Companion to `docs/sentry-test-lab.md`. Canonical text for the project-side
Fingerprint Rules used in Sentry → Project Settings → Issue Grouping for
`saad-test-org/saad-app-nextjs`.

The rules below are pasted into the Sentry UI; they are not loaded from this
file at runtime. This doc is the source of truth — keep it in sync with what's
deployed in the project settings.

## Why we need rules

Sentry's default grouping algorithm underperforms in three places the labs
deliberately stress:

- **Plain `Error` with distinct messages** in `/labs/errors` (SPC-ERR-01
  through SPC-ERR-04). The default algorithm can either collapse them across
  click sites or fragment them by minified frame names.
- **Chained-exception bleed-through** between `/labs/errors` and `/labs/seer`.
  SPC-ERR-04 throws `Error` with a `TypeError` cause; SPC-ERR-07 throws
  `AppError` with a `TypeError` cause; SPC-SEE-01 throws a plain `TypeError`.
  The `error.type` matcher fires on **any** value in a `cause`-chain, so a
  blunt `error.type:"TypeError"` rule will steal events from all three.
- **`/api/payment` two custom subclasses** (`PaymentDeclinedError`,
  `GatewayTimeoutError`) on the same route. Must remain separate issues
  regardless of how the default algorithm reads the route handler.

## Empirical findings that shaped this design

Verified against live events in `saad-app-nextjs`. Don't undo these decisions
without re-checking against current Sentry behavior:

1. **`error.type` matches any value in the `cause`-chain**, not just the outer
   thrown exception. Rules ordered such that a generic type matcher comes
   before a specific subclass matcher will swallow the specific case.
2. **Turbopack inlines small server-only helper functions** (e.g.,
   `applyDiscount`) into their callers. The resulting stack frame is
   attributed to the surviving outer function (`throwInAction`,
   `validateLineItem`), so `stack.function:"applyDiscount"` never matches.
   Match by `error.value` (message text) or by file path instead.
3. **Glob negation on `stack.abs_path` for server-bundled paths is
   unreliable.** The displayed source-mapped path looks like
   `../../../../app/labs/seer/actions.ts`, but the underlying `abs_path`
   stored on the event differs (likely a `.next/server/...` bundle path or a
   `webpack-internal:///` URL where `labs/seer` is not a normal segment).
   Use `tags.transaction:"POST /labs/<lab>"` for server-side scoping —
   transaction tags are stable.

## The rules block

Paste the block below into the Sentry UI. **Order matters** — first-match-wins.
Comments (`#` lines) are part of the grammar.

```bash
# ===========================================================================
# saad-app fingerprint rules
# Project: saad-test-org / saad-app-nextjs
# Source of truth: docs/sentry-fingerprint-rules.md
# ===========================================================================

# ---------------------------------------------------------------------------
# /labs/errors — one issue per specimen
# ---------------------------------------------------------------------------

# SPC-ERR-01: client onClick throw
error.value:"Client onClick error:*" -> errors-onclick title="Errors lab — client onClick"

# SPC-ERR-02: render-phase throw
error.value:"Render-phase error:*" -> errors-render title="Errors lab — render-phase"

# SPC-ERR-03: useEffect rejection. Strip the volatile tick={n} counter so
# every tick groups into one issue.
error.value:"Unhandled rejection from useEffect tick=*" -> errors-unhandled-rejection title="Errors lab — useEffect rejection"

# ---------------------------------------------------------------------------
# Seer escape hatch. SPC-SEE-01 must use Sentry's default grouping, but the
# generic TypeError rule below would otherwise claim it via chain matching.
# This rule consumes the match and falls through to default fingerprinting.
# Scoped by transaction tag because path-negation on server bundles is flaky.
# ---------------------------------------------------------------------------
tags.transaction:"POST /labs/seer" -> {{ default }} title="Seer lab — buggy checkout"

# ---------------------------------------------------------------------------
# SPC-ERR-04: server action throw in /labs/errors. Match by message — the
# function-name approach (stack.function:"applyDiscount") doesn't work
# because Turbopack inlines applyDiscount into throwInAction. The message
# text is unique to this specimen.
# ---------------------------------------------------------------------------
error.value:"applyDiscount: code BAD is invalid" -> errors-server-applyDiscount title="Errors lab — server action applyDiscount"

# ---------------------------------------------------------------------------
# SPC-ERR-07: custom AppError subclass. MUST come before the generic
# TypeError rule below — SPC-ERR-07 throws AppError with a TypeError cause,
# and error.type matches across the cause-chain. {{ error.value }} layered
# so future AppError variants (different code values) split into sub-issues.
# ---------------------------------------------------------------------------
error.type:"AppError" -> errors-app-error, {{ error.value }} title="Errors lab — AppError"

# ---------------------------------------------------------------------------
# SPC-ERR-06: client TypeError. Catch-all for any TypeError that survived the
# rules above. {{ error.value }} keeps different undefined-access bugs
# distinct (e.g., reading 'foo' vs reading 'percentage').
# ---------------------------------------------------------------------------
error.type:"TypeError" -> errors-typeerror, {{ error.value }} title="Errors lab — client TypeError"

# ---------------------------------------------------------------------------
# /api/payment — two custom subclasses, always distinct issues
# ---------------------------------------------------------------------------
error.type:"PaymentDeclinedError" -> payment-declined         title="Payment declined"
error.type:"GatewayTimeoutError"  -> payment-gateway-timeout  title="Payment gateway timeout"

# ---------------------------------------------------------------------------
# /cart server actions — name each validation failure
# ---------------------------------------------------------------------------
error.value:"Checkout failed:*"                              -> cart-checkout-failed, {{ transaction }}  title="Cart — checkout failed"
error.value:"addItem: missing productId"                     -> cart-additem-missing-productid           title="Cart — addItem missing productId"
error.value:"setQty: missing productId"                      -> cart-setqty-missing-productid            title="Cart — setQty missing productId"
error.value:"setQty: quantity must be a non-negative number" -> cart-setqty-invalid-qty                  title="Cart — setQty invalid qty"
```

## Per-rule rationale

| # | Specimen / Source | Matcher strategy | Why |
|---|---|---|---|
| 1 | SPC-ERR-01 | `error.value:"Client onClick error:*"` | Plain `Error` thrown from a client handler; the message prefix is the only stable discriminator. |
| 2 | SPC-ERR-02 | `error.value:"Render-phase error:*"` | Same idea — message prefix is the only reliable discriminator. |
| 3 | SPC-ERR-03 | `error.value:"Unhandled rejection from useEffect tick=*"` | The `tick={n}` counter is volatile; the glob strips it so reruns merge into one issue. |
| 4 | SPC-SEE-01 (escape hatch) | `tags.transaction:"POST /labs/seer" -> {{ default }}` | Consumes the match before any later rule fires. `{{ default }}` falls back to Sentry's default grouping. Scoped by transaction tag because path-negation is unreliable. |
| 5 | SPC-ERR-04 | `error.value:"applyDiscount: code BAD is invalid"` | Function-name matching fails — Turbopack inlines `applyDiscount` into `throwInAction`. The message text is unique to this specimen. |
| 6 | SPC-ERR-07 | `error.type:"AppError"` | Must come before the generic TypeError rule because chain-matching would otherwise hand the event to `errors-typeerror` via the cause. |
| 7 | SPC-ERR-06 | `error.type:"TypeError"` | Catch-all for any TypeError after the seer escape hatch and AppError rule have consumed their cases. `{{ error.value }}` keeps different undefined-access bugs distinct. |
| 8-9 | `/api/payment` | `error.type:"PaymentDeclinedError"` / `error.type:"GatewayTimeoutError"` | Both subclasses set `this.name` in their constructors, so `error.type` matches reliably. |
| 10 | `cart/actions.ts:checkout` | `error.value:"Checkout failed:*"` + `{{ transaction }}` | Same checkout error from different surfaces (cart page vs. programmatic call) is meaningfully different — split by transaction. |
| 11-13 | `cart/actions.ts:addItem`/`setQty` | exact `error.value` matchers | Three distinct validation failures; we want each as its own named issue. |

## Ordering invariants

These are the constraints that justify the order above. Don't reshuffle without
re-verifying:

- **Seer escape hatch (#4) must come before any `error.type:"TypeError"`
  rule.** Otherwise the generic TypeError rule will claim SPC-SEE-01 via
  chain matching on its plain TypeError.
- **AppError (#6) must come before TypeError (#7).** SPC-ERR-07 is an
  `AppError` with a `TypeError` cause; reversing the order makes the TypeError
  rule swallow it.
- **SPC-ERR-04 (#5) is intentionally above the AppError rule** so the
  message-specific rule fires regardless of whether the chained TypeError
  cause is reported first.

## SPC-SEE-01 — escape hatch, not a custom group

The `/labs/seer` chain uses **Sentry's default grouping**. We don't want a
custom title or fingerprint for it — Seer's analysis benefits from grouping
based on the actual stack of `parseOrder → validateLineItem → priceOf →
applyDiscount`.

But we *do* need a rule for it, because the generic `error.type:"TypeError"`
catch-all below would otherwise grab every seer event. The escape hatch in
rule #4 (`tags.transaction:"POST /labs/seer" -> {{ default }}`) consumes the
match early and tells Sentry "use the default fingerprint." Net effect: same
as having no rule, but immune to the catch-all.

The seer Server Action has its own `try/catch` that returns a structured
`{ ok: false, frames }` to drive the lab UI's inline frame display. To make
sure Sentry still receives the event, `app/labs/seer/actions.ts` calls
`Sentry.captureException(e)` inside that catch. Removing that call would mean
SPC-SEE-01 generates zero Sentry issues regardless of grouping rules.

## Out of scope (intentional)

Considered and deferred — good follow-ups, not load-bearing today:

- **Tag plumbing** in `lib/metrics.ts` (`setTag("lab", lab)`,
  `setTag("specimen", specimen)` inside a `withScope`) plus the equivalent in
  `app/components/lab-trigger.tsx`. Would let every rule become
  `tags.specimen:"SPC-XXX" -> ...`, surviving minification, refactors, and
  the chained-exception bleed-through that motivated the empirical findings
  above.
- **Stack Trace Rules** for vendor-frame suppression
  (`stack.abs_path:"**/node_modules/next/**" -group`,
  `stack.abs_path:"**/.next/**" -group`). Different config field on the same
  Sentry settings page; complements (does not replace) the fingerprint rules
  above.
- **SDK-side `beforeSend`** in `sentry.server.config.ts` /
  `instrumentation-client.ts` for cases where fingerprinting needs runtime
  data unavailable to project-side rules.
