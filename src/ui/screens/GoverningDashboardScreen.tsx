import { useMemo, useState } from 'react';
import { getPendingCrisisEvents } from '../../engine/governing';
import { computeNationalApproval, computeAllPersonaSupport } from '../../engine/support';
import { PERSONAS } from '../../data/personas';
import type { CabinetPositionId } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { ApprovalMapPanel } from '../components/governing/ApprovalMapPanel';
import { CabinetPanel } from '../components/governing/CabinetPanel';
import { CongressPanel, HeadlinesPanel } from '../components/governing/CongressAndMedia';
import { CrisisEventPanel } from '../components/governing/CrisisEventPanel';
import { ExecutiveOrderPanel } from '../components/governing/ExecutiveOrderPanel';
import { LegislationPanel, type ProposedBillInput } from '../components/governing/LegislationPanel';
import { PersonaApprovalPanel } from '../components/governing/PersonaApprovalPanel';
import { SigningFlourish } from '../components/SigningFlourish';
import { formatBillDocket, formatExecutiveOrderDocket } from '../lib/docket';
import { AnimatedNumber, Button, Eyebrow, PresidentialSeal, Rule, SegmentMeter } from '../kit';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const NAV_ITEMS = [
  { id: 'the-map', label: 'Map' },
  { id: 'congress', label: 'Congress' },
  { id: 'cabinet', label: 'Cabinet' },
  { id: 'bills', label: 'Bills' },
];

export function GoverningDashboardScreen() {
  const game = useGameStore((s) => s.game);
  const advanceGoverning = useGameStore((s) => s.advanceGoverning);
  const resetGame = useGameStore((s) => s.resetGame);

  const [crisisResponses, setCrisisResponses] = useState<Record<string, string>>({});
  const [cabinetAppointment, setCabinetAppointment] = useState<{ positionId: CabinetPositionId; appointeeId: string } | null>(null);
  const [proposedBill, setProposedBill] = useState<ProposedBillInput | null>(null);
  const [executiveOrderId, setExecutiveOrderId] = useState<string | null>(null);
  const [signing, setSigning] = useState<{ docket: string; title: string } | null>(null);

  const pendingEvents = useMemo(() => (game ? getPendingCrisisEvents(game) : []), [game]);
  const personaSupport = useMemo(() => (game ? computeAllPersonaSupport(game) : null), [game]);

  if (!game || !game.governing) return null;

  const approval = computeNationalApproval(game);
  const allEventsAnswered = pendingEvents.every((e) => crisisResponses[e.id]);
  const actionsUsed = (cabinetAppointment ? 1 : 0) + (proposedBill ? 2 : 0) + (executiveOrderId ? 1 : 0);
  const nextMonth = game.date.month === 12 ? 1 : game.date.month + 1;
  const nextYear = game.date.month === 12 ? game.date.year + 1 : game.date.year;
  const reactionRows = personaSupport ? Object.values(personaSupport).sort((a, b) => b.total - a.total).slice(0, 5) : [];

  function handleAdvance() {
    const signingDate = game!.date;
    const billsBefore = game!.governing!.legislationHistory.length;
    const ordersBefore = game!.governing!.executiveOrderHistory.length;

    advanceGoverning({
      crisisResponses,
      cabinetAppointment: cabinetAppointment ?? undefined,
      proposedBill: proposedBill ?? undefined,
      executiveOrder: executiveOrderId ? { orderId: executiveOrderId } : undefined,
    });

    const after = useGameStore.getState().game?.governing;
    const newOrder = after && after.executiveOrderHistory.length > ordersBefore ? after.executiveOrderHistory[after.executiveOrderHistory.length - 1] : null;
    const newBill =
      after && after.legislationHistory.length > billsBefore ? after.legislationHistory[after.legislationHistory.length - 1] : null;

    if (newOrder && !newOrder.courtStruckDown) {
      setSigning({ docket: formatExecutiveOrderDocket(newOrder.orderId, signingDate), title: newOrder.title });
    } else if (newBill && newBill.status === 'passed') {
      setSigning({ docket: formatBillDocket(newBill.billId, signingDate), title: newBill.title });
    }

    setCrisisResponses({});
    setCabinetAppointment(null);
    setProposedBill(null);
    setExecutiveOrderId(null);
  }

  return (
    <div className="flex flex-col md:flex-row md:min-h-screen">
      {signing && <SigningFlourish docket={signing.docket} title={signing.title} onComplete={() => setSigning(null)} />}

      {/* Mobile top bar — left rail collapses here below 768px */}
      <div className="flex items-center justify-between border-b border-rule bg-ink-900 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <PresidentialSeal size={28} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/50">
              {MONTH_NAMES[game.date.month]} {game.date.year}
            </p>
            <p className="text-[13px] text-paper">{game.player.name}</p>
          </div>
        </div>
        <div className="flex gap-3 pr-44 text-right font-mono text-[13px]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-paper/40">Approval</p>
            <p className="text-paper">{approval.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-paper/40">Capital</p>
            <p className="text-paper">{game.politicalCapital.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Left rail — 260px desk column, hidden below 768px */}
      <aside className="relative hidden shrink-0 flex-col gap-5 border-b border-rule bg-ink-900 p-5 md:flex md:w-[260px] md:border-b-0 md:border-r">
        <div className="flex items-center gap-3">
          <PresidentialSeal size={44} />
          <div>
            <Eyebrow>Office of the president</Eyebrow>
            <p className="text-small text-paper">{game.player.name}</p>
          </div>
        </div>

        <div>
          <p className="font-mono text-h3 text-paper">
            {MONTH_NAMES[game.date.month]} {game.date.year}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[13px] text-paper/60">
              <span>Approval</span>
              <AnimatedNumber value={approval} decimals={1} suffix="%" className="text-paper" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[13px] text-paper/60">
              <span>Political capital</span>
              <span className="font-mono text-paper">{game.politicalCapital.toFixed(0)}</span>
            </div>
            <SegmentMeter value={game.politicalCapital} max={100} />
          </div>
          <div className="flex justify-between text-[13px] text-paper/60">
            <span>Treasury</span>
            <AnimatedNumber value={game.treasury / 1_000_000_000} decimals={2} prefix="$" suffix="B" className="text-paper" />
          </div>
        </div>

        <Rule />

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block text-eyebrow uppercase tracking-[0.12em] text-paper/60 transition-colors duration-150 hover:text-brass"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <button type="button" onClick={resetGame} className="text-[13px] text-paper/40 hover:text-flag">
            Start over
          </button>
        </div>

        <PresidentialSeal size={20} className="pointer-events-none absolute right-3 top-3 opacity-30" />
      </aside>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Center — the desk surface */}
        <main className="flex-1 space-y-6 p-6">
          <header>
            <Eyebrow>Governing · {MONTH_NAMES[game.date.month]} {game.date.year}</Eyebrow>
            <h1 className="mt-1 font-display text-h1 text-paper">Decisions on the desk</h1>
          </header>

          {reactionRows.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 border border-rule bg-ink-700 px-4 py-3">
              {reactionRows.map((r) => (
                <div key={r.personaId} className="flex items-center gap-1.5 text-[13px]">
                  <span className={`inline-block h-1.5 w-1.5 ${r.total >= 50 ? 'bg-seal' : 'bg-flag'}`} />
                  <span className="text-paper/60">{PERSONAS[r.personaId].name}</span>
                  <span className="font-mono text-paper">{r.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          {pendingEvents.map((event) => (
            <CrisisEventPanel
              key={event.id}
              event={event}
              selectedOptionId={crisisResponses[event.id] ?? null}
              onSelect={(optionId) => setCrisisResponses((prev) => ({ ...prev, [event.id]: optionId }))}
            />
          ))}

          <p className="text-[13px] text-paper/40">
            Action budget this month: {actionsUsed}/4 spent — cabinet appointment 1, bill 2, executive order 1.
          </p>

          <div id="cabinet" className="scroll-mt-6">
            <CabinetPanel
              cabinet={game.governing.cabinet}
              pendingAppointment={cabinetAppointment}
              onChange={setCabinetAppointment}
              canAppoint={actionsUsed - (cabinetAppointment ? 1 : 0) + 1 <= 4}
            />
          </div>

          <div id="bills" className="scroll-mt-6">
            <LegislationPanel
              history={game.governing.legislationHistory}
              pending={proposedBill}
              onChange={setProposedBill}
              canPropose={actionsUsed - (proposedBill ? 2 : 0) + 2 <= 4}
              congress={game.governing.congress}
              stakeholders={game.stakeholders}
              date={game.date}
            />
          </div>

          <ExecutiveOrderPanel
            history={game.governing.executiveOrderHistory}
            pendingOrderId={executiveOrderId}
            onChange={setExecutiveOrderId}
            canIssue={actionsUsed - (executiveOrderId ? 1 : 0) + 1 <= 4}
            date={game.date}
          />

          <Button className="w-full" disabled={!allEventsAnswered} onClick={handleAdvance}>
            Advance to {MONTH_NAMES[nextMonth]} {nextYear} ▸
          </Button>

          <Rule />

          <div id="the-map" className="scroll-mt-6">
            <ApprovalMapPanel game={game} />
          </div>

          <div id="congress" className="scroll-mt-6">
            <CongressPanel congress={game.governing.congress} />
          </div>

          <PersonaApprovalPanel game={game} />
        </main>

        {/* Right rail — The Wire, becomes a bottom section below 1024px */}
        <aside className="w-full border-t border-rule bg-ink-900 p-5 lg:w-[320px] lg:shrink-0 lg:border-l lg:border-t-0">
          <HeadlinesPanel headlines={game.governing.headlines} />
        </aside>
      </div>
    </div>
  );
}
