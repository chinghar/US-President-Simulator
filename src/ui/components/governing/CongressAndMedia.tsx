import { STAKEHOLDER_DEFINITIONS } from '../../../data/stakeholders';
import type { CongressComposition, Headline } from '../../../engine/types';
import { Eyebrow, Panel, Rule } from '../../kit';

function ChamberBar({ label, dem, rep, ind }: { label: string; dem: number; rep: number; ind: number }) {
  const total = dem + rep + ind;
  return (
    <div>
      <div className="flex justify-between text-[13px] text-paper/70">
        <span>{label}</span>
        <span className="font-mono text-paper/50">
          {dem}D · {rep}R · {ind}I
        </span>
      </div>
      <div className="mt-1 flex h-1.5 w-full border border-rule">
        <div className="h-full bg-union" style={{ width: `${(dem / total) * 100}%` }} />
        <div className="h-full bg-flag" style={{ width: `${(rep / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function CongressPanel({ congress }: { congress: CongressComposition }) {
  return (
    <Panel title="Congress">
      <div className="space-y-3">
        <ChamberBar label="House" dem={congress.houseDem} rep={congress.houseRep} ind={congress.houseInd} />
        <ChamberBar label="Senate" dem={congress.senateDem} rep={congress.senateRep} ind={congress.senateInd} />
      </div>
    </Panel>
  );
}

const FRAMING_CLASS: Record<Headline['framing'], string> = {
  positive: 'text-seal',
  negative: 'text-flag',
  neutral: 'text-paper/80',
};

/** "The Wire" — the right-rail headline feed. Outlet name is the byline, not a color-coded tag. */
export function HeadlinesPanel({ headlines }: { headlines: Headline[] }) {
  const recent = [...headlines].reverse().slice(0, 8);
  return (
    <div>
      <Eyebrow className="mb-2">The Wire</Eyebrow>
      {recent.length === 0 ? (
        <p className="text-[13px] text-paper/40">No wire activity yet this term.</p>
      ) : (
        <div className="space-y-2.5">
          {recent.map((h, i) => (
            <div key={i}>
              <p className={`text-small leading-snug ${FRAMING_CLASS[h.framing]}`}>{h.text}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-paper/40">
                {STAKEHOLDER_DEFINITIONS[h.outletId].name}
              </p>
              {i < recent.length - 1 && <Rule className="mt-2.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
