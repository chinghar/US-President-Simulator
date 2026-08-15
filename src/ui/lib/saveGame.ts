import type { GameState } from '../../engine/types';

export const SAVE_SLOT_COUNT = 3;
const STORAGE_PREFIX = 'usa-pres-sim:slot:';

export interface SaveSlotSummary {
  slot: number;
  playerName: string;
  party: string;
  month: number;
  year: number;
  phase: string;
  savedAt: string;
}

function slotKey(slot: number): string {
  return `${STORAGE_PREFIX}${slot}`;
}

export function saveGameToSlot(game: GameState, slot: number): void {
  const payload = { savedAt: new Date().toISOString(), game };
  localStorage.setItem(slotKey(slot), JSON.stringify(payload));
}

export function loadGameFromSlot(slot: number): GameState | null {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt: string; game: GameState };
    return parsed.game;
  } catch {
    return null;
  }
}

export function deleteSaveSlot(slot: number): void {
  localStorage.removeItem(slotKey(slot));
}

export function listSaveSlots(): (SaveSlotSummary | null)[] {
  const slots: (SaveSlotSummary | null)[] = [];
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot++) {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) {
      slots.push(null);
      continue;
    }
    try {
      const parsed = JSON.parse(raw) as { savedAt: string; game: GameState };
      slots.push({
        slot,
        playerName: parsed.game.player.name,
        party: parsed.game.player.party,
        month: parsed.game.date.month,
        year: parsed.game.date.year,
        phase: parsed.game.phase,
        savedAt: parsed.savedAt,
      });
    } catch {
      slots.push(null);
    }
  }
  return slots;
}

export function exportGameAsJson(game: GameState): void {
  const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `usa-presidential-simulator-${game.player.name.replace(/\s+/g, '_')}-${game.date.year}-${game.date.month}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Loose structural validation — enough to catch a malformed/foreign file
 * without re-implementing full schema validation on the client. */
export function isLikelyGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === 'object' &&
    typeof v.monthIndex === 'number' &&
    typeof v.phase === 'string' &&
    typeof v.rngState === 'number' &&
    typeof v.player === 'object' &&
    typeof v.positions === 'object'
  );
}

export function importGameFromJsonText(text: string): GameState {
  const parsed = JSON.parse(text);
  if (!isLikelyGameState(parsed)) {
    throw new Error('That file does not look like a USA Presidential Simulator save.');
  }
  return parsed;
}
