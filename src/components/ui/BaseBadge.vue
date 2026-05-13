<script setup lang="ts">
import { computed } from 'vue';
import type { Tone } from '@/types';

interface Props {
  tone?: Tone;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  dot: false,
  size: 'sm',
});

const toneClass = computed(() => {
  switch (props.tone) {
    case 'accent':
      return 'bg-accent-soft text-accent';
    case 'success':
      return 'bg-success-soft text-success';
    case 'warning':
      return 'bg-warning-soft text-warning';
    case 'danger':
      return 'bg-danger-soft text-danger';
    case 'info':
      return 'bg-info-soft text-info';
    default:
      return 'bg-surface-inset text-content-secondary';
  }
});

const sizeClass = computed(() =>
  props.size === 'md' ? 'h-6 px-2 text-xs' : 'h-5 px-1.5 text-2xs',
);

const dotClass = computed(() => {
  switch (props.tone) {
    case 'success':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'danger':
      return 'bg-danger';
    case 'info':
      return 'bg-info';
    case 'accent':
      return 'bg-accent';
    default:
      return 'bg-content-muted';
  }
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-medium tab-num"
    :class="[toneClass, sizeClass]"
  >
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full" :class="dotClass" />
    <slot />
  </span>
</template>
