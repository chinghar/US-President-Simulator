import { ISSUE_AXES, type IssueAxisId } from '../engine/types';

export interface IssueAxisInfo {
  id: IssueAxisId;
  name: string;
  /** Label shown at the -100 end of the slider. */
  leftLabel: string;
  /** Label shown at the +100 end of the slider. */
  rightLabel: string;
  description: string;
}

export const ISSUES: Record<IssueAxisId, IssueAxisInfo> = {
  economy: {
    id: 'economy',
    name: 'Economy & Taxes',
    leftLabel: 'Tax & spend',
    rightLabel: 'Cut & deregulate',
    description: 'Tax policy, spending priorities, and regulation of business.',
  },
  immigration: {
    id: 'immigration',
    name: 'Immigration',
    leftLabel: 'Open & path to citizenship',
    rightLabel: 'Restrict & enforce',
    description: 'Border policy, legal immigration levels, and enforcement.',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    leftLabel: 'Government-run',
    rightLabel: 'Market-based',
    description: "The government's role in providing and paying for healthcare.",
  },
  crime: {
    id: 'crime',
    name: 'Crime & Policing',
    leftLabel: 'Reform-focused',
    rightLabel: 'Enforcement-focused',
    description: 'Policing, sentencing, and the criminal justice system.',
  },
  climate: {
    id: 'climate',
    name: 'Climate & Energy',
    leftLabel: 'Green transition',
    rightLabel: 'Fossil-fuel expansion',
    description: 'Energy production and climate policy.',
  },
  foreign: {
    id: 'foreign',
    name: 'Foreign Policy & Defense',
    leftLabel: 'Diplomacy-first',
    rightLabel: 'Hawkish & military-first',
    description: "America's posture abroad and defense spending.",
  },
  social: {
    id: 'social',
    name: 'Social & Cultural Issues',
    leftLabel: 'Progressive',
    rightLabel: 'Traditionalist',
    description: 'Cultural and social-values questions.',
  },
  government_reform: {
    id: 'government_reform',
    name: 'Government Reform',
    leftLabel: 'Expand & modernize',
    rightLabel: 'Shrink & devolve',
    description: 'The size, structure, and reach of the federal government itself.',
  },
};

export const ISSUE_LIST: IssueAxisInfo[] = ISSUE_AXES.map((id) => ISSUES[id]);
