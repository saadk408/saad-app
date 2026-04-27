import { originFromRequest } from "@/lib/origin";

export async function POST(request: Request) {
  const origin = originFromRequest(request);
  const paymentRes = await fetch(`${origin}/api/payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!paymentRes.ok) {
    const errorBody = await paymentRes
      .json()
      .catch(() => ({ error: `payment failed (${paymentRes.status})` }));
    return Response.json(
      { ok: false, ...errorBody },
      { status: paymentRes.status === 500 ? 502 : paymentRes.status },
    );
  }

  return Response.json({ ok: true, orderId: crypto.randomUUID() });
}
