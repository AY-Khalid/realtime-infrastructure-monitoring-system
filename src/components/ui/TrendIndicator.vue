<script setup lang="ts">
import { computed } from 'vue';
import { formatDelta } from '@/utils/format';
import type { KpiTrend } from '@/types';

interface Props {
  trend: KpiTrend;
  /** When true, "up" is bad (e.g. error rate). */
  invert?: boolean;
}

const props = withDefaults(defineProps<Props>(), { invert: false });

const tone = computed(() => {
  if (props.trend.direction === 'flat') return 'text-content-muted';
  const goodUp = !props.invert;
  const goingUp = props.trend.direction === 'up';
  const good = goodUp === goingUp;
  return good ? 'text-success' : 'text-danger';
});

const arrow = computed(() =>
  props.trend.direction === 'up' ? '↑' : props.trend.direction === 'down' ? '↓' : '·',
);
</script>

<template>
  <span class="inline-flex items-center gap-1 text-2xs font-semibold tab-num" :class="tone">
    <span aria-hidden="true">{{ arrow }}</span>
    <span>{{ formatDelta(trend.delta) }}</span>
  </span>
</template>
