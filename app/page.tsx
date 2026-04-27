import { Fragment } from "react";
import { SpecimenCard } from "./components/specimen-card";

const tiles = [
  {
    id: "SPC-001",
    title: "Products",
    description:
      "Catalog of test specimens with detail pages, async params, and add-to-cart server actions.",
    href: "/products",
  },
  {
    id: "SPC-002",
    title: "Cart",
    description:
      "Multi-line cart, server-side mutations, checkout that fans out into a payment route.",
    href: "/cart",
  },
  {
    id: "SPC-003",
    title: "Sign in",
    description:
      "Form with masked password input. Fifty-fifty success rate by design.",
    href: "/signin",
  },
  {
    id: "SPC-004",
    title: "Dashboard",
    description:
      "Live counters and a telemetry stream. Danger zone links straight into the labs.",
    href: "/dashboard",
  },
  {
    id: "SPC-005",
    title: "Labs",
    description:
      "Bug-trigger gym for errors, tracing, logs, Seer, and user feedback.",
    href: "/labs",
  },
  {
    id: "SPC-006",
    title: "Feedback",
    description:
      "Where the Sentry feedback widget will mount once the SDK is wired.",
    href: "/labs/feedback",
  },
];

const features: ReadonlyArray<readonly [string, string]> = [
  ["Error monitoring · client", "/labs/errors · app/error.tsx · global-error.tsx"],
  ["Error monitoring · server", "Server Actions · /api/* failures"],
  ["Tracing · auto", "Page navigations · Route Handlers · fetch chains"],
  ["Tracing · custom spans", "/labs/tracing TODOs"],
  ["Distributed tracing", "/api/checkout → /api/payment · 3-hop /api/echo"],
  ["Logs", "/labs/logs (client + server) · /api/log"],
  ["Session Replay", "/signin · /products · /cart"],
  ["Seer", "/labs/seer (deep stack + repo connection)"],
  ["User Feedback", "/labs/feedback (widget anchor)"],
  ["Profiling", "/api/slow · slow Server Action"],
];

export default function Home() {
  return (
    <div className="cascade space-y-20">
      <section className="relative min-h-[78vh] flex items-end pb-12">
        <div className="space-y-6">
          <h1
            className="font-display font-medium leading-[0.85] tracking-[-0.03em]"
            style={{ fontSize: "clamp(72px, 13vw, 192px)" }}
          >
            <span className="block">TELEMETRY</span>
            <span className="block">LAB.</span>
          </h1>
          <p className="text-[12px] tracking-[0.14em] uppercase text-[var(--color-mute)]">
            {"// click any specimen to trigger telemetry"}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-baseline mb-8 text-[11px] tracking-[0.16em] uppercase text-[var(--color-mute)]">
          <span>SPECIMENS</span>
          <span className="leader-dots" aria-hidden />
          <span>06 ENTRIES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <SpecimenCard key={t.id} {...t} />
          ))}
        </div>
      </section>

      <section className="pb-12">
        <div className="flex items-baseline mb-6 text-[11px] tracking-[0.16em] uppercase text-[var(--color-mute)]">
          <span>SENTRY FEATURES WIRED HERE</span>
          <span className="leader-dots" aria-hidden />
          <span>10 LANES</span>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-x-8 gap-y-3 text-[13px]">
          {features.map(([feature, surface]) => (
            <Fragment key={feature}>
              <dt className="text-[var(--color-ink)]">{feature}</dt>
              <dd className="text-[var(--color-mute)] truncate">{surface}</dd>
            </Fragment>
          ))}
        </dl>
      </section>
    </div>
  );
}
