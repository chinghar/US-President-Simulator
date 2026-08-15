import { BALANCE } from '../data/balance';
import { PERSONAS } from '../data/personas';
import { STATES, STATE_LIST } from '../data/states';
import { aggregateTraitModifiers } from './character';
import { ISSUE_AXES, PERSONA_IDS, clamp, type GameState, type PersonaId, type StateId } from './types';

export interface SupportBreakdown {
  personaId: PersonaId;
  /** Contribution from position agreement/disagreement with the player, weighted by this persona's salience. */
  ideology: number;
  /** Contribution from macroeconomic conditions, scaled by the persona's economic sensitivity. */
  economy: number;
  /** Contribution from decayed memory of past decisions/events that named this persona. */
  events: number;
  /** Contribution from state-partisan alignment. Zero unless a stateId is supplied. */
  state: number;
  /** Flat, position-independent contribution from the player's own character traits (e.g. War Hero -> veterans). */
  traits: number;
  /** Final clamped 0..100 support/approval value: NEUTRAL_BASE + the five components above. */
  total: number;
}

/** Decayed magnitude of a single memory effect `monthsElapsed` months after it was applied.
 * Approaches RESIDUAL_FLOOR * magnitude but never reaches zero — old decisions fade, they don't vanish. */
export function decayedMagnitude(magnitude: number, monthsElapsed: number): number {
  const { DECAY_RATE_PER_MONTH, RESIDUAL_FLOOR } = BALANCE.memory;
  const elapsed = Math.max(0, monthsElapsed);
  const decayFactor = RESIDUAL_FLOOR + (1 - RESIDUAL_FLOOR) * Math.pow(DECAY_RATE_PER_MONTH, elapsed);
  return magnitude * decayFactor;
}

function ideologyComponent(personaId: PersonaId, gameState: GameState): number {
  const persona = PERSONAS[personaId];
  let weightedDistance = 0;
  let salienceSum = 0;
  for (const axis of ISSUE_AXES) {
    const salience = persona.salience[axis];
    weightedDistance += salience * Math.abs(gameState.positions[axis] - persona.basePosition[axis]);
    salienceSum += salience;
  }
  if (salienceSum === 0) return 0;
  const normalizedDistance = weightedDistance / salienceSum; // 0..200
  const alignment = clamp(1 - normalizedDistance / BALANCE.support.IDEOLOGY_DISTANCE_NORM, 0, 1);
  return (alignment - 0.5) * 2 * BALANCE.support.IDEOLOGY_RANGE;
}

function economyComponentValue(personaId: PersonaId, gameState: GameState): number {
  const persona = PERSONAS[personaId];
  const s = BALANCE.support;
  const growthGap = gameState.economy.gdpGrowth - s.ECON_REF_GDP_GROWTH;
  const unemploymentGap = s.ECON_REF_UNEMPLOYMENT - gameState.economy.unemployment; // higher unemployment = worse
  const inflationGap = s.ECON_REF_INFLATION - gameState.economy.inflation; // higher inflation = worse
  // Each gap point is worth roughly one "support point" before weighting/clamping — deliberately gentle so
  // no single indicator can single-handedly swing a persona's whole ECONOMY_RANGE.
  const raw =
    growthGap * s.ECON_WEIGHT_GROWTH * 6 +
    unemploymentGap * s.ECON_WEIGHT_UNEMPLOYMENT * 6 +
    inflationGap * s.ECON_WEIGHT_INFLATION * 6;
  const clamped = clamp(raw, -s.ECONOMY_RANGE, s.ECONOMY_RANGE);
  return clamped * persona.economicSensitivity;
}

function eventsComponent(personaId: PersonaId, gameState: GameState): number {
  let total = 0;
  for (const effect of gameState.memory) {
    if (effect.personaId !== personaId) continue;
    total += decayedMagnitude(effect.magnitude, gameState.monthIndex - effect.appliedMonth);
  }
  return clamp(total, -BALANCE.support.EVENTS_CAP, BALANCE.support.EVENTS_CAP);
}

function stateComponent(personaId: PersonaId, stateId: StateId): number {
  const persona = PERSONAS[personaId];
  const state = STATES[stateId];
  const alignment = (persona.partyLean / 100) * (state.partisanBaseline / 100); // -1..+1
  return alignment * BALANCE.support.STATE_RANGE;
}

function traitsComponent(personaId: PersonaId, gameState: GameState): number {
  const mods = aggregateTraitModifiers(gameState.player.traits);
  const bonus = mods.personaBonus[personaId] ?? 0;
  return clamp(bonus, -BALANCE.support.TRAITS_CAP, BALANCE.support.TRAITS_CAP);
}

/** Pure function of (personaId, gameState, optional stateId) — nothing is cached on
 * GameState, so this is always safe to call from UI or tests without risk of staleness. */
export function computePersonaSupport(personaId: PersonaId, gameState: GameState, stateId?: StateId): SupportBreakdown {
  const ideology = ideologyComponent(personaId, gameState);
  const economy = economyComponentValue(personaId, gameState);
  const events = eventsComponent(personaId, gameState);
  const state = stateId ? stateComponent(personaId, stateId) : 0;
  const traits = traitsComponent(personaId, gameState);
  const total = clamp(BALANCE.support.NEUTRAL_BASE + ideology + economy + events + state + traits, 0, 100);
  return { personaId, ideology, economy, events, state, traits, total };
}

export function computeAllPersonaSupport(gameState: GameState, stateId?: StateId): Record<PersonaId, SupportBreakdown> {
  const result = {} as Record<PersonaId, SupportBreakdown>;
  for (const id of PERSONA_IDS) {
    result[id] = computePersonaSupport(id, gameState, stateId);
  }
  return result;
}

/** Each persona's share of the national electorate, derived once from state
 * population weights x state persona composition. Independent of game state. */
export const NATIONAL_PERSONA_WEIGHTS: Record<PersonaId, number> = (() => {
  const weights = {} as Record<PersonaId, number>;
  for (const id of PERSONA_IDS) weights[id] = 0;
  for (const state of STATE_LIST) {
    for (const id of PERSONA_IDS) {
      weights[id] += state.popWeight * state.personaComposition[id];
    }
  }
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const id of PERSONA_IDS) weights[id] /= sum;
  return weights;
})();

/** National approval = population-weighted average of every persona's support. */
export function computeNationalApproval(gameState: GameState): number {
  let total = 0;
  for (const id of PERSONA_IDS) {
    total += computePersonaSupport(id, gameState).total * NATIONAL_PERSONA_WEIGHTS[id];
  }
  return total;
}

/** A single state's approval = that state's own persona-composition-weighted
 * average of support, each persona's score computed with the state's
 * partisan-alignment component included. Powers the approval map. */
export function computeStateApproval(gameState: GameState, stateId: StateId): number {
  const state = STATES[stateId];
  let total = 0;
  for (const id of PERSONA_IDS) {
    total += computePersonaSupport(id, gameState, stateId).total * state.personaComposition[id];
  }
  return total;
}
