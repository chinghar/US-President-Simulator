import { useState } from 'react';
import { REAL_CANDIDATES, REAL_CANDIDATES_AS_OF, type RealCandidate } from '../../data/real-candidates';
import { STATES } from '../../data/states';
import { ISSUE_LIST } from '../../data/issues';
import type { AxisPositions } from '../../engine/types';
import { useGameStore, type StartMode } from '../state/gameStore';
import { AxisSlider } from '../components/AxisSlider';
import { Button, Eyebrow, Tag } from '../kit';

const PARTY_LABEL: Record<string, string> = { democrat: 'Democrat', republican: 'Republican', independent: 'Independent' };
const PARTY_TONE: Record<string, 'union' | 'flag' | 'neutral'> = { democrat: 'union', republican: 'flag', independent: 'neutral' };

export function RealCandidateGallery({ mode }: { mode: StartMode }) {
  const startRealCandidateGame = useGameStore((s) => s.startRealCandidateGame);
  const [selected, setSelected] = useState<RealCandidate | null>(null);
  const [positions, setPositions] = useState<AxisPositions>(REAL_CANDIDATES[0].startingPositions);

  function selectCandidate(candidate: RealCandidate) {
    setSelected(candidate);
    setPositions(candidate.startingPositions);
  }

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-brass bg-ink-700 p-4">
        <Eyebrow className="text-brass">2028 hypothetical candidates</Eyebrow>
        <p className="mt-2 text-small text-paper/80">
          Real public officials, used here as playable identities in a fictional simulation. Their listed facts are
          objectively verifiable (office held, dates of service) as of {REAL_CANDIDATES_AS_OF} — nobody on this list
          is being described as having declared an actual candidacy for president. Starting positions are approximate
          gameplay estimates based on each candidate's public record, not a definitive statement of their beliefs —
          every slider is yours to move before you begin. Everything that happens after you choose one is generated
          by this game's mechanics, not a record of anything the real person has said or done: no traits are
          assigned, personal-conduct and scandal events are turned off, and debates present hypothetical strategy
          choices rather than quotes.
        </p>
      </div>

      {selected ? (
        <div className="space-y-6">
          <div className="border border-rule bg-ink-700 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-h3 text-paper">{selected.name}</h3>
              <Tag tone={PARTY_TONE[selected.party]}>{PARTY_LABEL[selected.party]}</Tag>
            </div>
            <p className="text-[13px] text-paper/50">{STATES[selected.homeState].name} · Age {selected.age}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-small text-paper/80">
              {selected.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <button type="button" onClick={() => setSelected(null)} className="mt-3 text-[13px] text-paper/50 hover:text-paper">
              Choose someone else
            </button>
          </div>

          <div className="space-y-4 border border-rule bg-ink-700 p-4">
            <Eyebrow>Starting positions</Eyebrow>
            <p className="text-[13px] text-paper/50">
              Approximate gameplay estimates based on {selected.name}'s public record, not a definitive statement of
              their actual views — adjust anything before you begin.
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
          </div>

          <Button className="w-full" onClick={() => startRealCandidateGame(selected, positions, mode)}>
            {mode === 'president' ? `Take office as ${selected.name.split(' ').pop()}` : `Run as ${selected.name.split(' ').pop()}`}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {REAL_CANDIDATES.map((candidate) => (
            <div key={candidate.id} className="flex flex-col justify-between border border-rule bg-ink-700 p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-h3 text-paper">{candidate.name}</h3>
                  <Tag tone={PARTY_TONE[candidate.party]}>{PARTY_LABEL[candidate.party]}</Tag>
                </div>
                <p className="text-[13px] text-paper/50">
                  {STATES[candidate.homeState].name} · Age {candidate.age}
                </p>
                <ul className="list-disc space-y-1 pl-4 text-[13px] text-paper/70">
                  {candidate.facts.slice(0, 2).map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>
              <Button variant="secondary" className="mt-4 w-full" onClick={() => selectCandidate(candidate)}>
                Select {candidate.name.split(' ').pop()}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
