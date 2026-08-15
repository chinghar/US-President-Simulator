import { useState } from 'react';
import { CustomCharacterForm } from './CustomCharacterForm';
import { FigureGallery } from './FigureGallery';
import { Eyebrow, PresidentialSeal } from '../kit';

type Tab = 'figure' | 'custom';

export function CharacterCreationScreen() {
  const [tab, setTab] = useState<Tab>('figure');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center gap-4">
        <PresidentialSeal size={48} />
        <div>
          <Eyebrow>2028</Eyebrow>
          <h1 className="font-display text-h1 text-paper">USA Presidential Simulator</h1>
          <p className="mt-1 text-small text-paper/60">Choose a figure to run as, or build a candidate of your own.</p>
        </div>
      </header>

      <div className="mb-8 flex gap-1 border-b border-rule">
        <button
          type="button"
          onClick={() => setTab('figure')}
          className={[
            'border-b-2 px-4 py-2 text-small font-medium transition-colors duration-150',
            tab === 'figure' ? 'border-brass text-paper' : 'border-transparent text-paper/50 hover:text-paper/80',
          ].join(' ')}
        >
          Choose a figure
        </button>
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={[
            'border-b-2 px-4 py-2 text-small font-medium transition-colors duration-150',
            tab === 'custom' ? 'border-brass text-paper' : 'border-transparent text-paper/50 hover:text-paper/80',
          ].join(' ')}
        >
          Build a candidate
        </button>
      </div>

      {tab === 'figure' ? <FigureGallery /> : <CustomCharacterForm />}
    </div>
  );
}
