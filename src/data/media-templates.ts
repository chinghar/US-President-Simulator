/**
 * Headline templates keyed by framing. {decision} is substituted with the
 * month's most notable action (bill, EO, or crisis response); when nothing
 * notable happened, a "quiet month" filler is used instead.
 */
export const HEADLINE_TEMPLATES = {
  positive: [
    '{decision} Hailed as a Turning Point',
    'White House Scores Major Win with {decision}',
    '{decision} Draws Praise from Across the Aisle',
  ],
  neutral: [
    'White House Moves Forward with {decision}',
    '{decision}: What It Means for Americans',
    'Administration Advances {decision}',
  ],
  negative: [
    '{decision} Draws Sharp Criticism',
    'Backlash Grows Over {decision}',
    '{decision} Called a Costly Misstep',
  ],
  quiet: [
    'A Quiet Month at the White House',
    'No Major Moves From the Administration This Month',
    'White House Holds Steady Amid Calm News Cycle',
  ],
} as const;

export type HeadlineFraming = keyof typeof HEADLINE_TEMPLATES;
