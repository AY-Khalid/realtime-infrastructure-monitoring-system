/**
 * Streaming engine — the single orchestration point.
 *
 * Responsibilities:
 *   1. Run the telemetry & activity simulation on intervals.
 *   2. Push payloads through the (mocked) transport so consumers see realistic
 *      message latency, malformed payloads, and disconnects.
 *   3. Manage the connection lifecycle: connecting → connected → reconnecting
 *      (exponential backoff, capped attempts) → disconnected.
 *   4. Validate every payload coming back from the transport with Zod before
 *      handing it to listeners.
 *
 * Public surface is intentionally tiny so it can be swapped for a real
 * websocket transport without touching consumers.
 */

import {
  ACTIVITY_INTERVAL_MAX_MS,
  ACTIVITY_INTERVAL_MIN_MS,
  RECONNECT_BASE_MS,
  RECONNECT_MAX_ATTEMPTS,
  RECONNECT_MAX_MS,
  TELEMETRY_INTERVAL_MS,
} from '@/constants/streaming';
import { StreamPayloadSchema } from '@/types/connection';
import type {
  ConnectionListener,
  ConnectionState,
  StreamListener,
  StreamPayload,
} from '@/types';
import { safeParse } from '@/utils/safeParse';
import { randomInt } from '@/utils/math';
import { TelemetryGenerator } from '../mock';
import { MockTransport } from '../websocket';

export interface StreamingService {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  simulateDisconnect(): void;
  onPayload(listener: StreamListener): () => void;
  onState(listener: ConnectionListener): () => void;
}

export function createStreamingService(): StreamingService {
  const generator = new TelemetryGenerator();
  const transport = new MockTransport();

  const payloadListeners = new Set<StreamListener>();
  const stateListeners = new Set<ConnectionListener>();

  let telemetryTimer: ReturnType<typeof setInterval> | null = null;
  let activityTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let connectionState: ConnectionState = 'idle';
  let paused = false;
  let stopped = false;

  const emitState = (next: ConnectionState, meta?: { attempt?: number; nextRetryMs?: number; reason?: string; latencyMs?: number }): void => {
    connectionState = next;
    for (const l of stateListeners) l(next, meta);
  };

  /* --------------------------- transport plumbing -------------------------- */

  transport.on({
    onOpen: () => {
      reconnectAttempt = 0;
      emitState('connected');
      startTickers();
    },
    onClose: (reason) => {
      stopTickers();
      if (stopped) {
        emitState('disconnected', { reason });
        return;
      }
      if (transport.wasManualClose) {
        emitState('disconnected', { reason });
        return;
      }
      scheduleReconnect(reason);
    },
    onLatency: (ms) => {
      // Only emit latency while connected; keeps the banner stable
      if (connectionState === 'connected') {
        emitState('connected', { latencyMs: ms });
      }
    },
    onMessage: (msg) => {
      if (!msg.ok) return;
      const parsed = safeParse<StreamPayload>(StreamPayloadSchema, msg.data, 'stream-payload');
      if (!parsed) return;
      for (const l of payloadListeners) l(parsed);
    },
  });

  /* ----------------------------- reconnect FSM ----------------------------- */

  function scheduleReconnect(reason?: string): void {
    if (reconnectAttempt >= RECONNECT_MAX_ATTEMPTS) {
      emitState('disconnected', { reason: reason ?? 'max retries' });
      return;
    }
    reconnectAttempt += 1;
    const backoff = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_BASE_MS * 2 ** (reconnectAttempt - 1),
    );
    const jitter = Math.round(backoff * (0.85 + Math.random() * 0.3));
    emitState('reconnecting', {
      attempt: reconnectAttempt,
      nextRetryMs: jitter,
      reason,
    });
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      transport.open();
      emitState('connecting', { attempt: reconnectAttempt });
    }, jitter);
  }

  /* ------------------------------- tickers --------------------------------- */

  function startTickers(): void {
    stopTickers();
    if (paused) return;

    telemetryTimer = setInterval(() => {
      const payload = generator.tick(Date.now());
      transport.send(payload);
    }, TELEMETRY_INTERVAL_MS);

    scheduleActivity();
  }

  function scheduleActivity(): void {
    const delay = randomInt(ACTIVITY_INTERVAL_MIN_MS, ACTIVITY_INTERVAL_MAX_MS);
    activityTimer = setTimeout(() => {
      activityTimer = null;
      if (paused || stopped) return;
      const count = randomInt(1, 3);
      const events = Array.from({ length: count }, () => generator.emitActivity(Date.now()));
      transport.send({ type: 'activity', events });
      scheduleActivity();
    }, delay);
  }

  function stopTickers(): void {
    if (telemetryTimer) {
      clearInterval(telemetryTimer);
      telemetryTimer = null;
    }
    if (activityTimer) {
      clearTimeout(activityTimer);
      activityTimer = null;
    }
  }

  /* -------------------------------- API ------------------------------------ */

  return {
    start(): void {
      stopped = false;
      paused = false;
      reconnectAttempt = 0;
      emitState('connecting');
      transport.open();
    },
    stop(): void {
      stopped = true;
      stopTickers();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      transport.close('manual');
      payloadListeners.clear();
      stateListeners.clear();
    },
    pause(): void {
      if (paused) return;
      paused = true;
      stopTickers();
      emitState('paused');
    },
    resume(): void {
      if (!paused) return;
      paused = false;
      if (transport.isOpen) {
        emitState('connected');
        startTickers();
      } else {
        emitState('connecting');
        transport.open();
      }
    },
    isPaused(): boolean {
      return paused;
    },
    simulateDisconnect(): void {
      transport.close('user-triggered drop test');
    },
    onPayload(listener): () => void {
      payloadListeners.add(listener);
      return () => payloadListeners.delete(listener);
    },
    onState(listener): () => void {
      stateListeners.add(listener);
      return () => stateListeners.delete(listener);
    },
  };
}
