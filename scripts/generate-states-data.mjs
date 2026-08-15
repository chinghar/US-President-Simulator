// One-time data-generation utility (NOT part of the engine — never imported
// at runtime). Produces src/data/states-generated.ts from a compact set of
// regional archetype templates + per-state house-seat/lean overrides, so the
// 51 x 14 persona-composition matrix stays internally consistent instead of
// being hand-typed number by number.

import { writeFileSync } from 'node:fs';

const PERSONAS = [
  'urban_professionals', 'rural_working_class', 'suburban_parents', 'young_progressives',
  'evangelical_conservatives', 'black_voters', 'hispanic_voters', 'seniors',
  'union_households', 'small_business_owners', 'libertarian_independents', 'college_students',
  'exurban_swing_voters', 'military_veteran_households',
];

// Raw (unnormalized) relative weights per archetype template. Normalized to sum to 1 below.
const TEMPLATES = {
  deep_south: {
    urban_professionals: 4, rural_working_class: 14, suburban_parents: 9, young_progressives: 3,
    evangelical_conservatives: 20, black_voters: 22, hispanic_voters: 4, seniors: 9,
    union_households: 3, small_business_owners: 5, libertarian_independents: 2, college_students: 2,
    exurban_swing_voters: 4, military_veteran_households: 7,
  },
  bible_belt: {
    urban_professionals: 6, rural_working_class: 18, suburban_parents: 10, young_progressives: 3,
    evangelical_conservatives: 22, black_voters: 9, hispanic_voters: 4, seniors: 10,
    union_households: 4, small_business_owners: 6, libertarian_independents: 3, college_students: 2,
    exurban_swing_voters: 5, military_veteran_households: 6,
  },
  sunbelt_swing: {
    urban_professionals: 10, rural_working_class: 7, suburban_parents: 13, young_progressives: 6,
    evangelical_conservatives: 10, black_voters: 12, hispanic_voters: 14, seniors: 9,
    union_households: 4, small_business_owners: 6, libertarian_independents: 3, college_students: 3,
    exurban_swing_voters: 8, military_veteran_households: 5,
  },
  southwest_hispanic: {
    urban_professionals: 9, rural_working_class: 7, suburban_parents: 10, young_progressives: 6,
    evangelical_conservatives: 6, black_voters: 4, hispanic_voters: 26, seniors: 8,
    union_households: 4, small_business_owners: 6, libertarian_independents: 4, college_students: 3,
    exurban_swing_voters: 6, military_veteran_households: 5,
  },
  rust_belt: {
    urban_professionals: 9, rural_working_class: 15, suburban_parents: 13, young_progressives: 5,
    evangelical_conservatives: 8, black_voters: 9, hispanic_voters: 4, seniors: 11,
    union_households: 12, small_business_owners: 5, libertarian_independents: 2, college_students: 3,
    exurban_swing_voters: 6, military_veteran_households: 4,
  },
  northeast_urban: {
    urban_professionals: 20, rural_working_class: 4, suburban_parents: 12, young_progressives: 11,
    evangelical_conservatives: 3, black_voters: 10, hispanic_voters: 9, seniors: 8,
    union_households: 8, small_business_owners: 4, libertarian_independents: 2, college_students: 5,
    exurban_swing_voters: 3, military_veteran_households: 2,
  },
  pacific_urban: {
    urban_professionals: 19, rural_working_class: 5, suburban_parents: 12, young_progressives: 12,
    evangelical_conservatives: 3, black_voters: 5, hispanic_voters: 14, seniors: 7,
    union_households: 6, small_business_owners: 5, libertarian_independents: 3, college_students: 5,
    exurban_swing_voters: 3, military_veteran_households: 2,
  },
  new_england_rural: {
    urban_professionals: 13, rural_working_class: 14, suburban_parents: 11, young_progressives: 9,
    evangelical_conservatives: 4, black_voters: 2, hispanic_voters: 3, seniors: 12,
    union_households: 6, small_business_owners: 8, libertarian_independents: 6, college_students: 4,
    exurban_swing_voters: 5, military_veteran_households: 3,
  },
  mountain_west: {
    urban_professionals: 8, rural_working_class: 16, suburban_parents: 10, young_progressives: 4,
    evangelical_conservatives: 12, black_voters: 2, hispanic_voters: 8, seniors: 8,
    union_households: 3, small_business_owners: 8, libertarian_independents: 10, college_students: 3,
    exurban_swing_voters: 5, military_veteran_households: 5,
  },
  plains_farm: {
    urban_professionals: 6, rural_working_class: 20, suburban_parents: 9, young_progressives: 3,
    evangelical_conservatives: 14, black_voters: 3, hispanic_voters: 5, seniors: 12,
    union_households: 5, small_business_owners: 9, libertarian_independents: 5, college_students: 3,
    exurban_swing_voters: 4, military_veteran_households: 4,
  },
  hawaii_mix: {
    urban_professionals: 13, rural_working_class: 6, suburban_parents: 11, young_progressives: 8,
    evangelical_conservatives: 3, black_voters: 2, hispanic_voters: 6, seniors: 10,
    union_households: 8, small_business_owners: 6, libertarian_independents: 3, college_students: 4,
    exurban_swing_voters: 4, military_veteran_households: 16,
  },
  dc_special: {
    urban_professionals: 26, rural_working_class: 1, suburban_parents: 6, young_progressives: 18,
    evangelical_conservatives: 1, black_voters: 30, hispanic_voters: 6, seniors: 4,
    union_households: 3, small_business_owners: 2, libertarian_independents: 1, college_students: 8,
    exurban_swing_voters: 1, military_veteran_households: 2,
  },
};

function normalize(template) {
  const sum = Object.values(template).reduce((a, b) => a + b, 0);
  const out = {};
  for (const p of PERSONAS) out[p] = Math.round((template[p] / sum) * 1000) / 1000;
  return out;
}

// [name, houseSeats, partisanBaseline(-100..100), template]
const STATES = [
  ['Alabama', 'AL', 7, 62, 'deep_south'],
  ['Alaska', 'AK', 1, 45, 'mountain_west'],
  ['Arizona', 'AZ', 9, 8, 'sunbelt_swing'],
  ['Arkansas', 'AR', 4, 58, 'bible_belt'],
  ['California', 'CA', 52, -48, 'pacific_urban'],
  ['Colorado', 'CO', 8, -18, 'mountain_west'],
  ['Connecticut', 'CT', 5, -38, 'northeast_urban'],
  ['Delaware', 'DE', 1, -30, 'northeast_urban'],
  ['Florida', 'FL', 28, 12, 'sunbelt_swing'],
  ['Georgia', 'GA', 14, 5, 'sunbelt_swing'],
  ['Hawaii', 'HI', 2, -50, 'hawaii_mix'],
  ['Idaho', 'ID', 2, 55, 'mountain_west'],
  ['Illinois', 'IL', 17, -32, 'northeast_urban'],
  ['Indiana', 'IN', 9, 34, 'rust_belt'],
  ['Iowa', 'IA', 4, 22, 'plains_farm'],
  ['Kansas', 'KS', 4, 34, 'plains_farm'],
  ['Kentucky', 'KY', 6, 50, 'bible_belt'],
  ['Louisiana', 'LA', 6, 45, 'deep_south'],
  ['Maine', 'ME', 2, -12, 'new_england_rural'],
  ['Maryland', 'MD', 8, -40, 'northeast_urban'],
  ['Massachusetts', 'MA', 9, -48, 'northeast_urban'],
  ['Michigan', 'MI', 13, 2, 'rust_belt'],
  ['Minnesota', 'MN', 8, -14, 'rust_belt'],
  ['Mississippi', 'MS', 4, 55, 'deep_south'],
  ['Missouri', 'MO', 8, 38, 'plains_farm'],
  ['Montana', 'MT', 2, 42, 'mountain_west'],
  ['Nebraska', 'NE', 3, 45, 'plains_farm'],
  ['Nevada', 'NV', 4, -4, 'sunbelt_swing'],
  ['New Hampshire', 'NH', 2, -6, 'new_england_rural'],
  ['New Jersey', 'NJ', 12, -28, 'northeast_urban'],
  ['New Mexico', 'NM', 3, -22, 'southwest_hispanic'],
  ['New York', 'NY', 26, -40, 'northeast_urban'],
  ['North Carolina', 'NC', 14, 6, 'sunbelt_swing'],
  ['North Dakota', 'ND', 1, 60, 'plains_farm'],
  ['Ohio', 'OH', 15, 20, 'rust_belt'],
  ['Oklahoma', 'OK', 5, 65, 'bible_belt'],
  ['Oregon', 'OR', 6, -28, 'pacific_urban'],
  ['Pennsylvania', 'PA', 17, 4, 'rust_belt'],
  ['Rhode Island', 'RI', 2, -38, 'northeast_urban'],
  ['South Carolina', 'SC', 7, 30, 'deep_south'],
  ['South Dakota', 'SD', 1, 52, 'plains_farm'],
  ['Tennessee', 'TN', 9, 48, 'bible_belt'],
  ['Texas', 'TX', 38, 16, 'southwest_hispanic'],
  ['Utah', 'UT', 4, 40, 'mountain_west'],
  ['Vermont', 'VT', 1, -50, 'new_england_rural'],
  ['Virginia', 'VA', 11, -8, 'sunbelt_swing'],
  ['Washington', 'WA', 10, -32, 'pacific_urban'],
  ['West Virginia', 'WV', 2, 68, 'bible_belt'],
  ['Wisconsin', 'WI', 8, 6, 'rust_belt'],
  ['Wyoming', 'WY', 1, 70, 'mountain_west'],
  ['District of Columbia', 'DC', 0, -85, 'dc_special'],
];

const totalHouseSeats = STATES.reduce((sum, s) => sum + s[2], 0);
if (totalHouseSeats !== 435) throw new Error(`House seats sum to ${totalHouseSeats}, expected 435`);

// DC has no House seats but a small real population share; give it a fixed
// slice of national population weight and renormalize the other 50 states'
// house-seat-proportional shares around it.
const DC_POP_WEIGHT = 0.0021;
const remaining = 1 - DC_POP_WEIGHT;

const records = STATES.map(([name, id, houseSeats, partisanBaseline, template]) => {
  const electoralVotes = id === 'DC' ? 3 : houseSeats + 2;
  const popWeight = id === 'DC'
    ? DC_POP_WEIGHT
    : Math.round((houseSeats / totalHouseSeats) * remaining * 100000) / 100000;
  return {
    id,
    name,
    electoralVotes,
    popWeight,
    partisanBaseline,
    personaComposition: normalize(TEMPLATES[template]),
  };
});

const totalEV = records.reduce((sum, r) => sum + r.electoralVotes, 0);
if (totalEV !== 538) throw new Error(`Electoral votes sum to ${totalEV}, expected 538`);

const popWeightSum = records.reduce((sum, r) => sum + r.popWeight, 0);
console.log(`Total EV: ${totalEV}, total popWeight: ${popWeightSum.toFixed(5)}`);

const header = `// AUTO-GENERATED by scripts/generate-states-data.mjs — do not hand-edit the
// personaComposition/popWeight numbers here; edit the script's templates and
// regenerate instead. partisanBaseline may be hand-tuned directly.
import type { StateInfo, StateId } from '../engine/types';

export const STATES: Record<StateId, StateInfo> = {
`;

const body = records
  .map((r) => `  ${r.id}: ${JSON.stringify(r, null, 2).replace(/\n/g, '\n  ')},`)
  .join('\n');

const footer = `
} as unknown as Record<StateId, StateInfo>;

export const STATE_LIST: StateInfo[] = Object.values(STATES);
export const TOTAL_ELECTORAL_VOTES = STATE_LIST.reduce((sum, s) => sum + s.electoralVotes, 0);
`;

writeFileSync(new URL('../src/data/states.ts', import.meta.url), header + body + footer);
console.log('Wrote src/data/states.ts');
