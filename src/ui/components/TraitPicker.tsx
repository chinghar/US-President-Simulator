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
              'border px-3 py-2 text-left text-small transition-colors duration-150',
              isSelected
                ? 'border-seal bg-seal/10 text-paper'
                : disabled
                  ? 'cursor-not-allowed border-rule/50 text-paper/30'
                  : 'border-rule text-paper/70 hover:border-paper/50',
            ].join(' ')}
          >
            <div className="font-medium">{trait.name}</div>
            <div className="mt-0.5 text-[13px] text-paper/50">{trait.description}</div>
          </button>
        );
      })}
    </div>
  );
}
