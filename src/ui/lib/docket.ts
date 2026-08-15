import type { GameDate } from '../../engine/types';

const MONTH_ABBR = ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

/** The Congress in session for a given year, matching real numbering
 * (the 121st Congress convenes Jan 2029, the year this game's term begins). */
export function congressNumber(year: number): number {
  return 121 + Math.floor((year - 2029) / 2);
}

function stableNumber(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

/** A real docket line, not decoration — derived from the item's own id and
 * the date it was referred/signed: `H.R. 4417 · 121ST CONGRESS · REFERRED 03.2029`. */
export function formatBillDocket(billId: string, date: GameDate): string {
  const number = 1000 + stableNumber(billId, 8999);
  const congress = congressNumber(date.year);
  const ordinal = congress % 10 === 1 && congress % 100 !== 11 ? 'ST' : congress % 10 === 2 && congress % 100 !== 12 ? 'ND' : congress % 10 === 3 && congress % 100 !== 13 ? 'RD' : 'TH';
  return `H.R. ${number} · ${congress}${ordinal} CONGRESS · REFERRED ${MONTH_ABBR[date.month]}.${date.year}`;
}

export function formatExecutiveOrderDocket(orderId: string, date: GameDate): string {
  const number = 14500 + stableNumber(orderId, 499);
  return `EXEC. ORDER ${number} · SIGNED ${MONTH_ABBR[date.month]}.${date.year}`;
}

export function formatBriefingDocket(eventId: string, date: GameDate): string {
  return `MEMO ${stableNumber(eventId, 899) + 100} · ${MONTH_ABBR[date.month]}.${date.year}`;
}
