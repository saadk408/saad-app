type IconProps = { className?: string };

export function ArrowRight10({ className }: IconProps) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="square"
      aria-hidden
    >
      <line x1={1} y1={5} x2={9} y2={5} />
      <polyline points="6,2 9,5 6,8" />
    </svg>
  );
}
