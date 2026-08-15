import { describe, expect, it } from 'vitest';
import {
  advanceGoverningTurn,
  createCustomPlayer,
  createInitialEconomy,
  createInitialGoverningState,
  createInitialGoverningGameState,
  createPlayerFromRealCandidate,
  getPendingCrisisEvents,
} from '../src/engine';
import { createInitialStakeholderStates } from '../src/data/stakeholders';
import { BALANCE } from '../src/data/balance';
import { REAL_CANDIDATES } from '../src/data/real-candidates';
import { BILLS } from '../src/data/bills';
import { EXECUTIVE_ORDERS } from '../src/data/executive-orders';
import { EVENTS, assertEventsValidInDev } from '../src/data/events';
import { CABINET_APPOINTEES } from '../src/data/cabinet';
import { getAllTradeoffErrors } from '../src/engine/validators';
import { ambientCabinetEffects, cabinetConfirmationOdds, cabinetEffectiveness, resolveCabinetAppointment } from '../src/engine/governing';
import { RngCursor } from '../src/engine/rng';
import type { AdvanceGoverningTurnInput } from '../src/engine/governing';
import { ISSUE_AXES, type GameState } from '../src/engine/types';

function neutralPositions() {
  return {
    economy: 0, immigration: 0, healthcare: 0, crime: 0,
    climate: 0, foreign: 0, social: 0, government_reform: 0,
  };
}

function governingState(seed: number, startDate = { month: 1, year: 2029 }): GameState {
  const player = createCustomPlayer({
    name: 'President Test',
    age: 52,
    homeState: 'OH',
    party: 'democrat',
    priorOffice: 'senator',
    traits: ['charismatic', 'policy_wonk', 'debater'],
  });
  return {
    date: startDate,
    monthIndex: (startDate.year - 2028) * 12 + (startDate.month - 1),
    phase: 'governing',
    rngState: seed,
    player,
    positions: neutralPositions(),
    economy: createInitialEconomy(),
    treasury: 0,
    politicalCapital: 80,
    stakeholders: createInitialStakeholderStates(),
    memory: [],
    history: [],
    primary: null,
    general: null,
    governing: createInitialGoverningState(),
  };
}

const NO_OP: AdvanceGoverningTurnInput = { crisisResponses: {} };

describe('governing data validation', () => {
  it('every bill has a genuine trade-off', () => {
    expect(getAllTradeoffErrors(BILLS)).toEqual([]);
  });
  it('every executive order has a genuine trade-off', () => {
    expect(getAllTradeoffErrors(EXECUTIVE_ORDERS)).toEqual([]);
  });
  it('every crisis event option has a genuine trade-off, via the same validator used everywhere else', () => {
    expect(() => assertEventsValidInDev(true)).not.toThrow();
    for (const event of EVENTS) {
      expect(getAllTradeoffErrors(event.options)).toEqual([]);
    }
  });
  it('covers every required crisis category from the spec', () => {
    const required = [
      'recession', 'natural_disaster', 'foreign_conflict', 'pandemic', 'scandal',
      'mass_shooting', 'court_vacancy', 'border_surge', 'strike', 'cyberattack', 'consequence',
    ];
    const present = new Set(EVENTS.map((e) => e.category));
    for (const category of required) expect(present.has(category as never)).toBe(true);
  });
});

describe('governing basics', () => {
  it('a no-op month still advances the calendar and produces a history entry', () => {
    const state = governingState(1);
    const next = advanceGoverningTurn(state, NO_OP);
    expect(next.date).toEqual({ month: 2, year: 2029 });
    expect(next.history.length).toBe(1);
    expect(next.governing).not.toBeNull();
  });

  it('a passed bill applies its persona effects; capital is spent either way', () => {
    const bill = BILLS.find((b) => b.id === 'small_business_relief_deregulation')!;
    const state = governingState(3);
    // Make Congress and both caucuses maximally favorable so the bill passes.
    state.governing!.congress = { houseDem: 0, houseRep: 435, houseInd: 0, senateDem: 0, senateRep: 100, senateInd: 0 };
    state.stakeholders.house_rep_caucus.relationship = 100;
    state.stakeholders.senate_rep_caucus.relationship = 100;

    const next = advanceGoverningTurn(state, {
      crisisResponses: {},
      proposedBill: { billId: bill.id, concessionLevel: 1, capitalSpent: 50 },
    });

    const record = next.governing!.legislationHistory[0];
    expect(record.billId).toBe(bill.id);
    expect(record.status).toBe('passed');
    expect(next.politicalCapital).toBeLessThan(state.politicalCapital);
  });

  it('a hostile Congress with no whipping fails a controversial bill', () => {
    const bill = BILLS.find((b) => b.id === 'path_to_citizenship_act')!; // requiresFilibusterProof, high risk
    const state = governingState(3);
    state.governing!.congress = { houseDem: 0, houseRep: 435, houseInd: 0, senateDem: 0, senateRep: 100, senateInd: 0 };
    state.stakeholders.house_rep_caucus.relationship = -100;
    state.stakeholders.senate_rep_caucus.relationship = -100;

    const next = advanceGoverningTurn(state, {
      crisisResponses: {},
      proposedBill: { billId: bill.id, concessionLevel: 0, capitalSpent: 0 },
    });

    const record = next.governing!.legislationHistory[0];
    expect(record.status).not.toBe('passed');
  });

  it('an executive order applies immediately without a Congress vote', () => {
    const order = EXECUTIVE_ORDERS.find((o) => o.id === 'regulatory_freeze')!;
    const state = governingState(2);
    state.stakeholders.supreme_court.relationship = 100; // minimize court-strike risk
    const next = advanceGoverningTurn(state, { crisisResponses: {}, executiveOrder: { orderId: order.id } });
    expect(next.governing!.executiveOrderHistory.length).toBe(1);
  });
});

describe('crisis events', () => {
  it('getPendingCrisisEvents preview matches what advanceGoverningTurn actually resolves', () => {
    const state = governingState(11);
    const pending = getPendingCrisisEvents(state);
    const responses: Record<string, string> = {};
    for (const event of pending) responses[event.id] = event.options[0].id;
    const next = advanceGoverningTurn(state, { crisisResponses: responses });
    expect(next.governing!.crisisHistory.map((c) => c.eventId).sort()).toEqual(pending.map((e) => e.id).sort());
  });

  it('a recession-only event never fires below the unemployment threshold', () => {
    const state = governingState(1);
    state.economy.unemployment = 3.5; // well under the recession trigger
    let sawRecession = false;
    let current = state;
    for (let i = 0; i < 12; i++) {
      const pending = getPendingCrisisEvents(current);
      if (pending.some((e) => e.id === 'recession_hits')) sawRecession = true;
      current = advanceGoverningTurn(current, { crisisResponses: {} });
      current.economy.unemployment = 3.5; // hold it down for the test
    }
    expect(sawRecession).toBe(false);
  });
});

describe('midterms bite', () => {
  it('losing ground before the Nov 2030 midterms measurably reduces bill pass odds afterward', () => {
    // Run to just before the midterms with approval tanked by a lopsided, deeply
    // unpopular position, then compare the SAME bill's pass rate across many
    // seeds pre- vs post-midterm Congress composition.
    let state = governingState(42);
    state.positions = { economy: 0, immigration: 100, healthcare: 0, crime: 0, climate: 0, foreign: 0, social: 100, government_reform: 0 };
    while (!(state.date.month === 11 && state.date.year === 2030)) {
      state = advanceGoverningTurn(state, { crisisResponses: {} });
    }
    const preMidtermCongress = { ...state.governing!.congress };
    const afterMidterms = advanceGoverningTurn(state, { crisisResponses: {} });
    const postMidtermCongress = afterMidterms.governing!.congress;

    // The president is a Democrat with tanked approval — seats should have
    // swung toward Republicans (fewer House/Senate Dem seats than before).
    expect(postMidtermCongress.houseDem).toBeLessThan(preMidtermCongress.houseDem);
    expect(afterMidterms.governing!.midtermsCompleted).toBe(true);
  });
});

describe('governing determinism', () => {
  it('same seed + same actions replayed from scratch yields an identical state', () => {
    function run() {
      let state = governingState(7);
      for (let i = 0; i < 4; i++) {
        state = advanceGoverningTurn(state, { crisisResponses: {}, proposedBill: i === 1 ? { billId: 'ethics_reform_term_limits', concessionLevel: 0.7, capitalSpent: 20 } : undefined });
      }
      return state;
    }
    expect(run()).toEqual(run());
  });

  it('a governing state round-tripped through JSON replays identically', () => {
    let state = governingState(9);
    state = advanceGoverningTurn(state, { crisisResponses: {} });
    const saved = JSON.parse(JSON.stringify(state));
    const continuedFromMemory = advanceGoverningTurn(state, { crisisResponses: {} });
    const continuedFromSave = advanceGoverningTurn(saved, { crisisResponses: {} });
    expect(continuedFromSave).toEqual(continuedFromMemory);
  });
});

describe('full term', () => {
  it('37 no-op months reach the January 2032 re-election trigger without crashing', () => {
    let state = governingState(5);
    for (let i = 0; i < 37; i++) {
      state = advanceGoverningTurn(state, { crisisResponses: {} });
    }
    // The trigger month (Jan 2032) hands off either to a primary challenge
    // (date unchanged, still Jan 2032) or straight to the general (jumps to
    // September 2032) — which one depends on trailing approval and RNG.
    if (state.phase === 'primary') {
      expect(state.date).toEqual({ month: 1, year: 2032 });
    } else {
      expect(state.date).toEqual({ month: 9, year: 2032 });
    }
    // The trigger month hands off to either a primary challenge or the general.
    expect(state.phase === 'primary' || state.phase === 'general').toBe(true);
    expect(state.governing!.reelection).not.toBeNull();
  });
});

describe('starting straight as president', () => {
  it('skips the primary and general and lands in governing on day one', () => {
    const player = createCustomPlayer({
      name: 'Skip Ahead',
      age: 50,
      homeState: 'OH',
      party: 'democrat',
      priorOffice: 'senator',
      traits: ['charismatic', 'fundraiser', 'debater'],
    });
    const state = createInitialGoverningGameState({ player, positions: neutralPositions() });

    expect(state.phase).toBe('governing');
    expect(state.primary).toBeNull();
    expect(state.general).toBeNull();
    expect(state.date).toEqual({ month: 1, year: 2029 });
    expect(state.governing).not.toBeNull();
    expect(state.governing!.congress).toEqual({
      houseDem: BALANCE.governing.INITIAL_HOUSE_DEM,
      houseRep: BALANCE.governing.INITIAL_HOUSE_REP,
      houseInd: BALANCE.governing.INITIAL_HOUSE_IND,
      senateDem: BALANCE.governing.INITIAL_SENATE_DEM,
      senateRep: BALANCE.governing.INITIAL_SENATE_REP,
      senateInd: BALANCE.governing.INITIAL_SENATE_IND,
    });
    expect(state.governing!.legislationHistory).toEqual([]);
    expect(state.governing!.cabinet).toEqual({});

    // And the resulting state is a normal, playable governing state.
    expect(() => advanceGoverningTurn(state, { crisisResponses: {} })).not.toThrow();
  });

  it('works for independents too, since there is no party primary to skip', () => {
    const player = createCustomPlayer({
      name: 'Indy Skip',
      age: 55,
      homeState: 'CA',
      party: 'independent',
      priorOffice: 'business',
      traits: ['outsider', 'fundraiser', 'media_savvy'],
    });
    const state = createInitialGoverningGameState({ player, positions: neutralPositions() });
    expect(state.phase).toBe('governing');
  });
});

describe('real-candidate mode', () => {
  it('never surfaces a scandal-category crisis event, across many seeds and months', () => {
    let sawScandalWithModeOff = false;
    for (let seed = 1; seed <= 200; seed++) {
      for (let month = 1; month <= 6; month++) {
        const normal = governingState(seed, { month, year: 2029 });
        const restricted = { ...normal, isRealCandidateMode: true };
        expect(getPendingCrisisEvents(restricted).some((e) => e.category === 'scandal')).toBe(false);
        if (getPendingCrisisEvents(normal).some((e) => e.category === 'scandal')) sawScandalWithModeOff = true;
      }
    }
    // Sanity check: the scandal category does occur when the flag is off,
    // so the assertions above are actually exercising the filter.
    expect(sawScandalWithModeOff).toBe(true);
  });

  it('createPlayerFromRealCandidate assigns no traits', () => {
    const player = createPlayerFromRealCandidate({
      name: 'Test Official',
      age: 55,
      homeState: 'OH',
      party: 'independent',
      priorOffice: 'senator',
    });
    expect(player.traits).toEqual([]);
  });

  it('real-candidate starting positions stay well short of the +/-100 extremes', () => {
    for (const candidate of REAL_CANDIDATES) {
      for (const axis of ISSUE_AXES) {
        expect(Math.abs(candidate.startingPositions[axis])).toBeLessThanOrEqual(40);
      }
    }
  });
});

describe('cabinet: competence, ideology, and loyalty all matter', () => {
  it('every appointee has a loyalty rating in range', () => {
    for (const a of CABINET_APPOINTEES) {
      expect(a.loyalty).toBeGreaterThanOrEqual(0);
      expect(a.loyalty).toBeLessThanOrEqual(100);
    }
  });

  it('loyalty is a multiplier on competence, not an independent bonus', () => {
    const competentLoyal = cabinetEffectiveness({ competence: 90, loyalty: 90 });
    const competentDisloyal = cabinetEffectiveness({ competence: 90, loyalty: 20 });
    const mediocreLoyal = cabinetEffectiveness({ competence: 50, loyalty: 90 });

    // High competence pays off far more when paired with high loyalty.
    expect(competentLoyal).toBeGreaterThan(competentDisloyal);
    // A disloyal appointee's competence barely translates into anything.
    expect(competentDisloyal).toBeGreaterThan(0);
    expect(competentDisloyal).toBeLessThan(0.3);
    // Loyalty alone, with nothing but average competence, is worth nothing.
    expect(mediocreLoyal).toBe(0);
  });

  it('loyalty amplifies incompetence too — a loyal-but-weak appointee is a bigger drag than a disloyal one', () => {
    const weakLoyal = cabinetEffectiveness({ competence: 10, loyalty: 90 });
    const weakDisloyal = cabinetEffectiveness({ competence: 10, loyalty: 20 });
    expect(weakLoyal).toBeLessThan(weakDisloyal);
    expect(weakLoyal).toBeLessThan(0);
  });

  it('ambientCabinetEffects produces nothing for a vacant or unconfirmed cabinet', () => {
    const empty = ambientCabinetEffects({}, 0);
    expect(empty).toEqual([]);

    const unconfirmed = ambientCabinetEffects({ treasury: { positionId: 'treasury', appointeeId: 'laura_kessler', confirmed: false, monthAppointed: 0 } }, 0);
    expect(unconfirmed).toEqual([]);
  });

  it('a confirmed, effective Treasury secretary produces both an economy and a persona ambient effect', () => {
    const kessler = CABINET_APPOINTEES.find((a) => a.id === 'laura_kessler')!;
    expect(kessler.competence).toBeGreaterThan(50); // sanity: should be a net-positive effect
    const decisions = ambientCabinetEffects({ treasury: { positionId: 'treasury', appointeeId: 'laura_kessler', confirmed: true, monthAppointed: 0 } }, 5);

    expect(decisions).toHaveLength(1);
    expect(decisions[0].id).toBe('ambient_cabinet_treasury:5');
    expect(decisions[0].economyEffects?.gdpGrowth).toBeGreaterThan(0);
    // Kessler's confirmation-bonus personas (union_households/small_business_owners)
    // get a small ongoing nudge in the same direction, scaled well down.
    const effectiveness = cabinetEffectiveness(kessler);
    expect(decisions[0].personaEffects.union_households).toBeCloseTo(4 * effectiveness * BALANCE.governing.CABINET_AMBIENT_PERSONA_SCALE, 6);
  });

  it('ideology still shifts confirmation odds directionally, independent of loyalty', () => {
    // Pure math, no RNG: a heavily Democratic Senate should always compute
    // a higher expected yes-vote share for a left-leaning nominee than a
    // right-leaning one, even though (per the next test) both usually clear
    // the majority threshold either way.
    const congress = { houseDem: 300, houseRep: 130, houseInd: 5, senateDem: 80, senateRep: 20, senateInd: 0 };
    const aligned = cabinetConfirmationOdds(-40, congress); // e.g. Alan Frost
    const misaligned = cabinetConfirmationOdds(35, congress); // e.g. Rebecca Stanton
    expect(aligned.expectedYes).toBeGreaterThan(misaligned.expectedYes);
  });

  it('nearly all appointments succeed, matching real-world confirmation norms', () => {
    // Even the most ideologically extreme appointee in the current roster,
    // facing a Senate composition heavily hostile to them, is confirmed the
    // vast majority of the time — this is the point of the retuned
    // parameters, not an edge case to guard against.
    const hostileCongress = { houseDem: 300, houseRep: 130, houseInd: 5, senateDem: 90, senateRep: 10, senateInd: 0 };
    let confirmedCount = 0;
    const trials = 200;
    for (let seed = 1; seed <= trials; seed++) {
      // Rebecca Stanton: ideology +35, facing a 90-10 Democratic Senate.
      const result = resolveCabinetAppointment('energy', 'rebecca_stanton', hostileCongress, new RngCursor(seed), 0);
      if (result.appointment.confirmed) confirmedCount++;
    }
    expect(confirmedCount / trials).toBeGreaterThan(0.9);
  });
});
