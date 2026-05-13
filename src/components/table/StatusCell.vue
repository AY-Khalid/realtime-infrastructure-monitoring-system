<script setup lang="ts">
import { computed } from 'vue';
import type { ServerStatus } from '@/types';
import BaseBadge from '../ui/BaseBadge.vue';

const props = defineProps<{ status: ServerStatus }>();

const tone = computed(() => {
  switch (props.status) {
    case 'healthy': return 'success' as const;
    case 'degraded': return 'warning' as const;
    case 'critical': return 'danger' as const;
    default: return 'neutral' as const;
  }
});
const label = computed(() =>
  props.status === 'healthy'
    ? 'Healthy'
    : props.status === 'degraded'
      ? 'Degraded'
      : props.status === 'critical'
        ? 'Critical'
        : 'Offline',
);
</script>

<template>
  <BaseBadge :tone="tone" dot size="sm">{{ label }}</BaseBadge>
</template>
