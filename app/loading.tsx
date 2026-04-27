export default function Loading() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-5">
      <p className="pulse-phosphor text-[12px] tracking-[0.22em] uppercase">
        ACQUIRING SIGNAL …
      </p>
      <div className="w-full max-w-sm relative h-[2px]">
        <span className="hairline absolute inset-0" />
        <span className="hairline-amber sweep absolute top-0 left-0 h-[1px]" />
      </div>
    </div>
  );
}
