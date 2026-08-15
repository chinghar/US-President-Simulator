/**
 * A small engraved guilloche flourish — used ONLY at the two outer corners
 * of the dashboard shell, nowhere else. Purely decorative, 30% opacity.
 */
export function CornerRosette({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ opacity: 0.3 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="var(--rule)" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="6.5" stroke="var(--rule)" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="3" stroke="var(--rule)" strokeWidth="0.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = 12 + Math.cos(angle) * 3;
        const y1 = 12 + Math.sin(angle) * 3;
        const x2 = 12 + Math.cos(angle) * 10;
        const y2 = 12 + Math.sin(angle) * 10;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--rule)" strokeWidth="0.4" />;
      })}
    </svg>
  );
}
