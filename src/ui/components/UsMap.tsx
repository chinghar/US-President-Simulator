import { useState } from 'react';
import { STATE_LIST } from '../../data/states';
import { GRID_COLUMNS, GRID_ROWS, STATE_GRID_POSITIONS } from '../../data/state-grid';
import type { StateId } from '../../engine/types';

const CELL = 44;
const GAP = 3;
const PAD = 4;
/** Margins at or beyond this magnitude render as a solid fill rather than a
 * hatch pattern — a period-atlas convention for "decisively called." */
const SOLID_THRESHOLD = 20;

export interface UsMapProps {
  /** -100 (fully negativeColor) .. +100 (fully positiveColor). 0 = even, no color. */
  marginForState: (stateId: StateId) => number;
  /** Defaults to --union — party maps only; the approval map overrides this with --flag. */
  negativeColor?: string;
  /** Defaults to --flag — party maps only; the approval map overrides this with --seal. */
  positiveColor?: string;
  onSelectState?: (stateId: StateId) => void;
  onHoverState?: (stateId: StateId | null) => void;
  selectedState?: StateId | null;
}

function hatchSpacing(absMargin: number): number {
  const t = Math.min(absMargin, SOLID_THRESHOLD) / SOLID_THRESHOLD;
  return 8 - t * 5.5; // sparse (8px) near even, dense (2.5px) approaching the solid threshold
}

/**
 * An engraved tile-grid US map: states are filled with diagonal-hairline
 * hatch patterns whose density encodes margin strength and whose color
 * reads --union (blue) or --flag (red) — solid fill only past a 20-point
 * margin. This reads like a period atlas rather than a saturation heatmap,
 * and keeps close states legible. See data/state-grid.ts for the layout.
 */
export function UsMap({
  marginForState,
  negativeColor = 'var(--union)',
  positiveColor = 'var(--flag)',
  onSelectState,
  onHoverState,
  selectedState,
}: UsMapProps) {
  const [hovered, setHovered] = useState<StateId | null>(null);
  const width = GRID_COLUMNS * (CELL + GAP) + PAD * 2;
  const height = GRID_ROWS * (CELL + GAP) + PAD * 2;

  function handleHover(stateId: StateId | null) {
    setHovered(stateId);
    onHoverState?.(stateId);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Map of US states">
      <defs>
        {STATE_LIST.map((state) => {
          const margin = marginForState(state.id);
          const abs = Math.abs(margin);
          const color = margin < 0 ? negativeColor : margin > 0 ? positiveColor : 'var(--rule)';
          const spacing = hatchSpacing(abs);
          return (
            <pattern
              key={state.id}
              id={`hatch-${state.id}`}
              patternUnits="userSpaceOnUse"
              width={spacing}
              height={spacing}
              patternTransform="rotate(45)"
            >
              <rect width={spacing} height={spacing} fill="var(--ink-700)" />
              <line x1="0" y1="0" x2="0" y2={spacing} stroke={color} strokeWidth="1.1" />
            </pattern>
          );
        })}
      </defs>

      {STATE_LIST.map((state) => {
        const pos = STATE_GRID_POSITIONS[state.id];
        const x = PAD + pos.col * (CELL + GAP);
        const y = PAD + pos.row * (CELL + GAP);
        const margin = marginForState(state.id);
        const abs = Math.abs(margin);
        const solidColor = margin < 0 ? negativeColor : margin > 0 ? positiveColor : 'var(--rule)';
        const fill = abs >= SOLID_THRESHOLD ? solidColor : `url(#hatch-${state.id})`;
        const isSelected = selectedState === state.id;
        const isHovered = hovered === state.id;

        return (
          <g
            key={state.id}
            transform={`translate(${x},${y})`}
            onClick={() => onSelectState?.(state.id)}
            onMouseEnter={() => handleHover(state.id)}
            onMouseLeave={() => handleHover(null)}
            onFocus={() => handleHover(state.id)}
            onBlur={() => handleHover(null)}
            tabIndex={onSelectState ? 0 : -1}
            role={onSelectState ? 'button' : undefined}
            aria-label={onSelectState ? state.name : undefined}
            className={onSelectState ? 'cursor-pointer' : undefined}
          >
            <rect
              width={CELL}
              height={CELL}
              fill={fill}
              stroke={isSelected || isHovered ? 'var(--paper)' : 'var(--rule)'}
              strokeWidth={isSelected || isHovered ? 1.5 : 0.75}
            />
            <text x={CELL / 2} y={CELL / 2 + 4} textAnchor="middle" className="fill-paper font-mono text-[13px] font-medium">
              {state.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
