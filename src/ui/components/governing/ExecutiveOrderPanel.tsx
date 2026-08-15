import { useState } from 'react';
import { EXECUTIVE_ORDERS } from '../../../data/executive-orders';
import { EffectsPreviewPanel } from '../EffectsPreviewPanel';
import type { ExecutiveOrderRecord } from '../../../engine/types';

interface ExecutiveOrderPanelProps {
  history: ExecutiveOrderRecord[];
  pendingOrderId: string | null;
  onChange: (orderId: string | null) => void;
  canIssue: boolean;
}

export function ExecutiveOrderPanel({ history, pendingOrderId, onChange, canIssue }: ExecutiveOrderPanelProps) {
  const [orderId, setOrderId] = useState('');
  const signedIds = new Set(history.filter((h) => !h.courtStruckDown).map((h) => h.orderId));
  const available = EXECUTIVE_ORDERS.filter((o) => !signedIds.has(o.id));
  const pendingOrder = pendingOrderId ? EXECUTIVE_ORDERS.find((o) => o.id === pendingOrderId) : null;

  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Executive Orders</h3>

      {pendingOrder ? (
        <div className="space-y-1 rounded-md border border-sky-500/40 bg-sky-500/5 p-3">
          <p className="text-sm font-medium text-sky-200">{pendingOrder.label}</p>
          <p className="text-xs text-slate-400">{pendingOrder.description}</p>
          <EffectsPreviewPanel decision={pendingOrder} />
          <p className="text-xs text-amber-400">Constitutional risk: {pendingOrder.constitutionalRisk}%</p>
          <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-500 hover:text-red-400">
            Cancel
          </button>
        </div>
      ) : canIssue ? (
        <div className="flex gap-2">
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-sky-500"
          >
            <option value="">Choose an order to sign...</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => orderId && onChange(orderId)}
            className="rounded-md bg-navy-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-navy-600"
          >
            Sign
          </button>
        </div>
      ) : null}

      {history.length > 0 && (
        <div className="space-y-1 border-t border-navy-700 pt-2">
          {[...history].reverse().slice(0, 6).map((record, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-400">{record.title}</span>
              <span className={record.courtStruckDown ? 'text-red-400' : 'text-emerald-400'}>
                {record.courtStruckDown ? 'Struck down' : 'In effect'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
