import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Region / Server                                                           */
/* -------------------------------------------------------------------------- */

export const RegionSchema = z.enum([
  'us-east',
  'us-west',
  'eu-west',
  'eu-central',
  'ap-south',
  'ap-northeast',
  'sa-east',
]);
export type Region = z.infer<typeof RegionSchema>;

export const ServerStatusSchema = z.enum(['healthy', 'degraded', 'critical', 'offline']);
export type ServerStatus = z.infer<typeof ServerStatusSchema>;

/* -------------------------------------------------------------------------- */
/*  Time-series samples                                                       */
/* -------------------------------------------------------------------------- */

export const TimeSeriesPointSchema = z.object({
  t: z.number().int().nonnegative(), // epoch ms
  v: z.number().finite(),
});
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;

/* -------------------------------------------------------------------------- */
/*  Core telemetry snapshot                                                   */
/* -------------------------------------------------------------------------- */

export const TelemetrySnapshotSchema = z.object({
  t: z.number().int().nonnegative(),
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  requests: z.number().int().nonnegative(),
  networkIn: z.number().nonnegative(), // Mbps
  networkOut: z.number().nonnegative(), // Mbps
  errorRate: z.number().min(0).max(100), // percent
  activeServers: z.number().int().nonnegative(),
});
export type TelemetrySnapshot = z.infer<typeof TelemetrySnapshotSchema>;

/* -------------------------------------------------------------------------- */
/*  Server-level row (per-server breakdown)                                   */
/* -------------------------------------------------------------------------- */

export const ServerRowSchema = z.object({
  t: z.number().int().nonnegative(),
  serverId: z.string().min(1).max(64),
  region: RegionSchema,
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  traffic: z.number().nonnegative(),
  status: ServerStatusSchema,
});
export type ServerRow = z.infer<typeof ServerRowSchema>;

/* -------------------------------------------------------------------------- */
/*  Region heatmap cell                                                       */
/* -------------------------------------------------------------------------- */

export const HeatmapCellSchema = z.object({
  region: RegionSchema,
  node: z.string().min(1),
  load: z.number().min(0).max(100),
});
export type HeatmapCell = z.infer<typeof HeatmapCellSchema>;

/* -------------------------------------------------------------------------- */
/*  Radar — per-region scoring                                                */
/* -------------------------------------------------------------------------- */

export const RegionHealthSchema = z.object({
  region: RegionSchema,
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  latency: z.number().min(0).max(100),
  uptime: z.number().min(0).max(100),
  throughput: z.number().min(0).max(100),
  errors: z.number().min(0).max(100),
});
export type RegionHealth = z.infer<typeof RegionHealthSchema>;
