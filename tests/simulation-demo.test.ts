import { describe, expect, it } from 'vitest';
import { advanceMonth, computeAllPersonaSupport, createInitialGameState } from '../src/engine';
import { SAMPLE_DECISIONS } from '../src/data/decisions';

/**
 * Phase 1 checkpoint demo: runs a 12-month sample and prints a table to the
 * console so the simulation's output can be eyeballed for plausibility, not
 * just asserted on. Run with `npm test` — vitest shows console output for
 * passing tests when run non-silently (the default).
 */
describe('12-month sample simulation (checkpoint demo)', () => {
  it('runs 12 months, applying one representative decision per quarter, and prints a summary table', () => {
    let state = createInitialGameState({ seed: 2028 });
    const rows: Record<string, string | number>[] = [];

    for (let month = 1; month <= 12; month++) {
      const decisions = month % 3 === 0 ? [SAMPLE_DECISIONS[(month / 3 - 1) % SAMPLE_DECISIONS.length]] : [];
      state = advanceMonth(state, decisions);

      const support = computeAllPersonaSupport(state);
      rows.push({
        Month: `${state.date.month}/${state.date.year}`,
        Decision: decisions[0]?.label ?? '—',
        'GDP Growth': state.economy.gdpGrowth.toFixed(2),
        Unemployment: state.economy.unemployment.toFixed(2),
        Inflation: state.economy.inflation.toFixed(2),
        'Deficit ($B)': state.economy.deficit.toFixed(0),
        Approval: state.history[state.history.length - 1].nationalApproval.toFixed(1),
        'Political Capital': state.politicalCapital.toFixed(1),
        'Union HH': support.union_households.total.toFixed(1),
        'Small Biz': support.small_business_owners.total.toFixed(1),
      });
    }

    // eslint-disable-next-line no-console
    console.log('\n--- Phase 1 checkpoint: 12-month sample simulation ---');
    // eslint-disable-next-line no-console
    console.table(rows);

    expect(state.date).toEqual({ month: 1, year: 2029 });
    expect(state.monthIndex).toBe(12);
    expect(state.history.length).toBe(12);
    // Union households and small-business owners should have visibly diverged
    // after a quarter of alternating tax-the-rich / cut-corporate-tax decisions.
    const finalSupport = computeAllPersonaSupport(state);
    expect(finalSupport.union_households.total).not.toBeCloseTo(finalSupport.small_business_owners.total, 0);
  });
});
