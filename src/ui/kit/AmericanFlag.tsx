const RATIO_W = 190;
const RATIO_H = 100;
const STRIPE_COUNT = 13;
const STRIPE_H = RATIO_H / STRIPE_COUNT;
const CANTON_W = RATIO_W * 0.4;
const CANTON_H = STRIPE_H * 7;
const STAR_ROWS = 5;
const STAR_COLS = 6;

/**
 * The flag — drawn as flat vector geometry in the app's own red/white/blue
 * (--flag / --parchment / --union), not an emoji or photograph, so it sits
 * on the same engraved-document register as everything else. Colors are
 * fixed across light/dark mode, like ink on a printed flag would be.
 */
export function AmericanFlag({ width = 48, className = '' }: { width?: number; className?: string }) {
  const height = width / 1.9;
  const starGapX = CANTON_W / (STAR_COLS + 1);
  const starGapY = CANTON_H / (STAR_ROWS + 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${RATIO_W} ${RATIO_H}`}
      role="img"
      aria-label="Flag of the United States"
      className={className}
    >
      <rect x="0" y="0" width={RATIO_W} height={RATIO_H} fill="var(--parchment)" />
      {Array.from({ length: STRIPE_COUNT }, (_, i) =>
        i % 2 === 0 ? <rect key={i} x="0" y={i * STRIPE_H} width={RATIO_W} height={STRIPE_H} fill="var(--flag)" /> : null,
      )}
      <rect x="0" y="0" width={CANTON_W} height={CANTON_H} fill="var(--union)" />
      {Array.from({ length: STAR_ROWS }, (_, row) =>
        Array.from({ length: STAR_COLS }, (_, col) => (
          <circle key={`${row}-${col}`} cx={starGapX * (col + 1)} cy={starGapY * (row + 1)} r={1.7} fill="var(--parchment)" />
        )),
      )}
      <rect x="0.5" y="0.5" width={RATIO_W - 1} height={RATIO_H - 1} fill="none" stroke="var(--rule)" strokeWidth="1" />
    </svg>
  );
}
