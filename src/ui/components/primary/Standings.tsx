import type { PollResult, PrimaryCandidate } from '../../../engine/types';
import { Meter, Panel } from '../../kit';

function BarRow({ label, value, max, highlight, suffix }: { label: string; value: number; max: number; highlight: boolean; suffix: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-small">
        <span className={highlight ? 'font-medium text-paper' : 'text-paper/70'}>
          {highlight && <span className="mr-1 inline-block h-1.5 w-1.5 bg-seal align-middle" />}
          {label}
        </span>
        <span className="font-mono text-paper/60">{suffix}</span>
      </div>
      <Meter value={pct} color={highlight ? 'var(--seal)' : 'var(--rule)'} />
    </div>
  );
}

export function PollPanel({ poll, candidates }: { poll: PollResult | undefined; candidates: PrimaryCandidate[] }) {
  if (!poll) return null;
  const rows = candidates
    .map((c) => ({ candidate: c, share: poll.reportedShare[c.id] ?? 0 }))
    .sort((a, b) => b.share - a.share);

  return (
    <Panel title="National poll">
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
      <p className="text-[13px] text-paper/40">Polls are noisy samples of true support — expect a few points of drift from reality.</p>
    </Panel>
  );
}

export function DelegateTracker({ candidates, threshold }: { candidates: PrimaryCandidate[]; threshold: number }) {
  const rows = [...candidates].sort((a, b) => b.delegates - a.delegates);
  return (
    <Panel>
      <div className="flex items-baseline justify-between">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-rule">Delegate tracker</p>
        <span className="text-[13px] text-paper/40">{threshold} to clinch</span>
      </div>
      <div className="space-y-2.5">
        {rows.map((c) => (
          <BarRow key={c.id} label={c.name} value={c.delegates} max={threshold} highlight={c.isPlayer} suffix={`${c.delegates}`} />
        ))}
      </div>
    </Panel>
  );
}
