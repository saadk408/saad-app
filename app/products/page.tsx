import Link from "next/link";
import { listProducts } from "@/lib/store";
import { SpecimenGlyph } from "@/app/components/specimen-glyph";
import { PageHeader } from "@/app/components/page-header";

export default function ProductsPage() {
  const products = listProducts();
  return (
    <div className="cascade">
      <PageHeader
        number="01"
        total="06"
        path="/products"
        title="Products"
        subtitle="Lab specimens available for purchase. Each one mutates state and exercises a different telemetry surface."
      />
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="specimen-card block no-underline text-[var(--color-ink)]"
            >
              <span className="specimen-id">{p.id}</span>
              <div className="aspect-square w-full mb-4 mt-2 overflow-hidden">
                <SpecimenGlyph id={p.id} variant="square" />
              </div>
              <div className="flex items-baseline">
                <h3 className="font-display text-lg link-underline">{p.name}</h3>
                <span className="leader-dots" aria-hidden />
                <span className="text-[12px] text-[var(--color-mute)]">
                  ${p.price.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] tracking-[0.18em] uppercase text-[var(--color-mute)] mt-2">
                {p.category}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
