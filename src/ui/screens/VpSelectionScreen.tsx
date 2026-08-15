import { STATES } from '../../data/states';
import { TRAITS } from '../../data/traits';
import { VP_CANDIDATES } from '../../data/vp-candidates';
import { useGameStore } from '../state/gameStore';

export function VpSelectionScreen() {
  const selectVp = useGameStore((s) => s.selectVp);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Choose Your Running Mate</h1>
        <p className="text-slate-400">
          Your VP pick balances the ticket toward a region and coalition — a lasting, position-independent boost with
          specific voter blocs.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {VP_CANDIDATES.map((vp) => (
          <div key={vp.id} className="flex flex-col justify-between rounded-lg border border-navy-700 bg-navy-900/60 p-4">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">{vp.name}</h3>
              <p className="text-xs text-slate-500">{STATES[vp.homeState].name}</p>
              <p className="text-sm text-slate-300">{vp.bio}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vp.traits.map((traitId) => (
                  <span key={traitId} className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                    {TRAITS[traitId].name}
                  </span>
                ))}
              </div>
              <div className="pt-2 text-xs text-slate-400">
                Boosts:{' '}
                {Object.entries(vp.personaBonus)
                  .map(([personaId, bonus]) => `${personaId.replace(/_/g, ' ')} (+${bonus})`)
                  .join(', ')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => selectVp(vp)}
              className="mt-4 w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
            >
              Select {vp.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
