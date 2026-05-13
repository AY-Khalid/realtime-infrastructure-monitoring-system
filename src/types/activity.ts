import { z } from 'zod';
import { RegionSchema } from './telemetry';

export const SeveritySchema = z.enum(['info', 'warning', 'critical']);
export type Severity = z.infer<typeof SeveritySchema>;

export const ActivityKindSchema = z.enum([
  'cpu_spike',
  'memory_threshold',
  'server_disconnected',
  'request_surge',
  'node_recovered',
  'suspicious_traffic',
  'deploy',
  'scaling_event',
]);
export type ActivityKind = z.infer<typeof ActivityKindSchema>;

export const ActivityEventSchema = z.object({
  id: z.string().min(1),
  t: z.number().int().nonnegative(),
  kind: ActivityKindSchema,
  severity: SeveritySchema,
  title: z.string().min(1).max(160),
  detail: z.string().max(320).optional(),
  region: RegionSchema.optional(),
  serverId: z.string().max(64).optional(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
