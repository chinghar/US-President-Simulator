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
import { useGameStore } from './ui/state/gameStore';

export default function App() {
  const game = useGameStore((s) => s.game);
  const electionNightAcknowledged = useGameStore((s) => s.electionNightAcknowledged);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      <button
        type="button"
        onClick={() => setSaveMenuOpen(true)}
        className="fixed right-4 top-4 z-40 rounded-md border border-navy-700 bg-navy-900/90 px-3 py-1.5 text-xs text-slate-300 shadow-lg hover:border-sky-500 hover:text-sky-300"
      >
        Save / Load
      </button>
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
