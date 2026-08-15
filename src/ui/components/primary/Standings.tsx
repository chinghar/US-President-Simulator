import type { PollResult, PrimaryCandidate } from '../../../engine/types';

function BarRow({ label, value, max, highlight, suffix }: { label: string; value: number; max: number; highlight: boolean; suffix: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className={highlight ? 'font-semibold text-sky-300' : 'text-slate-300'}>{label}</span>
        <span className="tabular-nums text-slate-400">{suffix}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
        <div className={['h-full rounded-full', highlight ? 'bg-sky-500' : 'bg-slate-500'].join(' ')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PollPanel({ poll, candidates }: { poll: PollResult | undefined; candidates: PrimaryCandidate[] }) {
  if (!poll) return null;
  const rows = candidates
    .map((c) => ({ candidate: c, share: poll.reportedShare[c.id] ?? 0 }))
    .sort((a, b) => b.share - a.share);

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">National Poll</h3>
      <div className="space-y-2.5">
        {rows.map(({ candidate, share }) => (
          <BarRow
            key={candidate.id}
            label={candidate.name}
            value={share}
            max={100}
            highlight={candidate.isPlayer}
            suffix={`${share.toFixed(1)}%`}
          />
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Polls are noisy samples of true support — expect a few points of drift from reality.</p>
    </div>
  );
}

export function DelegateTracker({ candidates, threshold }: { candidates: PrimaryCandidate[]; threshold: number }) {
  const rows = [...candidates].sort((a, b) => b.delegates - a.delegates);
  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Delegate Tracker</h3>
        <span className="text-[11px] text-slate-500">{threshold} to clinch</span>
      </div>
      <div className="space-y-2.5">
        {rows.map((c) => (
          <BarRow key={c.id} label={c.name} value={c.delegates} max={threshold} highlight={c.isPlayer} suffix={`${c.delegates}`} />
        ))}
      </div>
    </div>
  );
}
