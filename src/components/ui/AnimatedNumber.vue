<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useAnimatedNumber } from '@/composables/useAnimatedNumber';
import { formatNumber, formatCompact } from '@/utils/format';

interface Props {
  value: number;
  /** Display formatter: 'auto' picks compact for >= 10k */
  format?: 'plain' | 'compact' | 'percent' | 'auto';
  digits?: 0 | 1 | 2;
  suffix?: string;
  prefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  digits: 1,
});

const source = toRef(props, 'value');
const animated = useAnimatedNumber(source, { duration: 700 });

const formatted = computed(() => {
  const v = animated.value;
  if (props.format === 'percent') return `${v.toFixed(props.digits)}%`;
  if (props.format === 'compact') return formatCompact(v, props.digits);
  if (props.format === 'auto') {
    if (Math.abs(v) >= 10_000) return formatCompact(v, props.digits);
    return formatNumber(v, props.digits);
  }
  return formatNumber(v, props.digits);
});
</script>

<template>
  <span class="tab-num inline-flex items-baseline gap-0.5">
    <span v-if="prefix" class="text-content-muted">{{ prefix }}</span>
    <span>{{ formatted }}</span>
    <span v-if="suffix" class="text-content-muted text-xs">{{ suffix }}</span>
  </span>
</template>
