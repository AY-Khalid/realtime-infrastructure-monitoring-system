<script setup lang="ts">
import { computed } from 'vue';
import type { Tone } from '@/types';
import { useChartTokens } from '@/composables/useChartTokens';
import type { TimeSeriesPoint } from '@/types';

interface Props {
  points: readonly TimeSeriesPoint[];
  tone?: Tone;
  width?: number;
  height?: number;
  fill?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'accent',
  width: 120,
  height: 36,
  fill: true,
});

const tokens = useChartTokens();

const color = computed(() => {
  const t = tokens.value;
  switch (props.tone) {
    case 'success': return t.success;
    case 'warning': return t.warning;
    case 'danger': return t.danger;
    case 'info': return t.info;
    case 'accent': return t.accent;
    default: return t.textMuted;
  }
});

const path = computed(() => {
  const pts = props.points;
  if (pts.length < 2) return { line: '', area: '' };
  const w = props.width;
  const h = props.height;
  let min = Infinity;
  let max = -Infinity;
  for (const p of pts) {
    if (p.v < min) min = p.v;
    if (p.v > max) max = p.v;
  }
  const range = Math.max(0.0001, max - min);
  const step = w / (pts.length - 1);
  const xy = pts.map((p, i) => {
    const x = i * step;
    const y = h - 2 - ((p.v - min) / range) * (h - 4);
    return [x, y] as const;
  });
  // Smoothed cardinal-ish path using simple quadratic curves
  let line = `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`;
  for (let i = 1; i < xy.length; i += 1) {
    const [x1, y1] = xy[i - 1];
    const [x2, y2] = xy[i];
    const mx = (x1 + x2) / 2;
    line += ` Q ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  const area = `${line} L ${(w).toFixed(1)} ${h} L 0 ${h} Z`;
  return { line, area };
});
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    role="img"
    aria-hidden="true"
    class="block h-9 w-full overflow-visible"
  >
    <defs>
      <linearGradient :id="`spark-${tone}`" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.32" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill" :d="path.area" :fill="`url(#spark-${tone})`" />
    <path :d="path.line" fill="none" :stroke="color" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>
