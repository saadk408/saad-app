# Onboarding Lab Audit — 2026-04-28

A synthesis of three independent persona-based audits of the Sentry onboarding lab (`docs/lab-handout.md`, `README.md`, and the lab code).

## Method

Three agents walked the lab independently with no shared context:

1. **Non-technical CSM** — never used Terminal, Git, or `npm`. Audited accessibility and prerequisite coverage.
2. **Technical SE new hire** — fluent in TypeScript/Git, new to Next.js 16 and Sentry. Audited correctness, TODO clarity, and demo-readiness.
3. **Seasoned Sentry SE** — used Context7, the Sentry MCP, and live docs to cross-check every API and UI flow against current Sentry (April 2026).

Each finding below is tagged with which personas flagged it. Convergent findings (2–3 personas) are highest-confidence — start there.

Severity scale:
- **BLOCKER** — lab will fail to run, or trainee gets stuck and gives up.
- **WRONG / OUTDATED** — works today but teaches the wrong thing for 2026.
- **FRICTION** — lab finishes but the trainee is confused or under-prepared.
- **GAP** — customer-readiness omission; SE will be unprepared on a customer call.

---

## A. BLOCKERS — fix before the next cohort

### A1. `runBuggyCheckout` will break if the trainee follows §7 step 10 verbatim
- **Flagged by:** Seasoned SE
- **Location:** `docs/lab-handout.md` §7 step 10 File C / `app/labs/seer/actions.ts:45-49`
- **Issue:** Handout instructs trainees to add `formData: FormData` to `runBuggyCheckout`, but the action takes no arguments — it's invoked from a button click, not a form. Adding the parameter changes the call site; the trainee breaks the page that demos Seer (the hero lab).
- **Fix:** Rewrite §7 step 10 File C to handle non-form actions. Drop `formData` from both the parameter list and the `withServerActionInstrumentation` options. Verify against the call site in `app/labs/seer/page.tsx`.

### A2. `/labs/logs/page.tsx` has no `// TODO` markers on the client-side `console.*` calls
- **Flagged by:** Technical SE
- **Location:** `app/labs/logs/page.tsx:34, 54, 74`
- **Issue:** §7's `rg -n "TODO" .` self-check is the trainee's only completion signal. Without TODOs on the three client console calls, the self-check passes while the lab is half-wired.
- **Fix:** Add `// TODO: replace with Sentry.logger.<level>(...)` above each `console.*` call. While here, narrow the self-check command to `rg -n "// TODO" app lib` so handout-internal TODOs and `node_modules` are excluded.

### A3. Mac prerequisites missing for non-technical trainees
- **Flagged by:** Non-technical CSM
- **Location:** `docs/lab-handout.md` §3
- **Issue:** A fresh Mac will trigger the Xcode Command Line Tools install dialog the first time `git --version` runs (5–10 minute install with its own modal), and `git clone` of a private repo fails without GitHub auth. Neither is covered. A CSM/AE will give up here.
- **Fix:** Insert §3.x with three sub-sections:
  - "macOS first-run: if Terminal pops up an Xcode CLT install prompt, click Install and wait."
  - "GitHub auth: install GitHub Desktop, sign in once — that wires Git auth for every `git clone` you'll run."
  - "Where the code lands: `cd ~/Documents` before `git clone` so Finder can find the folder later."

### A4. `app/labs/feedback/page.tsx` points trainees at the wrong file
- **Flagged by:** Seasoned SE
- **Location:** `app/labs/feedback/page.tsx:34`
- **Issue:** Code comment says `sentry.client.config.ts (after wizard runs)`. Next.js 15+ renamed this to `instrumentation-client.ts` and the wizard generates the new name. Trainees will paste config into a file that doesn't exist.
- **Fix:** Update the comment to `instrumentation-client.ts (after wizard runs)`.

### A5. `enableLogs: true` instruction is non-deterministic
- **Flagged by:** Technical SE
- **Location:** `docs/lab-handout.md:1217` (§8 `/labs/logs`)
- **Issue:** "The wizard may already do this" — trainees won't actually verify, and the logs lab silently fails when the flag is missing in any of the three init files.
- **Fix:** Replace with: "Open `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`. Confirm `enableLogs: true` is in each `Sentry.init({ ... })` block. If missing, add it." Add a Troubleshooting bullet in §12: "Logs not appearing → check all three init files."

---

## B. WRONG / OUTDATED — fix before someone uses this on a customer call

### B1. Metrics framing implies continuity with the killed 2024 beta
- **Flagged by:** Seasoned SE
- **Location:** `docs/lab-handout.md:1281-1324` (§8 metrics) + §7 step 8
- **Issue:** Sentry's first metrics beta was *removed* in v9 and a *new* metrics API was re-released in v10.25+. Handout doesn't acknowledge the gap. Trainees who Google "Sentry metrics" hit conflicting Zendesk articles announcing the discontinuation.
- **Fix:** One sentence in §8 metrics intro: *"Sentry's Application Metrics returned to open beta in `@sentry/nextjs` 10.25.0 after the previous beta ended in late 2024. The shape (`count/gauge/distribution`) is unchanged but it's a separate feature; older blog posts about the discontinued beta no longer apply."*

### B2. Manual `Sentry.flush(2000)` in `withLabMetric` is redundant when wrapped in `withServerActionInstrumentation`
- **Flagged by:** Seasoned SE
- **Location:** `lib/metrics.ts` TODO + §7 step 8 framing
- **Issue:** Once a Server Action is wrapped in `withServerActionInstrumentation`, the SDK handles flush at transaction teardown. The manual flush is at best redundant and could truncate spans.
- **Fix:** Move the flush guidance to "fallback for naked Server Actions" only.

### B3. `tracesSampleRate: 1.0` claim is stale
- **Flagged by:** Seasoned SE
- **Locations:** `docs/lab-handout.md:1184, 1380, 1538`
- **Issue:** Wizard now writes `process.env.NODE_ENV === 'development' ? 1.0 : 0.1`. Handout's "the wizard set 1.0" and "for production you'd lower it" framing is wrong on both counts.
- **Fix:** Update §9.5 to: *"The wizard ships a production-aware default (`1.0` in dev, `0.1` in prod). Override with a `tracesSampler` function for finer control — see §14."*

### B4. Deterministic Seer-output prediction
- **Flagged by:** Technical SE (CSM also implicitly hit this)
- **Location:** `docs/lab-handout.md:1242-1255, 1455`
- **Issue:** Handout claims Seer will recommend exactly `if (price === undefined) return 0;`. LLM outputs vary — a trainee whose Seer says something different will think they did something wrong.
- **Fix:** Soften: *"Seer should identify `applyDiscount` as the bug site and recommend an undefined guard. Exact wording will vary."*

### B5. Replay masking claim misrepresents the default
- **Flagged by:** Seasoned SE
- **Location:** `docs/lab-handout.md:1442-1444` (§10.3)
- **Issue:** "Sentry masks password inputs by default" implies a smart-targeted default. The actual default is much more aggressive: **all text, all inputs, all media masked**. A trainee saying the wrong thing in a customer call about privacy is bad.
- **Fix:** *"Sentry masks all text, inputs, and media by default. To unmask non-sensitive content, configure `replayIntegration({ maskAllText: false, blockAllMedia: false })` or use `data-sentry-unmask` on specific elements."*

### B6. Seer setup walkthrough skips the dedicated Seer settings page and pricing
- **Flagged by:** Seasoned SE
- **Location:** `docs/lab-handout.md:1342-1356` (§9.2)
- **Issue:** The canonical entry point is now `sentry.io/orgredirect/organizations/<slug>/settings/seer/` (separate from Settings → Integrations). Handout also doesn't mention the **separate Seer GitHub app** (required for PR creation) or that Seer is a **paid add-on** with active-contributor billing. A trainee on a free trial may hit a paywall mid-§10.4.
- **Fix:** Replace §9.2 steps 1–4 with the Seer settings path; add the Seer GitHub app step (optional but enables PRs); add a one-line pricing note pointing to #onboarding-help if usage is capped.

### B7. "Transaction" is legacy terminology
- **Flagged by:** Seasoned SE
- **Locations:** `docs/lab-handout.md:1611` (glossary) + §10.2
- **Issue:** Sentry's UI moved from `/performance/` to `/explore/traces/`; "Transaction" is now a legacy payload field, not a customer-facing term. A trainee saying "transaction" in a 2026 customer call sounds dated.
- **Fix:** Update glossary entry; rewrite §10.2 step 2 to *"Go to **Traces** (formerly Performance)."*

### B8. Wizard generates `/sentry-example-page` and an example API route — not mentioned in §5
- **Flagged by:** Seasoned SE
- **Location:** `docs/lab-handout.md:374-385`
- **Issue:** §5 "what success looks like" lists 7 files; wizard actually drops 7 files **plus** a `/sentry-example-page` route and `/api/sentry-example-api`. A trainee wonders where these came from.
- **Fix:** Add one line: *"The wizard also drops `/sentry-example-page` and `/api/sentry-example-api`. They're a smoke test — feel free to delete or use them in §6 instead of `/labs/errors`."*

### B9. `tunnelRoute` value mismatch + `next.config.ts` TODO uses deprecated `setCommits: { auto: true }`
- **Flagged by:** Seasoned SE
- **Location:** `next.config.ts:5-14`
- **Issue:** Repo TODO uses `tunnelRoute: "/monitoring"`; official wizard uses `/sentry-tunnel`. `setCommits: { auto: true }` still works but isn't best practice in v9+ where Build-ID release fallback was removed.
- **Fix:** Update the in-file TODO to match the current wizard output. Suggested replacement:
  ```ts
  //   export default withSentryConfig(nextConfig, {
  //     org: "<your-org>",
  //     project: "<your-project>",
  //     authToken: process.env.SENTRY_AUTH_TOKEN,
  //     silent: !process.env.CI,
  //     widenClientFileUpload: true,
  //     tunnelRoute: "/sentry-tunnel",
  //     // Source maps auto-upload + auto-delete is the default in v9+.
  //   });
  ```

### B10. `feedbackIntegration({ autoInject: true })` is redundant
- **Flagged by:** Seasoned SE
- **Location:** `app/labs/feedback/page.tsx:38-41`
- **Issue:** `autoInject: true` is the default. Teaching trainees to write it leads them to think the option is required.
- **Fix:** Drop the line; keep only `colorScheme: "system"`.

---

## C. FRICTION — prioritize for next handout revision

### C1. Verification steps lack screenshots throughout
- **Flagged by:** CSM (most insistent) + Technical SE
- **Locations:** `docs/lab-handout.md` §6, §8 (every lab), §9.2, §9.4, §10.1–§10.5
- **Issue:** Every "go to **X** in Sentry" lacks a screenshot of what X looks like. CSMs will guide customers through these exact flows — they need visual anchors.
- **Highest-impact insertions:**
  - §6: first-event Issues list with project picker
  - §9.2: Integrations page, GitHub circled
  - §9.4: alert builder showing Issue Alert selected
  - §10.x: one screenshot per exercise of the destination tab

### C2. Glossary missing ~15 terms used before they're introduced
- **Flagged by:** CSM
- **Location:** `docs/lab-handout.md:1578-1615` (§13)
- **Used-but-undefined:** repository/repo, terminal, prompt (the `$`), runtime, minified, SaaS, organization (Sentry-sense), project (Sentry-sense), integration, environment, sampling rate, App Router, Route Handler, stack trace, telemetry, PII, fan-out.
- **Fix:** Add one-sentence entries for each.

### C3. §7.10 Server Action wrapping needs a "why" preamble
- **Flagged by:** CSM + Technical SE
- **Location:** `docs/lab-handout.md:935-947`
- **Issue:** Densest section in the handout, presented as ritual copy-paste. Trainees who finish won't survive a customer asking "do I really need to wrap every Server Action?"
- **Fix:** One-paragraph lead: *"Next.js's bundlers don't auto-instrument `\"use server\"` functions, so each one needs an explicit name registered with Sentry. The mechanical wrap below tells the SDK 'this is a span called X' so traces include it."* Plus a sentence on the optional `formData` parameter for non-form actions.

### C4. `app/labs/tracing/page.tsx:115` TODO disagrees with the handout
- **Flagged by:** Technical SE
- **Issue:** TODO says `Sentry.startSpan({ name: "checkoutFlow" }, ...)`. Handout §7 step 3 wants `{ name: "checkoutFlow", op: "function" }`.
- **Fix:** Add `op` to the TODO. Consider also showing `attributes` in the after-example for a more complete API teaching.

### C5. §5 wizard prompt list defines DSN, source maps — but never SaaS, minified
- **Flagged by:** CSM
- **Location:** `docs/lab-handout.md:363-380`
- **Fix:** Inline-define both:
  - *"**SaaS** — Software-as-a-Service, the cloud version Sentry hosts at sentry.io, as opposed to a Sentry instance your company runs on its own servers."*
  - *"**Minified** — compressed, machine-optimized names like `f1.a.b`; the build process renames functions to save bytes. Source maps reverse this so stack traces are readable."*

### C6. §5 wizard prompts don't mention feedback
- **Flagged by:** Technical SE
- **Issue:** Trainee finishes §5 expecting the wizard handles all integrations, then arrives at §8 `/labs/feedback` confused why no widget appeared.
- **Fix:** Add a sentence to §5: *"The wizard does not currently prompt about user feedback — you'll add `Sentry.feedbackIntegration()` by hand in §8."*

### C7. §7.1 worked example needs lifelines for non-coders
- **Flagged by:** CSM
- **Location:** `docs/lab-handout.md:461-534`
- **Fix:** Add a 3-line lifeline at the top: *"If the code edits below intimidate you: open VS Code → press Cmd+Shift+F → type `TODO:` → step through every result. The before/after blocks tell you exactly what to type — copy and paste."* Define "import," "comment," "blank line" inline the first time each appears.

### C8. README order
- **Flagged by:** CSM
- **Location:** `README.md` lines 13–28 vs 30–37
- **Issue:** "Quick reference for engineers" comes *before* "Who this lab is for." A CSM landing here sees the scary `git clone` block first.
- **Fix:** Swap the order.

### C9. `/labs/errors` lab descriptions outpace the handout's vocabulary
- **Flagged by:** CSM
- **Location:** `app/labs/errors/page.tsx`
- **Issue:** Tile descriptions use "render-phase," "global handler," "segment error boundary," "round-trips" without the handout having prepared the reader.
- **Fix:** Either soften the in-app text or add a "what these tiles mean" sub-table to §8.

### C10. `unstable_retry` prop never explained
- **Flagged by:** Technical SE
- **Location:** `app/global-error.tsx:4` (and `error.tsx`)
- **Issue:** Next.js 16 renamed `reset` → `unstable_retry`. SE asked about the old prop name on a customer call has nothing.
- **Fix:** One-line code comment: `// Next.js 16 renamed this prop from 'reset' to 'unstable_retry'`.

---

## D. CUSTOMER-READINESS GAPS — what the lab doesn't teach

These are things SEs will get asked on day one. The lab doesn't have to teach all of them, but it should at minimum *acknowledge* them with §14 maintainer notes pointing at docs.

### Highest priority (every customer asks)

- **Environments + `release` versioning** — never wired in any init file. With v9's removal of Build-ID release fallback, customers *must* set `release` explicitly. (Tech SE + Seasoned SE)
- **Sampling depth** — `tracesSampler` function form, per-route, per-tenant. §9.5 is one paragraph. (Tech SE + Seasoned SE)
- **`beforeSend` / `beforeSendSpan` / `beforeSendLog` / `beforeSendMetric`** — primary PII-scrubbing and cost-control levers, not mentioned anywhere. (Seasoned SE)
- **`sendDefaultPii`** — wizard now writes `true`; recent commit `5955f05` flipped repo to `false`. The handout never explains the choice. (Seasoned SE)
- **Source maps in CI** + Turbopack vs Webpack upload differences. (Tech SE + Seasoned SE)

### Medium priority (frequent customer questions)

- **AI Agent Monitoring** (`Sentry.aiAgentIntegration`, Vercel AI SDK / LangChain hooks) — the differentiator in 2026, missing entirely. (Seasoned SE)
- **Trace Explorer query language** — querying traces by `span.duration:>2s span.op:db.query`. (Seasoned SE)
- **Issue Priority + Suggested Assignees + ownership rules** — ML-driven triage is a 2025+ headline feature. (Seasoned SE)
- **Distributed-trace verification** — lab has the surface (`cart → /api/checkout → /api/payment` via `lib/origin.ts`) but never tests end-to-end. (Tech SE)
- **`Sentry.logger.fmt`** — parameterized message helper that extracts searchable attributes. (Seasoned SE)
- **`consoleLoggingIntegration`** — customer-migration path for existing `console.*` codebases. Easy to confuse with `consoleIntegration` (default-on, breadcrumbs). (Seasoned SE)
- **`onRouterTransitionStart`** — wizard adds it, but trainees never verify. Common cause of "missing client-side navigation traces." (Seasoned SE)

### Lower priority (occasional, but worth a §14 note)

- **Profiling** / `profilesSampleRate` — flame graphs. (Seasoned SE)
- **Crons** / `Sentry.checkIn`. (Seasoned SE)
- **`getCurrentScope()` / `withScope()`** — replaced the old `Hub` API. (Seasoned SE)
- **OpenTelemetry dual setup** — for customers running their own OTel pipeline. (Seasoned SE)
- **Sentry MCP server / Seer in editors** — Claude Code / Cursor handoff. (Seasoned SE)
- **Edge runtime gotchas** — why `proxy.ts` is Node-only. (Tech SE)
- **1 MB log payload / 2 KB metric size limits** — common gotchas. (Seasoned SE)
- **Coding-agent PR handoff from Seer** — Claude Code, Cursor, Copilot. (Seasoned SE)

---

## E. Things the lab nails — preserve in revisions

All three agents flagged at least one strength. Don't regress these:

- **§3.5 Terminal 101** — the Cmd+Space / Ctrl-vs-Cmd / second-tab level of detail is a model for non-technical onboarding. (CSM)
- **"What success looks like" anchor blocks** with literal expected output. (CSM)
- **§13 cross-reference convention** — `**DSN** (§13)` lets readers jump and return. (CSM)
- **§8 "Customer scenario" framing** — the strongest on-ramp for non-engineering hires. (CSM)
- **§12 "How to ask for help"** template. (CSM)
- **Three-pillar (Instrument / Configure / Use) framing in §2** — maps to actual customer adoption. (Tech SE)
- **The Seer fixture** — `parseOrder → validateLineItem → priceOf → applyDiscount` is exactly the shape of a real customer bug. CLAUDE.md already protects the names; keep doing that. (Tech SE)
- **`lib/metrics.ts` + `lab-trigger.tsx` cross-cutting seam** — clean architecture for teaching distributed instrumentation patterns. (Tech SE)
- **The cross-process trace surface** is real (not synthetic) — `/cart → /api/checkout → /api/payment` via `lib/origin.ts`. (Tech SE)

---

## Suggested execution order

1. **Hour 1:** A1, A2, A4 — surgical code/doc edits that prevent cohort failures.
2. **Hour 2:** A3, A5 — prereq + non-determinism fixes that close the floor on completion rates.
3. **Hour 3–4:** B1–B10 — stale doc currency pass; each finding has a current-doc citation, so this is mechanical.
4. **Day 2:** C1 (screenshots) + C2 (glossary) — biggest impact on non-technical experience.
5. **Day 3+:** D — pick the top-5 customer-readiness gaps, add as §14 maintainer notes (cheap) before considering full lab pages (expensive).

---

## Source agents

The audit was generated by three agents whose IDs may still be live for follow-up:

- **CSM persona:** `a0a9c30cd1343670a`
- **Technical SE persona:** `a912e003f3e97152d`
- **Seasoned SE with current docs:** `aa6934a25735718e7`

The seasoned SE's report is the most useful follow-up source — every WRONG/OUTDATED finding includes the current Sentry doc citation (URL + quoted snippet) so a maintainer can verify before editing.
