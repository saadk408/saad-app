type Variant = "square" | "portrait";

function seed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickByte(value: number, index: number): number {
  return (value >>> (index * 8)) & 0xff;
}

type Props = { id: string; variant?: Variant; className?: string };

export function SpecimenGlyph({ id, variant = "square", className }: Props) {
  const s = seed(id);
  const a = pickByte(s, 0);
  const b = pickByte(s, 1);
  const c = pickByte(s, 2);
  const d = pickByte(s, 3);

  const w = 100;
  const h = variant === "portrait" ? 125 : 100;

  const cx = 22 + (a % 56);
  const cy = 18 + (b % (h - 40));
  const r = 14 + (c % 16);

  const rx = 8 + (b % 26);
  const ry = h - 36 - (d % 18);
  const rw = 26 + (a % 32);
  const rh = 14 + (c % 16);

  const lineCount = (s & 1) === 0 ? 1 : 2;
  const accent = s % 3;

  const ink = "var(--color-ink)";
  const amber = "var(--color-signal)";
  const soft = "var(--color-paper-soft)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className ?? "w-full h-full"}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x={0} y={0} width={w} height={h} fill={soft} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={accent === 0 ? amber : "none"}
        stroke={accent === 0 ? "none" : ink}
        strokeWidth={1}
      />
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        fill={accent === 1 ? amber : "none"}
        stroke={accent === 1 ? "none" : ink}
        strokeWidth={1}
      />
      <line
        x1={6}
        y1={h - 6 - (a % 6)}
        x2={w - 6}
        y2={h - 6 - (b % 6)}
        stroke={accent === 2 ? amber : ink}
        strokeWidth={1}
      />
      {lineCount > 1 ? (
        <line
          x1={6 + (c % 24)}
          y1={6}
          x2={6 + (d % 24)}
          y2={h - 36}
          stroke={ink}
          strokeWidth={1}
          strokeDasharray="2 4"
        />
      ) : null}
    </svg>
  );
}
