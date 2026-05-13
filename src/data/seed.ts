import { REGION_KEYS } from '@/constants/regions';
import type { Region } from '@/types';

/* Stable, hashed-feeling server IDs per region. */
function genServerIds(prefix: string, region: Region, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(`${prefix}-${region}-${(i + 1).toString().padStart(2, '0')}`);
  }
  return out;
}

export const SERVER_INVENTORY: { id: string; region: Region }[] = REGION_KEYS.flatMap((r) =>
  genServerIds('srv', r, 6).map((id) => ({ id, region: r })),
);

export const HEATMAP_NODES_PER_REGION = 8;
