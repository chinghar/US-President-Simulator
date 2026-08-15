import { useState } from 'react';
import { ISSUE_LIST } from '../../../data/issues';
import { STATES } from '../../../data/states';
import type { IssueAxisId, PrimaryActionType, PrimaryCandidate, StateId } from '../../../engine/types';

const STAKEHOLDER_OPTIONS = [
  { id: 'party_establishment' as const, name: 'Party Establishment' },
  { id: 'donor_class' as const, name: 'Donor Class' },
  { id: 'labor_unions' as const, name: 'Labor Unions' },
  { id: 'business_lobby' as const, name: 'Business Lobby' },
];

type ActionKind = PrimaryActionType['kind'];

const ACTION_LABELS: Record<ActionKind, string> = {
  campaign: 'Campaign in a State',
  fundraise: 'Fundraise',
  ad_positive: 'Run a Positive Ad',
  ad_attack: 'Run an Attack Ad',
  debate_prep: 'Debate Prep',
  endorsement: 'Court an Endorsement',
  interview: 'Give an Interview',
  shift_position: 'Shift a Policy Position',
};

function describeAction(action: PrimaryActionType, rivals: PrimaryCandidate[]): string {
  switch (action.kind) {
    case 'campaign':
      return `Campaign in ${STATES[action.stateId].name}`;
    case 'ad_positive':
      return `Positive ad in ${STATES[action.stateId].name}`;
    case 'ad_attack': {
      const target = rivals.find((r) => r.id === action.targetId);
      return `Attack ad on ${target?.name ?? action.targetId} in ${STATES[action.stateId].name}`;
    }
    case 'endorsement':
      return `Court endorsement: ${STAKEHOLDER_OPTIONS.find((s) => s.id === action.stakeholderId)?.name ?? action.stakeholderId}`;
    case 'shift_position':
      return `Shift ${ISSUE_LIST.find((i) => i.id === action.axis)?.name} by ${action.delta > 0 ? '+' : ''}${action.delta}`;
    case 'fundraise':
      return 'Fundraise';
    case 'debate_prep':
      return 'Debate prep';
    case 'interview':
      return 'Give an interview';
  }
}

interface ActionBuilderProps {
  actions: PrimaryActionType[];
  onChange: (actions: PrimaryActionType[]) => void;
  budget: number;
  statesInPlay: StateId[];
  rivals: PrimaryCandidate[];
}

export function ActionBuilder({ actions, onChange, budget, statesInPlay, rivals }: ActionBuilderProps) {
  const [kind, setKind] = useState<ActionKind>('fundraise');
  const [stateId, setStateId] = useState<StateId | ''>('');
  const [targetId, setTargetId] = useState('');
  const [axis, setAxis] = useState<IssueAxisId>('economy');
  const [delta, setDelta] = useState(10);
  const [stakeholderId, setStakeholderId] = useState<(typeof STAKEHOLDER_OPTIONS)[number]['id']>('party_establishment');

  const availableKinds: ActionKind[] =
    statesInPlay.length > 0
      ? ['campaign', 'ad_positive', 'ad_attack', 'fundraise', 'debate_prep', 'endorsement', 'interview', 'shift_position']
      : ['fundraise', 'debate_prep', 'endorsement', 'interview', 'shift_position'];

  const full = actions.length >= budget;

  function addAction() {
    if (full) return;
    let action: PrimaryActionType | null = null;
    if (kind === 'campaign') {
      if (!stateId) return;
      action = { kind: 'campaign', stateId };
    } else if (kind === 'ad_positive') {
      if (!stateId) return;
      action = { kind: 'ad_positive', stateId };
    } else if (kind === 'ad_attack') {
      if (!stateId || !targetId) return;
      action = { kind: 'ad_attack', stateId, targetId };
    } else if (kind === 'endorsement') {
      action = { kind: 'endorsement', stakeholderId };
    } else if (kind === 'shift_position') {
      action = { kind: 'shift_position', axis, delta };
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Monthly Actions ({actions.length}/{budget})
        </h3>
      </div>

      {actions.length > 0 && (
        <ul className="space-y-1">
          {actions.map((action, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-900 px-3 py-1.5 text-sm text-slate-300"
            >
              <span>{describeAction(action, rivals)}</span>
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
            {availableKinds.map((k) => (
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
              <option value="">Choose a state in play...</option>
              {statesInPlay.map((id) => (
                <option key={id} value={id}>
                  {STATES[id].name}
                </option>
              ))}
            </select>
          )}

          {kind === 'ad_attack' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
            >
              <option value="">Choose a target...</option>
              {rivals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          {kind === 'endorsement' && (
            <select
              value={stakeholderId}
              onChange={(e) => setStakeholderId(e.target.value as typeof stakeholderId)}
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
            >
              {STAKEHOLDER_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {kind === 'shift_position' && (
            <div className="flex gap-2">
              <select
                value={axis}
                onChange={(e) => setAxis(e.target.value as IssueAxisId)}
                className="flex-1 rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              >
                {ISSUE_LIST.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.name}
                  </option>
                ))}
              </select>
              <select
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-28 rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              >
                {[-30, -20, -10, 10, 20, 30].map((d) => (
                  <option key={d} value={d}>
                    {d > 0 ? `+${d}` : d}
                  </option>
                ))}
              </select>
            </div>
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
