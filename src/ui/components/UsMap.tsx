import { useMemo, useState } from 'react';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import usTopology from '../../data/geo/us-states-albers-10m.json';
import { FIPS_TO_STATE_ID } from '../../data/geo/fips';
import type { StateId } from '../../engine/types';

/** Margins at or beyond this magnitude render at full color intensity —
 * beyond this point a state reads as "decisively" one way or the other. */
const FULL_INTENSITY_THRESHOLD = 30;

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

function ringToPath(ring: number[][]): string {
  return `M${ring.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L')}Z`;
}

function geometryToPath(geometry: Polygon | MultiPolygon): string {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((rings) => rings.map(ringToPath).join(' ')).join(' ');
}

// Decoded once at module load — the topology itself never changes, so there's
// no reason to redo this work on every render or every mount.
const topology = usTopology as unknown as Topology<{ states: GeometryCollection }>;
const statesGeoJson = feature(topology, topology.objects.states) as unknown as FeatureCollection<Polygon | MultiPolygon>;
const [bx0, by0, bx1, by1] = topology.bbox as [number, number, number, number];
const VIEW_BOX = `${bx0.toFixed(1)} ${by0.toFixed(1)} ${(bx1 - bx0).toFixed(1)} ${(by1 - by0).toFixed(1)}`;

const STATE_PATHS: { id: StateId; d: string }[] = statesGeoJson.features
  .map((f) => ({ id: FIPS_TO_STATE_ID[String(f.id)], d: geometryToPath(f.geometry) }))
  .filter((s): s is { id: StateId; d: string } => !!s.id);

/**
 * A geographically accurate US map — real state shapes and sizes (Albers USA
 * projection, Alaska/Hawaii as the conventional insets), filled with a solid
 * color whose intensity encodes margin strength. No hatching, no tile grid.
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

  const fills = useMemo(() => {
    const map = new Map<StateId, string>();
    for (const { id } of STATE_PATHS) {
      const margin = marginForState(id);
      const intensity = Math.round(Math.min(100, (Math.abs(margin) / FULL_INTENSITY_THRESHOLD) * 100));
      const color = margin < 0 ? negativeColor : margin > 0 ? positiveColor : null;
      map.set(id, color ? `color-mix(in srgb, ${color} ${intensity}%, var(--ink-700))` : 'var(--ink-700)');
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginForState, negativeColor, positiveColor]);

  function handleHover(stateId: StateId | null) {
    setHovered(stateId);
    onHoverState?.(stateId);
  }

  return (
    <svg viewBox={VIEW_BOX} className="w-full" role="img" aria-label="Map of US states">
      {STATE_PATHS.map(({ id, d }) => {
        const isSelected = selectedState === id;
        const isHovered = hovered === id;
        return (
          <path
            key={id}
            d={d}
            fill={fills.get(id)}
            stroke={isSelected || isHovered ? 'var(--paper)' : 'var(--rule)'}
            strokeWidth={isSelected || isHovered ? 1.5 : 0.5}
            strokeLinejoin="round"
            onClick={() => onSelectState?.(id)}
            onMouseEnter={() => handleHover(id)}
            onMouseLeave={() => handleHover(null)}
            onFocus={() => handleHover(id)}
            onBlur={() => handleHover(null)}
            tabIndex={onSelectState ? 0 : -1}
            role={onSelectState ? 'button' : undefined}
            aria-label={onSelectState ? id : undefined}
            className={onSelectState ? 'cursor-pointer' : undefined}
          />
        );
      })}
    </svg>
  );
}
