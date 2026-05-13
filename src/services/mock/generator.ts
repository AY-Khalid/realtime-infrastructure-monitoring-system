/**
 * Telemetry & activity generator.
 *
 * Produces *coherent* random walks (not pure noise) so that charts look like
 * a real production system: smooth baselines with occasional bursts/spikes.
 * State is encapsulated per-instance so the streaming service owns it.
 */

import { ACTIVITY_TEMPLATES } from '@/constants/activity';
import { REGIONS, REGION_KEYS } from '@/constants/regions';
import { HEATMAP_NODES_PER_REGION, SERVER_INVENTORY } from '@/data/seed';
import type {
  ActivityEvent,
  HeatmapCell,
  Region,
  RegionHealth,
  ServerRow,
  ServerStatus,
  TelemetryPayload,
  TelemetrySnapshot,
} from '@/types';
import { clamp, gaussian, randomFloat, randomInt, round, weightedPick } from '@/utils/math';
import { uid } from '@/utils/id';

interface GeneratorState {
  cpu: number;
  memory: number;
  requests: number;
  netIn: number;
  netOut: number;
  errorRate: number;
  activeServers: number;
  // anomaly amplitude — decays each tick
  anomaly: number;
  regions: Record<Region, { cpu: number; mem: number; latency: number; errors: number }>;
  servers: Record<string, { cpu: number; mem: number; traffic: number; status: ServerStatus }>;
  heatmap: Record<string, number>;
}

function makeRegionState() {
  const out = {} as GeneratorState['regions'];
  for (const r of REGIONS) {
    out[r.key] = {
      cpu: r.baseLoad,
      mem: r.baseLoad - 6,
      latency: 30 + Math.random() * 20,
      errors: 0.4 + Math.random() * 0.4,
    };
  }
  return out;
}

function makeServerState() {
  const out = {} as GeneratorState['servers'];
  for (const s of SERVER_INVENTORY) {
    out[s.id] = {
      cpu: 40 + Math.random() * 25,
      mem: 45 + Math.random() * 20,
      traffic: 80 + Math.random() * 80,
      status: 'healthy',
    };
  }
  return out;
}

function makeHeatmapState() {
  const out: Record<string, number> = Object.create(null);
  for (const r of REGIONS) {
    for (let i = 0; i < HEATMAP_NODES_PER_REGION; i += 1) {
      out[`${r.key}::node-${i}`] = clamp(r.baseLoad + gaussian(0, 8), 5, 95);
    }
  }
  return out;
}

export class TelemetryGenerator {
  private state: GeneratorState;

  constructor() {
    this.state = {
      cpu: 42,
      memory: 56,
      requests: 1840,
      netIn: 84,
      netOut: 72,
      errorRate: 0.6,
      activeServers: SERVER_INVENTORY.length,
      anomaly: 0,
      regions: makeRegionState(),
      servers: makeServerState(),
      heatmap: makeHeatmapState(),
    };
  }

  /** Drive the simulation forward one tick and produce a telemetry payload. */
  tick(now: number): TelemetryPayload {
    this.state.anomaly = Math.max(0, this.state.anomaly * 0.78 - 0.5);

    // ~3% chance of injecting a spike anomaly
    if (Math.random() < 0.03) {
      this.state.anomaly = randomFloat(18, 38);
    }

    const a = this.state.anomaly;
    this.state.cpu = clamp(this.state.cpu + gaussian(0, 2.2) + a * 0.35, 5, 98);
    this.state.memory = clamp(this.state.memory + gaussian(0, 1.1) + a * 0.18, 12, 96);
    this.state.requests = clamp(
      this.state.requests + gaussian(0, 80) + a * 22,
      80,
      14_000,
    );
    this.state.netIn = clamp(this.state.netIn + gaussian(0, 8) + a * 2, 4, 600);
    this.state.netOut = clamp(this.state.netOut + gaussian(0, 7) + a * 1.7, 3, 540);
    this.state.errorRate = clamp(
      this.state.errorRate + gaussian(0, 0.18) + (a > 10 ? randomFloat(0, 0.9) : 0),
      0.05,
      9,
    );

    // Occasionally a server drops off / recovers
    if (Math.random() < 0.02) {
      const inv = SERVER_INVENTORY;
      const s = inv[randomInt(0, inv.length - 1)];
      const st = this.state.servers[s.id];
      st.status = st.status === 'offline' ? 'healthy' : Math.random() < 0.6 ? 'degraded' : 'offline';
    }

    this.state.activeServers = SERVER_INVENTORY.reduce(
      (acc, s) => acc + (this.state.servers[s.id].status === 'offline' ? 0 : 1),
      0,
    );

    const snapshot: TelemetrySnapshot = {
      t: now,
      cpu: round(this.state.cpu, 2),
      memory: round(this.state.memory, 2),
      requests: Math.round(this.state.requests),
      networkIn: round(this.state.netIn, 2),
      networkOut: round(this.state.netOut, 2),
      errorRate: round(this.state.errorRate, 3),
      activeServers: this.state.activeServers,
    };

    // ---- per-region health ----
    for (const r of REGIONS) {
      const rs = this.state.regions[r.key];
      rs.cpu = clamp(rs.cpu + gaussian(0, 2) + a * 0.2, 8, 98);
      rs.mem = clamp(rs.mem + gaussian(0, 1.4) + a * 0.16, 12, 95);
      rs.latency = clamp(rs.latency + gaussian(0, 2.5), 15, 220);
      rs.errors = clamp(rs.errors + gaussian(0, 0.18), 0.05, 8);
    }
    const regions: RegionHealth[] = REGIONS.map((r) => {
      const rs = this.state.regions[r.key];
      return {
        region: r.key,
        cpu: round(rs.cpu, 1),
        memory: round(rs.mem, 1),
        // invert latency to "speed score"
        latency: round(clamp(100 - rs.latency / 2.2, 5, 100), 1),
        uptime: round(clamp(99.8 - rs.errors * 0.6, 80, 100), 2),
        throughput: round(clamp(60 + Math.cos(now / 9000 + r.baseLoad) * 18 + gaussian(0, 4), 10, 100), 1),
        errors: round(clamp(rs.errors * 10, 0, 100), 1),
      };
    });

    // ---- per-server rows ----
    const servers: ServerRow[] = SERVER_INVENTORY.map((s) => {
      const ss = this.state.servers[s.id];
      const offline = ss.status === 'offline';
      ss.cpu = offline ? 0 : clamp(ss.cpu + gaussian(0, 2.4) + a * 0.25, 4, 99);
      ss.mem = offline ? 0 : clamp(ss.mem + gaussian(0, 1.3) + a * 0.18, 8, 98);
      ss.traffic = offline ? 0 : clamp(ss.traffic + gaussian(0, 14) + a * 5, 0, 1200);
      // promote degraded/healthy by current load
      if (!offline) {
        if (ss.cpu > 92 || ss.mem > 93) ss.status = 'critical';
        else if (ss.cpu > 78 || ss.mem > 82) ss.status = 'degraded';
        else ss.status = 'healthy';
      }
      return {
        t: now,
        serverId: s.id,
        region: s.region,
        cpu: round(ss.cpu, 1),
        memory: round(ss.mem, 1),
        traffic: round(ss.traffic, 1),
        status: ss.status,
      };
    });

    // ---- heatmap ----
    const heatmap: HeatmapCell[] = [];
    for (const r of REGIONS) {
      for (let i = 0; i < HEATMAP_NODES_PER_REGION; i += 1) {
        const key = `${r.key}::node-${i}`;
        const next = clamp(
          (this.state.heatmap[key] ?? 50) + gaussian(0, 5) + a * 0.2,
          5,
          98,
        );
        this.state.heatmap[key] = next;
        heatmap.push({ region: r.key, node: `n${i + 1}`, load: round(next, 1) });
      }
    }

    return {
      type: 'telemetry',
      snapshot,
      servers,
      heatmap,
      regions,
    };
  }

  /** Produce a single activity event aligned with current state. */
  emitActivity(now: number): ActivityEvent {
    const tpl = weightedPick(
      ACTIVITY_TEMPLATES,
      ACTIVITY_TEMPLATES.map((t) => t.weight * (this.state.anomaly > 12 && t.severity !== 'info' ? 2.5 : 1)),
    );
    const region = REGION_KEYS[randomInt(0, REGION_KEYS.length - 1)];
    const serverPool = SERVER_INVENTORY.filter((s) => s.region === region);
    const server = serverPool[randomInt(0, serverPool.length - 1)] ?? SERVER_INVENTORY[0];
    return {
      id: uid('evt'),
      t: now,
      kind: tpl.kind,
      severity: tpl.severity,
      title: tpl.title,
      detail: tpl.detail({ serverId: server.id, region }),
      region,
      serverId: server.id,
    };
  }
}
