import { useMemo, useState } from 'react';
import { PRIMARY_CALENDAR } from '../../data/primary-calendar';
import { getScheduledDebate } from '../../engine/primary';
import type { PrimaryActionType, StateId } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { ActionBuilder } from '../components/primary/ActionBuilder';
import { ContestHistory } from '../components/primary/ContestHistory';
import { DebatePanel } from '../components/primary/DebatePanel';
import { DelegateTracker, PollPanel } from '../components/primary/Standings';

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function PrimaryCampaignScreen() {
  const game = useGameStore((s) => s.game);
  const advancePrimary = useGameStore((s) => s.advancePrimary);
  const resetGame = useGameStore((s) => s.resetGame);
  const [queuedActions, setQueuedActions] = useState<PrimaryActionType[]>([]);
  const [debateAnswerId, setDebateAnswerId] = useState<string | null>(null);

  const primary = game?.primary;

  const statesInPlay = useMemo<StateId[]>(() => {
    if (!primary) return [];
    const { month, year } = game!.date;
    const states: StateId[] = [];
    for (let i = primary.nextContestIndex; i < PRIMARY_CALENDAR.length; i++) {
      const contest = PRIMARY_CALENDAR[i];
      if (contest.month === month && contest.year === year) states.push(...contest.states);
      else break;
    }
    return states;
  }, [primary, game]);

  const nextBatch = useMemo(() => {
    if (!primary) return [];
    const first = PRIMARY_CALENDAR[primary.nextContestIndex];
    if (!first) return [];
    const batch = [];
    for (let i = primary.nextContestIndex; i < PRIMARY_CALENDAR.length; i++) {
      const contest = PRIMARY_CALENDAR[i];
      if (contest.month === first.month && contest.year === first.year) batch.push(contest);
      else break;
    }
    return batch;
  }, [primary]);
  const debate = game ? getScheduledDebate(game.date.month, game.date.year) : undefined;
  const debatePending = !!debate && !primary?.debatesCompleted.includes(debate.id);

  if (!game || !primary) return null;

  const rivals = primary.candidates.filter((c) => !c.isPlayer);
  const latestPoll = primary.polls[primary.polls.length - 1];

  function handleAdvance() {
    advancePrimary({ playerActions: queuedActions, debateAnswerId: debateAnswerId ?? undefined });
    setQueuedActions([]);
    setDebateAnswerId(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-400">Primary Campaign · {primary.party === 'democrat' ? 'Democratic' : 'Republican'} Primary</p>
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
          {statesInPlay.length > 0 ? (
            <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">Voting This Month</p>
              <p className="text-sm text-slate-200">
                {statesInPlay.length} state{statesInPlay.length > 1 ? 's' : ''} in play — spend your actions where they count.
              </p>
            </div>
          ) : nextBatch.length > 0 ? (
            <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next Up</p>
              <p className="text-sm text-slate-200">
                {nextBatch.map((c) => c.name).join(', ')} — {MONTH_NAMES[nextBatch[0].month]} {nextBatch[0].year} (
                {nextBatch.reduce((sum, c) => sum + c.states.length, 0)} state
                {nextBatch.reduce((sum, c) => sum + c.states.length, 0) > 1 ? 's' : ''})
              </p>
            </div>
          ) : null}

          {debate && debatePending && (
            <DebatePanel debate={debate} selectedAnswerId={debateAnswerId} onSelect={setDebateAnswerId} />
          )}

          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
            <ActionBuilder
              actions={queuedActions}
              onChange={setQueuedActions}
              budget={3}
              statesInPlay={statesInPlay}
              rivals={rivals}
            />
          </div>

          <button
            type="button"
            onClick={handleAdvance}
            disabled={debatePending && !debateAnswerId}
            className={[
              'w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
              debatePending && !debateAnswerId
                ? 'cursor-not-allowed bg-navy-700 text-slate-500'
                : 'bg-sky-600 text-white hover:bg-sky-500',
            ].join(' ')}
          >
            Advance to Next Month
          </button>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Contest Results</h2>
            <ContestHistory results={primary.contestsCompleted} candidates={primary.candidates} />
          </section>
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
                <dt className="text-slate-500">Party Favor</dt>
                <dd className="tabular-nums text-slate-200">{game.player.partyEstablishmentFavor.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Authenticity</dt>
                <dd className="tabular-nums text-slate-200">
                  {primary.candidates.find((c) => c.isPlayer)?.authenticity.toFixed(0)}/100
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Momentum</dt>
                <dd className="tabular-nums text-slate-200">
                  {primary.candidates.find((c) => c.isPlayer)?.momentum.toFixed(0)}
                </dd>
              </div>
            </dl>
          </div>

          <PollPanel poll={latestPoll} candidates={primary.candidates} />
          <DelegateTracker candidates={primary.candidates} threshold={primary.nominationThreshold} />
        </aside>
      </div>
    </div>
  );
}
