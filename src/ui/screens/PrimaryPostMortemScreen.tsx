import { ContestHistory } from '../components/primary/ContestHistory';
import { DelegateTracker } from '../components/primary/Standings';
import { useGameStore } from '../state/gameStore';

export function PrimaryPostMortemScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const acknowledgeElectionNight = useGameStore((s) => s.acknowledgeElectionNight);
  const primary = game?.primary;
  if (!game || !primary) return null;

  const player = primary.candidates.find((c) => c.isPlayer)!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <p className="mb-1 text-xs uppercase tracking-wide text-red-400">Campaign Over</p>
        <h1 className="text-2xl font-semibold text-slate-100">{game.player.name} Falls Short</h1>
        <p className="mt-2 text-sm text-slate-300">{primary.playerEliminatedReason}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Final Delegates</dt>
            <dd className="tabular-nums text-slate-100">{player.delegates}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Needed to Win</dt>
            <dd className="tabular-nums text-slate-100">{primary.nominationThreshold}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Contests Held</dt>
            <dd className="tabular-nums text-slate-100">{primary.contestsCompleted.length}</dd>
          </div>
        </dl>

        <div className="mt-6 space-y-3">
          <DelegateTracker candidates={primary.candidates} threshold={primary.nominationThreshold} />
        </div>

        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Contest History</h2>
          <ContestHistory results={primary.contestsCompleted} candidates={primary.candidates} />
        </div>

        {game.governing ? (
          <button
            type="button"
            onClick={acknowledgeElectionNight}
            className="mt-8 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            View Your Legacy
          </button>
        ) : (
          <button
            type="button"
            onClick={resetGame}
            className="mt-8 rounded-md border border-navy-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-400 hover:text-slate-100"
          >
            Start a New Campaign
          </button>
        )}
      </div>
    </div>
  );
}
