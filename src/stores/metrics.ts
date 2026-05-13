import { defineStore } from 'pinia';
import { computed, ref, shallowRef, triggerRef } from 'vue';
import { MAX_SERIES_POINTS } from '@/constants/streaming';
import { RingBuffer } from '@/utils/ringBuffer';
import { computeTrend } from '@/utils/trend';
import type {
  HeatmapCell,
  RegionHealth,
  ServerRow,
  TelemetryPayload,
  TelemetrySnapshot,
  TimeSeriesPoint,
} from '@/types';

interface SeriesBuckets {
  cpu: RingBuffer<TimeSeriesPoint>;
  memory: RingBuffer<TimeSeriesPoint>;
  requests: RingBuffer<TimeSeriesPoint>;
  networkIn: RingBuffer<TimeSeriesPoint>;
  networkOut: RingBuffer<TimeSeriesPoint>;
  errorRate: RingBuffer<TimeSeriesPoint>;
}

function createBuckets(): SeriesBuckets {
  const cap = MAX_SERIES_POINTS;
  return {
    cpu: new RingBuffer<TimeSeriesPoint>(cap),
    memory: new RingBuffer<TimeSeriesPoint>(cap),
    requests: new RingBuffer<TimeSeriesPoint>(cap),
    networkIn: new RingBuffer<TimeSeriesPoint>(cap),
    networkOut: new RingBuffer<TimeSeriesPoint>(cap),
    errorRate: new RingBuffer<TimeSeriesPoint>(cap),
  };
}

/**
 * Metrics store.
 *
 * Performance considerations:
 *   - Time-series live in `RingBuffer`s wrapped in *shallowRefs* so the deep
 *     reactivity system never proxies thousands of points.
 *   - The ring buffer itself is non-reactive: we trigger updates manually
 *     after each mutation. Chart components consume the buffer's `snapshot()`
 *     via getter-style accessors.
 *   - `latestSnapshot` is a regular ref because individual scalars need
 *     fine-grained reactivity for animated counters.
 */
export const useMetricsStore = defineStore('metrics', () => {
  const buckets = shallowRef<SeriesBuckets>(createBuckets());
  const latestSnapshot = ref<TelemetrySnapshot | null>(null);
  const servers = shallowRef<readonly ServerRow[]>([]);
  const heatmap = shallowRef<readonly HeatmapCell[]>([]);
  const regions = shallowRef<readonly RegionHealth[]>([]);
  const tickCount = ref(0);

  function applyTelemetry(payload: TelemetryPayload): void {
    const s = payload.snapshot;
    latestSnapshot.value = s;

    const b = buckets.value;
    b.cpu.push({ t: s.t, v: s.cpu });
    b.memory.push({ t: s.t, v: s.memory });
    b.requests.push({ t: s.t, v: s.requests });
    b.networkIn.push({ t: s.t, v: s.networkIn });
    b.networkOut.push({ t: s.t, v: s.networkOut });
    b.errorRate.push({ t: s.t, v: s.errorRate });
    // Manually flag the shallow ref so subscribers re-read.
    triggerRef(buckets);

    servers.value = payload.servers;
    heatmap.value = payload.heatmap;
    regions.value = payload.regions;
    tickCount.value += 1;
  }

  function reset(): void {
    buckets.value = createBuckets();
    latestSnapshot.value = null;
    servers.value = [];
    heatmap.value = [];
    regions.value = [];
    tickCount.value = 0;
    triggerRef(buckets);
  }

  /* -------------------------- Derived selectors --------------------------- */

  function series(key: keyof SeriesBuckets): TimeSeriesPoint[] {
    return buckets.value[key].snapshot();
  }

  const cpuTrend = computed(() => computeTrend(buckets.value.cpu.snapshot().map((p) => p.v)));
  const memoryTrend = computed(() => computeTrend(buckets.value.memory.snapshot().map((p) => p.v)));
  const requestsTrend = computed(() => computeTrend(buckets.value.requests.snapshot().map((p) => p.v)));
  const networkInTrend = computed(() => computeTrend(buckets.value.networkIn.snapshot().map((p) => p.v)));
  const errorTrend = computed(() => computeTrend(buckets.value.errorRate.snapshot().map((p) => p.v)));

  return {
    buckets,
    latestSnapshot,
    servers,
    heatmap,
    regions,
    tickCount,
    cpuTrend,
    memoryTrend,
    requestsTrend,
    networkInTrend,
    errorTrend,
    applyTelemetry,
    reset,
    series,
  };
});
