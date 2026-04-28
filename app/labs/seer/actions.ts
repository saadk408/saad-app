"use server";

import { withLabMetric } from "@/lib/metrics";

type LineItem = { productId: string; code?: string };
type CheckoutInput = { lineItems: LineItem[] };

type SeerResult =
  | { ok: true; lineItems: number; total: number }
  | { ok: false; name: string; message: string; frames: string[] };

/** Top-level orchestrator. Walks the line items and applies pricing. */
function parseOrder(input: CheckoutInput): number[] {
  return input.lineItems.map(validateLineItem);
}

/** Per-item pricing. Looks up unit price, then folds the discount in. */
function validateLineItem(item: LineItem): number {
  const price = priceOf(item.productId);
  return applyDiscount(price, item.code);
}

/**
 * Catalog price lookup. Returns undefined for unknown SKUs to simulate a
 * stale catalog row — the caller is expected to handle this.
 */
function priceOf(productId: string): number | undefined {
  if (productId === "missing") return undefined;
  return 100;
}

/**
 * Discount calculation. Bug: when price is undefined and code is present,
 * the call to .toFixed() throws TypeError. The whole point of this lab.
 */
function applyDiscount(
  price: number | undefined,
  code: string | undefined,
): number {
  if (!code || code.length < 3) return price ?? 0;
  // Intentional bug: no guard against `price === undefined`.
  return Number((price as number).toFixed(2)) * (1 - 0.1);
}

export const runBuggyCheckout = withLabMetric(
  "seer",
  "SPC-SEE-01",
  async (): Promise<SeerResult> => {
    try {
      const totals = parseOrder({
        lineItems: [{ productId: "missing", code: "SUMMER10" }],
      });
      return { ok: true, lineItems: totals.length, total: totals.reduce((a, b) => a + b, 0) };
    } catch (err) {
      const e = err as Error;
      return {
        ok: false,
        name: e.name,
        message: e.message,
        frames: (e.stack ?? "no stack").split("\n").slice(0, 14),
      };
    }
  },
);
