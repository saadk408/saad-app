"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { setQty, checkout } from "./actions";

type Line = {
  productId: string;
  qty: number;
  name: string;
  price: number;
  lineTotal: number;
};

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-action w-full">
      {pending ? "PROCESSING …" : "CHECKOUT"}
    </button>
  );
}

function QtyControl({ line }: { line: Line }) {
  return (
    <form action={setQty} className="inline-flex items-center gap-2">
      <input type="hidden" name="productId" value={line.productId} />
      <button
        type="submit"
        name="qty"
        value={Math.max(0, line.qty - 1)}
        className="border border-[var(--color-ink)] w-6 h-6 leading-none flex items-center justify-center hover:bg-[var(--color-paper-soft)]"
        aria-label="Decrement"
      >
        −
      </button>
      <span className="w-8 text-center tabular-nums">{line.qty}</span>
      <button
        type="submit"
        name="qty"
        value={line.qty + 1}
        className="border border-[var(--color-ink)] w-6 h-6 leading-none flex items-center justify-center hover:bg-[var(--color-paper-soft)]"
        aria-label="Increment"
      >
        +
      </button>
    </form>
  );
}

export function CartForm({ lines, total }: { lines: Line[]; total: number }) {
  if (lines.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[var(--color-mute)] mb-6 font-display italic text-lg">
          No specimens in cart.
        </p>
        <Link
          href="/products"
          className="link-underline text-[12px] tracking-[0.14em] uppercase pb-[2px]"
        >
          BROWSE PRODUCTS
        </Link>
      </div>
    );
  }

  return (
    <div>
      <table className="w-full text-[13px] mb-12">
        <thead>
          <tr className="text-[10px] tracking-[0.18em] uppercase text-[var(--color-mute)]">
            <th className="text-left pb-3 font-normal">ITEM</th>
            <th className="text-left pb-3 font-normal">SKU</th>
            <th className="text-left pb-3 font-normal w-[140px]">QTY</th>
            <th className="text-right pb-3 font-normal">UNIT</th>
            <th className="text-right pb-3 font-normal">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.productId} className="divider-soft">
              <td className="py-4">{line.name}</td>
              <td className="py-4 text-[var(--color-mute)]">{line.productId}</td>
              <td className="py-4">
                <QtyControl line={line} />
              </td>
              <td className="py-4 text-right tabular-nums">${line.price.toFixed(2)}</td>
              <td className="py-4 text-right tabular-nums">${line.lineTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--color-ink)]">
            <td colSpan={4} className="pt-6 text-right font-display text-2xl">
              Total
            </td>
            <td className="pt-6 text-right font-display text-2xl tabular-nums">
              ${total.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
      <form action={checkout}>
        <CheckoutButton />
      </form>
    </div>
  );
}
