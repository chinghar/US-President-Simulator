import { useState } from 'react';
import { BILLS } from '../../../data/bills';
import { previewBillWhipCount, scaleDecisionByConcession } from '../../../engine/governing';
import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import type { CongressComposition, LegislationRecord, StakeholderId, StakeholderState } from '../../../engine/types';

export interface ProposedBillInput {
  billId: string;
  concessionLevel: number;
  capitalSpent: number;
}

interface LegislationPanelProps {
  history: LegislationRecord[];
  pending: ProposedBillInput | null;
  onChange: (pending: ProposedBillInput | null) => void;
  canPropose: boolean;
  congress: CongressComposition;
  stakeholders: Record<StakeholderId, StakeholderState>;
}

const STATUS_LABEL: Record<LegislationRecord['status'], string> = {
  passed: 'Passed',
  failed_house: 'Failed in the House',
  failed_senate: 'Failed in the Senate',
  struck_down: 'Struck down by the Court',
};

function WhipRow({ label, chamber }: { label: string; chamber: { expectedYes: number; neededVotes: number; totalVotes: number; oddsPercent: number } }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">
          {label}: ~{chamber.expectedYes}/{chamber.neededVotes} needed (of {chamber.totalVotes})
        </span>
        <span className={chamber.oddsPercent >= 50 ? 'text-emerald-400' : 'text-red-400'}>{chamber.oddsPercent.toFixed(0)}% odds</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
        <div
          className={['h-full rounded-full', chamber.oddsPercent >= 50 ? 'bg-emerald-500' : 'bg-red-500'].join(' ')}
          style={{ width: `${chamber.oddsPercent}%` }}
        />
      </div>
    </div>
  );
}

export function LegislationPanel({ history, pending, onChange, canPropose, congress, stakeholders }: LegislationPanelProps) {
  const [billId, setBillId] = useState('');
  const passedIds = new Set(history.filter((h) => h.status === 'passed').map((h) => h.billId));
  const available = BILLS.filter((b) => !passedIds.has(b.id));

  function startProposal() {
    if (!billId) return;
    onChange({ billId, concessionLevel: 1, capitalSpent: 0 });
  }

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Legislation</h3>

      {pending ? (
        (() => {
          const bill = BILLS.find((b) => b.id === pending.billId)!;
          const scaled = scaleDecisionByConcession(bill, pending.concessionLevel);
          const whipCount = previewBillWhipCount(bill, scaled, congress, stakeholders, pending.concessionLevel, pending.capitalSpent);
          return (
            <div className="space-y-2 rounded-md border border-sky-500/40 bg-sky-500/5 p-3">
              <p className="text-sm font-medium text-sky-200">{bill.label}</p>
              <p className="text-xs text-slate-400">{bill.description}</p>
              <EffectsPreviewPanel decision={bill} concessionScalable />

              <div className="space-y-2 rounded-md border border-navy-700 bg-navy-950 p-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Whip Count</p>
                <WhipRow label="House" chamber={whipCount.house} />
                <WhipRow label="Senate" chamber={whipCount.senate} />
              </div>

              <label className="block text-xs text-slate-400">
                Concession level ({Math.round(pending.concessionLevel * 100)}% strength — lower is easier to pass, weaker if it does)
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={pending.concessionLevel}
                  onChange={(e) => onChange({ ...pending, concessionLevel: Number(e.target.value) })}
                  className="mt-1 w-full accent-sky-500"
                />
              </label>
              <label className="block text-xs text-slate-400">
                Extra whip spending ({pending.capitalSpent} political capital)
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={pending.capitalSpent}
                  onChange={(e) => onChange({ ...pending, capitalSpent: Number(e.target.value) })}
                  className="mt-1 w-full accent-sky-500"
                />
              </label>
              <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-500 hover:text-red-400">
                Cancel
              </button>
            </div>
          );
        })()
      ) : canPropose ? (
        <div className="flex gap-2">
          <select
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            className="flex-1 rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
          >
            <option value="">Choose a bill to propose...</option>
            {available.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={startProposal} className="rounded-md bg-navy-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-navy-600">
            Propose
          </button>
        </div>
      ) : null}

      {history.length > 0 && (
        <div className="space-y-1 border-t border-navy-700 pt-2">
          {[...history].reverse().slice(0, 6).map((record, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-400">{record.title}</span>
              <span className={record.status === 'passed' ? 'text-emerald-400' : 'text-red-400'}>{STATUS_LABEL[record.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
