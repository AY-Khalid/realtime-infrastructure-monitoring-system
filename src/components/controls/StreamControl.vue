<script setup lang="ts">
import { computed } from 'vue';
import { useConnectionStore } from '@/stores/connection';
import BaseButton from '../ui/BaseButton.vue';
import Icon from '../ui/Icon.vue';
import Tooltip from '../ui/Tooltip.vue';

interface Props {
  paused: boolean;
}
defineProps<Props>();

const emit = defineEmits<{ (e: 'toggle'): void; (e: 'disconnect'): void }>();

const connection = useConnectionStore();
const stateLabel = computed(() => {
  switch (connection.state) {
    case 'connected': return 'Live';
    case 'reconnecting': return 'Reconnecting';
    case 'connecting': return 'Connecting';
    case 'disconnected': return 'Offline';
    case 'paused': return 'Paused';
    default: return 'Idle';
  }
});

const dotClass = computed(() => {
  switch (connection.state) {
    case 'connected': return 'bg-success';
    case 'reconnecting':
    case 'connecting': return 'bg-warning animate-pulse-soft';
    case 'disconnected': return 'bg-danger';
    case 'paused': return 'bg-info';
    default: return 'bg-content-muted';
  }
});
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-raised px-2.5 py-1.5"
    >
      <span class="relative flex h-2 w-2">
        <span
          v-if="connection.state === 'connected'"
          class="absolute inset-0 rounded-full animate-live-ping"
        />
        <span class="h-2 w-2 rounded-full" :class="dotClass" />
      </span>
      <span class="text-2xs font-medium uppercase tracking-wide text-content-secondary tab-num">
        {{ stateLabel }}
        <span v-if="connection.latencyMs !== null && connection.state === 'connected'" class="ml-1 text-content-muted">
          {{ connection.latencyMs }}ms
        </span>
      </span>
    </div>
    <Tooltip :label="paused ? 'Resume streaming' : 'Pause streaming'">
      <BaseButton size="sm" variant="secondary" icon-only @click="emit('toggle')">
        <Icon :name="paused ? 'play' : 'pause'" :size="14" />
      </BaseButton>
    </Tooltip>
    <Tooltip label="Simulate disconnect">
      <BaseButton size="sm" variant="ghost" icon-only @click="emit('disconnect')">
        <Icon name="refresh" :size="14" />
      </BaseButton>
    </Tooltip>
  </div>
</template>
