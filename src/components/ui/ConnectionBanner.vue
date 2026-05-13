<script setup lang="ts">
import { computed } from 'vue';
import { useConnectionStore } from '@/stores/connection';
import { storeToRefs } from 'pinia';

const connection = useConnectionStore();
const { state, attempt, nextRetryMs, reason } = storeToRefs(connection);

const visible = computed(() => state.value !== 'connected');

const tone = computed(() => {
  switch (state.value) {
    case 'reconnecting':
    case 'connecting':
      return 'border-warning/40 bg-warning-soft/60 text-warning';
    case 'disconnected':
      return 'border-danger/40 bg-danger-soft/60 text-danger';
    case 'paused':
      return 'border-info/40 bg-info-soft/60 text-info';
    default:
      return 'border-border-subtle bg-surface-inset text-content-secondary';
  }
});

const message = computed(() => {
  switch (state.value) {
    case 'connecting':
      return 'Establishing live stream…';
    case 'reconnecting':
      return `Reconnecting · attempt ${attempt.value} · retry in ${Math.round(nextRetryMs.value / 100) / 10}s${reason.value ? ` · ${reason.value}` : ''}`;
    case 'disconnected':
      return `Disconnected${reason.value ? ` — ${reason.value}` : ''}. Live updates are paused.`;
    case 'paused':
      return 'Streaming paused. Click resume to continue.';
    case 'idle':
      return 'Initializing telemetry pipeline…';
    default:
      return '';
  }
});

const indicatorClass = computed(() => {
  switch (state.value) {
    case 'reconnecting':
    case 'connecting':
      return 'bg-warning animate-pulse-soft';
    case 'disconnected':
      return 'bg-danger';
    case 'paused':
      return 'bg-info';
    default:
      return 'bg-content-muted';
  }
});
</script>

<template>
  <transition
    enter-active-class="transition-all duration-200 ease-out-expo"
    leave-active-class="transition-all duration-150 ease-in"
    enter-from-class="-translate-y-2 opacity-0"
    leave-to-class="-translate-y-2 opacity-0"
  >
    <div
      v-if="visible"
      role="status"
      class="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-xs font-medium shadow-soft backdrop-blur"
      :class="tone"
    >
      <span class="h-2 w-2 rounded-full" :class="indicatorClass" aria-hidden="true" />
      <span class="tab-num">{{ message }}</span>
    </div>
  </transition>
</template>
