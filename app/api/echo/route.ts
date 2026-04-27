import { originFromRequest } from "@/lib/origin";

type EchoBody = { hops?: number };
type EchoResult = { chain: Array<{ hop: number; at: string }> };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as EchoBody;
  const hops = Math.max(1, Math.min(8, Number(body.hops ?? 1)));
  const at = new Date().toISOString();

  if (hops <= 1) {
    return Response.json({ chain: [{ hop: 1, at }] } satisfies EchoResult);
  }

  const origin = originFromRequest(request);
  const inner = await fetch(`${origin}/api/echo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hops: hops - 1 }),
  });
  const innerData = (await inner.json()) as EchoResult;

  return Response.json({
    chain: [{ hop: hops, at }, ...innerData.chain],
  } satisfies EchoResult);
}
