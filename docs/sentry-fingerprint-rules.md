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
- **`applyDiscount` function-name collision** between `/labs/seer` and
  `/labs/errors`. Two different bugs, same name — needs explicit
  disambiguation.
- **`/api/payment` two custom subclasses** (`PaymentDeclinedError`,
  `GatewayTimeoutError`) on the same route. Must remain separate issues
  regardless of how the default algorithm reads the route handler.

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

# SPC-ERR-04: server-action applyDiscount throw in /labs/errors. Disambiguates
# from /labs/seer's applyDiscount (which is a TypeError, not an Error) by path.
# Path matcher is belt-and-braces if the error class ever shifts.
stack.abs_path:"**/labs/errors/**" stack.function:"applyDiscount" -> errors-server-applyDiscount title="Errors lab — server action applyDiscount"

# SPC-ERR-06: client TypeError. Negate the seer path so the seer chain
# (TypeError in applyDiscount) never falls through here. Layer error.value
# so different undefined accesses stay distinct.
error.type:"TypeError" !stack.abs_path:"**/labs/seer/**" -> errors-typeerror, {{ error.value }} title="Errors lab — client TypeError"

# SPC-ERR-07: custom AppError subclass. Layer error.value so future AppError
# variants (different code values etc.) split into sub-issues automatically.
error.type:"AppError" -> errors-app-error, {{ error.value }} title="Errors lab — AppError"

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

# /labs/seer SPC-SEE-01 is intentionally NOT covered. Default Sentry grouping
# applies to the parseOrder → validateLineItem → priceOf → applyDiscount chain.
```

## Per-rule rationale

| # | Specimen / Source | Matcher strategy | Why |
|---|---|---|---|
| 1 | SPC-ERR-01 | `error.value:"Client onClick error:*"` | Plain `Error` thrown from a client handler; only the message prefix is stable. |
| 2 | SPC-ERR-02 | `error.value:"Render-phase error:*"` | Same idea — message prefix is the only reliable discriminator. |
| 3 | SPC-ERR-03 | `error.value:"Unhandled rejection from useEffect tick=*"` | The `tick={n}` counter is volatile; the glob strips it so reruns merge. |
| 4 | SPC-ERR-04 | `stack.abs_path:"**/labs/errors/**" stack.function:"applyDiscount"` | Disambiguates from the seer lab's identically-named function. Both `stack.*` matchers must apply to the *same frame* — they do (the throwing frame). |
| 5 | SPC-ERR-06 | `error.type:"TypeError" !stack.abs_path:"**/labs/seer/**"` | Belt-and-braces: keeps Seer's TypeError out even though SPC-SEE-01 has no rule. `{{ error.value }}` layered so different undefined accesses stay distinct. |
| 6 | SPC-ERR-07 | `error.type:"AppError"` | `AppError` is a real subclass with `this.name = "AppError"` set in the constructor (`app/labs/errors/page.tsx`); the SDK promotes that into `exception.values[].type`. |
| 7-8 | `/api/payment` | `error.type:"PaymentDeclinedError"` / `error.type:"GatewayTimeoutError"` | Both subclasses set `this.name` in their constructors, so `error.type` matches reliably. |
| 9 | `cart/actions.ts:checkout` | `error.value:"Checkout failed:*"` + `{{ transaction }}` | Same checkout error from different surfaces (cart page vs. programmatic call) is meaningfully different — split by transaction. |
| 10-12 | `cart/actions.ts:addItem`/`setQty` | exact `error.value` matchers | Three distinct validation failures; we want each as its own named issue. |

## Ordering invariants

- The seer-path-negated TypeError rule (rule #5) must come *after* any rule
  that wants to claim a seer-related TypeError. Today the seer chain has no
  rule, so this is moot — but if a seer rule is ever added, insert it
  *above* rule #5.
- `error.type:"AppError"` (rule #6) must come before any rule that could match
  `AppError`'s `TypeError` cause, in case the SDK reports the chain.

## SPC-SEE-01 — why no rule

The `/labs/seer` chain is intentionally left to Sentry's default grouping. The
deliberate `parseOrder → validateLineItem → priceOf → applyDiscount` function
names are stable enough that the default algorithm produces a single, useful
issue, and Seer's analysis benefits from grouping based on the actual stack.

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
  `tags.specimen:"SPC-XXX" -> ...`, surviving minification and refactors.
- **Stack Trace Rules** for vendor-frame suppression
  (`stack.abs_path:"**/node_modules/next/**" -group`,
  `stack.abs_path:"**/.next/**" -group`). Different config field on the same
  Sentry settings page; complements (does not replace) the fingerprint rules
  above.
- **SDK-side `beforeSend`** in `sentry.server.config.ts` /
  `instrumentation-client.ts` for cases where fingerprinting needs runtime
  data unavailable to project-side rules.
