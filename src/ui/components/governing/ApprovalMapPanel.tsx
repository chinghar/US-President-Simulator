import { useMemo, useState } from 'react';
import { PERSONAS } from '../../../data/personas';
import { STATES } from '../../../data/states';
import { computePersonaSupport, computeStateApproval } from '../../../engine/support';
import { PERSONA_IDS, STATE_IDS, type GameState, type StateId } from '../../../engine/types';
import { Eyebrow, Panel } from '../../kit';
import { UsMap } from '../UsMap';

export function ApprovalMapPanel({ game }: { game: GameState }) {
  const [hovered, setHovered] = useState<StateId | null>(null);
  const approvals = useMemo(() => {
    const map = new Map<StateId, number>();
    for (const id of STATE_IDS) map.set(id, computeStateApproval(game, id));
    return map;
  }, [game]);

  const breakdown = useMemo(() => {
    if (!hovered) return null;
    return PERSONA_IDS.map((id) => ({ id, name: PERSONAS[id].name, support: computePersonaSupport(id, game, hovered).total }))
      .sort((a, b) => b.support - a.support)
      .slice(0, 3);
  }, [hovered, game]);

  return (
    <Panel title="Approval by state">
      <UsMap
        marginForState={(id) => (approvals.get(id) ?? 50) - 50}
        negativeColor="var(--flag)"
        positiveColor="var(--seal)"
        onSelectState={setHovered}
        onHoverState={setHovered}
        selectedState={hovered}
      />
      {hovered && (
        <div className="border-t border-rule pt-2">
          <p className="text-small text-paper">
            {STATES[hovered].name}: <span className="font-mono text-paper">{(approvals.get(hovered) ?? 0).toFixed(1)}%</span> approval
          </p>
          {breakdown && (
            <div className="mt-1 space-y-0.5">
              {breakdown.map((b) => (
                <div key={b.id} className="flex justify-between text-[13px] text-paper/70">
                  <span>{b.name}</span>
                  <span className="font-mono">{b.support.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!hovered && <Eyebrow>Point at a state for its persona breakdown</Eyebrow>}
    </Panel>
  );
}
