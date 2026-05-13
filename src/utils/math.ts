export function clamp(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function round(v: number, digits = 2): number {
  const m = 10 ** digits;
  return Math.round(v * m) / m;
}

/** Standard normal via Box-Muller. */
export function gaussian(mean = 0, stdDev = 1): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const n = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return n * stdDev + mean;
}

/** Weighted random pick — weights need not sum to 1. */
export function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
