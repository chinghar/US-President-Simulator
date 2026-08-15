import type { StateId } from '../engine/types';

/**
 * Grid (column, row) position for each state/DC in a "tile cartogram" —
 * every state gets an equal-size cell instead of its true (wildly unequal)
 * area, the standard approach for a readable 51-region results map. Not
 * geographically precise, but relative position and adjacency are preserved
 * closely enough to read at a glance. AK and HI are conventional insets.
 */
export const STATE_GRID_POSITIONS: Record<StateId, { col: number; row: number }> = {
  AK: { col: 0, row: 6 },
  HI: { col: 1, row: 6 },
  WA: { col: 1, row: 0 },
  OR: { col: 1, row: 1 },
  CA: { col: 1, row: 2 },
  ID: { col: 2, row: 1 },
  NV: { col: 2, row: 2 },
  UT: { col: 2, row: 3 },
  AZ: { col: 2, row: 4 },
  MT: { col: 3, row: 0 },
  WY: { col: 3, row: 1 },
  CO: { col: 3, row: 2 },
  NM: { col: 3, row: 3 },
  ND: { col: 4, row: 0 },
  SD: { col: 4, row: 1 },
  NE: { col: 4, row: 2 },
  KS: { col: 4, row: 3 },
  OK: { col: 4, row: 4 },
  TX: { col: 4, row: 5 },
  MN: { col: 5, row: 0 },
  IA: { col: 5, row: 1 },
  MO: { col: 5, row: 2 },
  AR: { col: 5, row: 3 },
  LA: { col: 5, row: 4 },
  WI: { col: 6, row: 0 },
  IL: { col: 6, row: 1 },
  TN: { col: 6, row: 2 },
  MS: { col: 6, row: 3 },
  AL: { col: 6, row: 4 },
  MI: { col: 7, row: 0 },
  IN: { col: 7, row: 1 },
  KY: { col: 7, row: 2 },
  GA: { col: 7, row: 4 },
  FL: { col: 7, row: 5 },
  PA: { col: 8, row: 0 },
  OH: { col: 8, row: 1 },
  WV: { col: 8, row: 2 },
  VA: { col: 8, row: 3 },
  NC: { col: 8, row: 4 },
  SC: { col: 8, row: 5 },
  NY: { col: 9, row: 0 },
  NJ: { col: 9, row: 1 },
  DE: { col: 9, row: 2 },
  MD: { col: 9, row: 3 },
  DC: { col: 9, row: 4 },
  VT: { col: 10, row: 0 },
  MA: { col: 10, row: 1 },
  CT: { col: 10, row: 2 },
  RI: { col: 10, row: 3 },
  ME: { col: 11, row: 0 },
  NH: { col: 11, row: 1 },
};

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 7;
