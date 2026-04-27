import { delay } from "@/lib/slow";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ms = Math.max(0, Math.min(5000, Number(searchParams.get("ms") ?? 500)));
  await delay(ms);
  return Response.json({ slept: ms });
}
