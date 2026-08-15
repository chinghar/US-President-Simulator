import { describe, expect, it } from 'vitest';
import { STATE_GRID_POSITIONS } from '../src/data/state-grid';
import { STATE_IDS } from '../src/engine/types';

describe('state grid map layout', () => {
  it('has a unique, collision-free cell for all 51 states', () => {
    const entries = Object.entries(STATE_GRID_POSITIONS);
    expect(entries.length).toBe(51);
    expect(entries.length).toBe(STATE_IDS.length);

    const seen = new Set<string>();
    for (const [id, pos] of entries) {
      const key = `${pos.col},${pos.row}`;
      expect(seen.has(key), `duplicate grid cell ${key} (state ${id})`).toBe(false);
      seen.add(key);
    }
  });

  it('every StateId has a position and vice versa', () => {
    for (const id of STATE_IDS) {
      expect(STATE_GRID_POSITIONS[id]).toBeDefined();
    }
  });
});
