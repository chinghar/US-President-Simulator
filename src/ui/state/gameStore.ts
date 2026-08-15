import { create } from 'zustand';
import { createCustomPlayer, createPlayerFromFigure, type CustomCharacterInput } from '../../engine/character';
import { advanceGeneralTurn, selectRunningMate, type AdvanceGeneralTurnInput } from '../../engine/general';
import { advanceGoverningTurn, type AdvanceGoverningTurnInput } from '../../engine/governing';
import { createInitialGameState, createInitialGoverningGameState } from '../../engine/initial-state';
import { advancePrimaryTurn, type AdvancePrimaryTurnInput } from '../../engine/primary';
import type { AxisPositions, Figure, GameState, VpCandidate } from '../../engine/types';

export type StartMode = 'campaign' | 'president';

interface GameStore {
  game: GameState | null;
  electionNightAcknowledged: boolean;
  startCustomGame: (input: CustomCharacterInput, positions: AxisPositions, mode?: StartMode) => void;
  startFigureGame: (figure: Figure, mode?: StartMode) => void;
  advancePrimary: (input: AdvancePrimaryTurnInput) => void;
  selectVp: (vp: VpCandidate) => void;
  advanceGeneral: (input: AdvanceGeneralTurnInput) => void;
  acknowledgeElectionNight: () => void;
  advanceGoverning: (input: AdvanceGoverningTurnInput) => void;
  loadGame: (game: GameState) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  electionNightAcknowledged: false,

  startCustomGame: (input, positions, mode = 'campaign') => {
    const player = createCustomPlayer(input);
    const seed = Date.now() & 0x7fffffff;
    const game =
      mode === 'president'
        ? createInitialGoverningGameState({ player, positions, seed })
        : createInitialGameState({ player, positions, seed });
    set({ game, electionNightAcknowledged: false });
  },

  startFigureGame: (figure, mode = 'campaign') => {
    const player = createPlayerFromFigure(figure);
    const seed = Date.now() & 0x7fffffff;
    const game =
      mode === 'president'
        ? createInitialGoverningGameState({ player, positions: figure.startingPositions, seed })
        : createInitialGameState({ player, positions: figure.startingPositions, seed });
    set({ game, electionNightAcknowledged: false });
  },

  advancePrimary: (input) => {
    const game = get().game;
    if (!game) return;
    set({ game: advancePrimaryTurn(game, input) });
  },

  selectVp: (vp) => {
    const game = get().game;
    if (!game || !game.general) return;
    set({ game: { ...game, general: selectRunningMate(game.general, vp) } });
  },

  advanceGeneral: (input) => {
    const game = get().game;
    if (!game) return;
    set({ game: advanceGeneralTurn(game, input) });
  },

  acknowledgeElectionNight: () => set({ electionNightAcknowledged: true }),

  advanceGoverning: (input) => {
    const game = get().game;
    if (!game) return;
    set({ game: advanceGoverningTurn(game, input), electionNightAcknowledged: false });
  },

  loadGame: (game) => set({ game, electionNightAcknowledged: false }),

  resetGame: () => set({ game: null, electionNightAcknowledged: false }),
}));
