import { useRef, useState } from 'react';
import {
  deleteSaveSlot,
  exportGameAsJson,
  importGameFromJsonText,
  listSaveSlots,
  loadGameFromSlot,
  SAVE_SLOT_COUNT,
  saveGameToSlot,
} from '../lib/saveGame';
import { useGameStore } from '../state/gameStore';
import { Button, Eyebrow, Rule } from '../kit';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PHASE_LABEL: Record<string, string> = { primary: 'Primary', general: 'General', governing: 'Governing' };

export function SaveLoadMenu({ onClose }: { onClose: () => void }) {
  const game = useGameStore((s) => s.game);
  const loadGame = useGameStore((s) => s.loadGame);
  const [slots, setSlots] = useState(() => listSaveSlots());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setSlots(listSaveSlots());
  }

  function handleSave(slot: number) {
    if (!game) return;
    const existing = slots[slot - 1];
    if (existing && !window.confirm(`Overwrite the save in slot ${slot} (${existing.playerName})?`)) return;
    saveGameToSlot(game, slot);
    refresh();
  }

  function handleLoad(slot: number) {
    const loaded = loadGameFromSlot(slot);
    if (loaded) {
      loadGame(loaded);
      onClose();
    }
  }

  function handleDelete(slot: number) {
    if (!window.confirm(`Delete the save in slot ${slot}? This cannot be undone.`)) return;
    deleteSaveSlot(slot);
    refresh();
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = importGameFromJsonText(String(reader.result));
        loadGame(loaded);
        setError(null);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not read that file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg border border-rule bg-ink-700 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <Eyebrow>Save / load</Eyebrow>
          <button type="button" onClick={onClose} className="text-paper/50 hover:text-flag">
            Close
          </button>
        </div>

        <div className="space-y-2">
          {Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => i + 1).map((slot) => {
            const summary = slots[slot - 1];
            return (
              <div key={slot} className="flex items-center justify-between border border-rule bg-ink-900 px-3 py-2">
                <div className="text-small">
                  <p className="text-paper">Slot {slot}</p>
                  {summary ? (
                    <p className="text-[13px] text-paper/50">
                      {summary.playerName} · {PHASE_LABEL[summary.phase] ?? summary.phase} · {MONTH_NAMES[summary.month]} {summary.year}
                    </p>
                  ) : (
                    <p className="text-[13px] text-paper/30">Empty</p>
                  )}
                </div>
                <div className="flex gap-2 text-[13px]">
                  {game && (
                    <button type="button" onClick={() => handleSave(slot)} className="border border-rule px-2 py-1 text-paper/70 hover:border-brass hover:text-brass">
                      Save
                    </button>
                  )}
                  {summary && (
                    <>
                      <button type="button" onClick={() => handleLoad(slot)} className="border border-rule px-2 py-1 text-paper/70 hover:border-seal hover:text-seal">
                        Load
                      </button>
                      <button type="button" onClick={() => handleDelete(slot)} className="border border-rule px-2 py-1 text-paper/50 hover:border-flag hover:text-flag">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Rule className="my-4" />

        <div className="flex items-center justify-between">
          <Button variant="secondary" disabled={!game} onClick={() => game && exportGameAsJson(game)}>
            Export JSON
          </Button>
          <div>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
        {error && <p className="mt-2 text-[13px] text-flag">{error}</p>}
      </div>
    </div>
  );
}
