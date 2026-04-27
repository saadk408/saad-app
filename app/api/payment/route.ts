class PaymentDeclinedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentDeclinedError";
  }
}

class GatewayTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayTimeoutError";
  }
}

export async function POST() {
  const roll = Math.random();

  if (roll < 0.7) {
    return Response.json({ ok: true });
  }

  if (roll < 0.85) {
    throw new PaymentDeclinedError("Card declined: insufficient funds");
  }

  throw new GatewayTimeoutError("Stripe gateway exceeded 5s SLA");
}
