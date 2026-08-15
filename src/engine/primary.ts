import { BALANCE } from '../data/balance';
import { DEBATES } from '../data/debates';
import { PERSONAS } from '../data/personas';
import { PRIMARY_CALENDAR } from '../data/primary-calendar';
import { PRIMARY_RIVALS } from '../data/primary-rivals';
import { STATES, STATE_LIST } from '../data/states';
import { aggregateTraitModifiers } from './character';
import { advanceEconomy } from './economy';
import { advanceGameDate, dateToMonthIndex } from './date';
import { createInitialGeneralState } from './general';
import { RngCursor } from './rng';
import {
  clamp,
  ISSUE_AXES,
  PERSONA_IDS,
  type AxisPositions,
  type ContestResult,
  type ContestStateResult,
  type DebateAnswerOption,
  type DebateEvent,
  type GameState,
  type IssueAxisId,
  type Party,
  type PersonaId,
  type PlayerCharacter,
  type PollResult,
  type PrimaryActionType,
  type PrimaryCandidate,
  type PrimaryContestDef,
  type PrimaryState,
  type StateId,
} from './types';

export const PLAYER_CANDIDATE_ID = 'player';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function getStateDelegateCount(stateId: StateId, totalDelegates: number): number {
  return Math.max(1, Math.round(STATES[stateId].popWeight * totalDelegates));
}

function createPlayerPrimaryCandidate(player: PlayerCharacter, positions: AxisPositions): PrimaryCandidate {
  return {
    id: PLAYER_CANDIDATE_ID,
    name: player.name,
    isPlayer: true,
    positions,
    traits: player.traits,
    nameRecognition: player.nameRecognition,
    warChest: player.warChest,
    delegates: 0,
    momentum: 0,
    authenticity: 100,
    droppedOut: false,
  };
}

/** Independent candidates skip the primary structure entirely — no party
 * primary exists for them. Returns null in that case. */
export function createInitialPrimaryState(player: PlayerCharacter, positions: AxisPositions): PrimaryState | null {
  if (player.party !== 'democrat' && player.party !== 'republican') return null;

  const rivals: PrimaryCandidate[] = PRIMARY_RIVALS[player.party].map((rival) => ({
    id: rival.id,
    name: rival.name,
    isPlayer: false,
    positions: rival.positions,
    traits: rival.traits,
    nameRecognition: rival.nameRecognition,
    warChest: rival.warChest,
    delegates: 0,
    momentum: 0,
    authenticity: 100,
    droppedOut: false,
  }));

  const totalDelegates = PRIMARY_CALENDAR.flatMap((c) => c.states).reduce(
    (sum, stateId) => sum + getStateDelegateCount(stateId, BALANCE.primary.TOTAL_DELEGATES),
    0,
  );

  return {
    party: player.party,
    candidates: [createPlayerPrimaryCandidate(player, positions), ...rivals],
    contestsCompleted: [],
    nextContestIndex: 0,
    polls: [],
    debatesCompleted: [],
    totalDelegates,
    nominationThreshold: Math.floor(totalDelegates / 2) + 1,
    clinchedId: null,
    playerEliminated: false,
    playerEliminatedReason: null,
  };
}

// ---------------------------------------------------------------------------
// Electorate & alignment
// ---------------------------------------------------------------------------

/** How heavily each persona shows up in a given state's primary electorate
 * for `party` — weighted by the state's actual persona mix, how strongly
 * that persona leans the relevant party, and their turnout propensity. */
export function primaryElectorateWeights(stateId: StateId, party: Party): Partial<Record<PersonaId, number>> {
  const state = STATES[stateId];
  const weights: Partial<Record<PersonaId, number>> = {};
  let total = 0;
  for (const personaId of PERSONA_IDS) {
    const persona = PERSONAS[personaId];
    const partyAlignment = party === 'democrat' ? Math.max(0, -persona.partyLean) : Math.max(0, persona.partyLean);
    const weight = state.personaComposition[personaId] * (partyAlignment / 100) * persona.turnoutPropensity;
    weights[personaId] = weight;
    total += weight;
  }
  if (total > 0) {
    for (const id of PERSONA_IDS) weights[id] = (weights[id] ?? 0) / total;
  }
  return weights;
}

export function nationalElectorateWeights(party: Party): Partial<Record<PersonaId, number>> {
  const weights: Partial<Record<PersonaId, number>> = {};
  for (const id of PERSONA_IDS) weights[id] = 0;
  for (const state of STATE_LIST) {
    const stateWeights = primaryElectorateWeights(state.id, party);
    for (const id of PERSONA_IDS) {
      weights[id] = (weights[id] ?? 0) + state.popWeight * (stateWeights[id] ?? 0);
    }
  }
  const total = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
  if (total > 0) {
    for (const id of PERSONA_IDS) weights[id] = (weights[id] ?? 0) / total;
  }
  return weights;
}

/** 0..100: how well `positions` aligns with an electorate, salience-weighted
 * per persona exactly like the general-election support model, but with a
 * tighter distance norm — primary electorates are more ideologically sorted. */
export function candidateAlignmentScore(positions: AxisPositions, electorateWeights: Partial<Record<PersonaId, number>>): number {
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
    const alignment = clamp(1 - normalizedDistance / BALANCE.primary.IDEOLOGY_DISTANCE_NORM, 0, 1);
    score += w * alignment;
  }
  return score * 100;
}

/** The single axis where `positions` most disagrees with the electorate,
 * weighted by salience — used to target attack ads and rival AI. */
export function findVulnerableAxis(positions: AxisPositions, electorateWeights: Partial<Record<PersonaId, number>>): IssueAxisId {
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

// ---------------------------------------------------------------------------
// Contest resolution
// ---------------------------------------------------------------------------

function nameRecognitionFactor(nameRecognition: number): number {
  const { NAME_RECOGNITION_FLOOR, NAME_RECOGNITION_CEILING } = BALANCE.primary;
  return NAME_RECOGNITION_FLOOR + (NAME_RECOGNITION_CEILING - NAME_RECOGNITION_FLOOR) * (nameRecognition / 100);
}

function resolveContestState(
  stateId: StateId,
  party: Party,
  candidates: PrimaryCandidate[],
  actionsByCandidateId: Record<string, PrimaryActionType[]>,
  cursor: RngCursor,
): ContestStateResult {
  const electorateWeights = primaryElectorateWeights(stateId, party);
  const campaignBoost: Record<string, number> = {};
  const adBoost: Record<string, number> = {};
  const attackPenalty: Record<string, number> = {};

  for (const [candidateId, actions] of Object.entries(actionsByCandidateId)) {
    for (const action of actions) {
      if (action.kind === 'campaign' && action.stateId === stateId) {
        campaignBoost[candidateId] = (campaignBoost[candidateId] ?? 0) + BALANCE.primary.INVESTMENT_BOOST_PER_ACTION;
      }
      if (action.kind === 'ad_positive' && action.stateId === stateId) {
        adBoost[candidateId] = (adBoost[candidateId] ?? 0) + BALANCE.primary.AD_BOOST_PER_ACTION;
      }
      if (action.kind === 'ad_attack' && action.stateId === stateId) {
        attackPenalty[action.targetId] = (attackPenalty[action.targetId] ?? 0) + BALANCE.primary.AD_BOOST_PER_ACTION;
      }
    }
  }

  const rawScores: Record<string, number> = {};
  for (const candidate of candidates) {
    if (candidate.droppedOut) {
      rawScores[candidate.id] = 0;
      continue;
    }
    const alignment = candidateAlignmentScore(candidate.positions, electorateWeights);
    const investment =
      1 + (campaignBoost[candidate.id] ?? 0) + (adBoost[candidate.id] ?? 0) - (attackPenalty[candidate.id] ?? 0);
    const momentumFactor = 1 + candidate.momentum / 100;
    const noise = 1 + cursor.centered(0.08);
    rawScores[candidate.id] = Math.max(
      0.5,
      alignment * Math.max(0.2, investment) * Math.max(0.3, momentumFactor) * nameRecognitionFactor(candidate.nameRecognition) * noise,
    );
  }

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const voteShare: Record<string, number> = {};
  for (const id in rawScores) voteShare[id] = total > 0 ? (rawScores[id] / total) * 100 : 0;

  const stateDelegates = getStateDelegateCount(stateId, BALANCE.primary.TOTAL_DELEGATES);
  const viable = candidates.filter((c) => voteShare[c.id] >= BALANCE.primary.VIABILITY_THRESHOLD_PCT);
  const viableIds = (viable.length > 0 ? viable : candidates).map((c) => c.id);
  const viableShareSum = viableIds.reduce((s, id) => s + voteShare[id], 0);

  const exact: Record<string, number> = {};
  const floored: Record<string, number> = {};
  let assigned = 0;
  for (const id of viableIds) {
    exact[id] = viableShareSum > 0 ? (voteShare[id] / viableShareSum) * stateDelegates : 0;
    floored[id] = Math.floor(exact[id]);
    assigned += floored[id];
  }
  let remaining = stateDelegates - assigned;
  const remainders = viableIds.map((id) => ({ id, rem: exact[id] - floored[id] })).sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < remaining && remainders.length > 0; i++) {
    const entry = remainders[i % remainders.length];
    floored[entry.id] += 1;
  }

  const delegatesAwarded: Record<string, number> = {};
  for (const c of candidates) delegatesAwarded[c.id] = floored[c.id] ?? 0;

  return { stateId, voteShare, delegatesAwarded };
}

export function resolveContest(
  contest: PrimaryContestDef,
  party: Party,
  candidates: PrimaryCandidate[],
  actionsByCandidateId: Record<string, PrimaryActionType[]>,
  date: GameState['date'],
  cursor: RngCursor,
): ContestResult {
  const stateResults = contest.states.map((stateId) =>
    resolveContestState(stateId, party, candidates, actionsByCandidateId, cursor),
  );

  const totalDelegatesAwarded: Record<string, number> = {};
  const totalVotes: Record<string, number> = {};
  for (const c of candidates) {
    totalDelegatesAwarded[c.id] = 0;
    totalVotes[c.id] = 0;
  }
  for (const result of stateResults) {
    for (const c of candidates) {
      totalDelegatesAwarded[c.id] += result.delegatesAwarded[c.id] ?? 0;
      totalVotes[c.id] += result.voteShare[c.id] ?? 0;
    }
  }

  const winnerId = candidates.reduce((bestId, c) => (totalVotes[c.id] > (totalVotes[bestId] ?? -1) ? c.id : bestId), candidates[0].id);

  return { contestId: contest.id, contestName: contest.name, date, stateResults, winnerId, totalDelegatesAwarded };
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

export function computePoll(candidates: PrimaryCandidate[], party: Party, date: GameState['date'], cursor: RngCursor): PollResult {
  const weights = nationalElectorateWeights(party);
  const trueScores: Record<string, number> = {};
  for (const c of candidates) {
    if (c.droppedOut) {
      trueScores[c.id] = 0;
      continue;
    }
    const alignment = candidateAlignmentScore(c.positions, weights);
    const momentumFactor = 1 + c.momentum / 150;
    trueScores[c.id] = Math.max(0.1, alignment * nameRecognitionFactor(c.nameRecognition) * Math.max(0.3, momentumFactor));
  }
  const total = Object.values(trueScores).reduce((a, b) => a + b, 0);

  const trueShare: Record<string, number> = {};
  const reportedShare: Record<string, number> = {};
  for (const c of candidates) {
    const share = total > 0 ? (trueScores[c.id] / total) * 100 : 0;
    trueShare[c.id] = share;
    reportedShare[c.id] = clamp(share + cursor.centered(BALANCE.primary.POLL_NOISE_MAGNITUDE), 0, 100);
  }

  return { date, trueShare, reportedShare };
}

// ---------------------------------------------------------------------------
// Debates
// ---------------------------------------------------------------------------

/** Matches by month only (not year) so the same calendar data can drive both
 * the original 2028 primary and a Phase 5 re-election primary challenge. */
export function getScheduledDebate(month: number, _year: number): DebateEvent | undefined {
  return DEBATES.find((d) => d.month === month);
}

export function applyDebateAnswer(candidate: PrimaryCandidate, answer: DebateAnswerOption): PrimaryCandidate {
  let positions = candidate.positions;
  if (answer.axisEffects) {
    positions = { ...positions };
    for (const axis of ISSUE_AXES) {
      const delta = answer.axisEffects[axis];
      if (delta !== undefined) positions[axis] = clamp(positions[axis] + delta, -100, 100);
    }
  }
  const traitMods = aggregateTraitModifiers(candidate.traits);
  const momentum = clamp(candidate.momentum + answer.debateScoreDelta + traitMods.debateScoreBonus * 0.3, -100, 100);
  return { ...candidate, positions, momentum };
}

/** Deterministic, no RNG: rivals pick whichever answer scores best given their own traits. */
export function chooseRivalDebateAnswer(rival: PrimaryCandidate, debate: DebateEvent): DebateAnswerOption {
  const traitMods = aggregateTraitModifiers(rival.traits);
  return debate.answers.reduce((best, answer) =>
    answer.debateScoreDelta + traitMods.debateScoreBonus * 0.1 > best.debateScoreDelta + traitMods.debateScoreBonus * 0.1
      ? answer
      : best,
  );
}

// ---------------------------------------------------------------------------
// Rival AI
// ---------------------------------------------------------------------------

function chooseRivalActions(rival: PrimaryCandidate, statesInPlay: StateId[], budget: number): PrimaryActionType[] {
  const actions: PrimaryActionType[] = [];

  if (statesInPlay.length > 0) {
    const topStates = [...statesInPlay]
      .sort((a, b) => getStateDelegateCount(b, BALANCE.primary.TOTAL_DELEGATES) - getStateDelegateCount(a, BALANCE.primary.TOTAL_DELEGATES))
      .slice(0, Math.max(1, budget - 1));
    for (const stateId of topStates) actions.push({ kind: 'campaign', stateId });

    if (actions.length < budget && rival.warChest > BALANCE.primary.AD_COST) {
      actions.push({ kind: 'ad_attack', stateId: topStates[0], targetId: PLAYER_CANDIDATE_ID });
    }
  } else {
    actions.push({ kind: 'fundraise' });
  }

  return actions.slice(0, budget);
}

// ---------------------------------------------------------------------------
// Immediate (non-contest) action effects
// ---------------------------------------------------------------------------

function applyImmediateActionEffects(candidate: PrimaryCandidate, actions: PrimaryActionType[]): { candidate: PrimaryCandidate; partyFavorDelta: number } {
  let next = { ...candidate };
  let partyFavorDelta = 0;
  const traitMods = aggregateTraitModifiers(candidate.traits);

  for (const action of actions) {
    switch (action.kind) {
      case 'fundraise':
        next.warChest += BALANCE.primary.FUNDRAISE_BASE_AMOUNT * traitMods.fundraisingMultiplier;
        break;
      case 'interview':
        next.nameRecognition = clamp(next.nameRecognition + BALANCE.primary.INTERVIEW_NAME_RECOGNITION_GAIN, 0, 100);
        break;
      case 'endorsement':
        partyFavorDelta += BALANCE.primary.ENDORSEMENT_FAVOR_GAIN;
        break;
      case 'shift_position': {
        const cost = Math.abs(action.delta) * BALANCE.primary.AUTHENTICITY_COST_PER_POINT * traitMods.authenticityCostMultiplier;
        next.authenticity = clamp(next.authenticity - cost, 0, 100);
        next.positions = { ...next.positions, [action.axis]: clamp(next.positions[action.axis] + action.delta, -100, 100) };
        break;
      }
      case 'ad_positive':
      case 'ad_attack':
        next.warChest -= BALANCE.primary.AD_COST;
        break;
      case 'debate_prep':
        next.momentum = clamp(next.momentum + BALANCE.primary.DEBATE_PREP_MOMENTUM_BONUS, -100, 100);
        break;
      case 'campaign':
        break; // no direct stat effect — read by resolveContest instead
    }
  }

  return { candidate: next, partyFavorDelta };
}

// ---------------------------------------------------------------------------
// Monthly orchestration
// ---------------------------------------------------------------------------

export interface AdvancePrimaryTurnInput {
  playerActions: PrimaryActionType[];
  debateAnswerId?: string;
}

/**
 * Advances the primary campaign by one month: resolves this month's scheduled
 * debate (if any) and contest (if any), applies player + rival actions, moves
 * the calendar forward, and hands off to phase 'general' the instant the
 * player clinches. Pure function of (gameState, input) — the only randomness
 * comes from gameState.rngState via RngCursor.
 */
export function advancePrimaryTurn(gameState: GameState, input: AdvancePrimaryTurnInput): GameState {
  const primary = gameState.primary;
  if (!primary) {
    throw new Error('advancePrimaryTurn called without an active primary (player is likely an independent).');
  }

  const cursor = new RngCursor(gameState.rngState);
  const { month, year } = gameState.date;
  const budget = BALANCE.primary.ACTION_BUDGET_PER_MONTH;

  let candidates = [...primary.candidates];
  const playerIndex = candidates.findIndex((c) => c.id === PLAYER_CANDIDATE_ID);

  // 1. Debate, if scheduled this month.
  const debate = getScheduledDebate(month, year);
  const debatesCompleted = [...primary.debatesCompleted];
  if (debate && !debatesCompleted.includes(debate.id)) {
    const chosenAnswer = debate.answers.find((a) => a.id === input.debateAnswerId) ?? debate.answers[0];
    candidates = candidates.map((c) => {
      if (c.isPlayer) return applyDebateAnswer(c, chosenAnswer);
      return applyDebateAnswer(c, chooseRivalDebateAnswer(c, debate));
    });
    debatesCompleted.push(debate.id);
  }

  // 2. Every contest scheduled for this exact (month, year) resolves together in
  // this one turn — several early states (e.g. Iowa/NH/Nevada/SC) share a
  // real-calendar month, and GameDate's monthly granularity can't represent
  // sub-month dates, so they're treated as a single batch of same-day contests.
  const contestsThisMonth: PrimaryContestDef[] = [];
  for (let i = primary.nextContestIndex; i < PRIMARY_CALENDAR.length; i++) {
    const contest = PRIMARY_CALENDAR[i];
    if (contest.month === month) contestsThisMonth.push(contest);
    else break;
  }
  const statesInPlay = contestsThisMonth.flatMap((c) => c.states);

  const actionsByCandidateId: Record<string, PrimaryActionType[]> = {};
  actionsByCandidateId[PLAYER_CANDIDATE_ID] = input.playerActions.slice(0, budget);
  for (const candidate of candidates) {
    if (candidate.isPlayer || candidate.droppedOut) continue;
    actionsByCandidateId[candidate.id] = chooseRivalActions(candidate, statesInPlay, budget);
  }

  // 3. Apply each candidate's immediate (non-contest) action effects.
  let playerFavorDelta = 0;
  candidates = candidates.map((c) => {
    const { candidate, partyFavorDelta } = applyImmediateActionEffects(c, actionsByCandidateId[c.id] ?? []);
    if (c.isPlayer) playerFavorDelta = partyFavorDelta;
    return candidate;
  });

  // 4. Resolve each of this month's contests in order (momentum from an early
  // win carries into the next contest later the same month), otherwise just
  // decay everyone's momentum for a contest-free (prep) month.
  const contestsCompleted = [...primary.contestsCompleted];
  let nextContestIndex = primary.nextContestIndex;

  if (contestsThisMonth.length > 0) {
    for (const contest of contestsThisMonth) {
      const result = resolveContest(contest, primary.party, candidates, actionsByCandidateId, gameState.date, cursor);
      contestsCompleted.push(result);
      nextContestIndex += 1;

      const lastPlaceId = candidates.reduce(
        (worstId, c) => ((result.totalDelegatesAwarded[c.id] ?? 0) < (result.totalDelegatesAwarded[worstId] ?? Infinity) ? c.id : worstId),
        candidates[0].id,
      );

      candidates = candidates.map((c) => {
        const delegates = c.delegates + (result.totalDelegatesAwarded[c.id] ?? 0);
        let momentum = c.momentum * BALANCE.primary.MOMENTUM_DECAY;
        if (c.id === result.winnerId) momentum += BALANCE.primary.MOMENTUM_WIN_BONUS;
        else if (c.id === lastPlaceId) momentum -= BALANCE.primary.MOMENTUM_LOSS_PENALTY;
        return { ...c, delegates, momentum: clamp(momentum, -100, 100) };
      });
    }
  } else {
    candidates = candidates.map((c) => ({ ...c, momentum: clamp(c.momentum * BALANCE.primary.MOMENTUM_DECAY, -100, 100) }));
  }

  // 5. Poll.
  const poll = computePoll(candidates, primary.party, gameState.date, cursor);
  const polls = [...primary.polls, poll];

  // 6. Clinch / elimination check.
  let clinchedId = primary.clinchedId;
  if (!clinchedId) {
    const leader = candidates.reduce((best, c) => (c.delegates > (best?.delegates ?? -1) ? c : best), candidates[0]);
    if (leader.delegates >= primary.nominationThreshold) clinchedId = leader.id;
  }

  // If the calendar runs out with no outright majority, the delegate leader
  // becomes the presumptive nominee (this game doesn't model a contested
  // convention) — a real-world plurality winner, not an automatic loss for
  // everyone including a clear front-runner.
  const calendarExhausted = nextContestIndex >= PRIMARY_CALENDAR.length;
  if (!clinchedId && calendarExhausted) {
    const leader = candidates.reduce((best, c) => (c.delegates > best.delegates ? c : best), candidates[0]);
    clinchedId = leader.id;
  }

  let playerEliminated = primary.playerEliminated;
  let playerEliminatedReason = primary.playerEliminatedReason;
  if (!playerEliminated && clinchedId && clinchedId !== PLAYER_CANDIDATE_ID) {
    const winner = candidates.find((c) => c.id === clinchedId)!;
    const finalPlayer = candidates[playerIndex];
    playerEliminated = true;
    playerEliminatedReason = calendarExhausted
      ? `The primary calendar concluded without a majority — ${winner.name} led with ${winner.delegates} delegates to your ${finalPlayer.delegates}.`
      : `${winner.name} clinched the nomination with ${winner.delegates} delegates.`;
  }

  const nextPrimary: PrimaryState = {
    ...primary,
    candidates,
    contestsCompleted,
    nextContestIndex,
    polls,
    debatesCompleted,
    clinchedId,
    playerEliminated,
    playerEliminatedReason,
  };

  // 7. Sync the player-facing GameState fields from the player's PrimaryCandidate.
  const playerCandidate = candidates.find((c) => c.id === PLAYER_CANDIDATE_ID)!;
  const player: PlayerCharacter = {
    ...gameState.player,
    nameRecognition: playerCandidate.nameRecognition,
    warChest: playerCandidate.warChest,
    partyEstablishmentFavor: clamp(gameState.player.partyEstablishmentFavor + playerFavorDelta, -100, 100),
  };

  // 8. Advance the shared clock (date, economy) on the same cursor. The
  // primary can conclude anywhere from an early clinch in March through the
  // calendar's end in June, but the general campaign is fixed to Sep-Nov —
  // clinching jumps the calendar straight to September (same year) rather
  // than crawling through an unmodeled summer. Year-relative so this works
  // identically for the original 2028 primary and a 2032 re-election one.
  const economy = advanceEconomy(gameState.economy, {}, cursor);
  const justClinched = clinchedId === PLAYER_CANDIDATE_ID && gameState.phase === 'primary';
  const phase = justClinched ? 'general' : gameState.phase;
  const date = justClinched ? { month: 9, year: gameState.date.year } : advanceGameDate(gameState.date);
  const monthIndex = dateToMonthIndex(date);
  const general = justClinched ? createInitialGeneralState(player, playerCandidate.positions) : gameState.general;

  // If this primary is a 2032 re-election challenge, keep governing.reelection
  // in sync — including the terminal 'primaried_out' outcome, since a primary
  // loss ends the game right here (there's no general to fall through to).
  const justEliminated = playerEliminated && !primary.playerEliminated;
  const governing =
    gameState.governing && gameState.governing.reelection
      ? {
          ...gameState.governing,
          reelection: {
            ...gameState.governing.reelection,
            primary: nextPrimary,
            outcome: justEliminated ? ('primaried_out' as const) : gameState.governing.reelection.outcome,
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
    primary: nextPrimary,
    general,
    governing,
  };
}
