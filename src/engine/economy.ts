import { BALANCE } from '../data/balance';
import { clamp, type EconomyEffects, type EconomyState } from './types';
import type { RngCursor } from './rng';

/**
 * One month of macroeconomic simulation. Growth, unemployment, and inflation
 * are mutually interacting (Okun's-law-style and Phillips-curve-style
 * coupling) and each mean-reverts toward a long-run reference absent policy
 * or shocks, plus a bounded random shock drawn from the supplied RngCursor.
 */
export function advanceEconomy(economy: EconomyState, policy: EconomyEffects, rng: RngCursor): EconomyState {
  const e = BALANCE.economy;
  const shock = rng.centered(e.GROWTH_SHOCK_MAGNITUDE);

  const gdpGrowth = clamp(
    economy.gdpGrowth +
      (policy.gdpGrowth ?? 0) +
      e.MEAN_REVERSION_GROWTH * (e.POTENTIAL_GROWTH - economy.gdpGrowth) -
      e.INFLATION_DRAG_ON_GROWTH * (economy.inflation - e.TARGET_INFLATION) +
      shock,
    e.GDP_GROWTH_MIN,
    e.GDP_GROWTH_MAX,
  );

  const unemployment = clamp(
    economy.unemployment +
      (policy.unemployment ?? 0) -
      e.OKUN_COEFFICIENT * (gdpGrowth - e.POTENTIAL_GROWTH) +
      e.MEAN_REVERSION_UNEMPLOYMENT * (e.NATURAL_UNEMPLOYMENT - economy.unemployment),
    e.UNEMPLOYMENT_MIN,
    e.UNEMPLOYMENT_MAX,
  );

  const inflation = clamp(
    economy.inflation +
      (policy.inflation ?? 0) +
      e.PHILLIPS_COEFFICIENT * (e.NATURAL_UNEMPLOYMENT - unemployment) +
      e.MEAN_REVERSION_INFLATION * (e.TARGET_INFLATION - economy.inflation) +
      shock * 0.3,
    e.INFLATION_MIN,
    e.INFLATION_MAX,
  );

  const deficit =
    economy.deficit +
    (policy.deficit ?? 0) +
    e.BASELINE_DEFICIT_DRIFT -
    e.TAX_REVENUE_SENSITIVITY * (gdpGrowth - e.POTENTIAL_GROWTH);

  const debtToGdp = clamp(
    economy.debtToGdp + deficit / e.DEBT_SCALE_FACTOR - gdpGrowth * e.DEBT_GROWTH_RELIEF,
    e.DEBT_TO_GDP_MIN,
    e.DEBT_TO_GDP_MAX,
  );

  return { gdpGrowth, unemployment, inflation, deficit, debtToGdp };
}

export function createInitialEconomy(): EconomyState {
  const e = BALANCE.economy;
  return {
    gdpGrowth: e.POTENTIAL_GROWTH,
    unemployment: e.NATURAL_UNEMPLOYMENT,
    inflation: e.TARGET_INFLATION,
    deficit: 1100, // roughly today's real-world annualized federal deficit scale, in $B
    debtToGdp: 120,
  };
}
