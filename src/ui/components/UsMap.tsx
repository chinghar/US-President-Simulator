import { STATES, STATE_LIST } from '../../data/states';
import { GRID_COLUMNS, GRID_ROWS, STATE_GRID_POSITIONS } from '../../data/state-grid';
import type { StateId } from '../../engine/types';

const CELL = 44;
const GAP = 3;
const PAD = 4;

export interface UsMapProps {
  /** Fill color for a state's tile. */
  colorForState: (stateId: StateId) => string;
  /** Optional short text under the state abbreviation (e.g. an EV count or a margin). */
  subLabelForState?: (stateId: StateId) => string | null;
  onSelectState?: (stateId: StateId) => void;
  selectedState?: StateId | null;
}

/** A tile-grid US map — every state gets an equal-size cell rather than its
 * true (wildly unequal) area, the standard readable approach for a 51-region
 * results map. See data/state-grid.ts for the layout. */
export function UsMap({ colorForState, subLabelForState, onSelectState, selectedState }: UsMapProps) {
  const width = GRID_COLUMNS * (CELL + GAP) + PAD * 2;
  const height = GRID_ROWS * (CELL + GAP) + PAD * 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Map of US states">
      {STATE_LIST.map((state) => {
        const pos = STATE_GRID_POSITIONS[state.id];
        const x = PAD + pos.col * (CELL + GAP);
        const y = PAD + pos.row * (CELL + GAP);
        const fill = colorForState(state.id);
        const subLabel = subLabelForState?.(state.id);
        const isSelected = selectedState === state.id;

        return (
          <g
            key={state.id}
            transform={`translate(${x},${y})`}
            onClick={() => onSelectState?.(state.id)}
            className={onSelectState ? 'cursor-pointer' : undefined}
          >
            <rect
              width={CELL}
              height={CELL}
              rx={4}
              fill={fill}
              stroke={isSelected ? '#38bdf8' : '#0b1120'}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            <text x={CELL / 2} y={subLabel ? CELL / 2 - 3 : CELL / 2 + 4} textAnchor="middle" className="fill-white text-[13px] font-semibold" style={{ fontFamily: 'inherit' }}>
              {state.id}
            </text>
            {subLabel && (
              <text x={CELL / 2} y={CELL / 2 + 13} textAnchor="middle" className="fill-white/80 text-[10px]" style={{ fontFamily: 'inherit' }}>
                {subLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Blue (Democratic-favoring) -> gray (even) -> red (Republican-favoring)
 * for a margin expressed as -100 (fully Dem) .. +100 (fully Rep). */
export function marginColor(margin: number): string {
  const clamped = Math.max(-100, Math.min(100, margin));
  if (clamped >= 0) {
    const t = clamped / 100;
    return mix('#475569', '#dc2626', t);
  }
  const t = -clamped / 100;
  return mix('#475569', '#2563eb', t);
}

/** Green (high approval) -> gray (50) -> red (low approval) for a 0..100 approval score. */
export function approvalColor(approval: number): string {
  const clamped = Math.max(0, Math.min(100, approval));
  if (clamped >= 50) {
    const t = (clamped - 50) / 50;
    return mix('#475569', '#16a34a', t);
  }
  const t = (50 - clamped) / 50;
  return mix('#475569', '#dc2626', t);
}

function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function partisanMargin(stateId: StateId): number {
  return STATES[stateId].partisanBaseline;
}
