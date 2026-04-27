"use server";

import { delay } from "@/lib/slow";

export async function slowWork(): Promise<void> {
  await delay(1500);
}
