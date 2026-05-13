import type { ActivityKind, Severity } from '@/types';

interface ActivityTemplate {
  kind: ActivityKind;
  severity: Severity;
  title: string;
  detail: (ctx: { serverId: string; region: string }) => string;
  weight: number;
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    kind: 'cpu_spike',
    severity: 'warning',
    title: 'CPU spike detected',
    detail: ({ serverId, region }) => `Sustained CPU > 92% on ${serverId} (${region}).`,
    weight: 14,
  },
  {
    kind: 'memory_threshold',
    severity: 'warning',
    title: 'Memory threshold exceeded',
    detail: ({ serverId }) => `${serverId} crossed 90% memory utilization.`,
    weight: 12,
  },
  {
    kind: 'server_disconnected',
    severity: 'critical',
    title: 'Server disconnected',
    detail: ({ serverId, region }) => `${serverId} (${region}) stopped responding to health probes.`,
    weight: 4,
  },
  {
    kind: 'request_surge',
    severity: 'info',
    title: 'Request surge detected',
    detail: ({ region }) => `Edge requests up 38% in ${region} over the last 60s.`,
    weight: 10,
  },
  {
    kind: 'node_recovered',
    severity: 'info',
    title: 'Node recovered',
    detail: ({ serverId }) => `${serverId} returned to healthy state after auto-healing.`,
    weight: 9,
  },
  {
    kind: 'suspicious_traffic',
    severity: 'critical',
    title: 'Suspicious traffic pattern',
    detail: ({ region }) => `Anomalous request signature observed in ${region}.`,
    weight: 3,
  },
  {
    kind: 'deploy',
    severity: 'info',
    title: 'Deployment completed',
    detail: ({ region }) => `Rolling deploy finished in ${region} (zero downtime).`,
    weight: 6,
  },
  {
    kind: 'scaling_event',
    severity: 'info',
    title: 'Auto-scaling triggered',
    detail: ({ region }) => `Capacity increased in ${region}: +2 nodes provisioned.`,
    weight: 8,
  },
];

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};
