import type { DebateEvent } from '../engine/types';

/**
 * Scheduled primary debates. Bold answers stake out a real position
 * (axisEffects, permanent) for a bigger momentum swing; safe answers avoid
 * the risk but score worse. Adding a debate is a pure data-file edit.
 */
export const DEBATES: DebateEvent[] = [
  {
    id: 'opening_economic_debate',
    name: 'Opening Economic Debate',
    month: 1,
    year: 2028,
    question: 'The moderator asks: how would you respond to rising cost-of-living concerns?',
    answers: [
      { id: 'tax_relief', label: 'Propose targeted tax relief and expanded subsidies for middle-class families', debateScoreDelta: 6, axisEffects: { economy: -5 } },
      { id: 'deregulate', label: 'Call for deregulation and tax cuts to spur business investment', debateScoreDelta: 6, axisEffects: { economy: 8 } },
      { id: 'safe_nonanswer', label: 'Give a cautious, poll-tested non-answer', debateScoreDelta: -4 },
      { id: 'attack_media', label: "Attack the moderator's premise as media bias", debateScoreDelta: 2, axisEffects: { government_reform: 6 } },
    ],
  },
  {
    id: 'foreign_policy_immigration_faceoff',
    name: 'Foreign Policy & Immigration Faceoff',
    month: 3,
    year: 2028,
    question: "Where do you stand on the border and America's role abroad?",
    answers: [
      { id: 'hawkish', label: 'Commit to a hawkish, enforcement-first stance', debateScoreDelta: 6, axisEffects: { immigration: 10, foreign: 10 } },
      { id: 'diplomacy_first', label: 'Call for a diplomacy-first, humane immigration overhaul', debateScoreDelta: 6, axisEffects: { immigration: -10, foreign: -10 } },
      { id: 'talking_points', label: 'Stick to rehearsed talking points, avoid specifics', debateScoreDelta: -3 },
      { id: 'pivot_attack', label: 'Pivot to attacking a rival by name', debateScoreDelta: 3 },
    ],
  },
  {
    id: 'closing_argument',
    name: 'Late-Primary Closing Argument',
    month: 5,
    year: 2028,
    question: 'Make your closing case on healthcare and government reform.',
    answers: [
      { id: 'public_healthcare', label: 'Champion expanding government-run healthcare', debateScoreDelta: 7, axisEffects: { healthcare: -12 } },
      { id: 'market_healthcare', label: 'Champion market-based healthcare reform', debateScoreDelta: 7, axisEffects: { healthcare: 12 } },
      { id: 'reform_pitch', label: 'Promise sweeping government reform and term limits', debateScoreDelta: 5, axisEffects: { government_reform: 10 } },
      { id: 'generalities', label: 'Play it safe with generalities', debateScoreDelta: -3 },
    ],
  },
];
