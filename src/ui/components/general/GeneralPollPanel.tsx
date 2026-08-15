import type { GeneralCandidate, PollResult } from '../../../engine/types';
import { Meter, Panel } from '../../kit';

export function GeneralPollPanel({ poll, candidates }: { poll: PollResult | undefined; candidates: GeneralCandidate[] }) {
  if (!poll) return null;
  const rows = candidates
    .map((c) => ({ candidate: c, share: poll.reportedShare[c.id] ?? 0 }))
    .sort((a, b) => b.share - a.share);

  return (
    <Panel title="National poll">
      <div className="space-y-2.5">
        {rows.map(({ candidate, share }) => {
          const color = candidate.party === 'democrat' ? 'var(--union)' : candidate.party === 'republican' ? 'var(--flag)' : 'var(--rule)';
          return (
            <div key={candidate.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-small">
                <span className={candidate.isPlayer ? 'font-medium text-paper' : 'text-paper/70'}>
                  {candidate.isPlayer && <span className="mr-1 inline-block h-1.5 w-1.5 bg-seal align-middle" />}
                  {candidate.name} <span className="text-[10px] uppercase text-paper/40">({candidate.party})</span>
                </span>
                <span className="font-mono text-paper/60">{share.toFixed(1)}%</span>
              </div>
              <Meter value={share} color={color} />
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-paper/40">Polls are noisy samples of true support — expect a few points of drift from reality.</p>
    </Panel>
  );
}
