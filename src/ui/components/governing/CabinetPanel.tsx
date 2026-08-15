import { useState } from 'react';
import { CABINET_APPOINTEES, CABINET_POSITION_INFO, getCabinetCandidates } from '../../../data/cabinet';
import { CABINET_POSITION_IDS, type CabinetPositionId, type GoverningState } from '../../../engine/types';
import { Panel } from '../../kit';

interface CabinetPanelProps {
  cabinet: GoverningState['cabinet'];
  pendingAppointment: { positionId: CabinetPositionId; appointeeId: string } | null;
  onChange: (appointment: { positionId: CabinetPositionId; appointeeId: string } | null) => void;
  canAppoint: boolean;
}

export function CabinetPanel({ cabinet, pendingAppointment, onChange, canAppoint }: CabinetPanelProps) {
  const [openPosition, setOpenPosition] = useState<CabinetPositionId | null>(null);

  return (
    <Panel title="Cabinet">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CABINET_POSITION_IDS.map((positionId) => {
          const appointment = cabinet[positionId];
          const appointee = appointment ? CABINET_APPOINTEES.find((a) => a.id === appointment.appointeeId) : null;
          const isPending = pendingAppointment?.positionId === positionId;

          return (
            <div key={positionId} className="border border-rule p-2.5 text-small">
              <p className="text-[13px] text-paper/50">{CABINET_POSITION_INFO[positionId].name}</p>
              {appointee ? (
                <p className={appointment!.confirmed ? 'text-paper' : 'text-brass'}>
                  {appointee.name} {appointment!.confirmed ? '' : '— confirmation failed'}
                </p>
              ) : isPending ? (
                <p className="text-seal">{CABINET_APPOINTEES.find((a) => a.id === pendingAppointment!.appointeeId)?.name} — pending</p>
              ) : (
                <p className="text-paper/40">Vacant</p>
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
                      className="w-full rounded border border-rule bg-ink-900 px-2 py-1 text-[13px] text-paper outline-none focus-visible:border-brass"
                    >
                      <option value="">Choose a nominee</option>
                      {getCabinetCandidates(positionId).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (competence {c.competence})
                        </option>
                      ))}
                    </select>
                  ) : isPending ? (
                    <button type="button" onClick={() => onChange(null)} className="text-[13px] text-paper/50 hover:text-flag">
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenPosition(positionId)}
                      disabled={!!pendingAppointment && pendingAppointment.positionId !== positionId}
                      className="text-[13px] text-seal hover:brightness-125 disabled:cursor-not-allowed disabled:text-paper/30"
                    >
                      Appoint
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
