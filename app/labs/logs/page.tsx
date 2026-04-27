"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { LabSpecimen, type LogEntry } from "@/app/components/lab-specimen";
import { LabTriggerSubmit } from "@/app/components/lab-trigger";
import { serverLog } from "./actions";

export default function LogsLab() {
  const [log, setLog] = useState<LogEntry | null>(null);

  return (
    <div className="cascade">
      <PageHeader
        number="03"
        total="05"
        path="/labs/logs"
        title="Logs"
        subtitle="Client console output and server-side structured logs. Sentry.logger.* drops in here."
      />

      <LabSpecimen
        number="01"
        id="SPC-LOG-01"
        title="CLIENT CONSOLE.INFO"
        description="Emits console.info from the browser. Sentry's browser logger hooks via console integration."
        result={log?.id === "SPC-LOG-01" ? log.text : null}
      >
        <button
          type="button"
          className="btn-trigger"
          onClick={() => {
            const fields = { route: "/labs/logs", level: "info", at: new Date().toISOString() };
            console.info("client.log.info", fields);
            setLog({ id: "SPC-LOG-01", text: `console.info\n${JSON.stringify(fields, null, 2)}` });
          }}
        >
          <span className="btn-trigger-label">[ EMIT ]</span>
        </button>
      </LabSpecimen>

      <LabSpecimen
        number="02"
        id="SPC-LOG-02"
        title="CLIENT CONSOLE.WARN"
        description="Emits console.warn with a structured payload. Often the right level for soft budget exceedances."
        result={log?.id === "SPC-LOG-02" ? log.text : null}
      >
        <button
          type="button"
          className="btn-trigger"
          onClick={() => {
            const fields = { route: "/labs/logs", level: "warn", reason: "rate=487ms" };
            console.warn("client.log.warn", fields);
            setLog({ id: "SPC-LOG-02", text: `console.warn\n${JSON.stringify(fields, null, 2)}` });
          }}
        >
          <span className="btn-trigger-label">[ EMIT ]</span>
        </button>
      </LabSpecimen>

      <LabSpecimen
        number="03"
        id="SPC-LOG-03"
        title="CLIENT CONSOLE.ERROR"
        description="Emits console.error. Surfaces in DevTools and in Sentry once the SDK is wired."
        result={log?.id === "SPC-LOG-03" ? log.text : null}
      >
        <button
          type="button"
          className="btn-trigger"
          onClick={() => {
            const fields = { route: "/labs/logs", level: "error", reason: "auth-token-expired" };
            console.error("client.log.error", fields);
            setLog({ id: "SPC-LOG-03", text: `console.error\n${JSON.stringify(fields, null, 2)}` });
          }}
        >
          <span className="btn-trigger-label">[ EMIT ]</span>
        </button>
      </LabSpecimen>

      <LabSpecimen
        number="04"
        id="SPC-LOG-04"
        title="SERVER LOG (3 LEVELS)"
        description="Form submits a Server Action that emits info/warn/error with structured fields. Watch the dev server output."
      >
        <form action={serverLog} className="flex flex-wrap gap-3 items-center">
          <input type="hidden" name="orderId" value="ord_lab_demo" />
          <input type="hidden" name="userId" value="usr_lab" />
          <input type="hidden" name="total" value="129" />
          <LabTriggerSubmit>EMIT</LabTriggerSubmit>
        </form>
      </LabSpecimen>
    </div>
  );
}
