import { useState } from 'react';
import { CABINET_APPOINTEES, CABINET_POSITION_INFO, getCabinetCandidates } from '../../../data/cabinet';
import { cabinetEffectiveness } from '../../../engine/governing';
import { CABINET_POSITION_IDS, type CabinetPositionId, type GoverningState } from '../../../engine/types';
import { Panel } from '../../kit';

interface CabinetPanelProps {
  cabinet: GoverningState['cabinet'];
  pendingAppointment: { positionId: CabinetPositionId; appointeeId: string } | null;
  onChange: (appointment: { positionId: CabinetPositionId; appointeeId: string } | null) => void;
  canAppoint: boolean;
}

function StatLine({ competence, ideology, loyalty }: { competence: number; ideology: number; loyalty: number }) {
  const effectiveness = cabinetEffectiveness({ competence, loyalty });
  return (
    <p className="mt-0.5 text-[13px] text-paper/50">
      Competence {competence} · Ideology {ideology > 0 ? `+${ideology}` : ideology} · Loyalty {loyalty}
      <span className={effectiveness >= 0 ? 'text-seal' : 'text-flag'}> · {effectiveness >= 0 ? '+' : ''}{(effectiveness * 100).toFixed(0)}% effective</span>
    </p>
  );
}

export function CabinetPanel({ cabinet, pendingAppointment, onChange, canAppoint }: CabinetPanelProps) {
  const [openPosition, setOpenPosition] = useState<CabinetPositionId | null>(null);

  return (
    <Panel title="Cabinet">
      <p className="text-[13px] text-paper/50">
        Competence, ideology, and loyalty all matter: ideology drives Senate confirmation odds, and competence only
        pays off in office to the degree an appointee is loyal to the administration.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CABINET_POSITION_IDS.map((positionId) => {
          const appointment = cabinet[positionId];
          const appointee = appointment ? CABINET_APPOINTEES.find((a) => a.id === appointment.appointeeId) : null;
          const isPending = pendingAppointment?.positionId === positionId;
          const pendingAppointee = isPending ? CABINET_APPOINTEES.find((a) => a.id === pendingAppointment!.appointeeId) : null;

          return (
            <div key={positionId} className="border border-rule p-2.5 text-small">
              <p className="text-[13px] text-paper/50">{CABINET_POSITION_INFO[positionId].name}</p>
              {appointee ? (
                <>
                  <p className={appointment!.confirmed ? 'text-paper' : 'text-brass'}>
                    {appointee.name} {appointment!.confirmed ? '' : '— confirmation failed'}
                  </p>
                  {appointment!.confirmed && <StatLine competence={appointee.competence} ideology={appointee.ideology} loyalty={appointee.loyalty} />}
                </>
              ) : pendingAppointee ? (
                <>
                  <p className="text-seal">{pendingAppointee.name} — pending</p>
                  <StatLine competence={pendingAppointee.competence} ideology={pendingAppointee.ideology} loyalty={pendingAppointee.loyalty} />
                </>
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
                          {c.name} — competence {c.competence}, ideology {c.ideology > 0 ? `+${c.ideology}` : c.ideology}, loyalty {c.loyalty}
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
