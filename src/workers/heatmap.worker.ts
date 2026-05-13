/**
 * Heatmap aggregation worker.
 *
 * The current build computes heatmap state on the main thread because the
 * volume (≈ 56 cells × 1 Hz) is trivial. This worker is provided as a
 * future-proofing seam: switch to it when fan-out grows past a few thousand
 * cells per tick.
 *
 * Usage:
 *   const w = new Worker(new URL('./heatmap.worker.ts', import.meta.url), { type: 'module' });
 *   w.postMessage({ type: 'tick', cells: [...] });
 *   w.onmessage = (e) => { ... };
 */

export interface HeatmapTickIn {
  type: 'tick';
  cells: { key: string; load: number }[];
}

export interface HeatmapTickOut {
  type: 'aggregated';
  /** key -> rolling average load */
  aggregates: Record<string, number>;
}

const decay = 0.78;
const state: Record<string, number> = Object.create(null);

self.onmessage = (e: MessageEvent<HeatmapTickIn>) => {
  const msg = e.data;
  if (!msg || msg.type !== 'tick') return;
  for (const c of msg.cells) {
    const prev = state[c.key] ?? c.load;
    state[c.key] = prev * decay + c.load * (1 - decay);
  }
  const out: HeatmapTickOut = { type: 'aggregated', aggregates: { ...state } };
  (self as DedicatedWorkerGlobalScope).postMessage(out);
};

export {};
