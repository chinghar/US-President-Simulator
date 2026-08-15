import { TRAIT_LIST } from '../../data/traits';
import type { TraitId } from '../../engine/types';

interface TraitPickerProps {
  selected: TraitId[];
  onToggle: (traitId: TraitId) => void;
  max?: number;
}

export function TraitPicker({ selected, onToggle, max = 3 }: TraitPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TRAIT_LIST.map((trait) => {
        const isSelected = selected.includes(trait.id);
        const disabled = !isSelected && selected.length >= max;
        return (
          <button
            key={trait.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(trait.id)}
            className={[
              'rounded-md border px-3 py-2 text-left text-sm transition-colors',
              isSelected
                ? 'border-sky-500 bg-sky-500/10 text-sky-100'
                : disabled
                  ? 'border-navy-700 bg-navy-900/40 text-slate-600 cursor-not-allowed'
                  : 'border-navy-700 bg-navy-900 text-slate-300 hover:border-slate-500',
            ].join(' ')}
          >
            <div className="font-semibold">{trait.name}</div>
            <div className="mt-0.5 text-xs text-slate-400">{trait.description}</div>
          </button>
        );
      })}
    </div>
  );
}
