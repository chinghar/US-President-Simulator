import { STATES } from '../../data/states';
import { TRAITS } from '../../data/traits';
import { VP_CANDIDATES } from '../../data/vp-candidates';
import { useGameStore } from '../state/gameStore';
import { Button, Eyebrow, Tag } from '../kit';

export function VpSelectionScreen() {
  const selectVp = useGameStore((s) => s.selectVp);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 space-y-1">
        <Eyebrow>Running mate</Eyebrow>
        <h1 className="font-display text-h1 text-paper">Choose your running mate</h1>
        <p className="text-small text-paper/60">
          Your VP pick balances the ticket toward a region and coalition — a lasting, position-independent boost with
          specific voter blocs.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {VP_CANDIDATES.map((vp) => (
          <div key={vp.id} className="flex flex-col justify-between border border-rule bg-ink-700 p-4">
            <div className="space-y-2">
              <h3 className="font-display text-h3 text-paper">{vp.name}</h3>
              <p className="text-[13px] text-paper/50">{STATES[vp.homeState].name}</p>
              <p className="text-small text-paper/80">{vp.bio}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vp.traits.map((traitId) => (
                  <Tag key={traitId} tone="neutral">
                    {TRAITS[traitId].name}
                  </Tag>
                ))}
              </div>
              <div className="border-t border-rule pt-2 text-[13px] text-paper/50">
                Boosts:{' '}
                {Object.entries(vp.personaBonus)
                  .map(([personaId, bonus]) => `${personaId.replace(/_/g, ' ')} (+${bonus})`)
                  .join(', ')}
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => selectVp(vp)}>
              Select {vp.name.split(' ')[0]}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
