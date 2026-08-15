// ---------------------------------------------------------------------------
// BALANCE CONSTANTS
//
// Every tunable number in the simulation lives here. Nothing in /src/engine
// should have a magic number in it — if you want the game to feel different,
// change a value in this file, not the engine code.
// ---------------------------------------------------------------------------

export const BALANCE = {
  support: {
    /** Support/approval always starts each calculation from this neutral midpoint (0-100 scale). */
    NEUTRAL_BASE: 50,

    /** Max swing (+/-) the ideology-distance component can contribute.
     * A persona perfectly aligned with the player gets +IDEOLOGY_RANGE;
     * a persona maximally opposed gets -IDEOLOGY_RANGE. */
    IDEOLOGY_RANGE: 45,

    /** Salience-weighted axis distance (0..200 in theory) at which alignment
     * bottoms out at 0. Most personas sit 20-60 points from a neutral
     * candidate on any given axis, not the theoretical extreme of 100 — this
     * is tuned so a truly neutral (all-zero) candidate lands near 50-55
     * approval with most personas, not the high-80s a /200 normalization
     * would produce. Lower this to make voters harder to please; raise it
     * to make position-taking matter less. */
    IDEOLOGY_DISTANCE_NORM: 80,

    /** Max swing (+/-) the macroeconomic-conditions component can contribute,
     * before being scaled by a persona's own economicSensitivity (0..1). */
    ECONOMY_RANGE: 20,

    /** Max swing (+/-) the summed decayed-memory-events component can contribute.
     * Prevents one very eventful month from single-handedly maxing out support. */
    EVENTS_CAP: 40,

    /** Max swing (+/-) the state-partisan-alignment component can contribute
     * when support is evaluated for a specific state (elections only; zero nationally). */
    STATE_RANGE: 15,

    /** Max swing (+/-) the player's own trait-driven persona bonuses can contribute
     * (e.g. War Hero's bonus with military/veteran households). */
    TRAITS_CAP: 30,

    /** Reference points the economy component measures deviation from. */
    ECON_REF_GDP_GROWTH: 2.0,
    ECON_REF_UNEMPLOYMENT: 4.5,
    ECON_REF_INFLATION: 2.0,
    /** Relative weight of each economic indicator inside the economy component (must sum to ~1). */
    ECON_WEIGHT_GROWTH: 0.45,
    ECON_WEIGHT_UNEMPLOYMENT: 0.35,
    ECON_WEIGHT_INFLATION: 0.2,
  },

  memory: {
    /** Multiplicative decay applied to a memory effect's magnitude per elapsed month. */
    DECAY_RATE_PER_MONTH: 0.9,
    /** Fraction of the original magnitude that decay can never erase — old
     * decisions fade but never fully vanish. 0.12 = 12% permanently retained. */
    RESIDUAL_FLOOR: 0.12,
  },

  economy: {
    /** Long-run trend GDP growth (%) the model reverts toward absent shocks/policy. */
    POTENTIAL_GROWTH: 2.0,
    /** Non-accelerating-inflation unemployment rate (%) the model reverts toward. */
    NATURAL_UNEMPLOYMENT: 4.5,
    /** Central-bank-style inflation target (%) the model reverts toward. */
    TARGET_INFLATION: 2.0,

    /** How strongly a growth gap closes toward potential growth each month (mean reversion). */
    MEAN_REVERSION_GROWTH: 0.08,
    /** How strongly unemployment closes toward its natural rate each month. */
    MEAN_REVERSION_UNEMPLOYMENT: 0.06,
    /** How strongly inflation closes toward its target each month. */
    MEAN_REVERSION_INFLATION: 0.1,

    /** Okun's-law-style coefficient: extra growth above potential lowers unemployment. */
    OKUN_COEFFICIENT: 0.3,
    /** Phillips-curve-style coefficient: unemployment below natural rate raises inflation. */
    PHILLIPS_COEFFICIENT: 0.25,
    /** Elevated inflation drags on growth (rate-sensitivity proxy for tightening financial conditions). */
    INFLATION_DRAG_ON_GROWTH: 0.12,

    /** Half-width of the random monthly shock applied to growth (uniform, mean 0). */
    GROWTH_SHOCK_MAGNITUDE: 0.6,

    /** Deficit drifts by this many $B/month even with no policy changes (structural spending growth). */
    BASELINE_DEFICIT_DRIFT: 8,
    /** Extra $B added/removed from the deficit per point of growth above/below potential (tax receipts). */
    TAX_REVENUE_SENSITIVITY: 15,
    /** Divides cumulative deficit into a debt-to-GDP delta. */
    DEBT_SCALE_FACTOR: 220,
    /** Growth above potential shaves this much off debt-to-GDP per month (denominator effect). */
    DEBT_GROWTH_RELIEF: 0.15,

    // Hard bounds so shocks/policy can't send indicators to absurd values.
    GDP_GROWTH_MIN: -8,
    GDP_GROWTH_MAX: 8,
    UNEMPLOYMENT_MIN: 2,
    UNEMPLOYMENT_MAX: 20,
    INFLATION_MIN: -2,
    INFLATION_MAX: 20,
    DEBT_TO_GDP_MIN: 0,
    DEBT_TO_GDP_MAX: 300,
  },

  stakeholders: {
    /** Relationship scores drift toward neutral (0) by this fraction of the gap each month. */
    DRIFT_TOWARD_NEUTRAL: 0.02,
  },

  primary: {
    /** Total delegates a party awards across the whole primary calendar (fictionalized, roughly real-world scale). */
    TOTAL_DELEGATES: 2500,
    /** Salience-weighted distance (same idea as support.IDEOLOGY_DISTANCE_NORM) at which a
     * primary candidate's alignment with an electorate bottoms out at 0. Primary electorates
     * are more ideologically sorted than the general electorate, so this is tighter than the
     * general-election norm — positioning matters more in a primary. */
    IDEOLOGY_DISTANCE_NORM: 65,
    /** Multiplicative boost to a candidate's raw state score per 'campaign' action spent there this month. */
    INVESTMENT_BOOST_PER_ACTION: 0.35,
    /** Multiplicative boost/penalty per positive/attack ad action targeting a state. */
    AD_BOOST_PER_ACTION: 0.2,
    /** Momentum added to a contest's winner. */
    MOMENTUM_WIN_BONUS: 22,
    /** Momentum subtracted from a contest's last-place finisher. */
    MOMENTUM_LOSS_PENALTY: 10,
    /** Momentum multiplicatively decays by this factor every month (contest or not). */
    MOMENTUM_DECAY: 0.7,
    /** A candidate below this vote share in a state is not viable there — no delegates awarded to them. */
    VIABILITY_THRESHOLD_PCT: 15,
    /** Half-width of the random noise added to a poll's reported share, in percentage points. */
    POLL_NOISE_MAGNITUDE: 6,
    /** Name-recognition floor/ceiling multiplier range applied to a candidate's raw state score. */
    NAME_RECOGNITION_FLOOR: 0.4,
    NAME_RECOGNITION_CEILING: 1.0,
    /** Dollars raised by a single 'fundraise' action, before the Fundraiser trait multiplier. */
    FUNDRAISE_BASE_AMOUNT: 900_000,
    /** Dollar cost of a single ad-buy action. */
    AD_COST: 500_000,
    /** Authenticity lost per point of axis shift from a 'shift_position' action, before Policy Wonk's multiplier. */
    AUTHENTICITY_COST_PER_POINT: 0.4,
    /** Party establishment favor gained per successful 'endorsement' action targeting party_establishment. */
    ENDORSEMENT_FAVOR_GAIN: 8,
    /** Name recognition gained per 'interview' action. */
    INTERVIEW_NAME_RECOGNITION_GAIN: 3,
    /** Immediate momentum bonus from a 'debate_prep' action (sharper messaging pays off right away). */
    DEBATE_PREP_MOMENTUM_BONUS: 4,
    /** Action points each candidate (player and rivals alike) gets to spend per month. */
    ACTION_BUDGET_PER_MONTH: 3,
  },

  general: {
    /** Looser than the primary's — the general electorate is less ideologically
     * sorted than a party primary electorate, so raw position no longer dominates. */
    IDEOLOGY_DISTANCE_NORM: 120,
    MOMENTUM_DECAY: 0.75,
    INVESTMENT_BOOST_PER_ACTION: 0.3,
    AD_BOOST_PER_ACTION: 0.18,
    POLL_NOISE_MAGNITUDE: 5,
    NAME_RECOGNITION_FLOOR: 0.5,
    NAME_RECOGNITION_CEILING: 1.0,
    FUNDRAISE_BASE_AMOUNT: 3_000_000,
    AD_COST: 1_500_000,
    INTERVIEW_NAME_RECOGNITION_GAIN: 2,
    DEBATE_PREP_MOMENTUM_BONUS: 3,
    ACTION_BUDGET_PER_MONTH: 4,
    /** Max swing (+/-) a VP pick's persona bonus can contribute — kept modest;
     * the presidential candidate is still the main event. */
    VP_BONUS_CAP: 15,
    /** How many of the 51 jurisdictions count as "swing states" for AI targeting
     * and UI highlighting — the states with the smallest |partisanBaseline|. */
    SWING_STATE_COUNT: 12,
  },

  politicalCapital: {
    /** Political capital earned/lost each month scales with (approval - 50) times this factor. */
    APPROVAL_TO_CAPITAL_RATE: 0.15,
    /** Political capital can never exceed this ceiling. */
    MAX: 100,
    /** Political capital can never drop below this floor. */
    MIN: 0,
  },

  governing: {
    /** Initial House/Senate composition at Inauguration (roughly a competitive
     * Congress) — reshuffled for real at the Nov 2030 midterms. */
    INITIAL_HOUSE_DEM: 210,
    INITIAL_HOUSE_REP: 220,
    INITIAL_HOUSE_IND: 5,
    INITIAL_SENATE_DEM: 48,
    INITIAL_SENATE_REP: 50,
    INITIAL_SENATE_IND: 2,

    /** Action points spent per governing move. */
    CABINET_APPOINTMENT_COST_AP: 1,
    PROPOSE_BILL_COST_AP: 2,
    EXECUTIVE_ORDER_COST_AP: 1,
    ACTION_BUDGET_PER_MONTH: 4,

    /** Baseline probability a caucus votes yes before any whipping/alignment/concessions are applied. */
    VOTE_BASE_PROBABILITY: 0.5,
    /** How much a bill's ideological alignment with a caucus can swing that baseline, +/-. */
    VOTE_ALIGNMENT_WEIGHT: 0.3,
    /** How much the caucus's current stakeholder relationship (-100..100) can swing the baseline, +/-. */
    VOTE_RELATIONSHIP_WEIGHT: 0.25,
    /** Max probability bonus from watering a bill down toward concessionLevel 0. */
    VOTE_CONCESSION_BONUS_MAX: 0.15,
    /** Max probability bonus from spending political capital to whip votes (capital is 0-100 scale). */
    VOTE_CAPITAL_BONUS_MAX: 0.2,
    /** Random noise half-width applied to each caucus's expected yes-vote share. */
    VOTE_NOISE_MAGNITUDE: 0.06,
    HOUSE_SEATS: 435,
    SENATE_SEATS: 100,
    HOUSE_MAJORITY: 218,
    SENATE_MAJORITY: 51,
    SENATE_FILIBUSTER_PROOF: 60,

    /** Concessions scale a bill's persona/economy/stakeholder effects by this much per point of
     * (1 - concessionLevel) — i.e. a fully watered-down bill (concessionLevel 0) keeps this fraction of its punch. */
    MIN_CONCESSION_EFFECT_STRENGTH: 0.4,

    /** Senate confirmation follows the same probability model as a Senate vote on a bill,
     * using the appointee's ideology as the "bill" being voted on. */
    CONFIRMATION_IDEOLOGY_SCALE: 100,

    /** Every confirmed cabinet appointee's competence (0-100) and loyalty (0-100) combine into
     * an "effectiveness" of -1..+1 — see cabinetEffectiveness() in engine/governing.ts. Loyalty
     * is a multiplier, not an independent bonus: a highly competent but disloyal appointee
     * under-delivers on their own competence, and a loyal-but-weak one still faithfully (if
     * modestly) delivers in whatever direction their competence points. */
    TREASURY_COMPETENCE_GDP_FACTOR: 0.2,
    /** Every position's effectiveness also nudges the personas already named in that
     * appointee's own personaEffects (the same ones rewarded once at confirmation), by this
     * fraction of that value each month while they remain in office. */
    CABINET_AMBIENT_PERSONA_SCALE: 0.15,

    /** How many crisis events can trigger in a single month, and the RNG weight curve. */
    MAX_EVENTS_PER_MONTH: 2,
    EVENT_TRIGGER_CHANCE: 0.55,

    /** Headline effect magnitude applied to personas who trust (or distrust) the outlet, per month. */
    HEADLINE_MAGNITUDE: 4,
    /** Outlet relationship above/below this threshold reads as friendly/hostile coverage. */
    HEADLINE_RELATIONSHIP_THRESHOLD: 15,

    /** Midterms (Nov 2030): seats swing toward whichever party the president is NOT,
     * scaled by how far national approval sits from 50, times this factor (in seats per point). */
    MIDTERM_SWING_PER_APPROVAL_POINT: 1.4,

    /** Re-election (2032): if trailing-average approval over the prior 6 months is below this,
     * a primary-challenge risk check fires. */
    PRIMARY_CHALLENGE_APPROVAL_THRESHOLD: 42,
    PRIMARY_CHALLENGE_BASE_CHANCE: 0.35,
  },
} as const;
