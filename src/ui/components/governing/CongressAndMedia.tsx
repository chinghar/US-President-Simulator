import { STAKEHOLDER_DEFINITIONS } from '../../../data/stakeholders';
import type { CongressComposition, Headline } from '../../../engine/types';

export function CongressPanel({ congress }: { congress: CongressComposition }) {
  const houseTotal = congress.houseDem + congress.houseRep + congress.houseInd;
  const senateTotal = congress.senateDem + congress.senateRep + congress.senateInd;
  return (
    <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Congress</h3>
      <div className="space-y-2 text-sm">
        <div>
          <div className="flex justify-between text-slate-300">
            <span>House</span>
            <span className="tabular-nums text-slate-500">
              {congress.houseDem}D · {congress.houseRep}R · {congress.houseInd}I
            </span>
          </div>
          <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-navy-800">
            <div className="h-full bg-blue-500" style={{ width: `${(congress.houseDem / houseTotal) * 100}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${(congress.houseRep / houseTotal) * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-slate-300">
            <span>Senate</span>
            <span className="tabular-nums text-slate-500">
              {congress.senateDem}D · {congress.senateRep}R · {congress.senateInd}I
            </span>
          </div>
          <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-navy-800">
            <div className="h-full bg-blue-500" style={{ width: `${(congress.senateDem / senateTotal) * 100}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${(congress.senateRep / senateTotal) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeadlinesPanel({ headlines }: { headlines: Headline[] }) {
  const recent = [...headlines].reverse().slice(0, 6);
  if (recent.length === 0) return null;
  return (
    <div className="space-y-2 rounded-lg border border-navy-700 bg-navy-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Headlines</h3>
      <div className="space-y-1.5">
        {recent.map((h, i) => (
          <div key={i} className="text-xs">
            <span className="text-slate-500">{STAKEHOLDER_DEFINITIONS[h.outletId].name}: </span>
            <span
              className={
                h.framing === 'positive' ? 'text-emerald-400' : h.framing === 'negative' ? 'text-red-400' : 'text-slate-300'
              }
            >
              {h.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
