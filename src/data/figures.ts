import figuresJson from './figures.json';
import { ISSUE_AXES, TRAIT_IDS, type Figure } from '../engine/types';

// figures.json is intentionally plain, user-editable data — players can swap
// in their own roster. This module only adds typing and a dev-mode sanity
// check on top of it; it never special-cases any individual figure.
export const FIGURES: Figure[] = figuresJson as Figure[];

export function getFigureTradeoffErrors(figure: Figure): string[] {
  const errors: string[] = [];
  if (figure.traits.length !== 3) {
    errors.push(`Figure "${figure.id}" must have exactly 3 traits, found ${figure.traits.length}.`);
  }
  for (const traitId of figure.traits) {
    if (!TRAIT_IDS.includes(traitId)) {
      errors.push(`Figure "${figure.id}" has unknown trait id "${traitId}".`);
    }
  }
  for (const axis of ISSUE_AXES) {
    const value = figure.startingPositions[axis];
    if (value === undefined || value < -100 || value > 100) {
      errors.push(`Figure "${figure.id}" has an out-of-range or missing position on axis "${axis}": ${value}.`);
    }
  }
  return errors;
}

export function assertFiguresValidInDev(isDev: boolean): void {
  if (!isDev) return;
  const ids = new Set<string>();
  const errors = FIGURES.flatMap((figure) => {
    const dupeErrors = ids.has(figure.id) ? [`Duplicate figure id "${figure.id}".`] : [];
    ids.add(figure.id);
    return [...dupeErrors, ...getFigureTradeoffErrors(figure)];
  });
  if (errors.length > 0) {
    throw new Error(`figures.json validation failed:\n${errors.join('\n')}`);
  }
}
