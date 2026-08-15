import { useMemo, useState } from 'react';
import { PRIMARY_CALENDAR } from '../../data/primary-calendar';
import { getScheduledDebate } from '../../engine/primary';
import type { PrimaryActionType, StateId } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { ActionBuilder } from '../components/primary/ActionBuilder';
import { ContestHistory } from '../components/primary/ContestHistory';
import { DebatePanel } from '../components/primary/DebatePanel';
import { DelegateTracker, PollPanel } from '../components/primary/Standings';
import { Button, Eyebrow, Panel, Rule } from '../kit';

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
          <Eyebrow>Primary campaign · {primary.party === 'democrat' ? 'Democratic' : 'Republican'} primary</Eyebrow>
          <h1 className="mt-1 font-display text-h1 text-paper">
            {MONTH_NAMES[game.date.month]} {game.date.year}
          </h1>
        </div>
        <Button variant="ghost" onClick={resetGame}>
          Start over
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {statesInPlay.length > 0 ? (
            <div className="border-l-2 border-seal bg-ink-700 p-4">
              <Eyebrow className="text-seal">Voting this month</Eyebrow>
              <p className="mt-1 text-small text-paper/80">
                {statesInPlay.length} state{statesInPlay.length > 1 ? 's' : ''} in play — spend your actions where they count.
              </p>
            </div>
          ) : nextBatch.length > 0 ? (
            <Panel title="Next up">
              <p className="text-small text-paper/80">
                {nextBatch.map((c) => c.name).join(', ')} — {MONTH_NAMES[nextBatch[0].month]} {nextBatch[0].year} (
                {nextBatch.reduce((sum, c) => sum + c.states.length, 0)} state
                {nextBatch.reduce((sum, c) => sum + c.states.length, 0) > 1 ? 's' : ''})
              </p>
            </Panel>
          ) : null}

          {debate && debatePending && (
            <DebatePanel
              debate={debate}
              selectedAnswerId={debateAnswerId}
              onSelect={setDebateAnswerId}
              hypothetical={game.isRealCandidateMode}
            />
          )}

          <Panel>
            <ActionBuilder
              actions={queuedActions}
              onChange={setQueuedActions}
              budget={3}
              statesInPlay={statesInPlay}
              rivals={rivals}
            />
          </Panel>

          <Button className="w-full" disabled={debatePending && !debateAnswerId} onClick={handleAdvance}>
            Advance to next month
          </Button>

          <section className="space-y-3">
            <Eyebrow>Contest results</Eyebrow>
            <ContestHistory results={primary.contestsCompleted} candidates={primary.candidates} />
          </section>
        </div>

        <aside className="space-y-6">
          <Panel title="Your campaign">
            <dl className="space-y-1.5 text-small">
              <div className="flex justify-between">
                <dt className="text-paper/50">War chest</dt>
                <dd className="font-mono text-paper">${(game.player.warChest / 1_000_000).toFixed(1)}M</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-paper/50">Name recognition</dt>
                <dd className="font-mono text-paper">{game.player.nameRecognition.toFixed(0)}/100</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-paper/50">Party favor</dt>
                <dd className="font-mono text-paper">{game.player.partyEstablishmentFavor.toFixed(0)}</dd>
              </div>
              <Rule />
              <div className="flex justify-between">
                <dt className="text-paper/50">Authenticity</dt>
                <dd className="font-mono text-paper">
                  {primary.candidates.find((c) => c.isPlayer)?.authenticity.toFixed(0)}/100
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-paper/50">Momentum</dt>
                <dd className="font-mono text-paper">
                  {primary.candidates.find((c) => c.isPlayer)?.momentum.toFixed(0)}
                </dd>
              </div>
            </dl>
          </Panel>

          <PollPanel poll={latestPoll} candidates={primary.candidates} />
          <DelegateTracker candidates={primary.candidates} threshold={primary.nominationThreshold} />
        </aside>
      </div>
    </div>
  );
}
