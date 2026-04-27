import Link from "next/link";
import { getCart, getProduct } from "@/lib/store";
import { PageHeader } from "@/app/components/page-header";
import { CartForm } from "./cart-form";

type Search = Promise<{ ok?: string; order?: string }>;

export default async function CartPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { ok, order } = await searchParams;

  if (ok === "1") {
    const receipt = order ?? "ord_pending";
    return (
      <div className="cascade max-w-2xl mx-auto text-center py-32">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-4">
          RECEIPT &middot; LOGGED
        </p>
        <h1 className="font-display text-6xl mb-6">ORDER LOGGED</h1>
        <p className="font-display italic text-[var(--color-mute)] mb-10">
          Receipt no. <span className="font-mono">{receipt}</span>
        </p>
        <Link href="/products" className="btn-action no-underline inline-flex">
          CONTINUE BROWSING
        </Link>
      </div>
    );
  }

  const lines = getCart().map((c) => {
    const p = getProduct(c.productId);
    return p
      ? {
          productId: c.productId,
          qty: c.qty,
          name: p.name,
          price: p.price,
          lineTotal: p.price * c.qty,
        }
      : {
          productId: c.productId,
          qty: c.qty,
          name: "Unknown",
          price: 0,
          lineTotal: 0,
        };
  });
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <div className="cascade">
      <PageHeader
        number="02"
        total="06"
        path="/cart"
        title="Cart"
        subtitle="Modify the active basket. Checkout fans out into /api/checkout → /api/payment."
      />
      <CartForm lines={lines} total={total} />
    </div>
  );
}
