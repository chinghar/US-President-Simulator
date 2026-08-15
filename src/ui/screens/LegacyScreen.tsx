import { computeHistorianRanking, getBrokenPromises, getDecisionTimeline, getSignatureAchievements } from '../../engine/legacy';
import { useGameStore } from '../state/gameStore';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIER_COLOR: Record<string, string> = {
  Historic: 'text-emerald-400',
  Great: 'text-emerald-400',
  'Above Average': 'text-sky-400',
  Average: 'text-slate-300',
  'Below Average': 'text-amber-400',
  'Failed Presidency': 'text-red-400',
};

export function LegacyScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  if (!game) return null;

  const ranking = computeHistorianRanking(game);
  const achievements = getSignatureAchievements(game);
  const brokenPromises = getBrokenPromises(game);
  const timeline = getDecisionTimeline(game);
  const reelection = game.governing?.reelection;

  const outcomeLabel =
    reelection?.outcome === 'reelected'
      ? 'Re-elected to a second term'
      : reelection?.outcome === 'lost_general'
        ? 'Defeated for re-election'
        : reelection?.outcome === 'primaried_out'
          ? "Lost the party's re-nomination"
          : 'Term concluded';

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-6">
        <p className="text-xs uppercase tracking-wide text-sky-400">Legacy</p>
        <h1 className="text-2xl font-semibold text-slate-100">{game.player.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{outcomeLabel}</p>

        <div className="mt-6 flex items-center gap-6 rounded-md border border-navy-700 bg-navy-950 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Historian Ranking</p>
            <p className={['text-2xl font-semibold', TIER_COLOR[ranking.tier]].join(' ')}>{ranking.tier}</p>
          </div>
          <div className="text-sm text-slate-400">
            <p>Score: <span className="tabular-nums text-slate-200">{ranking.score.toFixed(0)}/100</span></p>
            <p>Average approval: <span className="tabular-nums text-slate-200">{ranking.breakdown.averageApproval.toFixed(1)}%</span></p>
            <p>Final approval: <span className="tabular-nums text-slate-200">{ranking.breakdown.finalApproval.toFixed(1)}%</span></p>
            <p>Bills passed: <span className="tabular-nums text-slate-200">{ranking.breakdown.billsPassedCount}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Signature Achievements</h2>
            {achievements.length === 0 ? (
              <p className="text-sm text-slate-600">No legislation or orders survived the term.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {achievements.map((a, i) => (
                  <li key={i}>
                    {a.title} <span className="text-slate-600">({MONTH_NAMES[a.date.month]} {a.date.year})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Broken Promises</h2>
            {brokenPromises.length === 0 ? (
              <p className="text-sm text-slate-600">Everything proposed made it through.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {brokenPromises.map((a, i) => (
                  <li key={i}>
                    {a.title} <span className="text-slate-600">({MONTH_NAMES[a.date.month]} {a.date.year})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Decision Timeline</h2>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-navy-700 bg-navy-950 p-3">
            {timeline.map((entry, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-500">
                  {MONTH_NAMES[entry.date.month]} {entry.date.year}
                </span>
                <span className="text-slate-300">{entry.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="mt-6 rounded-md border border-navy-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-400 hover:text-slate-100"
        >
          Start a New Campaign
        </button>
      </div>
    </div>
  );
}
