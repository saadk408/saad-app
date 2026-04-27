"use server";

import { bumpCounter } from "@/lib/store";
import { revalidatePath } from "next/cache";

export async function bumpSignup() {
  bumpCounter("signups");
  revalidatePath("/dashboard");
}
