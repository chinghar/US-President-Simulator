import type { DebateEvent } from '../../../engine/types';

interface DebatePanelProps {
  debate: DebateEvent;
  selectedAnswerId: string | null;
  onSelect: (answerId: string) => void;
}

export function DebatePanel({ debate, selectedAnswerId, onSelect }: DebatePanelProps) {
  return (
    <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Debate: {debate.name}</p>
      <p className="text-sm text-slate-200">{debate.question}</p>
      <div className="space-y-2">
        {debate.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            onClick={() => onSelect(answer.id)}
            className={[
              'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
              selectedAnswerId === answer.id
                ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                : 'border-navy-700 bg-navy-900 text-slate-300 hover:border-slate-500',
            ].join(' ')}
          >
            {answer.label}
          </button>
        ))}
      </div>
      {!selectedAnswerId && <p className="text-xs text-amber-400/80">Choose an answer before advancing to the next month.</p>}
    </div>
  );
}
