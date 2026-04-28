"use server";

import { withLabMetric } from "@/lib/metrics";
import { delay } from "@/lib/slow";

export const slowWork = withLabMetric(
  "tracing",
  "SPC-TRC-03",
  async (): Promise<void> => {
    await delay(1500);
  },
);
