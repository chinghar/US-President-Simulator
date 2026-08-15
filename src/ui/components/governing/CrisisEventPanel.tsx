import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import type { CrisisEvent } from '../../../engine/types';

interface CrisisEventPanelProps {
  event: CrisisEvent;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  recession: 'Recession',
  natural_disaster: 'Natural Disaster',
  foreign_conflict: 'Foreign Conflict',
  pandemic: 'Pandemic',
  scandal: 'Scandal',
  mass_shooting: 'Mass Shooting',
  court_vacancy: 'Court Vacancy',
  border_surge: 'Border Surge',
  strike: 'Labor Strike',
  cyberattack: 'Cyberattack',
  consequence: 'Consequence',
};

export function CrisisEventPanel({ event, selectedOptionId, onSelect }: CrisisEventPanelProps) {
  return (
    <div className="space-y-3 rounded-lg border border-red-500/40 bg-red-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
        Crisis: {CATEGORY_LABELS[event.category] ?? event.category} — {event.title}
      </p>
      <p className="text-sm text-slate-200">{event.description}</p>
      <div className="space-y-2">
        {event.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={[
              'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
              selectedOptionId === option.id
                ? 'border-red-400 bg-red-500/10 text-red-100'
                : 'border-navy-700 bg-navy-900 text-slate-300 hover:border-slate-500',
            ].join(' ')}
          >
            <div className="font-medium">{option.label}</div>
            {option.description && <div className="mt-0.5 text-xs text-slate-500">{option.description}</div>}
          </button>
        ))}
      </div>
      {selectedOptionId ? (
        <EffectsPreviewPanel decision={event.options.find((o) => o.id === selectedOptionId)!} />
      ) : (
        <p className="text-xs text-red-400/80">Choose a response before advancing to the next month.</p>
      )}
    </div>
  );
}
