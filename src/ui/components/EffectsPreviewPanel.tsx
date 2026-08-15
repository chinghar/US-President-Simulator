import { formatRange, previewPersonaEffects } from '../lib/effectsPreview';
import { Eyebrow } from '../kit';
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
    <div className="space-y-1.5 border border-rule bg-ink-900 p-2.5">
      <Eyebrow>Projected impact, estimate</Eyebrow>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
        {effects.map((e) => (
          <div key={e.personaId} className="flex justify-between text-[13px]">
            <span className="truncate text-paper/60">{e.name}</span>
            <span className={`font-mono ${e.min + e.max >= 0 ? 'text-seal' : 'text-flag'}`}>{formatRange(e.min, e.max)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
