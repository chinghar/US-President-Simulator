import { BALANCE } from '../data/balance';
import { GENERAL_EVENTS } from '../data/general-events';
import { PERSONAS } from '../data/personas';
import { POLL_CLOSING_ORDER } from '../data/electoral-order';
import { PRIMARY_RIVALS } from '../data/primary-rivals';
import { STATES, STATE_LIST } from '../data/states';
import { aggregateTraitModifiers } from './character';
import { advanceEconomy } from './economy';
import { advanceGameDate, dateToMonthIndex } from './date';
import { RngCursor } from './rng';
import {
  clamp,
  ISSUE_AXES,
  PERSONA_IDS,
  type AxisPositions,
  type DebateAnswerOption,
  type DebateEvent,
  type ElectionNightResult,
  type GameState,
  type GeneralActionType,
  type GeneralCandidate,
  type GeneralState,
  type GeneralStateResult,
  type IssueAxisId,
  type Party,
  type PersonaId,
  type PlayerCharacter,
  type PollResult,
  type StateId,
  type VpCandidate,
} from './types';

export const PLAYER_GENERAL_ID = 'player';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function otherParties(playerParty: Party): ('democrat' | 'republican')[] {
  if (playerParty === 'democrat') return ['republican'];
  if (playerParty === 'republican') return ['democrat'];
  return ['democrat', 'republican'];
}

/** The single axis where `positions` most disagrees with the electorate,
 * weighted by salience — a local copy of primary.ts's identical helper
 * (duplicated rather than imported to avoid a primary.ts <-> general.ts
 * circular dependency, since primary.ts already imports from general.ts). */
function findWeakestAxis(positions: AxisPositions, electorateWeights: Partial<Record<PersonaId, number>>): IssueAxisId {
  let worstAxis: IssueAxisId = ISSUE_AXES[0];
  let worstScore = -Infinity;
  for (const axis of ISSUE_AXES) {
    let weighted = 0;
    for (const personaId of PERSONA_IDS) {
      const w = electorateWeights[personaId] ?? 0;
      if (w === 0) continue;
      const persona = PERSONAS[personaId];
      weighted += w * persona.salience[axis] * Math.abs(positions[axis] - persona.basePosition[axis]);
    }
    if (weighted > worstScore) {
      worstScore = weighted;
      worstAxis = axis;
    }
  }
  return worstAxis;
}

/** The "frontrunner" of a party's rival pool (highest name recognition)
 * becomes that party's general-election nominee — a deterministic stand-in
 * for a primary the player didn't watch. Their position on the player's
 * single weakest issue is pushed to the opposite extreme, so every general
 * election opponent is "shaped by the player's weakest issue," not just a
 * re-election challenger. */
function nomineeFromParty(party: 'democrat' | 'republican', playerPositions: AxisPositions): GeneralCandidate {
  const rivals = PRIMARY_RIVALS[party];
  const nominee = rivals.reduce((best, r) => (r.nameRecognition > best.nameRecognition ? r : best), rivals[0]);
  const weakestAxis = findWeakestAxis(playerPositions, nationalGeneralElectorateWeights());
  const shapedPositions: AxisPositions = {
    ...nominee.positions,
    [weakestAxis]: clamp(-Math.sign(playerPositions[weakestAxis] || 1) * 80, -100, 100),
  };
  return {
    id: `${party}_nominee`,
    name: nominee.name,
    isPlayer: false,
    party,
    positions: shapedPositions,
    traits: nominee.traits,
    nameRecognition: nominee.nameRecognition,
    warChest: nominee.warChest,
    momentum: 0,
  };
}

export function createInitialGeneralState(player: PlayerCharacter, positions: AxisPositions): GeneralState {
  const playerCandidate: GeneralCandidate = {
    id: PLAYER_GENERAL_ID,
    name: player.name,
    isPlayer: true,
    party: player.party,
    positions,
    traits: player.traits,
    nameRecognition: player.nameRecognition,
    warChest: player.warChest,
    momentum: 0,
  };
  const opponents = otherParties(player.party).map((party) => nomineeFromParty(party, positions));

  return {
    candidates: [playerCandidate, ...opponents],
    vp: null,
    polls: [],
    debatesCompleted: [],
    electionResult: null,
    playerWon: null,
  };
}

export function selectRunningMate(generalState: GeneralState, vp: VpCandidate): GeneralState {
  return { ...generalState, vp };
}

export const SWING_STATES: StateId[] = [...STATE_LIST]
  .sort((a, b) => Math.abs(a.partisanBaseline) - Math.abs(b.partisanBaseline))
  .slice(0, BALANCE.general.SWING_STATE_COUNT)
  .map((s) => s.id);

// ---------------------------------------------------------------------------
// Electorate & alignment
// ---------------------------------------------------------------------------

/** The general electorate is everyone in the state, weighted only by
 * turnout — no party filter, unlike the primary electorate. */
export function generalElectorateWeights(stateId: StateId): Partial<Record<PersonaId, number>> {
  const state = STATES[stateId];
  const weights: Partial<Record<PersonaId, number>> = {};
  let total = 0;
  for (const personaId of PERSONA_IDS) {
    const weight = state.personaComposition[personaId] * PERSONAS[personaId].turnoutPropensity;
    weights[personaId] = weight;
    total += weight;
  }
  if (total > 0) for (const id of PERSONA_IDS) weights[id] = (weights[id] ?? 0) / total;
  return weights;
}

export function nationalGeneralElectorateWeights(): Partial<Record<PersonaId, number>> {
  const weights: Partial<Record<PersonaId, number>> = {};
  for (const id of PERSONA_IDS) weights[id] = 0;
  for (const state of STATE_LIST) {
    const stateWeights = generalElectorateWeights(state.id);
    for (const id of PERSONA_IDS) weights[id] = (weights[id] ?? 0) + state.popWeight * (stateWeights[id] ?? 0);
  }
  const total = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
  if (total > 0) for (const id of PERSONA_IDS) weights[id] = (weights[id] ?? 0) / total;
  return weights;
}

function vpBonus(candidate: GeneralCandidate, generalState: GeneralState, personaId: PersonaId): number {
  if (!candidate.isPlayer || !generalState.vp) return 0;
  const bonus = generalState.vp.personaBonus[personaId] ?? 0;
  return clamp(bonus, -BALANCE.general.VP_BONUS_CAP, BALANCE.general.VP_BONUS_CAP);
}

export function candidateGeneralAlignmentScore(
  positions: AxisPositions,
  electorateWeights: Partial<Record<PersonaId, number>>,
): number {
  let score = 0;
  for (const personaId of PERSONA_IDS) {
    const w = electorateWeights[personaId] ?? 0;
    if (w === 0) continue;
    const persona = PERSONAS[personaId];
    let weightedDistance = 0;
    let salienceSum = 0;
    for (const axis of ISSUE_AXES) {
      weightedDistance += persona.salience[axis] * Math.abs(positions[axis] - persona.basePosition[axis]);
      salienceSum += persona.salience[axis];
    }
    const normalizedDistance = salienceSum > 0 ? weightedDistance / salienceSum : 100;
    const alignment = clamp(1 - normalizedDistance / BALANCE.general.IDEOLOGY_DISTANCE_NORM, 0, 1);
    score += w * alignment;
  }
  return score * 100;
}

function nameRecognitionFactor(nameRecognition: number): number {
  const { NAME_RECOGNITION_FLOOR, NAME_RECOGNITION_CEILING } = BALANCE.general;
  return NAME_RECOGNITION_FLOOR + (NAME_RECOGNITION_CEILING - NAME_RECOGNITION_FLOOR) * (nameRecognition / 100);
}

// ---------------------------------------------------------------------------
// State-by-state resolution (election night)
// ---------------------------------------------------------------------------

function resolveGeneralState(
  stateId: StateId,
  candidates: GeneralCandidate[],
  generalState: GeneralState,
  actionsByCandidateId: Record<string, GeneralActionType[]>,
  cursor: RngCursor,
): GeneralStateResult {
  const electorateWeights = generalElectorateWeights(stateId);
  const campaignBoost: Record<string, number> = {};
  const adBoost: Record<string, number> = {};
  const attackPenalty: Record<string, number> = {};

  for (const [candidateId, actions] of Object.entries(actionsByCandidateId)) {
    for (const action of actions) {
      if (action.kind === 'campaign' && action.stateId === stateId) {
        campaignBoost[candidateId] = (campaignBoost[candidateId] ?? 0) + BALANCE.general.INVESTMENT_BOOST_PER_ACTION;
      }
      if (action.kind === 'ad_positive' && action.stateId === stateId) {
        adBoost[candidateId] = (adBoost[candidateId] ?? 0) + BALANCE.general.AD_BOOST_PER_ACTION;
      }
      if (action.kind === 'ad_attack' && action.stateId === stateId) {
        attackPenalty[action.targetId] = (attackPenalty[action.targetId] ?? 0) + BALANCE.general.AD_BOOST_PER_ACTION;
      }
    }
  }

  const rawScores: Record<string, number> = {};
  for (const candidate of candidates) {
    const alignment =
      candidateGeneralAlignmentScore(candidate.positions, electorateWeights) +
      PERSONA_IDS.reduce((sum, id) => sum + (electorateWeights[id] ?? 0) * vpBonus(candidate, generalState, id), 0);
    const investment =
      1 + (campaignBoost[candidate.id] ?? 0) + (adBoost[candidate.id] ?? 0) - (attackPenalty[candidate.id] ?? 0);
    const momentumFactor = 1 + candidate.momentum / 100;
    const noise = 1 + cursor.centered(0.06);
    rawScores[candidate.id] = Math.max(
      0.5,
      alignment * Math.max(0.2, investment) * Math.max(0.3, momentumFactor) * nameRecognitionFactor(candidate.nameRecognition) * noise,
    );
  }

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const voteShare: Record<string, number> = {};
  for (const id in rawScores) voteShare[id] = total > 0 ? (rawScores[id] / total) * 100 : 0;

  const winnerId = candidates.reduce((bestId, c) => (voteShare[c.id] > (voteShare[bestId] ?? -1) ? c.id : bestId), candidates[0].id);

  return { stateId, voteShare, winnerId, electoralVotes: STATES[stateId].electoralVotes };
}

export function resolveElectionNight(
  candidates: GeneralCandidate[],
  generalState: GeneralState,
  actionsByCandidateId: Record<string, GeneralActionType[]>,
  cursor: RngCursor,
): ElectionNightResult {
  const stateResults = POLL_CLOSING_ORDER.map((stateId) =>
    resolveGeneralState(stateId, candidates, generalState, actionsByCandidateId, cursor),
  );

  const finalElectoralVotes: Record<string, number> = {};
  for (const c of candidates) finalElectoralVotes[c.id] = 0;
  for (const result of stateResults) {
    finalElectoralVotes[result.winnerId] = (finalElectoralVotes[result.winnerId] ?? 0) + result.electoralVotes;
  }

  const winnerId = candidates.reduce(
    (bestId, c) => (finalElectoralVotes[c.id] > (finalElectoralVotes[bestId] ?? -1) ? c.id : bestId),
    candidates[0].id,
  );

  return { stateResults, finalElectoralVotes, winnerId };
}

export interface StateProjection {
  stateId: StateId;
  leaderId: string;
  /** 0..100, the leader's projected share — a rough "if the election were held today" snapshot. */
  margin: number;
}

/** A snapshot projection per state — alignment + momentum + name recognition
 * only, no campaign investment and no RNG noise — used purely for the
 * "current standing" map shown mid-campaign. Election night itself uses the
 * fuller resolveGeneralState/resolveElectionNight, not this. */
export function previewStateStandings(candidates: GeneralCandidate[], generalState: GeneralState): StateProjection[] {
  return STATE_LIST.map((state) => {
    const electorateWeights = generalElectorateWeights(state.id);
    const scores = candidates.map((c) => {
      const alignment =
        candidateGeneralAlignmentScore(c.positions, electorateWeights) +
        PERSONA_IDS.reduce((sum, id) => sum + (electorateWeights[id] ?? 0) * vpBonus(c, generalState, id), 0);
      const momentumFactor = 1 + c.momentum / 100;
      const score = Math.max(0.5, alignment * Math.max(0.3, momentumFactor) * nameRecognitionFactor(c.nameRecognition));
      return { id: c.id, score };
    });
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    const leader = scores.reduce((best, s) => (s.score > best.score ? s : best), scores[0]);
    return { stateId: state.id, leaderId: leader.id, margin: total > 0 ? (leader.score / total) * 100 : 50 };
  });
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

export function computeGeneralPoll(
  candidates: GeneralCandidate[],
  generalState: GeneralState,
  date: GameState['date'],
  cursor: RngCursor,
): PollResult {
  const weights = nationalGeneralElectorateWeights();
  const trueScores: Record<string, number> = {};
  for (const c of candidates) {
    const alignment =
      candidateGeneralAlignmentScore(c.positions, weights) +
      PERSONA_IDS.reduce((sum, id) => sum + (weights[id] ?? 0) * vpBonus(c, generalState, id), 0);
    const momentumFactor = 1 + c.momentum / 150;
    trueScores[c.id] = Math.max(0.1, alignment * nameRecognitionFactor(c.nameRecognition) * Math.max(0.3, momentumFactor));
  }
  const total = Object.values(trueScores).reduce((a, b) => a + b, 0);

  const trueShare: Record<string, number> = {};
  const reportedShare: Record<string, number> = {};
  for (const c of candidates) {
    const share = total > 0 ? (trueScores[c.id] / total) * 100 : 0;
    trueShare[c.id] = share;
    reportedShare[c.id] = clamp(share + cursor.centered(BALANCE.general.POLL_NOISE_MAGNITUDE), 0, 100);
  }
  return { date, trueShare, reportedShare };
}

// ---------------------------------------------------------------------------
// Debates / October surprise
// ---------------------------------------------------------------------------

/** Matches by month only (not year) so the same debate calendar drives both
 * the original 2028 general election and a Phase 5 re-election general. */
export function getScheduledGeneralEvents(month: number, _year: number): DebateEvent[] {
  return GENERAL_EVENTS.filter((e) => e.month === month);
}

export function applyGeneralDebateAnswer(candidate: GeneralCandidate, answer: DebateAnswerOption): GeneralCandidate {
  let positions = candidate.positions;
  if (answer.axisEffects) {
    positions = { ...positions };
    for (const axis of ISSUE_AXES) {
      const delta = answer.axisEffects[axis as IssueAxisId];
      if (delta !== undefined) positions[axis as IssueAxisId] = clamp(positions[axis as IssueAxisId] + delta, -100, 100);
    }
  }
  const traitMods = aggregateTraitModifiers(candidate.traits);
  const momentum = clamp(candidate.momentum + answer.debateScoreDelta + traitMods.debateScoreBonus * 0.3, -100, 100);
  return { ...candidate, positions, momentum };
}

export function chooseOpponentDebateAnswer(opponent: GeneralCandidate, event: DebateEvent): DebateAnswerOption {
  const traitMods = aggregateTraitModifiers(opponent.traits);
  return event.answers.reduce((best, answer) =>
    answer.debateScoreDelta + traitMods.debateScoreBonus * 0.1 > best.debateScoreDelta + traitMods.debateScoreBonus * 0.1
      ? answer
      : best,
  );
}

// ---------------------------------------------------------------------------
// Opponent AI
// ---------------------------------------------------------------------------

function chooseOpponentActions(opponent: GeneralCandidate, budget: number): GeneralActionType[] {
  const topSwingStates = SWING_STATES.slice(0, Math.max(1, budget - 1));
  const actions: GeneralActionType[] = topSwingStates.map((stateId) => ({ kind: 'campaign', stateId }));
  if (actions.length < budget && opponent.warChest > BALANCE.general.AD_COST) {
    actions.push({ kind: 'ad_attack', stateId: topSwingStates[0], targetId: PLAYER_GENERAL_ID });
  }
  return actions.slice(0, budget);
}

// ---------------------------------------------------------------------------
// Immediate (non-election-night) action effects
// ---------------------------------------------------------------------------

function applyImmediateActionEffects(candidate: GeneralCandidate, actions: GeneralActionType[]): GeneralCandidate {
  let next = { ...candidate };
  const traitMods = aggregateTraitModifiers(candidate.traits);

  for (const action of actions) {
    switch (action.kind) {
      case 'fundraise':
        next.warChest += BALANCE.general.FUNDRAISE_BASE_AMOUNT * traitMods.fundraisingMultiplier;
        break;
      case 'interview':
        next.nameRecognition = clamp(next.nameRecognition + BALANCE.general.INTERVIEW_NAME_RECOGNITION_GAIN, 0, 100);
        break;
      case 'ad_positive':
      case 'ad_attack':
        next.warChest -= BALANCE.general.AD_COST;
        break;
      case 'debate_prep':
        next.momentum = clamp(next.momentum + BALANCE.general.DEBATE_PREP_MOMENTUM_BONUS, -100, 100);
        break;
      case 'campaign':
        break;
    }
  }
  return next;
}

// ---------------------------------------------------------------------------
// Monthly orchestration
// ---------------------------------------------------------------------------

export interface AdvanceGeneralTurnInput {
  playerActions: GeneralActionType[];
  /** eventId -> chosen answerId, for every event scheduled this month. */
  eventAnswers?: Record<string, string>;
}

const GENERAL_END_MONTH = 11;

/**
 * Advances the general-election campaign by one month. September and October
 * are pure campaigning (debates/October surprise, actions, polling); November
 * additionally resolves election night and, on a player win, hands off to
 * 'governing' the following January. Year-relative throughout so this same
 * function drives both the original 2028 race and a 2032 re-election.
 */
export function advanceGeneralTurn(gameState: GameState, input: AdvanceGeneralTurnInput): GameState {
  const general = gameState.general;
  if (!general) throw new Error('advanceGeneralTurn called without an active general election.');

  const cursor = new RngCursor(gameState.rngState);
  const { month, year } = gameState.date;
  const budget = BALANCE.general.ACTION_BUDGET_PER_MONTH;

  let candidates = [...general.candidates];

  // 1. Every event (debate/October surprise) scheduled this month.
  const eventsThisMonth = getScheduledGeneralEvents(month, year).filter((e) => !general.debatesCompleted.includes(e.id));
  const debatesCompleted = [...general.debatesCompleted];
  for (const event of eventsThisMonth) {
    const chosenAnswer = event.answers.find((a) => a.id === input.eventAnswers?.[event.id]) ?? event.answers[0];
    candidates = candidates.map((c) =>
      c.isPlayer ? applyGeneralDebateAnswer(c, chosenAnswer) : applyGeneralDebateAnswer(c, chooseOpponentDebateAnswer(c, event)),
    );
    debatesCompleted.push(event.id);
  }

  // 2. Gather actions.
  const actionsByCandidateId: Record<string, GeneralActionType[]> = {};
  actionsByCandidateId[PLAYER_GENERAL_ID] = input.playerActions.slice(0, budget);
  for (const candidate of candidates) {
    if (candidate.isPlayer) continue;
    actionsByCandidateId[candidate.id] = chooseOpponentActions(candidate, budget);
  }

  // 3. Apply immediate action effects.
  candidates = candidates.map((c) => applyImmediateActionEffects(c, actionsByCandidateId[c.id] ?? []));

  // 4. Momentum decay for the month.
  candidates = candidates.map((c) => ({ ...c, momentum: clamp(c.momentum * BALANCE.general.MOMENTUM_DECAY, -100, 100) }));

  // 5. Poll.
  const interimGeneral: GeneralState = { ...general, candidates, debatesCompleted };
  const poll = computeGeneralPoll(candidates, interimGeneral, gameState.date, cursor);
  const polls = [...general.polls, poll];

  // 6. Election night, only in November.
  let electionResult = general.electionResult;
  let playerWon = general.playerWon;
  if (month === GENERAL_END_MONTH && !electionResult) {
    electionResult = resolveElectionNight(candidates, interimGeneral, actionsByCandidateId, cursor);
    playerWon = electionResult.winnerId === PLAYER_GENERAL_ID;
  }

  const nextGeneral: GeneralState = { ...interimGeneral, polls, electionResult, playerWon };

  // 7. Sync player-facing GameState fields.
  const playerCandidate = candidates.find((c) => c.id === PLAYER_GENERAL_ID)!;
  const player: PlayerCharacter = {
    ...gameState.player,
    nameRecognition: playerCandidate.nameRecognition,
    warChest: playerCandidate.warChest,
  };

  // 8. Advance the shared clock.
  const economy = advanceEconomy(gameState.economy, {}, cursor);
  const wonAndTransitioning = playerWon === true;
  const phase = wonAndTransitioning ? 'governing' : gameState.phase;
  const date = wonAndTransitioning ? { month: 1, year: gameState.date.year + 1 } : advanceGameDate(gameState.date);
  const monthIndex = dateToMonthIndex(date);
  // A fresh win initializes governing state; a re-election win preserves the
  // existing one (cabinet, Congress, legislative history) unchanged. Built
  // inline (not imported from governing.ts) to avoid a circular dependency —
  // governing.ts already imports createInitialGeneralState from this file.
  const justDecided = electionResult !== null && general.electionResult === null;
  const governing =
    wonAndTransitioning && !gameState.governing
      ? {
          congress: {
            houseDem: BALANCE.governing.INITIAL_HOUSE_DEM,
            houseRep: BALANCE.governing.INITIAL_HOUSE_REP,
            houseInd: BALANCE.governing.INITIAL_HOUSE_IND,
            senateDem: BALANCE.governing.INITIAL_SENATE_DEM,
            senateRep: BALANCE.governing.INITIAL_SENATE_REP,
            senateInd: BALANCE.governing.INITIAL_SENATE_IND,
          },
          cabinet: {},
          legislationHistory: [],
          executiveOrderHistory: [],
          crisisHistory: [],
          triggeredEventIds: [],
          headlines: [],
          midtermsCompleted: false,
          reelection: null,
        }
      : gameState.governing && gameState.governing.reelection && justDecided
        ? {
            ...gameState.governing,
            reelection: {
              ...gameState.governing.reelection,
              general: nextGeneral,
              outcome: (playerWon ? 'reelected' : 'lost_general') as 'reelected' | 'lost_general',
            },
          }
        : gameState.governing;

  return {
    ...gameState,
    date,
    monthIndex,
    phase,
    rngState: cursor.seed,
    player,
    positions: playerCandidate.positions,
    economy,
    general: nextGeneral,
    governing,
  };
}
