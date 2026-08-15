import { useState } from 'react';
import { PERSONAS } from '../../../data/personas';
import { computeAllPersonaSupport } from '../../../engine/support';
import type { GameState } from '../../../engine/types';

export function PersonaApprovalPanel({ game }: { game: GameState }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const support = computeAllPersonaSupport(game);
  const rows = Object.values(support).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Approval by Group</h3>
      <div className="space-y-2">
        {rows.map((s) => (
          <div key={s.personaId}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === s.personaId ? null : s.personaId)}
              className="flex w-full items-center justify-between text-left text-sm"
            >
              <span className="text-slate-300">{PERSONAS[s.personaId].name}</span>
              <span className="tabular-nums text-slate-400">{s.total.toFixed(0)}</span>
            </button>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${s.total}%` }} />
            </div>
            {expanded === s.personaId && (
              <div className="mt-1.5 grid grid-cols-5 gap-2 rounded-md bg-navy-950 p-2 text-[11px] text-slate-400">
                <div>Ideology: {s.ideology.toFixed(1)}</div>
                <div>Economy: {s.economy.toFixed(1)}</div>
                <div>Events: {s.events.toFixed(1)}</div>
                <div>Traits: {s.traits.toFixed(1)}</div>
                <div>State: {s.state.toFixed(1)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
