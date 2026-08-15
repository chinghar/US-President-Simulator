import { useState } from 'react';
import { STATES } from '../../../data/states';
import { SWING_STATES } from '../../../engine/general';
import { STATE_IDS, type GeneralActionType, type GeneralCandidate, type StateId } from '../../../engine/types';

type ActionKind = GeneralActionType['kind'];

const ACTION_LABELS: Record<ActionKind, string> = {
  campaign: 'Campaign / Travel to a State',
  fundraise: 'Fundraise',
  ad_positive: 'Run a Positive Ad',
  ad_attack: 'Run an Attack Ad',
  debate_prep: 'Debate Prep',
  interview: 'Give an Interview',
};

const STATE_OPTIONS: StateId[] = [
  ...SWING_STATES,
  ...STATE_IDS.filter((id) => !SWING_STATES.includes(id)),
];

function describeAction(action: GeneralActionType, opponents: GeneralCandidate[]): string {
  switch (action.kind) {
    case 'campaign':
      return `Campaign in ${STATES[action.stateId].name}`;
    case 'ad_positive':
      return `Positive ad in ${STATES[action.stateId].name}`;
    case 'ad_attack': {
      const target = opponents.find((o) => o.id === action.targetId);
      return `Attack ad on ${target?.name ?? action.targetId} in ${STATES[action.stateId].name}`;
    }
    case 'fundraise':
      return 'Fundraise';
    case 'debate_prep':
      return 'Debate prep';
    case 'interview':
      return 'Give an interview';
  }
}

interface GeneralActionBuilderProps {
  actions: GeneralActionType[];
  onChange: (actions: GeneralActionType[]) => void;
  budget: number;
  opponents: GeneralCandidate[];
}

export function GeneralActionBuilder({ actions, onChange, budget, opponents }: GeneralActionBuilderProps) {
  const [kind, setKind] = useState<ActionKind>('fundraise');
  const [stateId, setStateId] = useState<StateId | ''>('');
  const [targetId, setTargetId] = useState('');

  const full = actions.length >= budget;

  function addAction() {
    if (full) return;
    let action: GeneralActionType | null = null;
    if (kind === 'campaign') {
      if (!stateId) return;
      action = { kind: 'campaign', stateId };
    } else if (kind === 'ad_positive') {
      if (!stateId) return;
      action = { kind: 'ad_positive', stateId };
    } else if (kind === 'ad_attack') {
      if (!stateId || !targetId) return;
      action = { kind: 'ad_attack', stateId, targetId };
    } else if (kind === 'fundraise') {
      action = { kind: 'fundraise' };
    } else if (kind === 'debate_prep') {
      action = { kind: 'debate_prep' };
    } else if (kind === 'interview') {
      action = { kind: 'interview' };
    }
    if (!action) return;
    onChange([...actions, action]);
  }

  function removeAction(index: number) {
    onChange(actions.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Monthly Actions ({actions.length}/{budget})
      </h3>

      {actions.length > 0 && (
        <ul className="space-y-1">
          {actions.map((action, i) => (
            <li key={i} className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-900 px-3 py-1.5 text-sm text-slate-300">
              <span>{describeAction(action, opponents)}</span>
              <button type="button" onClick={() => removeAction(i)} className="text-slate-500 hover:text-red-400">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="space-y-2 rounded-md border border-navy-700 bg-navy-900/60 p-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ActionKind)}
            className="w-full rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
          >
            {(Object.keys(ACTION_LABELS) as ActionKind[]).map((k) => (
              <option key={k} value={k}>
                {ACTION_LABELS[k]}
              </option>
            ))}
          </select>

          {(kind === 'campaign' || kind === 'ad_positive' || kind === 'ad_attack') && (
            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value as StateId)}
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
            >
              <option value="">Choose a state...</option>
              <optgroup label="Swing States">
                {SWING_STATES.map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All States">
                {STATE_OPTIONS.filter((id) => !SWING_STATES.includes(id)).map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </optgroup>
            </select>
          )}

          {kind === 'ad_attack' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
            >
              <option value="">Choose a target...</option>
              {opponents.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={addAction}
            className="w-full rounded-md bg-navy-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-navy-600"
          >
            Add Action
          </button>
        </div>
      )}
    </div>
  );
}
