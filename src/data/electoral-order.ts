import type { StateId } from '../engine/types';

/**
 * Approximate poll-closing order (Eastern -> Central -> Mountain -> Pacific ->
 * Alaska/Hawaii), used purely for the election-night reveal sequence — not a
 * source of truth for anything else. Order within a zone is arbitrary.
 */
export const POLL_CLOSING_ORDER: StateId[] = [
  // Eastern
  'CT', 'DE', 'FL', 'GA', 'IN', 'KY', 'ME', 'MD', 'MA', 'MI', 'NH', 'NJ',
  'NY', 'NC', 'OH', 'PA', 'RI', 'SC', 'TN', 'VT', 'VA', 'WV', 'DC',
  // Central
  'AL', 'AR', 'IL', 'IA', 'KS', 'LA', 'MN', 'MS', 'MO', 'ND', 'OK', 'SD', 'TX', 'WI', 'NE',
  // Mountain
  'AZ', 'CO', 'ID', 'MT', 'NM', 'UT', 'WY',
  // Pacific
  'CA', 'NV', 'OR', 'WA',
  // Alaska / Hawaii
  'AK', 'HI',
];
