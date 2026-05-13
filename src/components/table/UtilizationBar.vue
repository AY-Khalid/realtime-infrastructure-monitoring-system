<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  /** 0..100 */
  threshold?: { warning: number; critical: number };
}
const props = withDefaults(defineProps<Props>(), {
  threshold: () => ({ warning: 75, critical: 90 }),
});

const tone = computed(() => {
  if (props.value >= props.threshold.critical) return 'bg-danger';
  if (props.value >= props.threshold.warning) return 'bg-warning';
  return 'bg-accent';
});
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative h-1.5 w-14 overflow-hidden rounded-full bg-surface-inset">
      <div
        class="h-full transition-[width] duration-500 ease-out-expo"
        :class="tone"
        :style="{ width: `${Math.max(2, Math.min(100, value))}%` }"
      />
    </div>
    <span class="tab-num text-2xs text-content-secondary">{{ value.toFixed(1) }}%</span>
  </div>
</template>
