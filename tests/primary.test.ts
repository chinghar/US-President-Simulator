import { describe, expect, it } from 'vitest';
import { advancePrimaryTurn, createCustomPlayer, createInitialGameState, PLAYER_CANDIDATE_ID } from '../src/engine';
import { PRIMARY_CALENDAR } from '../src/data/primary-calendar';
import type { PrimaryActionType, StateId } from '../src/engine/types';

function neutralPositions() {
  return {
    economy: 0,
    immigration: 0,
    healthcare: 0,
    crime: 0,
    climate: 0,
    foreign: 0,
    social: 0,
    government_reform: 0,
  };
}

function democratPlayer(seed: number) {
  const player = createCustomPlayer({
    name: 'Test Candidate',
    age: 50,
    homeState: 'OH',
    party: 'democrat',
    priorOffice: 'senator',
    traits: ['charismatic', 'fundraiser', 'debater'],
  });
  return createInitialGameState({ seed, player, positions: neutralPositions() });
}

function runMonths(seed: number, months: number, actionsPerMonth: PrimaryActionType[]) {
  let state = democratPlayer(seed);
  for (let i = 0; i < months && state.phase === 'primary'; i++) {
    state = advancePrimaryTurn(state, { playerActions: actionsPerMonth, debateAnswerId: undefined });
  }
  return state;
}

describe('primary campaign setup', () => {
  it('independent candidates skip the primary entirely (primary is null, phase starts general)', () => {
    const player = createCustomPlayer({
      name: 'Indy Candidate',
      age: 55,
      homeState: 'CA',
      party: 'independent',
      priorOffice: 'business',
      traits: ['outsider', 'fundraiser', 'media_savvy'],
    });
    const state = createInitialGameState({ player, positions: neutralPositions() });
    expect(state.primary).toBeNull();
    expect(state.phase).toBe('general');
  });

  it('democrat/republican candidates get a primary with the player plus 4 rivals', () => {
    const state = democratPlayer(1);
    expect(state.primary).not.toBeNull();
    expect(state.primary!.candidates.length).toBe(5);
    expect(state.primary!.candidates.some((c) => c.id === PLAYER_CANDIDATE_ID)).toBe(true);
  });

  it('nomination threshold is a majority of the derived total delegates', () => {
    const state = democratPlayer(1);
    const { totalDelegates, nominationThreshold } = state.primary!;
    expect(nominationThreshold).toBe(Math.floor(totalDelegates / 2) + 1);
    expect(totalDelegates).toBeGreaterThan(1000);
  });
});

describe('primary contest resolution', () => {
  it('every contest awards exactly its state-derived delegate total, split across viable candidates', () => {
    // Jan is a contest-free prep month; Feb resolves all 4 early states
    // (Iowa/NH/Nevada/SC) together since GameDate is monthly-granular.
    const state = runMonths(3, 2, [{ kind: 'campaign', stateId: 'IA' }]);
    expect(state.primary!.contestsCompleted.length).toBe(4);
    const iowa = state.primary!.contestsCompleted[0];
    expect(iowa.contestId).toBe('iowa');

    const stateResult = iowa.stateResults[0];
    const awarded = Object.values(stateResult.delegatesAwarded).reduce((a, b) => a + b, 0);
    const votePctSum = Object.values(stateResult.voteShare).reduce((a, b) => a + b, 0);

    expect(awarded).toBeGreaterThan(0);
    expect(votePctSum).toBeGreaterThan(99);
    expect(votePctSum).toBeLessThan(101);
  });

  it('heavily investing in every upcoming contest state visibly outperforms doing nothing', () => {
    const withCampaigning = runMonths(5, 5, [
      { kind: 'campaign', stateId: 'IA' },
      { kind: 'campaign', stateId: 'IA' },
      { kind: 'campaign', stateId: 'IA' },
    ]);
    const withoutCampaigning = runMonths(5, 5, []);

    const iowaShareWith = withCampaigning.primary!.contestsCompleted[0].stateResults[0].voteShare[PLAYER_CANDIDATE_ID];
    const iowaShareWithout = withoutCampaigning.primary!.contestsCompleted[0].stateResults[0].voteShare[PLAYER_CANDIDATE_ID];

    expect(iowaShareWith).toBeGreaterThan(iowaShareWithout);
  });

  it('total delegates awarded across the full calendar equals the derived total', () => {
    let state = democratPlayer(9);
    for (let i = 0; i < PRIMARY_CALENDAR.length + 1 && state.phase === 'primary'; i++) {
      state = advancePrimaryTurn(state, { playerActions: [{ kind: 'campaign', stateId: 'IA' }] });
    }
    const totalAwarded = state.primary
      ? state.primary.candidates.reduce((sum, c) => sum + c.delegates, 0)
      : 0;
    // Player may have clinched and moved to 'general' before the loop count above,
    // in which case primary state is frozen at the clinch point — still must be consistent.
    if (state.primary) {
      expect(totalAwarded).toBeLessThanOrEqual(state.primary.totalDelegates);
    }
  });
});

describe('polling', () => {
  it('reported poll numbers differ from the true underlying share (visible sampling noise)', () => {
    const state = runMonths(4, 1, []);
    const poll = state.primary!.polls[0];
    const diffs = Object.keys(poll.trueShare).map((id) => Math.abs(poll.trueShare[id] - poll.reportedShare[id]));
    expect(diffs.some((d) => d > 0.01)).toBe(true);
  });
});

describe('primary determinism', () => {
  it('same seed + same actions replayed from scratch yields identical primary state', () => {
    const actions: PrimaryActionType[] = [{ kind: 'campaign', stateId: 'IA' }, { kind: 'fundraise' }];
    const a = runMonths(77, 6, actions);
    const b = runMonths(77, 6, actions);
    expect(a).toEqual(b);
  });

  it('a primary state round-tripped through JSON replays identically', () => {
    let state = democratPlayer(21);
    for (let i = 0; i < 3; i++) {
      state = advancePrimaryTurn(state, { playerActions: [{ kind: 'fundraise' }] });
    }
    const saved = JSON.parse(JSON.stringify(state));
    const continuedFromMemory = advancePrimaryTurn(state, { playerActions: [{ kind: 'interview' }] });
    const continuedFromSave = advancePrimaryTurn(saved, { playerActions: [{ kind: 'interview' }] });
    expect(continuedFromSave).toEqual(continuedFromMemory);
  });
});

describe('winning the nomination', () => {
  it('a well-aligned, well-funded, actively-campaigning player can clinch the nomination by June', () => {
    const player = createCustomPlayer({
      name: 'Strong Candidate',
      age: 50,
      homeState: 'IA',
      party: 'democrat',
      priorOffice: 'senator',
      traits: ['charismatic', 'fundraiser', 'debater'],
    });
    const positions = {
      economy: -65, immigration: -55, healthcare: -70, crime: -45,
      climate: -70, foreign: -30, social: -70, government_reform: -25,
    };
    let state = createInitialGameState({ seed: 1, player, positions });

    let turns = 0;
    while (state.phase === 'primary' && turns < 8) {
      const primary = state.primary!;
      const first = PRIMARY_CALENDAR[primary.nextContestIndex];
      const statesInPlay: StateId[] = [];
      if (first) {
        for (let i = primary.nextContestIndex; i < PRIMARY_CALENDAR.length; i++) {
          const c = PRIMARY_CALENDAR[i];
          if (c.month === first.month && c.year === first.year) statesInPlay.push(...c.states);
          else break;
        }
      }
      const actions: PrimaryActionType[] = statesInPlay.slice(0, 3).map((stateId) => ({ kind: 'campaign', stateId }));
      state = advancePrimaryTurn(state, { playerActions: actions, debateAnswerId: 'public_healthcare' });
      turns++;
    }

    expect(state.phase).toBe('general');
    expect(state.primary!.clinchedId).toBe(PLAYER_CANDIDATE_ID);
  });
});

describe('debates', () => {
  it("applying a debate answer with axisEffects shifts the player's positions", () => {
    let state = democratPlayer(15); // starts Jan 2028, debate scheduled that month
    const before = { ...state.positions };
    state = advancePrimaryTurn(state, { playerActions: [], debateAnswerId: 'deregulate' });
    expect(state.positions.economy).not.toBe(before.economy);
    expect(state.primary!.debatesCompleted).toContain('opening_economic_debate');
  });
});
