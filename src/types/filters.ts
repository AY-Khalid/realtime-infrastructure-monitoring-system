import type { Severity } from './activity';
import type { Region, ServerStatus } from './telemetry';

export type TimeRangeKey = 'live' | '1m' | '5m' | '15m';

export interface TimeRangeOption {
  key: TimeRangeKey;
  label: string;
  /** Window size in ms (0 means "live tail"). */
  windowMs: number;
}

export interface ActivityFilter {
  severities: Severity[];
  search: string;
}

export interface ServerTableFilter {
  region: Region | 'all';
  status: ServerStatus | 'all';
  search: string;
}

export interface DatasetToggles {
  cpu: boolean;
  memory: boolean;
  requests: boolean;
  networkIn: boolean;
  networkOut: boolean;
  errorRate: boolean;
}
