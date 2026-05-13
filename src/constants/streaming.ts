/**
 * Streaming engine tuning. Tightly bounded so memory stays flat under
 * sustained 24/7 streaming.
 */

/** Telemetry tick cadence (ms). */
export const TELEMETRY_INTERVAL_MS = 1_000;

/** Activity event tick cadence (ms) — irregular within the engine. */
export const ACTIVITY_INTERVAL_MIN_MS = 1_500;
export const ACTIVITY_INTERVAL_MAX_MS = 4_500;

/** Max time-series points retained per series (sliding window). */
export const MAX_SERIES_POINTS = 120;

/** Max activity events retained in memory. */
export const MAX_ACTIVITY_EVENTS = 500;

/** Probability the engine emits a malformed payload (to exercise validation). */
export const MALFORMED_PAYLOAD_RATE = 0.012;

/** Probability of a simulated disconnect on any given tick. */
export const DISCONNECT_RATE = 0.004;

/** Reconnect backoff (exponential, capped). */
export const RECONNECT_BASE_MS = 800;
export const RECONNECT_MAX_MS = 12_000;
export const RECONNECT_MAX_ATTEMPTS = 8;

/** Simulated network latency (ms). */
export const LATENCY_MIN_MS = 18;
export const LATENCY_MAX_MS = 70;
