import { describe, expect, it } from 'vitest';
import { STATE_LIST, TOTAL_ELECTORAL_VOTES } from '../src/data/states';
import { STATE_IDS } from '../src/engine/types';

describe('electoral college', () => {
  it('totals exactly 538 electoral votes across all 50 states + DC', () => {
    expect(TOTAL_ELECTORAL_VOTES).toBe(538);
    expect(STATE_LIST.reduce((sum, s) => sum + s.electoralVotes, 0)).toBe(538);
  });

  it('has exactly 51 entries (50 states + DC), matching STATE_IDS', () => {
    expect(STATE_LIST.length).toBe(51);
    expect(STATE_LIST.length).toBe(STATE_IDS.length);
  });

  it('every state has a persona composition that sums to ~1.0', () => {
    for (const state of STATE_LIST) {
      const sum = Object.values(state.personaComposition).reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThan(0.97);
      expect(sum).toBeLessThan(1.03);
    }
  });

  it('national population weights across all states sum to ~1.0', () => {
    const sum = STATE_LIST.reduce((a, s) => a + s.popWeight, 0);
    expect(sum).toBeGreaterThan(0.999);
    expect(sum).toBeLessThan(1.001);
  });
});
