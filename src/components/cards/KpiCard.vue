<script setup lang="ts">
import type { Tone, KpiTrend, TimeSeriesPoint } from '@/types';
import BaseCard from '../ui/BaseCard.vue';
import AnimatedNumber from '../ui/AnimatedNumber.vue';
import TrendIndicator from '../ui/TrendIndicator.vue';
import Sparkline from '../charts/Sparkline.vue';
import Icon from '../ui/Icon.vue';
import BaseSkeleton from '../ui/BaseSkeleton.vue';

interface Props {
  label: string;
  value: number;
  format?: 'plain' | 'compact' | 'percent' | 'auto';
  digits?: 0 | 1 | 2;
  suffix?: string;
  prefix?: string;
  icon: string;
  tone?: Tone;
  trend?: KpiTrend;
  invertTrend?: boolean;
  spark?: readonly TimeSeriesPoint[];
  loading?: boolean;
}
withDefaults(defineProps<Props>(), {
  tone: 'accent',
  digits: 1,
  format: 'auto',
});
</script>

<template>
  <BaseCard padded>
    <div class="flex flex-col gap-3">
      <!-- Header row: icon + label -->
      <div class="flex items-center gap-2">
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          :class="{
            'bg-accent-soft text-accent': tone === 'accent',
            'bg-success-soft text-success': tone === 'success',
            'bg-warning-soft text-warning': tone === 'warning',
            'bg-danger-soft text-danger': tone === 'danger',
            'bg-info-soft text-info': tone === 'info',
            'bg-surface-inset text-content-secondary': tone === 'neutral',
          }"
        >
          <Icon :name="icon" :size="14" />
        </span>
        <h4 class="truncate text-2xs font-medium uppercase tracking-wide text-content-muted">
          {{ label }}
        </h4>
      </div>

      <!-- Value + trend -->
      <div class="flex items-baseline gap-2 text-2xl font-semibold tracking-tight leading-none">
        <BaseSkeleton v-if="loading" height="2rem" width="6rem" />
        <AnimatedNumber
          v-else
          :value="value"
          :format="format"
          :digits="digits"
          :suffix="suffix"
          :prefix="prefix"
        />
      </div>

      <div v-if="trend && !loading" class="-mt-1.5 flex items-center gap-1.5">
        <TrendIndicator :trend="trend" :invert="invertTrend" />
        <span class="text-2xs text-content-muted">vs. baseline</span>
      </div>

      <!-- Sparkline anchored to the bottom of the card -->
      <div v-if="spark && spark.length > 1" class="mt-1">
        <Sparkline :points="spark" :tone="tone" :width="240" :height="36" class="w-full" />
      </div>
    </div>
  </BaseCard>
</template>
