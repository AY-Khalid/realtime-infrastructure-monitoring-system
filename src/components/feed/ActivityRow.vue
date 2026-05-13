<script setup lang="ts">
import { computed } from 'vue';
import type { ActivityEvent, Severity, Tone } from '@/types';
import BaseBadge from '../ui/BaseBadge.vue';
import { formatRelative, formatTime } from '@/utils/format';

interface Props {
  event: ActivityEvent;
  now: number;
  height: number;
  top: number;
}
const props = defineProps<Props>();

const sevTone = computed<{ tone: Tone; label: string }>(() => {
  const s: Severity = props.event.severity;
  if (s === 'critical') return { tone: 'danger', label: 'Critical' };
  if (s === 'warning') return { tone: 'warning', label: 'Warning' };
  return { tone: 'info', label: 'Info' };
});
</script>

<template>
  <div
    class="absolute left-0 right-0 px-4"
    :style="{ transform: `translateY(${top}px)`, height: `${height}px` }"
  >
    <div
      class="flex h-full items-start gap-3 border-b border-border-subtle py-2.5"
    >
      <div class="mt-1 flex w-16 shrink-0 flex-col items-start">
        <BaseBadge :tone="sevTone.tone" dot size="sm">{{ sevTone.label }}</BaseBadge>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <p class="truncate text-xs font-medium text-content-primary">{{ event.title }}</p>
          <time
            class="shrink-0 text-2xs tab-num text-content-muted"
            :title="formatTime(event.t)"
          >
            {{ formatRelative(event.t, now) }}
          </time>
        </div>
        <p v-if="event.detail" class="mt-0.5 truncate text-2xs text-content-muted">{{ event.detail }}</p>
      </div>
    </div>
  </div>
</template>
