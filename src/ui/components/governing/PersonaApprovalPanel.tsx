import { useState } from 'react';
import { PERSONAS } from '../../../data/personas';
import { computeAllPersonaSupport } from '../../../engine/support';
import type { GameState } from '../../../engine/types';
import { Meter, Panel } from '../../kit';

export function PersonaApprovalPanel({ game }: { game: GameState }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const support = computeAllPersonaSupport(game);
  const rows = Object.values(support).sort((a, b) => b.total - a.total);

  return (
    <Panel title="Approval by group">
      <div className="space-y-2.5">
        {rows.map((s) => (
          <div key={s.personaId}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === s.personaId ? null : s.personaId)}
              className="flex w-full items-center justify-between text-left text-small"
            >
              <span className="text-paper/70">{PERSONAS[s.personaId].name}</span>
              <span className="font-mono text-paper/60">{s.total.toFixed(0)}</span>
            </button>
            <Meter value={s.total} className="mt-1" />
            {expanded === s.personaId && (
              <div className="mt-1.5 grid grid-cols-5 gap-2 border border-rule bg-ink-900 p-2 text-[11px] text-paper/50">
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
    </Panel>
  );
}
