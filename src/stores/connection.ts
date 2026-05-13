import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ConnectionMeta, ConnectionState } from '@/types';

export const useConnectionStore = defineStore('connection', () => {
  const state = ref<ConnectionState>('idle');
  const attempt = ref(0);
  const nextRetryMs = ref(0);
  const reason = ref<string | null>(null);
  const latencyMs = ref<number | null>(null);
  const lastConnectedAt = ref<number | null>(null);

  function setState(next: ConnectionState, meta?: ConnectionMeta): void {
    state.value = next;
    if (meta?.attempt !== undefined) attempt.value = meta.attempt;
    if (meta?.nextRetryMs !== undefined) nextRetryMs.value = meta.nextRetryMs;
    if (meta?.reason !== undefined) reason.value = meta.reason;
    if (meta?.latencyMs !== undefined) latencyMs.value = meta.latencyMs;
    if (next === 'connected') {
      lastConnectedAt.value = Date.now();
      reason.value = null;
    }
  }

  const isConnected = computed(() => state.value === 'connected');
  const isReconnecting = computed(() => state.value === 'reconnecting' || state.value === 'connecting');
  const isOffline = computed(() => state.value === 'disconnected');
  const isPaused = computed(() => state.value === 'paused');

  return {
    state,
    attempt,
    nextRetryMs,
    reason,
    latencyMs,
    lastConnectedAt,
    isConnected,
    isReconnecting,
    isOffline,
    isPaused,
    setState,
  };
});
