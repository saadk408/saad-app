"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { LabSpecimen, type LogEntry } from "@/app/components/lab-specimen";
import { LabTriggerSubmit } from "@/app/components/lab-trigger";
import { slowWork } from "./actions";

export default function TracingLab() {
  const [log, setLog] = useState<LogEntry | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="cascade">
      <PageHeader
        number="02"
        total="05"
        path="/labs/tracing"
        title="Tracing"
        subtitle="Spans, distributed traces, and one slot for a custom Sentry.startSpan."
      />

      <LabSpecimen
        number="01"
        id="SPC-TRC-01"
        title="SEQUENTIAL 3-HOP CHAIN"
        description="POSTs /api/echo with hops=3. The route fetches itself recursively, producing three sequential spans."
        result={log?.id === "SPC-TRC-01" ? log.text : null}
        resultTone="ok"
      >
        <button
          type="button"
          className="btn-trigger"
          disabled={busy === "SPC-TRC-01"}
          onClick={async () => {
            setBusy("SPC-TRC-01");
            const t0 = performance.now();
            const res = await fetch("/api/echo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ hops: 3 }),
            });
            const body = await res.json();
            const ms = Math.round(performance.now() - t0);
            setLog({
              id: "SPC-TRC-01",
              text: `dur=${ms}ms hops=${body.chain.length}\n${JSON.stringify(body, null, 2)}`,
              tone: "ok",
            });
            setBusy(null);
          }}
        >
          <span className="btn-trigger-label">[ TRIGGER{busy === "SPC-TRC-01" ? " …" : ""} ]</span>
        </button>
      </LabSpecimen>

      <LabSpecimen
        number="02"
        id="SPC-TRC-02"
        title="PARALLEL FETCHES"
        description="Promise.all([…×5]) against /api/slow. Five concurrent spans, one rendered duration per fetch."
        result={log?.id === "SPC-TRC-02" ? log.text : null}
        resultTone="ok"
      >
        <button
          type="button"
          className="btn-trigger"
          disabled={busy === "SPC-TRC-02"}
          onClick={async () => {
            setBusy("SPC-TRC-02");
            const t0 = performance.now();
            const results = await Promise.all(
              [200, 250, 300, 350, 400].map((ms) =>
                fetch(`/api/slow?ms=${ms}`).then((r) => r.json()),
              ),
            );
            const total = Math.round(performance.now() - t0);
            setLog({
              id: "SPC-TRC-02",
              text: `total=${total}ms (max=${Math.max(...results.map((r) => r.slept))}ms)\n${JSON.stringify(results, null, 2)}`,
              tone: "ok",
            });
            setBusy(null);
          }}
        >
          <span className="btn-trigger-label">[ TRIGGER{busy === "SPC-TRC-02" ? " …" : ""} ]</span>
        </button>
      </LabSpecimen>

      <LabSpecimen
        number="03"
        id="SPC-TRC-03"
        title="SLOW SERVER ACTION"
        description="Form submits a Server Action that awaits delay(1500). Surfaces as a server-side span."
      >
        <form action={slowWork}>
          <LabTriggerSubmit>TRIGGER</LabTriggerSubmit>
        </form>
      </LabSpecimen>

      <LabSpecimen
        number="04"
        id="SPC-TRC-04"
        title="CUSTOM-SPAN PLACEHOLDER"
        description="Multi-step async work. TODO marker to wrap in Sentry.startSpan once the SDK is wired."
        result={log?.id === "SPC-TRC-04" ? log.text : null}
        resultTone="info"
      >
        <button
          type="button"
          className="btn-trigger"
          disabled={busy === "SPC-TRC-04"}
          onClick={async () => {
            setBusy("SPC-TRC-04");
            // TODO: wrap in Sentry.startSpan({ name: "checkoutFlow" }, async () => { ... })
            const t0 = performance.now();
            await fetch("/api/slow?ms=120");
            await fetch("/api/echo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ hops: 2 }),
            });
            await fetch("/api/slow?ms=80");
            const ms = Math.round(performance.now() - t0);
            setLog({
              id: "SPC-TRC-04",
              text: `checkoutFlow=${ms}ms (3 sub-steps)\n// ready for Sentry.startSpan`,
              tone: "info",
            });
            setBusy(null);
          }}
        >
          <span className="btn-trigger-label">[ TRIGGER{busy === "SPC-TRC-04" ? " …" : ""} ]</span>
        </button>
      </LabSpecimen>
    </div>
  );
}
