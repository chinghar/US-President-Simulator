// ---------------------------------------------------------------------------
// Core engine types. Pure data shapes only — no logic, no React, no DOM.
// ---------------------------------------------------------------------------

export const ISSUE_AXES = [
  'economy',
  'immigration',
  'healthcare',
  'crime',
  'climate',
  'foreign',
  'social',
  'government_reform',
] as const;
export type IssueAxisId = (typeof ISSUE_AXES)[number];

/** Every axis position is -100..+100. For economy/social-style axes,
 * negative reads "left"/dovish/permissive, positive reads "right"/hawkish/restrictive. */
export type AxisPositions = Record<IssueAxisId, number>;

export const PERSONA_IDS = [
  'urban_professionals',
  'rural_working_class',
  'suburban_parents',
  'young_progressives',
  'evangelical_conservatives',
  'black_voters',
  'hispanic_voters',
  'seniors',
  'union_households',
  'small_business_owners',
  'libertarian_independents',
  'college_students',
  'exurban_swing_voters',
  'military_veteran_households',
] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export interface Persona {
  id: PersonaId;
  name: string;
  description: string;
  /** Where this persona sits nationally on each axis, -100..+100. */
  basePosition: AxisPositions;
  /** How much this persona actually votes on each axis, 0..1. Need not sum to 1 — normalized at use time. */
  salience: Record<IssueAxisId, number>;
  /** Baseline likelihood to turn out and vote, 0..1. */
  turnoutPropensity: number;
  /** Partisan lean, -100 (strongly Democratic) .. +100 (strongly Republican). */
  partyLean: number;
  /** How much this persona's support swings with macroeconomic conditions, 0..1. */
  economicSensitivity: number;
}

export const STATE_IDS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
] as const;
export type StateId = (typeof STATE_IDS)[number];

export interface StateInfo {
  id: StateId;
  name: string;
  electoralVotes: number;
  /** Fraction of national population/electorate. Sums to 1.0 across all 51 entries. */
  popWeight: number;
  /** State partisan baseline (PVI-style), -100 (strongly Democratic) .. +100 (strongly Republican). */
  partisanBaseline: number;
  /** Fraction of this state's population represented by each persona. Sums to ~1.0 per state. */
  personaComposition: Record<PersonaId, number>;
}

export const STAKEHOLDER_IDS = [
  'house_dem_caucus',
  'house_rep_caucus',
  'senate_dem_caucus',
  'senate_rep_caucus',
  'supreme_court',
  'party_establishment',
  'donor_class',
  'labor_unions',
  'business_lobby',
  'media_progressive',
  'media_lean_left',
  'media_lean_right',
  'media_conservative',
  'foreign_bloc_allies',
  'foreign_bloc_rivals',
  'foreign_bloc_nonaligned',
] as const;
export type StakeholderId = (typeof STAKEHOLDER_IDS)[number];

export type StakeholderType =
  | 'congress'
  | 'judiciary'
  | 'party'
  | 'donor'
  | 'labor'
  | 'business'
  | 'media'
  | 'foreign';

export interface StakeholderDefinition {
  id: StakeholderId;
  name: string;
  type: StakeholderType;
  /** Media outlets only: editorial lean, -100 (progressive) .. +100 (conservative). */
  mediaLean?: number;
}

export interface StakeholderState {
  id: StakeholderId;
  /** -100 (hostile) .. +100 (fully aligned), 0 = neutral. */
  relationship: number;
}

export type Party = 'democrat' | 'republican' | 'independent';

export type PriorOffice =
  | 'governor'
  | 'senator'
  | 'representative'
  | 'mayor'
  | 'business'
  | 'military'
  | 'activist';

export const TRAIT_IDS = [
  'charismatic',
  'policy_wonk',
  'fundraiser',
  'debater',
  'outsider',
  'machine_politician',
  'war_hero',
  'media_savvy',
  'scandal_prone',
  'conciliator',
] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

/** Every field is optional on a single trait — undefined means "this trait
 * doesn't touch that stat." Bonus fields sum across a character's traits;
 * multiplier fields multiply together. See engine/character.ts. */
export interface TraitModifiers {
  nameRecognitionBonus?: number;
  warChestMultiplier?: number;
  partyEstablishmentFavorBonus?: number;
  baseEnthusiasmBonus?: number;
  /** Used by the Phase 3 debate-scoring system. */
  debateScoreBonus?: number;
  /** Used by the Phase 3 fundraise campaign action. */
  fundraisingMultiplier?: number;
  /** Used by the Phase 3/4 ad-buy resolution. */
  adEffectivenessMultiplier?: number;
  /** Used by the Phase 3 "shift a policy position" action's authenticity cost. */
  authenticityCostMultiplier?: number;
  /** Used by the Phase 5 scandal/crisis event weighting. */
  scandalRiskMultiplier?: number;
  /** Used by the Phase 5 media-relationship system. */
  mediaRelationshipMultiplier?: number;
  /** Flat, position-independent support bonus for specific personas (e.g. War Hero -> veterans). */
  personaBonus?: Partial<Record<PersonaId, number>>;
}

export interface TraitDefinition {
  id: TraitId;
  name: string;
  description: string;
  modifiers: TraitModifiers;
}

export interface StartingStats {
  nameRecognition: number;
  warChest: number;
  partyEstablishmentFavor: number;
  baseEnthusiasm: number;
}

export interface PriorOfficeInfo {
  id: PriorOffice;
  name: string;
  description: string;
  baseStats: StartingStats;
}

export interface PlayerCharacter {
  name: string;
  age: number;
  homeState: StateId;
  party: Party;
  priorOffice: PriorOffice;
  traits: TraitId[];
  nameRecognition: number; // 0..100
  warChest: number; // dollars
  partyEstablishmentFavor: number; // -100..100
  baseEnthusiasm: number; // 0..100
}

export interface EconomyState {
  gdpGrowth: number; // annualized %, e.g. 2.1
  unemployment: number; // %, e.g. 4.0
  inflation: number; // annualized %, e.g. 2.5
  deficit: number; // annualized, $ billions, positive = deficit
  debtToGdp: number; // %
}

/** A decaying persona-support effect left behind by a past decision/event.
 * Never mutated after creation — decay is computed on read from
 * (magnitude, appliedMonth, currentMonth), so replay is exact. */
export interface MemoryEffect {
  id: string;
  sourceLabel: string;
  appliedMonth: number;
  personaId: PersonaId;
  magnitude: number; // raw effect at time of application, -100..+100
}

export interface EconomyEffects {
  gdpGrowth?: number;
  unemployment?: number;
  inflation?: number;
  deficit?: number;
}

/** The generic "player action with consequences" shape shared by governing
 * decisions, campaign actions, executive orders, and bills. Every decision
 * in the data files must help at least one persona and hurt at least one —
 * enforced by engine/validators.ts. */
export interface Decision {
  id: string;
  label: string;
  description: string;
  axisEffects?: Partial<Record<IssueAxisId, number>>;
  personaEffects: Partial<Record<PersonaId, number>>;
  stakeholderEffects?: Partial<Record<StakeholderId, number>>;
  economyEffects?: EconomyEffects;
  cost?: { treasury?: number; politicalCapital?: number };
}

export interface GameDate {
  month: number; // 1-12
  year: number;
}

export type GamePhase = 'primary' | 'general' | 'governing';

// ---------------------------------------------------------------------------
// Primary campaign (Phase 3)
// ---------------------------------------------------------------------------

/** Either the player or an AI rival competing in one party's primary. */
export interface PrimaryCandidate {
  id: string;
  name: string;
  isPlayer: boolean;
  positions: AxisPositions;
  traits: TraitId[];
  nameRecognition: number; // 0..100
  warChest: number; // dollars
  delegates: number;
  /** Short-term "big mo" from recent contest wins/losses, -100..100, decays each month. */
  momentum: number;
  /** Base-trust stat, 0..100. Spent by shifting positions; low authenticity is a standing liability. */
  authenticity: number;
  droppedOut: boolean;
}

export type PrimaryActionType =
  | { kind: 'campaign'; stateId: StateId }
  | { kind: 'fundraise' }
  | { kind: 'ad_positive'; stateId: StateId }
  | { kind: 'ad_attack'; stateId: StateId; targetId: string }
  | { kind: 'debate_prep' }
  | { kind: 'endorsement'; stakeholderId: StakeholderId }
  | { kind: 'interview' }
  | { kind: 'shift_position'; axis: IssueAxisId; delta: number };

export interface PrimaryContestDef {
  id: string;
  name: string;
  month: number;
  year: number;
  /** Chronological sequence index — later contests get a momentum carry-in from earlier ones. */
  order: number;
  states: StateId[];
}

export interface ContestStateResult {
  stateId: StateId;
  /** candidateId -> 0..100 vote share within this state. */
  voteShare: Record<string, number>;
  /** candidateId -> delegate count awarded from this state. */
  delegatesAwarded: Record<string, number>;
}

export interface ContestResult {
  contestId: string;
  contestName: string;
  date: GameDate;
  stateResults: ContestStateResult[];
  winnerId: string;
  /** candidateId -> delegates won across the whole contest (sum of stateResults). */
  totalDelegatesAwarded: Record<string, number>;
}

export interface PollResult {
  date: GameDate;
  /** True underlying support, population/electorate-weighted. Never shown directly in the UI. */
  trueShare: Record<string, number>;
  /** What the player actually sees — trueShare plus sampling noise. */
  reportedShare: Record<string, number>;
}

export interface DebateAnswerOption {
  id: string;
  label: string;
  /** Momentum swing from a strong/weak answer. */
  debateScoreDelta: number;
  /** A bold answer can permanently stake out a position, like a Decision. */
  axisEffects?: Partial<Record<IssueAxisId, number>>;
}

export interface DebateEvent {
  id: string;
  name: string;
  month: number;
  year: number;
  question: string;
  answers: DebateAnswerOption[];
}

export interface PrimaryState {
  party: Party;
  candidates: PrimaryCandidate[];
  contestsCompleted: ContestResult[];
  /** Index into the full PRIMARY_CALENDAR of the next contest not yet resolved. */
  nextContestIndex: number;
  polls: PollResult[];
  debatesCompleted: string[];
  totalDelegates: number;
  nominationThreshold: number;
  clinchedId: string | null;
  playerEliminated: boolean;
  playerEliminatedReason: string | null;
}

// ---------------------------------------------------------------------------
// General election (Phase 4)
// ---------------------------------------------------------------------------

export interface GeneralCandidate {
  id: string;
  name: string;
  isPlayer: boolean;
  party: Party;
  positions: AxisPositions;
  traits: TraitId[];
  nameRecognition: number;
  warChest: number;
  momentum: number;
}

export type GeneralActionType =
  | { kind: 'campaign'; stateId: StateId }
  | { kind: 'fundraise' }
  | { kind: 'ad_positive'; stateId: StateId }
  | { kind: 'ad_attack'; stateId: StateId; targetId: string }
  | { kind: 'debate_prep' }
  | { kind: 'interview' };

/** A running-mate pick made once before the general campaign. Fixed
 * demographic/regional support bonuses, same shape idea as a trait's
 * personaBonus — the engine reads it generically. */
export interface VpCandidate {
  id: string;
  name: string;
  bio: string;
  homeState: StateId;
  traits: TraitId[];
  personaBonus: Partial<Record<PersonaId, number>>;
}

export interface GeneralStateResult {
  stateId: StateId;
  voteShare: Record<string, number>;
  winnerId: string;
  electoralVotes: number;
}

/** Election-night results in poll-closing order, so the UI can reveal the
 * running electoral-vote count the way a real broadcast would. */
export interface ElectionNightResult {
  stateResults: GeneralStateResult[];
  finalElectoralVotes: Record<string, number>;
  winnerId: string;
}

export interface GeneralState {
  candidates: GeneralCandidate[];
  vp: VpCandidate | null;
  polls: PollResult[];
  debatesCompleted: string[];
  electionResult: ElectionNightResult | null;
  playerWon: boolean | null;
}

export interface HistoryEntry {
  date: GameDate;
  nationalApproval: number;
  economy: EconomyState;
  treasury: number;
  politicalCapital: number;
  notableDecisions: string[];
}

// ---------------------------------------------------------------------------
// Governing (Phase 5)
// ---------------------------------------------------------------------------

export interface CongressComposition {
  houseDem: number;
  houseRep: number;
  houseInd: number; // sums to 435
  senateDem: number;
  senateRep: number;
  senateInd: number; // sums to 100
}

export const CABINET_POSITION_IDS = [
  'treasury',
  'state',
  'defense',
  'justice',
  'health',
  'homeland_security',
  'education',
  'energy',
] as const;
export type CabinetPositionId = (typeof CABINET_POSITION_IDS)[number];

export interface CabinetAppointeeDef {
  id: string;
  name: string;
  position: CabinetPositionId;
  bio: string;
  competence: number; // 0..100 — how good they are at the job
  ideology: number; // -100..100 — general political lean; drives Senate confirmation odds
  loyalty: number; // 0..100 — how faithfully they execute the administration's agenda once serving
  stakeholderEffects?: Partial<Record<StakeholderId, number>>;
  personaEffects?: Partial<Record<PersonaId, number>>;
}

export interface CabinetAppointment {
  positionId: CabinetPositionId;
  appointeeId: string;
  confirmed: boolean;
  monthAppointed: number;
}

/**
 * Bills, executive orders, and crisis-response options are all just
 * Decisions with a bit of extra governing-specific metadata — they reuse
 * the exact same trade-off validator and flow through the same advanceMonth
 * reducer as everything else.
 */
export interface Bill extends Decision {
  constitutionalRisk: number; // 0..100 chance the Court strikes it down if passed
  requiresFilibusterProof: boolean; // needs 60 Senate votes instead of a simple majority
}

export interface ExecutiveOrder extends Decision {
  constitutionalRisk: number;
}

export type LegislationStatus = 'passed' | 'failed_house' | 'failed_senate' | 'struck_down';

export interface LegislationRecord {
  billId: string;
  title: string;
  date: GameDate;
  concessionLevel: number; // 0..1 — 1 = proposed at full strength, lower = watered down for votes
  status: LegislationStatus;
}

export interface ExecutiveOrderRecord {
  orderId: string;
  title: string;
  date: GameDate;
  courtStruckDown: boolean;
}

export type CrisisCategory =
  | 'recession'
  | 'natural_disaster'
  | 'foreign_conflict'
  | 'pandemic'
  | 'scandal'
  | 'mass_shooting'
  | 'court_vacancy'
  | 'border_surge'
  | 'strike'
  | 'cyberattack'
  | 'consequence';

export interface CrisisPrerequisites {
  dateRange?: { start: GameDate; end: GameDate };
  minUnemployment?: number;
  maxUnemployment?: number;
  minApproval?: number;
  maxApproval?: number;
  /** Every id listed must appear in the applied-decision history (bills, EOs, or past crisis choices). */
  requiresPriorDecisionIds?: string[];
}

export interface CrisisEvent {
  id: string;
  category: CrisisCategory;
  title: string;
  description: string;
  weight: number;
  repeatable: boolean;
  prerequisites: CrisisPrerequisites;
  options: Decision[];
}

export interface CrisisRecord {
  eventId: string;
  title: string;
  date: GameDate;
  chosenOptionId: string;
}

export interface Headline {
  outletId: StakeholderId;
  date: GameDate;
  text: string;
  framing: 'positive' | 'neutral' | 'negative';
}

export interface ReelectionState {
  /** Non-null only once a primary challenge has actually been triggered. */
  primary: PrimaryState | null;
  /** Non-null once the incumbent has secured their party's re-nomination (or ran unopposed). */
  general: GeneralState | null;
  outcome: 'reelected' | 'primaried_out' | 'lost_general' | null;
}

export interface GoverningState {
  congress: CongressComposition;
  cabinet: Partial<Record<CabinetPositionId, CabinetAppointment>>;
  legislationHistory: LegislationRecord[];
  executiveOrderHistory: ExecutiveOrderRecord[];
  crisisHistory: CrisisRecord[];
  /** ids of non-repeatable crisis events that have already fired. */
  triggeredEventIds: string[];
  headlines: Headline[];
  midtermsCompleted: boolean;
  reelection: ReelectionState | null;
}

export interface GameState {
  date: GameDate;
  /** Absolute months since epoch (Jan 2028 = 0). Drives memory decay math. */
  monthIndex: number;
  phase: GamePhase;
  /** Full RNG state — a single integer. Same seed + same decisions replayed
   * from the same starting state always yields identical results. */
  rngState: number;
  player: PlayerCharacter;
  positions: AxisPositions;
  economy: EconomyState;
  treasury: number;
  politicalCapital: number;
  stakeholders: Record<StakeholderId, StakeholderState>;
  memory: MemoryEffect[];
  history: HistoryEntry[];
  /** Non-null only while phase === 'primary'. Independent-party candidates skip
   * the primary structure entirely (no rivals, no contests) and this stays null. */
  primary: PrimaryState | null;
  /** Non-null once phase reaches 'general' (or later). */
  general: GeneralState | null;
  /** Non-null once phase reaches 'governing'. */
  governing: GoverningState | null;
  /** True when the player is playing as a real public figure (see
   * data/real-candidates.ts). Gates a restricted content set: no scandal/
   * personal-conduct crisis events, and debates render as hypothetical
   * simulated-strategy choices rather than attributed quotes. */
  isRealCandidateMode?: boolean;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
