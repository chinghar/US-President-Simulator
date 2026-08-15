import { useMemo } from 'react';
import { STATES } from '../../data/states';
import type { GeneralCandidate, Party } from '../../engine/types';
import { PLAYER_GENERAL_ID } from '../../engine/general';
import { useGameStore } from '../state/gameStore';
import { UsMap } from '../components/UsMap';

const PARTY_COLOR: Record<Party, string> = {
  democrat: '#2563eb',
  republican: '#dc2626',
  independent: '#7c3aed',
};

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

  const winnerByState = useMemo(() => {
    const map = new Map<string, string>();
    if (result) for (const sr of result.stateResults) map.set(sr.stateId, sr.winnerId);
    return map;
  }, [result]);

  if (!game || !general || !result) return null;

  const player = general.candidates.find((c) => c.isPlayer)!;
  const playerWon = general.playerWon === true;
  const sortedFinal = [...general.candidates].sort(
    (a, b) => (result.finalElectoralVotes[b.id] ?? 0) - (result.finalElectoralVotes[a.id] ?? 0),
  );
  const candidateById = new Map<string, GeneralCandidate>(general.candidates.map((c) => [c.id, c]));

  function colorForState(stateId: string): string {
    const winnerId = winnerByState.get(stateId);
    if (!winnerId) return '#334155';
    const candidate = candidateById.get(winnerId);
    if (!candidate) return '#334155';
    return candidate.isPlayer ? '#0ea5e9' : PARTY_COLOR[candidate.party];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className={['rounded-lg border p-6', playerWon ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'].join(' ')}>
        <p className={['mb-1 text-xs uppercase tracking-wide', playerWon ? 'text-emerald-400' : 'text-red-400'].join(' ')}>
          Election Night
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          {playerWon ? `${player.name} Wins the Presidency` : `${player.name} Falls Short`}
        </h1>
        <p className="mt-2 text-sm text-slate-300">270 electoral votes needed to win.</p>

        <div className="mt-5 space-y-2">
          {sortedFinal.map((c) => {
            const ev = result.finalElectoralVotes[c.id] ?? 0;
            const pct = (ev / 538) * 100;
            return (
              <div key={c.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className={c.isPlayer ? 'font-semibold text-sky-300' : 'text-slate-300'}>{c.name}</span>
                  <span className="tabular-nums text-slate-200">{ev} EV</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800">
                  <div
                    className={['h-full rounded-full', c.isPlayer ? 'bg-sky-500' : 'bg-slate-500'].join(' ')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-md border border-navy-700 bg-navy-950 p-3">
            <UsMap colorForState={colorForState} />
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              {sortedFinal.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: c.isPlayer ? '#0ea5e9' : PARTY_COLOR[c.party] }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="max-h-96 space-y-1 overflow-y-auto rounded-md border border-navy-700 bg-navy-950 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              State-by-State (poll-closing order)
            </p>
            {rows.map((row) => {
              const winnerName = general.candidates.find((c) => c.id === row.winnerId)?.name ?? row.winnerId;
              return (
                <div key={row.stateId} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{STATES[row.stateId].name}</span>
                  <span className="text-slate-300">
                    {winnerName} +{row.electoralVotes}EV
                  </span>
                  <span className="tabular-nums text-slate-500">
                    Running: {row.running[PLAYER_GENERAL_ID] ?? 0}
                    {general.candidates.length > 2 ? ` (you)` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {playerWon ? (
            <button
              type="button"
              onClick={acknowledgeElectionNight}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Continue to Your Inauguration
            </button>
          ) : game.governing ? (
            <button
              type="button"
              onClick={acknowledgeElectionNight}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              View Your Legacy
            </button>
          ) : (
            <button
              type="button"
              onClick={resetGame}
              className="rounded-md border border-navy-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-400 hover:text-slate-100"
            >
              Start a New Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
