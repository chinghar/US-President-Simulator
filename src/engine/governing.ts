import { BALANCE } from '../data/balance';
import { BILLS } from '../data/bills';
import { CABINET_APPOINTEES } from '../data/cabinet';
import { EVENTS } from '../data/events';
import { EXECUTIVE_ORDERS } from '../data/executive-orders';
import { HEADLINE_TEMPLATES, type HeadlineFraming } from '../data/media-templates';
import { PERSONAS } from '../data/personas';
import { STAKEHOLDER_DEFINITIONS } from '../data/stakeholders';
import { dateToMonthIndex } from './date';
import { createInitialGeneralState } from './general';
import { createInitialPrimaryState } from './primary';
import { advanceMonth } from './reducer';
import { computeNationalApproval } from './support';
import { RngCursor } from './rng';
import {
  clamp,
  PERSONA_IDS,
  type Bill,
  type CabinetAppointment,
  type CabinetPositionId,
  type CongressComposition,
  type CrisisEvent,
  type CrisisRecord,
  type Decision,
  type EconomyEffects,
  type ExecutiveOrderRecord,
  type GameState,
  type GoverningState,
  type Headline,
  type LegislationRecord,
  type PersonaId,
  type StakeholderId,
  type StakeholderState,
} from './types';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function createInitialCongress(): CongressComposition {
  const g = BALANCE.governing;
  return {
    houseDem: g.INITIAL_HOUSE_DEM,
    houseRep: g.INITIAL_HOUSE_REP,
    houseInd: g.INITIAL_HOUSE_IND,
    senateDem: g.INITIAL_SENATE_DEM,
    senateRep: g.INITIAL_SENATE_REP,
    senateInd: g.INITIAL_SENATE_IND,
  };
}

export function createInitialGoverningState() {
  return {
    congress: createInitialCongress(),
    cabinet: {},
    legislationHistory: [],
    executiveOrderHistory: [],
    crisisHistory: [],
    triggeredEventIds: [],
    headlines: [],
    midtermsCompleted: false,
    reelection: null,
  };
}

// ---------------------------------------------------------------------------
// Congress vote math
// ---------------------------------------------------------------------------

/** -1 (progressive-coded) .. +1 (conservative-coded) reading of a decision's
 * overall lean. Prefers axisEffects; falls back to personaEffects direction
 * (weighted by each named persona's partyLean) when a decision has none. */
export function weightedDecisionLean(decision: Decision): number {
  if (decision.axisEffects && Object.keys(decision.axisEffects).length > 0) {
    const values = Object.values(decision.axisEffects) as number[];
    const sum = values.reduce((a, b) => a + b, 0);
    return clamp(sum / (values.length * 100), -1, 1);
  }
  // Fallback: infer lean from who the decision helps/hurts and their partyLean.
  // Helping a Republican-leaning persona (or hurting a Democratic-leaning one)
  // reads as conservative-coded, and vice versa.
  let weighted = 0;
  let total = 0;
  for (const [personaId, magnitude] of Object.entries(decision.personaEffects) as [PersonaId, number][]) {
    const partyLean = PERSONAS[personaId].partyLean;
    weighted += magnitude * partyLean;
    total += Math.abs(magnitude) * 100;
  }
  if (total === 0) return 0;
  return clamp(weighted / total, -1, 1);
}

function caucusVoteProbability(
  decision: Decision,
  party: 'dem' | 'rep',
  relationship: number,
  concessionLevel: number,
  capitalSpent: number,
): number {
  const b = BALANCE.governing;
  const lean = weightedDecisionLean(decision); // -1 (progressive) .. +1 (conservative)
  const partyAlignment = party === 'dem' ? -lean : lean; // how well the bill matches this party's typical lean
  const relationshipTerm = relationship / 100;
  const concessionBonus = (1 - concessionLevel) * b.VOTE_CONCESSION_BONUS_MAX;
  const capitalBonus = clamp(capitalSpent / 100, 0, 1) * b.VOTE_CAPITAL_BONUS_MAX;
  const probability =
    b.VOTE_BASE_PROBABILITY + partyAlignment * b.VOTE_ALIGNMENT_WEIGHT + relationshipTerm * b.VOTE_RELATIONSHIP_WEIGHT + concessionBonus + capitalBonus;
  return clamp(probability, 0.05, 0.95);
}

export interface ChamberVoteResult {
  passed: boolean;
  yesVotes: number;
  neededVotes: number;
  totalVotes: number;
}

function resolveChamberVote(
  decision: Decision,
  chamber: 'house' | 'senate',
  congress: CongressComposition,
  stakeholders: Record<StakeholderId, StakeholderState>,
  concessionLevel: number,
  capitalSpent: number,
  needsSixty: boolean,
  cursor: RngCursor,
): ChamberVoteResult {
  const b = BALANCE.governing;
  const demSeats = chamber === 'house' ? congress.houseDem : congress.senateDem;
  const repSeats = chamber === 'house' ? congress.houseRep : congress.senateRep;
  const indSeats = chamber === 'house' ? congress.houseInd : congress.senateInd;
  const totalVotes = demSeats + repSeats + indSeats;

  const demRelationship = stakeholders[chamber === 'house' ? 'house_dem_caucus' : 'senate_dem_caucus'].relationship;
  const repRelationship = stakeholders[chamber === 'house' ? 'house_rep_caucus' : 'senate_rep_caucus'].relationship;

  const demProb = caucusVoteProbability(decision, 'dem', demRelationship, concessionLevel, capitalSpent);
  const repProb = caucusVoteProbability(decision, 'rep', repRelationship, concessionLevel, capitalSpent);

  const expectedYes = demSeats * demProb + repSeats * repProb + indSeats * 0.5;
  const noise = cursor.centered(b.VOTE_NOISE_MAGNITUDE) * totalVotes;
  const yesVotes = Math.round(clamp(expectedYes + noise, 0, totalVotes));

  const neededVotes = chamber === 'house' ? b.HOUSE_MAJORITY : needsSixty ? b.SENATE_FILIBUSTER_PROOF : b.SENATE_MAJORITY;

  return { passed: yesVotes >= neededVotes, yesVotes, neededVotes, totalVotes };
}

export interface BillVoteResult {
  house: ChamberVoteResult;
  senate: ChamberVoteResult;
  passed: boolean;
}

export function resolveBillVote(
  bill: Bill,
  scaledDecision: Decision,
  congress: CongressComposition,
  stakeholders: Record<StakeholderId, StakeholderState>,
  concessionLevel: number,
  capitalSpent: number,
  cursor: RngCursor,
): BillVoteResult {
  const house = resolveChamberVote(scaledDecision, 'house', congress, stakeholders, concessionLevel, capitalSpent, false, cursor);
  if (!house.passed) {
    return { house, senate: { passed: false, yesVotes: 0, neededVotes: 0, totalVotes: 0 }, passed: false };
  }
  const senate = resolveChamberVote(scaledDecision, 'senate', congress, stakeholders, concessionLevel, capitalSpent, bill.requiresFilibusterProof, cursor);
  return { house, senate, passed: senate.passed };
}

export interface ChamberWhipCount {
  expectedYes: number;
  neededVotes: number;
  totalVotes: number;
  /** Rough odds of clearing this chamber, as a 0..100 percent — for display only. */
  oddsPercent: number;
}

export interface BillWhipCount {
  house: ChamberWhipCount;
  senate: ChamberWhipCount;
}

function previewChamberOdds(
  decision: Decision,
  chamber: 'house' | 'senate',
  congress: CongressComposition,
  stakeholders: Record<StakeholderId, StakeholderState>,
  concessionLevel: number,
  capitalSpent: number,
  needsSixty: boolean,
): ChamberWhipCount {
  const b = BALANCE.governing;
  const demSeats = chamber === 'house' ? congress.houseDem : congress.senateDem;
  const repSeats = chamber === 'house' ? congress.houseRep : congress.senateRep;
  const indSeats = chamber === 'house' ? congress.houseInd : congress.senateInd;
  const totalVotes = demSeats + repSeats + indSeats;

  const demRelationship = stakeholders[chamber === 'house' ? 'house_dem_caucus' : 'senate_dem_caucus'].relationship;
  const repRelationship = stakeholders[chamber === 'house' ? 'house_rep_caucus' : 'senate_rep_caucus'].relationship;
  const demProb = caucusVoteProbability(decision, 'dem', demRelationship, concessionLevel, capitalSpent);
  const repProb = caucusVoteProbability(decision, 'rep', repRelationship, concessionLevel, capitalSpent);
  const expectedYes = demSeats * demProb + repSeats * repProb + indSeats * 0.5;
  const neededVotes = chamber === 'house' ? b.HOUSE_MAJORITY : needsSixty ? b.SENATE_FILIBUSTER_PROOF : b.SENATE_MAJORITY;

  // Odds modeled as a smooth logistic curve around the margin, scaled by the
  // same noise magnitude the real vote roll uses — a whip count, not a promise.
  const margin = (expectedYes - neededVotes) / (totalVotes * b.VOTE_NOISE_MAGNITUDE * 2);
  const oddsPercent = clamp(50 + margin * 50, 2, 98);

  return { expectedYes: Math.round(expectedYes), neededVotes, totalVotes, oddsPercent };
}

/** Whip-count preview for a bill, using the SAME probability model the real
 * vote uses (minus the RNG roll) — an honest expected-value estimate, not a
 * guarantee, for the UI to show before the player commits political capital. */
export function previewBillWhipCount(
  bill: Bill,
  scaledDecision: Decision,
  congress: CongressComposition,
  stakeholders: Record<StakeholderId, StakeholderState>,
  concessionLevel: number,
  capitalSpent: number,
): BillWhipCount {
  return {
    house: previewChamberOdds(scaledDecision, 'house', congress, stakeholders, concessionLevel, capitalSpent, false),
    senate: previewChamberOdds(scaledDecision, 'senate', congress, stakeholders, concessionLevel, capitalSpent, bill.requiresFilibusterProof),
  };
}

// ---------------------------------------------------------------------------
// Court challenges
// ---------------------------------------------------------------------------

export function rollCourtChallenge(constitutionalRisk: number, stakeholders: Record<StakeholderId, StakeholderState>, cursor: RngCursor): boolean {
  const courtHostility = -stakeholders.supreme_court.relationship / 100; // -1 (friendly) .. +1 (hostile)
  const effectiveRisk = clamp(constitutionalRisk + courtHostility * 15, 0, 100);
  return cursor.next() * 100 < effectiveRisk;
}

// ---------------------------------------------------------------------------
// Concessions
// ---------------------------------------------------------------------------

function scaleRecord<T extends Record<string, number | undefined>>(record: T | undefined, factor: number): T | undefined {
  if (!record) return record;
  const scaled = {} as T;
  for (const key of Object.keys(record) as (keyof T)[]) {
    const value = record[key];
    scaled[key] = (value === undefined ? undefined : (value as number) * factor) as T[keyof T];
  }
  return scaled;
}

/** A watered-down bill (low concessionLevel) keeps only a fraction of its
 * punch — MIN_CONCESSION_EFFECT_STRENGTH at concessionLevel 0, full strength
 * at concessionLevel 1 — trading impact for a better shot at passing. */
export function scaleDecisionByConcession(decision: Decision, concessionLevel: number): Decision {
  const floor = BALANCE.governing.MIN_CONCESSION_EFFECT_STRENGTH;
  const factor = floor + (1 - floor) * clamp(concessionLevel, 0, 1);
  return {
    ...decision,
    axisEffects: scaleRecord(decision.axisEffects, factor),
    personaEffects: scaleRecord(decision.personaEffects, factor) ?? decision.personaEffects,
    stakeholderEffects: scaleRecord(decision.stakeholderEffects, factor),
    economyEffects: scaleRecord(decision.economyEffects as Record<string, number | undefined> | undefined, factor) as EconomyEffects | undefined,
  };
}

// ---------------------------------------------------------------------------
// Crisis events
// ---------------------------------------------------------------------------

function meetsPrerequisites(event: CrisisEvent, gameState: GameState, appliedDecisionIds: Set<string>): boolean {
  const p = event.prerequisites;
  if (p.minUnemployment !== undefined && gameState.economy.unemployment < p.minUnemployment) return false;
  if (p.maxUnemployment !== undefined && gameState.economy.unemployment > p.maxUnemployment) return false;
  const approval = computeNationalApproval(gameState);
  if (p.minApproval !== undefined && approval < p.minApproval) return false;
  if (p.maxApproval !== undefined && approval > p.maxApproval) return false;
  if (p.requiresPriorDecisionIds && !p.requiresPriorDecisionIds.every((id) => appliedDecisionIds.has(id))) return false;
  return true;
}

function getAppliedDecisionIds(gameState: GameState): Set<string> {
  const ids = new Set<string>();
  const governing = gameState.governing;
  if (!governing) return ids;
  for (const record of governing.legislationHistory) if (record.status === 'passed') ids.add(record.billId);
  for (const record of governing.executiveOrderHistory) if (!record.courtStruckDown) ids.add(record.orderId);
  return ids;
}

/** Crisis-event categories excluded from real-candidate playthroughs because
 * they're about the officeholder's (or an appointee's) personal conduct
 * rather than a governmental/external event — see data/real-candidates.ts. */
const PERSONAL_CONDUCT_CATEGORIES: CrisisEvent['category'][] = ['scandal'];

function eligibleEvents(gameState: GameState): CrisisEvent[] {
  const governing = gameState.governing;
  if (!governing) return [];
  const appliedIds = getAppliedDecisionIds(gameState);
  return EVENTS.filter((event) => {
    if (gameState.isRealCandidateMode && PERSONAL_CONDUCT_CATEGORIES.includes(event.category)) return false;
    if (!event.repeatable && governing.triggeredEventIds.includes(event.id)) return false;
    return meetsPrerequisites(event, gameState, appliedIds);
  });
}

/** Deterministically selects this month's crisis events from a temporary
 * cursor over gameState.rngState (not yet persisted). Calling this as a
 * "preview" before the player acts and again inside advanceGoverningTurn
 * is guaranteed to select the same events, as long as it remains the very
 * first RNG consumer in the turn. */
export function getPendingCrisisEvents(gameState: GameState): CrisisEvent[] {
  const cursor = new RngCursor(gameState.rngState);
  return selectMonthlyEventsWithCursor(gameState, cursor);
}

function selectMonthlyEventsWithCursor(gameState: GameState, cursor: RngCursor): CrisisEvent[] {
  const b = BALANCE.governing;
  const pool = eligibleEvents(gameState);
  const selected: CrisisEvent[] = [];
  const remaining = [...pool];

  for (let i = 0; i < b.MAX_EVENTS_PER_MONTH && remaining.length > 0; i++) {
    if (cursor.next() > b.EVENT_TRIGGER_CHANCE) break;
    const totalWeight = remaining.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeight <= 0) break;
    let roll = cursor.next() * totalWeight;
    let pickIndex = 0;
    for (let j = 0; j < remaining.length; j++) {
      roll -= remaining[j].weight;
      if (roll <= 0) {
        pickIndex = j;
        break;
      }
    }
    selected.push(remaining[pickIndex]);
    remaining.splice(pickIndex, 1);
  }

  return selected;
}

// ---------------------------------------------------------------------------
// Cabinet
// ---------------------------------------------------------------------------

export interface CabinetAppointmentResult {
  appointment: CabinetAppointment;
  decision: Decision | null;
}

export function resolveCabinetAppointment(
  positionId: CabinetPositionId,
  appointeeId: string,
  congress: CongressComposition,
  cursor: RngCursor,
  monthIndex: number,
): CabinetAppointmentResult {
  const appointee = CABINET_APPOINTEES.find((a) => a.id === appointeeId)!;
  const b = BALANCE.governing;

  // Confirmation follows the same shape as a Senate vote: the appointee's
  // ideology stands in for "the bill," scored against each party's caucus.
  const demProb = clamp(
    b.VOTE_BASE_PROBABILITY - (appointee.ideology / b.CONFIRMATION_IDEOLOGY_SCALE) * b.VOTE_ALIGNMENT_WEIGHT,
    0.05,
    0.95,
  );
  const repProb = clamp(
    b.VOTE_BASE_PROBABILITY + (appointee.ideology / b.CONFIRMATION_IDEOLOGY_SCALE) * b.VOTE_ALIGNMENT_WEIGHT,
    0.05,
    0.95,
  );
  const expectedYes = congress.senateDem * demProb + congress.senateRep * repProb + congress.senateInd * 0.5;
  const totalVotes = congress.senateDem + congress.senateRep + congress.senateInd;
  const noise = cursor.centered(b.VOTE_NOISE_MAGNITUDE) * totalVotes;
  const yesVotes = Math.round(clamp(expectedYes + noise, 0, totalVotes));
  const confirmed = yesVotes >= b.SENATE_MAJORITY;

  const decision: Decision | null = confirmed
    ? {
        id: `cabinet_${appointee.id}`,
        label: `${appointee.name} Confirmed as ${positionId.replace(/_/g, ' ')}`,
        description: appointee.bio,
        personaEffects: appointee.personaEffects ?? {},
        stakeholderEffects: appointee.stakeholderEffects,
      }
    : null;

  return {
    appointment: { positionId, appointeeId, confirmed, monthAppointed: monthIndex },
    decision,
  };
}

/** Only Treasury's competence produces an ongoing ambient economic effect —
 * a modest, continuous nudge rather than a one-time appointment bonus. */
export function ambientCabinetEconomyEffects(cabinet: GoverningState['cabinet']): EconomyEffects {
  const treasury = cabinet.treasury;
  if (!treasury?.confirmed) return {};
  const appointee = CABINET_APPOINTEES.find((a) => a.id === treasury.appointeeId);
  if (!appointee) return {};
  return { gdpGrowth: (appointee.competence - 50) * BALANCE.governing.TREASURY_COMPETENCE_GDP_FACTOR };
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

const MEDIA_OUTLET_IDS: StakeholderId[] = ['media_progressive', 'media_lean_left', 'media_lean_right', 'media_conservative'];

function pickTemplate(framing: HeadlineFraming, cursor: RngCursor): string {
  const templates = HEADLINE_TEMPLATES[framing];
  const index = Math.floor(cursor.next() * templates.length);
  return templates[Math.min(index, templates.length - 1)];
}

export function generateHeadlines(
  gameState: GameState,
  notableDecisionLabel: string | null,
  cursor: RngCursor,
): Headline[] {
  const b = BALANCE.governing;
  return MEDIA_OUTLET_IDS.map((outletId) => {
    const relationship = gameState.stakeholders[outletId].relationship;
    const framing: HeadlineFraming =
      !notableDecisionLabel
        ? 'quiet'
        : relationship > b.HEADLINE_RELATIONSHIP_THRESHOLD
          ? 'positive'
          : relationship < -b.HEADLINE_RELATIONSHIP_THRESHOLD
            ? 'negative'
            : 'neutral';
    const template = pickTemplate(framing, cursor);
    const text = notableDecisionLabel ? template.replace('{decision}', notableDecisionLabel) : template;
    return { outletId, date: gameState.date, text, framing: framing === 'quiet' ? 'neutral' : framing };
  });
}

export interface HeadlineEffect {
  personaId: PersonaId;
  magnitude: number;
  sourceLabel: string;
}

/** Headlines shift persona opinion independent of the underlying policy —
 * personas who trust an outlet (their partyLean sign matches the outlet's
 * editorial lean) pick up a small, decaying effect matching that outlet's
 * framing this month, scaled by how strongly they lean that way. */
export function headlinesToEffects(headlines: Headline[], outletLeans: Record<string, number>): HeadlineEffect[] {
  const magnitude = BALANCE.governing.HEADLINE_MAGNITUDE;
  const effects: HeadlineEffect[] = [];
  for (const headline of headlines) {
    if (headline.framing === 'neutral') continue;
    const outletLean = outletLeans[headline.outletId] ?? 0;
    if (outletLean === 0) continue;
    const direction = headline.framing === 'positive' ? 1 : -1;
    for (const personaId of PERSONA_IDS) {
      const persona = PERSONAS[personaId];
      const trustsOutlet = Math.sign(persona.partyLean) === Math.sign(outletLean);
      if (!trustsOutlet) continue;
      const strength = Math.min(1, Math.abs(persona.partyLean) / 60);
      effects.push({ personaId, magnitude: direction * magnitude * strength, sourceLabel: headline.text });
    }
  }
  return effects;
}

// ---------------------------------------------------------------------------
// Midterms
// ---------------------------------------------------------------------------

/** Nov 2030: seats swing toward whichever party the president is NOT,
 * scaled by how far national approval sits from 50. */
export function resolveMidterms(gameState: GameState, congress: CongressComposition): CongressComposition {
  const approval = computeNationalApproval(gameState);
  const swing = (50 - approval) * BALANCE.governing.MIDTERM_SWING_PER_APPROVAL_POINT;
  const presidentIsDem = gameState.player.party === 'democrat';
  // Positive `swing` (low approval) moves seats away from the president's party.
  const houseSwing = Math.round(clamp(swing, -60, 60));
  const senateSwing = Math.round(clamp(swing / 5, -12, 12));

  function applySwing(demSeats: number, repSeats: number, total: number, swingAmount: number) {
    let dem = demSeats;
    let rep = repSeats;
    if (presidentIsDem) {
      dem = clamp(dem - swingAmount, 0, total);
      rep = total - dem;
    } else {
      rep = clamp(rep - swingAmount, 0, total);
      dem = total - rep;
    }
    return { dem, rep };
  }

  const house = applySwing(congress.houseDem, congress.houseRep, congress.houseDem + congress.houseRep, houseSwing);
  const senate = applySwing(congress.senateDem, congress.senateRep, congress.senateDem + congress.senateRep, senateSwing);

  return {
    houseDem: house.dem,
    houseRep: house.rep,
    houseInd: congress.houseInd,
    senateDem: senate.dem,
    senateRep: senate.rep,
    senateInd: congress.senateInd,
  };
}

// ---------------------------------------------------------------------------
// Monthly orchestration
// ---------------------------------------------------------------------------

export interface AdvanceGoverningTurnInput {
  cabinetAppointment?: { positionId: CabinetPositionId; appointeeId: string };
  proposedBill?: { billId: string; concessionLevel: number; capitalSpent: number };
  executiveOrder?: { orderId: string };
  /** eventId -> chosen option id, for every event returned by getPendingCrisisEvents this month. */
  crisisResponses: Record<string, string>;
}

const MIDTERM_DATE = { month: 11, year: 2030 };
const REELECTION_TRIGGER_DATE = { month: 1, year: 2032 };

/**
 * Advances the governing loop by one month: resolves this month's crisis
 * events, cabinet appointment, bill, and executive order (all funneled
 * through the same Decision shape and the existing Phase-1 advanceMonth
 * reducer), then layers on governing-only bookkeeping — legislation/EO
 * history, media headlines, midterms, and the 2032 re-election trigger.
 */
export function advanceGoverningTurn(gameState: GameState, input: AdvanceGoverningTurnInput): GameState {
  const governing = gameState.governing;
  if (!governing) throw new Error('advanceGoverningTurn called without an active governing state.');

  const cursor = new RngCursor(gameState.rngState);

  // 0. The 2032 re-election trigger takes over the whole turn: no cabinet/
  // bill/EO/crisis actions happen this month, just the handoff to a fresh
  // primary-challenge or general-election cycle.
  if (gameState.date.month === REELECTION_TRIGGER_DATE.month && gameState.date.year === REELECTION_TRIGGER_DATE.year && !governing.reelection) {
    return triggerReelection(gameState, governing, cursor);
  }

  // 1. This month's crisis events (must be the very first RNG draw, matching getPendingCrisisEvents).
  const pendingEvents = selectMonthlyEventsWithCursor(gameState, cursor);

  const decisions: Decision[] = [];
  const crisisHistory: CrisisRecord[] = [...governing.crisisHistory];
  const triggeredEventIds = [...governing.triggeredEventIds];
  let notableLabel: string | null = null;

  for (const event of pendingEvents) {
    const chosenId = input.crisisResponses[event.id];
    const option = event.options.find((o) => o.id === chosenId) ?? event.options[0];
    decisions.push(option);
    crisisHistory.push({ eventId: event.id, title: event.title, date: gameState.date, chosenOptionId: option.id });
    if (!event.repeatable) triggeredEventIds.push(event.id);
    notableLabel = event.title;
  }

  // 2. Cabinet appointment.
  let cabinet = { ...governing.cabinet };
  if (input.cabinetAppointment) {
    const { positionId, appointeeId } = input.cabinetAppointment;
    const result = resolveCabinetAppointment(positionId, appointeeId, governing.congress, cursor, gameState.monthIndex);
    cabinet = { ...cabinet, [positionId]: result.appointment };
    if (result.decision) {
      decisions.push(result.decision);
      notableLabel = result.decision.label;
    }
  }

  // 3. Legislation.
  const legislationHistory: LegislationRecord[] = [...governing.legislationHistory];
  if (input.proposedBill) {
    const bill = BILLS.find((b) => b.id === input.proposedBill!.billId);
    if (bill) {
      const { concessionLevel, capitalSpent } = input.proposedBill;
      const scaled = scaleDecisionByConcession(bill, concessionLevel);
      const totalCost = (bill.cost?.politicalCapital ?? 0) + capitalSpent;
      decisions.push({ id: `${bill.id}_effort`, label: `Push for ${bill.label}`, description: '', personaEffects: {}, cost: { politicalCapital: totalCost } });

      const vote = resolveBillVote(bill, scaled, governing.congress, gameState.stakeholders, concessionLevel, capitalSpent, cursor);
      let status: LegislationRecord['status'] = vote.passed ? 'passed' : !vote.house.passed ? 'failed_house' : 'failed_senate';

      if (vote.passed) {
        const struckDown = rollCourtChallenge(bill.constitutionalRisk, gameState.stakeholders, cursor);
        if (struckDown) {
          status = 'struck_down';
        } else {
          decisions.push({ ...scaled, cost: undefined });
          notableLabel = bill.label;
        }
      }
      legislationHistory.push({ billId: bill.id, title: bill.label, date: gameState.date, concessionLevel, status });
    }
  }

  // 4. Executive order.
  const executiveOrderHistory: ExecutiveOrderRecord[] = [...governing.executiveOrderHistory];
  if (input.executiveOrder) {
    const order = EXECUTIVE_ORDERS.find((o) => o.id === input.executiveOrder!.orderId);
    if (order) {
      decisions.push({ id: `${order.id}_signing`, label: `Sign ${order.label}`, description: '', personaEffects: {}, cost: order.cost });
      const struckDown = rollCourtChallenge(order.constitutionalRisk, gameState.stakeholders, cursor);
      if (!struckDown) {
        decisions.push({ ...order, cost: undefined });
        notableLabel = order.label;
      }
      executiveOrderHistory.push({ orderId: order.id, title: order.label, date: gameState.date, courtStruckDown: struckDown });
    }
  }

  // 5. Ambient cabinet economy effect (Treasury competence).
  const ambientEconomy = ambientCabinetEconomyEffects(cabinet);
  if (ambientEconomy.gdpGrowth) {
    decisions.push({ id: 'ambient_treasury', label: 'Treasury Stewardship', description: '', personaEffects: {}, economyEffects: ambientEconomy });
  }

  // 6. Apply everything through the same reducer as every other phase.
  const stateAfterDecisions = advanceMonth({ ...gameState, rngState: cursor.seed }, decisions);

  // 7. Media headlines, generated from the same cursor sequence (continues
  // from stateAfterDecisions.rngState so the whole turn stays one RNG thread).
  const headlineCursor = new RngCursor(stateAfterDecisions.rngState);
  const headlines = generateHeadlines(gameState, notableLabel, headlineCursor);
  const outletLeans: Record<string, number> = {};
  for (const outletId of ['media_progressive', 'media_lean_left', 'media_lean_right', 'media_conservative'] as StakeholderId[]) {
    outletLeans[outletId] = STAKEHOLDER_DEFINITIONS[outletId].mediaLean ?? 0;
  }
  const headlineEffects = headlinesToEffects(headlines, outletLeans);
  const headlineMemory = headlineEffects.map((effect, i) => ({
    id: `headline:${stateAfterDecisions.monthIndex}:${i}`,
    sourceLabel: effect.sourceLabel,
    appliedMonth: stateAfterDecisions.monthIndex,
    personaId: effect.personaId,
    magnitude: effect.magnitude,
  }));

  // 8. Midterms (Nov 2030).
  let congress = governing.congress;
  let midtermsCompleted = governing.midtermsCompleted;
  if (!midtermsCompleted && gameState.date.month === MIDTERM_DATE.month && gameState.date.year === MIDTERM_DATE.year) {
    congress = resolveMidterms(stateAfterDecisions, governing.congress);
    midtermsCompleted = true;
  }

  const nextGoverning: GoverningState = {
    congress,
    cabinet,
    legislationHistory,
    executiveOrderHistory,
    crisisHistory,
    triggeredEventIds,
    headlines: [...governing.headlines, ...headlines],
    midtermsCompleted,
    reelection: governing.reelection,
  };

  return {
    ...stateAfterDecisions,
    rngState: headlineCursor.seed,
    memory: [...stateAfterDecisions.memory, ...headlineMemory],
    governing: nextGoverning,
  };
}

// ---------------------------------------------------------------------------
// Re-election (2032)
// ---------------------------------------------------------------------------

function triggerReelection(gameState: GameState, governing: GoverningState, cursor: RngCursor): GameState {
  const b = BALANCE.governing;
  const isPartisan = gameState.player.party !== 'independent';
  const recentApprovals = gameState.history.slice(-6).map((h) => h.nationalApproval);
  const trailingApproval = recentApprovals.length > 0 ? recentApprovals.reduce((a, c) => a + c, 0) / recentApprovals.length : 50;
  const challengeRisk = isPartisan && trailingApproval < b.PRIMARY_CHALLENGE_APPROVAL_THRESHOLD;
  const challengeTriggered = challengeRisk && cursor.next() < b.PRIMARY_CHALLENGE_BASE_CHANCE;

  if (challengeTriggered) {
    const primary = createInitialPrimaryState(gameState.player, gameState.positions)!;
    return {
      ...gameState,
      phase: 'primary',
      rngState: cursor.seed,
      primary,
      governing: { ...governing, reelection: { primary, general: null, outcome: null } },
    };
  }

  const general = createInitialGeneralState(gameState.player, gameState.positions);
  const date = { month: 9, year: REELECTION_TRIGGER_DATE.year };
  return {
    ...gameState,
    phase: 'general',
    date,
    monthIndex: dateToMonthIndex(date),
    rngState: cursor.seed,
    general,
    governing: { ...governing, reelection: { primary: null, general, outcome: null } },
  };
}
