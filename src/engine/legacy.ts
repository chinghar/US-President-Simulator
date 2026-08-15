import { clamp, type GameDate, type GameState } from './types';
import { computeNationalApproval } from './support';

export type HistorianTier = 'Historic' | 'Great' | 'Above Average' | 'Average' | 'Below Average' | 'Failed Presidency';

export interface HistorianRanking {
  score: number; // 0..100
  tier: HistorianTier;
  breakdown: {
    averageApproval: number;
    finalApproval: number;
    billsPassedCount: number;
    economyScore: number;
    heldMidterms: boolean;
    reelected: boolean | null; // null if re-election never concluded (still governing / n/a)
  };
}

function tierFromScore(score: number): HistorianTier {
  if (score >= 85) return 'Historic';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Above Average';
  if (score >= 40) return 'Average';
  if (score >= 25) return 'Below Average';
  return 'Failed Presidency';
}

export function computeHistorianRanking(gameState: GameState): HistorianRanking {
  const history = gameState.history;
  const averageApproval = history.length > 0 ? history.reduce((sum, h) => sum + h.nationalApproval, 0) / history.length : 50;
  const finalApproval = computeNationalApproval(gameState);

  const governing = gameState.governing;
  const billsPassedCount = governing?.legislationHistory.filter((r) => r.status === 'passed').length ?? 0;

  const lastEconomy = history.length > 0 ? history[history.length - 1].economy : gameState.economy;
  const growthScore = clamp(50 + lastEconomy.gdpGrowth * 10, 0, 100);
  const unemploymentScore = clamp(50 - (lastEconomy.unemployment - 4.5) * 8, 0, 100);
  const economyScore = (growthScore + unemploymentScore) / 2;

  const reelected = governing?.reelection?.outcome === 'reelected' ? true : governing?.reelection?.outcome ? false : null;

  const score = clamp(
    averageApproval * 0.4 +
      finalApproval * 0.15 +
      economyScore * 0.2 +
      Math.min(billsPassedCount * 4, 20) +
      (reelected === true ? 5 : 0),
    0,
    100,
  );

  return {
    score,
    tier: tierFromScore(score),
    breakdown: {
      averageApproval,
      finalApproval,
      billsPassedCount,
      economyScore,
      heldMidterms: governing?.midtermsCompleted ?? false,
      reelected,
    },
  };
}

export interface LegacyBill {
  id: string;
  title: string;
  date: GameDate;
}

export function getSignatureAchievements(gameState: GameState): LegacyBill[] {
  const governing = gameState.governing;
  if (!governing) return [];
  return governing.legislationHistory
    .filter((r) => r.status === 'passed')
    .map((r) => ({ id: r.billId, title: r.title, date: r.date }))
    .concat(
      governing.executiveOrderHistory
        .filter((r) => !r.courtStruckDown)
        .map((r) => ({ id: r.orderId, title: r.title, date: r.date })),
    );
}

export function getBrokenPromises(gameState: GameState): LegacyBill[] {
  const governing = gameState.governing;
  if (!governing) return [];
  return governing.legislationHistory
    .filter((r) => r.status !== 'passed')
    .map((r) => ({ id: r.billId, title: `${r.title} (${r.status.replace(/_/g, ' ')})`, date: r.date }))
    .concat(
      governing.executiveOrderHistory
        .filter((r) => r.courtStruckDown)
        .map((r) => ({ id: r.orderId, title: `${r.title} (struck down)`, date: r.date })),
    );
}

export interface TimelineEntry {
  date: GameDate;
  label: string;
  kind: 'bill' | 'executive_order' | 'crisis';
}

export function getDecisionTimeline(gameState: GameState): TimelineEntry[] {
  const governing = gameState.governing;
  if (!governing) return [];
  const entries: TimelineEntry[] = [
    ...governing.legislationHistory.map((r) => ({ date: r.date, label: `${r.title} — ${r.status.replace(/_/g, ' ')}`, kind: 'bill' as const })),
    ...governing.executiveOrderHistory.map((r) => ({
      date: r.date,
      label: `${r.title}${r.courtStruckDown ? ' (struck down)' : ''}`,
      kind: 'executive_order' as const,
    })),
    ...governing.crisisHistory.map((r) => ({ date: r.date, label: r.title, kind: 'crisis' as const })),
  ];
  return entries.sort((a, b) => a.date.year * 12 + a.date.month - (b.date.year * 12 + b.date.month));
}
