import { useMemo, useState } from 'react';
import { deriveStartingStats } from '../../engine/character';
import {
  ISSUE_AXES,
  STATE_IDS,
  type AxisPositions,
  type Party,
  type PriorOffice,
  type StateId,
  type TraitId,
} from '../../engine/types';
import { ISSUE_LIST } from '../../data/issues';
import { PRIOR_OFFICE_LIST } from '../../data/prior-offices';
import { STATES } from '../../data/states';
import { useGameStore, type StartMode } from '../state/gameStore';
import { AxisSlider } from '../components/AxisSlider';
import { TraitPicker } from '../components/TraitPicker';
import { Button, Eyebrow } from '../kit';

const PARTIES: { id: Party; label: string }[] = [
  { id: 'democrat', label: 'Democrat' },
  { id: 'republican', label: 'Republican' },
  { id: 'independent', label: 'Independent' },
];

function neutralPositions(): AxisPositions {
  const positions = {} as AxisPositions;
  for (const axis of ISSUE_AXES) positions[axis] = 0;
  return positions;
}

function formatMoney(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

const INPUT_CLASS = 'w-full border border-rule bg-ink-900 px-3 py-2 text-paper outline-none focus-visible:border-brass';

export function CustomCharacterForm({ mode }: { mode: StartMode }) {
  const startCustomGame = useGameStore((s) => s.startCustomGame);

  const [name, setName] = useState('');
  const [age, setAge] = useState(52);
  const [homeState, setHomeState] = useState<StateId>(STATE_IDS[0]);
  const [party, setParty] = useState<Party>('democrat');
  const [priorOffice, setPriorOffice] = useState<PriorOffice>('governor');
  const [traits, setTraits] = useState<TraitId[]>([]);
  const [positions, setPositions] = useState<AxisPositions>(neutralPositions());

  const preview = useMemo(() => deriveStartingStats(priorOffice, traits), [priorOffice, traits]);
  const canLaunch = name.trim().length > 0 && traits.length === 3 && age >= 35 && age <= 90;

  function toggleTrait(traitId: TraitId) {
    setTraits((current) =>
      current.includes(traitId) ? current.filter((t) => t !== traitId) : [...current, traitId].slice(0, 3),
    );
  }

  function handleLaunch() {
    startCustomGame({ name: name.trim(), age, homeState, party, priorOffice, traits }, positions, mode);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-8">
        <section className="space-y-4">
          <Eyebrow>Candidate basics</Eyebrow>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-small">
              <span className="mb-1 block text-paper/60">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Reyes" className={INPUT_CLASS} />
            </label>
            <label className="block text-small">
              <span className="mb-1 block text-paper/60">Age</span>
              <input
                type="number"
                min={35}
                max={90}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className={INPUT_CLASS}
              />
            </label>
            <label className="block text-small">
              <span className="mb-1 block text-paper/60">Home state</span>
              <select value={homeState} onChange={(e) => setHomeState(e.target.value as typeof homeState)} className={INPUT_CLASS}>
                {STATE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-small">
              <span className="mb-1 block text-paper/60">Party</span>
              <select value={party} onChange={(e) => setParty(e.target.value as Party)} className={INPUT_CLASS}>
                {PARTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <Eyebrow>Prior office</Eyebrow>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRIOR_OFFICE_LIST.map((office) => {
              const selected = priorOffice === office.id;
              return (
                <button
                  key={office.id}
                  type="button"
                  onClick={() => setPriorOffice(office.id)}
                  className={[
                    'border px-3 py-2 text-left text-small transition-colors duration-150',
                    selected ? 'border-seal bg-seal text-parchment' : 'border-rule text-paper/70 hover:border-paper/50',
                  ].join(' ')}
                >
                  <div className="font-medium">{office.name}</div>
                  <div className={`mt-0.5 text-[13px] ${selected ? 'text-parchment/80' : 'text-paper/50'}`}>{office.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <Eyebrow>Starting positions</Eyebrow>
          <p className="text-[13px] text-paper/50">
            Where your candidate stands on each issue at the start of the race. Every position is a trade-off — no
            slider position pleases everyone.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {ISSUE_LIST.map((issue) => (
              <AxisSlider
                key={issue.id}
                issue={issue}
                value={positions[issue.id]}
                onChange={(value) => setPositions((p) => ({ ...p, [issue.id]: value }))}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <Eyebrow>Traits (choose 3)</Eyebrow>
          <TraitPicker selected={traits} onToggle={toggleTrait} />
        </section>
      </div>

      <aside className="h-fit space-y-4 border border-rule bg-ink-700 p-4">
        <Eyebrow>Derived starting stats</Eyebrow>
        <dl className="space-y-2 text-small">
          <div className="flex justify-between">
            <dt className="text-paper/60">Name recognition</dt>
            <dd className="font-mono text-paper">{preview.nameRecognition.toFixed(0)}/100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper/60">War chest</dt>
            <dd className="font-mono text-paper">{formatMoney(preview.warChest)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper/60">Party establishment favor</dt>
            <dd className="font-mono text-paper">{preview.partyEstablishmentFavor.toFixed(0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper/60">Base enthusiasm</dt>
            <dd className="font-mono text-paper">{preview.baseEnthusiasm.toFixed(0)}/100</dd>
          </div>
        </dl>

        <Button className="w-full" disabled={!canLaunch} onClick={handleLaunch}>
          {mode === 'president' ? 'Take office' : 'Launch campaign'}
        </Button>
        {!canLaunch && (
          <p className="text-[13px] text-paper/40">
            {name.trim().length === 0 ? 'Enter a name. ' : ''}
            {traits.length !== 3 ? `Select exactly 3 traits (${traits.length}/3 selected).` : ''}
          </p>
        )}
      </aside>
    </div>
  );
}
