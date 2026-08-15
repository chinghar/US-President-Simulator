import type { VpCandidate } from '../engine/types';

/**
 * A running-mate pool. Each pick balances the ticket toward a different
 * region and coalition via a flat, position-independent persona bonus — the
 * same mechanism traits use for things like War Hero's veteran bonus.
 */
export const VP_CANDIDATES: VpCandidate[] = [
  {
    id: 'marcus_webb',
    name: 'Marcus Webb',
    bio: 'Two-term Texas governor known for courting rural and small-business voters.',
    homeState: 'TX',
    traits: ['machine_politician', 'conciliator'],
    personaBonus: { rural_working_class: 7, small_business_owners: 6 },
  },
  {
    id: 'diane_cho',
    name: 'Diane Cho',
    bio: 'California senator and former tech-policy attorney with a strong following among young, urban voters.',
    homeState: 'CA',
    traits: ['policy_wonk', 'media_savvy'],
    personaBonus: { urban_professionals: 7, young_progressives: 6 },
  },
  {
    id: 'reggie_holt',
    name: 'Reggie Holt',
    bio: 'Longtime Ohio mayor and former union organizer, a fixture of Rust Belt Democratic politics.',
    homeState: 'OH',
    traits: ['charismatic', 'debater'],
    personaBonus: { union_households: 8, black_voters: 5 },
  },
  {
    id: 'ana_cortez',
    name: 'Ana Cortez',
    bio: 'Retired Army general and Arizona-born veterans advocate.',
    homeState: 'AZ',
    traits: ['war_hero', 'debater'],
    personaBonus: { military_veteran_households: 8, hispanic_voters: 6 },
  },
  {
    id: 'tom_whitfield',
    name: 'Tom Whitfield',
    bio: 'Suburban Philadelphia-area governor known for winning over persuadable independents.',
    homeState: 'PA',
    traits: ['conciliator', 'fundraiser'],
    personaBonus: { exurban_swing_voters: 7, suburban_parents: 6 },
  },
  {
    id: 'faith_okoye',
    name: 'Faith Okoye',
    bio: 'Georgia senator and former pastor with deep ties to the state’s faith community.',
    homeState: 'GA',
    traits: ['charismatic', 'conciliator'],
    personaBonus: { black_voters: 6, evangelical_conservatives: 5 },
  },
  {
    id: 'hank_callahan',
    name: 'Hank Callahan',
    bio: 'Florida business owner and retiree-community favorite known for his town-hall stamina.',
    homeState: 'FL',
    traits: ['fundraiser', 'media_savvy'],
    personaBonus: { seniors: 7, small_business_owners: 5 },
  },
  {
    id: 'julia_byrne',
    name: 'Julia Byrne',
    bio: 'Michigan representative who built a reputation defending manufacturing jobs.',
    homeState: 'MI',
    traits: ['debater', 'machine_politician'],
    personaBonus: { suburban_parents: 6, union_households: 6 },
  },
];
