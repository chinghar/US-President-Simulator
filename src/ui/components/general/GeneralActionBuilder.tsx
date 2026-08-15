import { useState } from 'react';
import { STATES } from '../../../data/states';
import { SWING_STATES } from '../../../engine/general';
import { STATE_IDS, type GeneralActionType, type GeneralCandidate, type StateId } from '../../../engine/types';
import { Button, Eyebrow } from '../../kit';

type ActionKind = GeneralActionType['kind'];

const ACTION_LABELS: Record<ActionKind, string> = {
  campaign: 'Campaign / travel to a state',
  fundraise: 'Fundraise',
  ad_positive: 'Run a positive ad',
  ad_attack: 'Run an attack ad',
  debate_prep: 'Debate prep',
  interview: 'Give an interview',
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

const SELECT_CLASS = 'w-full border border-rule bg-ink-900 px-2 py-1.5 text-small text-paper outline-none focus-visible:border-brass';

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
      <Eyebrow>
        Monthly actions ({actions.length}/{budget})
      </Eyebrow>

      {actions.length > 0 && (
        <ul className="space-y-1">
          {actions.map((action, i) => (
            <li key={i} className="flex items-center justify-between border border-rule bg-ink-900 px-3 py-1.5 text-small text-paper/70">
              <span>{describeAction(action, opponents)}</span>
              <button type="button" onClick={() => removeAction(i)} className="text-paper/40 hover:text-flag">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="space-y-2 border border-rule bg-ink-900 p-3">
          <select value={kind} onChange={(e) => setKind(e.target.value as ActionKind)} className={SELECT_CLASS}>
            {(Object.keys(ACTION_LABELS) as ActionKind[]).map((k) => (
              <option key={k} value={k}>
                {ACTION_LABELS[k]}
              </option>
            ))}
          </select>

          {(kind === 'campaign' || kind === 'ad_positive' || kind === 'ad_attack') && (
            <select value={stateId} onChange={(e) => setStateId(e.target.value as StateId)} className={SELECT_CLASS}>
              <option value="">Choose a state</option>
              <optgroup label="Swing states">
                {SWING_STATES.map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All states">
                {STATE_OPTIONS.filter((id) => !SWING_STATES.includes(id)).map((id) => (
                  <option key={id} value={id}>
                    {STATES[id].name}
                  </option>
                ))}
              </optgroup>
            </select>
          )}

          {kind === 'ad_attack' && (
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={SELECT_CLASS}>
              <option value="">Choose a target</option>
              {opponents.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}

          <Button variant="secondary" className="w-full" onClick={addAction}>
            Add action
          </Button>
        </div>
      )}
    </div>
  );
}
