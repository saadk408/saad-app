import Link from "next/link";
import { ArrowRight10 } from "./icons";

type Props = {
  id: string;
  title: string;
  description: string;
  href: string;
  reserved?: boolean;
};

export function SpecimenCard({ id, title, description, href, reserved }: Props) {
  const content = (
    <>
      <span className="specimen-id">{id}</span>
      <h3 className="font-display text-2xl mt-2 mb-3">
        <span className="link-underline">{title}</span>
      </h3>
      <p className="font-display italic text-[15px] text-[var(--color-mute)] mb-6 max-w-[40ch]">
        {description}
      </p>
      <div className="mt-auto flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
        {reserved ? (
          <span className="text-[var(--color-mute)]">RESERVED</span>
        ) : (
          <>
            <span>ENTER</span>
            <ArrowRight10 />
          </>
        )}
      </div>
    </>
  );

  if (reserved) {
    return (
      <div
        className="specimen-card flex flex-col min-h-[200px] opacity-60 cursor-not-allowed"
        aria-disabled
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="specimen-card flex flex-col min-h-[200px] no-underline text-[var(--color-ink)]"
    >
      {content}
    </Link>
  );
}
