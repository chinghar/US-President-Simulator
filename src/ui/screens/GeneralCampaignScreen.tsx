import { useMemo, useState } from 'react';
import { BALANCE } from '../../data/balance';
import { STATES } from '../../data/states';
import { getScheduledGeneralEvents, PLAYER_GENERAL_ID, previewStateStandings, SWING_STATES } from '../../engine/general';
import type { GeneralActionType } from '../../engine/types';
import { useGameStore } from '../state/gameStore';
import { GeneralActionBuilder } from '../components/general/GeneralActionBuilder';
import { GeneralPollPanel } from '../components/general/GeneralPollPanel';
import { DebatePanel } from '../components/primary/DebatePanel';
import { UsMap } from '../components/UsMap';
import { Button, Eyebrow, Panel, Rule, Tag } from '../kit';

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
  const marginByState = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projections) {
      const leader = candidateById.get(p.leaderId);
      const sign = leader?.party === 'democrat' ? -1 : leader?.party === 'republican' ? 1 : 0;
      map.set(p.stateId, sign * Math.min(50, p.margin - 100 / general.candidates.length));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projections]);

  function handleAdvance() {
    advanceGeneral({ playerActions: queuedActions, eventAnswers });
    setQueuedActions([]);
    setEventAnswers({});
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Eyebrow>General election</Eyebrow>
          <h1 className="font-display text-h1 text-paper">
            {MONTH_NAMES[game.date.month]} {game.date.year}
          </h1>
        </div>
        <Button variant="ghost" onClick={resetGame}>
          Start over
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Panel title="Swing states">
            <p className="text-small text-paper/80">{SWING_STATES.map((id) => STATES[id].name).join(', ')}</p>
          </Panel>

          <Panel title="Projected map">
            <p className="text-[13px] text-paper/50">
              A rough "if the election were held today" snapshot — not a prediction of the actual result.
            </p>
            <UsMap marginForState={(id) => marginByState.get(id) ?? 0} />
            <div className="flex flex-wrap gap-2">
              {general.candidates.map((c) => (
                <Tag key={c.id} tone={c.isPlayer ? 'seal' : c.party === 'democrat' ? 'union' : c.party === 'republican' ? 'flag' : 'neutral'}>
                  {c.name}
                </Tag>
              ))}
            </div>
          </Panel>

          {isNovember && (
            <div className="border-l-2 border-brass bg-ink-700 p-4 text-small text-paper/80">
              Election Day is this month. Results resolve after you advance.
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

          <Panel>
            <GeneralActionBuilder
              actions={queuedActions}
              onChange={setQueuedActions}
              budget={BALANCE.general.ACTION_BUDGET_PER_MONTH}
              opponents={opponents}
            />
          </Panel>

          <Button className="w-full" disabled={!allEventsAnswered} onClick={handleAdvance}>
            {isNovember ? 'Advance to election night' : 'Advance to next month'}
          </Button>
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
                <dt className="text-paper/50">Running mate</dt>
                <dd className="text-paper">{general.vp?.name ?? '—'}</dd>
              </div>
              <Rule />
              <div className="flex justify-between">
                <dt className="text-paper/50">Momentum</dt>
                <dd className="font-mono text-paper">
                  {general.candidates.find((c) => c.id === PLAYER_GENERAL_ID)?.momentum.toFixed(0)}
                </dd>
              </div>
            </dl>
          </Panel>

          <GeneralPollPanel poll={latestPoll} candidates={general.candidates} />
        </aside>
      </div>
    </div>
  );
}
