import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/store";
import { SpecimenGlyph } from "@/app/components/specimen-glyph";
import { PageHeader } from "@/app/components/page-header";
import { BuyButton } from "./buy-button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="cascade">
      <PageHeader
        number="01"
        total="06"
        path={`/products/${product.id}`}
        title={product.name}
        subtitle="Specimen details, ready for the cart."
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-6">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <SpecimenGlyph id={product.id} variant="portrait" />
          </div>
        </div>
        <div className="lg:col-span-6 flex flex-col gap-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)]">
            SKU {product.id} &middot; {product.category}
          </p>
          <p className="font-display italic text-xl max-w-[55ch] leading-snug">
            {product.description}
          </p>
          <div className="font-display text-4xl">${product.price.toFixed(2)}</div>
          <BuyButton productId={product.id} />
          <Link
            href="/products"
            className="link-underline self-start text-[11px] tracking-[0.16em] uppercase pb-[2px] text-[var(--color-mute)]"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
