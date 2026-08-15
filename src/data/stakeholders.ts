import { STAKEHOLDER_IDS, type StakeholderDefinition, type StakeholderId, type StakeholderState } from '../engine/types';

export const STAKEHOLDER_DEFINITIONS: Record<StakeholderId, StakeholderDefinition> = {
  house_dem_caucus: { id: 'house_dem_caucus', name: 'House Democratic Caucus', type: 'congress' },
  house_rep_caucus: { id: 'house_rep_caucus', name: 'House Republican Caucus', type: 'congress' },
  senate_dem_caucus: { id: 'senate_dem_caucus', name: 'Senate Democratic Caucus', type: 'congress' },
  senate_rep_caucus: { id: 'senate_rep_caucus', name: 'Senate Republican Caucus', type: 'congress' },
  supreme_court: { id: 'supreme_court', name: 'Supreme Court', type: 'judiciary' },
  party_establishment: { id: 'party_establishment', name: "Player's Party Establishment", type: 'party' },
  donor_class: { id: 'donor_class', name: 'Donor Class', type: 'donor' },
  labor_unions: { id: 'labor_unions', name: 'Major Unions', type: 'labor' },
  business_lobby: { id: 'business_lobby', name: 'Business Lobby', type: 'business' },
  media_progressive: { id: 'media_progressive', name: 'The Daily Ledger', type: 'media', mediaLean: -70 },
  media_lean_left: { id: 'media_lean_left', name: 'National Herald', type: 'media', mediaLean: -30 },
  media_lean_right: { id: 'media_lean_right', name: 'Liberty Wire', type: 'media', mediaLean: 30 },
  media_conservative: { id: 'media_conservative', name: 'Patriot Broadcast', type: 'media', mediaLean: 70 },
  foreign_bloc_allies: { id: 'foreign_bloc_allies', name: 'Atlantic Allies', type: 'foreign' },
  foreign_bloc_rivals: { id: 'foreign_bloc_rivals', name: 'Eastern Coalition', type: 'foreign' },
  foreign_bloc_nonaligned: { id: 'foreign_bloc_nonaligned', name: 'Nonaligned Bloc', type: 'foreign' },
};

export const STAKEHOLDER_LIST: StakeholderDefinition[] = STAKEHOLDER_IDS.map((id) => STAKEHOLDER_DEFINITIONS[id]);

export function createInitialStakeholderStates(): Record<StakeholderId, StakeholderState> {
  const result = {} as Record<StakeholderId, StakeholderState>;
  for (const id of STAKEHOLDER_IDS) {
    result[id] = { id, relationship: 0 };
  }
  return result;
}
