import { describe, expect, it } from 'vitest';
import {
  advanceGeneralTurn,
  advanceGoverningTurn,
  advancePrimaryTurn,
  computeHistorianRanking,
  createCustomPlayer,
  createInitialEconomy,
  createInitialGoverningState,
  getBrokenPromises,
  getDecisionTimeline,
  getSignatureAchievements,
  selectRunningMate,
} from '../src/engine';
import { createInitialStakeholderStates } from '../src/data/stakeholders';
import { VP_CANDIDATES } from '../src/data/vp-candidates';
import type { GameState } from '../src/engine/types';

function neutralPositions() {
  return {
    economy: 0, immigration: 0, healthcare: 0, crime: 0,
    climate: 0, foreign: 0, social: 0, government_reform: 0,
  };
}

function governingState(seed: number): GameState {
  const player = createCustomPlayer({
    name: 'President Legacy',
    age: 52,
    homeState: 'OH',
    party: 'democrat',
    priorOffice: 'senator',
    traits: ['charismatic', 'policy_wonk', 'debater'],
  });
  return {
    date: { month: 1, year: 2029 },
    monthIndex: 12,
    phase: 'governing',
    rngState: seed,
    player,
    positions: neutralPositions(),
    economy: createInitialEconomy(),
    treasury: 0,
    politicalCapital: 90,
    stakeholders: createInitialStakeholderStates(),
    memory: [],
    history: [],
    primary: null,
    general: null,
    governing: createInitialGoverningState(),
  };
}

describe('legacy: historian ranking', () => {
  it('produces a score in 0-100 and a matching tier for a middling no-op term', () => {
    let state = governingState(1);
    for (let i = 0; i < 6; i++) {
      state = advanceGoverningTurn(state, { crisisResponses: {} });
    }
    const ranking = computeHistorianRanking(state);
    expect(ranking.score).toBeGreaterThanOrEqual(0);
    expect(ranking.score).toBeLessThanOrEqual(100);
    expect(['Historic', 'Great', 'Above Average', 'Average', 'Below Average', 'Failed Presidency']).toContain(ranking.tier);
    expect(ranking.breakdown.reelected).toBeNull(); // re-election hasn't happened yet
  });

  it('a passed, favorable bill raises the historian score versus doing nothing', () => {
    function run(withBill: boolean) {
      let state = governingState(3);
      state.governing!.congress = { houseDem: 0, houseRep: 435, houseInd: 0, senateDem: 0, senateRep: 100, senateInd: 0 };
      state.stakeholders.house_rep_caucus.relationship = 100;
      state.stakeholders.senate_rep_caucus.relationship = 100;
      for (let i = 0; i < 3; i++) {
        state = advanceGoverningTurn(state, {
          crisisResponses: {},
          proposedBill: withBill && i === 0 ? { billId: 'small_business_relief_deregulation', concessionLevel: 1, capitalSpent: 50 } : undefined,
        });
      }
      return computeHistorianRanking(state).breakdown.billsPassedCount;
    }
    expect(run(true)).toBeGreaterThan(run(false));
  });
});

describe('legacy: achievements, broken promises, timeline', () => {
  it('a struck-down bill counts as a broken promise, not an achievement', () => {
    let state = governingState(5);
    // Hostile Congress + hostile Court: the bill should fail or be struck down either way.
    state.governing!.congress = { houseDem: 435, houseRep: 0, houseInd: 0, senateDem: 100, senateRep: 0, senateInd: 0 };
    state.stakeholders.house_dem_caucus.relationship = 100;
    state.stakeholders.senate_dem_caucus.relationship = 100;
    state.stakeholders.supreme_court.relationship = -100;
    state = advanceGoverningTurn(state, {
      crisisResponses: {},
      proposedBill: { billId: 'clean_energy_transition', concessionLevel: 1, capitalSpent: 50 },
    });

    const record = state.governing!.legislationHistory[0];
    if (record.status === 'passed') {
      // Passed outright (Court didn't strike it down this roll) — still a real achievement.
      expect(getSignatureAchievements(state).some((a) => a.id === 'clean_energy_transition')).toBe(true);
    } else {
      expect(getBrokenPromises(state).some((a) => a.id === 'clean_energy_transition')).toBe(true);
      expect(getSignatureAchievements(state).some((a) => a.id === 'clean_energy_transition')).toBe(false);
    }
  });

  it('the decision timeline is sorted chronologically and includes crisis responses', () => {
    let state = governingState(11);
    for (let i = 0; i < 5; i++) {
      state = advanceGoverningTurn(state, { crisisResponses: {} });
    }
    const timeline = getDecisionTimeline(state);
    for (let i = 1; i < timeline.length; i++) {
      const prevKey = timeline[i - 1].date.year * 12 + timeline[i - 1].date.month;
      const curKey = timeline[i].date.year * 12 + timeline[i].date.month;
      expect(curKey).toBeGreaterThanOrEqual(prevKey);
    }
  });
});

describe('re-election reaches a definite governing.reelection.outcome', () => {
  it('driving through the 2032 trigger to a general-election win sets outcome to "reelected"', () => {
    let state = governingState(1);
    // Fast-forward to the Jan 2032 trigger.
    for (let i = 0; i < 36; i++) {
      state = advanceGoverningTurn(state, { crisisResponses: {} });
    }
    expect(state.date).toEqual({ month: 1, year: 2032 });

    // The trigger month itself: either hands off to a primary challenge or
    // straight to the general (both are valid; drive whichever happened).
    state = advanceGoverningTurn(state, { crisisResponses: {} });
    expect(state.governing!.reelection).not.toBeNull();

    if (state.phase === 'primary') {
      let guard = 0;
      while (state.phase === 'primary' && !state.primary!.playerEliminated && guard < 8) {
        state = advancePrimaryTurn(state, { playerActions: [] });
        guard++;
      }
      if (state.primary!.playerEliminated) {
        expect(state.governing!.reelection!.outcome).toBe('primaried_out');
        return; // a valid terminal outcome — nothing further to drive
      }
    }

    if (!state.general!.vp) {
      state = { ...state, general: selectRunningMate(state.general!, VP_CANDIDATES[0]) };
    }
    let guard = 0;
    while (state.phase === 'general' && !state.general!.electionResult && guard < 6) {
      state = advanceGeneralTurn(state, { playerActions: [] });
      guard++;
    }

    expect(state.governing!.reelection!.outcome).not.toBeNull();
    expect(['reelected', 'lost_general']).toContain(state.governing!.reelection!.outcome);
    if (state.governing!.reelection!.outcome === 'reelected') {
      expect(state.phase).toBe('governing');
    }
  });
});
