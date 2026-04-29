# Sentry Onboarding Lab — Trainee Handout

Welcome to Sentry. This lab is your hands-on way to learn what Sentry does,
how to install it, how to configure it, and how to use it the way our
customers do. The app you'll work with is a small e-commerce site that
already runs end-to-end — your job is to **instrument** it with Sentry,
**configure** Sentry from the UI, and then **use** Sentry to investigate
the problems you've deliberately built into the app.

This handout is written for everyone — Solutions Engineers, Customer
Success Managers, Account Executives, anyone learning Sentry. There is
**one path**, and everyone follows it. If a step looks easy because
you've done something like it before, do it anyway — the next person
you'll teach hasn't done it before, and the lab is also practice for
explaining Sentry to them.

If you get stuck, post in **#onboarding-help** in Slack. §12 has a
four-item template for asking questions that get answered fast.

---

## How to read this handout

A few conventions used throughout. Skim once now, refer back as needed.

- **Sections (`§1`, `§2`, …)** are numbered. The lab runs front to back;
  each step assumes you finished the previous one.
- **`<angle brackets>`** mark a placeholder you replace with a real value.
  When you see `git clone <this-repo-url>`, you don't type the angle
  brackets — you replace `<this-repo-url>` with the actual URL. We'll
  give a concrete example the first time this comes up.
- **`[square brackets in URL paths]`** like `/products/[id]` mean "the
  app fills this in." When you see `/products/[id]`, the actual URL in
  your browser will look like `/products/SPC-001` — `[id]` is the slot,
  `SPC-001` is the value.
- **Backticks** `like this` mark a command, a file name, or a piece of
  code to recognize on the page. **Code blocks** that look like:

  ```bash
  some command
  ```

  are commands you type as-is. Highlight the text, copy it (Cmd+C on
  Mac, Ctrl+C on Windows), paste it into your terminal (Cmd+V / Ctrl+V),
  and press Enter.
- **Stuck on a term?** Every term used here is also defined in §13
  (Reference: Terms) at the end. Jump back any time.
- **Stuck for real?** §12 has a Troubleshooting section *and* a
  template for asking for help in #onboarding-help. Don't suffer in
  silence — every stuck moment is data the lab author wants to fix.

---

## §1 · Welcome and what success looks like

By the end of this lab you will have:

- Caused a fake outage in a working web app, watched yourself break the
  checkout flow on **Session Replay** (§13) (a video-like playback of
  what the user saw and did), and asked **Seer** (§13) (Sentry's AI
  debugger) why a discount calculation crashes. (Developers say a
  function "throws" when it errors out — you'll see that word a lot;
  defined as **Throw** in §13.)
- Stood up a Sentry project, connected GitHub so Seer can read source
  code, and written one alert rule that emails you the moment a new
  error appears.
- Looked at a real distributed **trace** (§13) (the timeline of one
  request's trip through your services) and named the slow part
  yourself.
- Submitted feedback through the floating user-feedback widget and
  watched it land in Sentry.

It should take about 2–3 hours of focused time, more if it's your first
time in a terminal. None of it is graded. The goal is fluency — by the
end you'll be able to demo Sentry to a customer with confidence,
because you'll have stood every piece up yourself.

---

## §2 · The three pillars of this lab

The lab is structured around the three things a Sentry user actually
does. Each pillar is one or more sections of this handout.

1. **Instrument.** Install the **SDK** (§13) (the small library that
   watches your app and sends events to Sentry) into a Next.js
   application.
   Connect each lab page so it sends the matching kind of event to
   Sentry — errors, traces, logs, replays, metrics, user feedback, and
   stack traces Seer can read. Covered in §4 (run the app), §5
   (wizard), §6 (first event), §7 (wiring the SDK), §8 (per-lab
   walkthroughs).
2. **Configure.** Sign in to Sentry, set up your project the way a
   customer would, connect GitHub so Seer can analyze source code,
   write one alert rule, choose a sampling strategy. Covered in §9.
3. **Use.** Open an issue and triage it. Walk a trace. Watch a replay.
   Run Seer on a real bug. Submit user feedback. Covered in §10.

---

## §3 · Prerequisites

Before you start, work through this short pre-flight checklist. Then
install the tools and create the accounts listed below.

### Pre-flight checklist

- [ ] Your laptop's operating system is up to date (macOS or Windows).
- [ ] You have administrator rights — you can install applications
      without IT approval. If not, ping IT now; this often takes a day.
- [ ] You know the email address tied to your GitHub account.
- [ ] Your manager has shared the **lab repo URL** with you (a GitHub
      link like `https://github.com/your-org/saad-app.git`). Save it
      somewhere you can paste from.

### Tools to install

- **A code editor.** This is the program you'll use to view and change
  the app's files. **VS Code** (free, from Microsoft) is the easiest
  choice — install it from <https://code.visualstudio.com/>.
- **Node.js** version 20 or newer. Node.js is the **runtime** that runs
  the lab app on your computer. Install from <https://nodejs.org/> —
  pick the "LTS" download. After installing, open a terminal (see §3.5
  below) and type `node -v`, then press Enter. You should see something
  like `v20.10.0`. The first number after the `v` should be **20 or
  larger** — `v22.5.0` is fine, `v18.20.0` is not.
- **Git.** Git is how we copy the lab code from GitHub onto your
  computer. Install from <https://git-scm.com/downloads>. Verify by
  typing `git --version` in a terminal.
  - **macOS first-run note:** the very first time you run `git` in
    Terminal, macOS may pop up a "Command Line Developer Tools"
    install prompt. Click **Install**, wait 5–10 minutes for it to
    finish, then close and reopen Terminal. This is normal and only
    happens once.

### Accounts to create

- **A Sentry account.** Sign up for a free trial at
  <https://sentry.io/>. When asked, create a new organization (or join
  your team's existing one) — your manager can tell you which.
- **A GitHub account.** You'll use it later in §9 so Seer can read
  source code from this repo. Sign up at <https://github.com/> if you
  don't have one already.
  - **Authenticate Git on your laptop:** the simplest path for
    non-technical readers is to install **GitHub Desktop** from
    <https://desktop.github.com/> and sign in once. That single step
    wires authentication for every `git clone` you'll run from
    Terminal — no SSH keys or tokens to manage.

---

## §3.5 · Terminal 101

If you've never used a terminal before, this short section is for you.
The terminal is a window where you type commands. It's plain text,
which makes it intimidating, but the rules are simple.

### Opening a terminal

- **macOS.** Open **Spotlight** (Cmd+Space), type "Terminal," press
  Enter. The Terminal app opens.
- **Windows.** Click the Start menu, type "PowerShell," press Enter.
  PowerShell opens.

You'll see something like `your-name@your-laptop ~ %` (Mac) or
`PS C:\Users\your-name>` (Windows). That's the **prompt** — it's
waiting for you to type a command.

### Typing and running a command

1. Click into the terminal window so it has focus.
2. Type the command, or paste it. To paste from this handout: highlight
   the command in your browser, copy with Cmd+C (Mac) / Ctrl+C
   (Windows), click into the terminal, paste with Cmd+V / Ctrl+V.
3. Press **Enter**. The terminal runs the command and prints any
   output below.

If a command runs but doesn't seem to print anything, that's normal —
some commands only speak when they fail.

### Stopping a running command

Some commands keep running until you stop them (the dev server in §4 is
one). To stop the **currently-running** command, press **Ctrl+C** —
that's Ctrl+C on both Mac and Windows (not Cmd+C). The prompt comes
back; you can type the next command.

### Opening a second terminal window

You'll need this in §5. The dev server runs in one terminal; the wizard
runs in another at the same time.

- **macOS.** With Terminal active, press **Cmd+T** to open a new tab.
  The first tab keeps running the dev server; the new tab is empty and
  ready for the next command.
- **Windows.** Open a second PowerShell window from the Start menu.
  Don't close the first one.

### Opening a file in VS Code

You'll be asked to "open `app/global-error.tsx`" in §7 and §8. Here's
how:

1. Open **VS Code**.
2. **File → Open Folder**. Navigate to the `saad-app` folder you
   downloaded. Click **Open**.
3. The **file tree** appears on the left side of VS Code. Click
   folders to expand them, click files to open them. The file
   `app/global-error.tsx` lives at: `app` (folder) → `global-error.tsx`
   (file).
4. To search for a file by name, press **Cmd+P** (Mac) / **Ctrl+P**
   (Windows), type the filename, press Enter.
5. To find text inside a file, press **Cmd+F** / **Ctrl+F** and type
   what you're looking for (e.g., `TODO`).

That's everything you need from a terminal and VS Code for this lab.
The rest is in the steps below.

---

## §4 · Step 1 — Get the app running and tour it (no Sentry yet)

> **Pillar: Instrument.** This step gets the app running on your
> computer so you can see what Sentry will be watching.

Before you instrument the app you need to see what's in it. The whole
point of Sentry is to watch a *running* application, so let's start
that application first and click around.

### 4.1 — Get the code

Open a terminal (§3.5 if you need a refresher). Type these three
commands one at a time, pressing Enter after each:

```bash
cd ~/Documents
git clone <this-repo-url>
cd saad-app
```

`cd ~/Documents` puts the lab folder somewhere Finder can find it
later (Documents → saad-app). On Windows, replace it with
`cd %USERPROFILE%\Documents`.

Replace `<this-repo-url>` with the actual URL your manager gave you.
For example, if your manager gave you
`https://github.com/your-org/saad-app.git`, your three commands are:

```bash
cd ~/Documents
git clone https://github.com/your-org/saad-app.git
cd saad-app
```

The `cd` command (short for "change directory") moves you into the
freshly-downloaded folder. Every command after this needs to run from
inside `saad-app/` — if you close the terminal and open a new one,
`cd` back into it first.

### 4.2 — Install dependencies

```bash
npm install
```

`npm` is Node's **package manager** — it downloads the libraries the
app needs into a folder called `node_modules`. The first run takes
30–60 seconds. You'll see a lot of text scroll by.

**What success looks like:** the very last lines look something like:

```
added 412 packages, and audited 413 packages in 38s

found 0 vulnerabilities
```

The exact numbers vary; what matters is "added N packages" and that no
lines start with `npm error`. If you see `npm error`, jump to §12
(Troubleshooting).

### 4.3 — Start the dev server

```bash
npm run dev
```

After a few seconds you'll see output like:

```
   ▲ Next.js 16.2.4 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 1.4s
```

The `▲ Next.js` line is Next.js's logo; the `✓ Ready` line is your
green light. Open <http://localhost:3000> in your browser.
`localhost:3000` means "this very computer, port 3000" — the app is
only running for you, not on the internet. **Leave this terminal
running** for the rest of the lab; closing it stops the app.

### 4.4 — Tour the demo flow

Click through the app once before changing anything. This is the path
real customers' apps look like.

1. **`/`** — the home page (in your browser, just `http://localhost:3000`).
   Click any tile.
2. **`/products`** — three product cards. Click one.
3. **`/products/[id]`** — a product page. The URL in your browser will
   show the actual product ID (e.g., `/products/SPC-001`). Click
   `ADD TO SPECIMEN CART`.
4. **`/cart`** — the cart. Bump the quantity with the `+` and `−`
   buttons. Click `CHECKOUT`. You'll see an order receipt.
5. **`/signin`** — try `AUTHENTICATE` once or twice. The form is
   pre-filled. The result is a 50/50 success/failure on each click —
   that's intentional, so once Sentry is wired the failures will become
   real error events.
6. **`/dashboard`** — counters that move (orders, signups, errors).

### 4.5 — Tour the labs

Each `/labs/...` page is a list of "specimens" — tiles with `TRIGGER`
buttons that intentionally fire something Sentry should capture. Click
a few. Right now nothing reaches Sentry because you haven't installed
the SDK yet — that's what §5 is about.

- **`/labs/errors`** — seven different ways to throw an error.
- **`/labs/tracing`** — four different patterns of HTTP request fan-out.
- **`/labs/logs`** — three log levels, both client and server.
- **`/labs/seer`** — one deep, named call chain that throws on purpose.
- **`/labs/feedback`** — placeholder for the feedback widget.
- **`/labs/metrics`** — counters, gauges, distributions.

---

## §5 · Step 2 — Run the wizard

> **Pillar: Instrument.** The wizard installs the SDK and writes the
> basic configuration so you don't have to.

The Sentry **wizard** is a one-command installer that asks you a few
questions, then writes the basic configuration for you. It saves you
about an hour of copy-paste from the docs.

You need a **second terminal** because the dev server from §4.3 is
still running in the first one. Don't close that one.

- **macOS.** With Terminal active, press **Cmd+T** to open a new tab.
- **Windows.** Open a new PowerShell window from the Start menu.

In the new terminal, `cd` into the same folder (`cd saad-app` from
wherever you cloned), then run:

```bash
npx @sentry/wizard@latest -i nextjs
```

`npx` runs a command from the npm registry without permanently
installing it. `@sentry/wizard@latest` says "use the most recent
version of the Sentry wizard," and `-i nextjs` says "for a Next.js app."

### What the wizard will ask you

The wizard asks you about five things in the terminal. Each prompt
appears as a line of text — press the matching key on your keyboard
and Enter (or use arrow keys to choose, then Enter, depending on the
prompt). Here's what each one means.

1. **`Are you using Sentry SaaS or self-hosted Sentry?`** Use arrow
   keys to highlight **SaaS**, press Enter — unless your manager has
   told you to use a self-hosted Sentry instance.
2. **`Please log in.`** The wizard opens your browser to sentry.io.
   Log in there, then come back to the terminal.
3. **`Which organization / project?`** Pick the one you created in §3,
   or let the wizard create one for you. The wizard handles the
   project's **DSN** (§13) (Data Source Name — a URL Sentry generates
   that tells the SDK where to send events) automatically.
4. **`Do you want to upload source maps? (Y/n)`** Press `y` and Enter
   (or just Enter — capital `Y` is the default). **Source maps**
   (§13) make stack traces show readable function names instead of
   minified gibberish like `f1.a.b` — absolutely worth enabling.
5. **`Tracing? Replay? Logs?`** The wizard asks about each feature
   separately. Say **yes** to all three for this lab.

The wizard will print progress lines as it works. **What success
looks like** at the end:

```
✓ Successfully installed the Sentry Next.js SDK!
✓ Created sentry.server.config.ts
✓ Created sentry.edge.config.ts
✓ Created instrumentation-client.ts
✓ Updated instrumentation.ts
✓ Updated next.config.ts
✓ Updated app/global-error.tsx
✓ Created .env.sentry-build-plugin

Sentry has been successfully configured for your Next.js project.
```

The wizard also drops a `/sentry-example-page` route and an
`/api/sentry-example-api` route handler. They're a smoke test — you
can leave them in (handy if you want to verify the SDK independently
of `/labs/errors`) or delete them once you've finished §6.

The exact line wording can vary slightly between wizard versions, but
you should see roughly seven `✓` checkmarks and a final "successfully
configured" line. If you see a red `✗` or an error stack, jump to §12.

### What the wizard just did

You don't need to read every generated file yet — §7 walks you through
them. For now, know that the wizard:

1. Installed `@sentry/nextjs` (you'll see it in `package.json` now).
2. Generated five new files in your project that wire the SDK into
   the browser, the server, and Next.js itself.
3. Updated `instrumentation.ts`, `next.config.ts`, and
   `app/global-error.tsx` (existing files in your project).
4. Dropped a `.env.sentry-build-plugin` file in your project root with
   an authentication token. **Do not commit that file** — `.gitignore`
   already excludes it.

### Restart the app

The new SDK code only loads on a fresh start. In your **first
terminal** (the one running the dev server), press **Ctrl+C** to stop
it, then run `npm run dev` again. Wait for the
`Local: http://localhost:3000` line.

---

## §6 · Step 3 — See your first event in Sentry

> **Pillar: Instrument.** A motivational beat — confirm that events
> actually flow before you wire anything else.

Make sure events actually reach Sentry before you spend an hour wiring
the rest.

1. With the dev server running, go to
   **<http://localhost:3000/labs/errors>** in your browser.
2. Click `TRIGGER` on **SPC-ERR-01** (the first specimen — it's the
   simplest: a click handler that throws).
3. Open <https://sentry.io/> in another browser tab. Go to **Issues**
   in the left navigation. Within 5–30 seconds, a new **issue** (§13)
   (Sentry's word for a group of similar events) should appear. The
   title may vary slightly based on Sentry version, but as long as a
   new entry shows up that wasn't there a minute ago, you're good.

If nothing shows up, jump to §12 (Troubleshooting) — most often it's a
project mismatch or the dev server needed a restart after the wizard.

---

## §7 · Step 4 — Wiring the SDK (the TODO seam)

> **Pillar: Instrument.** The wizard handled initialization. This step
> handles every place *your* code needs to call the SDK directly.

The wizard handles initialization. Anywhere the SDK needs to be called
from *your* code — wrapping a Server Action, capturing an exception
in a catch block, naming a custom span — has been pre-marked with a
`// TODO` comment. To list every place those comments live, run this
from inside the `saad-app` folder:

```bash
rg -n "TODO" .
```

(`rg` is **ripgrep**, a fast file search. If you don't have it,
`grep -rn "TODO" .` works too.)

You'll see a list of files. Each row in the table further down maps a
file to what you'll add and which lab page it powers.

### How to fill in one TODO — a worked example

Before the table, walk through one TODO end-to-end so the rest are
muscle memory. The simplest one is in `app/global-error.tsx`. Five
steps:

**1. Open the project in VS Code.** Launch VS Code → **File → Open
Folder** → navigate to your `saad-app` folder → click **Open**. The
**file tree** appears on the left.

**2. Find the file.** In the file tree, click `app` to expand the
folder, then click `global-error.tsx`. The file opens in the editor on
the right.

**3. Find the TODO.** Press **Cmd+F** (Mac) / **Ctrl+F** (Windows),
type `TODO`, press Enter. VS Code highlights the matching line. You'll
see something like:

```ts
// TODO: capture the error to Sentry here once the SDK is wired:
//   useEffect(() => { Sentry.captureException(error); }, [error]);
```

The two `//` lines are **comments** — they look like instructions
because they are. The pattern in this lab: the TODO comment shows the
exact code to add, just commented out.

**4. Replace the TODO and add two imports.** Two changes go in this
file: turn the example code into real code, and add two imports at
the top.

First the imports. Scroll to the very top of `app/global-error.tsx`.
You should see one line:

```ts
"use client";
```

Add a blank line, then two `import` lines below it, so the top of
the file looks like this:

```ts
"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
```

(`useEffect` is a function React provides for running code when an
error appears. `Sentry` is the SDK you just installed.)

Then scroll back down to the TODO. Change it from this **before**:

```ts
// TODO: capture the error to Sentry here once the SDK is wired:
//   useEffect(() => { Sentry.captureException(error); }, [error]);
```

to this **after**:

```ts
useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

(VS Code may underline `useEffect` or `Sentry` in red until you save
— that's normal; the underlines go away once everything's wired.)

**5. Save.** Press **Cmd+S** (Mac) / **Ctrl+S** (Windows). The dev
server in your first terminal will reload automatically — you'll see
new lines scroll by. The TODO is done.

That's the pattern for every row in the table below: **find the file →
find the TODO → replace it with the code shown → save**. Some changes
are more elaborate (Server Action wrapping; the custom span in
`/labs/tracing`), but the workflow is the same.

### What the wizard already wrote (read these first)

- **`instrumentation.ts`** — the `register()` body now imports the
  right runtime config; the `onRequestError = Sentry.captureRequestError`
  export catches Server Component and Route Handler errors. Read it;
  don't touch.
- **`instrumentation-client.ts`** — initializes the SDK in the
  browser. The `onRouterTransitionStart = Sentry.captureRouterTransitionStart`
  export produces spans for client-side App Router navigation. Don't
  delete that export; if you do, page-to-page transitions stop
  appearing in traces.
- **`sentry.server.config.ts` / `sentry.edge.config.ts`** —
  initializes the SDK on Next.js's two server runtimes (Node and Edge).
- **`next.config.ts`** — now wrapped in `withSentryConfig(...)`. The
  options the wizard adds (`org`, `project`, `tunnelRoute`,
  `widenClientFileUpload`) are worth reading once.

### What you still need to wire — overview

Nine files need TODO replacements. Each gets its own before/after
below. Work top to bottom. The wizard already handled
`instrumentation.ts` and `next.config.ts`; you don't touch those.

| # | File | Powers |
|---|---|---|
| 1 | `app/global-error.tsx` | Root-layout failures (already done in worked example above) |
| 2 | `app/labs/seer/actions.ts` | `/labs/seer` Seer analysis |
| 3 | `app/labs/tracing/page.tsx` (SPC-TRC-04) | `/labs/tracing` custom span |
| 4 | `app/labs/logs/page.tsx` | `/labs/logs` client logs |
| 5 | `app/labs/logs/actions.ts` | `/labs/logs` server logs |
| 6 | `app/labs/metrics/page.tsx` | `/labs/metrics` SPC-MET-01..03, 05 |
| 7 | `app/labs/metrics/actions.ts` | `/labs/metrics` SPC-MET-04 |
| 8 | `lib/metrics.ts` | All Server Action labs (lab_trigger metric + flush) |
| 9 | `app/components/lab-trigger.tsx` | All client-trigger labs (lab_trigger metric) |
| 10 | Server Action wrapping in 4 files | Server Action labs (`/labs/{tracing,logs,seer,metrics}`) |

### 1 · `app/global-error.tsx`

Already done in the worked example (§7's "How to fill in one TODO").
Confirm the `useEffect` block is in place and the two imports are at
the top. Move on.

### 2 · `app/labs/seer/actions.ts` — capture an exception

**Add the Sentry import.** At the top of the file, right under
`"use server";`:

```ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { withLabMetric } from "@/lib/metrics";
```

(The `withLabMetric` line was already there; just add the
`import * as Sentry` line above it.)

**Find the TODO** inside the `catch` block and change this **before**:

```ts
} catch (err) {
  const e = err as Error;
  // TODO: report this exception to Sentry so Seer can analyze it:
  //   Sentry.captureException(e);
  return {
    ok: false,
    name: e.name,
```

to this **after**:

```ts
} catch (err) {
  const e = err as Error;
  Sentry.captureException(e);
  return {
    ok: false,
    name: e.name,
```

Save.

### 3 · `app/labs/tracing/page.tsx` — wrap fetches in a custom span

**Add the Sentry import.** At the top of the file, after the other
`import` lines:

```ts
import * as Sentry from "@sentry/nextjs";
```

**Find the TODO** inside the SPC-TRC-04 specimen's `onClickAction`.
Change this **before**:

```ts
onClickAction={async () => {
  setBusy("SPC-TRC-04");
  // TODO: wrap in Sentry.startSpan({ name: "checkoutFlow" }, async () => { ... })
  const t0 = performance.now();
  await fetch("/api/slow?ms=120");
  await fetch("/api/echo", { /* ... */ });
  await fetch("/api/slow?ms=80");
  const ms = Math.round(performance.now() - t0);
  // ...
}}
```

to this **after**:

```ts
onClickAction={async () => {
  setBusy("SPC-TRC-04");
  const t0 = performance.now();
  await Sentry.startSpan(
    { name: "checkoutFlow", op: "function" },
    async () => {
      await fetch("/api/slow?ms=120");
      await fetch("/api/echo", { /* ... */ });
      await fetch("/api/slow?ms=80");
    },
  );
  const ms = Math.round(performance.now() - t0);
  // ...
}}
```

The three fetches now live inside the `Sentry.startSpan` callback.
Save.

### 4 · `app/labs/logs/page.tsx` — replace three client `console` calls with `Sentry.logger`

**Add the Sentry import.** Near the other imports at the top:

```ts
import * as Sentry from "@sentry/nextjs";
```

**Find the three TODOs.** Each specimen has one `console.*` call to
swap. Three changes, one per specimen:

**SPC-LOG-01.** Change `console.info(...)` to `Sentry.logger.info(...)`:

```ts
// before
console.info("client.log.info", { route: "/labs/logs", level: "info", at: new Date().toISOString() });

// after
Sentry.logger.info("client.log.info", { route: "/labs/logs", level: "info", at: new Date().toISOString() });
```

**SPC-LOG-02.** Change `console.warn(...)` to `Sentry.logger.warn(...)`:

```ts
// before
console.warn("client.log.warn", { route: "/labs/logs", level: "warn", reason: "rate=487ms" });

// after
Sentry.logger.warn("client.log.warn", { route: "/labs/logs", level: "warn", reason: "rate=487ms" });
```

**SPC-LOG-03.** Change `console.error(...)` to
`Sentry.logger.error(...)`:

```ts
// before
console.error("client.log.error", { route: "/labs/logs", level: "error", reason: "auth-token-expired" });

// after
Sentry.logger.error("client.log.error", { route: "/labs/logs", level: "error", reason: "auth-token-expired" });
```

The pattern in every case: only the function name on the left of `(`
changes — `console` becomes `Sentry.logger`. Everything inside the
parens stays the same.

### 5 · `app/labs/logs/actions.ts` — replace three server `console` calls

**Add the Sentry import.** At the top, under `"use server"`:

```ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { withLabMetric } from "@/lib/metrics";
```

**Find the three `console.*` lines** inside the `serverLog` function
body. Change all three at once. **Before:**

```ts
console.info("server.log.info", fields);
console.warn("server.log.warn", { ...fields, reason: "soft-budget-exceeded" });
console.error("server.log.error", { ...fields, reason: "kafka-lag" });

// TODO: when Sentry is wired in, replace with Sentry.logger.{info,warn,error}("message", { ...fields }).
```

**After** (delete the TODO comment too):

```ts
Sentry.logger.info("server.log.info", fields);
Sentry.logger.warn("server.log.warn", { ...fields, reason: "soft-budget-exceeded" });
Sentry.logger.error("server.log.error", { ...fields, reason: "kafka-lag" });
```

### 6 · `app/labs/metrics/page.tsx` — count, gauge, distribution

**Add the Sentry import** near the other imports at the top:

```ts
import * as Sentry from "@sentry/nextjs";
```

There are four TODOs in this file, one per specimen. Each one shows
the exact call to add — uncomment it (delete the leading `// `) and
the line becomes real code.

**SPC-MET-01.** **Before:**

```ts
const next = countState + 1;
setCountState(next);
// TODO: Sentry.metrics.count("metrics_demo_count", 1, { attributes: { kind: "manual" } });
```

**After:**

```ts
const next = countState + 1;
setCountState(next);
Sentry.metrics.count("metrics_demo_count", 1, { attributes: { kind: "manual" } });
```

**SPC-MET-02.** **Before:**

```ts
const value = Math.floor(Math.random() * 100);
// TODO: Sentry.metrics.gauge("metrics_demo_gauge", value);
```

**After:**

```ts
const value = Math.floor(Math.random() * 100);
Sentry.metrics.gauge("metrics_demo_gauge", value);
```

**SPC-MET-03.** **Before:**

```ts
const ms = 50 + Math.random() * 450;
// TODO: Sentry.metrics.distribution("metrics_demo_distribution", ms, { unit: "millisecond" });
```

**After:**

```ts
const ms = 50 + Math.random() * 450;
Sentry.metrics.distribution("metrics_demo_distribution", ms, { unit: "millisecond" });
```

**SPC-MET-05.** This one spans a few lines. **Before:**

```ts
const ms = 50 + Math.random() * 450;
// TODO: Sentry.metrics.distribution("metrics_demo_distribution", ms, {
//   unit: "millisecond",
//   attributes: { region, tier, page },
// });
```

**After:**

```ts
const ms = 50 + Math.random() * 450;
Sentry.metrics.distribution("metrics_demo_distribution", ms, {
  unit: "millisecond",
  attributes: { region, tier, page },
});
```

### 7 · `app/labs/metrics/actions.ts` — server-side count

**Add the Sentry import** under `"use server"`:

```ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { withLabMetric } from "@/lib/metrics";
```

**Find the TODO** inside `recordServerCount`. **Before:**

```ts
async (): Promise<ServerCountResult> => {
  // TODO: Sentry.metrics.count("metrics_demo_count", 1, { attributes: { runtime: "server" } });
  return { ok: true, t: Date.now() };
},
```

**After:**

```ts
async (): Promise<ServerCountResult> => {
  Sentry.metrics.count("metrics_demo_count", 1, { attributes: { runtime: "server" } });
  return { ok: true, t: Date.now() };
},
```

### 8 · `lib/metrics.ts` — `withLabMetric` wrapper

This file has two TODOs — one at the start of the wrapped function
and one in the `finally` block.

**Add the Sentry import** at the top:

```ts
import "server-only";
import * as Sentry from "@sentry/nextjs";
```

**Find both TODOs.** **Before:**

```ts
return async (...args: TArgs): Promise<TResult> => {
  // TODO: emit a Sentry metric for this Server Action invocation, e.g.
  //   Sentry.metrics.count("lab_trigger", 1, {
  //     attributes: { lab, specimen, runtime: "server" },
  //   });
  void lab;
  void specimen;
  try {
    return await fn(...args);
  } finally {
    // TODO: await Sentry.flush(2000) so the metric ships before the
    // serverless function exits.
  }
};
```

**After** (delete the `void lab; void specimen;` lines too — those
were placeholders so the unused variables didn't warn; now they're
used):

```ts
return async (...args: TArgs): Promise<TResult> => {
  Sentry.metrics.count("lab_trigger", 1, {
    attributes: { lab, specimen, runtime: "server" },
  });
  try {
    return await fn(...args);
  } finally {
    await Sentry.flush(2000);
  }
};
```

The `flush` matters when the lab runs on a serverless host (Vercel,
Lambda, Cloudflare Workers): the function process can terminate
before the SDK's background transport drains the metric buffer, and
you'd lose the last few samples without it. On long-lived Node
servers (`npm run dev`, `npm start`), the background transport
drains on its own and the flush is a no-op — keep it anyway so the
same code works on either.

### 9 · `app/components/lab-trigger.tsx` — client-side `lab_trigger`

**Add the Sentry import** near the other imports:

```ts
import * as Sentry from "@sentry/nextjs";
```

**Find the TODO** inside `handleClick`. **Before:**

```ts
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // TODO: emit a Sentry client metric here, e.g.
  //   if (lab && specimen) {
  //     Sentry.metrics.count("lab_trigger", 1, {
  //       attributes: { lab, specimen, runtime: "client" },
  //     });
  //   }
  void lab;
  void specimen;
  onClickAction?.(event);
};
```

**After** (drop the `void lab; void specimen;` lines):

```ts
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  if (lab && specimen) {
    Sentry.metrics.count("lab_trigger", 1, {
      attributes: { lab, specimen, runtime: "client" },
    });
  }
  onClickAction?.(event);
};
```

### 10 · Server Action wrapping (four files)

`"use server"` functions don't auto-instrument under Next.js's two
bundlers, so you have to wrap each one by hand. The same shape
applies to four files; each file's example is shown explicitly below
so you don't have to pattern-match.

The pattern in every case:

1. Add two new imports at the top of the file.
2. Wrap the function body in `Sentry.withServerActionInstrumentation(...)`.
3. For form-driven actions (Files A and B below — invoked from
   `<form action={...}>` directly), add `formData: FormData` to the
   signature and pass `formData` into the instrumentation options.
4. For programmatic actions wrapped by `useActionState` (Files C and
   D below — invoked from a closure that passes no arguments), keep
   the signature unchanged and omit `formData` from the options.
   `formData` is optional; the action still becomes a named span.

**File A · `app/labs/tracing/actions.ts`.** This file already exists
with a `slowWork` Server Action. **Before:**

```ts
"use server";

import { withLabMetric } from "@/lib/metrics";

export const slowWork = withLabMetric(
  "tracing",
  "SPC-TRC-03",
  async (): Promise<void> => {
    await delay(1500);
  },
);
```

**After:**

```ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { withLabMetric } from "@/lib/metrics";

export const slowWork = withLabMetric(
  "tracing",
  "SPC-TRC-03",
  async (formData: FormData): Promise<void> => {
    return Sentry.withServerActionInstrumentation(
      "slowWork",
      {
        headers: await headers(),
        formData,
        recordResponse: true,
      },
      async () => {
        await delay(1500);
      },
    );
  },
);
```

**File B · `app/labs/logs/actions.ts`** (the `serverLog` action you
just edited in step 5). Wrap the body the same way:

```ts
export const serverLog = withLabMetric(
  "logs",
  "SPC-LOG-04",
  async (formData: FormData): Promise<void> => {
    return Sentry.withServerActionInstrumentation(
      "serverLog",
      {
        headers: await headers(),
        formData,
        recordResponse: true,
      },
      async () => {
        const fields = {
          orderId: String(formData.get("orderId") ?? "ord_test"),
          userId: String(formData.get("userId") ?? "usr_anon"),
          total: Number(formData.get("total") ?? 0),
          at: new Date().toISOString(),
        };
        Sentry.logger.info("server.log.info", fields);
        Sentry.logger.warn("server.log.warn", { ...fields, reason: "soft-budget-exceeded" });
        Sentry.logger.error("server.log.error", { ...fields, reason: "kafka-lag" });
      },
    );
  },
);
```

(Don't forget the matching `import { headers } from "next/headers";`
import at the top — same as File A.)

**File C · `app/labs/seer/actions.ts`** (the `runBuggyCheckout`
action you edited in step 2). Wrap `runBuggyCheckout` the same way:

```ts
export const runBuggyCheckout = withLabMetric(
  "seer",
  "SPC-SEE-01",
  async (): Promise<SeerResult> => {
    return Sentry.withServerActionInstrumentation(
      "runBuggyCheckout",
      {
        headers: await headers(),
        recordResponse: true,
      },
      async () => {
        try {
          const totals = parseOrder({
            lineItems: [{ productId: "missing", code: "SUMMER10" }],
          });
          return { ok: true, lineItems: totals.length, total: totals.reduce((a, b) => a + b, 0) };
        } catch (err) {
          const e = err as Error;
          Sentry.captureException(e);
          return {
            ok: false,
            name: e.name,
            message: e.message,
            frames: (e.stack ?? "no stack").split("\n").slice(0, 14),
          };
        }
      },
    );
  },
);
```

(Add `import { headers } from "next/headers";` at the top, same as
the others.)

**File D · `app/labs/metrics/actions.ts`** (the `recordServerCount`
action from step 7):

```ts
export const recordServerCount = withLabMetric(
  "metrics",
  "SPC-MET-04",
  async (): Promise<ServerCountResult> => {
    return Sentry.withServerActionInstrumentation(
      "recordServerCount",
      {
        headers: await headers(),
        recordResponse: true,
      },
      async () => {
        Sentry.metrics.count("metrics_demo_count", 1, { attributes: { runtime: "server" } });
        return { ok: true, t: Date.now() };
      },
    );
  },
);
```

(Add `import { headers } from "next/headers";` at the top.)

Once all four are wrapped, every Server Action in the lab is a named
Sentry transaction with attached form data and recorded responses.

### §7 self-check — are you done?

When you've finished filling in TODOs, run the same search again from
the project root:

```bash
rg -n "// TODO" app lib
```

You should see no results in the code files listed in the table
above (`app/labs/*`, `lib/metrics.ts`, `app/components/lab-trigger.tsx`,
`app/global-error.tsx`). One TODO comment in
`app/labs/feedback/page.tsx` is documentation, not code — leaving it
is fine. Anything else, go back and finish wiring it.

---

## §8 · Step 5 — Per-lab walkthroughs

> **Pillar: Instrument.** This is where you finish wiring each
> Sentry feature into its lab page and confirm it lands in Sentry.

Each lab has the same shape: a customer scenario, what you see in the
app, what you change in code, what to verify in Sentry, and what
you've learned. Work through them in order; later labs assume you
wired earlier ones.

### `/labs/errors`

**Customer scenario.** A customer says: "Our checkout sometimes
crashes and we can't reproduce it. We have no idea where the error
came from." This lab gives you seven different shapes of error that a
real app emits, so you can see what each one looks like in Sentry.

**What you see in the app.** Seven specimen tiles, each with a
`TRIGGER` button:

- **SPC-ERR-01** — synchronous throw inside a click handler. React
  error boundaries don't catch this; the SDK's global handler does.
- **SPC-ERR-02** — render-phase throw caught by the segment error
  boundary at `app/error.tsx`.
- **SPC-ERR-03** — unhandled promise rejection inside `useEffect`.
- **SPC-ERR-04** — Server Action throws on the server; round-trips
  back to `app/error.tsx`.
- **SPC-ERR-05** — Route Handler returns a 500 from
  `/api/products?fail=1`.
- **SPC-ERR-06** — `TypeError` (calling a method on `undefined`).
- **SPC-ERR-07** — custom `AppError` subclass with a nested `cause`.

**What you change in code.** The wizard already covers `Sentry.init()`
for client + server + edge, so most events auto-capture once the SDK
is installed. You already opened `app/global-error.tsx` in §7's worked
example — that handles root-layout failures.

**Verify in Sentry.** A **fingerprint** (§13) is the rule Sentry
uses to decide which events should group into the same issue.
Default fingerprints use exception type + stack trace; you can
override them in the project's Issue Grouping settings.

Click each `TRIGGER`, confirm an event lands in Sentry. Specimens 06
(TypeError) and 07 (`AppError` with `TypeError` cause) should be
**different** issues. If they merge into one issue, that's a
fingerprint problem to solve.

**What you learned.** Different error shapes hit different boundaries.
Sentry captures all of them once the SDK is loaded.

### `/labs/tracing`

**Customer scenario.** A customer says: "Checkout is slow but we don't
know which step." Tracing is how you find out — every step of the
request becomes a **span** (§13) (one segment of a trace) so you can
see where the time goes.

**What you see in the app.** Four specimens:

- **SPC-TRC-01** — POSTs `/api/echo` with `hops=3`. The route
  fetches itself recursively; you should see three sequential spans.
- **SPC-TRC-02** — `Promise.all` of five concurrent `/api/slow`
  fetches.
- **SPC-TRC-03** — slow Server Action that awaits 1500 ms.
- **SPC-TRC-04** — multi-step async chain marked with a `// TODO:
  wrap in Sentry.startSpan` comment.

**What you change in code.** Auto-tracing covers specimens 01–03 once
`Sentry.init()` runs with a non-zero `tracesSampleRate` (the wizard
ships a NODE_ENV-aware default — `1.0` in development, `0.1` in
production). Auto-tracing depends on the `onRouterTransitionStart`
export from
`instrumentation-client.ts` to attribute client-side navigations —
check that the wizard wired it before chasing "missing" transactions.
For **SPC-TRC-04**, find the TODO in `app/labs/tracing/page.tsx` and
apply the before/after shown in §7. Confirm `/api/checkout` →
`/api/payment` is one continuous trace when you check out at `/cart`.

**Verify in Sentry.** Open the **Traces** tab (under **Explore**;
formerly **Performance**). The 3-hop chain shows three nested
`/api/echo` spans; the parallel run shows five concurrent fetches
under one root span; the custom span has the name you chose.

**What you learned.** A `Sentry.startSpan` call gives any block of
code its own measurable segment in a trace.

### `/labs/logs`

**Customer scenario.** A customer says: "We can see errors but we
have no context for *why* they happened." Structured logs let you
attach arbitrary fields (order ID, user ID, latency budget) so you
can pivot through them in Sentry without digging through raw text.

**What you see in the app.** Three client-side
`console.{info,warn,error}` specimens and one Server Action that
emits the same three levels with structured payloads.

**What you change in code.** Logs require `enableLogs: true` in
every Sentry runtime that should emit them. Open all three init
files the wizard created — `instrumentation-client.ts`,
`sentry.server.config.ts`, and `sentry.edge.config.ts` — and confirm
each `Sentry.init({ ... })` block contains `enableLogs: true`. If
any file is missing it, add the line. Then replace each `console.*`
call in `app/labs/logs/page.tsx` and `app/labs/logs/actions.ts` with
`Sentry.logger.{info,warn,error}("message", { ...fields })`. Message
string first, structured attributes second — e.g.
`Sentry.logger.info("Order created", { orderId, total })`.

**Verify in Sentry.** The **Logs** explorer shows your messages with
the structured fields (`route`, `reason`, `orderId`, `userId`,
`total`).

**What you learned.** `Sentry.logger.*` replaces `console.*` calls
without losing the developer ergonomics. Structured fields become
queryable dimensions in Sentry.

### `/labs/seer`

**Customer scenario.** A customer says: "We've got a confusing
TypeError and we can't tell where in our code the bug is." Seer is
Sentry's AI debugger — given a stack trace and source code access, it
walks the call chain and identifies the likely fix.

**What you see in the app.** One specimen, `DIAGNOSE`, that calls a
deep, intentionally-named chain of four functions. The function
names — `parseOrder`, `validateLineItem`, `priceOf`, `applyDiscount`
— are written so Seer can reason about the bug from the names alone.
The intentional bug is in `applyDiscount`: it calls `(price as
number).toFixed(2)` without first checking that `price` is defined,
throwing a `TypeError: Cannot read properties of undefined (reading
'toFixed')`.

**What you change in code.** Inside the `catch` block in
`app/labs/seer/actions.ts` there's a TODO for
`Sentry.captureException(e)`. Add the call. Without it, the Server
Action returns its structured payload but no event reaches Sentry.
Then connect your GitHub repo in **Sentry → Settings → Integrations →
GitHub** (covered in §9) — Seer needs source access to analyze the
call chain.

**Verify in Sentry.** In the Sentry issue, click **"Analyze with
Seer."** It should walk the named functions and identify
`applyDiscount`'s missing `undefined` guard.

**What you learned.** Naming functions semantically matters — Seer
reads those names when reasoning about the bug. Source access is the
difference between a guess and a precise pointer.

### `/labs/feedback`

**Customer scenario.** A customer says: "Our users hit weird issues
but they never tell us — by the time we know about a bug, they've
already churned." The feedback widget gives users a one-click way to
file an issue without leaving the page.

**What you see in the app.** A static page with an explanation, an
empty `<div id="feedback-anchor" />`, and a code snippet showing the
`feedbackIntegration` setup.

**What you change in code.** In your client init
(`instrumentation-client.ts`), add `Sentry.feedbackIntegration()` to
the `integrations` array. The widget mounts globally — the
`#feedback-anchor` div is a place to point users, not a mount target.

**Verify in Sentry.** A floating feedback button appears in the
corner of every page. Submit a feedback form and confirm it lands in
**Sentry → User Feedback**.

**What you learned.** One line in the SDK's integrations list adds a
fully-styled feedback channel into your app. No backend wiring
required.

### `/labs/metrics`

> **Note.** Sentry's Application Metrics returned to **open beta** in
> `@sentry/nextjs` 10.25.0 after the previous beta ended in late 2024.
> The shape (`count` / `gauge` / `distribution`) is unchanged but it's
> a separate feature — older blog posts about the discontinued beta
> no longer apply. The wizard installs a current SDK, so the default
> flow is fine; if you pinned `<10.25.0`, upgrade before wiring this
> lab.

**Customer scenario.** A customer says: "We need to track signups,
queue depth, and request latency over time without writing custom
dashboards." Metrics give you counters, gauges, and distributions —
the three primitives most observability tools are built on.

**What you see in the app.** Five specimens. Each specimen's
`onClickAction` already includes a TODO marking where the
`Sentry.metrics.{count,gauge,distribution}` call belongs. Specimen 04
also exercises the `withLabMetric` Server Action wrapper in
`lib/metrics.ts`.

**What you change in code.** §7 covered all of this with per-file
before/after blocks. The four files involved:

- `app/labs/metrics/page.tsx` (§7 step 6) — four `Sentry.metrics.*`
  calls, one per specimen.
- `app/labs/metrics/actions.ts` (§7 step 7) — server-side
  `Sentry.metrics.count` for SPC-MET-04.
- `lib/metrics.ts` (§7 step 8) — the `lab_trigger` count and the
  `await Sentry.flush(2000)`. The flush is critical: serverless
  Server Actions can terminate before the metric buffer auto-flushes.
- `app/components/lab-trigger.tsx` (§7 step 9) — per-click client
  `lab_trigger` count.

Once those are wired (and SPC-MET-04's Server Action is wrapped per
§7 step 10), every click in the lab emits a `lab_trigger` metric and
the `/labs/metrics` specimens emit their `metrics_demo_*` metrics.

**Verify in Sentry.** The **Metrics** explorer shows `lab_trigger`
(with `lab`, `specimen`, `runtime` attributes) plus the three
`metrics_demo_*` metrics from `/labs/metrics`. Click a few labs and
confirm runtime values stay bounded (`client`, `server`).

**What you learned.** Counters, gauges, and distributions are three
different shapes for different questions. Always `flush` before a
serverless function exits or you'll lose the last few samples.

---

## §9 · Step 6 — Configure Sentry from the UI

> **Pillar: Configure.** The wizard set up the bare minimum. Customers
> do far more from the Sentry UI — this section walks you through it.

### 9.1 — Projects, teams, and environments

A **project** in Sentry is one application. A **team** is a group of
people who own a project. An **environment** is a label like
`production`, `staging`, or `development` that lets you filter events.

For this lab you need one project (created in §3 or auto-created by
the wizard). Confirm in **Settings → Projects** that yours exists,
then open **Settings → [Your Project] → Environments** to see that
`development` events are flowing in.

### 9.2 — Connect GitHub (required for Seer)

Seer can't analyze code it can't read. Connect GitHub now so §10's
Seer exercise works.

1. Go to **Seer settings**
   (`sentry.io/orgredirect/organizations/<your-org>/settings/seer/`)
   — the dedicated Seer settings page, separate from
   **Settings → Integrations**.
2. Connect to GitHub through the Sentry GitHub integration if you
   haven't already; pick the repo for this lab (or your whole org).
3. **Install the Seer GitHub app** (separate from the base GitHub
   integration). It's required for Seer to create PRs from Autofix.
4. Turn on the Seer features you want for this project: Issue
   Autofix, Coding Agent handoff (Claude Code / Cursor / Copilot),
   and Code Review.

**Heads up on pricing.** Seer is a paid add-on with active-contributor
billing — anyone who creates 2+ PRs in a month in a Seer-enabled
project gets billed. If you hit a paywall mid-§10.4, post in
**#onboarding-help**.

### 9.3 — Connect Slack (optional but realistic)

Customers route alerts to Slack so the right humans get paged. The
setup is the same shape as GitHub: **Settings → Integrations → Slack
→ Add Workspace**. Authorize the workspace, pick a default channel,
done.

### 9.4 — Write one alert rule

Alerts are the leverage point — they're how Sentry stops being a
passive log and starts being something that wakes you up.

1. Go to **Alerts → Create Alert** in the left navigation.
2. Choose **Issues** as the alert type.
3. **When:** "A new issue is created."
4. **Filter:** project equals your lab project.
5. **Action:** "Send a notification to a Member" — select your own
   name from the **Member** dropdown.
6. Name it `Lab — new issue` and save.

Now click any `TRIGGER` button on `/labs/errors` again. You should
receive an email within a minute.

### 9.5 — Sampling

Sampling controls how many traces, replays, or profiles Sentry
actually records. Capturing 100% of everything is fine for a lab but
expensive at production scale.

The wizard ships a production-aware default: `tracesSampleRate: 1.0`
in development, `0.1` (10% of traces) in production. Override with a
`tracesSampler` function for finer control — per-request sampling
functions and per-environment overrides live in §14's maintainer
notes. You don't need that for this lab.

### 9.6 — DSNs and what the wizard set

Your project's **DSN** is the URL the SDK uses to send events to
Sentry. Find it under **Settings → [Your Project] → Client Keys
(DSN)**. The wizard wrote it into `instrumentation-client.ts`,
`sentry.server.config.ts`, and `sentry.edge.config.ts`. You don't
need to change it — but if you ever rotate keys or move projects,
that's where it lives.

---

## §10 · Step 7 — Use Sentry like a customer

> **Pillar: Use.** Now spend ~30 minutes using Sentry the way
> customers do day-to-day. Five exercises, ~5 minutes each.

### 10.1 — Triage an issue

1. Go to **Issues** in Sentry. Find the issue with a title like
   `applyDiscount: code BAD is invalid` (this is the SPC-ERR-04
   Server Action throw from `/labs/errors`).
2. Click into it. Read the **stack trace** — Sentry should show your
   source lines with the function names, thanks to the source maps
   the wizard uploaded.
3. Look at the **breadcrumbs** (§13) — Sentry's record of the steps
   the user (or the request) took before the error. You should see
   clicks, navigations, and fetch calls leading up to the throw.
4. Read the **request** and **tags** sections — URL, browser, OS,
   release version.
5. Click **Resolve** at the top right. The issue moves to "Resolved"
   and won't email you again unless it reappears in a new release.

### 10.2 — Walk a trace

1. Click `TRIGGER` on **SPC-TRC-01** in `/labs/tracing` if you
   haven't recently.
2. In Sentry, go to **Traces** (formerly **Performance** — the URL
   is `/explore/traces/`). Find the recent trace for
   `POST /api/echo` (or whatever Sentry named your root span).
3. Click into it. You should see a **waterfall** — three nested
   `/api/echo` spans, each one starting after the previous one
   responds.
4. Click any span to see its details: duration, request headers, db
   queries (if any), child spans.

### 10.3 — Watch a replay

1. Walk the demo flow once: `/products` → click a product → `ADD TO
   SPECIMEN CART` → `/cart` → `CHECKOUT`. This generates a Replay.
2. In Sentry, go to **Replays**. Find the session you just recorded.
3. Click play. You'll see a video-like reconstruction of what your
   browser rendered.
4. Open `/signin` in the replay. The password input should be
   **masked** (shown as dots). Sentry's default is aggressive —
   **all text, all inputs, and all media** are masked, not just
   password fields. To unmask non-sensitive content on a static
   site, configure
   `replayIntegration({ maskAllText: false, blockAllMedia: false })`,
   or use `data-sentry-unmask` on specific elements. Defaults assume
   privacy first.

### 10.4 — Run Seer

1. Go to `/labs/seer` and click `DIAGNOSE`.
2. In Sentry, find the resulting issue (a `TypeError` from
   `applyDiscount`).
3. Click **"Analyze with Seer"** at the top of the issue.
4. Watch Seer walk the call chain — it should read
   `parseOrder → validateLineItem → priceOf → applyDiscount`,
   identify `applyDiscount` as the bug site, and recommend an
   `undefined` guard before the `.toFixed(2)` call. Exact wording
   will vary; what matters is that Seer correctly localises the bug
   to `applyDiscount`.

### 10.5 — Submit user feedback

1. Open any page in the app. The floating feedback button should be
   in the corner.
2. Click it. Fill in name, email, and a message ("test feedback from
   the lab").
3. Submit.
4. In Sentry, go to **User Feedback**. Your submission should be
   there with the message and any associated event.

---

## §11 · End-to-end verification checklist

Run through this before declaring done.

1. `npm run lint` passes — you see no red error messages, just a
   prompt returning. (A passing lint command often prints nothing,
   which is normal.)
2. `npm run build` passes. The end of a successful build looks
   roughly like:

   ```
   ✓ Compiled successfully
   ✓ Generating static pages (XX/XX)
   [@sentry/nextjs] Successfully uploaded source maps to Sentry
   ```

   The "Successfully uploaded source maps" line is the one to look
   for — if it's missing or shows an auth error, jump to §12.
3. `npm run dev` runs without console errors.
4. Demo flow: products → cart → checkout → success page; sign-in
   50/50 success/fail; dashboard counters move.
5. **Sentry → Issues:** at least one event per `/labs/errors`
   specimen; `/labs/seer` produces an issue with the deep call chain.
6. **Sentry → Explore → Traces:** `/labs/tracing` specimens 01–03
   produce visible spans; specimen 04 has a custom span named what
   you chose.
7. **Sentry → Logs:** `/labs/logs` emits client + server structured
   logs with the right level.
8. **Sentry → Replays:** a session replay exists for the demo flow
   you just walked through; password input on `/signin` is masked.
9. **Sentry → User Feedback:** at least one submission through the
   floating widget.
10. **Sentry → Metrics:** `lab_trigger` plus the three
    `metrics_demo_*` metrics with the expected attributes.
11. **Sentry → Issues** → an event from `/labs/seer` → "Analyze with
    Seer" walks the
    `parseOrder → validateLineItem → priceOf → applyDiscount` chain.
12. **Sentry → Settings → Integrations:** GitHub is connected.
13. **Alerts:** at least one rule exists; you received the test
    email.

---

## §12 · Troubleshooting + how to ask for help

### Common stuck points

**"I ran `npm install` and got errors."** Most often a Node version
mismatch. Type `node -v` in your terminal — the first number after
the `v` should be 20 or larger. If it's smaller, reinstall from
<https://nodejs.org/> (pick the LTS version). If `node -v` shows the
right version but `npm install` still fails, post in
**#onboarding-help** with the full error output — fixing this is
faster with someone watching your screen.

**"The wizard said it failed to upload source maps."** The most
common cause is a missing or expired auth token in
`.env.sentry-build-plugin`. Open that file in VS Code (it's in the
project root, gitignored). It should contain
`SENTRY_AUTH_TOKEN=...`. If empty or missing, re-run the wizard or
generate a token at **Settings → Auth Tokens** in Sentry.

**"I clicked TRIGGER and nothing shows up in Sentry."**

- Wait 30 seconds — events take a moment to appear.
- Confirm the project in your Sentry sidebar matches the project the
  wizard configured (look at the DSN in `instrumentation-client.ts`
  and compare it to **Settings → [Your Project] → Client Keys** in
  Sentry).
- Check that `tracesSampleRate` is set in all three Sentry config
  files for performance events. The wizard's default (`1.0` in
  development, `0.1` in production) is fine; just confirm the line
  isn't missing.
- For Server Action labs, confirm
  `Sentry.withServerActionInstrumentation(...)` is wrapping the
  action — without it, Server Actions are not captured.
- Open your browser's DevTools (right-click anywhere → "Inspect" →
  Network tab) and filter by `sentry`. If you see no requests at
  all, the SDK isn't loading; if you see requests but they show 4xx
  status codes, the DSN is wrong.

**"My logs don't show up in Sentry."**

- Confirm `enableLogs: true` is set in `instrumentation-client.ts`,
  `sentry.server.config.ts`, AND `sentry.edge.config.ts` — missing
  it in any one file silently drops logs from that runtime.
- Check that you swapped `console.*` for `Sentry.logger.*` (not
  `Sentry.captureMessage` — that's a different API for one-off
  events).
- Open Sentry → **Logs** explorer (not Issues). Logs land in their
  own tab.
- For Server Action logs, confirm
  `Sentry.withServerActionInstrumentation(...)` wraps the action —
  without the wrap, server-side logs may not associate with a trace.

**"TypeScript errors after the wizard."** Usually a transient cache.
Stop the dev server (Ctrl+C in its terminal), delete the `.next/`
folder (in VS Code's file tree, right-click `.next` → Delete; or in
the terminal, `rm -rf .next`), restart `npm run dev`. If errors
persist, check that the wizard didn't downgrade `@types/node`.

**"My replay doesn't show up."** Replays sample independently of
traces. The wizard sets `replaysSessionSampleRate` and
`replaysOnErrorSampleRate` — confirm both are non-zero in
`instrumentation-client.ts`.

### How to ask for help

When you post in **#onboarding-help** or message your manager,
include **all four** of these so the person helping doesn't have to
ask:

1. **Which step you're on** — "Stuck on §7, wiring `/labs/seer`."
2. **The exact terminal output** — copy and paste it into the
   message, not a screenshot. Wrap it in triple backticks (```` ``` ````)
   so it formats as code.
3. **A screenshot** of the wizard prompt, browser DevTools, or
   Sentry page you're stuck on.
4. **Your Sentry org slug** (visible in the Sentry URL —
   `sentry.io/organizations/<slug>/`).

Most help cycles take five minutes when those four are in the first
message and an hour when they aren't. Front-load the context.

---

## §13 · Reference: Terms

Quick re-lookup for terms used in this handout.

- **Breadcrumb** — a record of one step (a click, a navigation, a
  fetch) leading up to an event. Sentry shows breadcrumbs in the
  issue detail.
- **DSN (Data Source Name)** — the URL Sentry generates per project
  that tells the SDK where to send events.
- **Error boundary** — a React/Next.js component that catches errors
  in its children. `app/error.tsx` and `app/global-error.tsx` are
  the two error boundaries in this app.
- **Fingerprint** — the rule Sentry uses to decide which events
  group into the same issue. Default is exception type + stack trace.
- **Issue** — a group of similar events Sentry has decided are the
  same bug.
- **Replay** — a video-like playback of what the user saw and did,
  reconstructed from DOM snapshots.
- **SDK (Software Development Kit)** — the small library
  (`@sentry/nextjs` here) that watches your app and sends events.
- **Seer** — Sentry's AI debugger. Reads a stack trace and source
  code, returns a likely fix.
- **Server Action** — a Next.js function marked `"use server"` that
  runs on the server but is callable directly from a client
  component.
- **Server Component** — a React component that runs on the server
  only. The default in Next.js App Router.
- **Source maps** — files that map minified JavaScript back to the
  original source so stack traces are readable.
- **Span** — one segment of a trace (a fetch, a function call, a db
  query).
- **Trace** — the timeline of one request's trip through your
  services. Made of spans.
- **Transaction** — legacy term for a top-level trace. Sentry's UI
  now says **Trace** (under **Explore → Traces**); you'll still see
  `transaction` as a field name in the event payload and in older
  docs.
- **Throw** — developer slang for "raise an error." When code
  "throws," it stops normal execution and surfaces an error object.
- **Wizard** — the `npx @sentry/wizard@latest -i nextjs` command
  that installs and configures the SDK in one step.

---

## §14 · Appendix for maintainers

> This section is for engineers maintaining the lab, not trainees.
> Skip it unless you're updating the repo.

### App architecture

Two surfaces share one Sentry seam (which the trainee builds).

**Demo flow** — `/products`, `/products/[id]`, `/cart`, `/signin`,
`/dashboard`. Polished e-commerce pages. Server Components by
default; client components only where interactivity demands it
(`buy-button.tsx`, `cart-form.tsx`, `signin/page.tsx`).

**Labs** — `/labs/{errors,tracing,logs,seer,feedback,metrics}`.
Deliberate failure surfaces, one per Sentry feature. Each page
renders `<LabSpecimen>` tiles whose trigger buttons fire a targeted
error / fetch / log. `/labs/seer` uses a deep, semantically-named
Server Action chain so Seer has signal to chew on — preserve those
names.

**State** lives in `lib/store.ts`, which starts with
`import "server-only"`. Products, cart, and counters are
module-level mutable state — fine for a sandbox, but it resets on
dev reload and is not shared across processes. Never import this
from a client component; mutate through Server Actions and
`revalidatePath`.

**Cross-process tracing** uses helpers in `lib/origin.ts`.
Server-to-server `fetch`es (`cart/actions.ts → /api/checkout →
/api/payment`, recursive `/api/echo`) build their URL via
`originFromRequest(request)` or `originFromHeaders()` so the call
remains a single distributed trace.

**Custom metrics seam** lives in `lib/metrics.ts` (server) and
`app/components/lab-trigger.tsx` (client). Both have `withLabMetric`
/ `handleClick` shells with TODOs marking exactly where the
`Sentry.metrics.count(...)` calls belong.

### Sampling — deeper controls

The trainee handout (§9.5) only mentions `tracesSampleRate`. Real
Sentry deployments use:

- **`tracesSampler`** — a function `(samplingContext) => number` that
  returns a per-request sample rate. Useful for sampling premium
  customers at 100% and free-tier traffic at 1%.
- **Per-environment overrides** — different rates in `production`,
  `staging`, and `development` via the `environment` config option
  combined with conditional logic in `tracesSampler`.
- **Inheritance** — child spans inherit the sampling decision of
  their root span. Don't try to sample a child differently; it won't
  work.

### Production-grade options the lab skips

The lab disables a few options that real customer deployments
typically turn on. Documented here for maintainers who get asked
about them.

- **`tunnelRoute: "/monitoring"`** routes Sentry traffic through your
  own domain to bypass ad-blockers. If you turn it on, exclude the
  route from `proxy.ts`'s matcher (e.g.
  `(?!monitoring|_next/static|_next/image|favicon.ico)`) — Turbopack
  won't auto-skip it.
- **Source-map upload on Turbopack** runs through Next.js 15.4.1+'s
  `runAfterProductionCompile` hook; the wizard sets
  `useRunAfterProductionCompileHook: true` automatically. If you
  switch to Webpack and source maps stop uploading, you may need to
  opt in manually.

### Next.js 16 traps that already bit this repo

- `error.tsx` / `global-error.tsx` props are `{ error, unstable_retry }`
  — **not** `reset`. Don't regress this.
- Middleware lives at `proxy.ts` (root) with
  `export function proxy(...)`. Node runtime only — no
  `runtime: 'edge'`.
- Dynamic routes are async: `params: Promise<{ id: string }>`, then
  `await params`. Same for `searchParams`, `cookies()`, `headers()`.
- `cart/actions.ts:checkout` calls `redirect()` after the work, and
  `redirect()` throws by design — never wrap it in a `try/catch`
  that swallows the redirect.

### Conversion history

The original repo had every Sentry feature wired in. To turn it into
a trainee-ready blank slate the following changes were made
(preserved here so future maintainers know what's intentionally
absent):

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
  (`/products`, `/cart`, `/signin`, `/dashboard`), all `/api/*`
  routes, the design system (`globals.css`, fonts, tokens),
  `proxy.ts`, the in-memory state in `lib/store.ts`, the deep buggy
  chain in `app/labs/seer/actions.ts` (intentional fixture for
  Seer), and the `LabSpecimen` / `PageHeader` / `SpecimenCard` /
  `SpecimenGlyph` components.

Decisions made during the conversion:

1. **Mixed entry-point handling** — the three pure-Sentry config
   files were deleted (the wizard regenerates them).
   `instrumentation.ts` and `app/global-error.tsx` were left as
   stubs with TODOs because they are Next.js 16 conventions trainees
   would otherwise have to discover from scratch.
2. **Metrics seam preserved** — `lib/metrics.ts` (`withLabMetric`)
   and `app/components/lab-trigger.tsx` keep their props, wrapper
   shape, and call sites; only the SDK calls inside became TODOs.
   This gives trainees an obvious place to add metrics without
   forcing them to re-architect.
3. **Docs rewritten as handout** — `docs/sentry-test-lab.md`
   (original build plan) was replaced by this file. The metrics and
   fingerprint docs were deleted because they describe specific
   implementation details that don't survive a fresh wizard run.
