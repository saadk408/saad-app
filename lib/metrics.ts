import "server-only";

import * as Sentry from "@sentry/nextjs";

export function withLabMetric<TArgs extends unknown[], TResult>(
  lab: string,
  specimen: string,
  fn: (...args: TArgs) => Promise<TResult> | TResult,
): (...args: TArgs) => Promise<TResult> {
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
}
