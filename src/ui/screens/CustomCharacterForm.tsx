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
import { useGameStore } from '../state/gameStore';
import { AxisSlider } from '../components/AxisSlider';
import { TraitPicker } from '../components/TraitPicker';

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

export function CustomCharacterForm() {
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
    startCustomGame({ name: name.trim(), age, homeState, party, priorOffice, traits }, positions);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Candidate Basics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Reyes"
                className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">Age</span>
              <input
                type="number"
                min={35}
                max={90}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">Home State</span>
              <select
                value={homeState}
                onChange={(e) => setHomeState(e.target.value as typeof homeState)}
                className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              >
                {STATE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">Party</span>
              <select
                value={party}
                onChange={(e) => setParty(e.target.value as Party)}
                className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              >
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
          <h2 className="text-lg font-semibold text-slate-100">Prior Office</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRIOR_OFFICE_LIST.map((office) => (
              <button
                key={office.id}
                type="button"
                onClick={() => setPriorOffice(office.id)}
                className={[
                  'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                  priorOffice === office.id
                    ? 'border-sky-500 bg-sky-500/10 text-sky-100'
                    : 'border-navy-700 bg-navy-900 text-slate-300 hover:border-slate-500',
                ].join(' ')}
              >
                <div className="font-semibold">{office.name}</div>
                <div className="mt-0.5 text-xs text-slate-400">{office.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Starting Positions</h2>
          <p className="text-xs text-slate-500">
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
          <h2 className="text-lg font-semibold text-slate-100">Traits (choose 3)</h2>
          <TraitPicker selected={traits} onToggle={toggleTrait} />
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Derived Starting Stats</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Name Recognition</dt>
            <dd className="tabular-nums text-slate-100">{preview.nameRecognition.toFixed(0)}/100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">War Chest</dt>
            <dd className="tabular-nums text-slate-100">{formatMoney(preview.warChest)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Party Establishment Favor</dt>
            <dd className="tabular-nums text-slate-100">{preview.partyEstablishmentFavor.toFixed(0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Base Enthusiasm</dt>
            <dd className="tabular-nums text-slate-100">{preview.baseEnthusiasm.toFixed(0)}/100</dd>
          </div>
        </dl>

        <button
          type="button"
          disabled={!canLaunch}
          onClick={handleLaunch}
          className={[
            'w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
            canLaunch
              ? 'bg-sky-600 text-white hover:bg-sky-500'
              : 'cursor-not-allowed bg-navy-700 text-slate-500',
          ].join(' ')}
        >
          Launch Campaign
        </button>
        {!canLaunch && (
          <p className="text-xs text-slate-500">
            {name.trim().length === 0 ? 'Enter a name. ' : ''}
            {traits.length !== 3 ? `Select exactly 3 traits (${traits.length}/3 selected).` : ''}
          </p>
        )}
      </aside>
    </div>
  );
}
