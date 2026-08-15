import { PERSONAS } from '../../data/personas';
import { BALANCE } from '../../data/balance';
import type { Decision, PersonaId } from '../../engine/types';

export interface PersonaEffectPreview {
  personaId: PersonaId;
  name: string;
  min: number;
  max: number;
}

/**
 * A deliberately uncertain preview, not the exact number that will land.
 * For bills, the range is the genuine span the concession slider can produce
 * (fully watered down at MIN_CONCESSION_EFFECT_STRENGTH .. full strength) —
 * real uncertainty tied to a choice the player controls, not decoration.
 * For anything without concession scaling (executive orders, crisis
 * responses), a flat +/-20% band stands in for imperfect intelligence.
 */
export function previewPersonaEffects(decision: Decision, options?: { concessionScalable?: boolean }): PersonaEffectPreview[] {
  const floor = options?.concessionScalable ? BALANCE.governing.MIN_CONCESSION_EFFECT_STRENGTH : 0.8;
  const ceiling = options?.concessionScalable ? 1 : 1.2;

  const entries = Object.entries(decision.personaEffects) as [PersonaId, number][];
  return entries
    .filter(([, value]) => value !== undefined && value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 6)
    .map(([personaId, value]) => {
      const lo = value * floor;
      const hi = value * ceiling;
      return {
        personaId,
        name: PERSONAS[personaId].name,
        min: Math.min(lo, hi),
        max: Math.max(lo, hi),
      };
    });
}

export function formatRange(min: number, max: number): string {
  const fmt = (v: number) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0));
  if (Math.round(min) === Math.round(max)) return fmt(min);
  return `${fmt(min)} to ${fmt(max)}`;
}
