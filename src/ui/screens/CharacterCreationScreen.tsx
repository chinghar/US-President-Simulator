import { useState } from 'react';
import { CustomCharacterForm } from './CustomCharacterForm';
import { RealCandidateGallery } from './RealCandidateGallery';
import { AmericanFlag, Eyebrow, PresidentialSeal } from '../kit';
import type { StartMode } from '../state/gameStore';

type Tab = 'custom' | 'real';

const MODE_COPY: Record<StartMode, string> = {
  campaign: 'Contest the primary and the general election, month by month, before taking office.',
  president: 'Skip the campaign entirely — take the oath on day one and start governing.',
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'custom', label: 'Build a candidate' },
  { id: 'real', label: '2028 hypothetical candidates' },
];

export function CharacterCreationScreen() {
  const [tab, setTab] = useState<Tab>('custom');
  const [mode, setMode] = useState<StartMode>('campaign');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center gap-4">
        <AmericanFlag width={64} className="shrink-0" />
        <PresidentialSeal size={48} />
        <div>
          <Eyebrow>2028</Eyebrow>
          <h1 className="font-display text-h1 text-paper">USA Presidential Simulator</h1>
          <p className="mt-1 text-small text-paper/60">Build a candidate of your own, or play as a real public figure.</p>
        </div>
      </header>

      <div className="mb-8 border border-rule bg-ink-700 p-4">
        <Eyebrow>Starting point</Eyebrow>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex border border-rule">
            <button
              type="button"
              onClick={() => setMode('campaign')}
              className={[
                'px-3 py-1.5 text-small transition-colors duration-150',
                mode === 'campaign' ? 'bg-seal text-parchment' : 'text-paper/70 hover:text-paper',
              ].join(' ')}
            >
              Full campaign
            </button>
            <button
              type="button"
              onClick={() => setMode('president')}
              className={[
                'border-l border-rule px-3 py-1.5 text-small transition-colors duration-150',
                mode === 'president' ? 'bg-seal text-parchment' : 'text-paper/70 hover:text-paper',
              ].join(' ')}
            >
              Start as president
            </button>
          </div>
          <p className="text-[13px] text-paper/50 sm:max-w-sm sm:text-right">{MODE_COPY[mode]}</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-1 border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'border-b-2 px-4 py-2 text-small font-medium transition-colors duration-150',
              tab === t.id ? 'border-brass text-paper' : 'border-transparent text-paper/50 hover:text-paper/80',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'custom' ? <CustomCharacterForm mode={mode} /> : <RealCandidateGallery mode={mode} />}
    </div>
  );
}
