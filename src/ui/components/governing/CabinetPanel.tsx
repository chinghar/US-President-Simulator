import { useState } from 'react';
import { CABINET_APPOINTEES, CABINET_POSITION_INFO, getCabinetCandidates } from '../../../data/cabinet';
import { CABINET_POSITION_IDS, type CabinetPositionId, type GoverningState } from '../../../engine/types';

interface CabinetPanelProps {
  cabinet: GoverningState['cabinet'];
  pendingAppointment: { positionId: CabinetPositionId; appointeeId: string } | null;
  onChange: (appointment: { positionId: CabinetPositionId; appointeeId: string } | null) => void;
  canAppoint: boolean;
}

export function CabinetPanel({ cabinet, pendingAppointment, onChange, canAppoint }: CabinetPanelProps) {
  const [openPosition, setOpenPosition] = useState<CabinetPositionId | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cabinet</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CABINET_POSITION_IDS.map((positionId) => {
          const appointment = cabinet[positionId];
          const appointee = appointment ? CABINET_APPOINTEES.find((a) => a.id === appointment.appointeeId) : null;
          const isPending = pendingAppointment?.positionId === positionId;

          return (
            <div key={positionId} className="rounded-md border border-navy-700 bg-navy-900 p-2.5 text-sm">
              <p className="text-xs text-slate-500">{CABINET_POSITION_INFO[positionId].name}</p>
              {appointee ? (
                <p className={appointment!.confirmed ? 'text-slate-200' : 'text-amber-400'}>
                  {appointee.name} {appointment!.confirmed ? '' : '(confirmation failed)'}
                </p>
              ) : isPending ? (
                <p className="text-sky-300">{CABINET_APPOINTEES.find((a) => a.id === pendingAppointment!.appointeeId)?.name} (pending)</p>
              ) : (
                <p className="text-slate-600">Vacant</p>
              )}

              {!appointee && canAppoint && (
                <div className="mt-1.5">
                  {openPosition === positionId ? (
                    <select
                      autoFocus
                      onChange={(e) => {
                        if (e.target.value) onChange({ positionId, appointeeId: e.target.value });
                        setOpenPosition(null);
                      }}
                      onBlur={() => setOpenPosition(null)}
                      className="w-full rounded-md border border-navy-700 bg-navy-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-sky-500"
                    >
                      <option value="">Choose a nominee...</option>
                      {getCabinetCandidates(positionId).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (competence {c.competence})
                        </option>
                      ))}
                    </select>
                  ) : isPending ? (
                    <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-500 hover:text-red-400">
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenPosition(positionId)}
                      disabled={!!pendingAppointment && pendingAppointment.positionId !== positionId}
                      className="text-xs text-sky-400 hover:text-sky-300 disabled:cursor-not-allowed disabled:text-slate-600"
                    >
                      Appoint...
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
