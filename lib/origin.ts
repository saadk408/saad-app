import { headers } from "next/headers";

export function originFromRequest(request: Request): string {
  return new URL(request.url).origin;
}

export async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
