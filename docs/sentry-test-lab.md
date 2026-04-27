# Sentry Test Lab — Implementation Plan

**Audience:** A Claude Code agent (or human) executing this plan from a fresh context. Read this whole document before writing code. Also read `AGENTS.md` and `CLAUDE.md` at the repo root.

---

## 1. Goal

Build a polished Next.js 16 sandbox app that, once Sentry is wired in, exercises every major Sentry feature: **error monitoring, distributed tracing, structured logs, session replay, Seer, and user feedback**.

**This plan does NOT install or configure Sentry.** It only builds the surfaces (pages, server actions, route handlers, error boundaries, forms, dynamic routes) so that adding `@sentry/nextjs` later is a small, isolated step that lights everything up.

### Design choices already locked

| Decision | Choice | Why |
|---|---|---|
| App style | Polished demo-flavored e-commerce + a `/labs` section of bug triggers | Replays/traces/Seer look realistic when the app feels real |
| Persistence | In-memory module state | Simplest; mutations still produce write-shaped traces. Resets on dev reload — fine. |
| AI/LLM page | **Skip** for this round | Out of scope; can be added later as a separate plan |
| Styling | Tailwind 4 (already installed) | Don't introduce another lib |
| Package manager | Bun (`bun.lock` exists) | Match the project |
| Routing | App Router only | New `create-next-app` default; no Pages Router |

---

## 2. Tech stack (current state, do not change without reason)

- **Next.js 16.2.4** (Turbopack default; see §3)
- **React 19.2.4**
- **TypeScript** strict, `target: ES2017`, alias `@/*`
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **ESLint flat config** (v9+, `eslint-config-next/core-web-vitals` + `typescript`)
- **Bun** for install + scripts (`bun dev`, `bun run build`)
- Node ≥ 20

The current repo has the standard `create-next-app` welcome page (`app/page.tsx`), root layout (`app/layout.tsx`), `globals.css`, `next.config.ts` (empty), `tsconfig.json`, ESLint flat config, PostCSS config. No `instrumentation.ts`, `proxy.ts`, or `error.tsx` yet.

---

## 3. Next.js 16 breaking changes that shape this code

The agent's training data is likely Next.js 14/15. **Read `node_modules/next/dist/docs/01-app/` before writing code.** The deltas that matter for this plan:

### Async Request APIs

`params`, `searchParams`, `cookies()`, `headers()` are **all async** — they return Promises. Code that worked on Next 14/15 will break.

```ts
// ✅ Next.js 16 — dynamic route page
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}

// ✅ Next.js 16 — searchParams in a page
export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // ...
}

// ✅ Next.js 16 — request headers in a server function
import { headers } from "next/headers";
const h = await headers();
const ua = h.get("user-agent");
```

### Middleware → `proxy.ts`

The file is no longer `middleware.ts`. Renamed to `proxy.ts` at the project root (or `src/`), and the export is `proxy()` not `middleware()`. **Node.js runtime only — no `runtime: 'edge'`.**

```ts
// proxy.ts (project root)
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### `instrumentation.ts`

Lives at the project root (or `src/`). Exports `register()` (server startup hook) and optionally `onRequestError()` (request error hook). For now we leave both empty with a TODO — Sentry will plug in here later.

```ts
// instrumentation.ts (project root)
export async function register() {
  // TODO: Sentry init goes here.
  // if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  // if (process.env.NEXT_RUNTIME === "edge")   await import("./sentry.edge.config");
}

// TODO: export const onRequestError = Sentry.captureRequestError;
```

### Other v16 changes worth knowing

- **Turbopack is the default builder** — no `--turbopack` flag in scripts; legacy webpack config will fail. The current `next.config.ts` is empty, which is correct.
- **`revalidateTag` now takes a second arg** — `revalidateTag(tag, profile)` where profile is a cacheLife string like `'max'` or `{ expire?: number }`. Not used in this plan; we use `revalidatePath` only.
- **PPR (Partial Prerendering) is now `cacheComponents: true`** in `next.config.ts`, replacing `experimental_ppr` and `experimental.dynamicIO`. Not used in this plan.
- **`next lint` was removed** — use ESLint CLI directly. The `lint` script in `package.json` already calls `eslint` (✓ verified).
- **Error boundaries use `unstable_retry`, not `reset`** — In Next.js 16, both `error.tsx` and `global-error.tsx` receive `{ error, unstable_retry }` (not `reset`). Call `unstable_retry()` to recover. The prop name carries the `unstable_` prefix because the API may stabilize under a different name later.

### Codemods available

Next.js ships codemods for many of these migrations. If anything goes wrong, run:
- `npx @next/codemod@canary middleware-to-proxy .` — middleware → proxy rename
- `npx @next/codemod@canary next-async-request-api .` — async cookies/headers/params/searchParams
- `npx @next/codemod@canary next-lint-to-eslint-cli .` — drop `next lint`

---

## 4. Code intelligence rules

From `AGENTS.md`: **prefer LSP over Grep/Read** for code navigation when implementing. Specifically:

- `workspaceSymbol` to find where something is defined
- `findReferences` for usages
- `goToDefinition` / `goToImplementation` to jump to source
- `hover` for type info
- After writing/editing code, **check LSP diagnostics and fix errors before proceeding**

Use Grep only for text/pattern searches (comments, strings, config).

---

## 5. Sentry feature → app surface mapping

| Sentry feature | Surfaces in this app |
|---|---|
| **Error Monitoring (client)** | `/labs/errors` handler/render/effect throws; `app/error.tsx`; `app/global-error.tsx` |
| **Error Monitoring (server)** | Server Actions in `cart/actions.ts`, `labs/*/actions.ts`; Route Handlers (`?fail=1`, payment failures) |
| **Tracing (auto)** | Page navigations, Route Handlers, Server Actions, `fetch()` chains |
| **Tracing (custom spans)** | `Sentry.startSpan` placeholders in `/labs/tracing` and `/labs/seer` (commented TODOs) |
| **Distributed tracing** | `/api/checkout` → `/api/payment`; client-side sequential 3-hop in `/labs/tracing` |
| **Logs** | `Sentry.logger.*` calls from `/labs/logs` (client) and its Server Action (server); `/api/log` |
| **Session Replay** | Real interactions: `/signin`, `/products`, `/cart` flow — masked password works out of the box |
| **Seer** | `/labs/seer` deep-stack bug + GitHub repo connection; rich client-server traces give it more context |
| **User Feedback** | `feedbackIntegration()` widget gets a dedicated explainer page; will appear globally once enabled |
| **Profiling** (bonus) | Slow Server Action and `/api/slow` produce profile-worthy CPU spans |

---

## 5b. Frontend design system

**Concept: "Telemetry Lab Notebook."** A scientific-instrument aesthetic crossed with an annotated researcher's notebook. Each page reads like a page from a lab journal documenting an experiment. Warm bone-paper backgrounds, deep ink type, a single sodium-amber signal accent, serif display + monospace data readouts, dot-grid graph-paper background. Brief amber-flash animations on lab triggers evoke instrument signals firing.

**Why this direction:** This is a *test lab* for an *observability product*. Leaning into the lab + instrument theme makes the form match the function. It also keeps the app visually distinct from the Sentry brand UI (so demos don't get confused with the real product surface).

### 5b.1 Color tokens

Defined as CSS variables in `app/globals.css` inside `@theme` (Tailwind 4 reads them automatically — no `tailwind.config.ts` needed).

**Tailwind 4 caveat:** `@theme` blocks **must be top-level** — they cannot be nested inside `@media` queries or selectors. Dark mode is handled via the `dark:` variant on utilities and a `:root` token override outside `@theme`.

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-paper: #F4EEDF;        /* bone / cream — primary background */
  --color-paper-soft: #EDE5D2;   /* slightly deeper paper for cards */
  --color-ink: #0F0F0D;          /* deep ink — primary text */
  --color-graph: #2B2A26;        /* notebook ruled-line color */
  --color-mute: #7A7569;         /* muted ink for secondary text */

  /* Signal */
  --color-signal: #FF8A1C;       /* sodium amber — accent */
  --color-signal-dim: #A55700;   /* dim amber — for dark surfaces */

  /* State (sparing use only) */
  --color-crit: #E63946;         /* error/danger — only for crit states */
  --color-trace: #3A86FF;        /* trace/link — only for trace lines */

  /* Typography */
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* Dark mode "instrument panel" inverse — override the same CSS vars
   on :root via media query (NOT inside @theme). Tailwind utilities that
   reference these vars (bg-paper, text-ink, etc.) automatically pick
   up the new values; `dark:` variant utilities still work for one-offs. */
@media (prefers-color-scheme: dark) {
  :root {
    --color-paper: #0E0E0C;
    --color-paper-soft: #16140F;
    --color-ink: #F4EEDF;
    --color-mute: #8B8676;
    --color-signal: #FFA646;     /* slightly warmer amber on dark */
  }
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-mono);  /* mono is the workhorse */
  font-feature-settings: "ss01", "cv11";  /* JetBrains Mono stylistic sets */
}
```

**Color usage discipline:**
- 80% paper + ink. 15% graph (rules, borders). 5% signal-amber.
- `--color-crit` only on actual error UI (dashboard "danger zone" border, error toasts).
- `--color-trace` only on links representing traces in the dashboard log.
- Never gradients on backgrounds (no purple-on-white). Solid surfaces only. Subtle dot grid is the sole texture.

### 5b.2 Typography

Two families, loaded via `next/font/google` in `app/layout.tsx`. **Replace the existing Geist setup** — those fonts are removed.

```ts
// app/layout.tsx
import { Fraunces, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

Apply both `variable` classes on `<html>`. Then in CSS:
- **Display (Fraunces)**: hero headings, scenario numbers, big stat numerals, page titles. Use larger optical size (`font-variation-settings: "opsz" 144, "SOFT" 50, "WONK" 1`) for hero h1; mid optical size for h2.
- **Mono (JetBrains Mono)**: nav items, captions, buttons, table cells, code, prose on lab pages, descriptions. **All UPPERCASE labels are mono**.
- Body prose on demo flow pages (Products, Cart) uses Fraunces at body size with `opsz` ~14 for readable serif copy.

Type scale:
- Hero h1: `clamp(56px, 9vw, 144px)` Fraunces, line-height 0.92, tracking -0.02em
- h2: `clamp(32px, 4vw, 56px)` Fraunces
- h3: `24px` Fraunces or `13px` JetBrains Mono uppercase tracking 0.12em (depending on context)
- Body: `15px` Fraunces or JetBrains Mono
- Caption / specimen tag: `11px` mono uppercase tracking 0.16em

### 5b.3 Background & textures

Single shared background applied to `<body>`:

1. **Dot grid** — SVG `background-image` with a 1px ink dot at 8% opacity on an 8px square grid. Lives in `globals.css`:
   ```css
   body {
     background-image:
       radial-gradient(circle, rgba(15, 15, 13, 0.08) 1px, transparent 1px);
     background-size: 8px 8px;
     background-position: 0 0;
   }
   ```
2. **Grain** — optional fixed `<div>` in root layout with an SVG `feTurbulence` filter at 4% opacity, `mix-blend-mode: multiply`. Skipped on mobile via media query (perf).

Lab pages add a **specimen tag** absolute-positioned in the upper-right of the main content area — a thin ink border rectangle with mono text like `SPC-EXP-04 / ERRORS`. See §5b.6.

### 5b.4 Layout patterns

**Asymmetric notebook grid.** Container is 12 columns. Default content lives in cols 2–9. Cols 10–12 reserved for *annotations* — small mono notes pinned alongside content (think: "professor's marginalia"). Wider left margin than right gives a "notebook binding" feel.

**Sticky top nav** — 56px tall, ink background in light mode (paper background in dark mode), full-bleed. Logo on left: Fraunces "Sentry Test Lab" + small mono `LAB.001` chip. Links on right: mono uppercase tracking-wide, 13px. Active link has 1px amber underline that animates in.

**Page header pattern** — every non-home page starts with:
```
01 / 06 ······················· /labs/errors
ERRORS
A field guide to thrown exceptions and their captures.
```
- Top line: mono, page number `XX / total` + leader dots + path. Color: `--color-mute`.
- Then big Fraunces page title.
- Then italic Fraunces subtitle (one sentence, max 80ch).
- Below: a hairline ink rule.

**Cards as "specimens"** — every card has:
- Thin (`1px`) ink border, sharp corners (no rounding)
- Specimen ID in upper-right corner (mono, `SPC-NNN`)
- Internal padding: 24px
- On hover: border thickens to 2px (use box-shadow inset for instant transition), amber underline animates under title

**Diagonal rules** — section dividers use a hairline at 6° angle, not a horizontal line. Implemented via `transform: rotate(-0.6deg)` on a 1px tall ink div. Subtle but memorable.

### 5b.5 Buttons

Two variants only:

**Lab trigger button** (used on `/labs/*`):
- Square corners, 1px ink border, paper background, mono uppercase 13px tracking-wide ink text
- Padding: `10px 20px`
- Hover: amber underline animates under label (left → right, 200ms)
- Click/active: amber background flash (instant fill, fades out over 400ms via `@keyframes`)
- Disabled (during pending Server Action): paper darkens, mono "…" appended

```css
@keyframes signal-flash {
  0%   { background: var(--color-signal); }
  100% { background: var(--color-paper); }
}
.btn-trigger:active { animation: signal-flash 400ms ease-out; }
```

**Action button** (demo flow — Products, Cart, Sign-in):
- Soft pill (rounded 9999px), amber background, ink text, mono uppercase 13px
- Hover: brightness 110%
- Disabled: opacity 50%, cursor not-allowed

No tertiary "ghost" buttons. Use plain inline links instead.

### 5b.6 Page-by-page design notes

(These extend the file specs in §6 — they do not replace them.)

**`/` Home dashboard:**
- Hero takes ~80vh. Background: paper + dot grid + a faint full-bleed mono **session-log strip** scrolling at the very bottom (10px tall, 6% opacity, infinite marquee). The strip has lines like `[12:04:21] route /products evt:span dur=312ms ✓`.
- Hero h1: stacked `TELEMETRY` over `LAB.` — Fraunces 144pt, line-height 0.85. Below in mono: `// click any specimen to trigger telemetry`.
- Below hero: 6-tile **specimen grid** (3 cols × 2 rows desktop). Each tile = specimen card pattern from §5b.4. Sections: PRODUCTS, CART, SIGN-IN, DASHBOARD, LABS, FEEDBACK.
- Below grid: "Sentry features wired here" — a 2-column mono table mapping feature → surface (mirrors §5).

**`/products` listing:**
- Page header pattern at top.
- Grid of 6 products, 3 columns desktop. Each product = card with:
  - Visual block: 1:1 aspect ratio, **abstract shapes** (circle + rect + line) on paper-soft background, in ink/amber. No photographs. Each product gets a different shape arrangement (deterministic from product id).
  - Below: Fraunces title, mono price with leader dots filling the row: `Acme Wireless Headphones ······· $129.00`
- Hover: card border thickens; visual block subtly tilts -1°.

**`/products/[id]` detail:**
- Two-column desktop layout (`grid-cols-12 gap-12`): cols 1–6 = visual, cols 7–12 = copy.
- Visual: large 4:5 abstract composition on paper-soft background.
- Copy column: serif title (Fraunces), mono SKU + category line, italic Fraunces description (3–4 sentences), Action button "Add to specimen cart".

**`/cart`:**
- Lab-notebook table — full-width, mono, ruled lines (1px ink at 50% opacity between rows). Columns:
  ```
  ITEM                        SKU        QTY    UNIT     TOTAL
  Acme Wireless Headphones    SPC-001    [−1+]  129.00   129.00
  ```
- Quantity buttons: small (24px), thin ink border, mono `−` `+`.
- Below table: large Fraunces total right-aligned: `Total $258.00`.
- Checkout button: full-width Action button.
- On success: replaces table with a centered "ORDER LOGGED" Fraunces title + mono receipt number.

**`/signin`:**
- Centered narrow column (`max-w-sm`), `min-h-[60vh]` flex centered.
- Title: Fraunces "Specimen sign-in".
- Form: labels mono uppercase 11px, inputs with no box border — only a 1px ink underline that thickens on focus.
- Submit: full-width Action button "AUTHENTICATE".
- After submit: amber flash + mono "result: authenticated ✓" or "result: rejected ✗".

**`/dashboard`:**
- Four big stat tiles in a row: Fraunces 56pt numerals, mono uppercase label below, mono delta (e.g. `▲ +12`).
- Below: **Telemetry stream** — a faux log table (mono), 8 rows visible, with prefix tags `INF` (ink), `WRN` (signal), `ERR` (crit), `TRC` (trace). Static for now; rows can be hardcoded.
- "Danger zone" panel — full-width, 2px crit border, paper-soft background. Three lab links inside.

**`/labs` index:**
- Page header.
- 6 specimen cards, one per lab (errors, tracing, logs, seer, feedback, +1 future). Each card: specimen ID, Fraunces title, italic description, mono "ENTER →" link.

**`/labs/<scenario>` (errors / tracing / logs / seer / feedback):**
- Page header with specimen tag absolute-positioned upper-right: `SPC-EXP-04 / ERRORS`.
- Brief italic Fraunces explanation (`<150 chars`).
- "Specimens" section: numbered tiles vertically stacked. Each tile:
  ```
  ┌──────────────────────────────────────────┐
  │ 01                          SPC-ERR-01   │
  │ THROW IN ONCLICK                         │
  │ Synchronous error inside an event        │
  │ handler. Captured via window.error.      │
  │                                          │
  │ [ TRIGGER ]                              │
  └──────────────────────────────────────────┘
  ```
- Specimen number: huge Fraunces (88pt) in upper-left.
- Title: mono uppercase 14px tracking-wide.
- Description: Fraunces 15pt italic, max-w 60ch.
- Trigger: Lab trigger button.
- After trigger: result block appears below the tile — mono code-block style, ink background paper-soft text, with timestamp + outcome. Persists until next trigger.

**Custom cursor on `/labs/*`:** small crosshair (16×16 SVG embedded via `cursor: url(...)`). Falls back to `crosshair` keyword on browsers that don't load it. Only applied to the `/labs` route group via a CSS class on its layout.

**`/labs/seer` extra:**
- Style as a "case file": top section reads `CASE FILE / 04`, `SUBJECT: Buggy checkout`, `SYMPTOM: TypeError on applyDiscount`, all mono.
- Big amber "DIAGNOSE" button.
- On trigger: shows the full error stack in a mono code-block with each function frame on its own line, function names highlighted in amber.

### 5b.7 Motion

CSS-only (no Motion library — keep deps minimal). Keyframes defined in `globals.css`.

- **Page load cascade**: stagger children of the main content via `animation: fade-rise 480ms ease-out backwards` with `animation-delay` on each child (60ms increments). Implemented as utility classes `.delay-1`, `.delay-2`, etc., or via a wrapper that uses `:nth-child` selectors.
  ```css
  @keyframes fade-rise {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```
- **Amber underline on hover** (links + nav):
  ```css
  .link-underline { background: linear-gradient(var(--color-signal), var(--color-signal)) left bottom / 0 1px no-repeat; transition: background-size 200ms; }
  .link-underline:hover { background-size: 100% 1px; }
  ```
- **Signal flash on lab trigger click** — see §5b.5.
- **Phosphor pulse loading skeleton** — `app/loading.tsx` uses an amber blink:
  ```css
  @keyframes phosphor {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 1; }
  }
  .pulse-phosphor { color: var(--color-signal); animation: phosphor 1.2s ease-in-out infinite; }
  ```
- **Reduced motion**: wrap all keyframes in `@media (prefers-reduced-motion: no-preference)` so the OS setting is respected.

### 5b.8 Iconography & illustration

- **No icon library.** Use 1–2 small inline SVG primitives (a 12px crosshair, a 10px arrow, a 12px chevron). Define them as inline JSX components in `app/components/icons.tsx`.
- **Product illustrations** are deterministic abstract compositions — circle + rect + 1–2 lines — generated from the product id. Implement in `app/components/specimen-glyph.tsx` as a stateless React SVG component taking `{ id: string }` and selecting shapes by hashing the id.

### 5b.9 Accessibility

- All interactive elements meet 4.5:1 contrast (ink on paper = ~16:1, ink on amber = ~6:1, mute on paper = ~5:1).
- Focus states: 2px amber outline with 2px offset, `outline-style: solid`. Never remove focus.
- Form labels are real `<label>` elements; inputs have `aria-describedby` for help text.
- The lab trigger amber-flash respects `prefers-reduced-motion` (becomes an instant fill→fade with no shake).

### 5b.10 What this design is NOT

To prevent drift back toward generic SaaS: do not introduce purple, do not add gradient backgrounds, do not use rounded corners larger than 9999px (pills are fine; chubby `rounded-2xl` cards are not), do not use shadows on cards (use thicker borders instead), do not add Inter / Roboto / Arial fallbacks before Fraunces or JetBrains Mono, do not introduce a third typeface, do not add purple-on-white anywhere.

---

## 6. File inventory

All paths relative to project root: `/Users/saadkhan/Code/sentry/saad-app/`.

### 6.1 Root scaffolding

#### `instrumentation.ts` *(new)*
Empty `register()` stub with TODO. See §3 snippet above. Also include the `onRequestError` TODO comment.

#### `proxy.ts` *(new)*
Adds `x-request-id` header to all matched requests. See §3 snippet above.

#### `next.config.ts` *(modify)*
Keep config object empty. Add a comment marking where `withSentryConfig` will wrap it later:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add Next.js config here.
};

// TODO: when Sentry is wired in, replace `export default nextConfig` with
// `export default withSentryConfig(nextConfig, { org, project, silent: !process.env.CI })`.
export default nextConfig;
```

### 6.2 App shell

#### `app/globals.css` *(modify)*
Replace contents with the design system stylesheet:
- `@import "tailwindcss";` first.
- `@theme` block with all color and font tokens from §5b.1.
- `@media (prefers-color-scheme: dark) { @theme { ... } }` for the dark mode token overrides.
- Body styles: paper background + dot-grid SVG `background-image` (§5b.3), `font-family: var(--font-mono)`, `font-feature-settings: "ss01", "cv11"`.
- All keyframes: `fade-rise`, `signal-flash`, `phosphor`, `marquee`, oscilloscope sweep — each wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Utility classes: `.link-underline`, `.btn-trigger`, `.btn-action`, `.specimen-card`, `.pulse-phosphor`, `.delay-1` … `.delay-6`, `.lab-cursor` (custom SVG crosshair cursor).

Drop the old `--background` / `--foreground` tokens and the `Arial, Helvetica, sans-serif` body fallback completely.

#### `app/components/icons.tsx` *(new)*
Exports tiny stateless SVG components: `Crosshair12`, `ArrowRight10`, `Chevron12`. Each is a 1px-stroke ink SVG with `currentColor` so callers can style via Tailwind `text-*` utilities.

#### `app/components/specimen-glyph.tsx` *(new, server component)*
`<SpecimenGlyph id={string} variant="square"|"portrait" />` — renders a deterministic abstract composition (circle + rect + 1–2 lines) on a paper-soft background, in ink with one amber accent shape. Hashes the id (simple `Array.from(id).reduce(...)`) to pick: shape positions, sizes, rotation. Pure SVG, no images. Used by `/products/page.tsx` and `/products/[id]/page.tsx`.

#### `app/components/page-header.tsx` *(new, server component)*
`<PageHeader number={"04"} total={"06"} path="/labs/errors" title="Errors" subtitle="A field guide to thrown exceptions." />` — renders the standard page header pattern from §5b.4 (`01 / 06 ··· /labs/errors`, then Fraunces title, then italic Fraunces subtitle, then hairline rule). Used on every non-home page.

#### `app/components/specimen-card.tsx` *(new, server component)*
`<SpecimenCard id="SPC-001" title="..." description="..." href="/..." />` — the standard linked specimen tile. Border, hover treatment, specimen ID upper-right, ENTER → arrow lower-right.

#### `app/components/nav.tsx` *(new, client component)*
The top nav extracted from `app/layout.tsx` so it can use `usePathname()` to highlight the active link. Renders the logo + chip on left and the link list on right per §5b.6.

#### `app/components/lab-trigger.tsx` *(new, client component)*
`<LabTrigger onTrigger={() => void} pending?={boolean}>label</LabTrigger>` — wraps the lab trigger button visual + click animation logic. Optional pending state (mono `…` suffix, disabled).

#### `app/layout.tsx` *(modify)*
Replace the entire file. Drop Geist; load Fraunces + JetBrains Mono via `next/font/google` (see §5b.2 snippet). Apply both `variable` classes on `<html>`. Update `metadata` to `{ title: "Sentry Test Lab", description: "Next.js 16 sandbox for testing Sentry features" }`.

Render a sticky 56px top `<nav>`:
- Left: Fraunces "Sentry Test Lab" + small mono `LAB.001` chip (paper background, 1px ink border, 4px padding, mono 11px tracking-wide).
- Right: links Products, Cart, Sign in, Dashboard, Labs (mono uppercase 13px tracking-wide). Active link gets `aria-current="page"` and the amber underline class from §5b.7.
- Use `next/link` for all nav. Detect active link via `usePathname()` (means nav is a small client component imported into the server layout — keep the rest of layout server-side).

After `<nav>`, render `{children}` inside a `<main className="mx-auto max-w-6xl px-6 py-12">` — the notebook gutter is asymmetric, so wrap content with `pl-8 pr-4 lg:pl-16 lg:pr-8` to make the left margin wider than the right.

Add a footer marquee strip per §5b.6 (telemetry tape) — a `<div className="overflow-hidden whitespace-nowrap text-[10px] font-mono opacity-[0.06] py-1 fixed bottom-0 inset-x-0 select-none pointer-events-none">` with `animation: marquee 60s linear infinite` and 30+ hardcoded log lines duplicated twice for seamless loop.

Preserve `body` flex layout (`min-h-full flex flex-col`).

#### `app/page.tsx` *(modify)*
Implement per §5b.6 "Home dashboard":
- Hero (~80vh): stacked Fraunces `TELEMETRY` / `LAB.` (line 2 ends with a period as a visual full-stop), 144pt clamp, line-height 0.85. Below in mono: `// click any specimen to trigger telemetry`.
- 6-tile specimen grid (3 cols × 2 rows, 1 col on mobile). Each tile uses the specimen card pattern (§5b.4) and links to one of: `/products`, `/cart`, `/signin`, `/dashboard`, `/labs`, `/labs/feedback`. Specimen IDs hardcoded (e.g. `SPC-001`, `SPC-002`, …).
- Below the grid: "Sentry features wired here" — a 2-column mono table (no cell borders, just leader dots between cols), mirroring §5.
- Apply the page-load cascade animation (§5b.7) to direct children of `<main>`.

#### `app/error.tsx` *(new)*
Segment-level error boundary. `'use client'`. **Next.js 16 prop signature: `{ error: Error & { digest?: string }, unstable_retry: () => void }`** — note `unstable_retry`, not `reset`. Renders a "specimen failed" card following the design system: thin ink border, paper-soft background, specimen ID `SPC-ERR-RUNTIME` upper-right, Fraunces title `Specimen failed`, mono error message in a code block, mono digest line if present, lab trigger button (§5b.5) labeled `RETRY` whose `onClick` calls `unstable_retry()`. Use design tokens (`--color-paper-soft`, `--color-ink`, `--color-crit` for the border).

#### `app/global-error.tsx` *(new)*
Root error boundary that **renders its own `<html>` and `<body>`** (it replaces the root layout when active). `'use client'`. **Next.js 16 prop signature: `{ error: Error & { digest?: string }, unstable_retry: () => void }`** — same as `error.tsx`. Inline the minimum CSS needed for the lab notebook style — paper background, ink text, mono and Fraunces font-family declarations using system fallbacks (since `next/font` isn't applied here when the layout is bypassed). Show specimen `SPC-ERR-FATAL`, big Fraunces "Application halted", mono error message, a small "RETRY" button calling `unstable_retry()`. Add a TODO comment marking `Sentry.captureException(error)` will go here once wired.

#### `app/not-found.tsx` *(new)*
404 surface in lab notebook style. Centered narrow column. Top: mono `404 / NOT FOUND`. Below: huge Fraunces "Specimen unavailable.". Below: italic Fraunces single-sentence apology. Action: amber-text inline link (with `link-underline` class from §5b.7) "Return to lab →".

#### `app/loading.tsx` *(new)*
Phosphor-pulse skeleton (Suspense boundary). Center a small mono "ACQUIRING SIGNAL …" line with the `pulse-phosphor` class from §5b.7 (amber blink, 1.2s ease-in-out infinite). Below it, a 2px ink hairline + a 1px amber line that grows left→right on a 1.5s `cubic-bezier` over a `width: 0 → 100%` keyframe — feels like an oscilloscope sweep.

### 6.3 Shared lib

#### `lib/store.ts` *(new)*
Server-only module-level state. **First line: `import "server-only";`** (prevents accidental client import).

Exports:
- `type Product = { id: string; name: string; price: number; description: string };`
- `type CartItem = { productId: string; qty: number };`
- `const products: Product[]` — 6 hardcoded products with realistic names, prices, descriptions (e.g. "Acme Wireless Headphones", "ErgoLite Standing Desk", etc.).
- `let cart: CartItem[]` — module-level mutable state.
- `let counters = { orders: 0, errors: 0, signups: 0 }` — for `/dashboard`.
- Functions: `getProduct(id)`, `listProducts()`, `addToCart(productId, qty)`, `setQty(productId, qty)`, `clearCart()`, `getCart()`, `cartTotal()`, `bumpCounter(key)`.

#### `lib/slow.ts` *(new)*
Two helpers:
```ts
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const randomFail = (probability: number) => {
  if (Math.random() < probability) {
    throw new Error("Random failure for testing");
  }
};
```

### 6.4 Demo flow (the polished surface)

#### `app/products/page.tsx` *(new, Server Component)*
Lists products from `lib/store.ts`. Renders a grid of cards. Each card links to `/products/[id]`.

#### `app/products/[id]/page.tsx` *(new, Server Component)*
**Async `params`** (see §3). Calls `notFound()` from `next/navigation` if no match. Renders product detail, includes `<BuyButton productId={id} />` client component.

```tsx
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/store";
import BuyButton from "./buy-button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  // ...render, then <BuyButton productId={product.id} />
}
```

#### `app/products/[id]/buy-button.tsx` *(new, Client Component)*
`'use client'`. A `<form action={addItem}>` submitting via Server Action (imported from `@/app/cart/actions`). Hidden input for `productId`. Submit button "Add to cart". The submit button is its own small child component (e.g. `<SubmitButton />`) so it can call `useFormStatus()` from `react-dom` and disable itself while pending. (Tip: `useFormStatus` only works for the *parent* form, so the hook call must happen *inside* the form, not in the page.)

#### `app/cart/page.tsx` *(new, Server Component)*
Reads `getCart()`, joins with `getProduct()` for names/prices, shows table of line items + total. Renders `<CartForm items={...} />` for editing.

#### `app/cart/cart-form.tsx` *(new, Client Component)*
`'use client'`. Quantity inputs per row (`<input type="number">`) submitting via `setQty` Server Action. A "Checkout" button calling `checkout` Server Action, which on success redirects to `/cart?ok=1`, on failure throws.

**React 19 form patterns to use here:**
- `useFormStatus` from `react-dom` — read inside a button (or a child component of the `<form>`) to get the current `pending` state without prop-drilling. Use this for the disabled/`…` suffix on the Checkout button.
- `useActionState` from `react` (this is the React-19 rename of `useFormState`) — only if we need to surface error messages from the action across submissions. Optional; skip if not needed for the demo.
- Plain `<form action={serverAction}>` — Server Actions are first-class form actions in React 19. No `next/form` import is needed unless we want client-side prefetching, which we don't.

#### `app/cart/actions.ts` *(new)*
First line: `'use server';`. Exports:
- `addItem(formData: FormData)` — parses `productId`, calls `addToCart`, calls `revalidatePath('/cart')`.
- `setQty(formData: FormData)` — parses `productId` + `qty`, validates, calls `setQty`. Throws if qty < 0 (gives a Server Action error path).
- `checkout()` — calls `lib/slow.ts:delay(800)` to simulate work, then `fetch` posts to `/api/checkout` (use `process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'` as base — or use a relative URL via `headers()` to construct it). On success, `bumpCounter('orders')` + `clearCart()` + `revalidatePath('/cart')`. On failure, throw.

#### `app/signin/page.tsx` *(new, Client Component)*
`'use client'`. Email + password form. Submit handler:
- Calls `delay(800)`.
- 50% success: alert "Signed in!", `bumpCounter('signups')` via Server Action.
- 50% failure: throws (caught by `app/error.tsx`).

The password input is `<input type="password">` — Session Replay will mask it automatically.

#### `app/dashboard/page.tsx` *(new, Server Component)*
Stat cards reading from `counters` in `lib/store.ts`: orders, errors, signups. Below the stats, a "Danger zone" panel with three buttons that link to `/labs/errors`, `/labs/tracing`, `/labs/seer` (the panel itself is presentational; the actual triggers live in those lab pages).

### 6.5 `/labs` — Sentry feature exercise gym

#### `app/labs/page.tsx` *(new, Server Component)*
Index page with one section per lab. Each section: heading, 1-paragraph description, `Link` to the lab page, bullet list of "what this exercises in Sentry". This is also the user's reference doc once Sentry is wired in.

#### `app/labs/errors/page.tsx` *(new, Client Component)*
`'use client'`. Buttons:
1. **Throw in onClick** — `onClick={() => { throw new Error("Client onClick error") }}`. This is caught by React's nearest error boundary (`app/error.tsx` will catch via the error boundary mechanism — note: errors thrown synchronously inside event handlers do *not* propagate to React error boundaries by default; they surface via `window.error`. Sentry's browser SDK will capture them via the global handler). Add an explanatory note next to the button.
2. **Throw during render** — toggles a state flag `shouldThrow`; on next render, throws. This *will* be caught by `app/error.tsx`.
3. **Throw in useEffect (unhandled rejection)** — wraps an async function whose Promise rejects; awaited inside a `useEffect` without try/catch.
4. **Server Action throw** — submits a form whose action calls `actions.ts:throwInAction`.
5. **Route handler 500** — `fetch('/api/products?fail=1')`, displays the resulting error.
6. **TypeError variant** — calls `(undefined as any).foo()`, gives Sentry/Seer a different error shape.
7. **Custom AppError class** — defines `class AppError extends Error { constructor(public code: string, msg: string) { super(msg); this.name = "AppError" } }` and throws one with `cause` set to a nested error — gives Seer a richer error to analyze.

#### `app/labs/errors/actions.ts` *(new)*
`'use server';`. Exports `throwInAction()` that calls a 2–3 deep call stack of named helper functions (e.g. `validateInput → applyDiscount → throw`) so the server stack trace is meaningful.

#### `app/labs/tracing/page.tsx` *(new, Client Component)*
`'use client'`. Buttons:
1. **Sequential 3-hop chain** — `fetch('/api/echo', { method: 'POST', body: JSON.stringify({ hops: 3 }) })`. The server route recursively calls itself.
2. **Parallel fetches** — `Promise.all([fetch('/api/slow?ms=300'), ...×5])`. Logs durations.
3. **Slow Server Action** — form submitting `actions.ts:slowWork` which awaits `delay(1500)` and returns. Submit button uses `useFormStatus`.
4. **Custom-span placeholder** — a button calling a function chain with a clear `// TODO: wrap in Sentry.startSpan({ name: "checkoutFlow" }, async () => { ... })` comment.

#### `app/labs/tracing/actions.ts` *(new)*
`'use server';`. Exports `slowWork()`.

#### `app/labs/logs/page.tsx` *(new, Client Component)*
`'use client'`. Buttons that emit `console.info|warn|error` (Sentry logger picks up via integration once configured). Also a form submitting a Server Action that logs server-side with structured fields (`{ orderId, userId, total }`).

#### `app/labs/logs/actions.ts` *(new)*
`'use server';`. Exports `serverLog()` that calls `console.info`/`warn`/`error` plus a planned `Sentry.logger.info(...)` TODO.

#### `app/labs/seer/page.tsx` *(new, Server Component)*
A page with a "Run buggy checkout" button that submits a Server Action. The action calls a chain of well-named functions:
- `parseOrder(input)` → calls
- `validateLineItem(item)` → calls
- `priceOf(productId)` → calls
- `applyDiscount(price, code)` → throws a `TypeError` (e.g. tries to `.toFixed()` on `undefined`) when `code` is malformed.

Function names should be **descriptive and realistic** — Seer reasons better with semantic names. Add JSDoc on each function so source maps later (when Sentry is wired) give Seer richer context.

#### `app/labs/seer/actions.ts` *(new)*
`'use server';`. Exports `runBuggyCheckout()` plus the four helper functions described above.

#### `app/labs/feedback/page.tsx` *(new, Server Component)*
Static page describing where `Sentry.feedbackIntegration()` will mount. Placeholder anchor `<div id="feedback-anchor" />`. One paragraph explanation + a TODO callout.

### 6.6 Route handlers (Web API surface for tracing)

All under `app/api/**/route.ts`. **Use Web `Request`/`Response` APIs**. Export `GET`/`POST` async functions.

#### `app/api/products/route.ts`
`GET`. Parses `request.url`'s `searchParams`. If `fail=1`, return `Response.json({ error: "forced failure" }, { status: 500 })`. Else return `Response.json(listProducts())`.

#### `app/api/echo/route.ts`
`POST`. Reads JSON body `{ hops: number }`. If `hops > 1`, internally `fetch`es itself with `hops - 1` (use `request.nextUrl.origin` or `new URL(request.url).origin`). Returns `{ chain: [...] }` with each level's response. This produces a chained distributed trace.

#### `app/api/slow/route.ts`
`GET`. Reads `?ms=` (default 500). `await delay(ms)`. Returns `{ slept: ms }`.

#### `app/api/checkout/route.ts`
`POST`. Internally `fetch`es `/api/payment`. If payment succeeds: returns `{ ok: true, orderId: crypto.randomUUID() }`. If payment fails: bubbles up the error.

#### `app/api/payment/route.ts`
`POST`. 70% return `{ ok: true }`, 30% throw `new PaymentDeclinedError("Card declined: insufficient funds")` or `new GatewayTimeoutError("Stripe took >5s")` (define these as named classes inside the file). The variety helps Sentry's issue grouping demo.

#### `app/api/log/route.ts`
`POST`. Emits `console.info`/`warn`/`error` with structured payloads. Returns `{ logged: 3 }`.

---

## 7. Implementation order

Strictly follow this order — earlier files are dependencies of later files.

1. **`app/globals.css`** — design tokens, keyframes, utilities. Foundation for every visual.
2. **`lib/store.ts`, `lib/slow.ts`** — used by everything else.
3. **`app/components/*`** in this order: `icons.tsx`, `specimen-glyph.tsx`, `page-header.tsx`, `specimen-card.tsx`, `nav.tsx`, `lab-trigger.tsx`. Visual primitives before pages.
4. **`app/layout.tsx`** (loads Fraunces + JetBrains Mono, wires `<Nav>`, marquee strip).
5. **`app/page.tsx`** — home dashboard.
6. **`app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx`** — error/loading surfaces in place before scenarios that trigger them.
7. **`instrumentation.ts`, `proxy.ts`** — Sentry seam + middleware demo.
8. **All `app/api/**/route.ts`** — needed before tracing/errors labs can call them.
9. **Demo flow pages** — `products/`, `cart/`, `signin/`, `dashboard/`.
10. **`/labs/*` pages last** — depend on everything above.

After each step, run `bun dev` and verify the new surface works before moving on. Run `bun run lint` and check LSP diagnostics after each step too — fix issues before continuing.

---

## 8. Code style guidelines

- **Default to no comments.** Only comment when the *why* is non-obvious (e.g. "Sentry will wrap this later", or a hidden v16 caveat).
- **Don't add error handling for impossible cases.** Trust internal calls. Validate only at boundaries (form input, request body).
- **No `any` unless necessary.** Use `unknown` and narrow.
- **Server-only modules** start with `import "server-only";`.
- **Client components** start with `'use client';`. **Server Action files** start with `'use server';`.
- **Tailwind classes only** — no inline styles, no extra CSS files (the existing `globals.css` is enough).
- **Reuse the existing color palette**: `zinc-*`, `bg-foreground`, `text-background`, `dark:` variants. Don't introduce a new theme.
- **`Link` from `next/link`** for navigation, **`Image` from `next/image`** for images (only existing ones in `/public`).

---

## 9. Verification plan

After all files are written:

1. **Install** — `bun install` (no new deps required by this plan, but lockfile should still be consistent).
2. **Dev server** — `bun dev`, open http://localhost:3000:
   - Home dashboard loads with links to every section.
   - `/products` → grid renders.
   - Click a product → `/products/[id]` loads (this verifies async `params`).
   - Add to cart from product page → `/cart` reflects the item.
   - Adjust quantity, then "Checkout" → success path returns to `/cart`.
   - `/signin` → form renders with masked password input.
   - `/dashboard` → stat cards show updated counters.
3. **`/labs/errors`** — every button trigger fires an error; segment `error.tsx` recovers via "Try again". Test the `global-error.tsx` path by temporarily throwing in `app/layout.tsx` (revert after).
4. **`/labs/tracing`** — open DevTools → Network: 3-hop chain shows three sequential `/api/echo` calls; parallel shows five concurrent.
5. **`/labs/seer`** — confirm thrown error in DevTools console shows the full named-function call stack (`parseOrder → validateLineItem → priceOf → applyDiscount`).
6. **Proxy** — `curl -I http://localhost:3000/` returns an `x-request-id` header.
7. **Build** — `bun run build` (Turbopack production build) succeeds with no `params`/`searchParams` sync-access warnings.
8. **Lint** — `bun run lint` passes.
9. **LSP diagnostics** — clean, no TS errors.
10. **Design fidelity spot-check** (do this manually against §5b):
    - Fraunces loads on the hero (open DevTools → Computed: `font-family` includes `Fraunces`).
    - JetBrains Mono is the body default (computed `font-family` on `<body>` includes `JetBrains Mono`).
    - Dot-grid background is visible on `body` (paper has subtle dots, not solid).
    - Active nav link has the amber underline; hover any link to see it animate left → right.
    - A `/labs/errors` trigger button: hover shows amber underline, click fires the amber-flash animation.
    - `/loading` route (force a slow component) shows the phosphor-pulse "ACQUIRING SIGNAL …".
    - System dark mode flips paper ↔ ink correctly; amber is still visible on both.
    - `prefers-reduced-motion: reduce` (DevTools → Rendering panel) disables the cascade and flash.
    - No purple, no gradient backgrounds, no rounded-2xl card corners anywhere.

---

## 10. What comes next (out of scope here)

After this plan is implemented and verified, the follow-up task is:

1. `bunx @sentry/wizard@latest -i nextjs` — installs `@sentry/nextjs`, generates `sentry.{client,server,edge}.config.ts`, wraps `next.config.ts` with `withSentryConfig`, populates `instrumentation.ts`, and creates the Sentry-flavored `app/global-error.tsx`.
2. Confirm each `/labs/*` page surfaces the matching event in Sentry.
3. Connect the GitHub repo in Sentry org settings to enable Seer.
4. Optionally enable `feedbackIntegration()`, `replayIntegration({ maskAllText: true })`, `enableLogs: true`.

That follow-up is **not part of this plan** — keep the scope tight.

---

## 11. Validation log

Framework claims in this plan were cross-checked against current docs (Next.js v16.2.2 reference, React 19.2, Tailwind v4, Sentry Next.js SDK) on 2026-04-27 via Context7. Confirmed:

- ✅ `proxy.ts` rename (was `middleware.ts`) — runtime is `nodejs` only, cannot be configured. Source: `/vercel/next.js/v16.2.2` `01-app/02-guides/upgrading/version-16.mdx`.
- ✅ Async `params` / `searchParams` — `Promise<...>` types and `await` required. Source: `01-app/03-api-reference/03-file-conventions/dynamic-routes.mdx`.
- ✅ Async `cookies()` / `headers()` from `next/headers` — must be `await`-ed.
- ✅ `instrumentation.ts` at root, exports `register()` + optional `onRequestError()`. Source: `01-app/03-api-reference/03-file-conventions/instrumentation.mdx`.
- ✅ Sentry's pattern is `export const onRequestError = Sentry.captureRequestError;`. Source: Sentry Next.js manual setup.
- ✅ `revalidateTag(tag, profile)` (2 args) — profile is `'max'` or `{ expire?: number }`.
- ✅ `cacheComponents: true` in `next.config.ts` (replaces `experimental_ppr` and `experimental.dynamicIO`). Not used by this plan.
- ✅ ESLint flat config + `eslint .` script (no `next lint`).
- ✅ Tailwind v4 `@import "tailwindcss"` + `@theme { … }` block at top level. **`@theme` cannot be nested inside `@media`** — dark mode tokens go in a `:root` override or via the `dark:` variant.
- ✅ `next/font/google` accepts `axes: string[]` for variable fonts (e.g. `["opsz", "SOFT", "WONK"]` for Fraunces). Source: `01-app/03-api-reference/02-components/font.mdx`.
- ✅ React 19: `useFormStatus` lives in `react-dom`; `useActionState` is the renamed `useFormState`.
- ⚠️ **Next.js 16 changed the `error.tsx` / `global-error.tsx` prop signature**: it is now `{ error, unstable_retry }` (was `{ error, reset }` in Next 14/15). The plan was updated accordingly. Source: `01-app/01-getting-started/10-error-handling.mdx`.
- ℹ️ `next/form` (`<Form action={...}>`) exists for client-side prefetching of form targets, but we use plain `<form action={serverAction}>` here — that is sufficient and idiomatic for this app.

## 12. Open questions

None — all design choices are locked (see §1). If anything below is ambiguous when implementing, choose the simplest option that satisfies the verification plan in §9 and add a short comment explaining the choice.
