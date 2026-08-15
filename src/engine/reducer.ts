import { BALANCE } from '../data/balance';
import { advanceGameDate } from './date';
import { advanceEconomy } from './economy';
import { RngCursor } from './rng';
import { advanceStakeholders } from './stakeholders';
import { computeNationalApproval } from './support';
import {
  clamp,
  ISSUE_AXES,
  PERSONA_IDS,
  type Decision,
  type EconomyEffects,
  type GameState,
  type HistoryEntry,
  type MemoryEffect,
} from './types';

function mergeEconomyEffects(decisions: Decision[]): EconomyEffects {
  const merged: EconomyEffects = {};
  for (const decision of decisions) {
    const effects = decision.economyEffects;
    if (!effects) continue;
    merged.gdpGrowth = (merged.gdpGrowth ?? 0) + (effects.gdpGrowth ?? 0);
    merged.unemployment = (merged.unemployment ?? 0) + (effects.unemployment ?? 0);
    merged.inflation = (merged.inflation ?? 0) + (effects.inflation ?? 0);
    merged.deficit = (merged.deficit ?? 0) + (effects.deficit ?? 0);
  }
  return merged;
}

/**
 * The single reducer that advances the whole simulation by one month. Pure:
 * given the same `state` and `decisions`, always returns an identical new
 * state (RNG draws are threaded through `state.rngState`, never Math.random).
 */
export function advanceMonth(state: GameState, decisions: Decision[]): GameState {
  const cursor = new RngCursor(state.rngState);

  const positions = { ...state.positions };
  let treasury = state.treasury;
  let politicalCapital = state.politicalCapital;
  const newMemory: MemoryEffect[] = [];
  const appliedLabels: string[] = [];

  for (const decision of decisions) {
    appliedLabels.push(decision.label);

    if (decision.axisEffects) {
      for (const axis of ISSUE_AXES) {
        const delta = decision.axisEffects[axis];
        if (delta !== undefined) positions[axis] = clamp(positions[axis] + delta, -100, 100);
      }
    }

    for (const personaId of PERSONA_IDS) {
      const magnitude = decision.personaEffects[personaId];
      if (magnitude !== undefined) {
        newMemory.push({
          id: `${decision.id}:${personaId}:${state.monthIndex}`,
          sourceLabel: decision.label,
          appliedMonth: state.monthIndex,
          personaId,
          magnitude,
        });
      }
    }

    if (decision.cost?.treasury) treasury -= decision.cost.treasury;
    if (decision.cost?.politicalCapital) politicalCapital -= decision.cost.politicalCapital;
  }

  const economy = advanceEconomy(state.economy, mergeEconomyEffects(decisions), cursor);
  const stakeholders = advanceStakeholders(state.stakeholders, decisions);
  const monthIndex = state.monthIndex + 1;
  const date = advanceGameDate(state.date);
  const memory = [...state.memory, ...newMemory];

  const interim: GameState = {
    ...state,
    positions,
    economy,
    stakeholders,
    memory,
    monthIndex,
    date,
    treasury,
    rngState: cursor.seed,
    politicalCapital,
  };

  const nationalApproval = computeNationalApproval(interim);
  const capitalEarned = (nationalApproval - 50) * BALANCE.politicalCapital.APPROVAL_TO_CAPITAL_RATE;
  politicalCapital = clamp(
    politicalCapital + capitalEarned,
    BALANCE.politicalCapital.MIN,
    BALANCE.politicalCapital.MAX,
  );

  const historyEntry: HistoryEntry = {
    date,
    nationalApproval,
    economy,
    treasury,
    politicalCapital,
    notableDecisions: appliedLabels,
  };

  return {
    ...interim,
    politicalCapital,
    history: [...state.history, historyEntry],
  };
}
