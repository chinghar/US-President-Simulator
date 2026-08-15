import eventsJson from './events.json';
import { getAllTradeoffErrors } from '../engine/validators';
import type { CrisisEvent } from '../engine/types';

// events.json is the extensible crisis-event deck — adding a new event is a
// pure data-file edit, never an engine change. This module only adds typing
// and a dev-mode sanity check on top of it.
export const EVENTS: CrisisEvent[] = eventsJson as CrisisEvent[];

export function getEventErrors(event: CrisisEvent): string[] {
  const errors: string[] = [];
  if (event.options.length < 2) {
    errors.push(`Event "${event.id}" must have at least 2 response options, found ${event.options.length}.`);
  }
  errors.push(...getAllTradeoffErrors(event.options));
  return errors;
}

export function assertEventsValidInDev(isDev: boolean): void {
  if (!isDev) return;
  const ids = new Set<string>();
  const errors = EVENTS.flatMap((event) => {
    const dupeErrors = ids.has(event.id) ? [`Duplicate event id "${event.id}".`] : [];
    ids.add(event.id);
    return [...dupeErrors, ...getEventErrors(event)];
  });
  if (errors.length > 0) {
    throw new Error(`events.json validation failed:\n${errors.join('\n')}`);
  }
}
