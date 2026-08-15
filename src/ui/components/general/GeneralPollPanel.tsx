import type { GeneralCandidate, PollResult } from '../../../engine/types';

export function GeneralPollPanel({ poll, candidates }: { poll: PollResult | undefined; candidates: GeneralCandidate[] }) {
  if (!poll) return null;
  const rows = candidates
    .map((c) => ({ candidate: c, share: poll.reportedShare[c.id] ?? 0 }))
    .sort((a, b) => b.share - a.share);

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">National Poll</h3>
      <div className="space-y-2.5">
        {rows.map(({ candidate, share }) => {
          const pct = Math.min(100, share);
          return (
            <div key={candidate.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className={candidate.isPlayer ? 'font-semibold text-sky-300' : 'text-slate-300'}>
                  {candidate.name} <span className="text-[10px] uppercase text-slate-500">({candidate.party})</span>
                </span>
                <span className="tabular-nums text-slate-400">{share.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
                <div
                  className={['h-full rounded-full', candidate.isPlayer ? 'bg-sky-500' : 'bg-slate-500'].join(' ')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">Polls are noisy samples of true support — expect a few points of drift from reality.</p>
    </div>
  );
}
