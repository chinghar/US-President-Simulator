import type { PriorOffice, PriorOfficeInfo } from '../engine/types';

export const PRIOR_OFFICES: Record<PriorOffice, PriorOfficeInfo> = {
  governor: {
    id: 'governor',
    name: 'Governor',
    description: 'Chief executive of a state — proven at running something, but tied to a home-state record.',
    baseStats: { nameRecognition: 55, warChest: 8_000_000, partyEstablishmentFavor: 20, baseEnthusiasm: 50 },
  },
  senator: {
    id: 'senator',
    name: 'U.S. Senator',
    description: 'National platform and a long voting record for opponents to mine.',
    baseStats: { nameRecognition: 60, warChest: 10_000_000, partyEstablishmentFavor: 25, baseEnthusiasm: 45 },
  },
  representative: {
    id: 'representative',
    name: 'U.S. Representative',
    description: 'Legislative experience without the baggage — or the recognition — of higher office.',
    baseStats: { nameRecognition: 30, warChest: 3_000_000, partyEstablishmentFavor: 15, baseEnthusiasm: 40 },
  },
  mayor: {
    id: 'mayor',
    name: 'Mayor',
    description: 'Hands-on executive record running a city, with limited national name recognition.',
    baseStats: { nameRecognition: 25, warChest: 2_000_000, partyEstablishmentFavor: 10, baseEnthusiasm: 45 },
  },
  business: {
    id: 'business',
    name: 'Business Leader',
    description: 'Deep personal resources and an outsider pitch, but no governing record and a skeptical party establishment.',
    baseStats: { nameRecognition: 35, warChest: 25_000_000, partyEstablishmentFavor: -10, baseEnthusiasm: 35 },
  },
  military: {
    id: 'military',
    name: 'Military Officer',
    description: 'Service record commands respect, especially on foreign policy and with veteran households.',
    baseStats: { nameRecognition: 40, warChest: 4_000_000, partyEstablishmentFavor: 5, baseEnthusiasm: 55 },
  },
  activist: {
    id: 'activist',
    name: 'Grassroots Activist',
    description: 'Movement energy and a devoted base, but thin institutional backing and the least starting money.',
    baseStats: { nameRecognition: 20, warChest: 1_000_000, partyEstablishmentFavor: -15, baseEnthusiasm: 60 },
  },
};

export const PRIOR_OFFICE_LIST: PriorOfficeInfo[] = Object.values(PRIOR_OFFICES);
