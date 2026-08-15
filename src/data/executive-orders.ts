import type { ExecutiveOrder } from '../engine/types';

/**
 * The executive-order pool. No Congress vote required — effects land
 * immediately — but constitutionalRisk runs higher than an equivalent bill
 * since these bypass the legislative process entirely.
 */
export const EXECUTIVE_ORDERS: ExecutiveOrder[] = [
  {
    id: 'border_emergency_declaration',
    label: 'Border Emergency Declaration',
    description: 'Unilaterally redirects federal funds to border infrastructure under an emergency declaration.',
    axisEffects: { immigration: 12 },
    personaEffects: { rural_working_class: 6, evangelical_conservatives: 5, hispanic_voters: -8, urban_professionals: -4 },
    stakeholderEffects: { house_dem_caucus: -6 },
    cost: { politicalCapital: 10 },
    constitutionalRisk: 35,
  },
  {
    id: 'deferred_action_order',
    label: 'Deferred Action Order',
    description: 'Shields long-resident undocumented immigrants from deportation by executive discretion.',
    axisEffects: { immigration: -12 },
    personaEffects: { hispanic_voters: 8, urban_professionals: 5, young_progressives: 6, rural_working_class: -7, evangelical_conservatives: -5 },
    stakeholderEffects: { house_rep_caucus: -6 },
    cost: { politicalCapital: 10 },
    constitutionalRisk: 30,
  },
  {
    id: 'contractor_minimum_wage',
    label: 'Federal Contractor Minimum Wage Order',
    description: 'Raises the minimum wage for employees of federal contractors.',
    axisEffects: { economy: -8 },
    personaEffects: { union_households: 7, black_voters: 5, small_business_owners: -6 },
    cost: { politicalCapital: 8 },
    constitutionalRisk: 20,
  },
  {
    id: 'regulatory_freeze',
    label: 'Regulatory Freeze Order',
    description: 'Halts pending federal regulations for review.',
    axisEffects: { government_reform: 10, economy: 5 },
    personaEffects: { small_business_owners: 6, libertarian_independents: 5, union_households: -5 },
    cost: { politicalCapital: 6 },
    constitutionalRisk: 15,
  },
  {
    id: 'clean_power_order',
    label: 'Clean Power Standards Order',
    description: 'Directs the EPA to tighten power-plant emissions standards by executive rule.',
    axisEffects: { climate: -12 },
    personaEffects: { young_progressives: 7, urban_professionals: 5, rural_working_class: -7, small_business_owners: -4 },
    cost: { politicalCapital: 10 },
    constitutionalRisk: 30,
  },
  {
    id: 'travel_vetting_restrictions',
    label: 'Travel & Vetting Restrictions Order',
    description: 'Imposes enhanced vetting requirements on travelers from designated regions.',
    axisEffects: { foreign: 8, immigration: 8 },
    personaEffects: { rural_working_class: 5, military_veteran_households: 5, hispanic_voters: -6, urban_professionals: -6, young_progressives: -6 },
    stakeholderEffects: { foreign_bloc_nonaligned: -8 },
    cost: { politicalCapital: 8 },
    constitutionalRisk: 35,
  },
  {
    id: 'policing_standards_order',
    label: 'Federal Policing Standards Order',
    description: 'Sets new use-of-force and accountability standards for federally funded police departments.',
    axisEffects: { crime: -10 },
    personaEffects: { black_voters: 7, young_progressives: 6, urban_professionals: 4, rural_working_class: -6, evangelical_conservatives: -4 },
    cost: { politicalCapital: 10 },
    constitutionalRisk: 25,
  },
  {
    id: 'student_loan_relief_order',
    label: 'Student Loan Relief Order',
    description: 'Cancels a portion of federal student loan balances by executive action.',
    axisEffects: { economy: -5 },
    personaEffects: { college_students: 9, young_progressives: 6, small_business_owners: -5, libertarian_independents: -6 },
    economyEffects: { deficit: 25 },
    cost: { politicalCapital: 12 },
    constitutionalRisk: 30,
  },
];
