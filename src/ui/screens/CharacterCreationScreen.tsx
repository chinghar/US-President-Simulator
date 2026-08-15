import { useState } from 'react';
import { CustomCharacterForm } from './CustomCharacterForm';
import { FigureGallery } from './FigureGallery';

type Tab = 'custom' | 'figure';

export function CharacterCreationScreen() {
  const [tab, setTab] = useState<Tab>('custom');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">USA Presidential Simulator</h1>
        <p className="text-slate-400">Build a candidate for the 2028 race, or run as a pre-made figure.</p>
      </header>

      <div className="mb-8 flex gap-1 border-b border-navy-700">
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={[
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            tab === 'custom' ? 'border-sky-500 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300',
          ].join(' ')}
        >
          Build a Candidate
        </button>
        <button
          type="button"
          onClick={() => setTab('figure')}
          className={[
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            tab === 'figure' ? 'border-sky-500 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300',
          ].join(' ')}
        >
          Choose a Figure
        </button>
      </div>

      {tab === 'custom' ? <CustomCharacterForm /> : <FigureGallery />}
    </div>
  );
}
