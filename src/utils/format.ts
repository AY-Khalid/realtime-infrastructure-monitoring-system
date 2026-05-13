/**
 * Number, time, and unit formatters. All formatters are SSR-safe and produce
 * stable output across runs (locale fixed to en-US for consistency).
 */

const NUM_0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const NUM_1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const NUM_2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const PCT_1 = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

export function formatNumber(v: number, digits: 0 | 1 | 2 = 0): string {
  if (!Number.isFinite(v)) return '—';
  if (digits === 0) return NUM_0.format(v);
  if (digits === 1) return NUM_1.format(v);
  return NUM_2.format(v);
}

export function formatPercent(v: number, digits: 0 | 1 | 2 = 1): string {
  if (!Number.isFinite(v)) return '—';
  const pct = v > 1 ? v / 100 : v; // accept both fraction and percent
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: digits }).format(pct);
}

export function formatDelta(delta: number, digits: 0 | 1 | 2 = 1): string {
  if (!Number.isFinite(delta)) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: digits }).format(delta)}`;
}

const UNITS = ['', 'K', 'M', 'B', 'T'];
export function formatCompact(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return '—';
  const sign = v < 0 ? '-' : '';
  let n = Math.abs(v);
  let i = 0;
  while (n >= 1000 && i < UNITS.length - 1) {
    n /= 1000;
    i += 1;
  }
  return `${sign}${n.toFixed(i === 0 ? 0 : digits)}${UNITS[i]}`;
}

export function formatBytesPerSecond(mbps: number): string {
  if (!Number.isFinite(mbps)) return '—';
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gb/s`;
  return `${mbps.toFixed(mbps < 10 ? 2 : 1)} Mb/s`;
}

/* -------------------------------------------------------------------------- */
/*  Time formatters                                                           */
/* -------------------------------------------------------------------------- */

const TIME_FMT = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const DATETIME_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatTime(ts: number): string {
  return TIME_FMT.format(ts);
}

export function formatDateTime(ts: number): string {
  return DATETIME_FMT.format(ts);
}

export function formatRelative(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ts);
  if (diff < 1_000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/** Force-pad an integer to N digits — useful in monospace contexts. */
export function pad(n: number, width: number): string {
  const s = String(Math.abs(Math.floor(n)));
  return (n < 0 ? '-' : '') + (s.length >= width ? s : '0'.repeat(width - s.length) + s);
}

/** Quick string-safe truncation. */
export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1)}…`;
}

/** Internal export so tests / SSR have a deterministic formatter. */
export const _internals = { PCT_1 };
