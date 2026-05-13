import { onBeforeUnmount, onMounted } from 'vue';
import { useConnectionStore } from '@/stores/connection';
import { useMetricsStore } from '@/stores/metrics';
import { useActivityStore } from '@/stores/activity';
import { createStreamingService } from '@/services/streaming';
import type { StreamPayload, ConnectionState, ConnectionMeta } from '@/types';

/**
 * Wires the streaming service to the Pinia stores. Single mount-point — the
 * dashboard page calls this once on mount and we tear everything down on
 * unmount. Stores are the single source of truth from here on.
 */
export function useStreaming() {
  const connection = useConnectionStore();
  const metrics = useMetricsStore();
  const activity = useActivityStore();

  const service = createStreamingService();

  const onPayload = (payload: StreamPayload): void => {
    if (payload.type === 'telemetry') {
      metrics.applyTelemetry(payload);
    } else {
      activity.appendEvents(payload.events);
    }
  };

  const onState = (state: ConnectionState, meta?: ConnectionMeta): void => {
    connection.setState(state, meta);
  };

  onMounted(() => {
    service.onPayload(onPayload);
    service.onState(onState);
    service.start();
  });

  onBeforeUnmount(() => {
    service.stop();
  });

  return {
    pause: () => service.pause(),
    resume: () => service.resume(),
    isPaused: () => service.isPaused(),
    forceDisconnect: () => service.simulateDisconnect(),
  };
}
