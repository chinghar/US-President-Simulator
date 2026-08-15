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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border border-navy-700 bg-navy-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Save / Load</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300">
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => i + 1).map((slot) => {
            const summary = slots[slot - 1];
            return (
              <div key={slot} className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-950 px-3 py-2">
                <div className="text-sm">
                  <p className="text-slate-300">Slot {slot}</p>
                  {summary ? (
                    <p className="text-xs text-slate-500">
                      {summary.playerName} · {PHASE_LABEL[summary.phase] ?? summary.phase} · {MONTH_NAMES[summary.month]} {summary.year}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">Empty</p>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  {game && (
                    <button type="button" onClick={() => handleSave(slot)} className="rounded border border-navy-600 px-2 py-1 text-slate-300 hover:border-sky-500 hover:text-sky-300">
                      Save
                    </button>
                  )}
                  {summary && (
                    <>
                      <button type="button" onClick={() => handleLoad(slot)} className="rounded border border-navy-600 px-2 py-1 text-slate-300 hover:border-sky-500 hover:text-sky-300">
                        Load
                      </button>
                      <button type="button" onClick={() => handleDelete(slot)} className="rounded border border-navy-600 px-2 py-1 text-slate-400 hover:border-red-500 hover:text-red-400">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy-700 pt-4">
          <button
            type="button"
            disabled={!game}
            onClick={() => game && exportGameAsJson(game)}
            className="rounded-md border border-navy-600 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            Export JSON
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-navy-600 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-400"
            >
              Import JSON
            </button>
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
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
