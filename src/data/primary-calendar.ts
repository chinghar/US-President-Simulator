import type { PrimaryContestDef, StateId } from '../engine/types';

/**
 * A condensed but real-order 2028 primary calendar: every one of the 51
 * jurisdictions votes exactly once, grouped into 10 contest dates from
 * February through June, loosely following the traditional early-state /
 * Super Tuesday / later-batches shape. Delegate counts are derived from each
 * state's population weight (see engine/primary.ts), not stored here.
 */
export const PRIMARY_CALENDAR: PrimaryContestDef[] = [
  { id: 'iowa', name: 'Iowa', month: 2, year: 2028, order: 1, states: ['IA'] },
  { id: 'new_hampshire', name: 'New Hampshire', month: 2, year: 2028, order: 2, states: ['NH'] },
  { id: 'nevada', name: 'Nevada', month: 2, year: 2028, order: 3, states: ['NV'] },
  { id: 'south_carolina', name: 'South Carolina', month: 2, year: 2028, order: 4, states: ['SC'] },
  {
    id: 'super_tuesday',
    name: 'Super Tuesday',
    month: 3,
    year: 2028,
    order: 5,
    states: [
      'AL', 'AK', 'AR', 'CA', 'CO', 'MA', 'ME', 'MN',
      'NC', 'OK', 'TN', 'TX', 'UT', 'VT', 'VA', 'ND',
    ] as StateId[],
  },
  {
    id: 'mid_march',
    name: 'Mid-March',
    month: 3,
    year: 2028,
    order: 6,
    states: ['GA', 'MS', 'WA', 'ID', 'HI', 'MI'] as StateId[],
  },
  {
    id: 'late_march',
    name: 'Late March',
    month: 3,
    year: 2028,
    order: 7,
    states: ['AZ', 'FL', 'IL', 'KS', 'OH'] as StateId[],
  },
  {
    id: 'april',
    name: 'April Contests',
    month: 4,
    year: 2028,
    order: 8,
    states: ['CT', 'DE', 'NY', 'PA', 'RI', 'MD', 'WI'] as StateId[],
  },
  {
    id: 'may',
    name: 'May Contests',
    month: 5,
    year: 2028,
    order: 9,
    states: ['IN', 'KY', 'NE', 'OR', 'WV'] as StateId[],
  },
  {
    id: 'june',
    name: 'June Contests',
    month: 6,
    year: 2028,
    order: 10,
    states: ['LA', 'MO', 'MT', 'NJ', 'NM', 'SD', 'WY', 'DC'] as StateId[],
  },
];

export const ALL_CALENDAR_STATES: StateId[] = PRIMARY_CALENDAR.flatMap((c) => c.states);
