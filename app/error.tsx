"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function SegmentError({ error, unstable_retry }: ErrorProps) {
  return (
    <div className="cascade max-w-2xl">
      <div className="specimen-card relative" style={{ borderColor: "var(--color-crit)" }}>
        <span className="specimen-id">SPC-ERR-RUNTIME</span>
        <p className="text-[11px] tracking-[0.16em] uppercase text-[var(--color-mute)] mb-3">
          SEGMENT BOUNDARY · CAPTURED
        </p>
        <h1 className="font-display text-5xl mb-4">Specimen failed.</h1>
        <p className="font-display italic text-[var(--color-mute)] mb-6 max-w-[55ch]">
          A thrown exception bubbled up to this segment&rsquo;s boundary. The rest of the
          page is unaffected. Hit retry once you understand what fired.
        </p>
        <pre className="panel-soft text-xs p-4 mb-4 overflow-auto whitespace-pre-wrap">
          {error.message || String(error)}
        </pre>
        {error.digest ? (
          <p className="text-[11px] tracking-[0.16em] uppercase text-[var(--color-mute)] mb-6">
            digest · {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={unstable_retry}
          className="btn-trigger"
          aria-label="Retry the failed segment"
        >
          <span className="btn-trigger-label">[ RETRY ]</span>
        </button>
      </div>
    </div>
  );
}
