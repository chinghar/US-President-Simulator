import { PRIOR_OFFICES } from '../data/prior-offices';
import { TRAITS } from '../data/traits';
import {
  clamp,
  type Figure,
  type Party,
  type PersonaId,
  type PlayerCharacter,
  type PriorOffice,
  type StartingStats,
  type StateId,
  type TraitId,
} from './types';

export interface AggregatedTraitModifiers {
  nameRecognitionBonus: number;
  warChestMultiplier: number;
  partyEstablishmentFavorBonus: number;
  baseEnthusiasmBonus: number;
  debateScoreBonus: number;
  fundraisingMultiplier: number;
  adEffectivenessMultiplier: number;
  authenticityCostMultiplier: number;
  scandalRiskMultiplier: number;
  mediaRelationshipMultiplier: number;
  personaBonus: Partial<Record<PersonaId, number>>;
}

const BONUS_FIELDS = [
  'nameRecognitionBonus',
  'partyEstablishmentFavorBonus',
  'baseEnthusiasmBonus',
  'debateScoreBonus',
] as const;

const MULTIPLIER_FIELDS = [
  'warChestMultiplier',
  'fundraisingMultiplier',
  'adEffectivenessMultiplier',
  'authenticityCostMultiplier',
  'scandalRiskMultiplier',
  'mediaRelationshipMultiplier',
] as const;

/** Generically sums/multiplies whatever modifier fields the selected traits'
 * data happens to set — this file never branches on a specific trait id, so
 * adding a 11th trait to data/traits.ts requires no change here. */
export function aggregateTraitModifiers(traitIds: TraitId[]): AggregatedTraitModifiers {
  const result: AggregatedTraitModifiers = {
    nameRecognitionBonus: 0,
    partyEstablishmentFavorBonus: 0,
    baseEnthusiasmBonus: 0,
    debateScoreBonus: 0,
    warChestMultiplier: 1,
    fundraisingMultiplier: 1,
    adEffectivenessMultiplier: 1,
    authenticityCostMultiplier: 1,
    scandalRiskMultiplier: 1,
    mediaRelationshipMultiplier: 1,
    personaBonus: {},
  };

  for (const traitId of traitIds) {
    const modifiers = TRAITS[traitId].modifiers;

    for (const field of BONUS_FIELDS) {
      const value = modifiers[field];
      if (value !== undefined) result[field] += value;
    }
    for (const field of MULTIPLIER_FIELDS) {
      const value = modifiers[field];
      if (value !== undefined) result[field] *= value;
    }
    if (modifiers.personaBonus) {
      for (const [personaId, bonus] of Object.entries(modifiers.personaBonus) as [PersonaId, number][]) {
        result.personaBonus[personaId] = (result.personaBonus[personaId] ?? 0) + bonus;
      }
    }
  }

  return result;
}

export function deriveStartingStats(priorOffice: PriorOffice, traitIds: TraitId[]): StartingStats {
  const base = PRIOR_OFFICES[priorOffice].baseStats;
  const mods = aggregateTraitModifiers(traitIds);
  return {
    nameRecognition: clamp(base.nameRecognition + mods.nameRecognitionBonus, 0, 100),
    warChest: Math.round(base.warChest * mods.warChestMultiplier),
    partyEstablishmentFavor: clamp(base.partyEstablishmentFavor + mods.partyEstablishmentFavorBonus, -100, 100),
    baseEnthusiasm: clamp(base.baseEnthusiasm + mods.baseEnthusiasmBonus, 0, 100),
  };
}

export interface CustomCharacterInput {
  name: string;
  age: number;
  homeState: StateId;
  party: Party;
  priorOffice: PriorOffice;
  traits: TraitId[];
}

export function createCustomPlayer(input: CustomCharacterInput): PlayerCharacter {
  if (input.traits.length !== 3) {
    throw new Error(`A candidate must have exactly 3 traits, got ${input.traits.length}.`);
  }
  const stats = deriveStartingStats(input.priorOffice, input.traits);
  return {
    name: input.name,
    age: input.age,
    homeState: input.homeState,
    party: input.party,
    priorOffice: input.priorOffice,
    traits: input.traits,
    ...stats,
  };
}

export function createPlayerFromFigure(figure: Figure): PlayerCharacter {
  return {
    name: figure.name,
    age: figure.age,
    homeState: figure.homeState,
    party: figure.party,
    priorOffice: figure.priorOffice,
    traits: figure.traits,
    nameRecognition: figure.nameRecognition,
    warChest: figure.warChest,
    partyEstablishmentFavor: figure.partyEstablishmentFavor,
    baseEnthusiasm: figure.baseEnthusiasm,
  };
}

/** Same starting stats for every real candidate, deliberately — ranking
 * real people's name recognition or war chest against one another would be
 * exactly the kind of subjective, unverified characterization the real-
 * candidate roster is designed to avoid. No traits either: see
 * data/real-candidates.ts. */
const REAL_CANDIDATE_STATS: StartingStats = {
  nameRecognition: 50,
  warChest: 5_000_000,
  partyEstablishmentFavor: 0,
  baseEnthusiasm: 50,
};

export function createPlayerFromRealCandidate(candidate: {
  name: string;
  age: number;
  homeState: StateId;
  party: Party;
  priorOffice: PriorOffice;
}): PlayerCharacter {
  return {
    name: candidate.name,
    age: candidate.age,
    homeState: candidate.homeState,
    party: candidate.party,
    priorOffice: candidate.priorOffice,
    traits: [],
    ...REAL_CANDIDATE_STATS,
  };
}
