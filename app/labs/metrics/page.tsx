"use client";

import { useActionState, useState } from "react";

import { PageHeader } from "@/app/components/page-header";
import { LabSpecimen, type LogEntry } from "@/app/components/lab-specimen";
import { LabTrigger, LabTriggerSubmit } from "@/app/components/lab-trigger";
import { recordServerCount, type ServerCountResult } from "./actions";

const REGIONS = ["us-east", "us-west", "eu-central"] as const;
const TIERS = ["free", "pro", "enterprise"] as const;
const PAGES = ["/cart", "/checkout", "/products"] as const;

export default function MetricsLab() {
  const [log, setLog] = useState<LogEntry | null>(null);
  const [countState, setCountState] = useState(0);
  const [fanoutTick, setFanoutTick] = useState(0);
  const [serverState, serverFormAction] = useActionState<ServerCountResult | null>(
    async () => recordServerCount(),
    null,
  );

  return (
    <div className="cascade">
      <PageHeader
        number="06"
        total="06"
        path="/labs/metrics"
        title="Metrics"
        subtitle="Counters, gauges, and distributions — three call shapes for cross-cutting telemetry."
      />

      <LabSpecimen
        number="01"
        id="SPC-MET-01"
        title="COUNT"
        description="Increments a counter. Use for events — button clicks, errors, signups. Sentry.metrics.count('metrics_demo_count', 1)."
        result={log?.id === "SPC-MET-01" ? log.text : null}
        resultTone="ok"
      >
        <LabTrigger
          lab="metrics"
          specimen="SPC-MET-01"
          onClickAction={() => {
            const next = countState + 1;
            setCountState(next);
            // TODO: Sentry.metrics.count("metrics_demo_count", 1, { attributes: { kind: "manual" } });
            setLog({
              id: "SPC-MET-01",
              text: `count() emitted (session n=${next})`,
              tone: "ok",
            });
          }}
        >
          EMIT
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="02"
        id="SPC-MET-02"
        title="GAUGE"
        description="Records a current value. Use for snapshots — queue depth, memory, CPU. Sentry.metrics.gauge('metrics_demo_gauge', value)."
        result={log?.id === "SPC-MET-02" ? log.text : null}
        resultTone="info"
      >
        <LabTrigger
          lab="metrics"
          specimen="SPC-MET-02"
          onClickAction={() => {
            const value = Math.floor(Math.random() * 100);
            // TODO: Sentry.metrics.gauge("metrics_demo_gauge", value);
            setLog({
              id: "SPC-MET-02",
              text: `gauge=${value}`,
              tone: "info",
            });
          }}
        >
          EMIT
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="03"
        id="SPC-MET-03"
        title="DISTRIBUTION"
        description="Records a value sample. Use for histograms — latency, payload size. Sentry.metrics.distribution(name, value, { unit: 'millisecond' })."
        result={log?.id === "SPC-MET-03" ? log.text : null}
        resultTone="info"
      >
        <LabTrigger
          lab="metrics"
          specimen="SPC-MET-03"
          onClickAction={() => {
            const ms = 50 + Math.random() * 450;
            // TODO: Sentry.metrics.distribution("metrics_demo_distribution", ms, { unit: "millisecond" });
            setLog({
              id: "SPC-MET-03",
              text: `distribution=${ms.toFixed(1)}ms`,
              tone: "info",
            });
          }}
        >
          EMIT
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="04"
        id="SPC-MET-04"
        title="SERVER-SIDE COUNT"
        description="Form submits a Server Action wrapped with withLabMetric. The metric fires on the Node runtime, not the browser."
        result={
          serverState?.ok
            ? `server count() emitted\nt=${new Date(serverState.t).toISOString()}`
            : null
        }
        resultTone="ok"
      >
        <form action={serverFormAction}>
          <LabTriggerSubmit>EMIT</LabTriggerSubmit>
        </form>
      </LabSpecimen>

      <LabSpecimen
        number="05"
        id="SPC-MET-05"
        title="ATTRIBUTE FAN-OUT"
        description="Cycles through bounded enums (region × tier × page) on each click. Demonstrates filterable dimensions while staying low-cardinality."
        result={log?.id === "SPC-MET-05" ? log.text : null}
        resultTone="info"
      >
        <LabTrigger
          lab="metrics"
          specimen="SPC-MET-05"
          onClickAction={() => {
            const region = REGIONS[fanoutTick % REGIONS.length];
            const tier = TIERS[fanoutTick % TIERS.length];
            const page = PAGES[fanoutTick % PAGES.length];
            const ms = 50 + Math.random() * 450;
            // TODO: Sentry.metrics.distribution("metrics_demo_distribution", ms, {
            //   unit: "millisecond",
            //   attributes: { region, tier, page },
            // });
            setFanoutTick(fanoutTick + 1);
            setLog({
              id: "SPC-MET-05",
              text: `distribution=${ms.toFixed(1)}ms\nattributes={ region: "${region}", tier: "${tier}", page: "${page}" }`,
              tone: "info",
            });
          }}
        >
          EMIT
        </LabTrigger>
      </LabSpecimen>
    </div>
  );
}
