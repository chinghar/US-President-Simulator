import type { GameDate } from './types';

export function advanceGameDate(date: GameDate): GameDate {
  return date.month === 12 ? { month: 1, year: date.year + 1 } : { month: date.month + 1, year: date.year };
}

/** True if `date` falls within [start, end] inclusive, comparing (year, month) lexicographically. */
export function isDateInRange(date: GameDate, start: GameDate, end: GameDate): boolean {
  const value = date.year * 12 + date.month;
  return value >= start.year * 12 + start.month && value <= end.year * 12 + end.month;
}

export function dateEquals(a: GameDate, b: GameDate): boolean {
  return a.month === b.month && a.year === b.year;
}

/** Absolute months since the Jan-2028 epoch (Jan 2028 = 0). The single
 * source of truth for GameState.monthIndex, valid across every phase and
 * cycle (original term or a 2032 re-election), so memory decay stays
 * correct no matter which calendar year a given month falls in. */
export function dateToMonthIndex(date: GameDate): number {
  return (date.year - 2028) * 12 + (date.month - 1);
}
