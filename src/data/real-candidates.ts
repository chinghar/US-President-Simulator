import type { Party, PriorOffice, StateId } from '../engine/types';

/**
 * The "2028 Hypothetical Candidates" roster — real, named public officials
 * usable as a player's starting identity in a clearly fictional simulation.
 *
 * Every field here is an objectively verifiable fact (current/prior office,
 * state, party, dates of service) as of the `factsAsOf` date, sourced from
 * official government pages, congressional records, and state election
 * authorities. No subjective characterization, no personal-conduct claims,
 * no quotes, and no assertion that anyone listed has declared an actual
 * candidacy for president. See real-candidate-mode.ts for the gameplay
 * constraints this roster is paired with (no traits, no fabricated quotes,
 * no scandal/personal-conduct events).
 */
export interface RealCandidate {
  id: string;
  name: string;
  age: number;
  party: Party;
  homeState: StateId;
  /** Closest-fitting category for the engine's (unused-for-these-characters)
   * starting-stat model — not shown to the player as a description. */
  priorOffice: PriorOffice;
  /** Objectively verifiable facts only, most significant/current first. */
  facts: string[];
}

export const REAL_CANDIDATES_AS_OF = 'August 2026';

export const REAL_CANDIDATES: RealCandidate[] = [
  {
    id: 'harris',
    name: 'Kamala Harris',
    age: 61,
    party: 'democrat',
    homeState: 'CA',
    priorOffice: 'senator',
    facts: [
      'Vice President of the United States (2021–2025)',
      'U.S. Senator from California (2017–2021)',
      'Attorney General of California (2011–2017)',
      'District Attorney of San Francisco (2004–2011)',
      '2024 Democratic nominee for President',
    ],
  },
  {
    id: 'newsom',
    name: 'Gavin Newsom',
    age: 58,
    party: 'democrat',
    homeState: 'CA',
    priorOffice: 'governor',
    facts: [
      'Governor of California (since January 2019; current term ends January 2027, term-limited)',
      'Lieutenant Governor of California (2011–2019)',
      'Mayor of San Francisco (2004–2011)',
    ],
  },
  {
    id: 'whitmer',
    name: 'Gretchen Whitmer',
    age: 54,
    party: 'democrat',
    homeState: 'MI',
    priorOffice: 'governor',
    facts: [
      'Governor of Michigan (since January 2019; current term ends January 2027, term-limited)',
      'Michigan State Senate, including Senate Minority Leader (2006–2015)',
      'Michigan House of Representatives (2001–2006)',
    ],
  },
  {
    id: 'shapiro',
    name: 'Josh Shapiro',
    age: 53,
    party: 'democrat',
    homeState: 'PA',
    priorOffice: 'governor',
    facts: [
      'Governor of Pennsylvania (since January 2023; running for reelection in 2026)',
      'Attorney General of Pennsylvania (2017–2023)',
      'Montgomery County Commissioner (2012–2017)',
      'Pennsylvania House of Representatives (2005–2012)',
    ],
  },
  {
    id: 'buttigieg',
    name: 'Pete Buttigieg',
    age: 44,
    party: 'democrat',
    homeState: 'IN',
    priorOffice: 'mayor',
    facts: [
      'U.S. Secretary of Transportation (2021–2025)',
      'Mayor of South Bend, Indiana (2012–2020)',
      '2020 Democratic presidential candidate',
    ],
  },
  {
    id: 'pritzker',
    name: 'JB Pritzker',
    age: 61,
    party: 'democrat',
    homeState: 'IL',
    priorOffice: 'business',
    facts: [
      'Governor of Illinois (since January 2019; running for a third term in 2026)',
      'No prior elected office; venture capital and private equity investor before taking office',
    ],
  },
  {
    id: 'moore',
    name: 'Wes Moore',
    age: 47,
    party: 'democrat',
    homeState: 'MD',
    priorOffice: 'business',
    facts: [
      'Governor of Maryland (since January 2023; running for reelection in 2026)',
      'CEO, Robin Hood Foundation (2017–2021)',
      'No prior elected office before the governorship',
    ],
  },
  {
    id: 'beshear',
    name: 'Andy Beshear',
    age: 48,
    party: 'democrat',
    homeState: 'KY',
    priorOffice: 'governor',
    facts: [
      'Governor of Kentucky (since December 2019; current term ends December 2027)',
      'Attorney General of Kentucky (2016–2019)',
    ],
  },
  {
    id: 'aoc',
    name: 'Alexandria Ocasio-Cortez',
    age: 36,
    party: 'democrat',
    homeState: 'NY',
    priorOffice: 'representative',
    facts: ["U.S. Representative for New York's 14th congressional district (since January 2019)"],
  },
  {
    id: 'rubio',
    name: 'Marco Rubio',
    age: 55,
    party: 'republican',
    homeState: 'FL',
    priorOffice: 'senator',
    facts: [
      'U.S. Secretary of State (since January 2025)',
      'U.S. Senator from Florida (2011–2025)',
      'Speaker of the Florida House of Representatives (2006–2008)',
      'Florida House of Representatives (2000–2008)',
    ],
  },
  {
    id: 'vance',
    name: 'JD Vance',
    age: 42,
    party: 'republican',
    homeState: 'OH',
    priorOffice: 'senator',
    facts: ['Vice President of the United States (since January 2025)', 'U.S. Senator from Ohio (2023–2025)'],
  },
  {
    id: 'desantis',
    name: 'Ron DeSantis',
    age: 47,
    party: 'republican',
    homeState: 'FL',
    priorOffice: 'governor',
    facts: [
      'Governor of Florida (since January 2019; current term ends January 2027, term-limited)',
      "U.S. Representative for Florida's 6th congressional district (2013–2018)",
      '2024 Republican presidential candidate',
    ],
  },
  {
    id: 'abbott',
    name: 'Greg Abbott',
    age: 68,
    party: 'republican',
    homeState: 'TX',
    priorOffice: 'governor',
    facts: [
      'Governor of Texas (since January 2015; running for a fourth term in 2026)',
      'Attorney General of Texas (2002–2015)',
      'Justice, Texas Supreme Court (1996–2001)',
    ],
  },
  {
    id: 'youngkin',
    name: 'Glenn Youngkin',
    age: 59,
    party: 'republican',
    homeState: 'VA',
    priorOffice: 'governor',
    facts: [
      'Governor of Virginia (January 2022–January 2026; term-limited, succeeded by Abigail Spanberger)',
      'Co-CEO, The Carlyle Group (2018–2020)',
      'No prior elected office before the governorship',
    ],
  },
  {
    id: 'scott',
    name: 'Tim Scott',
    age: 60,
    party: 'republican',
    homeState: 'SC',
    priorOffice: 'senator',
    facts: [
      'U.S. Senator from South Carolina (since January 2013)',
      'Chair, Senate Banking Committee (since January 2025)',
      "U.S. Representative for South Carolina's 1st congressional district (2011–2013)",
      '2024 Republican presidential candidate',
    ],
  },
  {
    id: 'cruz',
    name: 'Ted Cruz',
    age: 55,
    party: 'republican',
    homeState: 'TX',
    priorOffice: 'senator',
    facts: [
      'U.S. Senator from Texas (since January 2013; current term runs through January 2031)',
      'Chair, Senate Commerce Committee (since January 2025)',
      'Solicitor General of Texas (2003–2008)',
      '2016 Republican presidential candidate',
    ],
  },
  {
    id: 'haley',
    name: 'Nikki Haley',
    age: 54,
    party: 'republican',
    homeState: 'SC',
    priorOffice: 'governor',
    facts: [
      'U.S. Ambassador to the United Nations (2017–2018)',
      'Governor of South Carolina (2011–2017)',
      'South Carolina House of Representatives (2005–2011)',
      '2024 Republican presidential candidate',
    ],
  },
  {
    id: 'ramaswamy',
    name: 'Vivek Ramaswamy',
    age: 41,
    party: 'republican',
    homeState: 'OH',
    priorOffice: 'business',
    facts: [
      'Republican candidate for Governor of Ohio in the November 2026 election (does not yet hold elected office)',
      'Co-lead, Department of Government Efficiency (January–February 2025)',
      '2024 Republican presidential candidate',
      'No prior elected office',
    ],
  },
];
