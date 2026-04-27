type Props = {
  number: string;
  total: string;
  path: string;
  title: string;
  subtitle: string;
};

export function PageHeader({ number, total, path, title, subtitle }: Props) {
  return (
    <header className="mb-12">
      <div className="flex items-baseline mb-6 text-[11px] tracking-[0.16em] uppercase text-[var(--color-mute)]">
        <span>
          {number} / {total}
        </span>
        <span className="leader-dots" aria-hidden />
        <span>{path}</span>
      </div>
      <h1 className="font-display font-medium text-[clamp(48px,8vw,104px)] leading-[0.92] tracking-[-0.02em] mb-5">
        {title}
      </h1>
      <p className="font-display italic text-lg max-w-[72ch] text-[var(--color-mute)] mb-6">
        {subtitle}
      </p>
      <hr className="hairline" />
    </header>
  );
}
