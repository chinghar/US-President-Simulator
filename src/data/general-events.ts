import type { DebateEvent } from '../engine/types';

/**
 * The three general-election debates plus the October surprise, reusing the
 * same DebateEvent/DebateAnswerOption shape as the primary debates. October
 * carries two events (the second debate and the surprise) — the engine
 * resolves every event scheduled for the current month in one turn, the same
 * way it batches same-month primary contests.
 */
export const GENERAL_EVENTS: DebateEvent[] = [
  {
    id: 'first_general_debate',
    name: 'First Presidential Debate',
    month: 9,
    year: 2028,
    question: 'The first debate turns to the state of the economy and the cost of living.',
    answers: [
      { id: 'defend_record', label: 'Defend a steady, incremental economic record', debateScoreDelta: 5 },
      { id: 'bold_reform', label: 'Call for bold economic reform', debateScoreDelta: 6, axisEffects: { economy: -10 } },
      { id: 'pro_growth', label: 'Promise pro-growth tax and regulatory cuts', debateScoreDelta: 6, axisEffects: { economy: 10 } },
      { id: 'deflect', label: "Deflect to attacking the opponent's character", debateScoreDelta: -3 },
    ],
  },
  {
    id: 'second_general_debate',
    name: 'Second Presidential Debate',
    month: 10,
    year: 2028,
    question: 'The moderator presses both candidates on immigration and border policy.',
    answers: [
      { id: 'enforcement_first', label: 'Commit to enforcement-first border policy', debateScoreDelta: 6, axisEffects: { immigration: 12 } },
      { id: 'reform_path', label: 'Call for comprehensive immigration reform', debateScoreDelta: 6, axisEffects: { immigration: -12 } },
      { id: 'measured', label: 'Give a measured, detail-heavy answer', debateScoreDelta: 3 },
      { id: 'nonanswer', label: 'Avoid specifics entirely', debateScoreDelta: -4 },
    ],
  },
  {
    id: 'october_surprise',
    name: 'October Surprise',
    month: 10,
    year: 2028,
    question:
      'Three weeks out, leaked documents allege irregularities in a past campaign contract. The story is spreading fast and reporters want a response tonight.',
    answers: [
      { id: 'full_transparency', label: 'Release all records and take questions immediately', debateScoreDelta: 8 },
      { id: 'lawyer_up', label: 'Refer everything to lawyers and say nothing further', debateScoreDelta: -6 },
      { id: 'counterattack', label: "Counterattack the opponent's own record", debateScoreDelta: 2, axisEffects: { government_reform: 5 } },
      { id: 'quiet_settlement', label: 'Quietly settle the underlying dispute and move on', debateScoreDelta: -2 },
    ],
  },
  {
    id: 'third_general_debate',
    name: 'Final Presidential Debate',
    month: 11,
    year: 2028,
    question: 'In the final debate before Election Day, both candidates are asked to make their closing case.',
    answers: [
      { id: 'unity_pitch', label: 'Make a unity, bring-the-country-together pitch', debateScoreDelta: 6 },
      { id: 'sharpen_contrast', label: "Sharpen the contrast with the opponent's record", debateScoreDelta: 6 },
      { id: 'policy_details', label: 'Close with detailed policy specifics', debateScoreDelta: 4 },
      { id: 'safe_close', label: 'Play it safe with a generic closing statement', debateScoreDelta: -3 },
    ],
  },
];
