import { useState } from 'react';
import { EXECUTIVE_ORDERS } from '../../../data/executive-orders';
import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import { formatExecutiveOrderDocket } from '../../lib/docket';
import { Button, DocketDocument, Eyebrow, Panel } from '../../kit';
import type { ExecutiveOrderRecord, GameDate } from '../../../engine/types';

interface ExecutiveOrderPanelProps {
  history: ExecutiveOrderRecord[];
  pendingOrderId: string | null;
  onChange: (orderId: string | null) => void;
  canIssue: boolean;
  date: GameDate;
}

export function ExecutiveOrderPanel({ history, pendingOrderId, onChange, canIssue, date }: ExecutiveOrderPanelProps) {
  const [orderId, setOrderId] = useState('');
  const signedIds = new Set(history.filter((h) => !h.courtStruckDown).map((h) => h.orderId));
  const available = EXECUTIVE_ORDERS.filter((o) => !signedIds.has(o.id));
  const pendingOrder = pendingOrderId ? EXECUTIVE_ORDERS.find((o) => o.id === pendingOrderId) : null;

  return (
    <Panel title="Executive orders">
      {pendingOrder ? (
        <DocketDocument docket={formatExecutiveOrderDocket(pendingOrder.id, date)} title={pendingOrder.label}>
          <p>{pendingOrder.description}</p>
          <EffectsPreviewPanel decision={pendingOrder} />
          <p className="text-[13px] text-brass">Constitutional risk: {pendingOrder.constitutionalRisk}%</p>
          <button type="button" onClick={() => onChange(null)} className="text-[13px] text-[#1a1a1a]/50 hover:text-flag">
            Withdraw the order
          </button>
        </DocketDocument>
      ) : canIssue ? (
        <div className="flex gap-2">
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 border border-rule bg-ink-900 px-2 py-1.5 text-small text-paper outline-none focus-visible:border-brass"
          >
            <option value="">Choose an order to sign</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => orderId && onChange(orderId)}>
            Sign
          </Button>
        </div>
      ) : (
        <Eyebrow>No executive orders ready. Free up action budget to issue one.</Eyebrow>
      )}

      {history.length > 0 && (
        <div className="space-y-1 border-t border-rule pt-2">
          {[...history].reverse().slice(0, 6).map((record, i) => (
            <div key={i} className="flex justify-between text-[13px]">
              <span className="text-paper/60">{record.title}</span>
              <span className={record.courtStruckDown ? 'text-flag' : 'text-seal'}>
                {record.courtStruckDown ? 'Struck down' : 'In effect'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
