import { useState } from 'react';
import { CharacterCreationScreen } from './ui/screens/CharacterCreationScreen';
import { ElectionNightScreen } from './ui/screens/ElectionNightScreen';
import { GeneralCampaignScreen } from './ui/screens/GeneralCampaignScreen';
import { GoverningDashboardScreen } from './ui/screens/GoverningDashboardScreen';
import { LegacyScreen } from './ui/screens/LegacyScreen';
import { PrimaryCampaignScreen } from './ui/screens/PrimaryCampaignScreen';
import { PrimaryPostMortemScreen } from './ui/screens/PrimaryPostMortemScreen';
import { VpSelectionScreen } from './ui/screens/VpSelectionScreen';
import { SaveLoadMenu } from './ui/components/SaveLoadMenu';
import { useTheme } from './ui/hooks/useTheme';
import { useGameStore } from './ui/state/gameStore';
import { AmericanFlag } from './ui/kit';

const CHROME_BUTTON = 'border border-rule bg-ink-900 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-paper/60 transition-colors duration-150 hover:border-brass hover:text-brass';

export default function App() {
  const game = useGameStore((s) => s.game);
  const electionNightAcknowledged = useGameStore((s) => s.electionNightAcknowledged);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-ink-900 text-paper">
      {/* The masthead — sits in normal flow above every screen, so it never
          floats over a screen's own top-left/top-right content. */}
      <header className="sticky top-0 z-40 bg-ink-900">
        <div className="flex items-center justify-between px-3 py-2">
          <AmericanFlag width={36} />
          <div className="flex gap-2">
            <button type="button" onClick={toggle} className={CHROME_BUTTON}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button type="button" onClick={() => setSaveMenuOpen(true)} className={CHROME_BUTTON}>
              Save / Load
            </button>
          </div>
        </div>
        {/* Old Glory, top edge — the one place stripes-as-decoration are allowed. */}
        <div className="flex h-1.5 w-full" aria-hidden="true">
          <div className="h-full flex-1 bg-flag" />
          <div className="h-full flex-1 bg-parchment" />
          <div className="h-full flex-1 bg-union" />
        </div>
      </header>

      {saveMenuOpen && <SaveLoadMenu onClose={() => setSaveMenuOpen(false)} />}
      {renderScreen()}
    </div>
  );

  function renderScreen() {
    if (!game) return <CharacterCreationScreen />;

    // phase 'primary' covers both the original 2028 primary and a 2032
    // re-election primary challenge — the exact same screens handle both.
    if (game.phase === 'primary') {
      if (game.primary?.playerEliminated) {
        if (game.governing && electionNightAcknowledged) return <LegacyScreen />;
        return <PrimaryPostMortemScreen />;
      }
      return <PrimaryCampaignScreen />;
    }

    // A win flips phase to 'governing' in the very same update that sets
    // electionResult, so this check must not require phase === 'general' —
    // by the time we'd check that, the win has already moved past it.
    if (game.general?.electionResult) {
      if (!electionNightAcknowledged) return <ElectionNightScreen />;
      if (game.general.playerWon === false) return <LegacyScreen />;
    }

    // phase 'general' likewise covers both election cycles.
    if (game.phase === 'general' && game.general && !game.general.electionResult) {
      if (!game.general.vp) return <VpSelectionScreen />;
      return <GeneralCampaignScreen />;
    }

    // phase 'governing': the 48-month loop, until a won re-election ends the term.
    if (game.governing) {
      if (game.governing.reelection?.outcome === 'reelected') return <LegacyScreen />;
      return <GoverningDashboardScreen />;
    }

    return <CharacterCreationScreen />;
  }
}
