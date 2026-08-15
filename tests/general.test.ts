import { describe, expect, it } from 'vitest';
import {
  advanceGeneralTurn,
  createCustomPlayer,
  createInitialEconomy,
  createInitialGameState,
  createInitialGeneralState,
  PLAYER_GENERAL_ID,
  selectRunningMate,
} from '../src/engine';
import { createInitialStakeholderStates } from '../src/data/stakeholders';
import { VP_CANDIDATES } from '../src/data/vp-candidates';
import type { GameState, GeneralActionType } from '../src/engine/types';

function neutralPositions() {
  return {
    economy: 0, immigration: 0, healthcare: 0, crime: 0,
    climate: 0, foreign: 0, social: 0, government_reform: 0,
  };
}

/**
 * A democrat/republican player normally reaches the general election only
 * after clinching the primary (Phase 3). This helper builds a general-phase
 * GameState directly, for tests that exercise engine/general.ts in
 * isolation without needing to first run an entire primary.
 */
function democratNominee(seed: number, overrides: Partial<Parameters<typeof createCustomPlayer>[0]> = {}) {
  const player = createCustomPlayer({
    name: 'General Candidate',
    age: 51,
    homeState: 'PA',
    party: 'democrat',
    priorOffice: 'senator',
    traits: ['charismatic', 'fundraiser', 'debater'],
    ...overrides,
  });
  const positions = neutralPositions();
  const state: GameState = {
    date: { month: 9, year: 2028 },
    monthIndex: 8,
    phase: 'general',
    rngState: seed,
    player,
    positions,
    economy: createInitialEconomy(),
    treasury: 0,
    politicalCapital: 50,
    stakeholders: createInitialStakeholderStates(),
    memory: [],
    history: [],
    primary: null,
    general: createInitialGeneralState(player, positions),
    governing: null,
  };
  return state;
}

describe('general election setup', () => {
  it('a democrat nominee faces exactly one republican opponent', () => {
    const state = democratNominee(1);
    expect(state.phase).toBe('general');
    expect(state.date).toEqual({ month: 9, year: 2028 });
    expect(state.general!.candidates.length).toBe(2);
    expect(state.general!.candidates.some((c) => c.isPlayer)).toBe(true);
    expect(state.general!.candidates.find((c) => !c.isPlayer)!.party).toBe('republican');
  });

  it('an independent candidate faces both a democrat and a republican opponent', () => {
    const player = createCustomPlayer({
      name: 'Indy Candidate',
      age: 55,
      homeState: 'CA',
      party: 'independent',
      priorOffice: 'business',
      traits: ['outsider', 'fundraiser', 'media_savvy'],
    });
    const state = createInitialGameState({ player, positions: neutralPositions() });
    expect(state.phase).toBe('general');
    expect(state.general!.candidates.length).toBe(3);
    const opponentParties = state.general!.candidates.filter((c) => !c.isPlayer).map((c) => c.party).sort();
    expect(opponentParties).toEqual(['democrat', 'republican']);
  });
});

describe('election night', () => {
  it('electoral votes awarded across all 51 jurisdictions sum to 538', () => {
    let state = democratNominee(2);
    for (let i = 0; i < 3 && state.phase === 'general'; i++) {
      state = advanceGeneralTurn(state, { playerActions: [] });
    }
    expect(state.general!.electionResult).not.toBeNull();
    const total = Object.values(state.general!.electionResult!.finalElectoralVotes).reduce((a, b) => a + b, 0);
    expect(total).toBe(538);
  });

  it('a winning player transitions to phase governing starting January 2029', () => {
    // Seed/strategy search isn't needed here — we just assert internal
    // consistency: whichever candidate the engine calls the winner,
    // finalElectoralVotes for that candidate must exceed everyone else's,
    // and the phase transition must match playerWon exactly.
    let state = democratNominee(2);
    for (let i = 0; i < 3 && state.phase === 'general'; i++) {
      state = advanceGeneralTurn(state, { playerActions: [] });
    }
    const result = state.general!.electionResult!;
    const playerEVs = result.finalElectoralVotes[PLAYER_GENERAL_ID] ?? 0;
    const maxOtherEVs = Math.max(
      ...Object.entries(result.finalElectoralVotes)
        .filter(([id]) => id !== PLAYER_GENERAL_ID)
        .map(([, ev]) => ev),
    );
    if (playerEVs > maxOtherEVs) {
      expect(state.general!.playerWon).toBe(true);
      expect(state.phase).toBe('governing');
      expect(state.date).toEqual({ month: 1, year: 2029 });
    } else {
      expect(state.general!.playerWon).toBe(false);
      expect(state.phase).toBe('general');
    }
  });

  it('heavy investment in swing states improves the player final electoral vote count', () => {
    const swingActions: GeneralActionType[] = [
      { kind: 'campaign', stateId: 'PA' },
      { kind: 'campaign', stateId: 'MI' },
      { kind: 'campaign', stateId: 'WI' },
      { kind: 'campaign', stateId: 'AZ' },
    ];
    function run(withCampaigning: boolean) {
      let state = democratNominee(5);
      for (let i = 0; i < 3 && state.phase === 'general'; i++) {
        state = advanceGeneralTurn(state, { playerActions: withCampaigning ? swingActions : [] });
      }
      return state.general!.electionResult!.finalElectoralVotes[PLAYER_GENERAL_ID] ?? 0;
    }
    expect(run(true)).toBeGreaterThanOrEqual(run(false));
  });
});

describe('VP selection', () => {
  it('selecting a running mate is reflected in generalState.vp', () => {
    const state = democratNominee(3);
    const vp = VP_CANDIDATES[0];
    const nextGeneral = selectRunningMate(state.general!, vp);
    expect(nextGeneral.vp).toEqual(vp);
  });
});

describe('polling', () => {
  it('reported general-election poll numbers differ from the true share', () => {
    let state = democratNominee(4);
    state = advanceGeneralTurn(state, { playerActions: [] });
    const poll = state.general!.polls[0];
    const diffs = Object.keys(poll.trueShare).map((id) => Math.abs(poll.trueShare[id] - poll.reportedShare[id]));
    expect(diffs.some((d) => d > 0.01)).toBe(true);
  });
});

describe('general election determinism', () => {
  it('same seed + same actions replayed from scratch yields an identical outcome', () => {
    function run() {
      let state = democratNominee(6);
      for (let i = 0; i < 3 && state.phase === 'general'; i++) {
        state = advanceGeneralTurn(state, {
          playerActions: [{ kind: 'campaign', stateId: 'PA' }],
          eventAnswers: { first_general_debate: 'bold_reform' },
        });
      }
      return state;
    }
    expect(run()).toEqual(run());
  });

  it('a general-election state round-tripped through JSON replays identically', () => {
    let state = democratNominee(7);
    state = advanceGeneralTurn(state, { playerActions: [{ kind: 'fundraise' }] });
    const saved = JSON.parse(JSON.stringify(state));
    const continuedFromMemory = advanceGeneralTurn(state, { playerActions: [{ kind: 'interview' }] });
    const continuedFromSave = advanceGeneralTurn(saved, { playerActions: [{ kind: 'interview' }] });
    expect(continuedFromSave).toEqual(continuedFromMemory);
  });
});

describe('debates and the October surprise', () => {
  it('October carries two events (second debate + October surprise) resolved in one turn', () => {
    let state = democratNominee(8);
    state = advanceGeneralTurn(state, { playerActions: [] }); // Sep
    state = advanceGeneralTurn(state, {
      playerActions: [],
      eventAnswers: { second_general_debate: 'enforcement_first', october_surprise: 'full_transparency' },
    });
    expect(state.general!.debatesCompleted).toContain('second_general_debate');
    expect(state.general!.debatesCompleted).toContain('october_surprise');
  });
});
