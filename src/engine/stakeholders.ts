import { BALANCE } from '../data/balance';
import { clamp, STAKEHOLDER_IDS, type Decision, type StakeholderId, type StakeholderState } from './types';

/** Applies each decision's stakeholderEffects, then lets every relationship
 * drift a small step back toward neutral (0) — stakeholders don't hold a
 * grudge, or a favor, forever without renewed cause. */
export function advanceStakeholders(
  stakeholders: Record<StakeholderId, StakeholderState>,
  decisions: Decision[],
): Record<StakeholderId, StakeholderState> {
  const drift = BALANCE.stakeholders.DRIFT_TOWARD_NEUTRAL;
  const next = {} as Record<StakeholderId, StakeholderState>;

  for (const id of STAKEHOLDER_IDS) {
    let relationship = stakeholders[id].relationship;
    for (const decision of decisions) {
      const effect = decision.stakeholderEffects?.[id];
      if (effect !== undefined) relationship += effect;
    }
    relationship += drift * (0 - relationship);
    next[id] = { id, relationship: clamp(relationship, -100, 100) };
  }

  return next;
}
