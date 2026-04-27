export type LabTone = "ok" | "err" | "info";

export type LogEntry = { id: string; text: string; tone?: LabTone };

const toneColor: Record<LabTone, string> = {
  ok: "var(--color-signal-dim)",
  err: "var(--color-crit)",
  info: "var(--color-ink)",
};

type Props = {
  number: string;
  id: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  result?: string | null;
  resultTone?: LabTone;
};

export function LabSpecimen({
  number,
  id,
  title,
  description,
  children,
  result,
  resultTone = "info",
}: Props) {
  return (
    <div className="border border-[var(--color-ink)] p-6 mb-4 relative min-h-[180px]">
      <span className="specimen-number" aria-hidden>
        {number}
      </span>
      <span className="specimen-id">{id}</span>
      <div className="ml-28">
        <h3 className="text-[12px] tracking-[0.18em] uppercase mt-3 mb-3">{title}</h3>
        <p className="font-display italic text-[15px] max-w-[60ch] mb-5 text-[var(--color-mute)] leading-snug">
          {description}
        </p>
        <div className="flex items-center gap-4 flex-wrap">{children}</div>
        {result ? (
          <pre
            className="panel-soft mt-4 p-3 text-[11px] overflow-auto whitespace-pre-wrap"
            style={{ color: toneColor[resultTone] }}
          >
            {result}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
