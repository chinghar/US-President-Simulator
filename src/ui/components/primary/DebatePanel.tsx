import type { DebateEvent } from '../../../engine/types';
import { Panel } from '../../kit';

interface DebatePanelProps {
  debate: DebateEvent;
  selectedAnswerId: string | null;
  onSelect: (answerId: string) => void;
}

export function DebatePanel({ debate, selectedAnswerId, onSelect }: DebatePanelProps) {
  return (
    <Panel title={`Debate: ${debate.name}`}>
      <p className="text-small text-paper/80">{debate.question}</p>
      <div className="space-y-2">
        {debate.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            onClick={() => onSelect(answer.id)}
            className={[
              'w-full border px-3 py-2 text-left text-small transition-colors duration-150',
              selectedAnswerId === answer.id ? 'border-seal bg-seal/10 text-paper' : 'border-rule text-paper/70 hover:border-paper/50',
            ].join(' ')}
          >
            {answer.label}
          </button>
        ))}
      </div>
      {!selectedAnswerId && <p className="text-[13px] text-paper/50">Choose an answer before advancing to the next month.</p>}
    </Panel>
  );
}
