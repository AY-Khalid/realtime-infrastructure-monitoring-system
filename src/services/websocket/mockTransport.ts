/**
 * In-process "WebSocket-shaped" transport. Models latency, jitter,
 * disconnects, and reconnect backoff so the UI sees the same lifecycle it
 * would over a real socket — but without a server.
 *
 * NOTE: this purposefully mimics the WebSocket-like API (onMessage / onOpen /
 * onClose / close / send) so swapping in a real WebSocket later is trivial:
 * just provide a class with the same shape.
 */

import {
  DISCONNECT_RATE,
  LATENCY_MAX_MS,
  LATENCY_MIN_MS,
  MALFORMED_PAYLOAD_RATE,
} from '@/constants/streaming';
import { randomFloat, randomInt } from '@/utils/math';

export type TransportMessage = { ok: true; data: unknown } | { ok: false; reason: string };
export type TransportStatus = 'opening' | 'open' | 'closing' | 'closed';

export interface TransportEvents {
  onOpen?: () => void;
  onClose?: (reason?: string) => void;
  onMessage?: (msg: TransportMessage) => void;
  onLatency?: (ms: number) => void;
}

export class MockTransport {
  private status: TransportStatus = 'closed';
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private inflight = new Set<ReturnType<typeof setTimeout>>();
  private events: TransportEvents = {};
  private manualClose = false;

  on(events: TransportEvents): void {
    this.events = { ...this.events, ...events };
  }

  /** Async open with a realistic handshake delay. */
  open(): void {
    if (this.status === 'open' || this.status === 'opening') return;
    this.manualClose = false;
    this.status = 'opening';
    const delay = randomInt(120, 320);
    this.openTimer = setTimeout(() => {
      this.openTimer = null;
      this.status = 'open';
      this.events.onOpen?.();
    }, delay);
  }

  /**
   * "Send" a payload — in this mock, the streaming engine writes payloads
   * straight to this method which then dispatches them to listeners after
   * a simulated latency, occasionally corrupting them.
   */
  send(payload: unknown): void {
    if (this.status !== 'open') return;

    // Random spontaneous disconnect
    if (Math.random() < DISCONNECT_RATE) {
      this.close('simulated network drop');
      return;
    }

    const latency = randomFloat(LATENCY_MIN_MS, LATENCY_MAX_MS);
    const t = setTimeout(() => {
      this.inflight.delete(t);
      if (this.status !== 'open') return;
      this.events.onLatency?.(Math.round(latency));
      if (Math.random() < MALFORMED_PAYLOAD_RATE) {
        // Strip a critical field at random to exercise schema validation
        const corrupted = corrupt(payload);
        this.events.onMessage?.({ ok: true, data: corrupted });
      } else {
        this.events.onMessage?.({ ok: true, data: payload });
      }
    }, latency);
    this.inflight.add(t);
  }

  close(reason = 'closed'): void {
    if (this.status === 'closed') return;
    this.manualClose = reason === 'manual';
    this.status = 'closing';
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
    for (const t of this.inflight) clearTimeout(t);
    this.inflight.clear();
    this.status = 'closed';
    this.events.onClose?.(reason);
  }

  get isOpen(): boolean {
    return this.status === 'open';
  }

  get wasManualClose(): boolean {
    return this.manualClose;
  }
}

function corrupt(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const copy: any = Array.isArray(payload) ? [...payload] : { ...(payload as object) };
  if (Array.isArray(copy)) return copy;
  const keys = Object.keys(copy);
  if (keys.length === 0) return copy;
  const drop = keys[randomInt(0, keys.length - 1)];
  delete copy[drop];
  return copy;
}
