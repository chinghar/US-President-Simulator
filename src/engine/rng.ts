/**
 * Deterministic PRNG (mulberry32). Operates as a pure step function over an
 * integer seed so the entire RNG state is a single serializable number
 * stored on GameState — never a closure, never global Math.random.
 */

export interface RngDraw {
  value: number; // [0, 1)
  nextSeed: number;
}

export function mulberry32Step(seed: number): RngDraw {
  let t = (seed + 0x6d2b79f5) | 0;
  const nextSeed = t;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextSeed };
}

/**
 * A mutable cursor over the seed, for convenience when a single reducer
 * call needs many draws. The cursor itself is never stored — only its
 * final `.seed` is written back into GameState.rngState, so replaying the
 * same starting seed through the same sequence of draws is guaranteed to
 * reproduce identical values.
 */
export class RngCursor {
  seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const { value, nextSeed } = mulberry32Step(this.seed);
    this.seed = nextSeed;
    return value;
  }

  /** Uniform float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Uniform float in [-magnitude, magnitude). */
  centered(magnitude: number): number {
    return this.range(-magnitude, magnitude);
  }
}
