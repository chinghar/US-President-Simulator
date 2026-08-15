import { describe, expect, it } from 'vitest';
import { advanceMonth, computePersonaSupport, createInitialGameState, PERSONA_IDS } from '../src/engine';
import type { Decision, GameState } from '../src/engine/types';
import { getAllTradeoffErrors } from '../src/engine/validators';
import { SAMPLE_DECISIONS } from '../src/data/decisions';

describe('support model', () => {
  it('moves ideologically opposed personas in opposite directions on a decision that shifts player position', () => {
    const state = createInitialGameState({ seed: 5 });
    const before = {
      progressives: computePersonaSupport('young_progressives', state).total,
      evangelicals: computePersonaSupport('evangelical_conservatives', state).total,
    };

    // A hard-right social-axis shift should read as socially conservative:
    // it should win over evangelicals and repel young progressives.
    const next = advanceMonth(state, [
      {
        id: 'test_social_shift_right',
        label: 'Test: Shift Hard Right on Social Issues',
        description: 'Synthetic decision for testing opposed persona movement.',
        axisEffects: { social: 60 },
        personaEffects: { evangelical_conservatives: 1, young_progressives: -1 },
      },
    ]);

    const after = {
      progressives: computePersonaSupport('young_progressives', next).total,
      evangelicals: computePersonaSupport('evangelical_conservatives', next).total,
    };

    expect(after.evangelicals).toBeGreaterThan(before.evangelicals);
    expect(after.progressives).toBeLessThan(before.progressives);
  });

  it('raising taxes on high earners moves at least 3 personas up and at least 3 down, in opposite directions', () => {
    const state = createInitialGameState({ seed: 11 });
    const decision = SAMPLE_DECISIONS.find((d) => d.id === 'raise_taxes_high_earners')!;

    const before = computeAll(state);
    const after = computeAll(advanceMonth(state, [decision]));

    const deltas = Object.keys(before).map((personaId) => after[personaId] - before[personaId]);
    const up = deltas.filter((d) => d > 0.001);
    const down = deltas.filter((d) => d < -0.001);

    expect(up.length).toBeGreaterThanOrEqual(3);
    expect(down.length).toBeGreaterThanOrEqual(3);
  });

  it('every decision in the sample data pool has a genuine trade-off (helps someone, hurts someone)', () => {
    expect(getAllTradeoffErrors(SAMPLE_DECISIONS)).toEqual([]);
  });

  it('flags a decision with only positive persona effects as invalid', () => {
    const allGoodDecision: Decision = {
      id: 'test_all_positive',
      label: 'Test: All Positive',
      description: 'Synthetic decision with no downside — should fail validation.',
      personaEffects: { seniors: 5, military_veteran_households: 5 },
    };
    const errors = getAllTradeoffErrors([allGoodDecision]);
    expect(errors.length).toBe(1);
  });
});

function computeAll(state: GameState) {
  const result: Record<string, number> = {};
  for (const id of PERSONA_IDS) {
    result[id] = computePersonaSupport(id, state).total;
  }
  return result;
}
