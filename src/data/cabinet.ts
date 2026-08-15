import type { CabinetAppointeeDef, CabinetPositionId } from '../engine/types';

export const CABINET_POSITION_INFO: Record<CabinetPositionId, { name: string; description: string }> = {
  treasury: { name: 'Secretary of the Treasury', description: 'Economic policy, tax administration, and financial regulation.' },
  state: { name: 'Secretary of State', description: 'Diplomacy and foreign relations.' },
  defense: { name: 'Secretary of Defense', description: 'Military policy and national defense.' },
  justice: { name: 'Attorney General', description: 'Federal law enforcement and legal policy.' },
  health: { name: 'Secretary of Health and Human Services', description: 'Healthcare policy and public health.' },
  homeland_security: { name: 'Secretary of Homeland Security', description: 'Border security and domestic security policy.' },
  education: { name: 'Secretary of Education', description: 'Federal education policy.' },
  energy: { name: 'Secretary of Energy', description: 'Energy policy and production.' },
};

/**
 * 3 fictional candidates per position, each a three-way trade-off:
 *  - competence buffs their domain's ongoing ambient effect while serving.
 *  - ideology drives Senate confirmation odds (see resolveCabinetAppointment
 *    in engine/governing.ts) — the further from 0, the harder to confirm.
 *  - loyalty scales how much of that competence actually lands: a highly
 *    competent-but-disloyal appointee under-delivers (or actively drags),
 *    while a loyal-but-weak one reliably delivers a small, faithful effect
 *    in whatever direction their competence points (see
 *    ambientCabinetEffects in engine/governing.ts). Career civil servants,
 *    technocrats, and military/administrative figures skew loyal;
 *    ideological advocates and industry-tied picks skew less so.
 */
export const CABINET_APPOINTEES: CabinetAppointeeDef[] = [
  // Treasury
  { id: 'laura_kessler', name: 'Laura Kessler', position: 'treasury', bio: 'Center-left labor economist and former state budget director.', competence: 80, ideology: -30, loyalty: 65, stakeholderEffects: { business_lobby: -5, labor_unions: 8 }, personaEffects: { union_households: 4, small_business_owners: -3 } },
  { id: 'derek_song', name: 'Derek Song', position: 'treasury', bio: 'Former investment bank executive known for deregulation advocacy.', competence: 75, ideology: 40, loyalty: 55, stakeholderEffects: { business_lobby: 8, labor_unions: -5 }, personaEffects: { small_business_owners: 4, union_households: -3 } },
  { id: 'patricia_vance', name: 'Patricia Vance', position: 'treasury', bio: 'Career civil servant and budget technocrat.', competence: 60, ideology: 0, loyalty: 80, stakeholderEffects: { donor_class: 5 }, personaEffects: { seniors: 3 } },

  // State
  { id: 'robert_chen', name: 'Robert Chen', position: 'state', bio: 'Veteran career diplomat with deep alliance-building experience.', competence: 85, ideology: -10, loyalty: 78, stakeholderEffects: { foreign_bloc_allies: 8, foreign_bloc_rivals: -3 } },
  { id: 'miriam_sato', name: 'Miriam Sato', position: 'state', bio: 'Former trade negotiator focused on nonaligned-bloc relations.', competence: 70, ideology: 20, loyalty: 65, stakeholderEffects: { foreign_bloc_allies: 4, foreign_bloc_nonaligned: 5 } },
  { id: 'gerald_fitch', name: 'Gerald Fitch', position: 'state', bio: 'Hawkish former ambassador known for a hard line on rivals.', competence: 55, ideology: 45, loyalty: 45, stakeholderEffects: { foreign_bloc_rivals: -10, foreign_bloc_allies: 6 }, personaEffects: { military_veteran_households: 4 } },

  // Defense
  { id: 'paul_okafor', name: 'General Paul Okafor (Ret.)', position: 'defense', bio: 'Decorated retired four-star general.', competence: 82, ideology: 30, loyalty: 82, stakeholderEffects: { foreign_bloc_rivals: -5 }, personaEffects: { military_veteran_households: 8, young_progressives: -4 } },
  { id: 'denise_alvarado', name: 'Denise Alvarado', position: 'defense', bio: 'Reform-minded former Pentagon policy chief.', competence: 68, ideology: -15, loyalty: 58, personaEffects: { young_progressives: 4, military_veteran_households: -3 } },
  { id: 'harold_kim', name: 'Harold Kim', position: 'defense', bio: 'Defense-industry veteran and hawkish policy hand.', competence: 60, ideology: 55, loyalty: 50, personaEffects: { military_veteran_households: 6, urban_professionals: -4 } },

  // Justice
  { id: 'angela_ruiz', name: 'Angela Ruiz', position: 'justice', bio: 'Reform-minded former prosecutor and civil-rights attorney.', competence: 78, ideology: -35, loyalty: 55, personaEffects: { black_voters: 7, evangelical_conservatives: -5 } },
  { id: 'thomas_whitmore', name: 'Thomas Whitmore', position: 'justice', bio: 'Law-and-order former state attorney general.', competence: 72, ideology: 40, loyalty: 60, personaEffects: { suburban_parents: 5, black_voters: -6 } },
  { id: 'naomi_feldman', name: 'Naomi Feldman', position: 'justice', bio: 'Appellate judge known for a cautious, centrist record.', competence: 65, ideology: -10, loyalty: 75, personaEffects: { urban_professionals: 3 } },

  // Health
  { id: 'susan_ortiz', name: 'Dr. Susan Ortiz', position: 'health', bio: 'Public-health physician and Medicare-expansion advocate.', competence: 88, ideology: -25, loyalty: 55, personaEffects: { seniors: 6, small_business_owners: -4 } },
  { id: 'mark_delaney', name: 'Dr. Mark Delaney', position: 'health', bio: 'Health-insurance executive turned market-based reform advocate.', competence: 70, ideology: 30, loyalty: 55, personaEffects: { small_business_owners: 5, seniors: -3 } },
  { id: 'priya_chandra', name: 'Dr. Priya Chandra', position: 'health', bio: 'Research hospital administrator focused on access and affordability.', competence: 75, ideology: -10, loyalty: 72, personaEffects: { college_students: 4 } },

  // Homeland Security
  { id: 'james_kowalski', name: 'James Kowalski', position: 'homeland_security', bio: 'Former border-patrol chief known for enforcement priorities.', competence: 74, ideology: 35, loyalty: 75, personaEffects: { rural_working_class: 5, hispanic_voters: -5 } },
  { id: 'carla_nunez_rivera', name: 'Carla Nunez-Rivera', position: 'homeland_security', bio: 'Former ICE ombudsman focused on humane enforcement reform.', competence: 68, ideology: -20, loyalty: 58, personaEffects: { hispanic_voters: 6, rural_working_class: -4 } },
  { id: 'frank_delgado', name: 'Frank Delgado', position: 'homeland_security', bio: 'Cybersecurity-focused former state emergency-management director.', competence: 60, ideology: 10, loyalty: 78, personaEffects: { exurban_swing_voters: 3 } },

  // Education
  { id: 'ellen_marsh', name: 'Dr. Ellen Marsh', position: 'education', bio: 'Former teachers-union president and public-school advocate.', competence: 76, ideology: -30, loyalty: 55, personaEffects: { union_households: 5, small_business_owners: -3 } },
  { id: 'ryan_holt', name: 'Ryan Holt', position: 'education', bio: 'School-choice advocate and former charter-network founder.', competence: 65, ideology: 40, loyalty: 50, personaEffects: { evangelical_conservatives: 4, urban_professionals: -4 } },
  { id: 'vivian_choi', name: 'Dr. Vivian Choi', position: 'education', bio: 'University administrator known for a centrist, data-driven record.', competence: 82, ideology: -5, loyalty: 78, personaEffects: { suburban_parents: 4 } },

  // Energy
  { id: 'alan_frost', name: 'Dr. Alan Frost', position: 'energy', bio: 'Clean-energy researcher and grid-modernization advocate.', competence: 80, ideology: -40, loyalty: 55, personaEffects: { young_progressives: 6, rural_working_class: -5 } },
  { id: 'rebecca_stanton', name: 'Rebecca Stanton', position: 'energy', bio: 'Energy-independence advocate with deep industry ties.', competence: 70, ideology: 35, loyalty: 52, personaEffects: { rural_working_class: 5, young_progressives: -5 } },
  { id: 'marcus_webb_jr', name: 'Marcus Webb Jr.', position: 'energy', bio: 'Utility-regulation veteran known for a pragmatic, all-of-the-above record.', competence: 62, ideology: 0, loyalty: 75, personaEffects: { small_business_owners: 3 } },
];

export function getCabinetCandidates(position: CabinetPositionId): CabinetAppointeeDef[] {
  return CABINET_APPOINTEES.filter((a) => a.position === position);
}
