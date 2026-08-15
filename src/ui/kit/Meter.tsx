interface MeterProps {
  /** 0..100 */
  value: number;
  color?: string;
  className?: string;
}

/** A hairline-bordered progress track — no radius, no shadow, no glow.
 * Width transitions 250ms per the motion budget. */
export function Meter({ value, color = 'var(--seal)', className = '' }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full border border-rule bg-ink-900 ${className}`}>
      <div className="h-full transition-[width] duration-250 ease-out" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}

/** The left-rail political capital indicator — a discrete segmented block
 * bar (a printed-ledger tally, not a smooth gradient). */
export function SegmentMeter({ value, max = 100, segments = 10, className = '' }: { value: number; max?: number; segments?: number; className?: string }) {
  const filled = Math.round((Math.max(0, Math.min(max, value)) / max) * segments);
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} className={`h-3 flex-1 border border-rule ${i < filled ? 'bg-seal' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}
