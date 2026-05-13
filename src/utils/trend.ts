import type { KpiTrend } from '@/types';

/**
 * Compute a delta-style trend from a recent series. Compares last value to
 * the median of the prior segment to dampen single-spike noise.
 */
export function computeTrend(series: number[]): KpiTrend {
  if (series.length < 4) return { direction: 'flat', delta: 0 };
  const head = series[series.length - 1];
  const priorSlice = series.slice(-12, -2);
  if (priorSlice.length === 0) return { direction: 'flat', delta: 0 };
  const sorted = [...priorSlice].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (median === 0) return { direction: head > 0 ? 'up' : 'flat', delta: 0 };
  const delta = (head - median) / Math.max(1e-6, Math.abs(median));
  if (Math.abs(delta) < 0.005) return { direction: 'flat', delta };
  return { direction: delta > 0 ? 'up' : 'down', delta };
}
