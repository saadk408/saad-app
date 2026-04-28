"use server";

import { withLabMetric } from "@/lib/metrics";

export type ServerCountResult = { ok: true; t: number };

export const recordServerCount = withLabMetric(
  "metrics",
  "SPC-MET-04",
  async (): Promise<ServerCountResult> => {
    // TODO: Sentry.metrics.count("metrics_demo_count", 1, { attributes: { runtime: "server" } });
    return { ok: true, t: Date.now() };
  },
);
