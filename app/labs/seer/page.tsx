"use client";

import { useActionState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { runBuggyCheckout } from "./actions";

type SeerState =
  | { ok: true; lineItems: number; total: number }
  | { ok: false; name: string; message: string; frames: string[] }
  | null;

const initialState: SeerState = null;

const FUNCTION_NAMES = [
  "parseOrder",
  "validateLineItem",
  "priceOf",
  "applyDiscount",
  "runBuggyCheckout",
];

function highlightFrame(line: string) {
  for (const fn of FUNCTION_NAMES) {
    if (line.includes(fn)) {
      const idx = line.indexOf(fn);
      return (
        <>
          {line.slice(0, idx)}
          <span style={{ color: "var(--color-signal)", fontWeight: 600 }}>{fn}</span>
          {line.slice(idx + fn.length)}
        </>
      );
    }
  }
  return line;
}

export default function SeerLab() {
  const [state, formAction, isPending] = useActionState<SeerState>(
    async () => runBuggyCheckout(),
    initialState,
  );

  return (
    <div className="cascade">
      <PageHeader
        number="04"
        total="06"
        path="/labs/seer"
        title="Seer"
        subtitle="Buggy checkout with a deep, well-named call chain. Hit DIAGNOSE to capture the throw."
      />

      <div className="border border-[var(--color-ink)] p-6 mb-6">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-4">
          CASE FILE / 04
        </p>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px] mb-6">
          <dt className="text-[var(--color-mute)]">SUBJECT</dt>
          <dd>Buggy checkout</dd>
          <dt className="text-[var(--color-mute)]">SYMPTOM</dt>
          <dd>TypeError on applyDiscount</dd>
          <dt className="text-[var(--color-mute)]">EXPECTED</dt>
          <dd>Discount applied to each line item</dd>
          <dt className="text-[var(--color-mute)]">ACTUAL</dt>
          <dd>
            Cannot read properties of undefined (reading <code>&apos;toFixed&apos;</code>)
          </dd>
        </dl>
        <form action={formAction}>
          <button type="submit" className="btn-action" disabled={isPending}>
            {isPending ? "DIAGNOSING …" : "DIAGNOSE"}
          </button>
        </form>
      </div>

      {state && state.ok === false ? (
        <div className="border border-[var(--color-crit)] p-6 mb-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-crit)] mb-3">
            CAPTURED &middot; {state.name}
          </p>
          <p className="font-display text-2xl mb-4">{state.message}</p>
          <pre
            className="panel-soft text-[12px] overflow-auto whitespace-pre-wrap p-4"
            style={{ lineHeight: 1.6 }}
          >
            {state.frames.map((line, i) => (
              <div key={i}>{highlightFrame(line)}</div>
            ))}
          </pre>
        </div>
      ) : null}

      {state && state.ok === true ? (
        <div className="border border-[var(--color-signal-dim)] p-6 mb-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-signal-dim)] mb-2">
            CASE CLOSED · NO REPRO
          </p>
          <p className="font-display italic text-[var(--color-mute)]">
            Bug did not fire. Try again — the seed sometimes resolves.
          </p>
        </div>
      ) : null}

      <p className="font-mono text-[11px] text-[var(--color-mute)]">
        With Sentry + Seer wired in (see <code>docs/lab-handout.md</code>), this
        deep stack would be analyzed automatically against the connected GitHub
        repo.
      </p>
    </div>
  );
}
