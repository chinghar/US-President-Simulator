import { describe, expect, it, vi } from 'vitest';
import { advanceMonth, createInitialGameState } from '../src/engine';
import { SAMPLE_DECISIONS } from '../src/data/decisions';

function runMonths(seed: number, months: number) {
  let state = createInitialGameState({ seed });
  for (let i = 0; i < months; i++) {
    // Rotate through a few different decisions (and some months with none) so
    // the RNG cursor and memory list both accumulate nontrivial state.
    const decisions = i % 3 === 0 ? [SAMPLE_DECISIONS[i % SAMPLE_DECISIONS.length]] : [];
    state = advanceMonth(state, decisions);
  }
  return state;
}

describe('determinism', () => {
  it('same seed + same decisions replayed from scratch yields an identical state', () => {
    const a = runMonths(42, 24);
    const b = runMonths(42, 24);
    expect(a).toEqual(b);
  });

  it('different seeds diverge (the RNG shock is actually being used)', () => {
    const a = runMonths(1, 24);
    const b = runMonths(2, 24);
    expect(a).not.toEqual(b);
  });

  it('a state round-tripped through JSON (simulating save/load) replays identically', () => {
    let state = createInitialGameState({ seed: 7 });
    for (let i = 0; i < 6; i++) {
      state = advanceMonth(state, i === 2 ? [SAMPLE_DECISIONS[0]] : []);
    }

    const saved = JSON.parse(JSON.stringify(state));
    const continuedFromMemory = advanceMonth(state, [SAMPLE_DECISIONS[1]]);
    const continuedFromSave = advanceMonth(saved, [SAMPLE_DECISIONS[1]]);

    expect(continuedFromSave).toEqual(continuedFromMemory);
  });

  it('the RNG cursor never calls Math.random (spy asserts zero calls across a full run)', () => {
    const spy = vi.spyOn(Math, 'random');
    runMonths(99, 36);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
