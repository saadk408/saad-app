"use server";

export async function serverLog(formData: FormData): Promise<void> {
  const fields = {
    orderId: String(formData.get("orderId") ?? "ord_test"),
    userId: String(formData.get("userId") ?? "usr_anon"),
    total: Number(formData.get("total") ?? 0),
    at: new Date().toISOString(),
  };

  console.info("server.log.info", fields);
  console.warn("server.log.warn", { ...fields, reason: "soft-budget-exceeded" });
  console.error("server.log.error", { ...fields, reason: "kafka-lag" });

  // TODO: when Sentry is wired in, replace with Sentry.logger.{info,warn,error}({ ...fields }).
}
