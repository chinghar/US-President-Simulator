import { useState } from 'react';
import { STATES } from '../../../data/states';
import type { ContestResult, PrimaryCandidate } from '../../../engine/types';

function ContestCard({ result, candidates }: { result: ContestResult; candidates: PrimaryCandidate[] }) {
  const [open, setOpen] = useState(false);
  const winner = candidates.find((c) => c.id === result.winnerId);
  const totalsSorted = candidates
    .map((c) => ({ candidate: c, delegates: result.totalDelegatesAwarded[c.id] ?? 0 }))
    .filter((t) => t.delegates > 0)
    .sort((a, b) => b.delegates - a.delegates);

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900/60 p-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="text-sm font-semibold text-slate-100">{result.contestName}</p>
          <p className="text-xs text-slate-500">
            Won by {winner?.name} · {result.stateResults.length} state{result.stateResults.length > 1 ? 's' : ''}
          </p>
        </div>
        <span className="text-xs text-slate-500">{open ? 'Hide' : 'Details'}</span>
      </button>

      <div className="mt-2 flex flex-wrap gap-2">
        {totalsSorted.map(({ candidate, delegates }) => (
          <span
            key={candidate.id}
            className={[
              'rounded-full px-2 py-0.5 text-[11px]',
              candidate.isPlayer ? 'bg-sky-500/15 text-sky-200' : 'bg-navy-800 text-slate-400',
            ].join(' ')}
          >
            {candidate.name}: {delegates}
          </span>
        ))}
      </div>

      {open && (
        <div className="mt-3 space-y-2 border-t border-navy-700 pt-2">
          {result.stateResults.map((sr) => {
            const sorted = candidates
              .map((c) => ({ candidate: c, share: sr.voteShare[c.id] ?? 0 }))
              .sort((a, b) => b.share - a.share);
            return (
              <div key={sr.stateId} className="text-xs">
                <span className="text-slate-400">{STATES[sr.stateId].name}: </span>
                <span className="text-slate-300">
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
    return <p className="text-sm text-slate-500">No contests have happened yet.</p>;
  }
  return (
    <div className="space-y-2">
      {[...results].reverse().map((result) => (
        <ContestCard key={result.contestId} result={result} candidates={candidates} />
      ))}
    </div>
  );
}
