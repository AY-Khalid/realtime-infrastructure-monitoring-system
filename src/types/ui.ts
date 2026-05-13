export type Theme = 'light' | 'dark';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export type Size = 'sm' | 'md' | 'lg';

export interface KpiTrend {
  direction: 'up' | 'down' | 'flat';
  /** Percentage change as a fraction (e.g. 0.043 = +4.3%) */
  delta: number;
}
