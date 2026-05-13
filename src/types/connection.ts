import { z } from 'zod';
import { TelemetrySnapshotSchema, ServerRowSchema, HeatmapCellSchema, RegionHealthSchema } from './telemetry';
import { ActivityEventSchema } from './activity';

/* Connection lifecycle */
export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'paused';

/* -------------------------------------------------------------------------- */
/*  Wire payloads                                                             */
/* -------------------------------------------------------------------------- */

export const TelemetryPayloadSchema = z.object({
  type: z.literal('telemetry'),
  snapshot: TelemetrySnapshotSchema,
  servers: z.array(ServerRowSchema),
  heatmap: z.array(HeatmapCellSchema),
  regions: z.array(RegionHealthSchema),
});

export const ActivityPayloadSchema = z.object({
  type: z.literal('activity'),
  events: z.array(ActivityEventSchema),
});

export const StreamPayloadSchema = z.discriminatedUnion('type', [
  TelemetryPayloadSchema,
  ActivityPayloadSchema,
]);

export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;
export type ActivityPayload = z.infer<typeof ActivityPayloadSchema>;
export type StreamPayload = z.infer<typeof StreamPayloadSchema>;

/* -------------------------------------------------------------------------- */
/*  Listener callback                                                         */
/* -------------------------------------------------------------------------- */

export type StreamListener = (payload: StreamPayload) => void;
export type ConnectionListener = (state: ConnectionState, meta?: ConnectionMeta) => void;

export interface ConnectionMeta {
  attempt?: number;
  nextRetryMs?: number;
  reason?: string;
  latencyMs?: number;
}
