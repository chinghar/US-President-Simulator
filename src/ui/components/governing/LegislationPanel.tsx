import { useState } from 'react';
import { BILLS } from '../../../data/bills';
import { previewBillWhipCount, scaleDecisionByConcession } from '../../../engine/governing';
import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import { formatBillDocket } from '../../lib/docket';
import { Button, DocketDocument, Eyebrow, Meter, Panel } from '../../kit';
import type { CongressComposition, GameDate, LegislationRecord, StakeholderId, StakeholderState } from '../../../engine/types';

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
  date: GameDate;
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
      <div className="flex justify-between text-[13px]">
        <span className="text-[#1a1a1a]/70">
          {label}: ~{chamber.expectedYes}/{chamber.neededVotes} needed of {chamber.totalVotes}
        </span>
        <span className={`font-mono ${chamber.oddsPercent >= 50 ? 'text-seal' : 'text-flag'}`}>{chamber.oddsPercent.toFixed(0)}% odds</span>
      </div>
      <Meter value={chamber.oddsPercent} color={chamber.oddsPercent >= 50 ? 'var(--seal)' : 'var(--flag)'} />
    </div>
  );
}

export function LegislationPanel({ history, pending, onChange, canPropose, congress, stakeholders, date }: LegislationPanelProps) {
  const [billId, setBillId] = useState('');
  const passedIds = new Set(history.filter((h) => h.status === 'passed').map((h) => h.billId));
  const available = BILLS.filter((b) => !passedIds.has(b.id));

  function startProposal() {
    if (!billId) return;
    onChange({ billId, concessionLevel: 1, capitalSpent: 0 });
  }

  return (
    <Panel title="Legislation">
      {pending ? (
        (() => {
          const bill = BILLS.find((b) => b.id === pending.billId)!;
          const scaled = scaleDecisionByConcession(bill, pending.concessionLevel);
          const whipCount = previewBillWhipCount(bill, scaled, congress, stakeholders, pending.concessionLevel, pending.capitalSpent);
          return (
            <DocketDocument docket={formatBillDocket(bill.id, date)} title={bill.label}>
              <p>{bill.description}</p>
              <EffectsPreviewPanel decision={bill} concessionScalable />

              <div className="space-y-2 border border-[#1a1a1a]/15 bg-[#1a1a1a]/5 p-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]/60">Whip count</p>
                <WhipRow label="House" chamber={whipCount.house} />
                <WhipRow label="Senate" chamber={whipCount.senate} />
              </div>

              <label className="block text-[13px] text-[#1a1a1a]/70">
                Concession level — {Math.round(pending.concessionLevel * 100)}% strength. Lower is easier to pass, weaker if it does.
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={pending.concessionLevel}
                  onChange={(e) => onChange({ ...pending, concessionLevel: Number(e.target.value) })}
                  className="mt-1 w-full accent-[var(--seal)]"
                />
              </label>
              <label className="block text-[13px] text-[#1a1a1a]/70">
                Extra whip spending — {pending.capitalSpent} political capital
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={pending.capitalSpent}
                  onChange={(e) => onChange({ ...pending, capitalSpent: Number(e.target.value) })}
                  className="mt-1 w-full accent-[var(--seal)]"
                />
              </label>
              <button type="button" onClick={() => onChange(null)} className="text-[13px] text-[#1a1a1a]/50 hover:text-flag">
                Withdraw the bill
              </button>
            </DocketDocument>
          );
        })()
      ) : canPropose ? (
        <div className="flex gap-2">
          <select
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            className="flex-1 border border-rule bg-ink-900 px-2 py-1.5 text-small text-paper outline-none focus-visible:border-brass"
          >
            <option value="">Choose a bill to propose</option>
            {available.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={startProposal}>
            Propose
          </Button>
        </div>
      ) : (
        <Eyebrow>No legislation on the floor. Draft a bill to begin.</Eyebrow>
      )}

      {history.length > 0 && (
        <div className="space-y-1 border-t border-rule pt-2">
          {[...history].reverse().slice(0, 6).map((record, i) => (
            <div key={i} className="flex justify-between text-[13px]">
              <span className="text-paper/60">{record.title}</span>
              <span className={record.status === 'passed' ? 'text-seal' : 'text-flag'}>{STATUS_LABEL[record.status]}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
