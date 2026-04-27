"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/signin", label: "Sign in" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/labs", label: "Labs" },
];

export function Nav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-[var(--color-ink)] bg-[color-mix(in_srgb,var(--color-paper)_92%,transparent)] backdrop-blur">
      <div className="mx-auto max-w-6xl h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline text-[var(--color-ink)]">
          <span className="font-display text-[20px] tracking-tight">Sentry Test Lab</span>
          <span className="border border-[var(--color-ink)] px-2 py-[2px] text-[10px] tracking-[0.18em] uppercase font-mono">
            LAB.001
          </span>
        </Link>
        <ul className="flex items-center gap-7">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline text-[12px] tracking-[0.14em] uppercase pb-[2px] no-underline text-[var(--color-ink)]"
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
