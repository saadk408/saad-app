type LogBody = {
  orderId?: string;
  userId?: string;
  total?: number;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LogBody;
  const fields = {
    orderId: body.orderId ?? `ord_${crypto.randomUUID().slice(0, 8)}`,
    userId: body.userId ?? "anon",
    total: body.total ?? 0,
    at: new Date().toISOString(),
  };

  console.info("log.info", { ...fields, level: "info" });
  console.warn("log.warn", { ...fields, level: "warn", reason: "soft-budget-exceeded" });
  console.error("log.error", { ...fields, level: "error", reason: "kafka-lag" });

  return Response.json({ logged: 3, fields });
}
