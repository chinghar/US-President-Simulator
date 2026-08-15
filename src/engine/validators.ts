import type { Decision } from './types';

/** Pure check, always available (used directly in tests): every decision must
 * help at least one persona and hurt at least one — no monotonically-good or
 * monotonically-bad decisions are allowed anywhere in the data files. */
export function getDecisionTradeoffErrors(decision: Decision): string[] {
  const effects = Object.values(decision.personaEffects).filter((v): v is number => v !== undefined);
  const hasPositive = effects.some((v) => v > 0);
  const hasNegative = effects.some((v) => v < 0);
  if (!hasPositive || !hasNegative) {
    return [
      `Decision "${decision.id}" (${decision.label}) has no genuine trade-off: it must help at least one ` +
        `persona and hurt at least one. Found effects: ${JSON.stringify(decision.personaEffects)}`,
    ];
  }
  return [];
}

export function getAllTradeoffErrors(decisions: Decision[]): string[] {
  return decisions.flatMap(getDecisionTradeoffErrors);
}

/** Dev-mode loud failure, meant to be called once at data-load time in app
 * bootstrap (not inside the engine's hot path). Throws in dev builds only. */
export function assertDecisionTradeoffsInDev(decisions: Decision[], isDev: boolean): void {
  if (!isDev) return;
  const errors = getAllTradeoffErrors(decisions);
  if (errors.length > 0) {
    throw new Error(`Decision trade-off validation failed:\n${errors.join('\n')}`);
  }
}
