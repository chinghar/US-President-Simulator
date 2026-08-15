import { createInitialStakeholderStates } from '../data/stakeholders';
import { dateToMonthIndex } from './date';
import { createInitialEconomy } from './economy';
import { createInitialGeneralState } from './general';
import { createInitialGoverningState } from './governing';
import { createInitialPrimaryState } from './primary';
import { ISSUE_AXES, type AxisPositions, type GameDate, type GamePhase, type GameState, type PlayerCharacter } from './types';

function neutralPositions(): AxisPositions {
  const positions = {} as AxisPositions;
  for (const axis of ISSUE_AXES) positions[axis] = 0;
  return positions;
}

export function createDefaultPlayer(overrides: Partial<PlayerCharacter> = {}): PlayerCharacter {
  return {
    name: 'Alex Morgan',
    age: 52,
    homeState: 'OH',
    party: 'democrat',
    priorOffice: 'governor',
    traits: ['policy_wonk'],
    nameRecognition: 30,
    warChest: 5_000_000,
    partyEstablishmentFavor: 0,
    baseEnthusiasm: 50,
    ...overrides,
  };
}

export interface CreateInitialGameStateOptions {
  seed?: number;
  player?: Partial<PlayerCharacter>;
  positions?: Partial<AxisPositions>;
  startDate?: GameDate;
  isRealCandidateMode?: boolean;
}

export function createInitialGameState(options: CreateInitialGameStateOptions = {}): GameState {
  const player = createDefaultPlayer(options.player);
  const positions = { ...neutralPositions(), ...options.positions };
  const primary = createInitialPrimaryState(player, positions);
  // Independent candidates have no party primary to contest; they skip
  // straight to the Sep 2028 start of the general election (Phase 4).
  const phase: GamePhase = primary ? 'primary' : 'general';
  const general = primary ? null : createInitialGeneralState(player, positions);
  const defaultDate: GameDate = primary ? { month: 1, year: 2028 } : { month: 9, year: 2028 };

  return {
    date: options.startDate ?? defaultDate,
    monthIndex: primary ? 0 : 8,
    phase,
    rngState: options.seed ?? 1,
    player,
    positions,
    economy: createInitialEconomy(),
    treasury: 0,
    politicalCapital: 50,
    stakeholders: createInitialStakeholderStates(),
    memory: [],
    history: [],
    primary,
    general,
    governing: null,
    isRealCandidateMode: options.isRealCandidateMode,
  };
}

/**
 * Skips the primary and general campaigns entirely and drops the player
 * straight into the Oval Office — same starting conditions (Congress
 * composition, treasury, political capital, economy) a campaign winner
 * would have on their first day, January of the election year. No VP: the
 * VP's persona bonus is a general-election-only mechanic (see general.ts),
 * so it has no governing-phase effect and there's nothing to pick.
 */
export function createInitialGoverningGameState(options: CreateInitialGameStateOptions = {}): GameState {
  const player = createDefaultPlayer(options.player);
  const positions = { ...neutralPositions(), ...options.positions };
  const date: GameDate = options.startDate ?? { month: 1, year: 2029 };

  return {
    date,
    monthIndex: dateToMonthIndex(date),
    phase: 'governing',
    rngState: options.seed ?? 1,
    player,
    positions,
    economy: createInitialEconomy(),
    treasury: 0,
    politicalCapital: 50,
    stakeholders: createInitialStakeholderStates(),
    memory: [],
    history: [],
    primary: null,
    general: null,
    governing: createInitialGoverningState(),
    isRealCandidateMode: options.isRealCandidateMode,
  };
}
