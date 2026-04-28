import "server-only";

export function withLabMetric<TArgs extends unknown[], TResult>(
  lab: string,
  specimen: string,
  fn: (...args: TArgs) => Promise<TResult> | TResult,
): (...args: TArgs) => Promise<TResult> {
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
}
