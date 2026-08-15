import { useMemo, useState } from 'react';
import { BALANCE } from '../../data/balance';
import { STATES } from '../../data/states';
import { getScheduledGeneralEvents, PLAYER_GENERAL_ID, previewStateStandings, SWING_STATES } from '../../engine/general';
import type { GeneralActionType, Party } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { GeneralActionBuilder } from '../components/general/GeneralActionBuilder';
import { GeneralPollPanel } from '../components/general/GeneralPollPanel';
import { DebatePanel } from '../components/primary/DebatePanel';
import { UsMap } from '../components/UsMap';

const PARTY_COLOR: Record<Party, string> = {
  democrat: '#2563eb',
  republican: '#dc2626',
  independent: '#7c3aed',
};

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function GeneralCampaignScreen() {
  const game = useGameStore((s) => s.game);
  const advanceGeneral = useGameStore((s) => s.advanceGeneral);
  const resetGame = useGameStore((s) => s.resetGame);
  const [queuedActions, setQueuedActions] = useState<GeneralActionType[]>([]);
  const [eventAnswers, setEventAnswers] = useState<Record<string, string>>({});

  const general = game?.general;
  if (!game || !general) return null;

  const events = getScheduledGeneralEvents(game.date.month, game.date.year).filter(
    (e) => !general.debatesCompleted.includes(e.id),
  );
  const allEventsAnswered = events.every((e) => eventAnswers[e.id]);
  const opponents = general.candidates.filter((c) => !c.isPlayer);
  const latestPoll = general.polls[general.polls.length - 1];
  const isNovember = game.date.month === 11 && game.date.year === 2028;

  const projections = useMemo(() => previewStateStandings(general.candidates, general), [general]);
  const candidateById = new Map(general.candidates.map((c) => [c.id, c]));
  function colorForState(stateId: string): string {
    const projection = projections.find((p) => p.stateId === stateId);
    if (!projection) return '#334155';
    const leader = candidateById.get(projection.leaderId);
    if (!leader) return '#334155';
    return leader.isPlayer ? '#0ea5e9' : PARTY_COLOR[leader.party];
  }

  function handleAdvance() {
    advanceGeneral({ playerActions: queuedActions, eventAnswers });
    setQueuedActions([]);
    setEventAnswers({});
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-400">General Election</p>
          <h1 className="text-2xl font-semibold text-slate-100">
            {MONTH_NAMES[game.date.month]} {game.date.year}
          </h1>
        </div>
        <button type="button" onClick={resetGame} className="text-xs text-slate-500 hover:text-slate-300">
          Start Over
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">Swing States</p>
            <p className="text-sm text-slate-200">{SWING_STATES.map((id) => STATES[id].name).join(', ')}</p>
          </div>

          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Projected Map</h3>
            <p className="mb-2 text-[11px] text-slate-500">
              A rough "if the election were held today" snapshot — not a prediction of the actual result.
            </p>
            <UsMap colorForState={colorForState} />
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              {general.candidates.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.isPlayer ? '#0ea5e9' : PARTY_COLOR[c.party] }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {isNovember && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-200">
              Election Day is this month — results resolve after you advance.
            </div>
          )}

          {events.map((event) => (
            <DebatePanel
              key={event.id}
              debate={event}
              selectedAnswerId={eventAnswers[event.id] ?? null}
              onSelect={(answerId) => setEventAnswers((prev) => ({ ...prev, [event.id]: answerId }))}
            />
          ))}

          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
            <GeneralActionBuilder
              actions={queuedActions}
              onChange={setQueuedActions}
              budget={BALANCE.general.ACTION_BUDGET_PER_MONTH}
              opponents={opponents}
            />
          </div>

          <button
            type="button"
            onClick={handleAdvance}
            disabled={!allEventsAnswered}
            className={[
              'w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
              !allEventsAnswered ? 'cursor-not-allowed bg-navy-700 text-slate-500' : 'bg-sky-600 text-white hover:bg-sky-500',
            ].join(' ')}
          >
            {isNovember ? 'Advance to Election Night' : 'Advance to Next Month'}
          </button>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Your Campaign</h3>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">War Chest</dt>
                <dd className="tabular-nums text-slate-200">${(game.player.warChest / 1_000_000).toFixed(1)}M</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Name Recognition</dt>
                <dd className="tabular-nums text-slate-200">{game.player.nameRecognition.toFixed(0)}/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Running Mate</dt>
                <dd className="text-slate-200">{general.vp?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Momentum</dt>
                <dd className="tabular-nums text-slate-200">
                  {general.candidates.find((c) => c.id === PLAYER_GENERAL_ID)?.momentum.toFixed(0)}
                </dd>
              </div>
            </dl>
          </div>

          <GeneralPollPanel poll={latestPoll} candidates={general.candidates} />
        </aside>
      </div>
    </div>
  );
}
