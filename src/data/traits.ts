import { TRAIT_IDS, type TraitDefinition, type TraitId } from '../engine/types';

/** Each trait carries a real trade-off — a pure upside trait would make trait
 * selection a solved problem instead of a choice. */
export const TRAITS: Record<TraitId, TraitDefinition> = {
  charismatic: {
    id: 'charismatic',
    name: 'Charismatic',
    description: 'A natural on the stump. Boosts name recognition, base enthusiasm, and debate performance.',
    modifiers: { nameRecognitionBonus: 8, baseEnthusiasmBonus: 10, debateScoreBonus: 5 },
  },
  policy_wonk: {
    id: 'policy_wonk',
    name: 'Policy Wonk',
    description: "Command of the details sharpens debate answers and halves the authenticity cost of shifting a position — you can show your work.",
    modifiers: { debateScoreBonus: 3, authenticityCostMultiplier: 0.5 },
  },
  fundraiser: {
    id: 'fundraiser',
    name: 'Fundraiser',
    description: 'A rolodex of major donors. Larger starting war chest and more effective fundraising throughout the campaign.',
    modifiers: { warChestMultiplier: 1.3, fundraisingMultiplier: 1.5 },
  },
  debater: {
    id: 'debater',
    name: 'Debater',
    description: 'Sharp and quick on the debate stage.',
    modifiers: { debateScoreBonus: 10 },
  },
  outsider: {
    id: 'outsider',
    name: 'Outsider',
    description: "Untainted by Washington — energizes anti-establishment voters, but the party establishment doesn't trust you.",
    modifiers: {
      partyEstablishmentFavorBonus: -20,
      baseEnthusiasmBonus: 15,
      personaBonus: { libertarian_independents: 5, rural_working_class: 5 },
    },
  },
  machine_politician: {
    id: 'machine_politician',
    name: 'Machine Politician',
    description: 'Decades of favors owed. Strong party establishment favor and fundraising access, at some cost to grassroots energy.',
    modifiers: { partyEstablishmentFavorBonus: 20, warChestMultiplier: 1.15, baseEnthusiasmBonus: -5 },
  },
  war_hero: {
    id: 'war_hero',
    name: 'War Hero',
    description: 'Decorated service record. Deep, position-independent credibility with military/veteran households and seniors.',
    modifiers: { nameRecognitionBonus: 5, personaBonus: { military_veteran_households: 12, seniors: 4 } },
  },
  media_savvy: {
    id: 'media_savvy',
    name: 'Media Savvy',
    description: 'Knows how to work a newsroom. Builds media relationships faster and gets more out of every ad dollar.',
    modifiers: { mediaRelationshipMultiplier: 1.5, adEffectivenessMultiplier: 1.2 },
  },
  scandal_prone: {
    id: 'scandal_prone',
    name: 'Scandal-Prone',
    description: 'A colorful past. The notoriety raises name recognition, but doubles the odds a skeleton makes headlines.',
    modifiers: { nameRecognitionBonus: 5, scandalRiskMultiplier: 2.0 },
  },
  conciliator: {
    id: 'conciliator',
    name: 'Conciliator',
    description: 'A bridge-builder. Wins over persuadable swing voters and stakeholders, but attack ads land softer in your hands.',
    modifiers: {
      adEffectivenessMultiplier: 0.8,
      personaBonus: { suburban_parents: 3, exurban_swing_voters: 3 },
    },
  },
};

export const TRAIT_LIST: TraitDefinition[] = TRAIT_IDS.map((id) => TRAITS[id]);
