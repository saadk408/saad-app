"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addToCart,
  setQty as storeSetQty,
  clearCart,
  bumpCounter,
} from "@/lib/store";
import { delay } from "@/lib/slow";
import { originFromHeaders } from "@/lib/origin";

export async function addItem(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) throw new Error("addItem: missing productId");
  addToCart(productId, 1);
  revalidatePath("/cart");
  revalidatePath("/products");
}

export async function setQty(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty") ?? 0);
  if (!productId) throw new Error("setQty: missing productId");
  if (Number.isNaN(qty) || qty < 0) {
    throw new Error("setQty: quantity must be a non-negative number");
  }
  storeSetQty(productId, qty);
  revalidatePath("/cart");
}

export async function checkout() {
  await delay(800);
  const origin = await originFromHeaders();

  const res = await fetch(`${origin}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(`Checkout failed: ${body.error ?? res.status}`);
  }

  const data = (await res.json()) as { orderId: string };
  bumpCounter("orders");
  clearCart();
  revalidatePath("/cart");
  revalidatePath("/dashboard");
  redirect(`/cart?ok=1&order=${encodeURIComponent(data.orderId)}`);
}
