import { useMemo, useState } from 'react';
import { STATES } from '../../../data/states';
import { computeStateApproval } from '../../../engine/support';
import { STATE_IDS, type GameState, type StateId } from '../../../engine/types';
import { approvalColor, UsMap } from '../UsMap';

export function ApprovalMapPanel({ game }: { game: GameState }) {
  const [selected, setSelected] = useState<StateId | null>(null);
  const approvals = useMemo(() => {
    const map = new Map<StateId, number>();
    for (const id of STATE_IDS) map.set(id, computeStateApproval(game, id));
    return map;
  }, [game]);

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Approval by State</h3>
      <UsMap
        colorForState={(id) => approvalColor(approvals.get(id) ?? 50)}
        onSelectState={setSelected}
        selectedState={selected}
      />
      {selected && (
        <p className="text-sm text-slate-300">
          {STATES[selected].name}: <span className="tabular-nums text-slate-100">{(approvals.get(selected) ?? 0).toFixed(1)}%</span> approval
        </p>
      )}
    </div>
  );
}
