/** An engraved guilloche seal glyph — concentric rings and a radial star,
 * brass-colored. The one deliberate brass flourish on the left rail; never
 * used elsewhere except legacy/signature contexts. */
export function PresidentialSeal({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="var(--brass)" strokeWidth="1" />
      <circle cx="24" cy="24" r="18" stroke="var(--brass)" strokeWidth="0.5" opacity="0.6" />
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 16;
        const inner = i % 2 === 0 ? 8 : 12;
        const x1 = 24 + Math.cos(angle) * inner;
        const y1 = 24 + Math.sin(angle) * inner;
        const x2 = 24 + Math.cos(angle) * 16;
        const y2 = 24 + Math.sin(angle) * 16;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--brass)" strokeWidth="0.5" opacity="0.7" />;
      })}
      <circle cx="24" cy="24" r="4" stroke="var(--brass)" strokeWidth="1" />
    </svg>
  );
}
