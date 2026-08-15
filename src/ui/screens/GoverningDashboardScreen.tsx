import { useMemo, useState } from 'react';
import { getPendingCrisisEvents } from '../../engine/governing';
import { computeNationalApproval } from '../../engine/support';
import type { CabinetPositionId } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { ApprovalMapPanel } from '../components/governing/ApprovalMapPanel';
import { CabinetPanel } from '../components/governing/CabinetPanel';
import { CongressPanel, HeadlinesPanel } from '../components/governing/CongressAndMedia';
import { CrisisEventPanel } from '../components/governing/CrisisEventPanel';
import { ExecutiveOrderPanel } from '../components/governing/ExecutiveOrderPanel';
import { LegislationPanel, type ProposedBillInput } from '../components/governing/LegislationPanel';
import { PersonaApprovalPanel } from '../components/governing/PersonaApprovalPanel';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function GoverningDashboardScreen() {
  const game = useGameStore((s) => s.game);
  const advanceGoverning = useGameStore((s) => s.advanceGoverning);
  const resetGame = useGameStore((s) => s.resetGame);

  const [crisisResponses, setCrisisResponses] = useState<Record<string, string>>({});
  const [cabinetAppointment, setCabinetAppointment] = useState<{ positionId: CabinetPositionId; appointeeId: string } | null>(null);
  const [proposedBill, setProposedBill] = useState<ProposedBillInput | null>(null);
  const [executiveOrderId, setExecutiveOrderId] = useState<string | null>(null);

  const pendingEvents = useMemo(() => (game ? getPendingCrisisEvents(game) : []), [game]);

  if (!game || !game.governing) return null;

  const approval = computeNationalApproval(game);
  const allEventsAnswered = pendingEvents.every((e) => crisisResponses[e.id]);
  const actionsUsed = (cabinetAppointment ? 1 : 0) + (proposedBill ? 2 : 0) + (executiveOrderId ? 1 : 0);

  function handleAdvance() {
    advanceGoverning({
      crisisResponses,
      cabinetAppointment: cabinetAppointment ?? undefined,
      proposedBill: proposedBill ?? undefined,
      executiveOrder: executiveOrderId ? { orderId: executiveOrderId } : undefined,
    });
    setCrisisResponses({});
    setCabinetAppointment(null);
    setProposedBill(null);
    setExecutiveOrderId(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-400">Governing · {game.player.name}</p>
          <h1 className="text-2xl font-semibold text-slate-100">
            {MONTH_NAMES[game.date.month]} {game.date.year}
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <p className="text-slate-500">Approval</p>
            <p className="tabular-nums text-slate-100">{approval.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Political Capital</p>
            <p className="tabular-nums text-slate-100">{game.politicalCapital.toFixed(0)}</p>
          </div>
          <button type="button" onClick={resetGame} className="text-xs text-slate-500 hover:text-slate-300">
            Start Over
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {pendingEvents.map((event) => (
            <CrisisEventPanel
              key={event.id}
              event={event}
              selectedOptionId={crisisResponses[event.id] ?? null}
              onSelect={(optionId) => setCrisisResponses((prev) => ({ ...prev, [event.id]: optionId }))}
            />
          ))}

          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-3 text-xs text-slate-500">
            Action budget this month: {actionsUsed}/4 AP spent (cabinet appointment 1 AP, bill 2 AP, executive order 1 AP)
          </div>

          <CabinetPanel
            cabinet={game.governing.cabinet}
            pendingAppointment={cabinetAppointment}
            onChange={setCabinetAppointment}
            canAppoint={actionsUsed - (cabinetAppointment ? 1 : 0) + 1 <= 4}
          />

          <LegislationPanel
            history={game.governing.legislationHistory}
            pending={proposedBill}
            onChange={setProposedBill}
            canPropose={actionsUsed - (proposedBill ? 2 : 0) + 2 <= 4}
            congress={game.governing.congress}
            stakeholders={game.stakeholders}
          />

          <ExecutiveOrderPanel
            history={game.governing.executiveOrderHistory}
            pendingOrderId={executiveOrderId}
            onChange={setExecutiveOrderId}
            canIssue={actionsUsed - (executiveOrderId ? 1 : 0) + 1 <= 4}
          />

          <button
            type="button"
            onClick={handleAdvance}
            disabled={!allEventsAnswered}
            className={[
              'w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
              !allEventsAnswered ? 'cursor-not-allowed bg-navy-700 text-slate-500' : 'bg-sky-600 text-white hover:bg-sky-500',
            ].join(' ')}
          >
            Advance to Next Month
          </button>
        </div>

        <aside className="space-y-6">
          <CongressPanel congress={game.governing.congress} />
          <ApprovalMapPanel game={game} />
          <PersonaApprovalPanel game={game} />
          <HeadlinesPanel headlines={game.governing.headlines} />
        </aside>
      </div>
    </div>
  );
}
