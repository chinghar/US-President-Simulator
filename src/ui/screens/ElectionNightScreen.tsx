import { useMemo } from 'react';
import { STATES } from '../../data/states';
import type { GeneralCandidate } from '../../engine/types';
import { PLAYER_GENERAL_ID } from '../../engine/general';
import { useGameStore } from '../state/gameStore';
import { AnimatedNumber, Button, Eyebrow, Meter, Rule, Tag } from '../kit';
import { UsMap } from '../components/UsMap';

export function ElectionNightScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const acknowledgeElectionNight = useGameStore((s) => s.acknowledgeElectionNight);

  const general = game?.general;
  const result = general?.electionResult;

  const rows = useMemo(() => {
    if (!result) return [];
    const running: Record<string, number> = {};
    for (const c of general!.candidates) running[c.id] = 0;
    return result.stateResults.map((sr) => {
      running[sr.winnerId] = (running[sr.winnerId] ?? 0) + sr.electoralVotes;
      return { ...sr, running: { ...running } };
    });
  }, [result, general]);

  const marginByState = useMemo(() => {
    const map = new Map<string, number>();
    if (!result || !general) return map;
    const candidateById = new Map<string, GeneralCandidate>(general.candidates.map((c) => [c.id, c]));
    for (const sr of result.stateResults) {
      const sorted = Object.entries(sr.voteShare).sort((a, b) => b[1] - a[1]);
      const [winnerId, winnerShare] = sorted[0];
      const runnerUpShare = sorted[1]?.[1] ?? 0;
      const spread = Math.min(50, winnerShare - runnerUpShare);
      const winner = candidateById.get(winnerId);
      const sign = winner?.party === 'democrat' ? -1 : winner?.party === 'republican' ? 1 : 0;
      map.set(sr.stateId, sign * spread);
    }
    return map;
  }, [result, general]);

  if (!game || !general || !result) return null;

  const player = general.candidates.find((c) => c.isPlayer)!;
  const playerWon = general.playerWon === true;
  const sortedFinal = [...general.candidates].sort(
    (a, b) => (result.finalElectoralVotes[b.id] ?? 0) - (result.finalElectoralVotes[a.id] ?? 0),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-l-2 border-seal bg-ink-700 p-6">
        <Eyebrow>Election night</Eyebrow>
        <h1 className="mt-1 font-display text-h1 text-paper">
          {playerWon ? `${player.name} wins the presidency` : `${player.name} falls short`}
        </h1>
        <p className="mt-2 text-small text-paper/70">270 electoral votes needed to win.</p>

        <div className="mt-6 space-y-3">
          {sortedFinal.map((c) => {
            const ev = result.finalElectoralVotes[c.id] ?? 0;
            const color = c.isPlayer ? 'var(--seal)' : c.party === 'democrat' ? 'var(--union)' : c.party === 'republican' ? 'var(--flag)' : 'var(--rule)';
            return (
              <div key={c.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-small">
                  <span className={c.isPlayer ? 'font-medium text-paper' : 'text-paper/70'}>{c.name}</span>
                  <AnimatedNumber value={ev} suffix=" EV" className="text-paper" />
                </div>
                <Meter value={(ev / 538) * 100} color={color} />
              </div>
            );
          })}
        </div>

        <Rule className="my-6" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          <div>
            <UsMap marginForState={(id) => marginByState.get(id) ?? 0} />
            <div className="mt-3 flex flex-wrap gap-3 text-small">
              {sortedFinal.map((c) => (
                <Tag key={c.id} tone={c.isPlayer ? 'seal' : c.party === 'democrat' ? 'union' : c.party === 'republican' ? 'flag' : 'neutral'}>
                  {c.name}
                </Tag>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-rule">
            <p className="border-b border-rule p-2 text-eyebrow uppercase tracking-[0.12em] text-rule">
              State by state, poll-closing order
            </p>
            <div className="divide-y divide-rule">
              {rows.map((row) => {
                const winnerName = general.candidates.find((c) => c.id === row.winnerId)?.name ?? row.winnerId;
                return (
                  <div key={row.stateId} className="flex items-center justify-between p-2 text-small">
                    <span className="text-paper/70">{STATES[row.stateId].name}</span>
                    <span className="text-paper">
                      {winnerName} +{row.electoralVotes}
                    </span>
                    <span className="font-mono text-paper/50">
                      {row.running[PLAYER_GENERAL_ID] ?? 0}
                      {general.candidates.length > 2 ? ' you' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {playerWon ? (
            <Button onClick={acknowledgeElectionNight}>Continue to your inauguration</Button>
          ) : game.governing ? (
            <Button onClick={acknowledgeElectionNight}>View your legacy</Button>
          ) : (
            <Button variant="secondary" onClick={resetGame}>
              Start a new campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
