import { formatRange, previewPersonaEffects } from '../lib/effectsPreview';
import type { Decision } from '../../engine/types';

interface EffectsPreviewPanelProps {
  decision: Decision;
  concessionScalable?: boolean;
}

/** A compact "here's roughly what to expect" preview — ranges, not exact
 * numbers, so the player commits under real uncertainty. */
export function EffectsPreviewPanel({ decision, concessionScalable }: EffectsPreviewPanelProps) {
  const effects = previewPersonaEffects(decision, { concessionScalable });
  if (effects.length === 0) return null;

  return (
    <div className="space-y-1 rounded-md border border-navy-700 bg-navy-950 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Projected Impact (estimate)</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
        {effects.map((e) => (
          <div key={e.personaId} className="flex justify-between text-xs">
            <span className="truncate text-slate-400">{e.name}</span>
            <span className={e.min + e.max >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatRange(e.min, e.max)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
