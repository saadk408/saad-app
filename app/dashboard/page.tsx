import Link from "next/link";
import { getCounters } from "@/lib/store";
import { PageHeader } from "@/app/components/page-header";

type Tag = "INF" | "WRN" | "ERR" | "TRC";

const stream: Array<{ tag: Tag; text: string }> = [
  { tag: "INF", text: "GET /products status=200 dur=312ms" },
  { tag: "TRC", text: "POST /api/echo hops=3 status=200 dur=240ms" },
  { tag: "INF", text: "act addItem qty=1 dur=18ms" },
  { tag: "WRN", text: "log.warn cache miss key=products" },
  { tag: "ERR", text: "act runBuggyCheckout TypeError stack=4" },
  { tag: "INF", text: "POST /api/checkout status=200 dur=420ms" },
  { tag: "TRC", text: "POST /api/payment status=200 dur=391ms" },
  { tag: "INF", text: "GET /cart status=200 dur=104ms" },
];

const tagColor: Record<Tag, string> = {
  INF: "text-[var(--color-ink)]",
  WRN: "text-[var(--color-signal-dim)] dark:text-[var(--color-signal)]",
  ERR: "text-[var(--color-crit)]",
  TRC: "text-[var(--color-trace)]",
};

export default function DashboardPage() {
  const c = getCounters();

  const stats = [
    { label: "ORDERS", value: c.orders, delta: c.orders > 0 ? `▲ +${c.orders}` : "—" },
    { label: "SIGNUPS", value: c.signups, delta: c.signups > 0 ? `▲ +${c.signups}` : "—" },
    { label: "ERRORS", value: c.errors, delta: c.errors > 0 ? `▼ +${c.errors}` : "—" },
    { label: "ACTIVE", value: 1, delta: "—" },
  ];

  return (
    <div className="cascade">
      <PageHeader
        number="04"
        total="06"
        path="/dashboard"
        title="Dashboard"
        subtitle="Live counters, faux telemetry stream, and a danger zone for trigger-happy operators."
      />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-[var(--color-ink)] pt-4">
            <div className="font-display text-[clamp(40px,5vw,64px)] leading-none mb-2 tabular-nums">
              {s.value}
            </div>
            <div className="flex justify-between text-[11px] tracking-[0.18em] uppercase">
              <span>{s.label}</span>
              <span className="text-[var(--color-mute)]">{s.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-20">
        <div className="flex items-baseline mb-4 text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)]">
          <span>TELEMETRY STREAM</span>
          <span className="leader-dots" aria-hidden />
          <span>{stream.length} EVENTS</span>
        </div>
        <ul className="text-[12px]">
          {stream.map((e, i) => (
            <li
              key={i}
              className="grid grid-cols-[40px_1fr] gap-3 py-2 border-t"
              style={{ borderColor: "color-mix(in srgb, var(--color-ink) 20%, transparent)" }}
            >
              <span className={`${tagColor[e.tag]} font-bold`}>{e.tag}</span>
              <span className="text-[var(--color-mute)]">{e.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="panel-soft p-6"
        style={{ borderColor: "var(--color-crit)", borderWidth: 2 }}
      >
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-crit)] mb-2">
          DANGER ZONE
        </p>
        <h2 className="font-display text-3xl mb-2">Trigger labs.</h2>
        <p className="font-display italic text-[var(--color-mute)] mb-6 max-w-[55ch]">
          These will throw, log, or trace on demand. Bring popcorn.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/labs/errors" className="btn-trigger no-underline">
            <span className="btn-trigger-label">[ ERRORS ]</span>
          </Link>
          <Link href="/labs/tracing" className="btn-trigger no-underline">
            <span className="btn-trigger-label">[ TRACING ]</span>
          </Link>
          <Link href="/labs/seer" className="btn-trigger no-underline">
            <span className="btn-trigger-label">[ SEER ]</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
