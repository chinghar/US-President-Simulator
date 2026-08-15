import { FIGURES } from '../../data/figures';
import { PRIOR_OFFICES } from '../../data/prior-offices';
import { TRAITS } from '../../data/traits';
import { STATES } from '../../data/states';
import { useGameStore } from '../state/gameStore';
import { Button, Tag } from '../kit';

const PARTY_LABEL: Record<string, string> = { democrat: 'Democrat', republican: 'Republican', independent: 'Independent' };
const PARTY_TONE: Record<string, 'union' | 'flag' | 'neutral'> = { democrat: 'union', republican: 'flag', independent: 'neutral' };

function formatMoney(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

export function FigureGallery() {
  const startFigureGame = useGameStore((s) => s.startFigureGame);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {FIGURES.map((figure) => (
        <div key={figure.id} className="flex flex-col justify-between border border-rule bg-ink-700 p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-h3 text-paper">{figure.name}</h3>
              <Tag tone={PARTY_TONE[figure.party]}>{PARTY_LABEL[figure.party]}</Tag>
            </div>
            <p className="text-[13px] text-paper/50">
              {PRIOR_OFFICES[figure.priorOffice].name} · {STATES[figure.homeState].name} · Age {figure.age}
            </p>
            <p className="text-small text-paper/80">{figure.bio}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {figure.traits.map((traitId) => (
                <Tag key={traitId} tone="neutral">
                  {TRAITS[traitId].name}
                </Tag>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-rule pt-2 text-[13px]">
              <dt className="text-paper/50">Name rec.</dt>
              <dd className="text-right font-mono text-paper/80">{figure.nameRecognition}/100</dd>
              <dt className="text-paper/50">War chest</dt>
              <dd className="text-right font-mono text-paper/80">{formatMoney(figure.warChest)}</dd>
            </dl>
          </div>
          <Button className="mt-4 w-full" onClick={() => startFigureGame(figure)}>
            Run as {figure.name.split(' ')[0]}
          </Button>
        </div>
      ))}
    </div>
  );
}
