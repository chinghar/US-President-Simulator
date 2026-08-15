import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import { Eyebrow } from '../../kit';
import type { CrisisEvent } from '../../../engine/types';

interface CrisisEventPanelProps {
  event: CrisisEvent;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  recession: 'Recession',
  natural_disaster: 'Natural disaster',
  foreign_conflict: 'Foreign conflict',
  pandemic: 'Pandemic',
  scandal: 'Scandal',
  mass_shooting: 'Mass shooting',
  court_vacancy: 'Court vacancy',
  border_surge: 'Border surge',
  strike: 'Labor strike',
  cyberattack: 'Cyberattack',
  consequence: 'Consequence',
};

export function CrisisEventPanel({ event, selectedOptionId, onSelect }: CrisisEventPanelProps) {
  return (
    <div className="space-y-3 border-l-2 border-flag bg-ink-700 p-4">
      <Eyebrow className="text-flag">
        {CATEGORY_LABELS[event.category] ?? event.category} — {event.title}
      </Eyebrow>
      <p className="text-small text-paper/80">{event.description}</p>
      <div className="space-y-2">
        {event.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={[
              'w-full border px-3 py-2 text-left text-small transition-colors duration-150',
              selectedOptionId === option.id ? 'border-flag bg-flag/10 text-paper' : 'border-rule text-paper/70 hover:border-paper/50',
            ].join(' ')}
          >
            <div className="font-medium">{option.label}</div>
            {option.description && <div className="mt-0.5 text-[13px] text-paper/50">{option.description}</div>}
          </button>
        ))}
      </div>
      {selectedOptionId ? (
        <EffectsPreviewPanel decision={event.options.find((o) => o.id === selectedOptionId)!} />
      ) : (
        <p className="text-[13px] text-flag/80">Choose a response before advancing to the next month.</p>
      )}
    </div>
  );
}
