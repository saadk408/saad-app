import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] max-w-md mx-auto flex flex-col items-center justify-center text-center cascade">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--color-mute)] mb-4">
        404 / NOT FOUND
      </p>
      <h1 className="font-display text-6xl leading-[0.95] mb-5">
        Specimen unavailable.
      </h1>
      <p className="font-display italic text-lg text-[var(--color-mute)] mb-8 max-w-[40ch]">
        That specimen was not found in this lab. It may have been retired, never
        logged, or moved to long-term storage.
      </p>
      <Link
        href="/"
        className="link-underline text-[var(--color-signal-dim)] dark:text-[var(--color-signal)] text-[13px] tracking-[0.14em] uppercase pb-[2px]"
      >
        Return to lab →
      </Link>
    </div>
  );
}
