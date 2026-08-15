import { useState } from 'react';
import { STATES } from '../../../data/states';
import type { ContestResult, PrimaryCandidate } from '../../../engine/types';
import { Tag } from '../../kit';

function ContestCard({ result, candidates }: { result: ContestResult; candidates: PrimaryCandidate[] }) {
  const [open, setOpen] = useState(false);
  const winner = candidates.find((c) => c.id === result.winnerId);
  const totalsSorted = candidates
    .map((c) => ({ candidate: c, delegates: result.totalDelegatesAwarded[c.id] ?? 0 }))
    .filter((t) => t.delegates > 0)
    .sort((a, b) => b.delegates - a.delegates);

  return (
    <div className="border border-rule bg-ink-900 p-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="text-small font-medium text-paper">{result.contestName}</p>
          <p className="text-[13px] text-paper/50">
            Won by {winner?.name} · {result.stateResults.length} state{result.stateResults.length > 1 ? 's' : ''}
          </p>
        </div>
        <span className="text-[13px] text-paper/50">{open ? 'Hide' : 'Details'}</span>
      </button>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {totalsSorted.map(({ candidate, delegates }) => (
          <Tag key={candidate.id} tone={candidate.isPlayer ? 'seal' : 'neutral'}>
            {candidate.name}: {delegates}
          </Tag>
        ))}
      </div>

      {open && (
        <div className="mt-3 space-y-2 border-t border-rule pt-2">
          {result.stateResults.map((sr) => {
            const sorted = candidates
              .map((c) => ({ candidate: c, share: sr.voteShare[c.id] ?? 0 }))
              .sort((a, b) => b.share - a.share);
            return (
              <div key={sr.stateId} className="text-[13px]">
                <span className="text-paper/50">{STATES[sr.stateId].name}: </span>
                <span className="font-mono text-paper/70">
                  {sorted
                    .slice(0, 3)
                    .map((s) => `${s.candidate.name.split(' ')[0]} ${s.share.toFixed(0)}%`)
                    .join(' · ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContestHistory({ results, candidates }: { results: ContestResult[]; candidates: PrimaryCandidate[] }) {
  if (results.length === 0) {
    return <p className="text-small text-paper/40">No contests have happened yet.</p>;
  }
  return (
    <div className="space-y-2">
      {[...results].reverse().map((result) => (
        <ContestCard key={result.contestId} result={result} candidates={candidates} />
      ))}
    </div>
  );
}
