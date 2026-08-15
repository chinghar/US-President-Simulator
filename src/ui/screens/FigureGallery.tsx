import { FIGURES } from '../../data/figures';
import { PRIOR_OFFICES } from '../../data/prior-offices';
import { TRAITS } from '../../data/traits';
import { STATES } from '../../data/states';
import { useGameStore } from '../state/gameStore';

const PARTY_LABEL: Record<string, string> = { democrat: 'Democrat', republican: 'Republican', independent: 'Independent' };

function formatMoney(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

export function FigureGallery() {
  const startFigureGame = useGameStore((s) => s.startFigureGame);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {FIGURES.map((figure) => (
        <div key={figure.id} className="flex flex-col justify-between rounded-lg border border-navy-700 bg-navy-900/60 p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-100">{figure.name}</h3>
              <span className="whitespace-nowrap rounded-full border border-navy-600 px-2 py-0.5 text-[11px] text-slate-400">
                {PARTY_LABEL[figure.party]}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {PRIOR_OFFICES[figure.priorOffice].name} · {STATES[figure.homeState].name} · Age {figure.age}
            </p>
            <p className="text-sm text-slate-300">{figure.bio}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {figure.traits.map((traitId) => (
                <span key={traitId} className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                  {TRAITS[traitId].name}
                </span>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-xs">
              <dt className="text-slate-500">Name Rec.</dt>
              <dd className="text-right tabular-nums text-slate-300">{figure.nameRecognition}/100</dd>
              <dt className="text-slate-500">War Chest</dt>
              <dd className="text-right tabular-nums text-slate-300">{formatMoney(figure.warChest)}</dd>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => startFigureGame(figure)}
            className="mt-4 w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
          >
            Run as {figure.name.split(' ')[0]}
          </button>
        </div>
      ))}
    </div>
  );
}
