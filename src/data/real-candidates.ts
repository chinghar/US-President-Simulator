import { ISSUE_AXES, type AxisPositions, type Party, type PriorOffice, type StateId } from '../engine/types';

/**
 * The "2028 Hypothetical Candidates" roster — real, named public officials
 * usable as a player's starting identity in a clearly fictional simulation.
 *
 * `facts` are objectively verifiable (current/prior office, state, party,
 * dates of service) as of `REAL_CANDIDATES_AS_OF`, sourced from official
 * government pages, congressional records, and state election authorities.
 * No subjective characterization, no personal-conduct claims, no quotes,
 * and no assertion that anyone listed has declared an actual candidacy for
 * president.
 *
 * `startingPositions` are gameplay estimates, not factual claims — see the
 * disclaimer in RealCandidateGallery.tsx. Each populated axis is grounded in
 * a specific, repeatedly-documented public position (a signed law, a
 * consistent voting record, a headline campaign pledge); axes are left at 0
 * wherever the record is genuinely mixed, unclear, or simply wasn't the
 * subject of this pass's research, rather than guessed at. Magnitudes are
 * deliberately kept well short of the +/-100 extremes for the same reason.
 * The player can move every slider before launching.
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
  startingPositions: AxisPositions;
}

export const REAL_CANDIDATES_AS_OF = 'August 2026';

function positions(overrides: Partial<AxisPositions>): AxisPositions {
  const base = {} as AxisPositions;
  for (const axis of ISSUE_AXES) base[axis] = 0;
  return { ...base, ...overrides };
}

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
    // Economy/healthcare: 2024 "opportunity economy" platform (child tax
    // credit expansion, capital-gains and corporate tax increases, federal
    // housing investment). Social: reproductive rights was the central
    // theme of her 2024 campaign.
    startingPositions: positions({ economy: -25, healthcare: -15, social: -30 }),
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
    // Climate: signature climate-investment and clean-energy record.
    // Social: long record as an early, prominent supporter of marriage
    // equality and other socially liberal positions since his time as SF
    // mayor. Economy: large state housing/homelessness spending priorities.
    startingPositions: positions({ climate: -35, economy: -20, social: -30 }),
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
    // Social: signed Michigan's Reproductive Health Act and repealed prior
    // abortion restrictions. Healthcare: pushed to codify ACA protections
    // into state law. Climate: pursued a 100% clean-energy standard.
    startingPositions: positions({ social: -30, healthcare: -20, climate: -25 }),
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
    // Healthcare: has proposed funding increases and expanded Medicaid/state
    // program access. His broader record (economic development, fiscal
    // policy) reads as more centrist, so other axes are left neutral.
    startingPositions: positions({ healthcare: -20 }),
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
    // Widely described (including by his own framing) as a market-friendly
    // "democratic capitalist" — progressive on climate and democracy
    // reform, closer to the center on economic policy specifically, so
    // economy is left neutral.
    startingPositions: positions({ climate: -20, social: -20, government_reform: -15 }),
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
    // Social: signed sweeping abortion-access protections, positioning
    // Illinois as a regional safe haven. Economy: signed a $15 minimum wage.
    startingPositions: positions({ social: -30, economy: -20 }),
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
    // Economy: signed a $15 minimum wage and family tax credits.
    // Government reform: signature "transform state workforce systems" and
    // service-modernization agenda.
    startingPositions: positions({ economy: -25, government_reform: -15 }),
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
    // Widely and consistently described as a pragmatic, cross-partisan
    // Southern Democrat who deliberately moderates on cultural issues; he
    // has also signed income-tax-rate reductions, unusual for a Democratic
    // governor. Kept to one modest, well-documented axis for that reason.
    startingPositions: positions({ economy: 10 }),
  },
  {
    id: 'aoc',
    name: 'Alexandria Ocasio-Cortez',
    age: 36,
    party: 'democrat',
    homeState: 'NY',
    priorOffice: 'representative',
    facts: ["U.S. Representative for New York's 14th congressional district (since January 2019)"],
    // Economy/climate: lead co-author of the Green New Deal resolution,
    // which pairs decarbonization with a federal jobs guarantee. Healthcare:
    // House sponsor of the Medicare for All Act (single-payer). These are
    // among the most consistently and publicly documented positions of
    // anyone on this roster.
    startingPositions: positions({ economy: -35, healthcare: -35, climate: -35, social: -20 }),
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
    // Foreign policy is Rubio's long-standing, defining signature (China,
    // Cuba, and Iran hawk) and the portfolio of his current office; other
    // axes left neutral since his domestic-policy record has shifted over
    // a long Senate career and wasn't the subject of this research pass.
    startingPositions: positions({ foreign: 35 }),
  },
  {
    id: 'vance',
    name: 'JD Vance',
    age: 42,
    party: 'republican',
    homeState: 'OH',
    priorOffice: 'senator',
    facts: ['Vice President of the United States (since January 2025)', 'U.S. Senator from Ohio (2023–2025)'],
    // Immigration enforcement is Vance's clearest, most consistent position.
    // His economic views (tariff-driven trade populism) and foreign-policy
    // views (Ukraine-skeptical, China-focused) don't map cleanly onto
    // either end of this game's economy/foreign axes, so both are left
    // neutral rather than forced into a left-right frame that doesn't fit.
    startingPositions: positions({ immigration: 35 }),
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
    // Immigration and social/cultural policy (curriculum law, gender-related
    // restrictions, anti-DEI measures) are DeSantis's defining, extensively
    // documented signature issues.
    startingPositions: positions({ immigration: 35, social: 35 }),
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
    // Border security (Operation Lone Star) is explicitly his defining
    // signature issue. Property-tax relief is his other consistently
    // stated legislative priority.
    startingPositions: positions({ immigration: 35, economy: 25 }),
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
    // Economy: consistent tax-cut agenda (income tax, grocery tax, property
    // tax limits). Social/government reform: parents'-rights and
    // school-choice policy was his defining campaign and governing theme.
    startingPositions: positions({ economy: 25, social: 20, government_reform: 15 }),
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
    // Opportunity Zones — a tax-incentive-driven private investment
    // program — is Scott's signature legislative achievement.
    startingPositions: positions({ economy: 25 }),
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
    // A long, consistent record opposing a path to citizenship and
    // authoring border-enforcement legislation (the EL CHAPO Act, the SAVE
    // Act, the Laken Riley Act).
    startingPositions: positions({ immigration: 30 }),
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
    // Foreign policy hawkishness (China, Iran, Russia sanctions, Ukraine
    // aid) is her clearest, most consistent signature. Economic platform
    // (balanced budget, business tax cuts) is real but more conventional,
    // so kept modest.
    startingPositions: positions({ foreign: 35, economy: 20 }),
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
    // Eliminating Ohio's state income tax and cutting capital-gains and
    // property taxes is the central pledge of his 2026 campaign.
    // Government reform follows directly from his DOGE background and
    // "faster-moving state agencies" pitch.
    startingPositions: positions({ economy: 35, government_reform: 25 }),
  },
];
