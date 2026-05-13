import type { TimeRangeOption } from '@/types';

export const TIME_RANGES: TimeRangeOption[] = [
  { key: 'live', label: 'Real-time', windowMs: 0 },
  { key: '1m', label: 'Last 1m', windowMs: 60_000 },
  { key: '5m', label: 'Last 5m', windowMs: 5 * 60_000 },
  { key: '15m', label: 'Last 15m', windowMs: 15 * 60_000 },
];

export const DEFAULT_TIME_RANGE = TIME_RANGES[0].key;
