import { computeHistorianRanking, getBrokenPromises, getDecisionTimeline, getSignatureAchievements } from '../../engine/legacy';
import { useGameStore } from '../state/gameStore';
import { Button, Eyebrow, PresidentialSeal, Rule } from '../kit';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIER_COLOR: Record<string, string> = {
  Historic: 'text-brass',
  Great: 'text-seal',
  'Above Average': 'text-seal',
  Average: 'text-paper',
  'Below Average': 'text-flag/80',
  'Failed Presidency': 'text-flag',
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
      <div className="border border-rule bg-ink-700 p-6">
        <div className="flex items-center gap-3">
          <PresidentialSeal size={40} />
          <div>
            <Eyebrow>Legacy</Eyebrow>
            <h1 className="font-display text-h1 text-paper">{game.player.name}</h1>
          </div>
        </div>
        <p className="mt-1 text-small text-paper/60">{outcomeLabel}</p>

        <div className="mt-6 flex items-center gap-6 border border-rule bg-ink-900 p-4">
          <div>
            <Eyebrow>Historian ranking</Eyebrow>
            <p className={`font-display text-h2 ${TIER_COLOR[ranking.tier]}`}>{ranking.tier}</p>
          </div>
          <div className="text-small text-paper/60">
            <p>Score: <span className="font-mono text-paper">{ranking.score.toFixed(0)}/100</span></p>
            <p>Average approval: <span className="font-mono text-paper">{ranking.breakdown.averageApproval.toFixed(1)}%</span></p>
            <p>Final approval: <span className="font-mono text-paper">{ranking.breakdown.finalApproval.toFixed(1)}%</span></p>
            <p>Bills passed: <span className="font-mono text-paper">{ranking.breakdown.billsPassedCount}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Eyebrow className="mb-2">Signature achievements</Eyebrow>
            {achievements.length === 0 ? (
              <p className="text-small text-paper/30">No legislation or orders survived the term.</p>
            ) : (
              <ul className="space-y-1 text-small text-paper/80">
                {achievements.map((a, i) => (
                  <li key={i}>
                    {a.title} <span className="text-paper/40">({MONTH_NAMES[a.date.month]} {a.date.year})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Eyebrow className="mb-2">Broken promises</Eyebrow>
            {brokenPromises.length === 0 ? (
              <p className="text-small text-paper/30">Everything proposed made it through.</p>
            ) : (
              <ul className="space-y-1 text-small text-paper/80">
                {brokenPromises.map((a, i) => (
                  <li key={i}>
                    {a.title} <span className="text-paper/40">({MONTH_NAMES[a.date.month]} {a.date.year})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Eyebrow className="mb-2">Decision timeline</Eyebrow>
          <div className="max-h-64 space-y-1 overflow-y-auto border border-rule bg-ink-900 p-3">
            {timeline.map((entry, i) => (
              <div key={i} className="flex justify-between text-[13px]">
                <span className="font-mono text-paper/40">
                  {MONTH_NAMES[entry.date.month]} {entry.date.year}
                </span>
                <span className="text-paper/70">{entry.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Rule className="my-6" />

        <Button variant="secondary" onClick={resetGame}>
          Start a new campaign
        </Button>
      </div>
    </div>
  );
}
