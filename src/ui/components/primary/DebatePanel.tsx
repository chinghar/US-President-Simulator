import type { DebateEvent } from '../../../engine/types';
import { Panel } from '../../kit';

interface DebatePanelProps {
  debate: DebateEvent;
  selectedAnswerId: string | null;
  onSelect: (answerId: string) => void;
  /** True in real-candidate mode: renders options as labeled hypothetical
   * strategy choices ("Debate response: ...") rather than as an attributed
   * quotation, and drops the "moderator asks" dialogue framing. */
  hypothetical?: boolean;
}

export function DebatePanel({ debate, selectedAnswerId, onSelect, hypothetical }: DebatePanelProps) {
  return (
    <Panel title={hypothetical ? `Simulated debate: ${debate.name}` : `Debate: ${debate.name}`}>
      <p className="text-small text-paper/80">
        {hypothetical ? `Topic: ${debate.question}` : debate.question}
      </p>
      {hypothetical && (
        <p className="text-[13px] text-paper/50">
          Choose how your campaign responds in this simulated debate — a gameplay choice, not a quotation.
        </p>
      )}
      <div className="space-y-2">
        {debate.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            onClick={() => onSelect(answer.id)}
            className={[
              'w-full border px-3 py-2 text-left text-small transition-colors duration-150',
              selectedAnswerId === answer.id ? 'border-seal bg-seal text-parchment' : 'border-rule text-paper/70 hover:border-paper/50',
            ].join(' ')}
          >
            {hypothetical ? `Debate response: ${answer.label}` : answer.label}
          </button>
        ))}
      </div>
      {!selectedAnswerId && <p className="text-[13px] text-paper/50">Choose an answer before advancing to the next month.</p>}
    </Panel>
  );
}
